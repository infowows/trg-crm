"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Users,
  Building,
  Briefcase,
  User,
  FileText,
  Package,
  DollarSign,
  Calendar,
  Map,
  Book,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Settings,
  Wrench,
  Tag,
  Boxes,
  LayoutList,
  LayoutPanelLeft,
  LayoutPanelTop,
  PersonStanding,
  Layers,
  LayoutTemplate,
  Leaf,
  Lectern,
  Handshake,
  Birdhouse,
  HousePlug,
} from "lucide-react";

interface NavigationItem {
  id: string;
  text: string;
  icon: any;
  path: string;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    id: "dashboard",
    text: "Dashboard",
    icon: Home,
    path: "/",
  },
  {
    id: "system",
    text: "Hệ thống",
    icon: Settings,
    path: "/",
    children: [
      {
        id: "departments",
        text: "Phòng ban",
        icon: HousePlug,
        path: "/departments",
      },
      {
        id: "position",
        text: "Chức vụ",
        icon: Briefcase,
        path: "/positions",
      },
      {
        id: "employees",
        text: "Nhân viên",
        icon: User,
        path: "/employees",
      },
    ],
  },
  {
    id: "customers",
    text: "Khách hàng",
    icon: PersonStanding,
    path: "/",
    children: [
      {
        id: "customers",
        text: "Danh sách Khách hàng",
        icon: Users,
        path: "/customers",
      },
      {
        id: "customer-care",
        text: "Kế hoạch CSKH",
        icon: Handshake,
        path: "/customer-care",
      },
    ],
  },
  {
    id: "category",
    text: "Hạng mục",
    icon: Package,
    path: "/",
    children: [
      {
        id: "category",
        text: "Danh sách Hạng mục",
        // icon: LayoutTemplate,
        icon: LayoutList,
        path: "/category-groups",
      },
      {
        id: "category-item",
        text: "Danh sách Hạng mục chi tiết",
        icon: LayoutPanelTop,
        path: "/category-items",
      },
    ],
  },
  {
    id: "khao-sat-va-bao-gia",
    text: "Khảo sát & Báo giá",
    icon: Building,
    path: "/",
    children: [
      {
        id: "surveys",
        text: "Khảo sát",
        icon: Map,
        path: "/surveys",
      },
      {
        id: "quotations",
        text: "Báo giá",
        icon: FileText,
        path: "/quotations",
      },
    ],
  },

  // {
  //     id: "payments",
  //     text: "Thanh toán",
  //     icon: DollarSign,
  //     path: "/thanh-toan",
  //     children: [
  //         {
  //             id: "payment-schedule",
  //             text: "Lịch thanh toán",
  //             icon: Calendar,
  //             path: "/lich-thanh-toan",
  //         },
  //         {
  //             id: "payment-history",
  //             text: "Lịch sử thanh toán",
  //             icon: DollarSign,
  //             path: "/payment-history",
  //         },
  //         {
  //             id: "invoices",
  //             text: "Hóa đơn VAT",
  //             icon: FileText,
  //             path: "/vat-invoices",
  //         },
  //     ],
  // },
  {
    id: "services",
    text: "Quản lý dịch vụ",
    icon: Boxes,
    path: "/",
    children: [
      {
        id: "service-groups",
        text: "Nhóm dịch vụ",
        icon: Tag,
        path: "/services/service-groups",
      },
      {
        id: "service-list",
        text: "Dịch vụ",
        icon: Wrench,
        path: "/services",
      },
      {
        id: "service-packages",
        text: "Gói dịch vụ",
        // icon: Package,
        icon: Layers,
        path: "/services/service-packages",
      },
      {
        id: "service-pricing",
        text: "Cài đặt giá",
        icon: DollarSign,
        path: "/services/price-settings",
      },
    ],
  },
  {
    id: "profile",
    text: "Hồ sơ",
    icon: User,
    path: "/profile",
  },
  {
    id: "help",
    text: "Trợ giúp",
    icon: Book,
    path: "/user-guide",
  },
];

export default function Navigation() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(["system"]),
  );
  const [userData, setUserData] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
    // Get user data from localStorage
    const userDataStr = localStorage.getItem("userData");
    if (userDataStr) {
      setUserData(JSON.parse(userDataStr));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      // const newSet = new Set(prev);
      // if (newSet.has(itemId)) {
      //     newSet.delete(itemId);
      // } else {
      //     newSet.add(itemId);
      // }
      // return newSet;

      // If clicking on already expanded item, close it
      if (prev.has(itemId)) {
        return new Set();
      }
      // Otherwise, close all others and open this one
      return new Set([itemId]);
    });
  };

  const isActive = (path: string, isParent: boolean = false) => {
    if (isParent) {
      // For parent items, only show as active if we're on a child page (not exact match)
      return pathname !== path && pathname.startsWith(path + "/");
    }
    // For child items or items without children, check exact match or child pages
    return pathname === path || pathname.startsWith(path + "/");
  };

  // Special case for services menu - parent should NOT be active when on child pages
  const isServicesActive = (path: string) => {
    if (path === "/") {
      // Never active for this parent since it has path "/"
      return false;
    }
    return false;
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition"
        >
          {isSidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 left-0 z-50 w-70 h-screen bg-white shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto
        lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center p-6 border-b border-gray-200">
            <div className="flex items-center">
              {isMounted ? (
                <Image
                  src="/images/logo.png"
                  alt="Trường Giang CRM"
                  width={40}
                  height={40}
                  className="mr-3 rounded-lg"
                  priority
                  unoptimized
                />
              ) : (
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <Home className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Trường Giang CRM
                </h1>
                <p className="text-xs text-gray-500">Hệ thống quản lý CRM</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedItems.has(item.id);

                // Check if any child is active to determine parent active state
                const isAnyChildActive = item.children?.some((child) => {
                  if (child.id === "service-list") {
                    return (
                      pathname === "/services" ||
                      pathname.startsWith("/services/tao-moi")
                    );
                  }
                  return (
                    pathname === child.path ||
                    pathname.startsWith(child.path + "/")
                  );
                });

                const isParentActive = hasChildren
                  ? isAnyChildActive
                  : isActive(item.path);

                if (hasChildren) {
                  return (
                    <div key={item.id}>
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        className={`
                          w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300
                          ${
                            isParentActive
                              ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700 shadow-sm"
                              : "text-gray-700 hover:bg-gray-50"
                          }
                        `}
                      >
                        <div className="flex items-center overflow-hidden">
                          <Icon
                            className={`w-5 h-5 mr-3 transition-transform duration-300 ${
                              isParentActive ? "scale-125 transform" : ""
                            }`}
                          />
                          <span
                            className={`transition-all duration-300 ${
                              isParentActive
                                ? "text-[1.05rem] font-bold ml-1"
                                : ""
                            }`}
                          >
                            {item.text}
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-300 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isExpanded
                            ? "max-h-96 opacity-100 mt-1"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="ml-4 space-y-1 pl-2 border-l-2 border-gray-400">
                          {item.children!.map((child) => {
                            const ChildIcon = child.icon;
                            let isChildActive = false;

                            if (child.id === "service-list") {
                              isChildActive =
                                pathname === "/services" ||
                                pathname.startsWith("/services/tao-moi");
                            } else {
                              isChildActive =
                                pathname === child.path ||
                                pathname.startsWith(child.path + "/");
                            }

                            return (
                              <Link
                                key={child.id}
                                href={child.path}
                                className={`
                                  flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200
                                  ${
                                    isChildActive
                                      ? "bg-blue-100 text-blue-800 font-medium translate-x-1 shadow-sm"
                                      : "text-gray-600 hover:bg-gray-50 hover:translate-x-1"
                                  }
                                `}
                                onClick={() => setIsSidebarOpen(false)}
                              >
                                <ChildIcon
                                  className={`w-4 h-4 mr-3 transition-transform duration-200 ${
                                    isChildActive ? "scale-110" : ""
                                  }`}
                                />
                                {child.text}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    className={`
                      flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300
                      ${
                        isActive(item.path)
                          ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700 shadow-sm"
                          : "text-gray-700 hover:bg-gray-50"
                      }
                    `}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Icon
                      className={`w-5 h-5 mr-3 transition-transform duration-300 ${
                        isActive(item.path) ? "scale-125 transform" : ""
                      }`}
                    />
                    <span
                      className={`transition-all duration-300 ${
                        isActive(item.path)
                          ? "text-[1.05rem] font-bold ml-1"
                          : ""
                      }`}
                    >
                      {item.text}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-gray-200">
            {userData && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900">
                  {userData.ho_ten}
                </p>
                <p className="text-xs text-gray-500">{userData.chuc_vu}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}
