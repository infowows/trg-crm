"use client";

import {
    X,
    Phone,
    Mail,
    MapPin,
    Building,
    Star,
    Calendar,
    User,
} from "lucide-react";

interface Customer {
    _id: string;
    fullName: string;
    companyName?: string;
    address?: string;
    lat?: number;
    lng?: number;
    phone?: string;
    email?: string;
    source?: string;
    potentialLevel?: string;
    salesPerson?: string;
    status?: string;
    createdAt: string;
    updatedAt: string;
}

interface CustomerDetailModalProps {
    customer: Customer;
    onClose: () => void;
}

const CustomerDetailModal = ({
    customer,
    onClose,
}: CustomerDetailModalProps) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case "customer":
                return "bg-green-100 text-green-800";
            case "prospect":
                return "bg-amber-100 text-amber-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusLabel = (status?: string) => {
        switch (status) {
            case "customer":
                return "Khách hàng";
            case "prospect":
                return "Tiềm năng";
            default:
                return "Chưa xác định";
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Chi tiết khách hàng
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Customer Info */}
                    <div className="mb-6">
                        <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {customer.fullName}
                                </h3>
                                {customer.companyName && (
                                    <p className="text-gray-600">
                                        {customer.companyName}
                                    </p>
                                )}
                                <div className="flex items-center space-x-2 mt-2">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(customer.status)}`}
                                    >
                                        {getStatusLabel(customer.status)}
                                    </span>
                                    {customer.potentialLevel && (
                                        <span className="text-sm text-gray-600">
                                            {customer.potentialLevel}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4 mb-6">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">
                            Thông tin liên hệ
                        </h4>

                        {customer.phone && (
                            <div className="flex items-center space-x-3">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                    {customer.phone}
                                </span>
                            </div>
                        )}

                        {customer.email && (
                            <div className="flex items-center space-x-3">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                    {customer.email}
                                </span>
                            </div>
                        )}

                        {customer.address && (
                            <div className="flex items-start space-x-3">
                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                <span className="text-sm text-gray-600">
                                    {customer.address}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Business Information */}
                    <div className="space-y-4 mb-6">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">
                            Thông tin kinh doanh
                        </h4>

                        {customer.source && (
                            <div className="flex items-center space-x-3">
                                <Building className="w-4 h-4 text-gray-400" />
                                <div>
                                    <span className="text-xs text-gray-500">
                                        Nguồn
                                    </span>
                                    <p className="text-sm text-gray-600">
                                        {customer.source}
                                    </p>
                                </div>
                            </div>
                        )}

                        {customer.salesPerson && (
                            <div className="flex items-center space-x-3">
                                <User className="w-4 h-4 text-gray-400" />
                                <div>
                                    <span className="text-xs text-gray-500">
                                        Sales phụ trách
                                    </span>
                                    <p className="text-sm text-gray-600">
                                        {customer.salesPerson}
                                    </p>
                                </div>
                            </div>
                        )}

                        {customer.potentialLevel && (
                            <div className="flex items-center space-x-3">
                                <Star className="w-4 h-4 text-gray-400" />
                                <div>
                                    <span className="text-xs text-gray-500">
                                        Đánh giá tiềm năng
                                    </span>
                                    <p className="text-sm text-gray-600">
                                        {customer.potentialLevel}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Location */}
                    {customer.lat && customer.lng && (
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                Vị trí
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4" />
                                    <span>
                                        Vĩ độ: {customer.lat.toFixed(6)}, Kinh
                                        độ: {customer.lng.toFixed(6)}
                                    </span>
                                </div>
                                <a
                                    href={`https://www.google.com/maps?q=${customer.lat},${customer.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                                >
                                    Xem trên Google Maps →
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Timestamps */}
                    <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>
                                Ngày tạo: {formatDate(customer.createdAt)}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                                Cập nhật: {formatDate(customer.updatedAt)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Đóng
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Chỉnh sửa
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetailModal;
