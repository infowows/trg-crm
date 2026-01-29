"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    DollarSign,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Filter,
    CheckCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Tag,
    Lock,
} from "lucide-react";

interface ServicePricing {
    _id: string;
    serviceName: string;
    packageName?: string;
    unitPrice: number;
    effectiveFrom: string;
    effectiveTo?: string;
    isActive: boolean;
    isUsed: boolean; // Thêm để kiểm tra đã sử dụng
    createdAt: string;
    updatedAt: string;
    serviceGroup?: string; // Thêm để hiển thị nhóm dịch vụ
}

const ServicePricingManagement = () => {
    const router = useRouter();
    const [pricings, setPricings] = useState<ServicePricing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Fetch service pricings
    const fetchPricings = async (
        page: number = 1,
        search: string = "",
        status: string = "all",
    ) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
            });

            if (search) params.append("search", search);
            if (status !== "all") params.append("status", status);

            const response = await fetch(
                `/api/service-pricing?${params.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (!response.ok) {
                throw new Error("Không thể tải danh sách cài đặt giá");
            }

            const data = await response.json();

            // Với mỗi pricing, fetch service tương ứng để lấy serviceGroup
            const pricingsWithGroup = await Promise.all(
                (data.data || []).map(async (pricing: any) => {
                    try {
                        const serviceResponse = await fetch(
                            `/api/services?serviceName=${encodeURIComponent(pricing.serviceName)}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            },
                        );

                        if (serviceResponse.ok) {
                            const serviceData = await serviceResponse.json();
                            const service = serviceData.data?.[0];
                            return {
                                ...pricing,
                                serviceGroup: service?.serviceGroup || "-",
                            };
                        }
                        return {
                            ...pricing,
                            serviceGroup: "-",
                        };
                    } catch (error) {
                        console.error(
                            `Error fetching service for ${pricing.serviceName}:`,
                            error,
                        );
                        return {
                            ...pricing,
                            serviceGroup: "-",
                        };
                    }
                }),
            );

            setPricings(pricingsWithGroup);
            setTotalPages(data.pagination?.totalPages || 1);
            setTotal(data.pagination?.total || 0);
            setCurrentPage(data.pagination?.page || 1);
        } catch (err: any) {
            console.error("Error fetching service pricings:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Delete pricing
    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa cài đặt giá này?")) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

            const response = await fetch(`/api/service-pricing/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Không thể xóa cài đặt giá");
            }

            // Refresh the list
            fetchPricings(currentPage, searchQuery, statusFilter);
        } catch (err: any) {
            console.error("Error deleting pricing:", err);
            setError(err.message);
        }
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    // Check if pricing is currently effective
    const isCurrentlyEffective = (
        effectiveFrom: string,
        effectiveTo?: string,
    ) => {
        const now = new Date();
        const from = new Date(effectiveFrom);
        const to = effectiveTo ? new Date(effectiveTo) : null;

        return now >= from && (!to || now <= to);
    };

    useEffect(() => {
        fetchPricings(currentPage, searchQuery, statusFilter);
    }, [currentPage, searchQuery, statusFilter]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                        Đang tải danh sách cài đặt giá...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Cài đặt giá dịch vụ
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Quản lý bảng giá cho các dịch vụ và gói dịch vụ
                            </p>
                        </div>
                        <button
                            onClick={() =>
                                router.push("/services/cai-dat-gia/tao-moi")
                            }
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Thêm cài đặt giá
                        </button>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên dịch vụ..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Đang hoạt động</option>
                                <option value="inactive">
                                    Ngừng hoạt động
                                </option>
                            </select>
                        </div>

                        {/* Total count */}
                        <div className="flex items-center justify-center md:justify-end">
                            <span className="text-sm text-gray-600">
                                Tổng số:{" "}
                                <span className="font-semibold">{total}</span>{" "}
                                cài đặt giá
                            </span>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {pricings.length === 0 ? (
                        <div className="text-center py-12">
                            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                Không có cài đặt giá nào
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchQuery || statusFilter !== "all"
                                    ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                                    : "Thêm cài đặt giá đầu tiên để bắt đầu quản lý"}
                            </p>
                            {!searchQuery && statusFilter === "all" && (
                                <div className="mt-6">
                                    <button
                                        onClick={() =>
                                            router.push(
                                                "/services/cai-dat-gia/tao-moi",
                                            )
                                        }
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mx-auto"
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        Thêm cài đặt giá đầu tiên
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tên dịch vụ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nhóm dịch vụ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Gói dịch vụ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Đơn giá
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Hiệu lực
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pricings.map((pricing) => (
                                        <tr
                                            key={pricing._id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {pricing.serviceName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {pricing.serviceGroup || "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {pricing.packageName || "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatCurrency(
                                                    pricing.unitPrice,
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    {formatDate(
                                                        pricing.effectiveFrom,
                                                    )}
                                                    {pricing.effectiveTo && (
                                                        <>
                                                            <span className="mx-1">
                                                                -
                                                            </span>
                                                            {formatDate(
                                                                pricing.effectiveTo,
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                                {isCurrentlyEffective(
                                                    pricing.effectiveFrom,
                                                    pricing.effectiveTo,
                                                ) && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                                                        Hiệu lực
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    {/* Trạng thái hoạt động */}
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            pricing.isActive
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                        }`}
                                                    >
                                                        {pricing.isActive ? (
                                                            <>
                                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                                Đang hoạt động
                                                            </>
                                                        ) : (
                                                            <>
                                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                                Ngừng hoạt động
                                                            </>
                                                        )}
                                                    </span>

                                                    {/* Trạng thái sử dụng */}
                                                    {pricing.isUsed && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                            <Lock className="w-3 h-3 mr-1" />
                                                            Đã sử dụng
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() =>
                                                            router.push(
                                                                `/services/cai-dat-gia/${pricing._id}`,
                                                            )
                                                        }
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>

                                                    {/* Nút Chỉnh sửa - chỉ hiển thị khi chưa sử dụng */}
                                                    {!pricing.isUsed && (
                                                        <button
                                                            onClick={() =>
                                                                router.push(
                                                                    `/services/cai-dat-gia/${pricing._id}/edit`,
                                                                )
                                                            }
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {/* Nút Xóa - chỉ hiển thị khi chưa sử dụng */}
                                                    {!pricing.isUsed && (
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    pricing._id,
                                                                )
                                                            }
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {/* Hiển thị trạng thái đã sử dụng */}
                                                    {pricing.isUsed && (
                                                        <span
                                                            className="text-xs text-orange-600 font-medium italic"
                                                            title="Đã được sử dụng trong báo giá"
                                                        >
                                                            Đã dùng
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

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
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                            {Math.min(currentPage * 10, total)}
                                        </span>{" "}
                                        trong tổng số{" "}
                                        <span className="font-medium">
                                            {total}
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
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        {[...Array(totalPages)].map(
                                            (_, index) => {
                                                const page = index + 1;
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() =>
                                                            setCurrentPage(page)
                                                        }
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                            currentPage === page
                                                                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            },
                                        )}
                                        <button
                                            onClick={() =>
                                                setCurrentPage((prev) =>
                                                    Math.min(
                                                        prev + 1,
                                                        totalPages,
                                                    ),
                                                )
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServicePricingManagement;
