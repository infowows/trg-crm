"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Save,
    X,
    DollarSign,
    Calendar,
    Tag,
    CheckCircle,
    AlertCircle,
} from "lucide-react";

interface ServicePricingFormData {
    serviceName: string;
    packageName: string;
    unitPrice: string;
    effectiveFrom: string;
    effectiveTo: string;
    isActive: boolean;
}

const CreateServicePricing = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [services, setServices] = useState<any[]>([]);
    const [loadingServices, setLoadingServices] = useState(true);
    const [formData, setFormData] = useState<ServicePricingFormData>({
        serviceName: "",
        packageName: "",
        unitPrice: "",
        effectiveFrom: new Date().toISOString().split("T")[0],
        effectiveTo: "",
        isActive: true,
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        fetchServices();
    }, [router]);

    const fetchServices = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetch("/api/services", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setServices(data.data || []);
            }
        } catch (error) {
            console.error("Error fetching services:", error);
        } finally {
            setLoadingServices(false);
        }
    };

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

    const validateForm = async () => {
        if (!formData.serviceName.trim()) {
            setError("Vui lòng chọn dịch vụ");
            return false;
        }

        if (!formData.unitPrice.trim()) {
            setError("Vui lòng nhập đơn giá");
            return false;
        }

        if (
            isNaN(Number(formData.unitPrice)) ||
            Number(formData.unitPrice) < 0
        ) {
            setError("Đơn giá phải là số và không âm");
            return false;
        }

        if (!formData.effectiveFrom) {
            setError("Vui lòng chọn ngày hiệu lực");
            return false;
        }

        if (!formData.effectiveTo) {
            setError("Vui lòng chọn ngày hết hiệu lực");
            return false;
        }

        // Kiểm tra trùng gói dịch vụ
        try {
            const token = localStorage.getItem("token");
            if (!token) return false;

            const checkResponse = await fetch(
                `/api/service-pricing/check-duplicate?serviceName=${encodeURIComponent(formData.serviceName)}&packageName=${encodeURIComponent(formData.packageName)}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (checkResponse.ok) {
                const checkData = await checkResponse.json();
                if (checkData.exists) {
                    const existingPricing = checkData.existingPricing;
                    const newEffectiveFrom = new Date(formData.effectiveFrom);
                    const existingEffectiveTo = existingPricing.effectiveTo
                        ? new Date(existingPricing.effectiveTo)
                        : null;

                    if (
                        existingEffectiveTo &&
                        newEffectiveFrom <= existingEffectiveTo
                    ) {
                        setError(
                            `Gói dịch vụ "${formData.packageName}" đã tồn tại với thời gian hiệu lực đến ${existingEffectiveTo.toLocaleDateString("vi-VN")}. ` +
                                `Vui lòng chọn ngày hiệu lực lớn hơn ${existingEffectiveTo.toLocaleDateString("vi-VN")}.`,
                        );
                        return false;
                    }
                }
            }
        } catch (error) {
            console.error("Error checking duplicate package:", error);
        }

        if (
            formData.effectiveTo &&
            new Date(formData.effectiveTo) < new Date(formData.effectiveFrom)
        ) {
            setError("Ngày kết thúc hiệu lực phải sau ngày bắt đầu");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!(await validateForm())) {
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
                packageName: formData.packageName.trim(),
                unitPrice: Number(formData.unitPrice),
                effectiveFrom: new Date(formData.effectiveFrom),
                effectiveTo: formData.effectiveTo
                    ? new Date(formData.effectiveTo)
                    : null,
                isActive: formData.isActive,
            };

            const response = await fetch("/api/service-pricing", {
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
                    errorData.message || "Không thể tạo cài đặt giá mới",
                );
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/services/price-settings");
            }, 2000);
        } catch (err: any) {
            console.error("Error creating service pricing:", err);
            setError(err.message || "Có lỗi xảy ra khi tạo cài đặt giá");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.push("/services/price-settings");
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Tạo cài đặt giá thành công!
                    </h2>
                    <p className="text-gray-600">
                        Cài đặt giá đã được tạo và sẽ chuyển đến trang danh sách
                        sau vài giây...
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
                                    Tạo cài đặt giá mới
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Thiết lập giá cho dịch vụ hoặc gói dịch vụ
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
                        {/* Service */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tên dịch vụ{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="relative ">
                                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    name="serviceName"
                                    value={formData.serviceName}
                                    onChange={handleInputChange}
                                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    disabled={loadingServices}
                                >
                                    <option value="">Chọn dịch vụ</option>
                                    {services.map((service: any) => (
                                        <option
                                            key={service._id}
                                            value={service.serviceName}
                                        >
                                            {service.serviceName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Service Package */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Gói dịch vụ
                            </label>
                            <div className="relative ">
                                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="packageName"
                                    value={formData.packageName}
                                    onChange={handleInputChange}
                                    placeholder="Nhập tên gói dịch vụ (ví dụ: Gói Cao Cấp)"
                                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Unit Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Đơn giá (VNĐ){" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="relative outline-none">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="unitPrice"
                                    value={formData.unitPrice}
                                    onChange={handleInputChange}
                                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nhập đơn giá"
                                    required
                                />
                            </div>
                        </div>

                        {/* Effective Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Effective From */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hiệu lực từ{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative outline-none">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="date"
                                        name="effectiveFrom"
                                        value={formData.effectiveFrom}
                                        onChange={handleInputChange}
                                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Effective To */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hiệu lực đến{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative outline-none">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="date"
                                        name="effectiveTo"
                                        value={formData.effectiveTo}
                                        onChange={handleInputChange}
                                        min={formData.effectiveFrom}
                                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                    Để trống nếu không xác định ngày kết thúc
                                </p>
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
                                Kích hoạt cài đặt giá
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
                                {loading ? "Đang lưu..." : "Lưu cài đặt giá"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateServicePricing;

