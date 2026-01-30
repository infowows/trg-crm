"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, Plus } from "lucide-react";

const DeNghiThanhToanManagement = () => {
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
                    <DollarSign className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Đề nghị thanh toán
                        </h1>
                        <p className="text-gray-600">
                            Quản lý đề nghị thanh toán
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => router.push("/payment-requests/tao-moi")}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Tạo đề nghị
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="p-6 text-center text-gray-500">
                        <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>Chưa có đề nghị thanh toán nào</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeNghiThanhToanManagement;

