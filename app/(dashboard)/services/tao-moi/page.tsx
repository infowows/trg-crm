"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Save,
    X,
    Package,
    DollarSign,
    Tag,
    FileText,
    CheckCircle,
    AlertCircle,
} from "lucide-react";

interface ServiceFormData {
    serviceName: string;
    code: string;
    description: string;
    isActive: boolean;
}

const CreateService = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState<ServiceFormData>({
        serviceName: "",
        code: "",
        description: "",
        isActive: true,
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }
    }, [router]);

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({
                ...prev,
                [name]: checked,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const validateForm = () => {
        if (!formData.serviceName.trim()) {
            setError("Vui lòng nhập tên dịch vụ");
            return false;
        }

        if (!formData.code.trim()) {
            setError("Vui lòng nhập mã dịch vụ");
            return false;
        }

        if (formData.code.length < 2) {
            setError("Mã dịch vụ phải có ít nhất 2 ký tự");
            return false;
        }

        // Kiểm tra mã chỉ chứa chữ cái, số và dấu gạch ngang
        if (!/^[A-Z0-9-_]+$/.test(formData.code.toUpperCase())) {
            setError(
                "Mã dịch vụ chỉ được chứa chữ hoa, số, dấu gạch ngang và gạch dưới",
            );
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

            const payload = {
                serviceName: formData.serviceName.trim(),
                code: formData.code.toUpperCase().trim(),
                description: formData.description.trim(),
                isActive: formData.isActive,
            };

            const response = await fetch("/api/services", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể tạo dịch vụ mới",
                );
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/services");
            }, 2000);
        } catch (err: any) {
            console.error("Error creating service:", err);
            setError(err.message || "Có lỗi xảy ra khi tạo dịch vụ");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.push("/services");
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Tạo dịch vụ thành công!
                    </h2>
                    <p className="text-gray-600">
                        Dịch vụ đã được tạo và sẽ chuyển đến trang danh sách sau
                        vài giây...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={handleCancel}
                                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Tạo dịch vụ mới
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Nhập thông tin chi tiết cho dịch vụ mới
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}

                {/* Form */}
                <div className="bg-white shadow rounded-lg">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Service Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tên dịch vụ{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="relative outline-none">
                                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="serviceName"
                                    value={formData.serviceName}
                                    onChange={handleInputChange}
                                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nhập tên dịch vụ"
                                    required
                                />
                            </div>
                        </div>

                        {/* Service Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mã dịch vụ{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="relative outline-none">
                                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                                    placeholder="VD: WEB_DESIGN, CONSULTING"
                                    required
                                />
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                                Mã dịch vụ sẽ được tự động chuyển thành chữ hoa
                            </p>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mô tả
                            </label>
                            <div className="relative outline-none">
                                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nhập mô tả chi tiết về dịch vụ"
                                />
                            </div>
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="isActive"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                                htmlFor="isActive"
                                className="ml-2 block text-sm text-gray-700"
                            >
                                Kích hoạt dịch vụ
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {loading ? "Đang lưu..." : "Lưu dịch vụ"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateService;
