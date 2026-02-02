"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Tag,
  Lock,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { formatNumberInput, parseNumberInput } from "@/lib/utils";

interface ServicePricing {
  _id: string;
  serviceName: string;
  packageName?: string;
  unitPrice: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  isUsed: boolean;
  createdAt: string;
  updatedAt: string;
  serviceGroup?: string;
}

const ServicePricingManagement = () => {
  const router = useRouter();
  const [pricings, setPricings] = useState<ServicePricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [packageFilter, setPackageFilter] = useState<string>("all");
  const [allServices, setAllServices] = useState<any[]>([]);
  const [allServiceGroups, setAllServiceGroups] = useState<any[]>([]);
  const [availablePackages, setAvailablePackages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingPricing, setEditingPricing] = useState<ServicePricing | null>(
    null,
  );
  const [viewingPricing, setViewingPricing] = useState<ServicePricing | null>(
    null,
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPricing, setDeletingPricing] = useState<ServicePricing | null>(
    null,
  );
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceGroup: "",
    serviceName: "",
    packageName: "",
    unitPrice: 0,
    effectiveFrom: new Date().toISOString().split("T")[0],
    effectiveTo: "",
    isActive: true,
  });

  // Fetch all services, groups and packages for the filter
  const fetchFilterData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch Service Groups
      const groupRes = await fetch(
        "/api/service-groups?active=true&limit=1000",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const groupData = await groupRes.json();
      if (groupData.success) {
        setAllServiceGroups(groupData.data);
      }

      // Fetch Services
      const svcRes = await fetch("/api/services?active=true&limit=1000", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const svcData = await svcRes.json();
      if (svcData.success) {
        setAllServices(svcData.data);
      }

      // Fetch all predefined packages for the filter
      const pkgRes = await fetch("/api/service-packages?limit=1000", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pkgData = await pkgRes.json();
      if (pkgData.success) {
        setAvailablePackages(pkgData.data.map((p: any) => p.packageName));
      }
    } catch (error) {
      console.error("Error fetching filter data:", error);
    }
  };

  useEffect(() => {
    fetchFilterData();
  }, []);

  // Fetch service pricings
  const fetchPricings = async (
    page: number = 1,
    search: string = "",
    status: string = "all",
    group: string = "all",
    service: string = "all",
    pkg: string = "all",
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
      if (group !== "all") params.append("serviceGroup", group);
      if (service !== "all") params.append("serviceName", service);
      if (pkg !== "all") params.append("packageName", pkg);

      const response = await fetch(
        `/api/service-pricing?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Không thể tải danh sách cài đặt giá");
      }

      const data = await response.json();

      // Better way to get serviceGroup using already fetched allServices
      const pricingsWithGroup = (data.data || []).map((pricing: any) => {
        const foundService = allServices.find(
          (s) => s.serviceName === pricing.serviceName,
        );
        return {
          ...pricing,
          serviceGroup: foundService?.serviceGroup || "-",
        };
      });

      setPricings(pricingsWithGroup);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
      setCurrentPage(data.pagination?.page || 1);
    } catch (err: any) {
      console.error("Error fetching service pricings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Modal helpers
  const handleOpenModal = (pricing: ServicePricing | null = null) => {
    if (pricing) {
      setEditingPricing(pricing);
      setFormData({
        serviceGroup: pricing.serviceGroup || "",
        serviceName: pricing.serviceName,
        packageName: pricing.packageName || "",
        unitPrice: pricing.unitPrice,
        effectiveFrom: new Date(pricing.effectiveFrom)
          .toISOString()
          .split("T")[0],
        effectiveTo: pricing.effectiveTo
          ? new Date(pricing.effectiveTo).toISOString().split("T")[0]
          : "",
        isActive: pricing.isActive,
      });
    } else {
      setEditingPricing(null);
      setFormData({
        serviceGroup: "",
        serviceName: "",
        packageName: "",
        unitPrice: 0,
        effectiveFrom: new Date().toISOString().split("T")[0],
        effectiveTo: "",
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPricing(null);
    setError(null);
  };

  const handleOpenViewModal = (pricing: ServicePricing) => {
    setViewingPricing(pricing);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingPricing(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "unitPrice") {
      const numericValue = parseNumberInput(value);
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const url = editingPricing
        ? `/api/service-pricing/${editingPricing._id}`
        : "/api/service-pricing";
      const method = editingPricing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đã có lỗi xảy ra");
      }

      toast.success(
        editingPricing
          ? "Cập nhật cài đặt giá thành công"
          : "Thêm cài đặt giá thành công",
      );
      handleCloseModal();
      fetchPricings(
        currentPage,
        searchQuery,
        statusFilter,
        groupFilter,
        serviceFilter,
        packageFilter,
      );
    } catch (err: any) {
      console.error("Error saving pricing:", err);
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPricing) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `/api/service-pricing/${deletingPricing._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error("Không thể xóa cài đặt giá");

      toast.success("Xóa cài đặt giá thành công");
      setShowDeleteModal(false);
      setDeletingPricing(null);
      fetchPricings(
        currentPage,
        searchQuery,
        statusFilter,
        groupFilter,
        serviceFilter,
        packageFilter,
      );
    } catch (err: any) {
      toast.error(err.message || "Không thể xóa cài đặt giá");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const isCurrentlyEffective = (
    effectiveFrom: string,
    effectiveTo?: string,
  ) => {
    const now = new Date();
    const from = new Date(effectiveFrom);
    const to = effectiveTo ? new Date(effectiveTo) : null;
    return now >= from && (!to || now <= to);
  };

  useEffect(() => {
    fetchPricings(
      currentPage,
      searchQuery,
      statusFilter,
      groupFilter,
      serviceFilter,
      packageFilter,
    );
  }, [
    currentPage,
    searchQuery,
    statusFilter,
    groupFilter,
    serviceFilter,
    packageFilter,
    allServices.length,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Đang tải danh sách cài đặt giá...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center mb-4 lg:mb-0">
            <DollarSign className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Cài đặt giá dịch vụ
              </h1>
              <p className="text-gray-600">
                Quản lý bảng giá cho các dịch vụ và gói dịch vụ
              </p>
            </div>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5 mr-2" />
            Thêm cài đặt giá
          </button>
        </div>

        {/* Filters */}
        <div className="mt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên dịch vụ..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2 text-sm">
                <Filter className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">Trạng thái:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Ngừng hoạt động</option>
                  <option value="used">Đã sử dụng</option>
                </select>
              </div>

              <div className="flex items-center space-x-1 text-sm">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Nhóm:</span>
                <select
                  value={groupFilter}
                  onChange={(e) => {
                    setGroupFilter(e.target.value);
                    setServiceFilter("all"); // Reset service filter when group changes
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none max-w-[150px]"
                >
                  <option value="all">Tất cả nhóm</option>
                  {allServiceGroups.map((group) => (
                    <option key={group._id} value={group.name}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-1 text-sm">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Dịch vụ:</span>
                <select
                  value={serviceFilter}
                  onChange={(e) => {
                    setServiceFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none max-w-[150px]"
                >
                  <option value="all">Tất cả dịch vụ</option>
                  {allServices
                    .filter(
                      (svc) =>
                        groupFilter === "all" ||
                        svc.serviceGroup === groupFilter,
                    )
                    .map((svc) => (
                      <option key={svc._id} value={svc.serviceName}>
                        {svc.serviceName}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center space-x-1 text-sm">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Gói:</span>
                <select
                  value={packageFilter}
                  onChange={(e) => {
                    setPackageFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none max-w-[150px]"
                >
                  <option value="all">Tất cả gói</option>
                  {availablePackages.map((pkg) => (
                    <option key={pkg} value={pkg}>
                      {pkg}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Tổng số:{" "}
              <span className="font-semibold text-gray-900">{total}</span> cài
              đặt giá
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && !isModalOpen && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 shrink-0" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {pricings.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Không có cài đặt giá nào
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Thử thay đổi bộ lọc hoặc thêm cài đặt giá mới
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên dịch vụ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nhóm dịch vụ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gói dịch vụ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đơn giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hiệu lực
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pricings.map((pricing) => (
                  <tr key={pricing._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pricing.serviceName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pricing.serviceGroup || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pricing.packageName || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(pricing.unitPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(pricing.effectiveFrom)}
                        {pricing.effectiveTo &&
                          ` - ${formatDate(pricing.effectiveTo)}`}
                      </div>
                      {isCurrentlyEffective(
                        pricing.effectiveFrom,
                        pricing.effectiveTo,
                      ) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800 mt-1">
                          Hiệu lực
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${pricing.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          {pricing.isActive
                            ? "Đang hoạt động"
                            : "Ngừng hoạt động"}
                        </span>
                        {pricing.isUsed && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-100 text-orange-800">
                            <Lock className="w-2 h-2 mr-1" /> Đã dùng
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenViewModal(pricing)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!pricing.isUsed && (
                          <button
                            onClick={() => handleOpenModal(pricing)}
                            className="text-green-600 hover:text-green-900"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {!pricing.isUsed && (
                          <button
                            onClick={() => {
                              setDeletingPricing(pricing);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Trang <span className="font-medium">{currentPage}</span> /{" "}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-gray-500/75 transition"
            onClick={handleCloseModal}
          ></div>
          <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto z-10">
            <form onSubmit={handleSubmit}>
              <div className="px-4 pt-5 pb-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingPricing
                      ? "Chỉnh sửa cài đặt giá"
                      : "Thêm cài đặt giá mới"}
                  </h3>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nhóm dịch vụ
                    </label>
                    <select
                      name="serviceGroup"
                      value={formData.serviceGroup}
                      onChange={(e) => {
                        handleInputChange(e);
                        setFormData((prev) => ({ ...prev, serviceName: "" })); // Reset service name when group changes
                      }}
                      className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Tất cả nhóm --</option>
                      {allServiceGroups.map((group) => (
                        <option key={group._id} value={group.name}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tên dịch vụ *
                    </label>
                    <select
                      name="serviceName"
                      required
                      value={formData.serviceName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Chọn dịch vụ --</option>
                      {allServices
                        .filter(
                          (svc) =>
                            !formData.serviceGroup ||
                            svc.serviceGroup === formData.serviceGroup,
                        )
                        .map((svc) => (
                          <option key={svc._id} value={svc.serviceName}>
                            {svc.serviceName}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Gói dịch vụ
                    </label>
                    <select
                      name="packageName"
                      value={formData.packageName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Chọn gói --</option>
                      {availablePackages.map((pkg) => (
                        <option key={pkg} value={pkg}>
                          {pkg}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Đơn giá *
                    </label>
                    <input
                      type="text"
                      name="unitPrice"
                      required
                      value={formatNumberInput(formData.unitPrice)}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Hiệu lực từ *
                      </label>
                      <input
                        type="date"
                        name="effectiveFrom"
                        required
                        value={formData.effectiveFrom}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Đến ngày
                      </label>
                      <input
                        type="date"
                        name="effectiveTo"
                        value={formData.effectiveTo}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 flex flex-row-reverse sm:px-6 gap-2">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitLoading ? "Đang lưu..." : "Lưu lại"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingPricing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-gray-500/75 transition"
            onClick={handleCloseViewModal}
          ></div>
          <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto z-10">
            <div className="px-4 pt-5 pb-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                  Chi tiết cài đặt giá
                </h3>
                <button
                  onClick={handleCloseViewModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-500">
                    Dịch vụ:
                  </div>
                  <div className="text-sm text-gray-900 col-span-2">
                    {viewingPricing.serviceName}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-500">
                    Gói dịch vụ:
                  </div>
                  <div className="text-sm text-gray-900 col-span-2">
                    {viewingPricing.packageName || "-"}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-500">
                    Đơn giá:
                  </div>
                  <div className="text-sm font-bold text-blue-600 col-span-2">
                    {formatCurrency(viewingPricing.unitPrice)}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-500">
                    Hiệu lực:
                  </div>
                  <div className="text-sm text-gray-900 col-span-2">
                    {formatDate(viewingPricing.effectiveFrom)}{" "}
                    {viewingPricing.effectiveTo
                      ? `- ${formatDate(viewingPricing.effectiveTo)}`
                      : ""}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 flex flex-row-reverse sm:px-6 gap-2">
              {!viewingPricing.isUsed && (
                <button
                  onClick={() => {
                    handleCloseViewModal();
                    handleOpenModal(viewingPricing);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Chỉnh sửa
                </button>
              )}
              <button
                onClick={handleCloseViewModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingPricing && (
        <div
          className="fixed inset-0 bg-black/80 transition z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowDeleteModal(false);
            setDeletingPricing(null);
          }}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Xác nhận xóa cài đặt giá
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              Bạn có chắc chắn muốn xóa cài đặt giá cho dịch vụ{" "}
              <span className="font-semibold">
                {deletingPricing.serviceName}
              </span>
              ? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingPricing(null);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePricingManagement;
