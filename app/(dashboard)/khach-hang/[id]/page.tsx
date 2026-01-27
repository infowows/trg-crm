"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import {
    ArrowLeft,
    Save,
    User,
    Phone,
    Mail,
    MapPin,
    Building,
    Star,
    Calendar,
    Briefcase,
} from "lucide-react";

interface Customer {
    customerId: string;
    registrationDate?: Date;
    fullName: string;
    shortName?: string;
    address?: string;
    phone?: string;
    image?: string;
    source?: string;
    referrer?: string;
    referrerPhone?: string;
    serviceGroup?: string;
    marketingClassification?: string;
    potentialLevel?: string;
    salesPerson?: string;
    needsNote?: string;
    isActive: boolean;
    latitude?: number;
    longitude?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface SourceSetting {
    _id: string;
    name: string;
    description?: string;
    isActive: boolean;
}

interface Department {
    _id: string;
    name: string;
    description?: string;
    isActive: boolean;
}

interface User {
    _id: string;
    fullName: string;
    email: string;
    department?: string;
    isActive: boolean;
}

const CustomerUpdate = () => {
    const router = useRouter();
    const params = useParams();
    const customerId = Array.isArray(params.id) ? params.id[0] : params.id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sources, setSources] = useState<SourceSetting[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
    const [selectedSalesPersonId, setSelectedSalesPersonId] =
        useState<string>("");
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState({
        fullName: "",
        companyName: "",
        address: "",
        phone: "",
        email: "",
        source: "",
        potentialLevel: "",
        salesPerson: "",
        status: "prospect",
        lat: "",
        lng: "",
    });

    useEffect(() => {
        if (!customerId) {
            toast.error("ID khách hàng không hợp lệ");
            router.push("/khach-hang");
            return;
        }

        loadSources();
        loadDepartments();
        loadUsers("all");
        loadCustomer();
    }, [customerId]);

    const loadSources = async () => {
        try {
            const response = await fetch("/api/source-settings");
            const data = await response.json();
            if (data.success) {
                setSources(data.data.filter((s: SourceSetting) => s.isActive));
            }
        } catch (error) {
            console.error("Error loading sources:", error);
        }
    };

    const loadDepartments = async () => {
        try {
            const response = await fetch("/api/departments");
            const data = await response.json();
            if (data.success) {
                setDepartments(data.data);
            }
        } catch (error) {
            console.error("Error loading departments:", error);
        }
    };

    const loadUsers = async (departmentId: string) => {
        try {
            const url =
                departmentId === "all"
                    ? "/api/users"
                    : `/api/users?departmentId=${departmentId}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            console.error("Error loading users:", error);
        }
    };

    const loadCustomer = async () => {
        try {
            console.log("Loading customer with ID:", customerId);
            console.log("Customer ID type:", typeof customerId);

            const response = await fetch(`/api/customers/${customerId}`);
            const data = await response.json();

            console.log("API Response:", data);

            if (data.success) {
                const customerData = data.data;
                setCustomer(customerData);
                setFormData({
                    fullName: customerData.fullName || "",
                    companyName: customerData.companyName || "",
                    address: customerData.address || "",
                    phone: customerData.phone || "",
                    email: customerData.email || "",
                    source: customerData.source || "",
                    potentialLevel: customerData.potentialLevel || "",
                    salesPerson: customerData.salesPerson || "",
                    status: customerData.status || "prospect",
                    lat: customerData.lat?.toString() || "",
                    lng: customerData.lng?.toString() || "",
                });

                // Tìm và set selectedSalesPersonId dựa trên tên sales person
                if (customerData.salesPerson && users.length > 0) {
                    const matchingUser = users.find(
                        (user) => user.fullName === customerData.salesPerson,
                    );
                    if (matchingUser) {
                        setSelectedSalesPersonId(matchingUser._id);
                        // Nếu tìm thấy user, cũng set department của user đó
                        if (matchingUser.department) {
                            setSelectedDepartment(matchingUser.department);
                            await loadUsers(matchingUser.department);
                        }
                    }
                }
            } else {
                toast.error(
                    data.message || "Không thể tải thông tin khách hàng",
                );
                router.push("/khach-hang");
            }
        } catch (error) {
            console.error("Error loading customer:", error);
            toast.error("Không thể tải thông tin khách hàng");
            router.push("/khach-hang");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDepartmentChange = async (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const departmentId = e.target.value;
        setSelectedDepartment(departmentId);
        setSelectedSalesPersonId(""); // Reset sales person khi đổi department
        await loadUsers(departmentId);
    };

    const handleSalesPersonChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const salesPersonId = e.target.value;
        setSelectedSalesPersonId(salesPersonId);

        // Tìm user được chọn và cập nhật formData.salesPerson với tên
        const selectedUser = users.find((user) => user._id === salesPersonId);
        setFormData((prev) => ({
            ...prev,
            salesPerson: selectedUser ? selectedUser.fullName : "",
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fullName.trim()) {
            toast.error("Vui lòng nhập tên khách hàng");
            return;
        }

        setSaving(true);
        try {
            const submitData = {
                ...formData,
                lat: formData.lat ? parseFloat(formData.lat) : undefined,
                lng: formData.lng ? parseFloat(formData.lng) : undefined,
            };

            const response = await fetch(`/api/customers/${customerId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submitData),
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Cập nhật khách hàng thành công");
                router.push("/khach-hang");
            } else {
                toast.error(data.message || "Không thể cập nhật khách hàng");
            }
        } catch (error) {
            console.error("Error updating customer:", error);
            toast.error("Không thể cập nhật khách hàng");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">
                        Đang tải thông tin khách hàng...
                    </p>
                </div>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Không tìm thấy khách hàng</p>
                    <button
                        onClick={() => router.push("/khach-hang")}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center mb-4">
                        <button
                            onClick={() => router.push("/khach-hang")}
                            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <User className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Cập nhật khách hàng
                            </h1>
                            <p className="text-gray-600">
                                Chỉnh sửa thông tin khách hàng
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Thông tin cơ bản
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tên khách hàng{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="Nhập tên khách hàng"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tên công ty
                                    </label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="Nhập tên công ty"
                                    />
                                </div>

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
                                        placeholder="Nhập email"
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Địa chỉ
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="Nhập địa chỉ khách hàng"
                                />
                            </div>
                        </div>

                        {/* Business Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Thông tin kinh doanh
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nguồn khách hàng
                                    </label>
                                    <select
                                        name="source"
                                        value={formData.source}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    >
                                        <option value="">Chọn nguồn</option>
                                        {sources.map((source) => (
                                            <option
                                                key={source._id}
                                                value={source.name}
                                            >
                                                {source.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Trạng thái
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    >
                                        <option value="prospect">
                                            Tiềm năng
                                        </option>
                                        <option value="customer">
                                            Khách hàng
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Đánh giá tiềm năng
                                    </label>
                                    <select
                                        name="potentialLevel"
                                        value={formData.potentialLevel}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    >
                                        <option value="">Chọn đánh giá</option>
                                        <option value="⭐">1 sao</option>
                                        <option value="⭐⭐">2 sao</option>
                                        <option value="⭐⭐⭐">3 sao</option>
                                        <option value="⭐⭐⭐⭐">4 sao</option>
                                        <option value="⭐⭐⭐⭐⭐">
                                            5 sao
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phòng ban
                                    </label>
                                    <select
                                        value={selectedDepartment}
                                        onChange={handleDepartmentChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    >
                                        <option value="all">
                                            Tất cả phòng ban
                                        </option>
                                        {departments.map((dept) => (
                                            <option
                                                key={dept._id}
                                                value={dept._id}
                                            >
                                                {dept.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sales phụ trách
                                    </label>
                                    <select
                                        value={selectedSalesPersonId}
                                        onChange={handleSalesPersonChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        disabled={users.length === 0}
                                    >
                                        <option value="">Chọn nhân viên</option>
                                        {users.map((user) => (
                                            <option
                                                key={user._id}
                                                value={user._id}
                                            >
                                                {user.fullName}
                                            </option>
                                        ))}
                                    </select>
                                    {users.length === 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {selectedDepartment === "all"
                                                ? "Đang tải danh sách nhân viên..."
                                                : "Không có nhân viên trong phòng ban này"}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Vị trí
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Vĩ độ (Latitude)
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        name="lat"
                                        value={formData.lat}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="10.8231"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kinh độ (Longitude)
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        name="lng"
                                        value={formData.lng}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="106.6297"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-4 pt-6 border-t">
                            <button
                                type="button"
                                onClick={() => router.push("/khach-hang")}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Đang lưu...
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <Save className="w-4 h-4 mr-2" />
                                        Lưu thay đổi
                                    </div>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CustomerUpdate;
