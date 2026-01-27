"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    Activity,
    Edit,
    Trash2,
    ArrowLeft,
    ToggleLeft,
    ToggleRight,
} from "lucide-react";

interface SourceSetting {
    _id: string;
    name: string;
    code: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

const SourceSettingDetail = () => {
    const router = useRouter();
    const params = useParams();
    const [id, setId] = useState<string>("");

    const [sourceSetting, setSourceSetting] = useState<SourceSetting | null>(
        null,
    );
    const [loading, setLoading] = useState(true);
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
            setLoading(true);
            const response = await fetch(`/api/source-settings/${id}`);
            const data = await response.json();

            if (data.success) {
                setSourceSetting(data.data);
            } else {
                setError(
                    data.message || "Không thể tải thông tin nguồn khách hàng",
                );
            }
        } catch (err) {
            setError("Có lỗi xảy ra khi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const toggleActive = async () => {
        if (!sourceSetting) return;

        try {
            const response = await fetch(`/api/source-settings/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ active: !sourceSetting.active }),
            });

            if (response.ok) {
                fetchSourceSetting(); // Refresh data
            }
        } catch (err) {
            console.error("Error updating source setting:", err);
        }
    };

    const deleteSourceSetting = async () => {
        if (!confirm("Bạn có chắc chắn muốn xóa nguồn khách hàng này?")) {
            return;
        }

        try {
            const response = await fetch(`/api/source-settings/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                router.push("/source-settings");
            }
        } catch (err) {
            console.error("Error deleting source setting:", err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error || !sourceSetting) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Activity className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">
                        {error || "Không tìm thấy nguồn khách hàng"}
                    </p>
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
            <div className="max-w-4xl mx-auto">
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
                                        Chi tiết nguồn khách hàng
                                    </h1>
                                    <p className="text-gray-600">
                                        Xem và quản lý thông tin nguồn khách
                                        hàng
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() =>
                                    router.push(`/source-settings/${id}/edit`)
                                }
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                                <Edit className="w-5 h-5 mr-2" />
                                Chỉnh sửa
                            </button>
                            <button
                                onClick={deleteSourceSetting}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                <Trash2 className="w-5 h-5 mr-2" />
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Thông tin cơ bản
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Tên nguồn khách hàng
                                        </label>
                                        <p className="text-gray-900 font-medium">
                                            {sourceSetting.name}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Mã code
                                        </label>
                                        <p className="text-gray-900 font-medium bg-gray-100 px-3 py-1 rounded inline-block">
                                            {sourceSetting.code}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Trạng thái
                                        </label>
                                        <button
                                            onClick={toggleActive}
                                            className={`flex items-center ${sourceSetting.active ? "text-green-600" : "text-gray-400"}`}
                                        >
                                            {sourceSetting.active ? (
                                                <ToggleRight className="w-6 h-6" />
                                            ) : (
                                                <ToggleLeft className="w-6 h-6" />
                                            )}
                                            <span className="ml-2 text-sm font-medium">
                                                {sourceSetting.active
                                                    ? "Hoạt động"
                                                    : "Không hoạt động"}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Thông tin hệ thống
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            ID
                                        </label>
                                        <p className="text-gray-900 font-mono text-sm bg-gray-100 px-3 py-1 rounded">
                                            {sourceSetting._id}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Ngày tạo
                                        </label>
                                        <p className="text-gray-900">
                                            {new Date(
                                                sourceSetting.createdAt,
                                            ).toLocaleString("vi-VN")}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Cập nhật lần cuối
                                        </label>
                                        <p className="text-gray-900">
                                            {new Date(
                                                sourceSetting.updatedAt,
                                            ).toLocaleString("vi-VN")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Usage Statistics */}
                <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Thống kê sử dụng
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="text-blue-900 font-semibold mb-2">
                                Tổng số khách hàng
                            </h4>
                            <p className="text-2xl font-bold text-blue-600">
                                0
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                                Khách hàng từ nguồn này
                            </p>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="text-green-900 font-semibold mb-2">
                                Khách hàng mới
                            </h4>
                            <p className="text-2xl font-bold text-green-600">
                                0
                            </p>
                            <p className="text-sm text-green-700 mt-1">
                                Trong 30 ngày qua
                            </p>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-lg">
                            <h4 className="text-purple-900 font-semibold mb-2">
                                Tỷ lệ chuyển đổi
                            </h4>
                            <p className="text-2xl font-bold text-purple-600">
                                0%
                            </p>
                            <p className="text-sm text-purple-700 mt-1">
                                Từ khách hàng tiềm năng
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SourceSettingDetail;
