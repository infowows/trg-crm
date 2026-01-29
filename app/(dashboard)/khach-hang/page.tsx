"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Users,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Filter,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Star,
    ChevronLeft,
    ChevronRight,
    Building,
    User,
    AlertCircle,
    CheckCircle,
    Clock,
    TrendingUp,
} from "lucide-react";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";

const CustomerModal = dynamic(() => import("@/components/CustomerModal"), {
    ssr: false,
});

interface Customer {
    _id: string;
    customerId: string;
    fullName: string;
    shortName?: string;
    address?: string;
    phone?: string;
    email?: string;
    image?: string;
    source?: string;
    referrer?: string;
    referrerPhone?: string;
    serviceGroup?: string;
    marketingClassification?: string;
    potentialLevel?: string;
    salesPerson?: string;
    needsNote?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const KhachHangManagement = () => {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [sources, setSources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [potentialFilter, setPotentialFilter] = useState<string>("all");
    const [sourceFilter, setSourceFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Modal states
    const [modalCustomer, setModalCustomer] = useState<Customer | null>(null);
    const [modalMode, setModalMode] = useState<"view" | "delete">("view");

    // Fetch customers
    const fetchCustomers = async (
        page: number = 1,
        search: string = "",
        status: string = "all",
        potential: string = "all",
        source: string = "all",
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
            if (status !== "all") params.append("isActive", status);
            if (potential !== "all") params.append("potentialLevel", potential);
            if (source !== "all") params.append("source", source);

            const response = await fetch(`/api/customers?${params}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Không thể tải danh sách khách hàng");
            }

            const data = await response.json();
            if (data.success) {
                setCustomers(data.data);
                setTotal(data.pagination.total);
                setTotalPages(data.pagination.pages);
                setCurrentPage(data.pagination.page);
            }
            console.log(data.data);
        } catch (err) {
            console.error("Error fetching customers:", err);
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    // Fetch sources
    const fetchSources = async () => {
        try {
            const response = await fetch(
                "/api/source-settings?isActive=true&limit=100",
            );
            const data = await response.json();
            if (data.success) {
                setSources(data.data);
            }
        } catch (err) {
            console.error("Error fetching sources:", err);
        }
    };

    useEffect(() => {
        fetchCustomers(
            currentPage,
            searchQuery,
            statusFilter,
            potentialFilter,
            sourceFilter,
        );
        fetchSources();
    }, [currentPage, searchQuery, statusFilter, potentialFilter, sourceFilter]);

    // Handle search
    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    // Handle filters
    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
        setCurrentPage(1);
    };

    const handlePotentialFilter = (potential: string) => {
        setPotentialFilter(potential);
        setCurrentPage(1);
    };

    const handleSourceFilter = (source: string) => {
        setSourceFilter(source);
        setCurrentPage(1);
    };

    // Handle pagination
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Modal handlers
    const handleViewCustomer = (customer: Customer) => {
        setModalCustomer(customer);
        setModalMode("view");
    };

    const handleEditCustomer = (customer: Customer) => {
        router.push(`/khach-hang/${customer._id}`);
    };

    const handleDeleteCustomer = (customer: Customer) => {
        setModalCustomer(customer);
        setModalMode("delete");
    };

    const handleModalClose = () => {
        setModalCustomer(null);
    };

    const handleConfirmDelete = async (customerId: string) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/customers/${customerId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Xóa khách hàng thành công");
                fetchCustomers(
                    currentPage,
                    searchQuery,
                    statusFilter,
                    potentialFilter,
                    sourceFilter,
                );
            } else {
                toast.error(data.message || "Không thể xóa khách hàng");
            }
        } catch (err) {
            console.error("Error deleting customer:", err);
            toast.error("Không thể xóa khách hàng. Vui lòng thử lại.");
        }
    };

    // Handle delete (legacy - keep for compatibility)
    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/customers/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                fetchCustomers(
                    currentPage,
                    searchQuery,
                    statusFilter,
                    potentialFilter,
                    sourceFilter,
                );
            } else {
                throw new Error("Không thể xóa khách hàng");
            }
        } catch (err) {
            console.error("Error deleting customer:", err);
            alert("Không thể xóa khách hàng. Vui lòng thử lại.");
        }
    };

    // Get potential level badge
    const getPotentialBadge = (level?: string) => {
        const levelConfig = {
            Cao: { color: "bg-green-100 text-green-800", icon: TrendingUp },
            "Trung bình": {
                color: "bg-yellow-100 text-yellow-800",
                icon: Star,
            },
            Thấp: { color: "bg-red-100 text-red-800", icon: Clock },
        };

        const config =
            levelConfig[level as keyof typeof levelConfig] ||
            levelConfig["Trung bình"];
        const Icon = config.icon;

        return level ? (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
            >
                <Icon className="w-3 h-3 mr-1" />
                {level}
            </span>
        ) : null;
    };

    // Get status badge
    const getStatusBadge = (isActive: boolean) => {
        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                }`}
            >
                {isActive ? (
                    <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Hoạt động
                    </>
                ) : (
                    <>
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Không hoạt động
                    </>
                )}
            </span>
        );
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
                        Đang tải danh sách khách hàng...
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
                            fetchCustomers(
                                currentPage,
                                searchQuery,
                                statusFilter,
                                potentialFilter,
                                sourceFilter,
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
                        <Users className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Quản lý khách hàng
                            </h1>
                            <p className="text-gray-600">
                                Quản lý thông tin khách hàng tiềm năng và hiện
                                tại
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push("/khach-hang/tao-moi")}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Thêm khách hàng
                    </button>
                </div>

                {/* Filters */}
                <div className="mt-6 space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, mã KH, điện thoại, email..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full"
                        />
                    </div>

                    {/* Filter buttons */}
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center space-x-2">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-600">
                                Trạng thái:
                            </span>
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    handleStatusFilter(e.target.value)
                                }
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            >
                                <option value="all">Tất cả</option>
                                <option value="true">Hoạt động</option>
                                <option value="false">Không hoạt động</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                                Tiềm năng:
                            </span>
                            <select
                                value={potentialFilter}
                                onChange={(e) =>
                                    handlePotentialFilter(e.target.value)
                                }
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            >
                                <option value="Ngắn hạn">Ngắn hạn</option>
                                <option value="Trung hạn">Trung hạn</option>
                                <option value="Dài hạn">Dài hạn</option>
                                <option value="Không Phù Hợp">Không Phù Hợp</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                                Nguồn:
                            </span>
                            <select
                                value={sourceFilter}
                                onChange={(e) =>
                                    handleSourceFilter(e.target.value)
                                }
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            >
                                <option value="all">Tất cả</option>
                                {sources.map((source) => (
                                    <option
                                        key={source._id}
                                        value={source.name}
                                    >
                                        {source.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customers List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {customers.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchQuery ||
                            statusFilter !== "all" ||
                            potentialFilter !== "all" ||
                            sourceFilter !== "all"
                                ? "Không tìm thấy khách hàng"
                                : "Chưa có khách hàng nào"}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {searchQuery ||
                            statusFilter !== "all" ||
                            potentialFilter !== "all" ||
                            sourceFilter !== "all"
                                ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                                : "Thêm khách hàng đầu tiên để bắt đầu quản lý"}
                        </p>
                        {!searchQuery &&
                            statusFilter === "all" &&
                            potentialFilter === "all" &&
                            sourceFilter === "all" && (
                                <button
                                    onClick={() =>
                                        router.push("/khach-hang/tao-moi")
                                    }
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mx-auto"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Thêm khách hàng đầu tiên
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
                                            Khách hàng
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thông tin liên hệ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nguồn & Tiềm năng
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nhân viên phụ trách
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
                                    {customers.map((customer) => (
                                        <tr
                                            key={customer._id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {customer.image ? (
                                                        <img
                                                            className="w-10 h-10 object-cover mr-3"
                                                            src={customer.image}
                                                            alt={
                                                                customer.fullName ||
                                                                ""
                                                            }
                                                        />
                                                    ) : (
                                                        <Building className="w-6 h-6 text-gray-400 mr-3" />
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {customer.fullName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {
                                                                customer.customerId
                                                            }
                                                            {customer.shortName &&
                                                                ` • ${customer.shortName}`}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    {customer.phone && (
                                                        <div className="flex items-center text-sm text-gray-900">
                                                            <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                                            {customer.phone}
                                                        </div>
                                                    )}
                                                    {customer.email && (
                                                        <div className="flex items-center text-sm text-gray-900">
                                                            <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                                            {customer.email}
                                                        </div>
                                                    )}
                                                    {/* {customer.address && (
                                                        <div className="flex items-center text-sm text-gray-500">
                                                            <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                                            {customer.address}
                                                        </div>
                                                    )} */}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-2">
                                                    {customer.source && (
                                                        <div className="text-sm text-gray-900">
                                                            <span className="font-medium">
                                                                Nguồn:
                                                            </span>{" "}
                                                            {customer.source}
                                                        </div>
                                                    )}
                                                    {getPotentialBadge(
                                                        customer.potentialLevel,
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <User className="w-4 h-4 text-gray-400 mr-2" />
                                                    {customer.salesPerson ||
                                                        "Chưa phân công"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(
                                                    customer.isActive,
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() =>
                                                            handleViewCustomer(
                                                                customer,
                                                            )
                                                        }
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleEditCustomer(
                                                                customer,
                                                            )
                                                        }
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteCustomer(
                                                                customer,
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

            {/* Customer Modal */}
            {modalCustomer && (
                <CustomerModal
                    customer={modalCustomer}
                    mode={modalMode}
                    onClose={handleModalClose}
                    onEdit={handleEditCustomer}
                    onDelete={handleConfirmDelete}
                />
            )}
        </div>
    );
};

export default KhachHangManagement;
