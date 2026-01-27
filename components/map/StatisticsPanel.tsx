"use client";

import { BarChart2, Users, TrendingUp, Star, DollarSign } from "lucide-react";

interface Statistics {
    total: number;
    prospects: number;
    customers: number;
    highPotential: number;
    totalRevenue: number;
    bySource: Record<string, number>;
    bySales: Record<string, number>;
    byRating: number[];
}

interface StatisticsPanelProps {
    statistics: Statistics;
}

const StatisticsPanel = ({ statistics }: StatisticsPanelProps) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const getRatingLabel = (index: number) => {
        const stars = "⭐".repeat(index + 1);
        return `${stars} (${index + 1} sao)`;
    };

    const getTopItems = (items: Record<string, number>, limit: number = 5) => {
        return Object.entries(items)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                    <BarChart2 className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">
                        Thống kê
                    </h2>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Overview Cards */}
                <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">
                                    Tổng khách hàng
                                </span>
                            </div>
                            <span className="text-lg font-bold text-blue-900">
                                {statistics.total}
                            </span>
                        </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-900">
                                    Khách hàng
                                </span>
                            </div>
                            <span className="text-lg font-bold text-green-900">
                                {statistics.customers}
                            </span>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-amber-600" />
                                <span className="text-sm font-medium text-amber-900">
                                    Tiềm năng
                                </span>
                            </div>
                            <span className="text-lg font-bold text-amber-900">
                                {statistics.prospects}
                            </span>
                        </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Star className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium text-purple-900">
                                    Tiềm năng cao
                                </span>
                            </div>
                            <span className="text-lg font-bold text-purple-900">
                                {statistics.highPotential}
                            </span>
                        </div>
                    </div>

                    {statistics.totalRevenue > 0 && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <DollarSign className="w-4 h-4 text-emerald-600" />
                                    <span className="text-sm font-medium text-emerald-900">
                                        Doanh thu
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-emerald-900">
                                    {formatCurrency(statistics.totalRevenue)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* By Source */}
                {Object.keys(statistics.bySource).length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                            Theo nguồn
                        </h3>
                        <div className="space-y-2">
                            {getTopItems(statistics.bySource).map(
                                ([source, count]) => (
                                    <div
                                        key={source}
                                        className="flex items-center justify-between"
                                    >
                                        <span className="text-sm text-gray-600 truncate flex-1 mr-2">
                                            {source}
                                        </span>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{
                                                        width: `${(count / statistics.total) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 w-8 text-right">
                                                {count}
                                            </span>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                )}

                {/* By Sales */}
                {Object.keys(statistics.bySales).length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                            Theo Sales
                        </h3>
                        <div className="space-y-2">
                            {getTopItems(statistics.bySales).map(
                                ([sales, count]) => (
                                    <div
                                        key={sales}
                                        className="flex items-center justify-between"
                                    >
                                        <span className="text-sm text-gray-600 truncate flex-1 mr-2">
                                            {sales}
                                        </span>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-green-600 h-2 rounded-full"
                                                    style={{
                                                        width: `${(count / statistics.total) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 w-8 text-right">
                                                {count}
                                            </span>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                )}

                {/* By Rating */}
                {statistics.byRating.some((count) => count > 0) && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                            Theo đánh giá
                        </h3>
                        <div className="space-y-2">
                            {statistics.byRating.map(
                                (count, index) =>
                                    count > 0 && (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between"
                                        >
                                            <span className="text-sm text-gray-600">
                                                {getRatingLabel(index)}
                                            </span>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-amber-600 h-2 rounded-full"
                                                        style={{
                                                            width: `${(count / statistics.total) * 100}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-gray-900 w-8 text-right">
                                                    {count}
                                                </span>
                                            </div>
                                        </div>
                                    ),
                            )}
                        </div>
                    </div>
                )}

                {/* Conversion Rate */}
                {statistics.prospects > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">
                            Tỷ lệ chuyển đổi
                        </h3>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                Tiềm năng → Khách hàng
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                                {Math.round(
                                    (statistics.customers /
                                        (statistics.prospects +
                                            statistics.customers)) *
                                        100,
                                )}
                                %
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatisticsPanel;
