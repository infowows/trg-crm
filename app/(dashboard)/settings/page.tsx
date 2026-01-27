"use client";

import { useState } from "react";
import { Settings } from "lucide-react";

const SettingsPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center mb-4">
                    <Settings className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Cài đặt hệ thống
                        </h1>
                        <p className="text-gray-600">
                            Quản lý cài đặt và cấu hình hệ thống
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chức năng đang phát triển
                </h3>
                <p className="text-gray-600">
                    Trang cài đặt hệ thống sẽ sớm có mặt
                </p>
            </div>
        </div>
    );
};

export default SettingsPage;
