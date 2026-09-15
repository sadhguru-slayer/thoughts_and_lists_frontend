"use client";

import ActionModal from "./ActionModal";

export default function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "danger",
    isLoading = false,
    icon,
    children,
}) {
    return (
        <ActionModal
            isOpen={open}
            onClose={onClose}
            onConfirm={onConfirm}
            title={title}
            description={description}
            confirmText={confirmLabel}
            cancelText={cancelLabel}
            variant={variant}
            isLoading={isLoading}
            icon={icon}
        >
            {children}
        </ActionModal>
    );
}
