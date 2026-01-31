"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Activity,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
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

const SourceSettingsManagement = () => {
    const router = useRouter();
    const [sourceSettings, setSourceSettings] = useState<SourceSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchSourceSettings();
    }, [currentPage, searchTerm]);

    const fetchSourceSettings = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: "10",
            });

            if (searchTerm) {
                params.append("search", searchTerm);
            }

            const response = await fetch(`/api/source-settings?${params}`);
            const data = await response.json();

            if (data.success) {
                setSourceSettings(data.data);
                setTotalPages(data.pagination.pages);
            } else {
                setError(data.message || "Không thể tải dữ liệu");
            }
        } catch (err) {
            setError("Có lỗi xảy ra khi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/source-settings/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ active: !currentStatus }),
            });

            if (response.ok) {
                fetchSourceSettings(); // Refresh data
            }
        } catch (err) {
            console.error("Error updating source setting:", err);
        }
    };

    const deleteSourceSetting = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa nguồn khách hàng này?")) {
            return;
        }

        try {
            const response = await fetch(`/api/source-settings/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                fetchSourceSettings(); // Refresh data
            }
        } catch (err) {
            console.error("Error deleting source setting:", err);
        }
    };

    const filteredSettings = sourceSettings.filter(
        (setting) =>
            setting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            setting.code.toLowerCase().includes(searchTerm.toLowerCase()),
    );

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

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Activity className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center mb-4 lg:mb-0">
                        <Activity className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Nguồn khách hàng
                            </h1>
                            <p className="text-gray-600">
                                Quản lý các kênh tiếp cận khách hàng
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() =>
                            router.push("/source-settings/create")
                        }
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Thêm nguồn KH
                    </button>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên hoặc mã nguồn..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tên nguồn
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mã code
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày tạo
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredSettings.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-12 text-center"
                                    >
                                        <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            Chưa có dữ liệu
                                        </h3>
                                        <p className="text-gray-600">
                                            Chưa có nguồn khách hàng nào được
                                            tạo
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredSettings.map((setting) => (
                                    <tr
                                        key={setting._id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {setting.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {setting.code}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() =>
                                                    toggleActive(
                                                        setting._id,
                                                        setting.active,
                                                    )
                                                }
                                                className={`flex items-center ${setting.active ? "text-green-600" : "text-gray-400"}`}
                                            >
                                                {setting.active ? (
                                                    <ToggleRight className="w-6 h-6" />
                                                ) : (
                                                    <ToggleLeft className="w-6 h-6" />
                                                )}
                                                <span className="ml-2 text-sm">
                                                    {setting.active
                                                        ? "Hoạt động"
                                                        : "Không hoạt động"}
                                                </span>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {new Date(
                                                    setting.createdAt,
                                                ).toLocaleDateString("vi-VN")}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() =>
                                                    router.push(
                                                        `/source-settings/${setting._id}`,
                                                    )
                                                }
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    router.push(
                                                        `/source-settings/${setting._id}/edit`,
                                                    )
                                                }
                                                className="text-green-600 hover:text-green-900 mr-3"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    deleteSourceSetting(
                                                        setting._id,
                                                    )
                                                }
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.max(prev - 1, 1),
                                    )
                                }
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Trước
                            </button>
                            <button
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(prev + 1, totalPages),
                                    )
                                }
                                disabled={currentPage === totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Sau
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Hiển thị{" "}
                                    <span className="font-medium">
                                        {(currentPage - 1) * 10 + 1}
                                    </span>{" "}
                                    đến{" "}
                                    <span className="font-medium">
                                        {Math.min(
                                            currentPage * 10,
                                            filteredSettings.length,
                                        )}
                                    </span>{" "}
                                    trong{" "}
                                    <span className="font-medium">
                                        {filteredSettings.length}
                                    </span>{" "}
                                    kết quả
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.max(prev - 1, 1),
                                            )
                                        }
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                    >
                                        Trước
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() =>
                                                setCurrentPage(i + 1)
                                            }
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                currentPage === i + 1
                                                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.min(prev + 1, totalPages),
                                            )
                                        }
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                    >
                                        Sau
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SourceSettingsManagement;
