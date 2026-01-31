"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Users,
    Save,
    X,
    ArrowLeft,
    Building,
    Briefcase,
    Mail,
    Phone,
    MapPin,
} from "lucide-react";

interface Department {
    _id: string;
    name: string;
    code: string;
    active: boolean;
}

interface Position {
    _id: string;
    positionName: string;
    code: string;
    active: boolean;
}

const CreateEmployee = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: "",
        position: "",
        phone: "",
        email: "",
        department: "",
        isActive: true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        fetchDepartments();
        fetchPositions();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await fetch(
                "/api/departments?isActive=true&limit=100",
            );
            const data = await response.json();
            if (data.success) {
                setDepartments(data.data);
            }
            // console.log(data.data);
        } catch (err) {
            console.error("Error fetching departments:", err);
        } finally {
            setDataLoading(false);
        }
    };

    const fetchPositions = async () => {
        try {
            const response = await fetch(
                "/api/positions?active=true&limit=100",
            );
            const data = await response.json();
            if (data.success) {
                setPositions(data.data);
            }
            console.log(data.data)
        } catch (err) {
            console.error("Error fetching positions:", err);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value, type } = e.target;
        const target = e.target as HTMLInputElement;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? target.checked : value,
        }));
    };

    const generateEmployeeId = () => {
        const prefix = "NV";
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, "0");
        const random = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, "0");
        return `${prefix}${year}${month}${random}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const employeeData = {
                ...formData,
                employeeId: generateEmployeeId(),
            };

            const response = await fetch("/api/employees", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(employeeData),
            });

            const data = await response.json();

            if (data.success) {
                router.push("/employees");
            } else {
                setError(data.message || "Không thể tạo nhân viên");
            }
        } catch (err) {
            setError("Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading) {
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
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={() => router.back()}
                                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center">
                                <Users className="w-8 h-8 text-blue-600 mr-3" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        Thêm nhân viên mới
                                    </h1>
                                    <p className="text-gray-600">
                                        Tạo thông tin nhân viên mới cho công ty
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Thông tin cơ bản */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Users className="w-5 h-5 mr-2 text-blue-600" />
                                        Thông tin cơ bản
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Họ và tên{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                placeholder="Nhập họ và tên đầy đủ"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Chức vụ{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <select
                                                name="position"
                                                value={formData.position}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            >
                                                <option value="">
                                                    -- Chọn chức vụ --
                                                </option>
                                                {positions.map((pos) => (
                                                    <option
                                                        key={pos._id}
                                                        value={pos.positionName}
                                                    >
                                                        {pos.positionName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phòng ban
                                            </label>
                                            <select
                                                name="department"
                                                value={formData.department}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            >
                                                <option value="">
                                                    -- Chọn phòng ban --
                                                </option>
                                                {departments.map((dept) => (
                                                    <option
                                                        key={dept._id}
                                                        value={dept.name}
                                                    >
                                                        {dept.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Thông tin liên hệ */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Phone className="w-5 h-5 mr-2 text-blue-600" />
                                        Thông tin liên hệ
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Số điện thoại
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                placeholder="Nhập số điện thoại"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                placeholder="nhập.email@congty.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cài đặt */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Building className="w-5 h-5 mr-2 text-blue-600" />
                                    Cài đặt
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="isActive"
                                                id="isActive"
                                                checked={formData.isActive}
                                                onChange={handleInputChange}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">
                                                Kích hoạt tài khoản nhân viên
                                            </span>
                                        </label>
                                        <p className="text-xs text-gray-500 mt-1 ml-6">
                                            Nhân viên đã kích hoạt sẽ có thể
                                            đăng nhập vào hệ thống
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    <X className="w-5 h-5 mr-2" />
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-5 h-5 mr-2" />
                                    {loading ? "Đang lưu..." : "Lưu nhân viên"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateEmployee;
