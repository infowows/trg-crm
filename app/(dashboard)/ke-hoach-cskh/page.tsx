"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Calendar,
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
    Clock,
    CheckCircle,
    AlertCircle,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
} from "lucide-react";

interface KeHoachCSKH {
    id: string;
    ma_ke_hoach: string;
    ten_ke_hoach: string;
    khach_hang_id: string;
    khach_hang_ten: string;
    nhan_vien_phu_trach: string;
    loai_ke_hoach: "goi_dien" | "gap_mat" | "email" | "khac";
    trang_thai: "cho_thuc_hien" | "dang_thuc_hien" | "hoan_thanh" | "huy";
    ngay_ke_hoach: string;
    gio_ke_hoach: string;
    noi_dung: string;
    ket_qua?: string;
    ghi_chu?: string;
    ngay_tao: string;
    ngay_cap_nhat: string;
}

const KeHoachCSKHManagement = () => {
    const router = useRouter();
    const [keHoachs, setKeHoachs] = useState<KeHoachCSKH[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedKeHoachs, setSelectedKeHoachs] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        trang_thai: "",
        loai_ke_hoach: "",
        nhan_vien_phu_trach: "",
        tu_ngay: "",
        den_ngay: "",
    });

    useEffect(() => {
        const mockKeHoachs: KeHoachCSKH[] = [
            {
                id: "1",
                ma_ke_hoach: "KHT001",
                ten_ke_hoach: "Gọi điện chăm sóc khách hàng VIP",
                khach_hang_id: "1",
                khach_hang_ten: "Công ty Công nghệ ABC",
                nhan_vien_phu_trach: "Trần Thị B",
                loai_ke_hoach: "goi_dien",
                trang_thai: "cho_thuc_hien",
                ngay_ke_hoach: "2024-01-25",
                gio_ke_hoach: "10:00",
                noi_dung: "Chăm sóc khách hàng sau bán hàng, hỏi thăm满意度",
                ngay_tao: "2024-01-23",
                ngay_cap_nhat: "2024-01-23",
            },
        ];

        setTimeout(() => {
            setKeHoachs(mockKeHoachs);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredKeHoachs = keHoachs.filter((keHoach) => {
        const matchesSearch =
            keHoach.ten_ke_hoach
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            keHoach.khach_hang_ten
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

        return matchesSearch;
    });

    const getStatusBadge = (status: string) => {
        const styles = {
            cho_thuc_hien: "bg-yellow-100 text-yellow-800",
            dang_thuc_hien: "bg-blue-100 text-blue-800",
            hoan_thanh: "bg-green-100 text-green-800",
            huy: "bg-red-100 text-red-800",
        };
        const labels = {
            cho_thuc_hien: "Chờ thực hiện",
            dang_thuc_hien: "Đang thực hiện",
            hoan_thanh: "Hoàn thành",
            huy: "Hủy",
        };
        return (
            <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}
            >
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center mb-4">
                    <Calendar className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Kế hoạch CSKH
                        </h1>
                        <p className="text-gray-600">
                            Quản lý kế hoạch chăm sóc khách hàng
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => router.push("/ke-hoach-cskh/tao-moi")}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Tạo kế hoạch
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="p-6 text-center text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>Chưa có kế hoạch CSKH nào</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KeHoachCSKHManagement;
