"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  Plus,
  Search,
  Filter,
  FileText,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  FileCheck,
  X,
} from "lucide-react";

interface Survey {
  _id: string;
  surveyNo: string;
  surveys: Array<{
    name: string;
    unit: string;
    length: number;
    width: number;
    area: number;
    coefficient: number;
    volume: number;
    note?: string;
  }>;
  quotationNo: string | null;
  status: "draft" | "surveyed" | "quoted" | "completed";
  surveyDate: string;
  surveyAddress?: string;
  surveyNotes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const SurveyList = () => {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hasQuotationFilter, setHasQuotationFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  useEffect(() => {
    loadSurveys();
  }, [currentPage, searchQuery, statusFilter, hasQuotationFilter]);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (hasQuotationFilter) params.append("hasQuotation", hasQuotationFilter);

      const response = await fetch(`/api/surveys?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSurveys(data.data);
        setTotalPages(data.pagination.pages);
      } else {
        toast.error(data.message || "Không thể tải danh sách khảo sát");
      }
    } catch (error) {
      console.error("Error loading surveys:", error);
      toast.error("Không thể tải danh sách khảo sát");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSurvey) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/surveys/${selectedSurvey._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Xóa khảo sát thành công");
        setShowDeleteModal(false);
        setSelectedSurvey(null);
        loadSurveys();
      } else {
        toast.error(data.message || "Không thể xóa khảo sát");
      }
    } catch (error) {
      console.error("Error deleting survey:", error);
      toast.error("Không thể xóa khảo sát");
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      draft: {
        color: "bg-gray-100 text-gray-800",
        icon: FileText,
        label: "Bản nháp",
      },
      surveyed: {
        color: "bg-blue-100 text-blue-800",
        icon: CheckCircle,
        label: "Đã khảo sát",
      },
      quoted: {
        color: "bg-green-100 text-green-800",
        icon: FileCheck,
        label: "Đã báo giá",
      },
      completed: {
        color: "bg-purple-100 text-purple-800",
        icon: CheckCircle,
        label: "Hoàn thành",
      },
    };

    return configs[status as keyof typeof configs] || configs.draft;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Khảo sát Dự án
            </h1>
            <p className="text-gray-600">
              Quản lý các khảo sát dự án và tạo báo giá
            </p>
          </div>
          <button
            onClick={() => router.push("/surveys/tao-moi")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Tạo Khảo sát Mới
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo số khảo sát, địa chỉ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="draft">Bản nháp</option>
              <option value="surveyed">Đã khảo sát</option>
              <option value="quoted">Đã báo giá</option>
              <option value="completed">Hoàn thành</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={hasQuotationFilter}
              onChange={(e) => setHasQuotationFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Tất cả</option>
              <option value="false">Chưa có báo giá</option>
              <option value="true">Đã có báo giá</option>
            </select>
          </div>
        </div>
      </div>

      {/* Survey List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {surveys.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có khảo sát nào
            </h3>
            <p className="text-gray-600 mb-4">
              Bắt đầu bằng cách tạo khảo sát dự án mới
            </p>
            <button
              onClick={() => router.push("/surveys/tao-moi")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Tạo Khảo sát Mới
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số Khảo sát
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày Khảo sát
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Địa chỉ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Báo giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {surveys.map((survey) => {
                  const statusConfig = getStatusConfig(survey.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr key={survey._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {survey.surveyNo}
                        </div>
                        <div className="text-sm text-gray-500">
                          {survey.surveys.length} hạng mục
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(survey.surveyDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {survey.surveyAddress || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-black">
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.color}">
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {survey.quotationNo ? (
                          <span className="text-sm font-medium text-green-600">
                            {survey.quotationNo}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">Chưa có</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedSurvey(survey);
                              setShowViewModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              router.push(`/surveys/${survey._id}/edit`)
                            }
                            className="text-green-600 hover:text-green-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {!survey.quotationNo && (
                            <button
                              onClick={() => {
                                setSelectedSurvey(survey);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          {survey.status === "surveyed" &&
                            !survey.quotationNo && (
                              <button
                                onClick={() =>
                                  router.push(
                                    `/quotations/tao-moi?survey=${survey._id}`,
                                  )
                                }
                                className="text-purple-600 hover:text-purple-900"
                              >
                                <FileCheck className="w-4 h-4" />
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Hiển thị {(currentPage - 1) * 10 + 1} đến{" "}
            {Math.min(currentPage * 10, surveys.length)} của {surveys.length}{" "}
            kết quả
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
            >
              Trước
            </button>
            <span className="px-3 py-1">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedSurvey && (
        <div
          className="fixed inset-0 bg-black/80 transition flex items-center justify-center z-50"
          onClick={() => {
            setShowDeleteModal(false);
            setSelectedSurvey(null);
          }}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Xác nhận xóa khảo sát
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa khảo sát "{selectedSurvey.surveyNo}"?
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedSurvey(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
      {/* View Modal */}
      {showViewModal && selectedSurvey && (
        <div
          className="fixed inset-0 bg-black/80 transition flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowViewModal(false);
            setSelectedSurvey(null);
          }}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Chi tiết khảo sát: {selectedSurvey.surveyNo}
                </h2>
                <p className="text-sm text-gray-500">
                  Ngày khảo sát: {formatDate(selectedSurvey.surveyDate)}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedSurvey(null);
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
                    Thông tin chung
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Trạng thái:</span>
                      <span
                        className={`font-medium ${
                          getStatusConfig(selectedSurvey.status).color
                        } px-2 py-0.5 rounded-full`}
                      >
                        {getStatusConfig(selectedSurvey.status).label}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Người tạo:</span>
                      <span className="text-gray-900 font-medium">
                        {selectedSurvey.createdBy}
                      </span>
                    </div>
                    {selectedSurvey.quotationNo && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Báo giá liên quan:
                        </span>
                        <span className="text-green-600 font-medium">
                          {selectedSurvey.quotationNo}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Địa điểm & Ghi chú
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="text-sm">
                      <span className="text-gray-500 block">
                        Địa chỉ khảo sát:
                      </span>
                      <span className="text-gray-900 font-medium">
                        {selectedSurvey.surveyAddress || "—"}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500 block">
                        Ghi chú chung:
                      </span>
                      <span className="text-gray-900">
                        {selectedSurvey.surveyNotes || "Không có"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                  Danh sách hạng mục ({selectedSurvey.surveys.length})
                </h3>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Tên hạng mục
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                          ĐVT
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Dài
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Rộng
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Diện tích
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Hệ số
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Khối lượng
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedSurvey.surveys.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-center text-gray-500">
                            {item.unit}
                          </td>
                          <td className="px-4 py-2 text-sm text-right text-gray-900">
                            {item.length.toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-sm text-right text-gray-900">
                            {item.width.toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-sm text-right font-medium text-blue-600">
                            {item.area.toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-sm text-right text-gray-900">
                            {item.coefficient.toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-sm text-right font-bold text-green-600">
                            {item.volume.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedSurvey(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  router.push(`/surveys/${selectedSurvey._id}/edit`);
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
    </div>
  );
};

export default SurveyList;
