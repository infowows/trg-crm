"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    FileText,
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    Calendar,
    DollarSign,
    User,
    Building,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

interface Package {
    name: string;
    unit: "m2" | "m3";
    length: number;
    width: number;
    area: number;
    coefficient: number;
    volume: number;
    unitPrice: number;
    totalPrice: number;
    note?: string;
}

interface Service {
    name: string;
    packages: Package[];
}

interface Quotation {
    _id: string;
    quotationNo: string;
    customer: string;
    customerRef?: string;
    date: string;
    validTo?: string;
    services: Service[];
    totalAmount: number;
    taxAmount: number;
    grandTotal: number;
    status: "draft" | "sent" | "approved" | "rejected" | "completed";
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

const BaoGiaManagement = () => {
    const router = useRouter();
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Fetch quotations
    const fetchQuotations = async (
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

            const response = await fetch(`/api/quotations?${params}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Không thể tải danh sách báo giá");
            }

            const data = await response.json();
            if (data.success) {
                setQuotations(data.data);
                setTotal(data.pagination.total);
                setTotalPages(data.pagination.pages);
                setCurrentPage(data.pagination.page);
            }
        } catch (err) {
            console.error("Error fetching quotations:", err);
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotations(currentPage, searchQuery, statusFilter);
    }, [currentPage, searchQuery, statusFilter]);

    // Handle search
    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    // Handle status filter
    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
        setCurrentPage(1);
    };

    // Handle pagination
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Handle delete
    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa báo giá này?")) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/quotations/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                fetchQuotations(currentPage, searchQuery, statusFilter);
            } else {
                throw new Error("Không thể xóa báo giá");
            }
        } catch (err) {
            console.error("Error deleting quotation:", err);
            alert("Không thể xóa báo giá. Vui lòng thử lại.");
        }
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: {
                color: "bg-gray-100 text-gray-800",
                icon: Clock,
                label: "Nháp",
            },
            sent: {
                color: "bg-blue-100 text-blue-800",
                icon: AlertCircle,
                label: "Đã gửi",
            },
            approved: {
                color: "bg-green-100 text-green-800",
                icon: CheckCircle,
                label: "Đã duyệt",
            },
            rejected: {
                color: "bg-red-100 text-red-800",
                icon: XCircle,
                label: "Từ chối",
            },
            completed: {
                color: "bg-purple-100 text-purple-800",
                icon: CheckCircle,
                label: "Hoàn thành",
            },
        };

        const config =
            statusConfig[status as keyof typeof statusConfig] ||
            statusConfig.draft;
        const Icon = config.icon;

        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
            >
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
            </span>
        );
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">
                        Đang tải danh sách báo giá...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() =>
                            fetchQuotations(
                                currentPage,
                                searchQuery,
                                statusFilter,
                            )
                        }
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
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center mb-4 lg:mb-0">
                        <FileText className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Quản lý báo giá
                            </h1>
                            <p className="text-gray-600">
                                Quản lý báo giá dịch vụ cho khách hàng
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() =>
                            router.push("/bao-gia/tao-moi")
                        }
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Tạo báo giá
                    </button>
                </div>

                {/* Filters */}
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo số báo giá, tên khách hàng..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="draft">Nháp</option>
                            <option value="sent">Đã gửi</option>
                            <option value="approved">Đã duyệt</option>
                            <option value="rejected">Từ chối</option>
                            <option value="completed">Hoàn thành</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Quotations List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {quotations.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchQuery || statusFilter !== "all"
                                ? "Không tìm thấy báo giá"
                                : "Chưa có báo giá nào"}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {searchQuery || statusFilter !== "all"
                                ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                                : "Tạo báo giá đầu tiên để bắt đầu quản lý"}
                        </p>
                        {!searchQuery && statusFilter === "all" && (
                            <button
                                onClick={() =>
                                    router.push("/bao-gia/tao-moi")
                                }
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mx-auto"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Tạo báo giá đầu tiên
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Số báo giá
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Khách hàng
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ngày tạo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tổng tiền
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Người tạo
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {quotations.map((quotation) => (
                                        <tr
                                            key={quotation._id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {quotation.quotationNo}
                                                </div>
                                                {quotation.validTo && (
                                                    <div className="text-xs text-gray-500">
                                                        Hết hạn:{" "}
                                                        {formatDate(
                                                            quotation.validTo,
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Building className="w-4 h-4 text-gray-400 mr-2" />
                                                    <div className="text-sm text-gray-900">
                                                        {quotation.customer}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                                    {formatDate(quotation.date)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {formatCurrency(
                                                        quotation.grandTotal,
                                                    )}
                                                </div>
                                                {quotation.taxAmount > 0 && (
                                                    <div className="text-xs text-gray-500">
                                                        (VAT:{" "}
                                                        {formatCurrency(
                                                            quotation.taxAmount,
                                                        )}
                                                        )
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(
                                                    quotation.status,
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <User className="w-4 h-4 text-gray-400 mr-2" />
                                                    {quotation.createdBy}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() =>
                                                            router.push(
                                                                `/bao-gia/${quotation._id}`,
                                                            )
                                                        }
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            router.push(
                                                                `/bao-gia/${quotation._id}/edit`,
                                                            )
                                                        }
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                quotation._id,
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Xóa"
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() =>
                                            handlePageChange(currentPage - 1)
                                        }
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" />
                                        Trước
                                    </button>
                                    <button
                                        onClick={() =>
                                            handlePageChange(currentPage + 1)
                                        }
                                        disabled={currentPage === totalPages}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Sau
                                        <ChevronRight className="w-4 h-4 ml-1" />
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
                                                    total,
                                                )}
                                            </span>{" "}
                                            trong{" "}
                                            <span className="font-medium">
                                                {total}
                                            </span>{" "}
                                            kết quả
                                        </p>
                                    </div>
                                    <div>
                                        <nav
                                            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                            aria-label="Pagination"
                                        >
                                            <button
                                                onClick={() =>
                                                    handlePageChange(
                                                        currentPage - 1,
                                                    )
                                                }
                                                disabled={currentPage === 1}
                                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>

                                            {/* Page numbers */}
                                            {Array.from(
                                                {
                                                    length: Math.min(
                                                        5,
                                                        totalPages,
                                                    ),
                                                },
                                                (_, i) => {
                                                    let pageNum;
                                                    if (totalPages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (
                                                        currentPage <= 3
                                                    ) {
                                                        pageNum = i + 1;
                                                    } else if (
                                                        currentPage >=
                                                        totalPages - 2
                                                    ) {
                                                        pageNum =
                                                            totalPages - 4 + i;
                                                    } else {
                                                        pageNum =
                                                            currentPage - 2 + i;
                                                    }

                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() =>
                                                                handlePageChange(
                                                                    pageNum,
                                                                )
                                                            }
                                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                                currentPage ===
                                                                pageNum
                                                                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                                            }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                },
                                            )}

                                            <button
                                                onClick={() =>
                                                    handlePageChange(
                                                        currentPage + 1,
                                                    )
                                                }
                                                disabled={
                                                    currentPage === totalPages
                                                }
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default BaoGiaManagement;
