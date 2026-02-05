"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  User,
  Building,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Upload,
  FileDown,
} from "lucide-react";
import { toast } from "react-toastify";
import { generateQuotationTemplate } from "@/lib/excel/template-quotation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QuotationPDFTemplate from "@/components/QuotationPDFTemplate";
import { useReactToPrint } from "react-to-print";

interface NestedPackage {
  _id: string;
  packageName: string;
  servicePricing: number;
  totalPrice: number;
  isSelected: boolean;
  unit?: string;
  note?: string;
}

interface ServicePackage {
  _id: string;
  serviceGroup: string;
  service: string;
  volume: number;
  packages: NestedPackage[];
}

interface Quotation {
  _id: string;
  quotationNo: string;
  customer: string;
  customerRef?: string;
  date: string;
  validTo?: string;
  packages: ServicePackage[];
  totalAmount: number;
  taxAmount?: number;
  grandTotal: number;
  status: "draft" | "sent" | "approved" | "rejected" | "completed";
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const BaoGiaManagement = () => {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(
    null,
  );
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Survey Selection for Template
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [surveysList, setSurveysList] = useState<any[]>([]);
  const [surveySearch, setSurveySearch] = useState("");
  const [loadingSurveys, setLoadingSurveys] = useState(false);

  // Reference data for template
  const [refData, setRefData] = useState<{
    customers: any[];
    categoryGroups: any[];
    categoryItems: any[];
    serviceGroups: any[];
    services: any[];
    servicePackages: any[];
    pricing: any[];
  }>({
    customers: [],
    categoryGroups: [],
    categoryItems: [],
    serviceGroups: [],
    services: [],
    servicePackages: [],
    pricing: [],
  });

  const fetchRefData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [
        customersRes,
        catGroupsRes,
        catItemsRes,
        svcGroupsRes,
        servicesRes,
        svcPackagesRes,
        pricingRes,
      ] = await Promise.all([
        fetch("/api/customers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/category-groups?active=true", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/category-items?active=true", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/service-groups?active=true", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/services?active=true&limit=1000", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/service-packages?active=true", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/service-pricing?active=true&limit=1000", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [
        customers,
        catGroups,
        catItems,
        svcGroups,
        services,
        svcPackages,
        pricing,
      ] = await Promise.all([
        customersRes.json(),
        catGroupsRes.json(),
        catItemsRes.json(),
        svcGroupsRes.json(),
        servicesRes.json(),
        svcPackagesRes.json(),
        pricingRes.json(),
      ]);

      return {
        customers: customers.success ? customers.data : [],
        categoryGroups: catGroups.success ? catGroups.data : [],
        categoryItems: catItems.success ? catItems.data : [],
        serviceGroups: svcGroups.success ? svcGroups.data : [],
        services: services.success ? services.data : [],
        servicePackages: svcPackages.success ? svcPackages.data : [],
        pricing: pricing.success ? pricing.data : [],
      };
    } catch (error) {
      console.error("Error fetching ref data:", error);
      return null;
    }
  };

  const handleDownloadTemplate = async (selectedSurvey: any) => {
    toast.info(
      `Đang chuẩn bị file mẫu cho khảo sát ${selectedSurvey.surveyNo}...`,
    );
    const data = await fetchRefData();
    if (data) {
      const totalVolume = selectedSurvey.surveys.reduce(
        (sum: number, item: any) => sum + (item.volume || 0),
        0,
      );

      generateQuotationTemplate({
        customerName:
          selectedSurvey.customerName || "Vui lòng nhập tên khách hàng",
        survey: {
          surveyNo: selectedSurvey.surveyNo,
          surveyDate: new Date(selectedSurvey.surveyDate)
            .toISOString()
            .split("T")[0],
          surveyAddress: selectedSurvey.surveyAddress || "",
          items: selectedSurvey.surveys.map((s: any) => ({
            name: s.name,
            unit: s.unit,
            volume: s.volume,
          })),
          totalVolume: totalVolume,
        },
        customers: data.customers.map((c: any) => ({
          name: c.fullName,
          id: c._id,
        })),
        services: data.services.map((s: any) => ({
          serviceName: s.serviceName,
          serviceGroup: s.serviceGroup,
        })),
        packages: data.servicePackages.map((p: any) => p.packageName),
        pricing: data.pricing,
      });
      toast.success("Đã tải file mẫu thành công");
      setIsSurveyModalOpen(false);
    } else {
      toast.error("Không thể tải dữ liệu danh mục");
    }
  };

  const handleOpenSurveyModal = async () => {
    setIsSurveyModalOpen(true);
    setLoadingSurveys(true);
    try {
      const token = localStorage.getItem("token");
      // Fetch surveys that don't have quotation yet
      const res = await fetch("/api/surveys?hasQuotation=false&limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSurveysList(data.data);
      }
    } catch (error) {
      console.error("Error fetching surveys:", error);
    } finally {
      setLoadingSurveys(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/quotations/import", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        fetchQuotations(1, searchQuery, statusFilter);
      } else {
        toast.error(data.message || "Import không thành công");
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Có lỗi xảy ra trong quá trình import");
    } finally {
      setIsImporting(false);
      e.target.value = ""; // Reset
    }
  };

  // Fetch quotations
  const fetchQuotations = async (
    page: number = 1,
    search: string = "",
    status: string = "all",
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (search) params.append("search", search);
      if (status !== "all") params.append("status", status);

      const response = await fetch(`/api/quotations?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Không thể tải danh sách báo giá");
      }

      const data = await response.json();
      if (data.success) {
        setQuotations(data.data);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.pages);
        setCurrentPage(data.pagination.page);
      }
      console.log("data báo giá kèm chi tiết", data);
    } catch (err) {
      console.error("Error fetching quotations:", err);
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations(currentPage, searchQuery, statusFilter);
  }, [currentPage, searchQuery, statusFilter]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Handle status filter
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedQuotation) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/quotations/${selectedQuotation._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Xóa báo giá thành công");
        setShowDeleteModal(false);
        setSelectedQuotation(null);
        fetchQuotations(currentPage, searchQuery, statusFilter);
      } else {
        // Hiển thị thông báo từ API (không phải lỗi nếu là do trạng thái)
        toast.warning(data.message || "Không thể xóa báo giá");
        setShowDeleteModal(false);
      }
    } catch (err) {
      console.error("Error deleting quotation:", err);
      toast.error("Không thể xóa báo giá. Vui lòng thử lại.");
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: {
        color: "bg-gray-100 text-gray-800",
        icon: Clock,
        label: "Nháp",
      },
      sent: {
        color: "bg-blue-100 text-blue-800",
        icon: AlertCircle,
        label: "Đã gửi",
      },
      approved: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        label: "Đã duyệt",
      },
      rejected: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        label: "Từ chối",
      },
      completed: {
        color: "bg-purple-100 text-purple-800",
        icon: CheckCircle,
        label: "Hoàn thành",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
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

  // Format currency
  const formatCurrency = (amount?: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Handle Export PDF
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    // react-to-print v3 sử dụng contentRef thay vì content
    contentRef: componentRef,
    documentTitle: `BaoGia_${selectedQuotation?.quotationNo || "Export"}`,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách báo giá...</p>
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
            onClick={() =>
              fetchQuotations(currentPage, searchQuery, statusFilter)
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
            <span className="text-xs font-black uppercase tracking-[0.2em]">
              Hệ thống Quản lý
            </span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Hồ sơ{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
              Báo giá
            </span>
          </h1>
          <p className="text-gray-500 font-medium italic">
            Tổng số <span className="text-gray-900 font-black">{total}</span> hồ
            sơ báo giá đã được khởi tạo
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleOpenSurveyModal}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-100 text-gray-600 rounded-2xl font-black hover:border-blue-600 hover:text-blue-600 transition-all active:scale-95"
            title="Tải file mẫu dựa trên khảo sát hiện có"
          >
            <Download className="w-5 h-5" />
            Tải File mẫu
          </button>

          <label className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all cursor-pointer shadow-xl shadow-gray-100 active:scale-95">
            <Upload className="w-5 h-5" />
            {isImporting ? "Đang xử lý..." : "Import Excel"}
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleImport}
              className="hidden"
              disabled={isImporting}
            />
          </label>

          <button
            onClick={() => router.push("/quotations/create")}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Tạo Báo giá
          </button>
        </div>
      </div>

      {/* Tabs & Search Section */}
      <div className="mb-8 space-y-6">
        {/* Status Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto hide-scrollbar sticky top-0 bg-white/80 backdrop-blur-md z-20 pt-2">
          {[
            { id: "all", label: "Tất cả", icon: FileText },
            { id: "draft", label: "Bản nháp", icon: Clock },
            { id: "sent", label: "Đã gửi", icon: AlertCircle },
            { id: "approved", label: "Đã duyệt", icon: CheckCircle },
            { id: "rejected", label: "Từ chối", icon: XCircle },
            { id: "completed", label: "Hoàn thành", icon: CheckCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleStatusFilter(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-4 font-bold text-sm transition-all whitespace-nowrap ${
                  isActive
                    ? "border-blue-600 text-blue-600 bg-blue-50/30"
                    : "border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-200"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-gray-400"}`}
                />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative group max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã số, tên khách hàng hoặc địa chỉ..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-gray-900 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white">
        {quotations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
            <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6">
              <FileDown className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">
              {searchQuery || statusFilter !== "all"
                ? "Không tìm thấy kết quả"
                : "Chưa có dữ liệu báo giá"}
            </h3>
            <p className="text-gray-500 font-medium italic mb-8 text-center max-w-xs">
              {searchQuery || statusFilter !== "all"
                ? "Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn"
                : "Hãy tạo báo giá đầu tiên để bắt đầu hệ thống quản trị"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <button
                onClick={() => router.push("/quotations/create")}
                className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-xl active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Khởi tạo ngay
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-8 py-5 text-left text-[12px] text-gray-400 uppercase tracking-widest">
                        Hồ sơ
                      </th>
                      <th className="px-8 py-5 text-left text-[12px] text-gray-400 uppercase tracking-widest">
                        Khách hàng
                      </th>
                      <th className="px-8 py-5 text-left text-[12px] text-gray-400 uppercase tracking-widest">
                        Ngày lập
                      </th>
                      <th className="px-8 py-5 text-left text-[12px] text-gray-400 uppercase tracking-widest">
                        Giá trị (VND)
                      </th>
                      <th className="px-8 py-5 text-left text-[12px] text-gray-400 uppercase tracking-widest">
                        Trạng thái
                      </th>
                      <th className="px-8 py-5 text-right text-[12px] text-gray-400 uppercase tracking-widest">
                        Quản trị
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {quotations.map((quotation) => (
                      <tr
                        key={quotation._id}
                        className="group hover:bg-blue-50/30 transition-colors"
                      >
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                            {quotation.quotationNo}
                          </div>
                          {quotation.validTo && (
                            <div className="text-[10px] text-gray-400 font-bold mt-1">
                              Hết hạn: {formatDate(quotation.validTo)}
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors font-black text-xs">
                              {quotation.customer.charAt(0)}
                            </div>
                            <div className="text-sm font-bold text-gray-700">
                              {quotation.customer}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-600">
                            {formatDate(quotation.date)}
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-sm font-black text-gray-900 tracking-tight">
                            {formatCurrency(quotation.grandTotal)}
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          {getStatusBadge(quotation.status)}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-right text-sm">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                            <button
                              // onClick={() => {
                              //   setSelectedQuotation(quotation);
                              //   setShowViewModal(true);
                              // }}
                              // onclick mở id
                              onClick={() => router.push(`/quotations/${quotation._id}`)}
                              className="p-2.5 bg-white shadow-sm border border-gray-100 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                router.push(`/quotations/${quotation._id}/edit`)
                              }
                              className="p-2.5 bg-white shadow-sm border border-gray-100 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all active:scale-95"
                              title="Chỉnh sửa"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedQuotation(quotation);
                                setShowDeleteModal(true);
                              }}
                              className="p-2.5 bg-white shadow-sm border border-gray-100 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-95"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-10 py-8 bg-gray-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Trang <span className="text-gray-900">{currentPage}</span> /{" "}
                    {totalPages} (TỔNG {total} HỒ SƠ)
                  </div>

                  <nav className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (pageNum) =>
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            Math.abs(pageNum - currentPage) <= 1,
                        )
                        .map((pageNum, idx, arr) => {
                          const isCurrent = currentPage === pageNum;
                          const showEllipsis =
                            idx > 0 && pageNum - arr[idx - 1] > 1;

                          return (
                            <div
                              key={pageNum}
                              className="flex items-center gap-1"
                            >
                              {showEllipsis && (
                                <span className="px-2 text-gray-300 font-black">
                                  ...
                                </span>
                              )}
                              <button
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-10 h-10 rounded-xl font-black text-sm transition-all active:scale-90 ${
                                  isCurrent
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                              >
                                {pageNum}
                              </button>
                            </div>
                          );
                        })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </>
        )}
        {/* View Modal */}
        {showViewModal && selectedQuotation && (
          <div
            className="fixed inset-0 bg-black/80 transition z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowViewModal(false);
              setSelectedQuotation(null);
            }}
          >
            <div
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Chi tiết báo giá: {selectedQuotation.quotationNo}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Ngày báo giá: {formatDate(selectedQuotation.date)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Tạo bởi: {selectedQuotation.createdBy}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedQuotation(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Thông tin khách hàng
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center text-sm">
                        <Building className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-900 font-medium">
                          {selectedQuotation.customer}
                        </span>
                      </div>
                      {/* {selectedQuotation.customerRef && (
                        <div className="text-xs text-gray-500 ml-6">
                          Ref ID: {selectedQuotation.customerRef}
                        </div>
                      )} */}
                      <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                        <span className="text-gray-500">Trạng thái:</span>
                        {getStatusBadge(selectedQuotation.status)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Thông tin thanh toán
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tiền hàng:</span>
                        <span className="text-gray-900">
                          {formatCurrency(selectedQuotation.totalAmount)}
                        </span>
                      </div>
                      {/* <div className="flex justify-between text-sm">
                        <span className="text-gray-500">VAT:</span>
                        <span className="text-gray-900">
                          {formatCurrency(selectedQuotation.taxAmount)}
                        </span>
                      </div> */}
                      <div className="flex justify-between text-base font-bold text-blue-600 pt-2 border-t border-gray-200">
                        <span>Tổng cộng:</span>
                        <span>
                          {formatCurrency(selectedQuotation.grandTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Chi tiết dịch vụ
                  </h3>
                  {selectedQuotation.packages?.map((service, sIdx) => (
                    <div
                      key={sIdx}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="bg-gray-50 px-4 py-2 font-medium text-gray-900 border-b border-gray-200 flex justify-between">
                        <span>{service.service}</span>
                        <span className="text-sm text-gray-500 font-normal">
                          Nhóm: {service.serviceGroup}
                        </span>
                      </div>
                      <table className="w-full text-sm">
                        <thead className="bg-white border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-2 text-left text-gray-500">
                              Gói
                            </th>
                            <th className="px-4 py-2 text-right text-gray-500">
                              Khối lượng
                            </th>
                            <th className="px-4 py-2 text-right text-gray-500">
                              Đơn giá
                            </th>
                            <th className="px-4 py-2 text-right text-gray-500">
                              Thành tiền
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {service.packages?.map((pkg, pIdx) => (
                            <tr
                              key={pIdx}
                              className={pkg.isSelected ? "bg-blue-50/30" : ""}
                            >
                              <td className="px-4 py-2">
                                <div className="font-medium text-gray-900">
                                  {pkg.packageName}
                                </div>
                                {pkg.note && (
                                  <div className="text-xs text-gray-500">
                                    {pkg.note}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-2 text-right text-gray-700">
                                {service.volume.toLocaleString()}{" "}
                                {pkg.unit || ""}
                              </td>
                              <td className="px-4 py-2 text-right text-gray-700">
                                {formatCurrency(pkg.servicePricing)}
                              </td>
                              <td className="px-4 py-2 text-right font-medium text-gray-900">
                                {formatCurrency(pkg.totalPrice)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedQuotation(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                >
                  Đóng
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  <FileDown className="w-4 h-4" />
                  Xuất PDF
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    router.push(`/quotations/${selectedQuotation._id}/edit`);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Edit className="w-4 h-4" />
                  Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedQuotation && (
          <div
            className="fixed inset-0 bg-black/80 transition z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedQuotation(null);
            }}
          >
            <div
              className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                Xác nhận xóa báo giá
              </h3>
              <p className="text-center text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa báo giá{" "}
                <strong>{selectedQuotation.quotationNo}</strong>? Hành động này
                không thể hoàn tác.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedQuotation(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Survey Selection Modal */}
      {isSurveyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-blue-50 rounded-t-xl">
              <h2 className="text-xl font-bold text-blue-800">
                Chọn Khảo sát để lập Báo giá
              </h2>
              <button
                onClick={() => setIsSurveyModalOpen(false)}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm theo Mã KS, Địa chỉ hoặc Tên hạng mục..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={surveySearch}
                  onChange={(e) => setSurveySearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {loadingSurveys ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">
                    Đang tải danh sách khảo sát...
                  </p>
                </div>
              ) : surveysList.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  Không tìm thấy khảo sát nào chưa có báo giá.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {surveysList
                    .filter(
                      (s) =>
                        s.surveyNo
                          .toLowerCase()
                          .includes(surveySearch.toLowerCase()) ||
                        s.surveyAddress
                          ?.toLowerCase()
                          .includes(surveySearch.toLowerCase()),
                    )
                    .map((survey) => (
                      <button
                        key={survey._id}
                        onClick={() => handleDownloadTemplate(survey)}
                        className="flex flex-col p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left group"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-blue-700 group-hover:text-blue-800">
                            {survey.surveyNo}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(survey.surveyDate).toLocaleDateString(
                              "vi-VN",
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1 italic mb-2">
                          <Building className="w-3 h-3 inline mr-1" />
                          {survey.surveyAddress || "Không có địa chỉ"}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {survey.surveys
                            .slice(0, 3)
                            .map((item: any, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-gray-100 text-[10px] rounded text-gray-500"
                              >
                                {item.name}
                              </span>
                            ))}
                          {survey.surveys.length > 3 && (
                            <span className="text-[10px] text-gray-400">
                              +{survey.surveys.length - 3} khác
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end">
              <button
                onClick={() => setIsSurveyModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Hidden PDF Template Container */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
          visibility: "hidden",
        }}
      >
        {selectedQuotation && (
          <QuotationPDFTemplate
            ref={componentRef}
            quotation={selectedQuotation}
          />
        )}
      </div>
    </div>
  );
};

export default BaoGiaManagement;
