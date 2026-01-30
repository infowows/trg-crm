"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  X,
  Package,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";

interface ServicePackageFormData {
  packageName: string;
  code: string;
  description: string;
  active: boolean;
}

const EditServicePackage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ServicePackageFormData>({
    packageName: "",
    code: "",
    description: "",
    active: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    setInitialLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/service-packages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        const pkg = data.data;
        setFormData({
          packageName: pkg.packageName || "",
          code: pkg.code || "",
          description: pkg.description || "",
          active: pkg.active !== undefined ? pkg.active : true,
        });
      } else {
        toast.error(data.message || "Không thể tải thông tin gói dịch vụ");
        router.push("/services/service-packages");
      }
    } catch (error) {
      console.error("Error loading service package data:", error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setInitialLoading(false);
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
    if (!formData.packageName.trim()) {
      setError("Vui lòng nhập tên gói dịch vụ");
      return false;
    }

    if (!formData.code.trim()) {
      setError("Vui lòng nhập mã gói dịch vụ");
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

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const payload = {
        packageName: formData.packageName.trim(),
        code: formData.code.toUpperCase().trim(),
        description: formData.description.trim(),
        active: formData.active,
      };

      const response = await fetch(`/api/service-packages/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể cập nhật gói dịch vụ");
      }

      toast.success("Cập nhật gói dịch vụ thành công!");
      router.push("/services/service-packages");
    } catch (err: any) {
      console.error("Error updating service package:", err);
      setError(err.message || "Có lỗi xảy ra khi cập nhật gói dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.push("/services/service-packages")}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Chỉnh sửa gói dịch vụ
                </h1>
                <p className="text-gray-600 mt-1">
                  Cập nhật thông tin chi tiết cho gói dịch vụ
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 shrink-0" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Package Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên gói dịch vụ <span className="text-red-500">*</span>
              </label>
              <div className="relative outline-none">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="packageName"
                  value={formData.packageName}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập tên gói dịch vụ"
                  required
                />
              </div>
            </div>

            {/* Package Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã gói dịch vụ <span className="text-red-500">*</span>
              </label>
              <div className="relative outline-none">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                  placeholder="VD: STANDARD, PREMIUM, BASIC"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <div className="relative outline-none">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập mô tả chi tiết về gói dịch vụ"
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="active"
                id="active"
                checked={formData.active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="active"
                className="ml-2 block text-sm text-gray-700"
              >
                Kích hoạt gói dịch vụ
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push("/services/service-packages")}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Đang lưu..." : "Cập nhật gói"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditServicePackage;
