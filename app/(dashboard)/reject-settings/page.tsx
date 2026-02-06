"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  FolderPlus,
  List,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";

interface RejectGroup {
  _id: string;
  name: string;
  code: string;
  description?: string;
  order: number;
  active: boolean;
}

interface RejectReason {
  _id: string;
  rejectGroupRef: {
    _id: string;
    name: string;
    code: string;
  };
  rejectGroupName: string;
  name: string;
  code: string;
  description?: string;
  order: number;
  active: boolean;
}

const RejectSettingsManagement = () => {
  const router = useRouter();
  const [rejectGroups, setRejectGroups] = useState<RejectGroup[]>([]);
  const [rejectReasons, setRejectReasons] = useState<RejectReason[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"groups" | "reasons">("reasons");

  // Modals
  const [showCreateReasonModal, setShowCreateReasonModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showEditReasonModal, setShowEditReasonModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteGroupConfirm, setShowDeleteGroupConfirm] = useState(false);
  const [editingReason, setEditingReason] = useState<RejectReason | null>(null);
  const [editingGroup, setEditingGroup] = useState<RejectGroup | null>(null);
  const [deletingReason, setDeletingReason] = useState<RejectReason | null>(
    null,
  );
  const [deletingGroup, setDeletingGroup] = useState<RejectGroup | null>(null);

  const [formData, setFormData] = useState({
    rejectGroupRef: "",
    rejectGroupName: "",
    name: "",
    code: "",
    description: "",
    order: 0,
    active: true,
  });

  const [groupFormData, setGroupFormData] = useState({
    name: "",
    code: "",
    description: "",
    order: 0,
    active: true,
  });

  useEffect(() => {
    fetchRejectGroups();
    fetchRejectReasons();
  }, []);

  const fetchRejectGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/reject-groups?active=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setRejectGroups(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching reject groups:", error);
    }
  };

  const fetchRejectReasons = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/reject-reasons?active=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setRejectReasons(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching reject reasons:", error);
      toast.error("Không thể tải dữ liệu");
    }
  };

  const handleSubmitReason = async (
    e: React.FormEvent,
    continueCreating = false,
  ) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/reject-reasons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Tạo lý do từ chối thành công");
        fetchRejectReasons();

        if (continueCreating) {
          // Keep modal open, reset form but keep the selected group
          const currentGroup = formData.rejectGroupRef;
          const currentGroupName = formData.rejectGroupName;
          resetReasonForm();
          setFormData((prev) => ({
            ...prev,
            rejectGroupRef: currentGroup,
            rejectGroupName: currentGroupName,
          }));
          toast.info("Tiếp tục tạo lý do cho nhóm: " + currentGroupName);
        } else {
          setShowCreateReasonModal(false);
          resetReasonForm();
        }
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error creating reject reason:", error);
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleSubmitGroup = async (
    e: React.FormEvent,
    continueCreating = false,
  ) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/reject-groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(groupFormData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Tạo nhóm lý do thành công");
        fetchRejectGroups();

        if (continueCreating) {
          // Keep modal open, reset form
          resetGroupForm();
          toast.info("Tiếp tục tạo nhóm mới");
        } else {
          setShowCreateGroupModal(false);
          resetGroupForm();
        }
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error creating reject group:", error);
      toast.error("Có lỗi xảy ra");
    }
  };

  const resetReasonForm = () => {
    setFormData({
      rejectGroupRef: "",
      rejectGroupName: "",
      name: "",
      code: "",
      description: "",
      order: 0,
      active: true,
    });
  };

  const resetGroupForm = () => {
    setGroupFormData({
      name: "",
      code: "",
      description: "",
      order: 0,
      active: true,
    });
  };

  const handleEditReason = (reason: RejectReason) => {
    setEditingReason(reason);
    setFormData({
      rejectGroupRef: reason.rejectGroupRef._id,
      rejectGroupName: reason.rejectGroupName,
      name: reason.name,
      code: reason.code,
      description: reason.description || "",
      order: reason.order,
      active: reason.active,
    });
    setShowEditReasonModal(true);
  };

  const handleUpdateReason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReason) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/reject-reasons/${editingReason._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Cập nhật lý do thành công");
        setShowEditReasonModal(false);
        setEditingReason(null);
        fetchRejectReasons();
        resetReasonForm();
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error updating reject reason:", error);
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleEditGroup = (group: RejectGroup) => {
    setEditingGroup(group);
    setGroupFormData({
      name: group.name,
      code: group.code,
      description: group.description || "",
      order: group.order,
      active: group.active,
    });
    setShowEditGroupModal(true);
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/reject-groups/${editingGroup._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(groupFormData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Cập nhật nhóm thành công");
        setShowEditGroupModal(false);
        setEditingGroup(null);
        fetchRejectGroups();
        fetchRejectReasons(); // To update rejectGroupName if it changed
        resetGroupForm();
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error updating reject group:", error);
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleDeleteGroup = async () => {
    if (!deletingGroup) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/reject-groups/${deletingGroup._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Xóa nhóm thành công");
        setShowDeleteGroupConfirm(false);
        setDeletingGroup(null);
        fetchRejectGroups();
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error deleting reject group:", error);
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleDeleteReason = async () => {
    if (!deletingReason) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/reject-reasons/${deletingReason._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Xóa lý do thành công");
        setShowDeleteConfirm(false);
        setDeletingReason(null);
        fetchRejectReasons();
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error deleting reject reason:", error);
      toast.error("Có lỗi xảy ra");
    }
  };

  const filteredReasons = rejectReasons.filter((reason) => {
    const matchesSearch =
      reason.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reason.rejectGroupName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup =
      selectedGroup === "all" || reason.rejectGroupName === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const groupedReasons = rejectGroups.map((group) => ({
    group,
    reasons: filteredReasons.filter((r) => r.rejectGroupName === group.name),
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý Lý do từ chối
            </h1>
            <p className="text-gray-500 mt-1 font-bold">
              {activeTab === "groups"
                ? `${rejectGroups.length} nhóm lý do`
                : `${filteredReasons.length} lý do từ chối`}
            </p>
          </div>
          <div className="flex gap-3 font-bold">
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <FolderPlus className="w-5 h-5" />
              Thêm nhóm
            </button>
            <button
              onClick={() => setShowCreateReasonModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Thêm lý do
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("reasons")}
            className={`px-4 py-2 font-bold transition-colors border-b-2 ${
              activeTab === "reasons"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Lý do từ chối
            </div>
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`px-4 py-2 font-bold transition-colors border-b-2 ${
              activeTab === "groups"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <FolderPlus className="w-4 h-4" />
              Nhóm lý do
            </div>
          </button>
        </div>
      </div>

      {/* Filters */}
      {activeTab === "reasons" && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm lý do..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-bold"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-bold"
              >
                <option value="all">Tất cả nhóm</option>
                {rejectGroups.map((group) => (
                  <option key={group._id} value={group.name}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === "groups" ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Danh sách nhóm lý do
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rejectGroups.map((group) => {
              const reasonCount = rejectReasons.filter(
                (r) => r.rejectGroupName === group.name,
              ).length;
              return (
                <div
                  key={group._id}
                  className="border-2 border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-purple-50 group relative"
                >
                  {/* Group actions */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditGroup(group)}
                      className="p-1.5 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                      title="Sửa nhóm"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingGroup(group);
                        setShowDeleteGroupConfirm(true);
                      }}
                      className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Xóa nhóm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 text-lg pr-16 line-clamp-1">
                      {group.name}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-600 mb-2 font-bold">
                    Mã: <span className="font-mono">{group.code}</span>
                  </div>
                  {group.description && (
                    <p className="text-sm text-gray-600 mb-3 font-bold line-clamp-2">
                      {group.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-xs text-purple-600 font-bold">
                      {reasonCount} lý do
                    </span>
                    <span className="text-xs text-gray-400">
                      Thứ tự: {group.order}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {rejectGroups.length === 0 && (
            <p className="text-gray-500 text-center py-8 font-bold">
              Chưa có nhóm lý do nào. Nhấn "Thêm nhóm" để tạo mới.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {groupedReasons.map(({ group, reasons }) => {
            if (reasons.length === 0 && selectedGroup !== "all") return null;

            return (
              <div
                key={group._id}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                  {group.name}
                  <span className="text-sm font-normal text-gray-500 font-bold">
                    ({reasons.length} lý do)
                  </span>
                </h2>

                {reasons.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reasons.map((reason) => (
                      <div
                        key={reason._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative group"
                      >
                        {/* Action Buttons */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditReason(reason)}
                            className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingReason(reason);
                              setShowDeleteConfirm(true);
                            }}
                            className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-start justify-between mb-2 pr-20">
                          <h3 className="font-bold text-gray-900 flex-1 line-clamp-2">
                            {reason.name}
                          </h3>
                        </div>
                        {reason.description && (
                          <p className="text-sm text-gray-600 mb-2 font-bold line-clamp-2">
                            {reason.description}
                          </p>
                        )}
                        <div className="text-xs text-gray-400 font-bold">
                          Mã: {reason.code}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8 font-bold">
                    Chưa có lý do nào
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateGroupModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Thêm nhóm lý do mới
              </h2>

              <form onSubmit={handleSubmitGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Tên nhóm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={groupFormData.name}
                    onChange={(e) =>
                      setGroupFormData({
                        ...groupFormData,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 font-bold outline-none"
                    placeholder="VD: Lý do khách quan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={groupFormData.description}
                    onChange={(e) =>
                      setGroupFormData({
                        ...groupFormData,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 font-bold outline-none"
                    placeholder="Mô tả chi tiết về nhóm lý do..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Thứ tự hiển thị
                  </label>
                  <input
                    type="number"
                    value={groupFormData.order}
                    onChange={(e) =>
                      setGroupFormData({
                        ...groupFormData,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 font-bold outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4 font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateGroupModal(false);
                      resetGroupForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={(e: any) => handleSubmitGroup(e, true)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Lưu và tiếp tục
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-lg shadow-purple-100"
                  >
                    Tạo nhóm
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Reason Modal */}
      {showCreateReasonModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateReasonModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Thêm lý do từ chối mới
              </h2>

              <form onSubmit={handleSubmitReason} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Nhóm lý do <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.rejectGroupRef}
                    onChange={(e) => {
                      const group = rejectGroups.find(
                        (g) => g._id === e.target.value,
                      );
                      setFormData({
                        ...formData,
                        rejectGroupRef: e.target.value,
                        rejectGroupName: group?.name || "",
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-bold outline-none"
                  >
                    <option value="">Chọn nhóm lý do</option>
                    {rejectGroups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Tên lý do <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-bold outline-none"
                    placeholder="VD: Giá quá cao"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-bold outline-none"
                    placeholder="Mô tả chi tiết..."
                  />
                </div>

                <div className="flex gap-3 pt-4 font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateReasonModal(false);
                      resetReasonForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={(e: any) => handleSubmitReason(e, true)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Lưu và tiếp tục
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-100"
                  >
                    Tạo lý do
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Reason Modal */}
      {showEditReasonModal && editingReason && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditReasonModal(false);
              setEditingReason(null);
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Chỉnh sửa lý do từ chối
              </h2>

              <form onSubmit={handleUpdateReason} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Nhóm lý do <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.rejectGroupRef}
                    onChange={(e) => {
                      const group = rejectGroups.find(
                        (g) => g._id === e.target.value,
                      );
                      setFormData({
                        ...formData,
                        rejectGroupRef: e.target.value,
                        rejectGroupName: group?.name || "",
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-bold outline-none"
                  >
                    <option value="">Chọn nhóm lý do</option>
                    {rejectGroups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Tên lý do <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Mã lý do
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-bold outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4 font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditReasonModal(false);
                      setEditingReason(null);
                      resetReasonForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-100"
                  >
                    Cập nhật
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {showEditGroupModal && editingGroup && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditGroupModal(false);
              setEditingGroup(null);
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Chỉnh sửa nhóm lý do
              </h2>

              <form onSubmit={handleUpdateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Tên nhóm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={groupFormData.name}
                    onChange={(e) =>
                      setGroupFormData({
                        ...groupFormData,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Mã nhóm
                  </label>
                  <input
                    type="text"
                    value={groupFormData.code}
                    onChange={(e) =>
                      setGroupFormData({
                        ...groupFormData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={groupFormData.description}
                    onChange={(e) =>
                      setGroupFormData({
                        ...groupFormData,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Thứ tự hiển thị
                  </label>
                  <input
                    type="number"
                    value={groupFormData.order}
                    onChange={(e) =>
                      setGroupFormData({
                        ...groupFormData,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 font-bold outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4 font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditGroupModal(false);
                      setEditingGroup(null);
                      resetGroupForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-lg shadow-purple-100"
                  >
                    Cập nhật
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingReason && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Xác nhận xóa
                </h3>
                <p className="text-sm text-gray-500 font-bold">
                  Hành động này không thể hoàn tác
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-6 font-bold">
              Bạn có chắc chắn muốn xóa lý do{" "}
              <span className="font-extrabold">"{deletingReason.name}"</span>?
            </p>

            <div className="flex gap-3 font-bold">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingReason(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteReason}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Group Confirmation Modal */}
      {showDeleteGroupConfirm && deletingGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Xác nhận xóa nhóm
                </h3>
                <p className="text-sm text-gray-500 font-bold">
                  Hành động này không thể hoàn tác
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-6 font-bold">
              Bạn có chắc chắn muốn xóa nhóm{" "}
              <span className="font-extrabold">"{deletingGroup.name}"</span>?
              <br />
              <span className="text-xs text-red-500 font-normal">
                * Lưu ý: Chỉ xóa được nhóm khi không còn lý do chi tiết nào bên
                trong.
              </span>
            </p>

            <div className="flex gap-3 font-bold">
              <button
                onClick={() => {
                  setShowDeleteGroupConfirm(false);
                  setDeletingGroup(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteGroup}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Xóa nhóm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RejectSettingsManagement;
