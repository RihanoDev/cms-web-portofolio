import React from 'react';

interface ConfirmActionModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    actionType?: 'primary' | 'danger' | 'success';
}

export default function ConfirmActionModal({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    onConfirm,
    onCancel,
    isLoading = false,
    actionType = 'primary'
}: ConfirmActionModalProps) {
    if (!isOpen) return null;

    const colors = {
        primary: {
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            iconBg: 'bg-blue-500/20',
            iconText: 'text-blue-400',
            btnBg: 'bg-blue-600 hover:bg-blue-500',
            shadow: 'shadow-blue-900/20'
        },
        danger: {
            bg: 'bg-red-500/10',
            border: 'border-red-500/20',
            iconBg: 'bg-red-500/20',
            iconText: 'text-red-400',
            btnBg: 'bg-red-600 hover:bg-red-500',
            shadow: 'shadow-red-900/20'
        },
        success: {
            bg: 'bg-green-500/10',
            border: 'border-green-500/20',
            iconBg: 'bg-green-500/20',
            iconText: 'text-green-400',
            btnBg: 'bg-green-600 hover:bg-green-500',
            shadow: 'shadow-green-900/20'
        }
    };

    const style = colors[actionType];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={!isLoading ? onCancel : undefined}
            ></div>

            {/* Modal panel */}
            <div className="relative bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-sm overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className={`${style.bg} border-b ${style.border} px-6 py-4 flex items-center gap-3`}>
                    <div className={`w-10 h-10 rounded-full ${style.iconBg} flex items-center justify-center flex-shrink-0`}>
                        {actionType === 'danger' ? (
                            <svg className={`w-5 h-5 ${style.iconText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        ) : actionType === 'success' ? (
                            <svg className={`w-5 h-5 ${style.iconText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className={`w-5 h-5 ${style.iconText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                </div>

                {/* Content */}
                <div className="px-6 py-5">
                    <p className="text-slate-300 text-sm">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="bg-slate-750 border-t border-slate-700 px-6 py-4 flex gap-3 justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 text-sm font-medium text-white ${style.btnBg} active:scale-95 rounded-lg transition-all flex items-center gap-2 shadow-lg ${style.shadow} disabled:opacity-70 disabled:cursor-not-allowed`}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {confirmText}...
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
