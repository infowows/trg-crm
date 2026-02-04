"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  ChevronLeft,
  ChevronRight,
  Building,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Upload,
  X,
  FileSpreadsheet,
  LayoutGrid,
  List,
} from "lucide-react";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import { generateCustomerTemplate } from "@/lib/excel/template-Customer";
import { exportCustomerData } from "@/lib/excel/export-Customer";

const CustomerModal = dynamic(() => import("@/components/CustomerModal"), {
  ssr: false,
});

interface Customer {
  _id: string;
  customerId: string;
  fullName: string;
  shortName?: string;
  address?: string;
  phone?: string;
  email?: string;
  image?: string;
  source?: string;
  referrer?: string;
  referrerPhone?: string;
  potentialLevel?: string;
  salesPerson?: string;
  needsNote?: string;
  firstContractValue?: number;
  trueCustomerDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const KhachHangManagement = () => {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [serviceGroups, setServiceGroups] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [potentialFilter, setPotentialFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal states
  const [modalCustomer, setModalCustomer] = useState<Customer | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "delete">("view");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Tự động chuyển sang dạng lưới trên mobile khi load trang
  useEffect(() => {
    if (window.innerWidth < 768) {
      setViewMode("grid");
    }
  }, []);

  // Fetch customers
  const fetchCustomers = async (
    page: number = 1,
    search: string = "",
    status: string = "all",
    potential: string = "all",
    source: string = "all",
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
      if (status !== "all") params.append("isActive", status);
      if (potential !== "all") params.append("potentialLevel", potential);
      if (source !== "all") params.append("source", source);

      const response = await fetch(`/api/customers?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Không thể tải danh sách khách hàng");
      }

      const data = await response.json();
      if (data.success) {
        setCustomers(data.data);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.pages);
        setCurrentPage(data.pagination.page);
      }
      console.log(data.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // Fetch reference data
  const fetchReferenceData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch sources
      const sourcesRes = await fetch(
        "/api/source-settings?isActive=true&limit=100",
      );
      const sourcesData = await sourcesRes.json();
      if (sourcesData.success) setSources(sourcesData.data);

      // Fetch service groups
      const serviceGroupsRes = await fetch(
        "/api/service-groups?status=active&limit=100",
      );
      const serviceGroupsData = await serviceGroupsRes.json();
      if (serviceGroupsData.success) setServiceGroups(serviceGroupsData.data);

      // Fetch employees
      const employeesRes = await fetch("/api/employees?active=true&limit=200", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const employeesData = await employeesRes.json();
      if (employeesData.success) setEmployees(employeesData.data);
    } catch (err) {
      console.error("Error fetching reference data:", err);
    }
  };

  useEffect(() => {
    fetchCustomers(
      currentPage,
      searchQuery,
      statusFilter,
      potentialFilter,
      sourceFilter,
    );
    fetchReferenceData();
  }, [currentPage, searchQuery, statusFilter, potentialFilter, sourceFilter]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Handle filters
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePotentialFilter = (potential: string) => {
    setPotentialFilter(potential);
    setCurrentPage(1);
  };

  const handleSourceFilter = (source: string) => {
    setSourceFilter(source);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Modal handlers
  const handleViewCustomer = (customer: Customer) => {
    setModalCustomer(customer);
    setModalMode("view");
  };

  const handleEditCustomer = (customer: Customer) => {
    router.push(`/customers/${customer._id}`);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setModalCustomer(customer);
    setModalMode("delete");
  };

  const handleModalClose = () => {
    setModalCustomer(null);
  };

  const handleConfirmDelete = async (customerId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Xóa khách hàng thành công");
        fetchCustomers(
          currentPage,
          searchQuery,
          statusFilter,
          potentialFilter,
          sourceFilter,
        );
      } else {
        toast.error(data.message || "Không thể xóa khách hàng");
      }
    } catch (err) {
      console.error("Error deleting customer:", err);
      toast.error("Không thể xóa khách hàng. Vui lòng thử lại.");
    }
  };

  // Handle delete (legacy - keep for compatibility)
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchCustomers(
          currentPage,
          searchQuery,
          statusFilter,
          potentialFilter,
          sourceFilter,
        );
      } else {
        throw new Error("Không thể xóa khách hàng");
      }
    } catch (err) {
      console.error("Error deleting customer:", err);
      alert("Không thể xóa khách hàng. Vui lòng thử lại.");
    }
  };

  // Handle file upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error("Vui lòng chọn file Excel (.xlsx hoặc .xls)");
        return;
      }
      setUploadFile(file);
    }
  };

  const handleUploadFile = async () => {
    if (!uploadFile) {
      toast.error("Vui lòng chọn file để upload");
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", uploadFile);

      const response = await fetch("/api/customers/import", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Import thành công ${data.imported || 0} khách hàng`);
        setShowUploadModal(false);
        setUploadFile(null);
        fetchCustomers(
          currentPage,
          searchQuery,
          statusFilter,
          potentialFilter,
          sourceFilter,
        );
      } else {
        toast.error(data.message || "Không thể import file");
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      toast.error("Không thể upload file. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      toast.info("Đang khởi tạo file mẫu...");

      // Chuẩn bị dữ liệu cho dropdown
      const options = {
        sources: sources.map((s: any) => s.name),
        serviceGroups: serviceGroups.map((s: any) => s.name),
        employees: employees.map((e: any) => e.fullName),
      };

      await generateCustomerTemplate(options);
      toast.success("Đã tải file mẫu thành công");
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Không thể tải file mẫu. Vui lòng thử lại.");
    }
  };

  const handleExportExcel = async () => {
    try {
      toast.info("Đang chuẩn bị dữ liệu xuất...");
      const token = localStorage.getItem("token");

      // Lấy dữ liệu dựa trên bộ lọc hiện tại nhưng không giới hạn page
      const params = new URLSearchParams({
        page: "1",
        limit: "10000",
      });

      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("isActive", statusFilter);
      if (potentialFilter !== "all")
        params.append("potentialLevel", potentialFilter);
      if (sourceFilter !== "all") params.append("source", sourceFilter);

      const response = await fetch(`/api/customers?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        await exportCustomerData(data.data);
        toast.success("Xuất file Excel thành công");
      } else {
        toast.error("Không thể lấy dữ liệu khách hàng");
      }
    } catch (error) {
      console.error("Export Excel error:", error);
      toast.error("Có lỗi xảy ra khi xuất file");
    }
  };

  // Get potential level badge
  const getPotentialBadge = (level?: string) => {
    const levelConfig: Record<string, { color: string; icon: any }> = {
      "Ngắn hạn": { color: "bg-green-100 text-green-800", icon: TrendingUp },
      "Trung hạn": { color: "bg-blue-100 text-blue-800", icon: Clock },
      "Dài hạn": { color: "bg-purple-100 text-purple-800", icon: Calendar },
      "Không phù hợp": {
        color: "bg-gray-100 text-gray-800",
        icon: AlertCircle,
      },
    };

    // Chuẩn hóa level để so khớp (vì có thể sai khác hoa thường)
    const normalizedLevel = level?.trim();
    let config = levelConfig[normalizedLevel || ""];

    // Fallsback cho "Không phù hợp" nếu có sai khác viết hoa
    if (!config && normalizedLevel?.toLowerCase() === "không phù hợp") {
      config = levelConfig["Không phù hợp"];
    }

    if (!config)
      return level ? (
        <span className="text-sm text-gray-500">{level}</span>
      ) : null;

    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {level}
      </span>
    );
  };

  // Get status badge
  const getStatusBadge = (isActive: boolean) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {isActive ? (
          <>
            <CheckCircle className="w-3 h-3 mr-1" />
            Hoạt động
          </>
        ) : (
          <>
            <AlertCircle className="w-3 h-3 mr-1" />
            Không hoạt động
          </>
        )}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách khách hàng...</p>
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
              fetchCustomers(
                currentPage,
                searchQuery,
                statusFilter,
                potentialFilter,
                sourceFilter,
              )
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
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg mr-3">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Quản lý khách hàng
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                Quản lý thông tin khách hàng tiềm năng và hiện tại
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
              onClick={handleExportExcel}
              className="flex-1 sm:flex-none flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
              title="Xuất danh sách hiện tại ra file Excel"
            >
              <FileSpreadsheet className="w-4 h-4 sm:mr-2" />
              <span className="ml-1 sm:ml-0 hidden xs:inline">Xuất Excel</span>
              <span className="xs:hidden ml-1">Xuất</span>
            </button>

            <button
              onClick={() => setShowUploadModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
            >
              <Upload className="w-4 h-4 sm:mr-2" />
              <span className="ml-1 sm:ml-0 hidden xs:inline">
                Import từ Excel
              </span>
              <span className="xs:hidden ml-1">Import</span>
            </button>

            <button
              onClick={() => router.push("/customers/create")}
              className="flex-none flex items-center justify-center p-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-bold shadow-md shadow-blue-200"
            >
              <Plus className="w-5 h-5 sm:mr-2" />
              <span className="hidden sm:inline">Thêm khách hàng</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 sm:mt-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full text-sm"
            />
          </div>

          {/* Filter selects */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 flex items-center">
                <Filter className="w-3 h-3 mr-1" /> Trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">Tất cả</option>
                <option value="true">Hoạt động</option>
                <option value="false">Không hoạt động</option>
              </select>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">
                Tiềm năng
              </label>
              <select
                value={potentialFilter}
                onChange={(e) => handlePotentialFilter(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">Tất cả</option>
                <option value="Ngắn hạn">Ngắn hạn</option>
                <option value="Trung hạn">Trung hạn</option>
                <option value="Dài hạn">Dài hạn</option>
                <option value="Không phù hợp">Không phù hợp</option>
              </select>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">
                Nguồn khách
              </label>
              <select
                value={sourceFilter}
                onChange={(e) => handleSourceFilter(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">Tất cả</option>
                {sources.map((source) => (
                  <option key={source._id} value={source.name}>
                    {source.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Content */}
      <div
        className={`${viewMode === "list" ? "bg-white rounded-lg shadow-sm" : ""} overflow-hidden`}
      >
        {customers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ||
              statusFilter !== "all" ||
              potentialFilter !== "all" ||
              sourceFilter !== "all"
                ? "Không tìm thấy khách hàng"
                : "Chưa có khách hàng nào"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ||
              statusFilter !== "all" ||
              potentialFilter !== "all" ||
              sourceFilter !== "all"
                ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                : "Thêm khách hàng đầu tiên để bắt đầu quản lý"}
            </p>
            {!searchQuery &&
              statusFilter === "all" &&
              potentialFilter === "all" &&
              sourceFilter === "all" && (
                <button
                  onClick={() => router.push("/customers/create")}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mx-auto"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Thêm khách hàng đầu tiên
                </button>
              )}
          </div>
        ) : (
          <>
            {viewMode === "list" ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Khách hàng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thông tin liên hệ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nguồn & Tiềm năng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nhân viên phụ trách
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Khách hàng thực
                      </th>
                      <th className="sticky right-0 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-20 shadow-[-4px_0_4px_-2px_rgba(0,0,0,0.05)]">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customers.map((customer) => (
                      <tr
                        key={customer._id}
                        className="hover:bg-gray-50 cursor-pointer group"
                        onClick={() => handleViewCustomer(customer)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {customer.image ? (
                              <img
                                className="w-10 h-10 object-cover mr-3 rounded-full"
                                src={customer.image}
                                alt={customer.fullName || ""}
                              />
                            ) : (
                              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mr-3 font-bold">
                                {customer.fullName?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900 max-w-[200px] truncate">
                                {customer.fullName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {customer.customerId}
                                {/* {customer.shortName &&
                                  ` • ${customer.shortName}`} */}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {customer.phone && (
                              <div className="flex items-center text-sm text-gray-900">
                                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                {customer.phone}
                              </div>
                            )}
                            {customer.email && (
                              <div className="flex items-center text-sm text-gray-900">
                                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                {customer.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            {customer.source && (
                              <div className="text-sm text-gray-900">
                                <span className="font-medium">Nguồn:</span>{" "}
                                {customer.source}
                              </div>
                            )}
                            {getPotentialBadge(customer.potentialLevel)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            {customer.salesPerson || "Chưa phân công"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            {getStatusBadge(customer.isActive)}
                            {customer.trueCustomerDate && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Khách thật:{" "}
                                {formatDate(customer.trueCustomerDate)}
                              </span>
                            )}
                            {customer.firstContractValue !== undefined &&
                              customer.firstContractValue > 0 && (
                                <span className="text-xs font-semibold text-blue-600">
                                  HĐ đầu:{" "}
                                  {customer.firstContractValue.toLocaleString(
                                    "vi-VN",
                                  )}
                                  đ
                                </span>
                              )}
                          </div>
                        </td>
                        <td className="sticky right-0 px-6 py-4 whitespace-nowrap text-right text-sm font-medium bg-white group-hover:bg-gray-50 transition-colors z-10 shadow-[-4px_0_4px_-2px_rgba(0,0,0,0.05)]">
                          <div className="flex items-center justify-end space-x-2">
                            {/* <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewCustomer(customer);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </button> */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/opportunities/create?customer=${customer._id}`,
                                );
                              }}
                              className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                              title="Tạo cơ hội"
                            >
                              <TrendingUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditCustomer(customer);
                              }}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Chỉnh sửa"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCustomer(customer);
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
                {customers.map((customer) => (
                  <div
                    key={customer._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all relative group overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 bottom-0 flex flex-col w-12 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={() => handleViewCustomer(customer)}
                        className="flex-1 w-full flex items-center justify-center text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-none transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          router.push(
                            `/opportunities/create?customer=${customer._id}`,
                          )
                        }
                        className="flex-1 w-full flex items-center justify-center text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-none transition-colors"
                        title="Tạo cơ hội"
                      >
                        <TrendingUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditCustomer(customer)}
                        className="flex-1 w-full flex items-center justify-center text-green-700 bg-green-100 hover:bg-green-200 rounded-none transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer)}
                        className="flex-1 w-full flex items-center justify-center text-red-700 bg-red-100 hover:bg-red-200 rounded-none transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center mb-4">
                      {customer.image ? (
                        <img
                          className="w-14 h-14 object-cover rounded-xl"
                          src={customer.image}
                          alt={customer.fullName || ""}
                        />
                      ) : (
                        <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-sm">
                          {customer.fullName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="ml-4">
                        <h3 className="font-bold text-gray-900 line-clamp-1">
                          {customer.fullName}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                          {customer.customerId}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      {customer.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-blue-500 mr-2 shrink-0" />
                          <span className="truncate">{customer.phone}</span>
                        </div>
                      )}
                      {customer.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-indigo-500 mr-2 shrink-0" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                      )}
                      {customer.salesPerson && (
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                          <span className="truncate">
                            {customer.salesPerson}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                      {getStatusBadge(customer.isActive)}
                      {getPotentialBadge(customer.potentialLevel)}
                      {customer.source && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded-full">
                          {customer.source}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Trước
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                    <ChevronRight className="w-4 h-4 ml-1" />
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
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {/* Page numbers */}
                      {Array.from(
                        {
                          length: Math.min(5, totalPages),
                        },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === pageNum
                                  ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        },
                      )}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 bg-black/80 transition flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowUploadModal(false);
            setUploadFile(null);
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <FileSpreadsheet className="w-6 h-6 text-green-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">
                  Import khách hàng từ Excel
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Chọn file Excel (.xlsx hoặc .xls) chứa danh sách khách hàng
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-blue-800 font-medium mb-1">
                    📋 Lưu ý:
                  </p>
                  <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
                    <li>File phải có định dạng .xlsx hoặc .xls</li>
                    <li>
                      Các cột cần có: Tên đầy đủ, Điện thoại, Email, Địa chỉ
                    </li>
                    <li>Dòng đầu tiên là tiêu đề cột</li>
                  </ul>
                  <button
                    onClick={handleDownloadTemplate}
                    className="mt-3 flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                  >
                    <Upload className="w-3 h-3 mr-1 rotate-180" />
                    Tải file mẫu chuẩn tại đây
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block w-full">
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                      uploadFile
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                    }`}
                  >
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {uploadFile ? (
                      <div className="flex items-center justify-center">
                        <FileSpreadsheet className="w-8 h-8 text-green-600 mr-3" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">
                            {uploadFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(uploadFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Click để chọn file hoặc kéo thả file vào đây
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Hỗ trợ: .xlsx, .xls
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={uploading}
                >
                  Hủy
                </button>
                <button
                  onClick={handleUploadFile}
                  disabled={!uploadFile || uploading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang import...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Import
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {modalCustomer && (
        <CustomerModal
          customer={modalCustomer}
          mode={modalMode}
          onClose={handleModalClose}
          onEdit={handleEditCustomer}
          onDelete={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default KhachHangManagement;
