"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";
import ActionModal from "@/components/ui/ActionModal";

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: "",
        description: "",
        confirmText: "",
        cancelText: "Cancel",
        variant: "info",
        showCancel: true,
        isLoading: false,
        icon: null,
    });

    const resolverRef = useRef(null);

    const openModal = useCallback((options = {}) => {
        return new Promise((resolve) => {
            resolverRef.current = resolve;
            setModalState({
                isOpen: true,
                title: options.title || "Confirm Action",
                description: options.description || "",
                confirmText: options.confirmText,
                cancelText: options.cancelText || "Cancel",
                variant: options.variant || "info",
                showCancel: options.showCancel !== false,
                isLoading: false,
                icon: options.icon || null,
            });
        });
    }, []);

    const handleClose = useCallback(() => {
        setModalState((prev) => ({ ...prev, isOpen: false }));
        if (resolverRef.current) {
            resolverRef.current(false);
            resolverRef.current = null;
        }
    }, []);

    const handleConfirm = useCallback(() => {
        setModalState((prev) => ({ ...prev, isOpen: false }));
        if (resolverRef.current) {
            resolverRef.current(true);
            resolverRef.current = null;
        }
    }, []);

    // Specific helper shortcuts
    const showConfirm = useCallback((options = {}) => {
        return openModal({
            variant: "danger",
            title: "Are you sure?",
            confirmText: "Delete",
            cancelText: "Cancel",
            showCancel: true,
            ...options,
        });
    }, [openModal]);

    const showWarning = useCallback((options = {}) => {
        return openModal({
            variant: "warning",
            title: "Warning",
            confirmText: "Proceed",
            cancelText: "Cancel",
            showCancel: true,
            ...options,
        });
    }, [openModal]);

    const showSuccess = useCallback((options = {}) => {
        return openModal({
            variant: "success",
            title: "Success",
            confirmText: "Got it",
            showCancel: false,
            ...options,
        });
    }, [openModal]);

    const showError = useCallback((options = {}) => {
        return openModal({
            variant: "error",
            title: "Error",
            confirmText: "Okay",
            showCancel: false,
            ...options,
        });
    }, [openModal]);

    const showPermission = useCallback((options = {}) => {
        return openModal({
            variant: "permission",
            title: "Permission Required",
            confirmText: "Allow",
            cancelText: "Deny",
            showCancel: true,
            ...options,
        });
    }, [openModal]);

    const showInfo = useCallback((options = {}) => {
        return openModal({
            variant: "info",
            title: "Information",
            confirmText: "Okay",
            showCancel: false,
            ...options,
        });
    }, [openModal]);

    return (
        <ModalContext.Provider
            value={{
                openModal,
                showConfirm,
                showWarning,
                showSuccess,
                showError,
                showPermission,
                showInfo,
            }}
        >
            {children}

            <ActionModal
                isOpen={modalState.isOpen}
                onClose={handleClose}
                onConfirm={handleConfirm}
                title={modalState.title}
                description={modalState.description}
                confirmText={modalState.confirmText}
                cancelText={modalState.cancelText}
                variant={modalState.variant}
                showCancel={modalState.showCancel}
                isLoading={modalState.isLoading}
                icon={modalState.icon}
            />
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
}
