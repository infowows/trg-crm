"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Target,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  User,
  DollarSign,
  LayoutGrid,
  List,
  Headset,
} from "lucide-react";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";

const OpportunityModal = dynamic(
  () => import("@/components/OpportunityModal"),
  {
    ssr: false,
  },
);

interface Opportunity {
  _id: string;
  opportunityNo: string;
  customerRef: {
    _id: string;
    fullName: string;
    customerId: string;
    phone?: string;
    email?: string;
  };
  demands: string[];
  opportunityValue: number;
  probability: number;
  status: "Open" | "Closed" | "Lost";
  closingDate?: string;
  actualRevenue?: number;
  careHistory: any[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const OpportunityManagement = () => {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Tự động chuyển sang dạng lưới trên mobile khi load trang
  useEffect(() => {
    if (window.innerWidth < 768) {
      setViewMode("grid");
    }
  }, []);

  // Modal states
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const handleViewDetail = async (id: string) => {
    try {
      setModalLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/opportunities/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedOpportunity(data.data);
        setIsModalOpen(true);
      } else {
        toast.error("Không thể tải chi tiết cơ hội");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setModalLoading(false);
    }
  };

  const fetchOpportunities = async (page = 1, status = "all") => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (status !== "all") params.append("status", status);

      const response = await fetch(`/api/opportunities?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Không thể tải danh sách cơ hội");

      const data = await response.json();
      if (data.success) {
        setOpportunities(data.data);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.pages);
        setCurrentPage(data.pagination.page);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities(currentPage, statusFilter);
  }, [currentPage, statusFilter]);

  const getStatusBadge = (status: string) => {
    const configs = {
      Open: {
        color: "bg-blue-100 text-blue-800",
        label: "Đang mở",
        icon: Clock,
      },
      Closed: {
        color: "bg-green-100 text-green-800",
        label: "Thành công",
        icon: CheckCircle,
      },
      Lost: {
        color: "bg-red-100 text-red-800",
        label: "Thất bại",
        icon: AlertCircle,
      },
    };
    const config = configs[status as keyof typeof configs];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  if (loading && opportunities.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg mr-3">
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Quản lý cơ hội
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                Theo dõi và quản lý các cơ hội kinh doanh
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-between">
            <div className="flex items-center space-x-1 border border-gray-200 rounded-lg p-1 bg-gray-50">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                title="Dạng danh sách"
              >
                <List className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                title="Dạng lưới"
              >
                <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <button
              onClick={() => router.push("/opportunities/create")}
              className="flex-none flex items-center justify-center p-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-bold shadow-md shadow-blue-200"
            >
              <Plus className="w-5 h-5 sm:mr-2" />
              <span className="hidden sm:inline">Thêm cơ hội</span>
            </button>
          </div>
        </div>

        <div className="mt-4 sm:mt-6">
          <div className="flex flex-col space-y-1 max-w-xs">
            <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 flex items-center">
              <Filter className="w-3 h-3 mr-1" /> Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">Tất cả</option>
              <option value="Open">Đang mở</option>
              <option value="Closed">Thành công</option>
              <option value="Lost">Thất bại</option>
            </select>
          </div>
        </div>
      </div>

      <div
        className={`${viewMode === "list" ? "bg-white rounded-lg shadow-sm" : ""} overflow-hidden`}
      >
        {viewMode === "list" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Mã cơ hội
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Giá trị dự kiến
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Xác suất
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="sticky right-0 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase bg-gray-50 z-20 shadow-[-4px_0_4px_-2px_rgba(0,0,0,0.05)]">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {opportunities.map((opp) => (
                  <tr
                    key={opp._id}
                    className="hover:bg-gray-50 cursor-pointer group"
                    onClick={() => handleViewDetail(opp._id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {opp.opportunityNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {opp.customerRef?.fullName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {opp.customerRef?.customerId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {opp.opportunityValue.toLocaleString("vi-VN")}đ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${opp.probability}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-700">
                          {opp.probability}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(opp.status)}
                    </td>
                    <td className="sticky right-0 px-6 py-4 whitespace-nowrap text-right text-sm font-medium bg-white group-hover:bg-gray-50 transition-colors z-10 shadow-[-4px_0_4px_-2px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetail(opp._id);
                          }}
                          disabled={modalLoading}
                          className={`p-1 text-blue-600 hover:bg-blue-50 rounded ${modalLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/customer-care/create?opportunityId=${opp._id}`,
                            );
                          }}
                          className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                          title="Tạo CSKH"
                        >
                          <Headset className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/opportunities/${opp._id}/edit`);
                          }}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
            {opportunities.map((opp) => (
              <div
                key={opp._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 bottom-0 flex flex-col w-12 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={() => handleViewDetail(opp._id)}
                    className="flex-1 w-full flex items-center justify-center text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-none transition-colors"
                    title="Xem chi tiết"
                    disabled={modalLoading}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      router.push(
                        `/customer-care/create?opportunityId=${opp._id}`,
                      )
                    }
                    className="flex-1 w-full flex items-center justify-center text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-none transition-colors"
                    title="Tạo CSKH"
                  >
                    <Headset className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      router.push(`/opportunities/${opp._id}/edit`)
                    }
                    className="flex-1 w-full flex items-center justify-center text-green-700 bg-green-100 hover:bg-green-200 rounded-none transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center mb-4 pr-10">
                  <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div className="ml-3 overflow-hidden">
                    <h3 className="font-bold text-gray-900 truncate">
                      {opp.opportunityNo}
                    </h3>
                    <p className="text-xs text-blue-600 font-medium truncate">
                      {opp.opportunityValue.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-100 pr-10 lg:pr-0">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                    <span className="truncate">
                      {opp.customerRef?.fullName || "Chưa có tên khách hàng"}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                    <div className="flex-1 flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${opp.probability}%` }}
                        ></div>
                      </div>
                      <span className="text-xs">{opp.probability}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    {getStatusBadge(opp.status)}
                    <span className="text-xs text-gray-400">
                      {new Date(opp.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Trước
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * 10 + 1}
                  </span>{" "}
                  đến{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * 10, total)}
                  </span>{" "}
                  trong <span className="font-medium">{total}</span> kết quả
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      <OpportunityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        opportunity={selectedOpportunity}
        onEdit={(id) => router.push(`/opportunities/${id}/edit`)}
      />
    </div>
  );
};

export default OpportunityManagement;
