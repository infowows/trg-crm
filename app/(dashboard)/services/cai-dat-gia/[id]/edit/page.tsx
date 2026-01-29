"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import {
    ArrowLeft,
    Save,
    DollarSign,
    Calendar,
    Tag,
    Package,
    Building,
} from "lucide-react";

interface ServicePricingFormData {
    serviceName: string;
    packageName: string;
    unitPrice: number;
    effectiveFrom: string;
    effectiveTo: string;
    isActive: boolean;
    serviceGroup?: string; // Thêm để hiển thị
}

const EditServicePricing = () => {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<ServicePricingFormData>({
        serviceName: "",
        packageName: "",
        unitPrice: 0,
        effectiveFrom: new Date().toISOString().split("T")[0],
        effectiveTo: "",
        isActive: true,
        serviceGroup: "",
    });
    const [services, setServices] = useState<any[]>([]);

    // Fetch services
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
        }
    };

    // Load existing data
    useEffect(() => {
        fetchServices();
    }, []);

    // Update serviceGroup when serviceName changes
    useEffect(() => {
        if (formData.serviceName && services.length > 0) {
            const service = services.find(
                (s) => s.serviceName === formData.serviceName,
            );
            setFormData((prev) => ({
                ...prev,
                serviceGroup: service?.serviceGroup || "-",
            }));
        }
    }, [formData.serviceName, services]);

    useEffect(() => {
        const loadPricing = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    router.push("/login");
                    return;
                }

                const response = await fetch(
                    `/api/service-pricing/${params.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                if (!response.ok) {
                    throw new Error("Không thể tải thông tin cài đặt giá");
                }

                const data = await response.json();
                if (data.success) {
                    const pricing = data.data;

                    // Kiểm tra nếu đã sử dụng thì không cho chỉnh sửa
                    if (pricing.isUsed) {
                        router.push(`/services/cai-dat-gia/${pricing._id}`);
                        // Sử dụng alert thay vì toast vì có thể chưa import
                        alert(
                            "Giá này đã được sử dụng trong báo giá, không thể chỉnh sửa!",
                        );
                        return;
                    }

                    // Fetch service để lấy serviceGroup
                    const serviceResponse = await fetch(
                        `/api/services?serviceName=${encodeURIComponent(pricing.serviceName)}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        },
                    );

                    let serviceGroup = "-";
                    if (serviceResponse.ok) {
                        const serviceData = await serviceResponse.json();
                        const service = serviceData.data?.[0];
                        serviceGroup = service?.serviceGroup || "-";
                    }

                    setFormData({
                        serviceName: pricing.serviceName,
                        packageName: pricing.packageName || "",
                        unitPrice: pricing.unitPrice,
                        effectiveFrom: new Date(pricing.effectiveFrom)
                            .toISOString()
                            .split("T")[0],
                        effectiveTo: pricing.effectiveTo
                            ? new Date(pricing.effectiveTo)
                                  .toISOString()
                                  .split("T")[0]
                            : "",
                        isActive: pricing.isActive,
                        serviceGroup: serviceGroup,
                    });
                }
            } catch (err: any) {
                console.error("Error loading pricing:", err);
                setError(err.message);
            } finally {
                setInitialLoading(false);
            }
        };

        if (params.id) {
            loadPricing();
        }
    }, [params.id, router]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? (e.target as HTMLInputElement).checked
                    : type === "number"
                      ? parseFloat(value) || 0
                      : value,
        }));
    };

    const validateForm = async () => {
        if (!formData.serviceName.trim()) {
            setError("Vui lòng chọn tên dịch vụ");
            return false;
        }
        if (!formData.unitPrice || formData.unitPrice <= 0) {
            setError("Vui lòng nhập đơn giá lớn hơn 0");
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
                `/api/service-pricing/check-duplicate?serviceName=${encodeURIComponent(formData.serviceName)}&packageName=${encodeURIComponent(formData.packageName)}&excludeId=${params.id}`,
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
                ...formData,
                effectiveFrom: new Date(formData.effectiveFrom),
                ...(formData.effectiveTo && {
                    effectiveTo: new Date(formData.effectiveTo),
                }),
            };

            const response = await fetch(`/api/service-pricing/${params.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Cập nhật cài đặt giá thất bại",
                );
            }

            toast.success("Cập nhật cài đặt giá thành công");
            router.push("/services/cai-dat-gia");
        } catch (err: any) {
            console.error("Error updating pricing:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Đang tải...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white">
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Quay lại
                </button>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Chỉnh sửa Cài đặt Giá
                </h1>
                <p className="text-gray-600">
                    Cập nhật thông tin cài đặt giá cho dịch vụ
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="text-red-600">{error}</div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nhóm Dịch vụ
                        </label>
                        <div className="relative">
                            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                readOnly
                                type="text"
                                name="serviceGroup"
                                value={formData.serviceGroup || ""}
                                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                                placeholder="Đang tải..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên Dịch vụ <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                name="serviceName"
                                value={formData.serviceName}
                                onChange={handleInputChange}
                                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên Gói
                        </label>
                        <div className="relative">
                            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                name="packageName"
                                value={formData.packageName}
                                onChange={handleInputChange}
                                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Nhập tên gói (nếu có)"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Đơn giá <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="number"
                                name="unitPrice"
                                value={formData.unitPrice}
                                onChange={handleInputChange}
                                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hiệu lực từ <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hiệu lực đến <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="date"
                                name="effectiveTo"
                                value={formData.effectiveTo}
                                onChange={handleInputChange}
                                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                min={formData.effectiveFrom}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="isActive"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                        htmlFor="isActive"
                        className="ml-2 text-sm text-gray-700"
                    >
                        Đang hoạt động
                    </label>
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditServicePricing;
