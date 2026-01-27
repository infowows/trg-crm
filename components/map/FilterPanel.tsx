"use client";

import { useState } from "react";
import { Filter, X, Check } from "lucide-react";

interface FilterPanelProps {
    filters: {
        sources: string[];
        statuses: string[];
        ratings: string[];
        sales: string[];
    };
    onFilterChange: (filters: any) => void;
    onClearFilters: () => void;
    sourceList: string[];
    salesList: string[];
    customerCount: number;
}

const FilterPanel = ({
    filters,
    onFilterChange,
    onClearFilters,
    sourceList,
    salesList,
    customerCount,
}: FilterPanelProps) => {
    const [expandedSections, setExpandedSections] = useState({
        sources: true,
        statuses: true,
        ratings: true,
        sales: true,
    });

    const toggleSection = (section: string) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section as keyof typeof prev],
        }));
    };

    const handleCheckboxChange = (
        category: string,
        value: string,
        checked: boolean,
    ) => {
        const newFilters = { ...filters };
        const currentValues = newFilters[
            category as keyof typeof newFilters
        ] as string[];

        if (checked) {
            newFilters[category as keyof typeof newFilters] = [
                ...currentValues,
                value,
            ];
        } else {
            newFilters[category as keyof typeof newFilters] =
                currentValues.filter((v) => v !== value);
        }

        onFilterChange(newFilters);
    };

    const hasActiveFilters = Object.values(filters).some(
        (arr) => arr.length > 0,
    );

    const statusOptions = [
        { value: "prospect", label: "Tiềm năng", color: "text-amber-600" },
        { value: "customer", label: "Khách hàng", color: "text-green-600" },
    ];

    const ratingOptions = [
        { value: "⭐", label: "1 sao" },
        { value: "⭐⭐", label: "2 sao" },
        { value: "⭐⭐⭐", label: "3 sao" },
        { value: "⭐⭐⭐⭐", label: "4 sao" },
        { value: "⭐⭐⭐⭐⭐", label: "5 sao" },
    ];

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Bộ lọc
                    </h2>
                    <Filter className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                        {customerCount} khách hàng
                    </span>
                    {hasActiveFilters && (
                        <button
                            onClick={onClearFilters}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Xóa tất cả
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Source Filter */}
                <div className="border border-gray-200 rounded-lg">
                    <button
                        onClick={() => toggleSection("sources")}
                        className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <span className="font-medium text-gray-900">
                            Nguồn khách hàng
                        </span>
                        <X
                            className={`w-4 h-4 text-gray-500 transform transition-transform ${
                                expandedSections.sources ? "rotate-45" : ""
                            }`}
                        />
                    </button>
                    {expandedSections.sources && (
                        <div className="px-3 pb-3 space-y-2">
                            {sourceList.map((source) => (
                                <label
                                    key={source}
                                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                                >
                                    <input
                                        type="checkbox"
                                        checked={filters.sources.includes(
                                            source,
                                        )}
                                        onChange={(e) =>
                                            handleCheckboxChange(
                                                "sources",
                                                source,
                                                e.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-gray-700">
                                        {source}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Status Filter */}
                <div className="border border-gray-200 rounded-lg">
                    <button
                        onClick={() => toggleSection("statuses")}
                        className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <span className="font-medium text-gray-900">
                            Trạng thái
                        </span>
                        <X
                            className={`w-4 h-4 text-gray-500 transform transition-transform ${
                                expandedSections.statuses ? "rotate-45" : ""
                            }`}
                        />
                    </button>
                    {expandedSections.statuses && (
                        <div className="px-3 pb-3 space-y-2">
                            {statusOptions.map((status) => (
                                <label
                                    key={status.value}
                                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                                >
                                    <input
                                        type="checkbox"
                                        checked={filters.statuses.includes(
                                            status.value,
                                        )}
                                        onChange={(e) =>
                                            handleCheckboxChange(
                                                "statuses",
                                                status.value,
                                                e.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className={`text-sm ${status.color}`}>
                                        {status.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Rating Filter */}
                <div className="border border-gray-200 rounded-lg">
                    <button
                        onClick={() => toggleSection("ratings")}
                        className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <span className="font-medium text-gray-900">
                            Đánh giá tiềm năng
                        </span>
                        <X
                            className={`w-4 h-4 text-gray-500 transform transition-transform ${
                                expandedSections.ratings ? "rotate-45" : ""
                            }`}
                        />
                    </button>
                    {expandedSections.ratings && (
                        <div className="px-3 pb-3 space-y-2">
                            {ratingOptions.map((rating) => (
                                <label
                                    key={rating.value}
                                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                                >
                                    <input
                                        type="checkbox"
                                        checked={filters.ratings.includes(
                                            rating.value,
                                        )}
                                        onChange={(e) =>
                                            handleCheckboxChange(
                                                "ratings",
                                                rating.value,
                                                e.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-gray-700">
                                        {rating.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sales Filter */}
                <div className="border border-gray-200 rounded-lg">
                    <button
                        onClick={() => toggleSection("sales")}
                        className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <span className="font-medium text-gray-900">
                            Sales phụ trách
                        </span>
                        <X
                            className={`w-4 h-4 text-gray-500 transform transition-transform ${
                                expandedSections.sales ? "rotate-45" : ""
                            }`}
                        />
                    </button>
                    {expandedSections.sales && (
                        <div className="px-3 pb-3 space-y-2">
                            {salesList.map((sales) => (
                                <label
                                    key={sales}
                                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                                >
                                    <input
                                        type="checkbox"
                                        checked={filters.sales.includes(
                                            sales || "",
                                        )}
                                        onChange={(e) =>
                                            handleCheckboxChange(
                                                "sales",
                                                sales || "",
                                                e.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-gray-700">
                                        {sales || "Chưa phân công"}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            {hasActiveFilters && (
                <div className="p-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500 mb-2">
                        Đang lọc:{" "}
                        {
                            Object.values(filters).filter(
                                (arr) => arr.length > 0,
                            ).length
                        }{" "}
                        bộ lọc
                    </div>
                    <button
                        onClick={onClearFilters}
                        className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                        Xóa tất cả bộ lọc
                    </button>
                </div>
            )}
        </div>
    );
};

export default FilterPanel;
