"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  X,
  Package,
  FileText,
  CheckCircle,
  AlertCircle,
  PlusCircle,
} from "lucide-react";
import { toast } from "react-toastify";

interface ServiceFormData {
  serviceName: string;
  serviceGroup: string;
  description: string;
  isActive: boolean;
}

const CreateService = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>({
    serviceName: "",
    serviceGroup: searchParams.get("group") || "",
    description: "",
    isActive: true,
  });
  const [serviceGroups, setServiceGroups] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadServiceGroups();

    const groupParam = searchParams.get("group");
    if (groupParam) {
      setFormData((prev) => ({ ...prev, serviceGroup: groupParam }));
    }
  }, [router, searchParams]);

  const loadServiceGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/service-groups", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setServiceGroups(data.data);
      }
    } catch (error) {
      console.error("Error loading service groups:", error);
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
    if (!formData.serviceName.trim()) {
      setError("Vui lòng nhập tên dịch vụ");
      return false;
    }

    if (!formData.serviceGroup.trim()) {
      setError("Vui lòng chọn nhóm dịch vụ");
      return false;
    }

    return true;
  };

  const handleSubmit = async (
    e: React.FormEvent,
    stayOnPage: boolean = false,
  ) => {
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
        serviceName: formData.serviceName.trim(),
        serviceGroup: formData.serviceGroup.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive,
      };

      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể tạo dịch vụ mới");
      }

      if (stayOnPage) {
        toast.success(`Đã lưu dịch vụ: ${formData.serviceName}`);
        // Reset form but keep serviceGroup
        setFormData((prev) => ({
          ...prev,
          serviceName: "",
          description: "",
        }));
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/services");
        }, 2000);
      }
    } catch (err: any) {
      console.error("Error creating service:", err);
      setError(err.message || "Có lỗi xảy ra khi tạo dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Tạo dịch vụ thành công!
          </h2>
          <p className="text-gray-600">
            Dịch vụ đã được tạo và sẽ chuyển đến trang danh sách sau vài giây...
          </p>
        </div>
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
                onClick={handleCancel}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Tạo dịch vụ mới
                </h1>
                <p className="text-gray-600 mt-1">
                  Nhập thông tin chi tiết cho dịch vụ mới
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
          <form
            onSubmit={(e) => handleSubmit(e, false)}
            className="p-6 space-y-6"
          >
            {/* Service Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên dịch vụ <span className="text-red-500">*</span>
              </label>
              <div className="relative outline-none">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="serviceName"
                  value={formData.serviceName}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập tên dịch vụ"
                  required
                />
              </div>
            </div>

            {/* Service Group */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhóm dịch vụ <span className="text-red-500">*</span>
              </label>
              <div className="relative outline-none">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  name="serviceGroup"
                  value={formData.serviceGroup}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  required
                >
                  <option value="">Chọn nhóm dịch vụ</option>
                  {serviceGroups.map((group) => (
                    <option key={group._id} value={group.name}>
                      {group.name}
                    </option>
                  ))}
                </select>
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
                  placeholder="Nhập mô tả chi tiết về dịch vụ"
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isActive"
                className="ml-2 block text-sm text-gray-700"
              >
                Kích hoạt dịch vụ
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Hủy
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={(e) => handleSubmit(e as any, true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                {loading ? "Đang lưu..." : "Lưu và tiếp tục tạo"}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Đang lưu..." : "Lưu và đóng"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const CreateServicePage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <CreateService />
    </Suspense>
  );
};

export default CreateServicePage;
