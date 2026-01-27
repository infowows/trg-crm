"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
    Map,
    Filter,
    BarChart2,
    X,
    RefreshCw,
    Maximize2,
    MapPin,
    Flame,
} from "lucide-react";
import dynamic from "next/dynamic";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Dynamic import for map components to avoid SSR issues
const MapContainer = dynamic(() => import("@/components/map/MapContainer"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    ),
});

const FilterPanel = dynamic(() => import("@/components/map/FilterPanel"), {
    ssr: false,
});

const StatisticsPanel = dynamic(
    () => import("@/components/map/StatisticsPanel"),
    {
        ssr: false,
    },
);

const CustomerDetailModal = dynamic(
    () => import("@/components/map/CustomerDetailModal"),
    {
        ssr: false,
    },
);

interface Customer {
    _id: string;
    fullName: string;
    companyName?: string;
    address?: string;
    lat?: number;
    lng?: number;
    phone?: string;
    email?: string;
    source?: string;
    potentialLevel?: string;
    salesPerson?: string;
    status?: string;
    createdAt: string;
    updatedAt: string;
}

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

const CustomerMap = () => {
    // Ref to track if initial load has been done
    const hasLoadedRef = useRef(false);

    // Data states
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [sourceList, setSourceList] = useState<string[]>([]);

    // View states
    const [viewMode, setViewMode] = useState<"cluster" | "heatmap">("cluster");
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
        null,
    );
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);

    // Filter states
    const [filters, setFilters] = useState({
        sources: [] as string[],
        statuses: [] as string[],
        ratings: [] as string[],
        sales: [] as string[],
    });

    // Panel visibility
    const [showFilters, setShowFilters] = useState(true);
    const [showStatistics, setShowStatistics] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Map states
    const [mapCenter, setMapCenter] = useState({ lat: 10.8231, lng: 106.6297 });
    const [mapRef, setMapRef] = useState<any>(null);
    const [mapBounds, setMapBounds] = useState<any>(null);

    // Loading states
    const [loading, setLoading] = useState(false);
    const [statistics, setStatistics] = useState<Statistics>({
        total: 0,
        prospects: 0,
        customers: 0,
        highPotential: 0,
        totalRevenue: 0,
        bySource: {},
        bySales: {},
        byRating: [0, 0, 0, 0, 0],
    });

    // Handle window resize for mobile detection
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setShowFilters(false);
                setShowStatistics(false);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Load customer data
    const loadCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/customers");
            const data = await response.json();

            if (data.success) {
                // Filter customers with valid coordinates
                const withCoords = data.data.filter(
                    (c: Customer) =>
                        c.lat &&
                        c.lng &&
                        !isNaN(c.lat) &&
                        !isNaN(c.lng) &&
                        c.lat >= -90 &&
                        c.lat <= 90 &&
                        c.lng >= -180 &&
                        c.lng <= 180,
                );

                setCustomers(data.data);
                setFilteredCustomers(withCoords);

                // Calculate map center
                if (withCoords.length > 0) {
                    const center = {
                        lat:
                            withCoords.reduce(
                                (sum: number, c: Customer) => sum + c.lat!,
                                0,
                            ) / withCoords.length,
                        lng:
                            withCoords.reduce(
                                (sum: number, c: Customer) => sum + c.lng!,
                                0,
                            ) / withCoords.length,
                    };
                    setMapCenter(center);
                }

                // Show warning for customers without coordinates
                const withoutCoords = data.data.filter(
                    (c: Customer) =>
                        !c.lat || !c.lng || isNaN(c.lat) || isNaN(c.lng),
                );

                if (withoutCoords.length > 0) {
                    toast.warning(
                        `${withoutCoords.length} khách hàng chưa có tọa độ và không hiển thị trên bản đồ`,
                        { autoClose: 5000 },
                    );
                }

                toast.success(
                    `Đã tải ${withCoords.length} khách hàng lên bản đồ`,
                );
            } else {
                toast.error(data.message || "Không thể tải dữ liệu khách hàng");
            }
        } catch (error) {
            console.error("Error loading customers:", error);
            toast.error("Không thể tải dữ liệu khách hàng");
        } finally {
            setLoading(false);
        }
    }, []);

    // Load source list
    const loadSourceList = useCallback(async () => {
        try {
            const response = await fetch("/api/source-settings");
            const data = await response.json();

            if (data.success) {
                const sources = data.data.map((s: any) => s.name);
                setSourceList(sources);
            }
        } catch (error) {
            console.error("Error loading source list:", error);
        }
    }, []);

    // Initial load
    useEffect(() => {
        if (!hasLoadedRef.current) {
            hasLoadedRef.current = true;
            loadCustomers();
            loadSourceList();
        }
    }, [loadCustomers, loadSourceList]);

    // Apply filters
    const applyFilters = useCallback(() => {
        let result = customers.filter((c) => c.lat && c.lng);

        // Filter by sources
        if (filters.sources.length > 0) {
            result = result.filter((c) =>
                filters.sources.includes(c.source || ""),
            );
        }

        // Filter by statuses
        if (filters.statuses.length > 0) {
            result = result.filter((c) =>
                filters.statuses.includes(c.status || ""),
            );
        }

        // Filter by ratings
        if (filters.ratings.length > 0) {
            result = result.filter((c) =>
                filters.ratings.includes(c.potentialLevel || ""),
            );
        }

        // Filter by sales
        if (filters.sales.length > 0) {
            result = result.filter((c) =>
                filters.sales.includes(c.salesPerson || ""),
            );
        }

        setFilteredCustomers(result);
    }, [customers, filters]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    // Calculate statistics
    const calculateStatistics = useCallback(
        (customers: Customer[], bounds?: any) => {
            let inView = customers;

            // Filter by map bounds if available
            if (bounds && bounds.contains) {
                inView = customers.filter((c) => {
                    if (!c.lat || !c.lng) return false;
                    return bounds.contains([c.lat, c.lng]);
                });
            }

            const stats: Statistics = {
                total: inView.length,
                prospects: inView.filter((c) => c.status === "prospect").length,
                customers: inView.filter((c) => c.status === "customer").length,
                highPotential: inView.filter(
                    (c) => (c.potentialLevel || "").length >= 4,
                ).length,
                totalRevenue: 0, // Would need revenue field
                bySource: {},
                bySales: {},
                byRating: [0, 0, 0, 0, 0],
            };

            // Count by source
            inView.forEach((c) => {
                const source = c.source || "Khác";
                stats.bySource[source] = (stats.bySource[source] || 0) + 1;
            });

            // Count by sales
            inView.forEach((c) => {
                const sales = c.salesPerson || "Chưa phân công";
                stats.bySales[sales] = (stats.bySales[sales] || 0) + 1;
            });

            // Count by rating
            inView.forEach((c) => {
                const rating = (c.potentialLevel || "").length;
                if (rating > 0 && rating <= 5) {
                    stats.byRating[rating - 1]++;
                }
            });

            setStatistics(stats);
        },
        [],
    );

    // Handle map bounds change
    const handleBoundsChanged = useCallback(
        (bounds: any) => {
            setMapBounds(bounds);
            calculateStatistics(filteredCustomers, bounds);
        },
        [filteredCustomers, calculateStatistics],
    );

    // Handle marker click
    const handleMarkerClick = useCallback((customer: Customer) => {
        setSelectedCustomer(customer);
    }, []);

    // Handle view detail
    const handleViewDetail = useCallback((customer: Customer) => {
        setDetailCustomer(customer);
        setShowDetailModal(true);
        setSelectedCustomer(null);
    }, []);

    // Handle filter change
    const handleFilterChange = useCallback((newFilters: any) => {
        setFilters(newFilters);
    }, []);

    // Clear all filters
    const handleClearFilters = useCallback(() => {
        setFilters({
            sources: [],
            statuses: [],
            ratings: [],
            sales: [],
        });
    }, []);

    // Fit map to all markers
    const handleFitBounds = useCallback(() => {
        if (mapRef && filteredCustomers.length > 0) {
            // This would need to be implemented in the MapContainer
            if (mapRef.fitBounds) {
                const bounds = filteredCustomers.reduce(
                    (acc: any, customer: Customer) => {
                        if (customer.lat && customer.lng) {
                            acc.extend([customer.lat, customer.lng]);
                        }
                        return acc;
                    },
                    new (window as any).L.LatLngBounds(),
                );
                mapRef.fitBounds(bounds);
            }
        }
    }, [mapRef, filteredCustomers]);

    // Get unique sales list
    const salesList = useMemo(() => {
        return [
            ...new Set(customers.map((c) => c.salesPerson).filter(Boolean)),
        ] as string[];
    }, [customers]);

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/30">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Map className="h-6 w-6 text-amber-600" />
                        <h1 className="text-xl font-bold text-gray-800">
                            Bản Đồ Khách Hàng
                        </h1>
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full">
                            {filteredCustomers.length} khách hàng
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* View Mode Toggle */}
                        <div className="hidden md:flex gap-1 p-1 bg-gray-100 rounded-lg">
                            <button
                                onClick={() => setViewMode("cluster")}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                                    viewMode === "cluster"
                                        ? "bg-amber-500 text-white shadow"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                <MapPin className="h-4 w-4 inline mr-1" />
                                Cluster
                            </button>
                            <button
                                onClick={() => setViewMode("heatmap")}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                                    viewMode === "heatmap"
                                        ? "bg-amber-500 text-white shadow"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                <Flame className="h-4 w-4 inline mr-1" />
                                Heatmap
                            </button>
                        </div>

                        {/* Control Buttons */}
                        <button
                            onClick={handleFitBounds}
                            className="p-2 text-gray-600 hover:text-amber-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Zoom to fit all"
                        >
                            <Maximize2 className="h-5 w-5" />
                        </button>

                        <button
                            onClick={loadCustomers}
                            className="p-2 text-gray-600 hover:text-amber-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw
                                className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
                            />
                        </button>

                        {/* Mobile toggle buttons */}
                        {isMobile && (
                            <>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="p-2 text-gray-600 hover:text-amber-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <Filter className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() =>
                                        setShowStatistics(!showStatistics)
                                    }
                                    className="p-2 text-gray-600 hover:text-amber-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <BarChart2 className="h-5 w-5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Filter Panel - Desktop sidebar, Mobile drawer */}
                {!isMobile && showFilters && (
                    <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
                        <FilterPanel
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                            sourceList={sourceList}
                            salesList={salesList}
                            customerCount={filteredCustomers.length}
                        />
                    </div>
                )}

                {/* Mobile Filter Drawer */}
                {isMobile && (
                    <div
                        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 ${
                            showFilters ? "translate-x-0" : "-translate-x-full"
                        }`}
                    >
                        <div className="h-full flex flex-col">
                            <div className="flex items-center justify-between p-4 border-b">
                                <h2 className="text-lg font-bold">Bộ lọc</h2>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <FilterPanel
                                    filters={filters}
                                    onFilterChange={handleFilterChange}
                                    onClearFilters={handleClearFilters}
                                    sourceList={sourceList}
                                    salesList={salesList}
                                    customerCount={filteredCustomers.length}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Map Container */}
                <div className="flex-1 relative">
                    <MapContainer
                        customers={filteredCustomers}
                        viewMode={viewMode}
                        selectedCustomer={selectedCustomer}
                        onMarkerClick={handleMarkerClick}
                        onViewDetail={handleViewDetail}
                        onBoundsChanged={handleBoundsChanged}
                        setMapRef={setMapRef}
                        center={mapCenter}
                        loading={loading}
                    />
                </div>

                {/* Statistics Panel - Desktop sidebar, Mobile bottom sheet */}
                {!isMobile && showStatistics && (
                    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
                        <StatisticsPanel statistics={statistics} />
                    </div>
                )}

                {/* Mobile Statistics Bottom Sheet */}
                {isMobile && (
                    <div
                        className={`fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl transform transition-transform duration-300 ${
                            showStatistics
                                ? "translate-y-0"
                                : "translate-y-full"
                        }`}
                        style={{ maxHeight: "60vh" }}
                    >
                        <div className="h-full flex flex-col">
                            <div className="flex items-center justify-between p-4 border-b">
                                <h2 className="text-lg font-bold">Thống kê</h2>
                                <button
                                    onClick={() => setShowStatistics(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <StatisticsPanel statistics={statistics} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile overlay */}
                {isMobile && (showFilters || showStatistics) && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={() => {
                            setShowFilters(false);
                            setShowStatistics(false);
                        }}
                    />
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && detailCustomer && (
                <CustomerDetailModal
                    customer={detailCustomer}
                    onClose={() => {
                        setShowDetailModal(false);
                        setDetailCustomer(null);
                    }}
                />
            )}

            {/* Toast Container */}
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default CustomerMap;
