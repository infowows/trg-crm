"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Layers,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Filter,
    Download,
    Upload,
    RefreshCw,
    MoreHorizontal,
} from "lucide-react";

interface PhanLoaiHangHoa {
    id: string;
    ma_phan_loai: string;
    ten_phan_loai: string;
    mo_ta: string;
    phan_loai_cha: string;
    trang_thai: "active" | "inactive";
    ngay_tao: string;
    ngay_cap_nhat: string;
}

const PhanLoaiHangHoaManagement = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center mb-4">
                    <Layers className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Phân loại hàng hóa
                        </h1>
                        <p className="text-gray-600">
                            Quản lý phân loại hàng hóa dịch vụ
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() =>
                            router.push("/phan-loai-hang-hoa/tao-moi")
                        }
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Thêm phân loại
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
                        <Layers className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>Chưa có phân loại hàng hóa nào</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhanLoaiHangHoaManagement;
