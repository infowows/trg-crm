"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Receipt } from "lucide-react";

const HoaDonVATManagement = () => {
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
                    <Receipt className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Hóa đơn VAT
                        </h1>
                        <p className="text-gray-600">Quản lý hóa đơn VAT</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="p-6 text-center text-gray-500">
                        <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>Chưa có hóa đơn VAT nào</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HoaDonVATManagement;
