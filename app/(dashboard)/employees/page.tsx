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
    Mail,
    Phone,
    Briefcase,
    Building,
    CheckCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    User,
    X,
} from "lucide-react";

interface Employee {
    _id: string;
    employeeId: string;
    fullName: string;
    position?: string;
    department?: string;
    phone?: string;
    email?: string;
    address?: string;
    hireDate?: string;
    salary?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const EmployeeManagement = () => {
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [positionFilter, setPositionFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [positions, setPositions] = useState<string[]>([]);
    const [searchTimeoutId, setSearchTimeoutId] =
        useState<NodeJS.Timeout | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
        null,
    );
    const [showViewModal, setShowViewModal] = useState(false);

    // Fetch positions
    const fetchPositions = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

            const response = await fetch("/api/positions", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Không thể tải danh sách chức vụ");
            }

            const data = await response.json();
            if (data.success) {
                setPositions(data.data.map((pos: any) => pos.positionName));
            }
        } catch (err) {
            console.error("Error fetching positions:", err);
        }
    };

    // Fetch employees
    const fetchEmployees = async (
        page: number = 1,
        search: string = "",
        status: string = "all",
        position: string = "all",
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
            if (status !== "all") params.append("active", status);
            if (position !== "all") params.append("position", position);

            const response = await fetch(`/api/employees?${params}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Không thể tải danh sách nhân viên");
            }

            const data = await response.json();
            if (data.success) {
                setEmployees(data.data);
                setTotal(data.pagination.total);
                setTotalPages(data.pagination.pages);
                setCurrentPage(data.pagination.page);
            }
        } catch (err) {
            console.error("Error fetching employees:", err);
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees(currentPage, searchQuery, statusFilter, positionFilter);
    }, [currentPage, statusFilter, positionFilter]);

    useEffect(() => {
        fetchEmployees();
        fetchPositions();
    }, []);

    // Handle search with debounce
    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);

        // Clear previous timeout
        if (searchTimeoutId) {
            clearTimeout(searchTimeoutId);
        }

        // Set new timeout for 2 seconds
        const timeoutId = setTimeout(() => {
            fetchEmployees(1, value, statusFilter, positionFilter);
        }, 2000);

        setSearchTimeoutId(timeoutId);
    };

    // Handle filters
    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
        setCurrentPage(1);
    };

    const handlePositionFilter = (position: string) => {
        setPositionFilter(position);
        setCurrentPage(1);
    };

    // Handle pagination
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Handle view employee
    const handleViewEmployee = (employee: Employee) => {
        setSelectedEmployee(employee);
        setShowViewModal(true);
    };

    // Handle delete
    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/employees?id=${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                fetchEmployees(
                    currentPage,
                    searchQuery,
                    statusFilter,
                    positionFilter,
                );
            } else {
                throw new Error("Không thể xóa nhân viên");
            }
        } catch (err) {
            console.error("Error deleting employee:", err);
            alert("Không thể xóa nhân viên. Vui lòng thử lại.");
        }
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
                        Đang làm việc
                    </>
                ) : (
                    <>
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Đã nghỉ việc
                    </>
                )}
            </span>
        );
    };

    // Format currency
    const formatCurrency = (amount?: number) => {
        if (!amount) return "Chưa cập nhật";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return "Chưa cập nhật";
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">
                        Đang tải danh sách nhân viên...
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
                            fetchEmployees(
                                currentPage,
                                searchQuery,
                                statusFilter,
                                positionFilter,
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
                                Quản lý nhân viên
                            </h1>
                            <p className="text-gray-600">
                                Quản lý thông tin nhân viên trong công ty
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push("/employees/tao-moi")}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Thêm nhân viên
                    </button>
                </div>

                {/* Filters */}
                <div className="mt-6 space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, mã NV, điện thoại, email..."
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
                                <option value="true">Đang làm việc</option>
                                <option value="false">Đã nghỉ việc</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                                Chức vụ:
                            </span>
                            <select
                                value={positionFilter}
                                onChange={(e) =>
                                    handlePositionFilter(e.target.value)
                                }
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            >
                                <option value="all">Tất cả</option>
                                {positions.map((position) => (
                                    <option key={position} value={position}>
                                        {position}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Employees List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {employees.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchQuery ||
                            statusFilter !== "all" ||
                            positionFilter !== "all"
                                ? "Không tìm thấy nhân viên"
                                : "Chưa có nhân viên nào"}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {searchQuery ||
                            statusFilter !== "all" ||
                            positionFilter !== "all"
                                ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                                : "Thêm nhân viên đầu tiên để bắt đầu quản lý"}
                        </p>
                        {!searchQuery &&
                            statusFilter === "all" &&
                            positionFilter === "all" && (
                                <button
                                    onClick={() =>
                                        router.push("/employees/tao-moi")
                                    }
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mx-auto"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Thêm nhân viên đầu tiên
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
                                            Nhân viên
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thông tin liên hệ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Công việc
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Lương
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
                                    {employees.map((employee) => (
                                        <tr
                                            key={employee._id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <User className="w-5 h-5 text-gray-400 mr-3" />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {employee.fullName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {
                                                                employee.employeeId
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    {employee.phone && (
                                                        <div className="flex items-center text-sm text-gray-900">
                                                            <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                                            {employee.phone}
                                                        </div>
                                                    )}
                                                    {employee.email && (
                                                        <div className="flex items-center text-sm text-gray-900">
                                                            <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                                            {employee.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    {employee.position && (
                                                        <div className="flex items-center text-sm text-gray-900">
                                                            <Briefcase className="w-4 h-4 text-gray-400 mr-2" />
                                                            {employee.position}
                                                        </div>
                                                    )}
                                                    {employee.department && (
                                                        <div className="flex items-center text-sm text-gray-500">
                                                            <Building className="w-4 h-4 text-gray-400 mr-2" />
                                                            {
                                                                employee.department
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {formatCurrency(
                                                        employee.salary,
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(
                                                    employee.isActive,
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() =>
                                                            handleViewEmployee(
                                                                employee,
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
                                                                `/employees/${employee._id}/sua`,
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
                                                                employee._id,
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

                {/* View Employee Modal */}
                {showViewModal && selectedEmployee && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowViewModal(false)}
                    >
                        <div
                            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Thông tin nhân viên
                                    </h2>
                                    <button
                                        onClick={() => setShowViewModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Thông tin cơ bản */}
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            Thông tin cơ bản
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500">
                                                    Họ và tên
                                                </label>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {selectedEmployee.fullName}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500">
                                                    Mã nhân viên
                                                </label>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {
                                                        selectedEmployee.employeeId
                                                    }
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500">
                                                    Chức vụ
                                                </label>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {selectedEmployee.position ||
                                                        "Chưa cập nhật"}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500">
                                                    Phòng ban
                                                </label>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {selectedEmployee.department ||
                                                        "Chưa cập nhật"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thông tin liên hệ */}
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            Thông tin liên hệ
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500">
                                                    Điện thoại
                                                </label>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {selectedEmployee.phone ||
                                                        "Chưa cập nhật"}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500">
                                                    Email
                                                </label>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {selectedEmployee.email ||
                                                        "Chưa cập nhật"}
                                                </p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-500">
                                                    Địa chỉ
                                                </label>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {selectedEmployee.address ||
                                                        "Chưa cập nhật"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thông tin công việc */}
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            Thông tin công việc
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500">
                                                    Ngày vào làm
                                                </label>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {selectedEmployee.hireDate
                                                        ? formatDate(
                                                              selectedEmployee.hireDate,
                                                          )
                                                        : "Chưa cập nhật"}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500">
                                                    Lương
                                                </label>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {formatCurrency(
                                                        selectedEmployee.salary,
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500">
                                                    Trạng thái
                                                </label>
                                                <div className="mt-1">
                                                    {getStatusBadge(
                                                        selectedEmployee.isActive,
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={() => setShowViewModal(false)}
                                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowViewModal(false);
                                            router.push(
                                                `/employees/${selectedEmployee._id}/sua`,
                                            );
                                        }}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Chỉnh sửa
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeManagement;
