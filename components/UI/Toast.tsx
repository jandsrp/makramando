
import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    duration?: number;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, duration = 4000, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for exit animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-primary',
    };

    const icons = {
        success: 'check_circle',
        error: 'error',
        info: 'info',
    };

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4`}>
            <div
                className={`
          max-w-md w-full pointer-events-auto
          ${bgColors[type]} text-white
          px-6 py-4 rounded-2xl shadow-2xl
          flex items-center gap-4
          transition-all duration-300 transform
          ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}
        `}
            >
                <span className="material-symbols-outlined text-3xl">
                    {icons[type]}
                </span>
                <div className="flex-1">
                    <p className="font-bold text-sm leading-tight">{message}</p>
                </div>
                <button
                    onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>
            </div>
        </div>
    );
};
