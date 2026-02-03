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
  LayoutList,
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
        description: "Thống kê và báo cáo tổng quan hệ thống",
        groupName: "Trang chủ",
        color: "blue",
      },

      // Quản lý khách hàng
      {
        id: "customers",
        text: "Khách hàng",
        icon: Building,
        path: "/customers",
        description: "Quản lý thông tin và danh sách khách hàng",
        groupName: "Quản lý khách hàng",
        badge: stats.customers,
        color: "orange",
      },
      {
        id: "opportunities",
        text: "Cơ hội kinh doanh",
        icon: Target,
        path: "/opportunities",
        description: "Theo dõi các cơ hội và tiềm năng kinh doanh",
        groupName: "Quản lý khách hàng",
        color: "indigo",
      },
      {
        id: "customer_care",
        text: "Kế hoạch CSKH",
        icon: Handshake,
        path: "/customer-care",
        description: "Quản lý hoạt động và lịch sử chăm sóc khách hàng",
        groupName: "Quản lý khách hàng",
        badge: stats.customerCare,
        color: "pink",
      },
      {
        id: "customer_classifications",
        text: "Phân loại KH",
        icon: UserCheck,
        path: "/customer-classifications",
        description: "Phân loại khách hàng theo nhóm và tiêu chí",
        groupName: "Quản lý khách hàng",
        color: "teal",
      },
      {
        id: "customer_map",
        text: "Bản đồ KH",
        icon: Map,
        path: "/customer-map",
        description: "Xem vị trí khách hàng trên bản đồ trực quan",
        groupName: "Quản lý khách hàng",
        color: "cyan",
      },

      // Khảo sát & Báo giá
      {
        id: "surveys",
        text: "Khảo sát",
        icon: Map,
        path: "/surveys",
        description: "Quản lý các phiếu khảo sát hiện trường",
        groupName: "Khảo sát & Báo giá",
        color: "emerald",
      },
      {
        id: "quotations",
        text: "Báo giá",
        icon: FileText,
        path: "/quotations",
        description: "Lập và quản lý các báo giá dịch vụ",
        groupName: "Khảo sát & Báo giá",
        badge: stats.quotations,
        color: "blue",
      },

      // Hạng mục
      {
        id: "category_groups",
        text: "Nhóm hạng mục",
        icon: LayoutList,
        path: "/category-groups",
        description: "Quản lý các nhóm hạng mục chính",
        groupName: "Hạng mục",
        color: "amber",
      },
      {
        id: "category_items",
        text: "Hạng mục chi tiết",
        icon: ShoppingCart,
        path: "/category-items",
        description: "Quản lý chi tiết các hạng mục dịch vụ",
        groupName: "Hạng mục",
        color: "orange",
      },

      // Quản lý dịch vụ
      {
        id: "service_groups",
        text: "Nhóm dịch vụ",
        icon: Package,
        path: "/services/service-groups",
        description: "Phân loại danh sách dịch vụ theo nhóm",
        groupName: "Quản lý dịch vụ",
        color: "purple",
      },
      {
        id: "services",
        text: "Dịch vụ",
        icon: Package,
        path: "/services",
        description: "Quản lý danh sách dịch vụ chi tiết",
        groupName: "Quản lý dịch vụ",
        badge: stats.services,
        color: "cyan",
      },
      {
        id: "service_packages",
        text: "Gói dịch vụ",
        icon: Layers,
        path: "/services/service-packages",
        description: "Quản lý các gói dịch vụ tổng hợp",
        groupName: "Quản lý dịch vụ",
        color: "lime",
      },
      {
        id: "service_pricing",
        text: "Cài đặt giá",
        icon: DollarSign,
        path: "/services/price-settings",
        description: "Cấu hình bảng giá cho các dịch vụ",
        groupName: "Quản lý dịch vụ",
        color: "yellow",
      },

      // Hệ thống
      {
        id: "departments",
        text: "Phòng ban",
        icon: Building,
        path: "/departments",
        description: "Quản lý cơ cấu tổ chức phòng ban",
        groupName: "Hệ thống",
        color: "slate",
      },
      {
        id: "positions",
        text: "Chức vụ",
        icon: Briefcase,
        path: "/positions",
        description: "Quản lý các vị trí và chức vụ",
        groupName: "Hệ thống",
        color: "purple",
      },
      {
        id: "employees",
        text: "Nhân viên",
        icon: Users,
        path: "/employees",
        description: "Quản lý hồ sơ nhân viên trong hệ thống",
        groupName: "Hệ thống",
        badge: stats.employees,
        color: "green",
      },
      {
        id: "settings",
        text: "Cài đặt",
        icon: Settings,
        path: "/settings",
        description: "Cấu hình các tham số hệ thống",
        groupName: "Hệ thống",
        color: "gray",
      },

      // Khác
      {
        id: "source_settings",
        text: "Nguồn khách hàng",
        icon: Activity,
        path: "/source-settings",
        description: "Quản lý nguồn gốc tiếp cận khách hàng",
        groupName: "Khác",
        badge: stats.sourceSettings,
        color: "violet",
      },
      {
        id: "profile",
        text: "Hồ sơ cá nhân",
        icon: UserIcon,
        path: "/profile",
        description: "Cập nhật thông tin tài khoản cá nhân",
        groupName: "Khác",
        color: "blue",
      },
      {
        id: "user_guide",
        text: "Trợ giúp",
        icon: Book,
        path: "/user-guide",
        description: "Hướng dẫn sử dụng và hỗ trợ",
        groupName: "Khác",
        color: "rose",
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
      filtered = filtered.filter((item) => item.groupName === selectedGroup);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()),
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
    const colors: Record<string, { bg: string; text: string; hover: string }> =
      {
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
      <div className="bg-linear-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-8 mb-8 text-white relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-20%] left-[-5%] w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl"></div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between relative z-10">
          <div>
            <h1 className="text-4xl font-black mb-3 tracking-tight">
              TRG CRM Dashboard
            </h1>
            <p className="text-blue-100 text-lg font-medium opacity-90">
              Hệ thống quản lý khách hàng chuyên nghiệp & hiệu quả
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mt-8 lg:mt-0 grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-100 uppercase tracking-wider">
                    Khách hàng
                  </p>
                  <p className="text-3xl font-black text-white mt-1">
                    {stats.customers.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-100 uppercase tracking-wider">
                    Nhân viên
                  </p>
                  <p className="text-3xl font-black text-white mt-1">
                    {stats.employees.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-100 uppercase tracking-wider">
                    Báo giá
                  </p>
                  <p className="text-3xl font-black text-white mt-1">
                    {stats.quotations.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Search and Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-8">
        {/* Search and Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 text-black">
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
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-black"
          >
            <SlidersHorizontal className="w-5 h-5 mr-2" />
            Bộ lọc
          </button>

          <button
            onClick={toggleDisplayMode}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-black"
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
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => toggleGroupCollapse(group.name)}
                  className="w-full px-6 py-4 bg-linear-to-r from-gray-50 to-white border-b border-gray-100 flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></div>
                    <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">
                      {group.name}
                    </h2>
                  </div>
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
                        const colors = getColorClasses(item.color || "blue");
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNavigation(item.path)}
                            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group"
                          >
                            <div className="flex items-start space-x-3">
                              <div
                                className={`p-2 ${colors.bg} rounded-lg ${colors.hover} transition relative`}
                              >
                                <Icon className={`w-6 h-6 ${colors.text}`} />
                                {item.badge && item.badge > 0 && (
                                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {item.badge > 99 ? "99+" : item.badge}
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
                  const colors = getColorClasses(item.color || "blue");
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.path)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group"
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`p-2 ${colors.bg} rounded-lg ${colors.hover} transition relative`}
                        >
                          <Icon className={`w-6 h-6 ${colors.text}`} />
                          {item.badge && item.badge > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {item.badge > 99 ? "99+" : item.badge}
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
