"use client";

import { useState } from "react";
import {
    Book,
    Search,
    FileText,
    Video,
    Download,
    ExternalLink,
    ChevronDown,
    ChevronRight,
    HelpCircle,
    Mail,
    Phone,
    MessageCircle,
} from "lucide-react";

interface GuideSection {
    id: string;
    title: string;
    description: string;
    icon: any;
    articles: GuideArticle[];
}

interface GuideArticle {
    id: string;
    title: string;
    description: string;
    category: string;
    readTime: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    link?: string;
}

const HuongDanSuDung = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set(["getting-started"]),
    );
    const [selectedCategory, setSelectedCategory] = useState("all");

    const guideSections: GuideSection[] = [
        {
            id: "getting-started",
            title: "Bắt đầu",
            description: "Hướng dẫn cơ bản cho người mới bắt đầu",
            icon: Book,
            articles: [
                {
                    id: "1",
                    title: "Giới thiệu về TRG CRM",
                    description: "Tổng quan về hệ thống và các tính năng chính",
                    category: "getting-started",
                    readTime: "5 phút",
                    difficulty: "beginner",
                },
                {
                    id: "2",
                    title: "Đăng nhập và thiết lập tài khoản",
                    description:
                        "Hướng dẫn đăng nhập và cấu hình tài khoản lần đầu",
                    category: "getting-started",
                    readTime: "3 phút",
                    difficulty: "beginner",
                },
                {
                    id: "3",
                    title: "Giao diện tổng quan",
                    description: "Tìm hiểu các thành phần chính của giao diện",
                    category: "getting-started",
                    readTime: "7 phút",
                    difficulty: "beginner",
                },
            ],
        },
        {
            id: "user-management",
            title: "Quản lý người dùng",
            description: "Hướng dẫn quản lý tài khoản và phân quyền",
            icon: FileText,
            articles: [
                {
                    id: "4",
                    title: "Tạo người dùng mới",
                    description: "Cách tạo và cấu hình tài khoản người dùng",
                    category: "user-management",
                    readTime: "4 phút",
                    difficulty: "intermediate",
                },
                {
                    id: "5",
                    title: "Phân quyền người dùng",
                    description: "Cấu hình quyền truy cập và vai trò",
                    category: "user-management",
                    readTime: "6 phút",
                    difficulty: "intermediate",
                },
                {
                    id: "6",
                    title: "Quản lý phòng ban và chức vụ",
                    description: "Tổ chức cấu trúc công ty trong hệ thống",
                    category: "user-management",
                    readTime: "5 phút",
                    difficulty: "intermediate",
                },
            ],
        },
        {
            id: "customer-management",
            title: "Quản lý khách hàng",
            description: "Hướng dẫn quản lý thông tin khách hàng",
            icon: FileText,
            articles: [
                {
                    id: "7",
                    title: "Thêm khách hàng mới",
                    description: "Cách nhập thông tin khách hàng vào hệ thống",
                    category: "customer-management",
                    readTime: "4 phút",
                    difficulty: "beginner",
                },
                {
                    id: "8",
                    title: "Quản lý thông tin khách hàng",
                    description: "Cập nhật và duy trì dữ liệu khách hàng",
                    category: "customer-management",
                    readTime: "6 phút",
                    difficulty: "beginner",
                },
                {
                    id: "9",
                    title: "Phân loại khách hàng",
                    description: "Phân nhóm và quản lý danh mục khách hàng",
                    category: "customer-management",
                    readTime: "5 phút",
                    difficulty: "intermediate",
                },
            ],
        },
        {
            id: "sales-management",
            title: "Quản lý bán hàng",
            description: "Hướng dẫn quản lý quy trình bán hàng",
            icon: FileText,
            articles: [
                {
                    id: "10",
                    title: "Tạo báo giá",
                    description: "Cách tạo và gửi báo giá cho khách hàng",
                    category: "sales-management",
                    readTime: "5 phút",
                    difficulty: "intermediate",
                },
                {
                    id: "11",
                    title: "Quản lý hợp đồng",
                    description: "Tạo và theo dõi hợp đồng dịch vụ",
                    category: "sales-management",
                    readTime: "7 phút",
                    difficulty: "intermediate",
                },
                {
                    id: "12",
                    title: "Quản lý thanh toán",
                    description: "Theo dõi và quản lý các khoản thanh toán",
                    category: "sales-management",
                    readTime: "6 phút",
                    difficulty: "advanced",
                },
            ],
        },
    ];

    const toggleSection = (sectionId: string) => {
        setExpandedSections((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(sectionId)) {
                newSet.delete(sectionId);
            } else {
                newSet.add(sectionId);
            }
            return newSet;
        });
    };

    const getDifficultyBadge = (difficulty: string) => {
        const styles = {
            beginner: "bg-green-100 text-green-800",
            intermediate: "bg-yellow-100 text-yellow-800",
            advanced: "bg-red-100 text-red-800",
        };
        const labels = {
            beginner: "Cơ bản",
            intermediate: "Trung cấp",
            advanced: "Nâng cao",
        };
        return (
            <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${styles[difficulty as keyof typeof styles]}`}
            >
                {labels[difficulty as keyof typeof labels]}
            </span>
        );
    };

    const filteredArticles = guideSections.flatMap((section) =>
        section.articles.filter((article) => {
            const matchesSearch =
                article.title
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                article.description
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());
            const matchesCategory =
                selectedCategory === "all" ||
                article.category === selectedCategory;
            return matchesSearch && matchesCategory;
        }),
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center mb-6">
                    <Book className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Hướng dẫn sử dụng
                        </h1>
                        <p className="text-gray-600">
                            Tài liệu hướng dẫn sử dụng hệ thống TRG CRM
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative max-w-2xl">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm hướng dẫn..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Danh mục
                        </h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => setSelectedCategory("all")}
                                className={`w-full text-left px-3 py-2 rounded-lg transition ${
                                    selectedCategory === "all"
                                        ? "bg-blue-50 text-blue-600 font-medium"
                                        : "text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                Tất cả
                            </button>
                            {guideSections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() =>
                                        setSelectedCategory(section.id)
                                    }
                                    className={`w-full text-left px-3 py-2 rounded-lg transition ${
                                        selectedCategory === section.id
                                            ? "bg-blue-50 text-blue-600 font-medium"
                                            : "text-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    {section.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Liên kết nhanh
                        </h3>
                        <div className="space-y-3">
                            <a
                                href="#"
                                className="flex items-center text-blue-600 hover:text-blue-800 transition"
                            >
                                <Video className="w-4 h-4 mr-2" />
                                Video hướng dẫn
                            </a>
                            <a
                                href="#"
                                className="flex items-center text-blue-600 hover:text-blue-800 transition"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Tải tài liệu PDF
                            </a>
                            <a
                                href="#"
                                className="flex items-center text-blue-600 hover:text-blue-800 transition"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    {searchQuery ? (
                        // Search results
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Kết quả tìm kiếm ({filteredArticles.length})
                            </h3>
                            <div className="space-y-4">
                                {filteredArticles.map((article) => (
                                    <div
                                        key={article.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-medium text-gray-900 mb-2">
                                                    {article.title}
                                                </h4>
                                                <p className="text-gray-600 mb-3">
                                                    {article.description}
                                                </p>
                                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                    <span>
                                                        Thời gian đọc:{" "}
                                                        {article.readTime}
                                                    </span>
                                                    {getDifficultyBadge(
                                                        article.difficulty,
                                                    )}
                                                </div>
                                            </div>
                                            <button className="ml-4 p-2 text-blue-600 hover:text-blue-800 transition">
                                                <ExternalLink className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        // Guide sections
                        <div className="space-y-6">
                            {guideSections.map((section) => {
                                const Icon = section.icon;
                                const isExpanded = expandedSections.has(
                                    section.id,
                                );

                                return (
                                    <div
                                        key={section.id}
                                        className="bg-white rounded-lg shadow-sm overflow-hidden"
                                    >
                                        <button
                                            onClick={() =>
                                                toggleSection(section.id)
                                            }
                                            className="w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 flex items-center justify-between hover:from-blue-100 hover:to-indigo-100 transition"
                                        >
                                            <div className="flex items-center">
                                                <Icon className="w-6 h-6 text-blue-600 mr-3" />
                                                <div className="text-left">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {section.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {section.description}
                                                    </p>
                                                </div>
                                            </div>
                                            {isExpanded ? (
                                                <ChevronDown className="w-5 h-5 text-gray-600" />
                                            ) : (
                                                <ChevronRight className="w-5 h-5 text-gray-600" />
                                            )}
                                        </button>

                                        {isExpanded && (
                                            <div className="p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {section.articles.map(
                                                        (article) => (
                                                            <div
                                                                key={article.id}
                                                                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
                                                            >
                                                                <div className="flex items-start justify-between mb-2">
                                                                    <h4 className="font-medium text-gray-900">
                                                                        {
                                                                            article.title
                                                                        }
                                                                    </h4>
                                                                    {getDifficultyBadge(
                                                                        article.difficulty,
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-gray-600 mb-3">
                                                                    {
                                                                        article.description
                                                                    }
                                                                </p>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs text-gray-500">
                                                                        Thời
                                                                        gian
                                                                        đọc:{" "}
                                                                        {
                                                                            article.readTime
                                                                        }
                                                                    </span>
                                                                    <button className="text-blue-600 hover:text-blue-800 transition text-sm font-medium">
                                                                        Đọc thêm
                                                                        →
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Support Section */}
            <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Cần hỗ trợ thêm?
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Nếu bạn không tìm thấy câu trả lời, hãy liên hệ với đội
                        ngũ hỗ trợ của chúng tôi
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                            <Mail className="w-5 h-5 mr-2" />
                            Email hỗ trợ
                        </button>
                        <button className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                            <Phone className="w-5 h-5 mr-2" />
                            Hotline: 1900-1234
                        </button>
                        <button className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                            <MessageCircle className="w-5 h-5 mr-2" />
                            Chat trực tuyến
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HuongDanSuDung;
