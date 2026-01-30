"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileCheck, Plus } from "lucide-react";

const HopDongManagement = () => {
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
                    <FileCheck className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Quản lý hợp đồng
                        </h1>
                        <p className="text-gray-600">
                            Quản lý hợp đồng dịch vụ
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => router.push("/contracts/tao-moi")}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Tạo hợp đồng
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="p-6 text-center text-gray-500">
                        <FileCheck className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>Chưa có hợp đồng nào</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HopDongManagement;

