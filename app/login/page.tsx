"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    Eye,
    EyeOff,
    User,
    Lock,
    BarChart3,
    CheckCircle,
    Settings,
    FileText,
    ShoppingCart,
    TrendingUp,
    Package,
} from "lucide-react";

const LoginPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        // Kiểm tra nếu đã đăng nhập
        const token = localStorage.getItem("token");
        if (token) {
            const returnUrl = searchParams.get("returnUrl");
            router.push(returnUrl || "/dashboard");
            return;
        }

        // Tự động điền lại nếu đã lưu
        const remembered = localStorage.getItem("rememberedUser");
        if (remembered) {
            const { username, password } = JSON.parse(remembered);
            setFormData({ username, password });
            setRememberMe(true);
        }
    }, [router, searchParams]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                // Lưu token và thông tin user
                localStorage.setItem("token", data.token);
                localStorage.setItem("userData", JSON.stringify(data.user));

                // Lưu thông tin đăng nhập nếu chọn "Ghi nhớ"
                if (rememberMe) {
                    localStorage.setItem(
                        "rememberedUser",
                        JSON.stringify({
                            username: formData.username,
                            password: formData.password,
                        }),
                    );
                } else {
                    localStorage.removeItem("rememberedUser");
                }

                toast.success("Đăng nhập thành công!");

                const returnUrl = searchParams.get("returnUrl");
                router.push(returnUrl || "/dashboard");
            } else {
                toast.error(data.message || "Đăng nhập thất bại");
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const features = [
        {
            icon: BarChart3,
            title: "Dashboard",
            description: "Xem tổng quan hệ thống",
        },
        {
            icon: User,
            title: "Quản lý người dùng",
            description: "Phân quyền và quản lý tài khoản",
        },
        {
            icon: ShoppingCart,
            title: "Quản lý khách hàng",
            description: "Theo dõi thông tin khách hàng",
        },
        {
            icon: FileText,
            title: "Quản lý hợp đồng",
            description: "Tạo và quản lý hợp đồng",
        },
        {
            icon: Package,
            title: "Quản lý sản phẩm",
            description: "Danh mục hàng hóa dịch vụ",
        },
        {
            icon: TrendingUp,
            title: "Báo cáo",
            description: "Thống kê và báo cáo",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-6xl w-full flex flex-col lg:flex-row bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Left Panel - Features */}
                <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 lg:p-12 text-white">
                    <div className="mb-8">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-3">
                                <BarChart3 className="w-8 h-8 text-blue-600" />
                            </div>
                            <h1 className="text-2xl font-bold">TRG CRM</h1>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">
                            Hệ thống Quản lý Khách hàng
                        </h2>
                        <p className="text-blue-100">
                            Giải pháp toàn diện cho doanh nghiệp của bạn
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold mb-4">
                            Tính năng nổi bật:
                        </h3>
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-start space-x-3"
                            >
                                <feature.icon className="w-5 h-5 mt-1 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold">
                                        {feature.title}
                                    </h4>
                                    <p className="text-sm text-blue-100">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel - Login Form */}
                <div className="lg:w-1/2 p-8 lg:p-12">
                    <div className="max-w-md mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Đăng nhập
                            </h2>
                            <p className="text-gray-600">
                                Đăng nhập để tiếp tục sử dụng hệ thống
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Username Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên đăng nhập
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        required
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        placeholder="Nhập tên đăng nhập"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mật khẩu
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        placeholder="Nhập mật khẩu"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={rememberMe}
                                    onChange={(e) =>
                                        setRememberMe(e.target.checked)
                                    }
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor="remember"
                                    className="ml-2 block text-sm text-gray-700"
                                >
                                    Ghi nhớ đăng nhập
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Đang đăng nhập...
                                    </div>
                                ) : (
                                    "Đăng nhập"
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-500">
                                © 2024 TRG CRM. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
