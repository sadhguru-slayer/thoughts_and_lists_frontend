import { toast } from "sonner";

/**
 * Centralised notification helpers.
 * Use `notify.promise()` for async operations — auto-transitions loading → success/error.
 */
export const notify = {
    success: (msg, description) =>
        toast.success(msg, { description }),

    error: (msg, description) =>
        toast.error(msg, { description }),

    info: (msg, description) =>
        toast(msg, { description }),

    loading: (msg) =>
        toast.loading(msg),

    dismiss: (id) =>
        toast.dismiss(id),

    /**
     * @param {Promise} promise
     * @param {{ loading: string, success: string, error: string }} msgs
     */
    promise: (promise, msgs) =>
        toast.promise(promise, msgs),
};
