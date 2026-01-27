"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Activity, Save, X, ArrowLeft } from "lucide-react";

interface SourceSetting {
    _id: string;
    name: string;
    code: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

const EditSourceSetting = () => {
    const router = useRouter();
    const params = useParams();
    const [id, setId] = useState<string>("");

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        active: true,
    });
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initializeId = async () => {
            const resolvedParams = await params;
            const resolvedId = Array.isArray(resolvedParams.id)
                ? resolvedParams.id[0]
                : resolvedParams.id;
            setId(resolvedId || "");
        };

        initializeId();
    }, [params]);

    useEffect(() => {
        if (id) {
            fetchSourceSetting();
        }
    }, [id]);

    const fetchSourceSetting = async () => {
        try {
            const response = await fetch(`/api/source-settings/${id}`);
            const data = await response.json();

            if (data.success) {
                setFormData({
                    name: data.data.name,
                    code: data.data.code,
                    active: data.data.active,
                });
            } else {
                setError(
                    data.message || "Không thể tải thông tin nguồn khách hàng",
                );
            }
        } catch (err) {
            setError("Có lỗi xảy ra khi tải dữ liệu");
        } finally {
            setInitialLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/source-settings/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                router.push(`/source-settings/${id}`);
            } else {
                setError(data.message || "Không thể cập nhật nguồn khách hàng");
            }
        } catch (err) {
            setError("Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error && !formData.name) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Activity className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={() => router.back()}
                                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center">
                                <Activity className="w-8 h-8 text-blue-600 mr-3" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        Chỉnh sửa nguồn khách hàng
                                    </h1>
                                    <p className="text-gray-600">
                                        Cập nhật thông tin kênh tiếp cận khách
                                        hàng
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tên nguồn khách hàng{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="Ví dụ: Google Ads, Facebook, Website..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mã code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none uppercase"
                                placeholder="Ví dụ: GOOGLE, FACEBOOK, WEB"
                                maxLength={10}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Mã code sẽ được tự động chuyển thành chữ hoa và
                                không trùng lặp
                            </p>
                        </div>

                        <div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="active"
                                    id="active"
                                    checked={formData.active}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                    Kích hoạt nguồn khách hàng
                                </span>
                            </label>
                            <p className="text-xs text-gray-500 mt-1 ml-6">
                                Nguồn khách hàng đã kích hoạt sẽ có thể được sử
                                dụng khi tạo khách hàng mới
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() =>
                                    router.push(`/source-settings/${id}`)
                                }
                                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            >
                                <X className="w-5 h-5 mr-2" />
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-5 h-5 mr-2" />
                                {loading ? "Đang lưu..." : "Lưu thay đổi"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditSourceSetting;
