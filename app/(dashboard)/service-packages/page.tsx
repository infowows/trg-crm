"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layers, Plus, Search, Edit, Trash2, Eye } from "lucide-react";

const ServicePackageManagement = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center mb-4 lg:mb-0">
                        <Layers className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Gói dịch vụ
                            </h1>
                            <p className="text-gray-600">
                                Quản lý các gói dịch vụ kết hợp
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() =>
                            router.push("/dashboard/service-packages/tao-moi")
                        }
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Thêm gói dịch vụ
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Layers className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chức năng đang phát triển
                </h3>
                <p className="text-gray-600">
                    Trang quản lý gói dịch vụ sẽ sớm có mặt
                </p>
            </div>
        </div>
    );
};

export default ServicePackageManagement;
