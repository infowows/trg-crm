"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Calendar,
  FileText,
  MapPin,
} from "lucide-react";

interface Survey {
  name: string;
  unit: "m2" | "m3";
  length: number;
  width: number;
  area: number;
  coefficient: number;
  volume: number;
  note?: string;
}

interface SurveyData {
  _id: string;
  surveyNo: string;
  surveys: Survey[];
  quotationNo: string | null;
  status: string;
  surveyDate: string;
  surveyAddress?: string;
  surveyNotes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  careRef?: string;
}

const EditSurvey = () => {
  const router = useRouter();
  const params = useParams();
  const [surveyId, setSurveyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [customerCares, setCustomerCares] = useState<any[]>([]);

  useEffect(() => {
    const initializeSurveyId = async () => {
      const resolvedParams = await params;
      const id = Array.isArray(resolvedParams.id)
        ? resolvedParams.id[0]
        : resolvedParams.id;
      setSurveyId(id || "");
    };

    initializeSurveyId();
  }, [params]);

  useEffect(() => {
    if (surveyId && surveyId.trim() !== "") {
      loadSurvey();
      fetchCustomerCares();
    }
  }, [surveyId]);

  const fetchCustomerCares = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/customer-care?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCustomerCares(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching customer cares:", error);
    }
  };

  const loadSurvey = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/surveys/${surveyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        const sData = data.data;
        // Handle careRef if it's populated (object) or ID (string)
        if (sData.careRef && typeof sData.careRef === "object") {
          sData.careRef = sData.careRef._id;
        }
        setSurveyData(sData);
        setSurveys(sData.surveys || []);
      } else {
        toast.error(data.message || "Không thể tải thông tin khảo sát");
        router.push("/surveys");
      }
    } catch (error) {
      console.error("Error loading survey:", error);
      toast.error("Không thể tải thông tin khảo sát");
      router.push("/surveys");
    } finally {
      setLoading(false);
    }
  };

  const calculateVolume = (
    length: number,
    width: number,
    coefficient: number,
  ) => {
    return Math.round(length * width * coefficient * 100) / 100;
  };

  const calculateArea = (length: number, width: number) => {
    return Math.round(length * width * 100) / 100;
  };

  const updateSurvey = (index: number, field: string, value: any) => {
    const newSurveys = [...surveys];
    newSurveys[index] = { ...newSurveys[index], [field]: value };

    // Tự động tính toán khi thay đổi các trường liên quan
    if (["length", "width", "coefficient"].includes(field)) {
      const length = parseFloat(String(newSurveys[index].length)) || 0;
      const width = parseFloat(String(newSurveys[index].width)) || 0;
      const coefficient =
        parseFloat(String(newSurveys[index].coefficient)) || 1;

      newSurveys[index].area = calculateArea(length, width);
      newSurveys[index].volume = calculateVolume(length, width, coefficient);
    }

    setSurveys(newSurveys);
  };

  const addSurvey = () => {
    setSurveys([
      ...surveys,
      {
        name: "",
        unit: "m2",
        length: 0,
        width: 0,
        area: 0,
        coefficient: 1,
        volume: 0,
        note: "",
      },
    ]);
  };

  const removeSurvey = (index: number) => {
    if (surveys.length > 1) {
      setSurveys(surveys.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!surveyData) return;

    // Validate surveys
    const validSurveys = surveys.filter(
      (survey) => survey.name.trim() && survey.length > 0 && survey.width > 0,
    );

    if (validSurveys.length === 0) {
      toast.error("Vui lòng nhập ít nhất một hạng mục khảo sát");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const submitData = {
        surveys: validSurveys,
        surveyDate: surveyData.surveyDate,
        surveyAddress: surveyData.surveyAddress,
        surveyNotes: surveyData.surveyNotes,
        careRef: surveyData.careRef,
        status: "surveyed",
      };

      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Cập nhật khảo sát thành công");
        router.push("/surveys");
      } else {
        toast.error(data.message || "Không thể cập nhật khảo sát");
      }
    } catch (error) {
      console.error("Error updating survey:", error);
      toast.error("Không thể cập nhật khảo sát");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toISOString().split("T")[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!surveyData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Không tìm thấy khảo sát
          </h2>
          <p className="text-gray-600 mb-4">
            Khảo sát bạn tìm không tồn tại hoặc đã bị xóa.
          </p>
          <button
            onClick={() => router.push("/surveys")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Chỉnh sửa Khảo sát
            </h1>
            <p className="text-gray-600">
              Số khảo sát:{" "}
              <span className="font-medium">{surveyData.surveyNo}</span>
            </p>
          </div>
          {surveyData.quotationNo && (
            <div className="text-sm text-green-600">
              Đã tạo báo giá: {surveyData.quotationNo}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Survey Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin Khảo sát
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày khảo sát <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={formatDate(surveyData.surveyDate)}
                  onChange={(e) =>
                    setSurveyData({
                      ...surveyData,
                      surveyDate: e.target.value,
                    })
                  }
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ khảo sát
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={surveyData.surveyAddress || ""}
                  onChange={(e) =>
                    setSurveyData({
                      ...surveyData,
                      surveyAddress: e.target.value,
                    })
                  }
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Địa chỉ khảo sát"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú khảo sát
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  value={surveyData.surveyNotes || ""}
                  onChange={(e) =>
                    setSurveyData({
                      ...surveyData,
                      surveyNotes: e.target.value,
                    })
                  }
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Ghi chú chi tiết về khảo sát"
                  rows={3}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Liên kết Chăm sóc khách hàng (Tùy chọn)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={surveyData.careRef || ""}
                  onChange={(e) =>
                    setSurveyData({
                      ...surveyData,
                      careRef: e.target.value,
                    })
                  }
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white appearance-none"
                >
                  <option value="">-- Chọn hồ sơ CSKH --</option>
                  {customerCares.map((care) => (
                    <option key={care._id} value={care._id}>
                      {care.careId} - {care.customerRef?.fullName || "Khách lẻ"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Survey Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Hạng mục Khảo sát
            </h2>
            <button
              type="button"
              onClick={addSurvey}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Thêm hạng mục
            </button>
          </div>

          <div className="space-y-6">
            {surveys.map((survey, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <input
                    type="text"
                    value={survey.name}
                    onChange={(e) =>
                      updateSurvey(index, "name", e.target.value)
                    }
                    className="text-lg font-medium border-0 border-b-2 border-gray-300 focus:border-blue-500 outline-none bg-transparent"
                    placeholder="Tên hạng mục (ví dụ: Sơn tường nội thất)"
                  />
                  {surveys.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSurvey(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đơn vị
                    </label>
                    <select
                      value={survey.unit}
                      onChange={(e) =>
                        updateSurvey(index, "unit", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="m2">m²</option>
                      <option value="m3">m³</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chiều dài (m)
                    </label>
                    <input
                      type="number"
                      value={survey.length}
                      onChange={(e) =>
                        updateSurvey(
                          index,
                          "length",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chiều rộng (m)
                    </label>
                    <input
                      type="number"
                      value={survey.width}
                      onChange={(e) =>
                        updateSurvey(
                          index,
                          "width",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hệ số
                    </label>
                    <input
                      type="number"
                      value={survey.coefficient}
                      onChange={(e) =>
                        updateSurvey(
                          index,
                          "coefficient",
                          parseFloat(e.target.value) || 1,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Diện tích (tự động tính)
                    </label>
                    <input
                      type="text"
                      value={`${survey.area} (m²)`}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Khối lượng (tự động tính)
                    </label>
                    <input
                      type="text"
                      value={`${survey.volume} ${survey.unit}`}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-black"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú
                    </label>
                    <input
                      type="text"
                      value={survey.note || ""}
                      onChange={(e) =>
                        updateSurvey(index, "note", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Ghi chú cho hạng mục này"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving || !!surveyData.quotationNo}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? "Đang lưu..." : "Lưu Thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditSurvey;
