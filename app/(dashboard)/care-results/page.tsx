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

interface CareGroup {
  _id: string;
  name: string;
  code: string;
  description?: string;
  order: number;
  active: boolean;
}

interface CareResult {
  _id: string;
  careGroupRef: {
    _id: string;
    name: string;
    code: string;
  };
  careGroupName: string;
  resultName: string;
  resultCode: string;
  classification: string;
  description?: string;
  order: number;
  active: boolean;
}

const CareResultsManagement = () => {
  const router = useRouter();
  const [careGroups, setCareGroups] = useState<CareGroup[]>([]);
  const [careResults, setCareResults] = useState<CareResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"groups" | "results">("results");

  // Modals
  const [showCreateResultModal, setShowCreateResultModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showEditResultModal, setShowEditResultModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteGroupConfirm, setShowDeleteGroupConfirm] = useState(false);
  const [editingResult, setEditingResult] = useState<CareResult | null>(null);
  const [editingGroup, setEditingGroup] = useState<CareGroup | null>(null);
  const [deletingResult, setDeletingResult] = useState<CareResult | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<CareGroup | null>(null);

  const [formData, setFormData] = useState({
    careGroupRef: "",
    careGroupName: "",
    resultName: "",
    resultCode: "",
    classification: "",
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
    fetchCareGroups();
    fetchCareResults();
  }, []);

  const fetchCareGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/care-groups?active=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setCareGroups(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching care groups:", error);
    }
  };

  const fetchCareResults = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/care-results?active=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setCareResults(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching care results:", error);
      toast.error("Không thể tải dữ liệu");
    }
  };

  const handleSubmitResult = async (
    e: React.FormEvent,
    continueCreating = false,
  ) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/care-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Tạo kết quả chăm sóc thành công");
        fetchCareResults();

        if (continueCreating) {
          // Keep modal open, reset form but keep the selected group
          const currentGroup = formData.careGroupRef;
          const currentGroupName = formData.careGroupName;
          resetResultForm();
          setFormData((prev) => ({
            ...prev,
            careGroupRef: currentGroup,
            careGroupName: currentGroupName,
          }));
          toast.info("Tiếp tục tạo kết quả cho nhóm: " + currentGroupName);
        } else {
          setShowCreateResultModal(false);
          resetResultForm();
        }
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error creating care result:", error);
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
      const response = await fetch("/api/care-groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(groupFormData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Tạo nhóm chăm sóc thành công");
        fetchCareGroups();

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
      console.error("Error creating care group:", error);
      toast.error("Có lỗi xảy ra");
    }
  };

  const resetResultForm = () => {
    setFormData({
      careGroupRef: "",
      careGroupName: "",
      resultName: "",
      resultCode: "",
      classification: "Đạt",
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

  const handleEditResult = (result: CareResult) => {
    setEditingResult(result);
    setFormData({
      careGroupRef: result.careGroupRef._id,
      careGroupName: result.careGroupName,
      resultName: result.resultName,
      resultCode: result.resultCode,
      classification: result.classification,
      description: result.description || "",
      order: result.order,
      active: result.active,
    });
    setShowEditResultModal(true);
  };

  const handleUpdateResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResult) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/care-results/${editingResult._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Cập nhật kết quả thành công");
        setShowEditResultModal(false);
        setEditingResult(null);
        fetchCareResults();
        resetResultForm();
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error updating care result:", error);
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleEditGroup = (group: CareGroup) => {
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
      const response = await fetch(`/api/care-groups/${editingGroup._id}`, {
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
        fetchCareGroups();
        fetchCareResults(); // To update careGroupName if it changed
        resetGroupForm();
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error updating care group:", error);
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleDeleteGroup = async () => {
    if (!deletingGroup) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/care-groups/${deletingGroup._id}`, {
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
        fetchCareGroups();
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error deleting care group:", error);
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleDeleteResult = async () => {
    if (!deletingResult) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/care-results/${deletingResult._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Xóa kết quả thành công");
        setShowDeleteConfirm(false);
        setDeletingResult(null);
        fetchCareResults();
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error deleting care result:", error);
      toast.error("Có lỗi xảy ra");
    }
  };

  const getClassificationBadge = (classification: string) => {
    const badges: Record<string, { bg: string; text: string; icon: any }> = {
      Đạt: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
      "Đạt mạnh": {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        icon: CheckCircle,
      },
      "Đạt (mức thấp)": {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: CheckCircle,
      },
      "Không đạt": { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
      "Không đạt tạm thời": {
        bg: "bg-orange-100",
        text: "text-orange-700",
        icon: AlertCircle,
      },
      "Chưa rõ": {
        bg: "bg-gray-100",
        text: "text-gray-700",
        icon: AlertCircle,
      },
      "Chưa rõ / Nguy cơ": {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: AlertCircle,
      },
    };

    const badge = badges[classification] || badges["Chưa rõ"];
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}
      >
        <Icon className="w-3 h-3" />
        {classification}
      </span>
    );
  };

  const filteredResults = careResults.filter((result) => {
    const matchesSearch =
      result.resultName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.careGroupName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup =
      selectedGroup === "all" || result.careGroupName === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const groupedResults = careGroups.map((group) => ({
    group,
    results: filteredResults.filter((r) => r.careGroupName === group.name),
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý Kết quả Chăm sóc
            </h1>
            <p className="text-gray-500 mt-1">
              {activeTab === "groups"
                ? `${careGroups.length} nhóm chăm sóc`
                : `${filteredResults.length} kết quả`}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <FolderPlus className="w-5 h-5" />
              Thêm nhóm
            </button>
            <button
              onClick={() => setShowCreateResultModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Thêm kết quả
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("results")}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === "results"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Kết quả chăm sóc
            </div>
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === "groups"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <FolderPlus className="w-4 h-4" />
              Nhóm chăm sóc
            </div>
          </button>
        </div>
      </div>

      {/* Filters - Only show for results tab */}
      {activeTab === "results" && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm kết quả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả nhóm</option>
                {careGroups.map((group) => (
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
        // Groups View
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Danh sách nhóm chăm sóc
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {careGroups.map((group) => {
              const resultCount = careResults.filter(
                (r) => r.careGroupName === group.name,
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
                  <div className="text-sm text-gray-600 mb-2">
                    Mã: <span className="font-mono">{group.code}</span>
                  </div>
                  {group.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {group.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-600 font-bold">
                      {resultCount} kết quả
                    </span>
                    <span className="text-xs text-gray-400">
                      Thứ tự: {group.order}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {careGroups.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              Chưa có nhóm chăm sóc nào. Nhấn "Thêm nhóm" để tạo mới.
            </p>
          )}
        </div>
      ) : (
        // Results View
        <div className="space-y-6">
          {groupedResults.map(({ group, results }) => {
            if (results.length === 0 && selectedGroup !== "all") return null;

            return (
              <div
                key={group._id}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                  {group.name}
                  <span className="text-sm font-normal text-gray-500">
                    ({results.length} kết quả)
                  </span>
                </h2>

                {results.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.map((result) => (
                      <div
                        key={result._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative group"
                      >
                        {/* Action Buttons */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditResult(result)}
                            className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingResult(result);
                              setShowDeleteConfirm(true);
                            }}
                            className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-start justify-between mb-2 pr-20">
                          <h3 className="font-bold text-gray-900 flex-1">
                            {result.resultName}
                          </h3>
                        </div>
                        <div className="mb-3">
                          {getClassificationBadge(result.classification)}
                        </div>
                        {result.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {result.description}
                          </p>
                        )}
                        <div className="text-xs text-gray-400">
                          Mã: {result.resultCode}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Chưa có kết quả nào
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
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Thêm nhóm chăm sóc mới
              </h2>

              <form onSubmit={handleSubmitGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    placeholder="VD: Tư vấn – Khảo sát"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã nhóm <span className="text-gray-400">(Tùy chọn)</span>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Để trống để tự động tạo (VD: TVKS)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Nếu để trống, hệ thống sẽ tự động tạo mã từ tên nhóm
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Mô tả chi tiết về nhóm chăm sóc..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
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
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Tạo nhóm
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Result Modal */}
      {showCreateResultModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateResultModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Thêm kết quả chăm sóc mới
              </h2>

              <form onSubmit={handleSubmitResult} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nhóm chăm sóc <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.careGroupRef}
                    onChange={(e) => {
                      const group = careGroups.find(
                        (g) => g._id === e.target.value,
                      );
                      setFormData({
                        ...formData,
                        careGroupRef: e.target.value,
                        careGroupName: group?.name || "",
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Chọn nhóm chăm sóc</option>
                    {careGroups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên kết quả <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.resultName}
                    onChange={(e) =>
                      setFormData({ ...formData, resultName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="VD: Thiếu thiện chí làm việc"
                  />
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã kết quả <span className="text-gray-400">(Tùy chọn)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.resultCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        resultCode: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Để trống để tự động tạo (VD: TV_TTVLV)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Nếu để trống, hệ thống sẽ tự động tạo mã từ tên kết quả
                  </p>
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Xếp loại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="classification-options"
                    value={formData.classification}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        classification: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Chọn hoặc nhập xếp loại..."
                  />
                  <datalist id="classification-options">
                    <option value="Không đạt" />
                    <option value="Đạt (mức thấp)" />
                    <option value="Đạt" />
                    <option value="Đạt mạnh" />
                    <option value="Chưa rõ" />
                    <option value="Chưa rõ / Nguy cơ" />
                    <option value="Không đạt tạm thời" />
                  </datalist>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Chọn từ danh sách hoặc nhập xếp loại tùy chỉnh
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mô tả chi tiết..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateResultModal(false);
                      resetResultForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={(e: any) => handleSubmitResult(e, true)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Lưu và tiếp tục
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Tạo kết quả
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Result Modal */}
      {showEditResultModal && editingResult && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditResultModal(false);
              setEditingResult(null);
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Chỉnh sửa kết quả chăm sóc
              </h2>

              <form onSubmit={handleUpdateResult} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nhóm chăm sóc <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.careGroupRef}
                    onChange={(e) => {
                      const group = careGroups.find(
                        (g) => g._id === e.target.value,
                      );
                      setFormData({
                        ...formData,
                        careGroupRef: e.target.value,
                        careGroupName: group?.name || "",
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Chọn nhóm chăm sóc</option>
                    {careGroups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên kết quả <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.resultName}
                    onChange={(e) =>
                      setFormData({ ...formData, resultName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã kết quả
                  </label>
                  <input
                    type="text"
                    value={formData.resultCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        resultCode: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Xếp loại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="classification-options-edit"
                    value={formData.classification}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        classification: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Chọn hoặc nhập xếp loại..."
                  />
                  <datalist id="classification-options-edit">
                    <option value="Không đạt" />
                    <option value="Đạt (mức thấp)" />
                    <option value="Đạt" />
                    <option value="Đạt mạnh" />
                    <option value="Chưa rõ" />
                    <option value="Chưa rõ / Nguy cơ" />
                    <option value="Không đạt tạm thời" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditResultModal(false);
                      setEditingResult(null);
                      resetResultForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Chỉnh sửa nhóm chăm sóc
              </h2>

              <form onSubmit={handleUpdateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
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
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
      {showDeleteConfirm && deletingResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Xác nhận xóa
                </h3>
                <p className="text-sm text-gray-500">
                  Hành động này không thể hoàn tác
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-6 font-bold">
              Bạn có chắc chắn muốn xóa kết quả{" "}
              <span className="font-extrabold">
                "{deletingResult.resultName}"
              </span>
              ?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingResult(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteResult}
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
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Xác nhận xóa nhóm
                </h3>
                <p className="text-sm text-gray-500">
                  Hành động này không thể hoàn tác
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-6 font-bold">
              Bạn có chắc chắn muốn xóa nhóm{" "}
              <span className="font-extrabold">"{deletingGroup.name}"</span>?
              <br />
              <span className="text-xs text-red-500 font-normal">
                * Lưu ý: Chỉ xóa được nhóm khi không còn kết quả chi tiết nào
                bên trong.
              </span>
            </p>

            <div className="flex gap-3">
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

export default CareResultsManagement;
