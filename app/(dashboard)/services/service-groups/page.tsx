"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Tag,
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
  X,
  ChevronDown,
  Package,
} from "lucide-react";
import { toast } from "react-toastify";

interface ServiceGroup {
  _id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Service {
  _id: string;
  serviceName: string;
  code: string;
  serviceGroup: string;
  description?: string;
  isActive: boolean;
}

const ServiceGroupManagement = () => {
  const router = useRouter();
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const groupColors = [
    {
      bg: "bg-blue-50",
      text: "text-blue-600",
      shadow: "shadow-blue-50",
      border: "border-blue-100",
    },
    {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      shadow: "shadow-emerald-50",
      border: "border-emerald-100",
    },
    {
      bg: "bg-amber-50",
      text: "text-amber-600",
      shadow: "shadow-amber-50",
      border: "border-amber-100",
    },
    {
      bg: "bg-rose-50",
      text: "text-rose-600",
      shadow: "shadow-rose-50",
      border: "border-rose-100",
    },
    {
      bg: "bg-purple-50",
      text: "text-purple-600",
      shadow: "shadow-purple-50",
      border: "border-purple-100",
    },
    {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      shadow: "shadow-indigo-50",
      border: "border-indigo-100",
    },
    {
      bg: "bg-cyan-50",
      text: "text-cyan-600",
      shadow: "shadow-cyan-50",
      border: "border-cyan-100",
    },
    {
      bg: "bg-orange-50",
      text: "text-orange-600",
      shadow: "shadow-orange-50",
      border: "border-orange-100",
    },
  ];

  // const getGroupColor = (id: string, isActive: boolean) => {
  //   if (!isActive)
  //     return {
  //       bg: "bg-gray-50",
  //       text: "text-gray-400",
  //       shadow: "shadow-none",
  //       border: "border-gray-100",
  //     };
  //   const hash = id
  //     .split("")
  //     .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  //   return groupColors[hash % groupColors.length];
  // };

  const getGroupHeaderStyle = (id: string, isActive: boolean) => {
    if (!isActive) return {};
    const hash = id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    return {
      backgroundColor: `hsla(${hue}, 50%, 85%, 0.8)`,
      borderLeft: `6px solid hsla(${hue}, 50%, 60%, 1)`,
    };
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ServiceGroup | null>(null);
  const [viewingGroup, setViewingGroup] = useState<ServiceGroup | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState<ServiceGroup | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );
  const [services, setServices] = useState<Service[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    isActive: true,
  });

  // Fetch service groups
  const fetchServiceGroups = async (
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

      const response = await fetch(`/api/service-groups?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Không thể tải danh sách nhóm dịch vụ");
      }

      const data = await response.json();
      setServiceGroups(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
      setCurrentPage(data.pagination?.page || 1);
    } catch (err: any) {
      console.error("Error fetching service groups:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/services?limit=1000", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setServices(data.data);
      }
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  // Modal helpers
  const handleOpenModal = (group: ServiceGroup | null = null) => {
    if (group) {
      setEditingGroup(group);
      setFormData({
        name: group.name,
        code: group.code,
        description: group.description || "",
        isActive: group.isActive,
      });
    } else {
      setEditingGroup(null);
      setFormData({
        name: "",
        code: "",
        description: "",
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGroup(null);
    setError(null);
  };

  const handleOpenViewModal = (group: ServiceGroup) => {
    setViewingGroup(group);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingGroup(null);
  };

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleActive = () => {
    setFormData((prev) => ({ ...prev, isActive: !prev.isActive }));
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

      const url = editingGroup
        ? `/api/service-groups/${editingGroup._id}`
        : "/api/service-groups";
      const method = editingGroup ? "PUT" : "POST";

      const payload = {
        ...formData,
      };
      if (editingGroup) {
        payload.code = formData.code.toUpperCase().trim();
      } else {
        // @ts-ignore
        delete payload.code;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đã có lỗi xảy ra");
      }

      toast.success(
        editingGroup
          ? "Cập nhật nhóm dịch vụ thành công"
          : "Thêm nhóm dịch vụ thành công",
      );
      handleCloseModal();
      fetchServiceGroups(currentPage, searchQuery, statusFilter);
    } catch (err: any) {
      console.error("Error saving service group:", err);
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Delete service group
  const handleDelete = async () => {
    if (!deletingGroup) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/service-groups/${deletingGroup._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Không thể xóa nhóm dịch vụ");
      }

      toast.success("Xóa nhóm dịch vụ thành công");
      setShowDeleteModal(false);
      setDeletingGroup(null);
      // Refresh the list
      fetchServiceGroups(currentPage, searchQuery, statusFilter);
    } catch (err: any) {
      console.error("Error deleting service group:", err);
      toast.error(err.message || "Không thể xóa nhóm dịch vụ");
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  useEffect(() => {
    fetchServiceGroups(currentPage, searchQuery, statusFilter);
    fetchServices();
  }, [currentPage, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Đang tải danh sách nhóm dịch vụ...
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
            <Tag className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nhóm dịch vụ</h1>
              <p className="text-gray-600">
                Quản lý các nhóm dịch vụ trong hệ thống
              </p>
            </div>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5 mr-2" />
            Thêm nhóm dịch vụ
          </button>
        </div>

        {/* Filters */}
        <div className="mt-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc mã nhóm dịch vụ..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full"
            />
          </div>

          {/* Filter actions */}
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
                  <option value="all">Tất cả</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Ngừng hoạt động</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Tổng số:{" "}
              <span className="font-semibold text-gray-900">{total}</span> nhóm
              dịch vụ
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

      {/* Grouped Accordion View */}
      <div className="space-y-6">
        {serviceGroups.length === 0 ? (
          <div className="bg-white shadow rounded-lg text-center py-20">
            <Tag className="mx-auto h-16 w-16 text-gray-200" />
            <h3 className="mt-4 text-lg font-bold text-gray-900 uppercase">
              Không có nhóm dịch vụ nào
            </h3>
            <p className="mt-2 text-gray-500 font-medium">
              {searchQuery || statusFilter !== "all"
                ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                : "Thêm nhóm dịch vụ đầu tiên để bắt đầu quản lý"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <div className="mt-8">
                <button
                  onClick={() => handleOpenModal()}
                  className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Thêm nhóm dịch vụ đầu tiên
                </button>
              </div>
            )}
          </div>
        ) : (
          serviceGroups.map((group) => {
            const groupServices = services.filter(
              (s) => s.serviceGroup === group.name,
            );
            // const isCollapsed = collapsedGroups.has(group._id);
            const isCollapsed = collapsedGroups.has(group._id);

            return (
              <div
                key={group._id}
                className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden group transition-all"
              >
                {/* Accordion Header */}
                <div
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 cursor-pointer hover:brightness-95 transition-all ${
                    !isCollapsed ? "border-b border-gray-50" : ""
                  }`}
                  style={getGroupHeaderStyle(group._id, group.isActive)}
                  onClick={() => toggleGroupCollapse(group._id)}
                >
                  <div className="flex items-center gap-6">
                    {/* <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                        getGroupColor(group._id, group.isActive).bg
                      } ${getGroupColor(group._id, group.isActive).text} shadow-sm ${
                        getGroupColor(group._id, group.isActive).shadow
                      }`}
                    >
                      <Tag className="w-6 h-6" />
                    </div> */}
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">
                          {group.name}
                        </h3>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-black tracking-widest uppercase">
                          {group.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="text-xs font-bold text-gray-400">
                          {groupServices.length} dịch vụ trực thuộc
                        </div>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        <div className="text-xs text-gray-400 font-bold">
                          {formatDate(group.createdAt)}
                        </div>
                      </div>
                      {group.description && (
                        <p className="mt-2 text-xs text-gray-500 font-medium line-clamp-1 max-w-lg">
                          {group.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 sm:mt-0">
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          router.push(`/services/create?group=${group.name}`)
                        }
                        className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white hover:bg-black rounded-xl transition-all shadow-lg shadow-blue-100"
                        title="Thêm dịch vụ vào nhóm này"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleOpenViewModal(group)}
                        className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleOpenModal(group)}
                        className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingGroup(group);
                          setShowDeleteModal(true);
                        }}
                        className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                        title="Xóa"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="w-px h-8 bg-gray-100 mx-2 hidden sm:block"></div>
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                        isCollapsed
                          ? "bg-gray-50 text-gray-400"
                          : "bg-blue-600 text-white shadow-lg shadow-blue-100"
                      }`}
                    >
                      <ChevronDown
                        className={`w-6 h-6 transition-transform duration-300 ${isCollapsed ? "-rotate-90" : "rotate-0"}`}
                      />
                    </div>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="p-6 bg-gray-50/10">
                    {groupServices.length > 0 ? (
                      <div className="space-y-3">
                        {groupServices.map((service) => (
                          <div
                            key={service._id}
                            className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group/item flex items-center justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-11 h-11 bg-blue-50/50 text-blue-600 rounded-xl flex items-center justify-center shadow-xs">
                                <Package className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-sm">
                                  {service.serviceName}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-1.5 py-0.5 rounded-md">
                                    {service.code}
                                  </span>
                                  {service.description && (
                                    <>
                                      <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                      <span className="text-[10px] text-gray-400 font-medium line-clamp-1 italic">
                                        {service.description}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              <div
                                className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase ${
                                  service.isActive
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-red-50 text-red-600"
                                }`}
                              >
                                {service.isActive ? "Hoạt động" : "Ngừng"}
                              </div>

                              <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                <button
                                  onClick={() =>
                                    router.push(`/services/${service._id}/edit`)
                                  }
                                  className="p-2.5 bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all"
                                  title="Chỉnh sửa dịch vụ"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-4xl bg-white">
                        <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-sm font-bold text-gray-400">
                          Chưa có dịch vụ nào trong nhóm này
                        </p>
                        <button
                          onClick={() =>
                            router.push(`/services/create?group=${group.name}`)
                          }
                          className="mt-4 text-xs font-black text-blue-600 uppercase tracking-widest hover:underline"
                        >
                          + Thêm dịch vụ mới
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination (Optional if list is large) */}
      {totalPages > 1 && (
        <div className="mt-12 bg-white rounded-full shadow-sm border border-gray-100 p-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="w-12 h-12 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white rounded-full transition-all disabled:opacity-30 disabled:hover:bg-gray-50 disabled:hover:text-gray-400"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, idx) => {
              const p = idx + 1;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-10 h-10 rounded-full font-black text-xs transition-all ${
                    currentPage === p
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                      : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="w-12 h-12 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white rounded-full transition-all disabled:opacity-30 disabled:hover:bg-gray-50 disabled:hover:text-gray-400"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

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
                    {editingGroup
                      ? "Chỉnh sửa nhóm dịch vụ"
                      : "Thêm nhóm dịch vụ mới"}
                  </h3>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2 shrink-0" />
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên nhóm dịch vụ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Nhập tên nhóm dịch vụ"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  {editingGroup && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mã nhóm
                      </label>
                      <input
                        type="text"
                        name="code"
                        readOnly
                        value={formData.code}
                        className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-500 outline-none cursor-not-allowed"
                      />
                      <p className="mt-1 text-[10px] text-gray-400">
                        Mã hệ thống không thể thay đổi
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Nhập mô tả nhóm dịch vụ"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={handleToggleActive}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ring-offset-2 focus:ring-2 focus:ring-blue-500 ${
                        formData.isActive ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          formData.isActive ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="ml-3 text-sm text-gray-600">
                      {formData.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 bg-gray-50 flex flex-row-reverse sm:px-6 gap-2">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {submitLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu lại"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* View Modal */}
      {showViewModal && viewingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-gray-500/75 transition"
            onClick={handleCloseViewModal}
          ></div>
          <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto z-10">
            <div className="px-4 pt-5 pb-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                  Chi tiết nhóm dịch vụ
                </h3>
                <button
                  onClick={handleCloseViewModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-gray-500">
                    Tên nhóm:
                  </div>
                  <div className="text-sm text-gray-900 col-span-2">
                    {viewingGroup.name}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-gray-500">
                    Mã nhóm:
                  </div>
                  <div className="text-sm text-gray-900 col-span-2">
                    {viewingGroup.code}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-gray-500">
                    Mô tả:
                  </div>
                  <div className="text-sm text-gray-900 col-span-2">
                    {viewingGroup.description || "-"}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-gray-500">
                    Trạng thái:
                  </div>
                  <div className="col-span-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        viewingGroup.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {viewingGroup.isActive
                        ? "Đang hoạt động"
                        : "Ngừng hoạt động"}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-sm font-medium text-gray-500">
                    Ngày tạo:
                  </div>
                  <div className="text-sm text-gray-900 col-span-2">
                    {formatDate(viewingGroup.createdAt)}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-gray-500">
                    Cập nhật lần cuối:
                  </div>
                  <div className="text-sm text-gray-900 col-span-2">
                    {formatDate(viewingGroup.updatedAt)}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 flex flex-row-reverse sm:px-6 gap-2">
              <button
                type="button"
                onClick={() => {
                  handleCloseViewModal();
                  handleOpenModal(viewingGroup);
                }}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Chỉnh sửa
              </button>
              <button
                type="button"
                onClick={handleCloseViewModal}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingGroup && (
        <div
          className="fixed inset-0 bg-black/80 transition z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowDeleteModal(false);
            setDeletingGroup(null);
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
              Xác nhận xóa nhóm dịch vụ
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              Bạn có chắc chắn muốn xóa nhóm dịch vụ{" "}
              <span className="font-semibold">{deletingGroup.name}</span>? Hành
              động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingGroup(null);
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

export default ServiceGroupManagement;
