"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    Search,
    SlidersHorizontal,
    Grid3X3,
    List,
    Users,
    Building,
    Briefcase,
    Map,
    Calendar,
    FileText,
    Package,
    Layers,
    DollarSign,
    Clock,
    Receipt,
    User as UserIcon,
    Book,
    Settings,
    TrendingUp,
    UserCheck,
    Handshake,
    ShoppingCart,
    Target,
    Phone,
    Mail,
    BarChart3,
    Activity,
    AlertCircle,
    CheckCircle,
} from "lucide-react";

interface DashboardStats {
    customers: number;
    employees: number;
    quotations: number;
    customerCare: number;
    services: number;
    sourceSettings: number;
}

interface MenuItem {
    id: string;
    text: string;
    icon: any;
    path: string;
    description: string;
    groupName: string;
    badge?: number;
    color?: string;
}

const Dashboard = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("all");
    const [displayMode, setDisplayMode] = useState(() =>
        typeof window !== "undefined"
            ? localStorage.getItem("menuDisplayMode") || "grouped"
            : "grouped",
    );
    const [showFilters, setShowFilters] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
        new Set(),
    );
    const [stats, setStats] = useState<DashboardStats>({
        customers: 0,
        employees: 0,
        quotations: 0,
        customerCare: 0,
        services: 0,
        sourceSettings: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch dashboard statistics
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    router.push("/login");
                    return;
                }

                const response = await fetch("/api/stats", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setStats(data.data);
                    }
                }
            } catch (err) {
                console.error("Error fetching stats:", err);
                setError("Không thể tải dữ liệu thống kê");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [router]);

    // Menu items theo đúng nghiệp vụ CRM
    const menuItems: MenuItem[] = useMemo(
        () => [
            // Dashboard
            {
                id: "dashboard",
                text: "Tổng quan",
                icon: BarChart3,
                path: "/dashboard",
                description: "Thống kê và báo cáo tổng quan",
                groupName: "Trang chủ",
                color: "blue",
            },

            // Quản lý nhân sự
            {
                id: "employees",
                text: "Nhân viên",
                icon: Users,
                path: "/employees",
                description: "Quản lý thông tin nhân viên",
                groupName: "Quản lý nhân sự",
                badge: stats.employees,
                color: "green",
            },
            {
                id: "positions",
                text: "Chức vụ",
                icon: Briefcase,
                path: "/chuc-vu",
                description: "Quản lý chức vụ và phòng ban",
                groupName: "Quản lý nhân sự",
                color: "purple",
            },

            // Quản lý khách hàng
            {
                id: "customers",
                text: "Khách hàng",
                icon: Building,
                path: "/khach-hang",
                description: "Quản lý thông tin khách hàng",
                groupName: "Quản lý khách hàng",
                badge: stats.customers,
                color: "orange",
            },
            {
                id: "customer_classifications",
                text: "Phân loại KH",
                icon: Target,
                path: "/customer-classifications",
                description: "Phân loại khách hàng theo tiềm năng",
                groupName: "Quản lý khách hàng",
                color: "indigo",
            },
            {
                id: "customer_care",
                text: "Chăm sóc KH",
                icon: Handshake,
                path: "/customer-care",
                description: "Quản lý hoạt động chăm sóc khách hàng",
                groupName: "Quản lý khách hàng",
                badge: stats.customerCare,
                color: "pink",
            },
            {
                id: "customer_map",
                text: "Bản đồ KH",
                icon: Map,
                path: "/customer-map",
                description: "Xem khách hàng trên bản đồ",
                groupName: "Quản lý khách hàng",
                color: "teal",
            },

            // Quản lý dịch vụ
            {
                id: "services",
                text: "Dịch vụ",
                icon: Package,
                path: "/services",
                description: "Quản lý danh mục dịch vụ",
                groupName: "Quản lý dịch vụ",
                badge: stats.services,
                color: "cyan",
            },
            {
                id: "service_packages",
                text: "Gói dịch vụ",
                icon: Layers,
                path: "/services/goi-dich-vu",
                description: "Quản lý các gói dịch vụ",
                groupName: "Quản lý dịch vụ",
                color: "lime",
            },
            {
                id: "service_pricing",
                text: "Cài đặt giá",
                icon: DollarSign,
                path: "/services/cai-dat-gia",
                description: "Quản lý bảng giá gói dịch vụ",
                groupName: "Quản lý dịch vụ",
                color: "yellow",
            },
            {
                id: "category_items",
                text: "Hạng mục",
                icon: ShoppingCart,
                path: "/category-items",
                description: "Quản lý hạng mục chi tiết",
                groupName: "Quản lý dịch vụ",
                color: "amber",
            },
            // {
            //     id: "material_groups",
            //     text: "Nhóm vật tư",
            //     icon: Package,
            //     path: "/material-groups",
            //     description: "Quản lý nhóm vật tư",
            //     groupName: "Quản lý dịch vụ",
            //     color: "emerald",
            // },
            // {
            //     id: "care_types",
            //     text: "Loại CSKH",
            //     icon: UserCheck,
            //     path: "/care-types",
            //     description: "Quản lý các loại hình chăm sóc",
            //     groupName: "Quản lý dịch vụ",
            //     color: "rose",
            // },

            // Báo giá và Hợp đồng
            {
                id: "quotations",
                text: "Báo giá",
                icon: FileText,
                path: "/bao-gia",
                description: "Quản lý báo giá dịch vụ",
                groupName: "Báo giá & Hợp đồng",
                badge: stats.quotations,
                color: "blue",
            },

            // Nguồn khách hàng
            {
                id: "source_settings",
                text: "Nguồn KH",
                icon: Activity,
                path: "/source-settings",
                description: "Quản lý các kênh tiếp cận khách hàng",
                groupName: "Marketing",
                badge: stats.sourceSettings,
                color: "violet",
            },

            // Hệ thống
            {
                id: "profile",
                text: "Hồ sơ cá nhân",
                icon: UserIcon,
                path: "/profile",
                description: "Quản lý thông tin cá nhân",
                groupName: "Hệ thống",
                color: "gray",
            },
            {
                id: "settings",
                text: "Cài đặt",
                icon: Settings,
                path: "/settings",
                description: "Cài đặt hệ thống",
                groupName: "Hệ thống",
                color: "slate",
            },
        ],
        [stats],
    );

    // Lấy danh sách các nhóm
    const groups = useMemo(() => {
        const uniqueGroups = Array.from(
            new Set(menuItems.map((item) => item.groupName)),
        );
        return uniqueGroups.map((groupName) => ({
            name: groupName,
            items: menuItems.filter((item) => item.groupName === groupName),
        }));
    }, [menuItems]);

    // Filter items
    const filteredItems = useMemo(() => {
        let filtered = menuItems;

        if (selectedGroup !== "all") {
            filtered = filtered.filter(
                (item) => item.groupName === selectedGroup,
            );
        }

        if (searchQuery) {
            filtered = filtered.filter(
                (item) =>
                    item.text
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    item.description
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()),
            );
        }

        return filtered;
    }, [searchQuery, selectedGroup, menuItems]);

    // Toggle group collapse
    const toggleGroupCollapse = (groupName: string) => {
        setCollapsedGroups((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(groupName)) {
                newSet.delete(groupName);
            } else {
                newSet.add(groupName);
            }
            return newSet;
        });
    };

    // Handle navigation
    const handleNavigation = (path: string) => {
        setIsNavigating(true);
        router.push(path);
    };

    // Toggle display mode
    const toggleDisplayMode = () => {
        const newMode = displayMode === "grouped" ? "list" : "grouped";
        setDisplayMode(newMode);
        if (typeof window !== "undefined") {
            localStorage.setItem("menuDisplayMode", newMode);
        }
    };

    // Get color classes
    const getColorClasses = (color: string) => {
        const colors: Record<
            string,
            { bg: string; text: string; hover: string }
        > = {
            blue: {
                bg: "bg-blue-50",
                text: "text-blue-600",
                hover: "hover:bg-blue-100",
            },
            green: {
                bg: "bg-green-50",
                text: "text-green-600",
                hover: "hover:bg-green-100",
            },
            orange: {
                bg: "bg-orange-50",
                text: "text-orange-600",
                hover: "hover:bg-orange-100",
            },
            purple: {
                bg: "bg-purple-50",
                text: "text-purple-600",
                hover: "hover:bg-purple-100",
            },
            pink: {
                bg: "bg-pink-50",
                text: "text-pink-600",
                hover: "hover:bg-pink-100",
            },
            teal: {
                bg: "bg-teal-50",
                text: "text-teal-600",
                hover: "hover:bg-teal-100",
            },
            cyan: {
                bg: "bg-cyan-50",
                text: "text-cyan-600",
                hover: "hover:bg-cyan-100",
            },
            lime: {
                bg: "bg-lime-50",
                text: "text-lime-600",
                hover: "hover:bg-lime-100",
            },
            yellow: {
                bg: "bg-yellow-50",
                text: "text-yellow-600",
                hover: "hover:bg-yellow-100",
            },
            amber: {
                bg: "bg-amber-50",
                text: "text-amber-600",
                hover: "hover:bg-amber-100",
            },
            emerald: {
                bg: "bg-emerald-50",
                text: "text-emerald-600",
                hover: "hover:bg-emerald-100",
            },
            rose: {
                bg: "bg-rose-50",
                text: "text-rose-600",
                hover: "hover:bg-rose-100",
            },
            indigo: {
                bg: "bg-indigo-50",
                text: "text-indigo-600",
                hover: "hover:bg-indigo-100",
            },
            violet: {
                bg: "bg-violet-50",
                text: "text-violet-600",
                hover: "hover:bg-violet-100",
            },
            gray: {
                bg: "bg-gray-50",
                text: "text-gray-600",
                hover: "hover:bg-gray-100",
            },
            slate: {
                bg: "bg-slate-50",
                text: "text-slate-600",
                hover: "hover:bg-slate-100",
            },
        };
        return colors[color] || colors.blue;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 p-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            TRG CRM Dashboard
                        </h1>
                        <p className="text-gray-600">
                            Chào mừng trở lại! Quản lý hệ thống CRM của bạn.
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="mt-4 lg:mt-0 grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <Building className="w-8 h-8 text-blue-600 mr-3" />
                                <div>
                                    <p className="text-sm text-blue-600">
                                        Khách hàng
                                    </p>
                                    <p className="text-2xl font-bold text-blue-900">
                                        {stats.customers}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <Users className="w-8 h-8 text-green-600 mr-3" />
                                <div>
                                    <p className="text-sm text-green-600">
                                        Nhân viên
                                    </p>
                                    <p className="text-2xl font-bold text-green-900">
                                        {stats.employees}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <FileText className="w-8 h-8 text-purple-600 mr-3" />
                                <div>
                                    <p className="text-sm text-purple-600">
                                        Báo giá
                                    </p>
                                    <p className="text-2xl font-bold text-purple-900">
                                        {stats.quotations}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm chức năng..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full"
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                        <SlidersHorizontal className="w-5 h-5 mr-2" />
                        Bộ lọc
                    </button>

                    <button
                        onClick={toggleDisplayMode}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                        {displayMode === "grouped" ? (
                            <List className="w-5 h-5 mr-2" />
                        ) : (
                            <Grid3X3 className="w-5 h-5 mr-2" />
                        )}
                        {displayMode === "grouped" ? "Nhóm" : "Danh sách"}
                    </button>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedGroup("all")}
                                className={`px-4 py-2 rounded-lg transition ${
                                    selectedGroup === "all"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                Tất cả
                            </button>
                            {groups.map((group) => (
                                <button
                                    key={group.name}
                                    onClick={() => setSelectedGroup(group.name)}
                                    className={`px-4 py-2 rounded-lg transition ${
                                        selectedGroup === group.name
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    {group.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="grid gap-6">
                {displayMode === "grouped" ? (
                    // Grouped view
                    groups.map((group) => {
                        const groupItems = filteredItems.filter(
                            (item) => item.groupName === group.name,
                        );
                        if (groupItems.length === 0) return null;

                        const isCollapsed = collapsedGroups.has(group.name);

                        return (
                            <div
                                key={group.name}
                                className="bg-white rounded-lg shadow-sm overflow-hidden"
                            >
                                <button
                                    onClick={() =>
                                        toggleGroupCollapse(group.name)
                                    }
                                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 flex items-center justify-between hover:from-blue-100 hover:to-indigo-100 transition"
                                >
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {group.name}
                                    </h2>
                                    {isCollapsed ? (
                                        <ArrowRight className="w-5 h-5 text-gray-600" />
                                    ) : (
                                        <ArrowRight className="w-5 h-5 text-gray-600 rotate-90" />
                                    )}
                                </button>

                                {!isCollapsed && (
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {groupItems.map((item) => {
                                                const Icon = item.icon;
                                                const colors = getColorClasses(
                                                    item.color || "blue",
                                                );
                                                return (
                                                    <button
                                                        key={item.id}
                                                        onClick={() =>
                                                            handleNavigation(
                                                                item.path,
                                                            )
                                                        }
                                                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group"
                                                    >
                                                        <div className="flex items-start space-x-3">
                                                            <div
                                                                className={`p-2 ${colors.bg} rounded-lg ${colors.hover} transition relative`}
                                                            >
                                                                <Icon
                                                                    className={`w-6 h-6 ${colors.text}`}
                                                                />
                                                                {item.badge &&
                                                                    item.badge >
                                                                        0 && (
                                                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                                            {item.badge >
                                                                            99
                                                                                ? "99+"
                                                                                : item.badge}
                                                                        </span>
                                                                    )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3
                                                                    className={`font-medium text-gray-900 group-hover:${colors.text} transition`}
                                                                >
                                                                    {item.text}
                                                                </h3>
                                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                                    {
                                                                        item.description
                                                                    }
                                                                </p>
                                                            </div>
                                                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition" />
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    // List view
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredItems.map((item) => {
                                    const Icon = item.icon;
                                    const colors = getColorClasses(
                                        item.color || "blue",
                                    );
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() =>
                                                handleNavigation(item.path)
                                            }
                                            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group"
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div
                                                    className={`p-2 ${colors.bg} rounded-lg ${colors.hover} transition relative`}
                                                >
                                                    <Icon
                                                        className={`w-6 h-6 ${colors.text}`}
                                                    />
                                                    {item.badge &&
                                                        item.badge > 0 && (
                                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                                {item.badge > 99
                                                                    ? "99+"
                                                                    : item.badge}
                                                            </span>
                                                        )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3
                                                        className={`font-medium text-gray-900 group-hover:${colors.text} transition`}
                                                    >
                                                        {item.text}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                        {item.description}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        {item.groupName}
                                                    </p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition" />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {filteredItems.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <Search className="w-12 h-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Không tìm thấy chức năng
                        </h3>
                        <p className="text-gray-600">
                            {searchQuery
                                ? `Không có kết quả cho "${searchQuery}"`
                                : "Không có chức năng nào trong nhóm được chọn"}
                        </p>
                    </div>
                )}
            </div>

            {/* Loading overlay */}
            {isNavigating && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span>Đang chuyển trang...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
