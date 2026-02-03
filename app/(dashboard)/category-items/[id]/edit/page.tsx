"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  LayoutPanelTop,
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface CategoryGroup {
  _id: string;
  name: string;
  code: string;
}

interface CategoryItemFormData {
  groupId: string;
  name: string;
  code: string;
  note: string;
  isActive: boolean;
}

const EditCategoryItemPage = () => {
  const router = useRouter();
  const params = useParams();
  const [formData, setFormData] = useState<CategoryItemFormData>({
    groupId: "",
    name: "",
    code: "",
    note: "",
    isActive: true,
  });
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchingGroups, setFetchingGroups] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchCategoryGroups();
  }, []);

  const fetchCategoryGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/category-groups?limit=100&isActive=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCategoryGroups(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching category groups:", err);
    } finally {
      setFetchingGroups(false);
    }
  };

  useEffect(() => {
    const loadCategoryItem = async () => {
      const resolvedParams = await params;
      const id = Array.isArray(resolvedParams.id)
        ? resolvedParams.id[0]
        : resolvedParams.id;
      if (id) {
        fetchCategoryItem(id);
      }
    };

    loadCategoryItem();
  }, [params]);

  const fetchCategoryItem = async (id: string) => {
    try {
      setFetchLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/category-items/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFormData({
            groupId: data.data.groupId?._id || data.data.groupId || "",
            name: data.data.name,
            code: data.data.code,
            note: data.data.note || "",
            isActive: data.data.isActive,
          });
        }
      } else {
        throw new Error("Không thể tải thông tin hạng mục");
      }
    } catch (err) {
      console.error("Error fetching category item:", err);
      setError("Không thể tải thông tin hạng mục");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    if (!formData.groupId) {
      setError("Vui lòng chọn nhóm hạng mục");
      return false;
    }

    if (!formData.name.trim()) {
      setError("Vui lòng nhập tên hạng mục");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const resolvedParams = await params;
      const id = Array.isArray(resolvedParams.id)
        ? resolvedParams.id[0]
        : resolvedParams.id;

      const response = await fetch(`/api/category-items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          groupId: formData.groupId,
          name: formData.name.trim(),
          note: formData.note.trim(),
          isActive: formData.isActive,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Không thể cập nhật hạng mục");
      }

      const data = await response.json();
      if (data.success) {
        setSuccess("Cập nhật hạng mục thành công!");
        setTimeout(() => {
          router.push("/category-items");
        }, 2000);
      }
    } catch (err) {
      console.error("Error updating category item:", err);
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center">
            <LayoutPanelTop className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Chỉnh sửa hạng mục
              </h1>
              <p className="text-gray-600">
                Cập nhật thông tin hạng mục chi tiết
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhóm hạng mục (Phân loại){" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                name="groupId"
                value={formData.groupId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-black"
                required
                disabled={fetchingGroups}
              >
                <option value="">--- Chọn nhóm hạng mục ---</option>
                {categoryGroups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name} ({group.code})
                  </option>
                ))}
              </select>
              {fetchingGroups && (
                <p className="text-xs text-gray-500 mt-1 flex items-center">
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  Đang tải danh sách nhóm...
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên hạng mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-black"
                placeholder="Nhập tên hạng mục"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã hạng mục
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                readOnly
                className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg outline-none cursor-not-allowed text-gray-500 uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-black"
              placeholder="Ghi chú về hạng mục (không bắt buộc)"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Đang hoạt động</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Bỏ chọn để ẩn hạng mục này khỏi hệ thống
            </p>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              {loading ? "Đang lưu..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategoryItemPage;
