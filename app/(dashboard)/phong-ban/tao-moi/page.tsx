"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Building,
    ArrowLeft,
    Save,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Users,
} from "lucide-react";
import { toast } from "react-toastify";

interface User {
    _id: string;
    fullName: string;
    email: string;
    position?: string;
    department?: string;
    isActive: boolean;
}

const CreateDepartment = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [duplicateDepartment, setDuplicateDepartment] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        manager: "",
    });

    // Load users for manager selection
    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

            const response = await fetch("/api/employees", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                setUsers(data.data.filter((user: User) => user.isActive));
            } else {
                toast.error("Không thể tải danh sách nhân viên");
            }
        } catch (error) {
            console.error("Error loading users:", error);
            toast.error("Không thể tải danh sách nhân viên");
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            toast.error("Vui lòng nhập tên phòng ban");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

            const submitData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                manager: formData.manager || null, // Giờ là string fullName
            };

            const response = await fetch("/api/departments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(submitData),
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Tạo phòng ban thành công");
                router.push("/phong-ban");
            } else {
                // Kiểm tra nếu là lỗi trùng tên
                if (data.message && data.message.includes("đã tồn tại")) {
                    setDuplicateDepartment({
                        name: formData.name.trim(),
                        existingData: data.existingData || null,
                    });
                    setShowDuplicateModal(true);
                } else {
                    toast.error(data.message || "Không thể tạo phòng ban");
                }
            }
        } catch (error) {
            console.error("Error creating department:", error);
            toast.error("Không thể tạo phòng ban. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center">
                    <button
                        onClick={() => router.push("/phong-ban")}
                        className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center">
                        <Building className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Tạo phòng ban mới
                            </h1>
                            <p className="text-gray-600">
                                Thêm phòng ban mới vào hệ thống
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Thông tin cơ bản
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên phòng ban{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Nhập tên phòng ban"
                                        required
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Người quản lý
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <select
                                        name="manager"
                                        value={formData.manager}
                                        onChange={handleInputChange}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full appearance-none"
                                    >
                                        <option value="">
                                            Chọn người quản lý
                                        </option>
                                        {users.map((user) => (
                                            <option
                                                key={user._id}
                                                value={user.fullName}
                                            >
                                                {user.fullName} -{" "}
                                                {user.position || "Nhân viên"}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mô tả
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Nhập mô tả về phòng ban..."
                                rows={4}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full resize-none"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => router.push("/phong-ban")}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Lưu phòng ban
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Information */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <Building className="w-6 h-6 text-blue-600 mt-1" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                            Thông tin về phòng ban
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                            <ul className="list-disc list-inside space-y-1">
                                <li>
                                    Tên phòng ban là bắt buộc và phải duy nhất
                                </li>
                                <li>
                                    Người quản lý sẽ là người chịu trách nhiệm
                                    chính cho phòng ban
                                </li>
                                <li>
                                    Mô tả giúp nhân viên hiểu rõ về chức năng
                                    của phòng ban
                                </li>
                                <li>
                                    Phòng ban mới sẽ được đặt ở trạng thái "Hoạt
                                    động" theo mặc định
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal thông báo trùng tên phòng ban */}
            {showDuplicateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <Building className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Phòng ban đã tồn tại
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Tên phòng ban "{duplicateDepartment?.name}"
                                    đã được sử dụng
                                </p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-gray-600">
                                Vui lòng chọn tên khác cho phòng ban. Tên phòng
                                ban phải là duy nhất trong hệ thống.
                            </p>
                            {duplicateDepartment?.existingData && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">
                                        <strong>
                                            Thông tin phòng ban hiện tại:
                                        </strong>
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        • Tên:{" "}
                                        {duplicateDepartment.existingData.name}
                                    </p>
                                    {duplicateDepartment.existingData
                                        .manager && (
                                        <p className="text-xs text-gray-600">
                                            • Quản lý:{" "}
                                            {
                                                duplicateDepartment.existingData
                                                    .manager
                                            }
                                        </p>
                                    )}
                                    {duplicateDepartment.existingData
                                        .employeeCount !== undefined && (
                                        <p className="text-xs text-gray-600">
                                            • Số nhân viên:{" "}
                                            {
                                                duplicateDepartment.existingData
                                                    .employeeCount
                                            }
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowDuplicateModal(false);
                                    setDuplicateDepartment(null);
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            >
                                Đổi tên
                            </button>
                            <button
                                onClick={() => {
                                    setShowDuplicateModal(false);
                                    setDuplicateDepartment(null);
                                    // Focus vào input tên phòng ban
                                    const nameInput = document.querySelector(
                                        'input[name="name"]',
                                    ) as HTMLInputElement;
                                    if (nameInput) {
                                        nameInput.focus();
                                        nameInput.select();
                                    }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Chỉnh sửa tên
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateDepartment;
