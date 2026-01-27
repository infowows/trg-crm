"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Briefcase,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Filter,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Building,
} from "lucide-react";

interface ChucVu {
    _id: string;
    positionName: string;
    description?: string;
    department?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const ChucVuManagement = () => {
    const router = useRouter();
    const [chucVus, setChucVus] = useState<ChucVu[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedChucVus, setSelectedChucVus] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        isActive: "",
        department: "",
    });

    useEffect(() => {
        fetchChucVus();
    }, [currentPage, searchQuery, filters]);

    const fetchChucVus = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: "10",
                search: searchQuery,
                ...(filters.isActive !== "" && { isActive: filters.isActive }),
                ...(filters.department && { department: filters.department }),
            });

            const response = await fetch(`/api/positions?${params}`);
            const data = await response.json();

            if (data.success) {
                setChucVus(data.data);
                setTotalPages(data.pagination.pages);
                setTotal(data.pagination.total);
            } else {
                setError(data.message || "Không thể tải dữ liệu");
            }
        } catch (err) {
            setError("Có lỗi xảy ra khi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/positions/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ isActive: !currentStatus }),
            });

            if (response.ok) {
                fetchChucVus();
            }
        } catch (err) {
            console.error("Error updating position:", err);
        }
    };

    const deleteChucVu = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa chức vụ này?")) {
            return;
        }

        try {
            const response = await fetch(`/api/positions/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                fetchChucVus();
            }
        } catch (err) {
            console.error("Error deleting position:", err);
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedChucVus(chucVus.map((cv) => cv._id));
        } else {
            setSelectedChucVus([]);
        }
    };

    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedChucVus((prev) => [...prev, id]);
        } else {
            setSelectedChucVus((prev) => prev.filter((cvId) => cvId !== id));
        }
    };

    const filteredChucVus = chucVus.filter((chucVu) => {
        const matchesSearch =
            !searchQuery ||
            chucVu.positionName
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (chucVu.description &&
                chucVu.description
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())) ||
            (chucVu.department &&
                chucVu.department
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()));

        const matchesActive =
            filters.isActive === "" ||
            (filters.isActive === "true" && chucVu.isActive) ||
            (filters.isActive === "false" && !chucVu.isActive);

        const matchesDepartment =
            !filters.department || chucVu.department === filters.department;

        return matchesSearch && matchesActive && matchesDepartment;
    });

    const departments = Array.from(
        new Set(
            chucVus.filter((cv) => cv.department).map((cv) => cv.department!),
        ),
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

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* <div className="max-w-7xl mx-auto"> */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center mb-4 lg:mb-0">
                            <Briefcase className="w-8 h-8 text-blue-600 mr-3" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Quản lý chức vụ
                                </h1>
                                <p className="text-gray-600">
                                    Quản lý thông tin chức vụ trong công ty
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push("/chuc-vu/tao-moi")}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Thêm chức vụ
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo tên chức vụ, mô tả, phòng ban..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        handleSearch(e.target.value)
                                    }
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            >
                                <Filter className="w-5 h-5 mr-2" />
                                Bộ lọc
                            </button>
                            <button
                                onClick={fetchChucVus}
                                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            >
                                <RefreshCw className="w-5 h-5 mr-2" />
                                Làm mới
                            </button>
                        </div>
                        <div className="text-sm text-gray-600">
                            Hiển thị {filteredChucVus.length} / {total} chức vụ
                        </div>
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Trạng thái
                                </label>
                                <select
                                    value={filters.isActive}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "isActive",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                >
                                    <option value="">Tất cả</option>
                                    <option value="true">Đang hoạt động</option>
                                    <option value="false">
                                        Không hoạt động
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phòng ban
                                </label>
                                <select
                                    value={filters.department}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "department",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                >
                                    <option value="">Tất cả phòng ban</option>
                                    {departments.map((dept) => (
                                        <option key={dept} value={dept}>
                                            {dept}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={
                                                selectedChucVus.length ===
                                                    filteredChucVus.length &&
                                                filteredChucVus.length > 0
                                            }
                                            onChange={(e) =>
                                                handleSelectAll(
                                                    e.target.checked,
                                                )
                                            }
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tên chức vụ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mô tả
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Phòng ban
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngày tạo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredChucVus.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-12 text-center text-gray-500"
                                        >
                                            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <p>Chưa có dữ liệu chức vụ</p>
                                            <button
                                                onClick={() =>
                                                    router.push(
                                                        "/chuc-vu/tao-moi",
                                                    )
                                                }
                                                className="mt-2 text-blue-600 hover:text-blue-800"
                                            >
                                                Thêm chức vụ mới
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredChucVus.map((chucVu) => (
                                        <tr
                                            key={chucVu._id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedChucVus.includes(
                                                        chucVu._id,
                                                    )}
                                                    onChange={(e) =>
                                                        handleSelectOne(
                                                            chucVu._id,
                                                            e.target.checked,
                                                        )
                                                    }
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <Briefcase className="w-5 h-5 text-gray-400 mr-3" />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {
                                                                chucVu.positionName
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-600 max-w-xs truncate">
                                                    {chucVu.description || "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <Building className="w-4 h-4 text-gray-400 mr-2" />
                                                    <span className="text-sm text-gray-600">
                                                        {chucVu.department ||
                                                            "-"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() =>
                                                        toggleActive(
                                                            chucVu._id,
                                                            chucVu.isActive,
                                                        )
                                                    }
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        chucVu.isActive
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}
                                                >
                                                    {chucVu.isActive
                                                        ? "Đang hoạt động"
                                                        : "Không hoạt động"}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(
                                                    chucVu.createdAt,
                                                ).toLocaleDateString("vi-VN")}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() =>
                                                            router.push(
                                                                `/chuc-vu/${chucVu._id}`,
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
                                                                `/chuc-vu/${chucVu._id}/edit`,
                                                            )
                                                        }
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            deleteChucVu(
                                                                chucVu._id,
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
                                            Math.max(1, prev - 1),
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
                                            Math.min(totalPages, prev + 1),
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
                                            {Math.min(
                                                currentPage * 10,
                                                filteredChucVus.length,
                                            )}
                                        </span>{" "}
                                        trong{" "}
                                        <span className="font-medium">
                                            {filteredChucVus.length}
                                        </span>{" "}
                                        kết quả
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        <button
                                            onClick={() =>
                                                setCurrentPage((prev) =>
                                                    Math.max(1, prev - 1),
                                                )
                                            }
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        {Array.from(
                                            { length: totalPages },
                                            (_, i) => i + 1,
                                        ).map((page) => (
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
                                        ))}
                                        <button
                                            onClick={() =>
                                                setCurrentPage((prev) =>
                                                    Math.min(
                                                        totalPages,
                                                        prev + 1,
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

export default ChucVuManagement;
