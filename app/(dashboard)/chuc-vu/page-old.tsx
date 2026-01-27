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
    Download,
    Upload,
    RefreshCw,
    Users,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Star,
    Shield,
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

    useEffect(() => {
        fetchChucVus();
    }, [currentPage, searchQuery, filters]);

    // Filter chức vụ
    const filteredChucVus = chucVus.filter((chucVu) => {
        const matchesSearch =
            chucVu.ten_chuc_vu
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            chucVu.ma_chuc_vu
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            chucVu.mo_ta.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilters =
            (!filters.trang_thai || chucVu.trang_thai === filters.trang_thai) &&
            (!filters.phong_ban || chucVu.phong_ban === filters.phong_ban) &&
            (!filters.cap_bac || chucVu.cap_bac === filters.cap_bac);

        return matchesSearch && matchesFilters;
    });

    // Handle selection
    const handleSelectChucVu = (chucVuId: string) => {
        setSelectedChucVus((prev) =>
            prev.includes(chucVuId)
                ? prev.filter((id) => id !== chucVuId)
                : [...prev, chucVuId],
        );
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedChucVus.length === filteredChucVus.length) {
            setSelectedChucVus([]);
        } else {
            setSelectedChucVus(filteredChucVus.map((chucVu) => chucVu.id));
        }
    };

    // Handle delete
    const handleDeleteChucVu = (chucVuId: string) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa chức vụ này?")) {
            setChucVus((prev) =>
                prev.filter((chucVu) => chucVu.id !== chucVuId),
            );
            setSelectedChucVus((prev) => prev.filter((id) => id !== chucVuId));
        }
    };

    // Handle delete selected
    const handleDeleteSelected = () => {
        if (
            window.confirm(
                `Bạn có chắc chắn muốn xóa ${selectedChucVus.length} chức vụ đã chọn?`,
            )
        ) {
            setChucVus((prev) =>
                prev.filter((chucVu) => !selectedChucVus.includes(chucVu.id)),
            );
            setSelectedChucVus([]);
        }
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        const styles = {
            active: "bg-green-100 text-green-800",
            inactive: "bg-red-100 text-red-800",
        };
        return (
            <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}
            >
                {status === "active" ? "Hoạt động" : "Không hoạt động"}
            </span>
        );
    };

    // Get level badge
    const getLevelBadge = (capBac: string) => {
        const styles = {
            "Cấp cao nhất": "bg-purple-100 text-purple-800",
            "Cấp quản lý": "bg-blue-100 text-blue-800",
            "Cấp nhân viên": "bg-gray-100 text-gray-800",
        };
        return (
            <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${styles[capBac as keyof typeof styles] || styles["Cấp nhân viên"]}`}
            >
                {capBac}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
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

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => router.push("/chuc-vu/tao-moi")}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Thêm chức vụ
                        </button>
                        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                            <Upload className="w-5 h-5 mr-2" />
                            Import
                        </button>
                        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                            <Download className="w-5 h-5 mr-2" />
                            Export
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            <RefreshCw className="w-5 h-5 mr-2" />
                            Làm mới
                        </button>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="mt-6 flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, mã chức vụ, mô tả..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                        <Filter className="w-5 h-5 mr-2" />
                        Bộ lọc
                        {showFilters && <ChevronUp className="w-4 h-4 ml-2" />}
                    </button>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <select
                                value={filters.trang_thai}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        trang_thai: e.target.value,
                                    }))
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="active">Hoạt động</option>
                                <option value="inactive">
                                    Không hoạt động
                                </option>
                            </select>

                            <select
                                value={filters.phong_ban}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        phong_ban: e.target.value,
                                    }))
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            >
                                <option value="">Tất cả phòng ban</option>
                                <option value="Ban Giám đốc">
                                    Ban Giám đốc
                                </option>
                                <option value="Phòng Kinh doanh">
                                    Phòng Kinh doanh
                                </option>
                                <option value="Phòng Kế toán">
                                    Phòng Kế toán
                                </option>
                            </select>

                            <select
                                value={filters.cap_bac}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        cap_bac: e.target.value,
                                    }))
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            >
                                <option value="">Tất cả cấp bậc</option>
                                <option value="Cấp cao nhất">
                                    Cấp cao nhất
                                </option>
                                <option value="Cấp quản lý">Cấp quản lý</option>
                                <option value="Cấp nhân viên">
                                    Cấp nhân viên
                                </option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Selected Actions */}
                {selectedChucVus.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                        <span className="text-sm text-blue-800">
                            Đã chọn {selectedChucVus.length} chức vụ
                        </span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                                Export đã chọn
                            </button>
                            <button
                                onClick={handleDeleteSelected}
                                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                            >
                                Xóa đã chọn
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    selectedChucVus.length ===
                                                    filteredChucVus.length
                                                }
                                                onChange={handleSelectAll}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thông tin chức vụ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Phòng ban
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cấp bậc
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Hệ số lương
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Số lượng NV
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredChucVus.map((chucVu) => (
                                        <tr
                                            key={chucVu.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedChucVus.includes(
                                                        chucVu.id,
                                                    )}
                                                    onChange={() =>
                                                        handleSelectChucVu(
                                                            chucVu.id,
                                                        )
                                                    }
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                                        <Briefcase className="w-6 h-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {chucVu.ten_chuc_vu}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Mã:{" "}
                                                            {chucVu.ma_chuc_vu}
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                                                            {chucVu.mo_ta}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {chucVu.phong_ban}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getLevelBadge(chucVu.cap_bac)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {chucVu.he_so_luong.toFixed(
                                                            1,
                                                        )}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {
                                                            chucVu.so_luong_nhan_vien
                                                        }
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(
                                                    chucVu.trang_thai,
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() =>
                                                            router.push(
                                                                `/chuc-vu/${chucVu.id}`,
                                                            )
                                                        }
                                                        className="p-1 text-blue-600 hover:text-blue-800 transition"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            router.push(
                                                                `/chuc-vu/${chucVu.id}/chinh-sua`,
                                                            )
                                                        }
                                                        className="p-1 text-green-600 hover:text-green-800 transition"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteChucVu(
                                                                chucVu.id,
                                                            )
                                                        }
                                                        className="p-1 text-red-600 hover:text-red-800 transition"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="p-1 text-gray-600 hover:text-gray-800 transition"
                                                        title="Thêm"
                                                    >
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Hiển thị 1-{filteredChucVus.length} của{" "}
                                {filteredChucVus.length} kết quả
                            </div>
                            <div className="flex items-center space-x-2">
                                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">
                                    1
                                </button>
                                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChucVuManagement;
