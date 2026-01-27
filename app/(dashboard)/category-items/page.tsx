"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    LayoutPanelTop,
    Plus,
    Edit,
    Trash2,
    Search,
    Filter,
    Eye,
    EyeOff,
    Loader2,
} from "lucide-react";

interface CategoryItem {
    _id: string;
    name: string;
    code: string;
    note?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const CategoryItemsPage = () => {
    const router = useRouter();
    const [categoryItems, setCategoryItems] = useState<CategoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showInactiveOnly, setShowInactiveOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchCategoryItems();
    }, [currentPage, searchTerm, showInactiveOnly]);

    const fetchCategoryItems = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: "10",
                ...(searchTerm && { search: searchTerm }),
                ...(showInactiveOnly && { isActive: "false" }),
            });

            const response = await fetch(`/api/category-items?${params}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setCategoryItems(data.data);
                    setTotalPages(data.pagination.pages);
                    setTotal(data.pagination.total);
                }
            }
        } catch (error) {
            console.error("Error fetching category items:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/category-items/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    isActive: !currentStatus,
                }),
            });

            if (response.ok) {
                fetchCategoryItems();
            }
        } catch (error) {
            console.error("Error toggling status:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa hạng mục này?")) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/category-items/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                fetchCategoryItems();
            }
        } catch (error) {
            console.error("Error deleting category item:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center mb-4 lg:mb-0">
                        <LayoutPanelTop className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Hạng mục
                            </h1>
                            <p className="text-gray-600">
                                Quản lý các hạng mục chi tiết cho dịch vụ
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() =>
                            router.push("/category-items/tao-moi")
                        }
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Thêm hạng mục
                    </button>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, mã, ghi chú..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <button
                        onClick={() => setShowInactiveOnly(!showInactiveOnly)}
                        className={`flex items-center px-4 py-2 rounded-lg transition ${
                            showInactiveOnly
                                ? "bg-red-100 text-red-700 border border-red-300"
                                : "bg-gray-100 text-gray-700 border border-gray-300"
                        }`}
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        {showInactiveOnly ? "Đang ẩn" : "Tất cả"}
                    </button>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                    Hiển thị {categoryItems.length} / {total} hạng mục
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : categoryItems.length === 0 ? (
                    <div className="text-center p-12">
                        <LayoutPanelTop className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm || showInactiveOnly
                                ? "Không tìm thấy hạng mục nào"
                                : "Chưa có hạng mục nào"}
                        </h3>
                        <p className="text-gray-600">
                            {searchTerm || showInactiveOnly
                                ? "Thử thay đổi điều kiện tìm kiếm"
                                : "Tạo hạng mục đầu tiên để bắt đầu"}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mã hạng mục
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tên hạng mục
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ghi chú
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
                                {categoryItems.map((item) => (
                                    <tr
                                        key={item._id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900">
                                                {item.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">
                                                {item.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-500 truncate block max-w-xs">
                                                {item.note || "-"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                    item.isActive
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {item.isActive ? "Hoạt động" : "Ẩn"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-500">
                                                {new Date(
                                                    item.createdAt
                                                ).toLocaleDateString("vi-VN")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() =>
                                                        router.push(
                                                            `/category-items/${item._id}/sua`
                                                        )
                                                    }
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleToggleStatus(
                                                            item._id,
                                                            item.isActive
                                                        )
                                                    }
                                                    className={`${
                                                        item.isActive
                                                            ? "text-yellow-600 hover:text-yellow-900"
                                                            : "text-green-600 hover:text-green-900"
                                                    }`}
                                                >
                                                    {item.isActive ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(item._id)
                                                    }
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Hiển thị {categoryItems.length} / {total} hạng mục
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() =>
                                    setCurrentPage(Math.max(1, currentPage - 1))
                                }
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>
                            <span className="px-3 py-1 text-sm">
                                Trang {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() =>
                                    setCurrentPage(
                                        Math.min(totalPages, currentPage + 1)
                                    )
                                }
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryItemsPage;
