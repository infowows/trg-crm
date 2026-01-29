import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning';
}

const Popup: React.FC<PopupProps> = ({ isOpen, onClose, title, message, type }) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-6 h-6 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-6 h-6 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
            default:
                return <AlertCircle className="w-6 h-6 text-blue-500" />;
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case 'success':
                return 'border-green-200';
            case 'error':
                return 'border-red-200';
            case 'warning':
                return 'border-yellow-200';
            default:
                return 'border-blue-200';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 border-2 ${getBorderColor()}`}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                        {getIcon()}
                        <h3 className="ml-3 text-lg font-semibold text-gray-900">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            type === 'success'
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : type === 'error'
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-yellow-600 text-white hover:bg-yellow-700'
                        }`}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Popup;
