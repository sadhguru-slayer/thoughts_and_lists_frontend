"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "./api";
import { useAuth } from "./AuthContext";

const JournalContext = createContext(null);

export function JournalProvider({ children }) {
    const [journals, setJournals] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [detailById, setDetailById] = useState({});
    const [analytics, setAnalytics] = useState(null);
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [latestStructure, setLatestStructure] = useState({ sections: [] });

    const fetchLatestStructure = async () => {
        try {
            const res = await api.get("/api/v1/journal/structure/latest");
            if (res.data) {
                const mappedSections = (res.data.sections || []).map(s => ({
                    ...s,
                    template_id: s.template_uuid || s.template_id
                }));
                setLatestStructure({ sections: mappedSections });
            }
        } catch (err) {
            console.error("Failed to fetch latest structure:", err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchJournals();
            fetchTemplates();
            fetchAnalytics();
            fetchLatestStructure();
        } else {
            setJournals([]);
            setTemplates([]);
            setDetailById({});
            setAnalytics(null);
            setLatestStructure({ sections: [] });
        }
    }, [user]);

    const [page, setPage] = useState(1);
    const [perPage] = useState(10);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");       // "asc" | "desc"
    const [dateFilter, setDateFilter] = useState("all");      // "all" | "this_month" | "this_year"

    const fetchJournals = useCallback(async (
        targetPage = page,
        search = searchQuery,
        sort = sortOrder,
        filter = dateFilter,
    ) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ page: targetPage, per_page: perPage });
            if (search && search.trim()) params.set("search", search.trim());
            if (sort) params.set("sort_order", sort);
            if (filter && filter !== "all") params.set("date_filter", filter);
            const res = await api.get(`/api/v1/journals?${params.toString()}`);
            if (res.data && res.data.items) {
                const mapped = res.data.items.map(j => ({ ...j, id: j.uuid || j.id }));
                setJournals(mapped);
                setPagination({
                    total: res.data.total ?? mapped.length,
                    totalPages: res.data.total_pages ?? 1
                });
            } else {
                const items = Array.isArray(res.data) ? res.data : [];
                setJournals(items.map(j => ({ ...j, id: j.uuid || j.id })));
                setPagination({ total: items.length, totalPages: 1 });
            }
        } catch (err) {
            console.error("Failed to fetch journals:", err);
        } finally {
            setLoading(false);
        }
    }, [page, perPage, searchQuery, sortOrder, dateFilter]);

    const changePage = (newPage) => {
        setPage(newPage);
        fetchJournals(newPage, searchQuery, sortOrder, dateFilter);
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        setPage(1);
        fetchJournals(1, query, sortOrder, dateFilter);
    };

    const handleSortChange = (sort) => {
        setSortOrder(sort);
        setPage(1);
        fetchJournals(1, searchQuery, sort, dateFilter);
    };

    const handleDateFilterChange = (filter) => {
        setDateFilter(filter);
        setPage(1);
        fetchJournals(1, searchQuery, sortOrder, filter);
    };

    const fetchAnalytics = async () => {
        try {
            setAnalyticsLoading(true);
            const res = await api.get("/api/v1/journal/analytics");
            setAnalytics(res.data);
        } catch (err) {
            console.error("Failed to fetch analytics:", err);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const fetchTemplates = async () => {
        try {
            const res = await api.get("/api/v1/templates");
            const mapped = res.data.map(t => {
                const tmpl = { ...t, id: t.uuid || t.id };
                if (tmpl.fields) {
                    tmpl.fields = tmpl.fields.map(f => ({ ...f, id: f.uuid || f.id }));
                }
                return tmpl;
            });
            setTemplates(mapped);
        } catch (err) {
            console.error("Failed to fetch templates:", err);
        }
    };

    const loadJournalDetail = useCallback(async (id, forceRefresh = false) => {
        try {
            if (!forceRefresh && detailById[id]) return detailById[id];
            const res = await api.get(`/api/v1/journal/${id}`);
            const detail = res.data;
            if (detail.uuid) detail.id = detail.uuid;
            if (detail.sections) {
                detail.sections = detail.sections.map(s => {
                    const sec = { ...s, id: s.uuid || s.id, template_id: s.template_uuid || s.template_id };
                    if (sec.field_values) {
                        sec.field_values = sec.field_values.map(fv => ({ ...fv, id: fv.uuid || fv.id }));
                    }
                    return sec;
                });
            }
            console.log(detail)
            setDetailById((prev) => ({ ...prev, [id]: detail }));
            return detail;
        } catch (err) {
            console.error("Failed to fetch journal detail:", err);
            return null;
        }
    }, [detailById]);

    const handleCreateSubmit = useCallback(async ({ date, content, sections }) => {
        try {
            const payload = {
                date,
                content: content || null,
                sections: sections.map(s => ({
                    name: s.name,
                    template_uuid: s.templateId,
                    reusable: s.reusable,
                    field_values: s.fieldValues.map(fv => ({
                        label: fv.label,
                        field_type: fv.field_type,
                        value: fv.value,
                        field_uuid: fv.field_id
                    }))
                }))
            };

            const res = await api.post("/api/v1/journal", payload);
            const newJournal = res.data;
            if (newJournal.uuid) newJournal.id = newJournal.uuid;
            await fetchJournals();
            fetchTemplates();
            fetchAnalytics();
            fetchLatestStructure();
            return newJournal;
        } catch (err) {
            console.error("Failed to create journal:", err);
            throw err; // Let caller Handle errors
        }
    }, [fetchJournals]);

    const handleDelete = useCallback(async (id) => {
        try {
            await api.delete(`/api/v1/journal/${id}`);
            setDetailById((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
            await fetchJournals();
            fetchAnalytics();
        } catch (err) {
            console.error("Failed to delete journal:", err);
        }
    }, [fetchJournals]);

    const handleDeleteTemplate = useCallback(async (templateId) => {
        try {
            await api.delete(`/api/v1/templates/${templateId}`);
            setTemplates((prev) => prev.filter(t => String(t.id) !== String(templateId)));
        } catch (err) {
            console.error("Failed to delete template:", err);
            throw err;
        }
    }, []);

    const handleUpdateJournal = useCallback(async (id, payload) => {
        try {
            await api.patch(`/api/v1/journal/${id}`, payload);
            await Promise.all([
                fetchJournals(),
                fetchAnalytics(),
                loadJournalDetail(id, true),
            ]);
        } catch (err) {
            console.error("Failed to update journal:", err);
            throw err;
        }
    }, [loadJournalDetail]);

    const value = useMemo(
        () => ({
            journals,
            detailById,
            templates,
            analytics,
            analyticsLoading,
            latestJournalStructure: latestStructure,
            loading,
            page,
            perPage,
            pagination,
            searchQuery,
            sortOrder,
            dateFilter,
            handleSearch,
            handleSortChange,
            handleDateFilterChange,
            changePage,
            loadJournalDetail,
            handleCreateSubmit,
            handleDelete,
            handleDeleteTemplate,
            handleUpdateJournal,
            refreshJournals: fetchJournals,
            fetchAnalytics
        }),
        [
            journals,
            detailById,
            templates,
            analytics,
            analyticsLoading,
            latestStructure,
            loading,
            page,
            perPage,
            pagination,
            searchQuery,
            sortOrder,
            dateFilter,
            loadJournalDetail,
            handleCreateSubmit,
            handleDelete,
            handleDeleteTemplate,
            handleUpdateJournal,
            fetchJournals,
            fetchAnalytics
        ]
    );

    return (
        <JournalContext.Provider value={value}>
            {children}
        </JournalContext.Provider>
    );
}

export function useJournal() {
    const context = useContext(JournalContext);
    if (!context) {
        throw new Error("useJournal must be used within a JournalProvider");
    }
    return context;
}
