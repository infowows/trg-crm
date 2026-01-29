"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Building,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Filter,
    Download,
    Upload,
    RefreshCw,
    Users,
    User,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    X,
    CheckCircle,
    AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";

interface Department {
    _id: string;
    name: string;
    description?: string;
    isActive: boolean;
    manager?: string;
    employeeCount: number;
    createdAt: string;
    updatedAt: string;
}

const PhongBanManagement = () => {
    const router = useRouter();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>(
        [],
    );
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        isActive: "",
    });
    const [selectedDepartment, setSelectedDepartment] =
        useState<Department | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);

    // Fetch departments from API
    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

            const params = new URLSearchParams({
                page: currentPage.toString(),
                search: searchQuery,
                ...(filters.isActive && { isActive: filters.isActive }),
            });

            const response = await fetch(`/api/departments?${params}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                setDepartments(data.data);
                setTotalPages(Math.ceil(data.data.length / 10)); // Assuming 10 items per page
            } else {
                toast.error(
                    data.message || "Không thể tải danh sách phòng ban",
                );
            }
        } catch (error) {
            console.error("Error fetching departments:", error);
            toast.error("Không thể tải danh sách phòng ban");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, [currentPage, searchQuery, filters]);

    // Handle search
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    // Handle filter
    const handleFilter = (filterType: string, value: string) => {
        setFilters((prev) => ({
            ...prev,
            [filterType]: value,
        }));
        setCurrentPage(1);
    };

    // Handle selection
    const handleSelectDepartment = (id: string) => {
        setSelectedDepartments((prev) =>
            prev.includes(id)
                ? prev.filter((deptId) => deptId !== id)
                : [...prev, id],
        );
    };

    const handleSelectAll = () => {
        if (selectedDepartments.length === departments.length) {
            setSelectedDepartments([]);
        } else {
            setSelectedDepartments(departments.map((dept) => dept._id));
        }
    };

    // Handle view department
    const handleViewDepartment = (department: Department) => {
        setSelectedDepartment(department);
        setShowViewModal(true);
    };

    // Handle delete
    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa phòng ban này?")) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/departments?id=${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                toast.success("Xóa phòng ban thành công");
                fetchDepartments();
            } else {
                throw new Error("Không thể xóa phòng ban");
            }
        } catch (error) {
            console.error("Error deleting department:", error);
            toast.error("Không thể xóa phòng ban. Vui lòng thử lại.");
        }
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        if (selectedDepartments.length === 0) {
            toast.warning("Vui lòng chọn phòng ban cần xóa");
            return;
        }

        if (
            !confirm(
                `Bạn có chắc chắn muốn xóa ${selectedDepartments.length} phòng ban đã chọn?`,
            )
        ) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const deletePromises = selectedDepartments.map((id) =>
                fetch(`/api/departments/${id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
            );

            await Promise.all(deletePromises);
            toast.success("Xóa phòng ban thành công");
            setSelectedDepartments([]);
            fetchDepartments();
        } catch (error) {
            console.error("Error bulk deleting departments:", error);
            toast.error("Không thể xóa phòng ban. Vui lòng thử lại.");
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
                {isActive ? "Hoạt động" : "Ngừng hoạt động"}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">
                        Đang tải danh sách phòng ban...
                    </p>
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
                        <Building className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Quản lý phòng ban
                            </h1>
                            <p className="text-gray-600">
                                Quản lý thông tin phòng ban và nhân sự
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                            <Filter className="w-5 h-5 mr-2" />
                            Bộ lọc
                        </button>
                        <button
                            onClick={() => router.push("/phong-ban/tao-moi")}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Thêm phòng ban
                        </button>
                    </div>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tìm kiếm
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên phòng ban..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            handleSearch(e.target.value)
                                        }
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Trạng thái
                                </label>
                                <select
                                    value={filters.isActive}
                                    onChange={(e) =>
                                        handleFilter("isActive", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                >
                                    <option value="">Tất cả</option>
                                    <option value="true">Hoạt động</option>
                                    <option value="false">
                                        Ngừng hoạt động
                                    </option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() => {
                                        setFilters({ isActive: "" });
                                        setSearchQuery("");
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Đặt lại
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            {selectedDepartments.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <span className="text-blue-800">
                            Đã chọn {selectedDepartments.length} phòng ban
                        </span>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa đã chọn
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Departments List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={
                                            selectedDepartments.length ===
                                            departments.length
                                        }
                                        onChange={handleSelectAll}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Phòng ban
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Người quản lý
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Số nhân viên
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
                            {departments.map((department) => (
                                <tr
                                    key={department._id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedDepartments.includes(
                                                department._id,
                                            )}
                                            onChange={() =>
                                                handleSelectDepartment(
                                                    department._id,
                                                )
                                            }
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Building className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {department.name}
                                                </div>
                                                {department.description && (
                                                    <div className="text-sm text-gray-500 max-w-xs truncate">
                                                        {department.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {department.manager ? (
                                            <div className="flex items-center">
                                                <User className="w-4 h-4 text-gray-400 mr-2" />
                                                <div className="text-sm font-medium text-gray-900">
                                                    {department.manager}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">
                                                Chưa phân công
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-900">
                                            <Users className="w-4 h-4 text-gray-400 mr-2" />
                                            {department.employeeCount || 0}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(department.isActive)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() =>
                                                    handleViewDepartment(
                                                        department,
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
                                                        `/phong-ban/${department._id}/edit`,
                                                    )
                                                }
                                                className="text-green-600 hover:text-green-900"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(department._id)
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
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Trước
                        </button>
                        <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Sau
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Hiển thị <span className="font-medium">1</span>{" "}
                                đến{" "}
                                <span className="font-medium">
                                    {departments.length}
                                </span>{" "}
                                trong{" "}
                                <span className="font-medium">
                                    {departments.length}
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
                                        setCurrentPage(currentPage - 1)
                                    }
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() =>
                                        setCurrentPage(currentPage + 1)
                                    }
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Department Modal */}
            {showViewModal && selectedDepartment && (
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
                                    Thông tin phòng ban
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
                                                Tên phòng ban
                                            </label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {selectedDepartment.name}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">
                                                Trạng thái
                                            </label>
                                            <div className="mt-1">
                                                {selectedDepartment.isActive ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Đang hoạt động
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                        Ngừng hoạt động
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-500">
                                                Mô tả
                                            </label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {selectedDepartment.description ||
                                                    "Chưa có mô tả"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Thông tin quản lý */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Thông tin quản lý
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">
                                                Trưởng phòng
                                            </label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {selectedDepartment.manager ||
                                                    "Chưa phân công"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">
                                                Số lượng nhân viên
                                            </label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {selectedDepartment.employeeCount ||
                                                    0}{" "}
                                                nhân viên
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Thông tin thời gian */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Thông tin thời gian
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">
                                                Ngày tạo
                                            </label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {new Date(
                                                    selectedDepartment.createdAt,
                                                ).toLocaleDateString("vi-VN")}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">
                                                Cập nhật lần cuối
                                            </label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {new Date(
                                                    selectedDepartment.updatedAt,
                                                ).toLocaleDateString("vi-VN")}
                                            </p>
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
                                            `/phong-ban/${selectedDepartment._id}/edit`,
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
    );
};

export default PhongBanManagement;
