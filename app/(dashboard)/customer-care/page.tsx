"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Handshake,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  Calendar,
  User,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Target,
  FileText,
  Download,
  LayoutGrid,
  List,
} from "lucide-react";
import { toast } from "react-toastify";
import CustomerCareDetailModal from "@/components/CustomerCareDetailModal";

interface FileMetadata {
  url: string;
  name: string;
  format?: string;
}

interface CustomerCare {
  _id: string;
  careId: string;
  carePerson: string;
  careType: string;
  timeFrom?: string;
  timeTo?: string;
  method: string;
  location?: string;
  status: string;
  customerId?: string;
  discussionContent?: string;
  needsNote?: string;
  interestedServices?: string[];
  careResult?: string;
  rejectReason?: string;
  images?: string[];
  files?: FileMetadata[] | string[]; // Support both old and new format
  opportunityRef?: {
    _id: string;
    opportunityNo: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

const CustomerCareManagement = () => {
  const router = useRouter();
  const [careList, setCareList] = useState<CustomerCare[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [careTypeFilter, setCareTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Tự động chuyển sang dạng lưới trên mobile khi load trang
  useEffect(() => {
    if (window.innerWidth < 768) {
      setViewMode("grid");
    }
  }, []);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState<CustomerCare | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingItem, setViewingItem] = useState<CustomerCare | null>(null);

  // Helper function: Tạo URL xem trước file
  const getPreviewUrl = (fileUrl: string, fileFormat?: string) => {
    const officeFormats = ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "pdf"];
    const format = fileFormat?.toLowerCase();

    // Nếu là file Office hoặc PDF, dùng Google Docs Viewer
    if (format && officeFormats.includes(format)) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    }

    // Các file khác (PDF, ảnh) mở trực tiếp
    // Với Cloudinary, đảm bảo URL không có flag 'attachment'
    return fileUrl.replace("/upload/", "/upload/fl_inline/");
  };

  // Helper function: Tải file về máy mà không mở tab mới
  const handleDownloadFile = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Đã tải xuống: ${fileName}`);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Không thể tải file. Vui lòng thử lại.");
    }
  };

  const fetchCareList = async (
    page = 1,
    search = "",
    status = "all",
    type = "all",
  ) => {
    try {
      setLoading(true);
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
      if (type !== "all") params.append("careType", type);

      const response = await fetch(`/api/customer-care?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCareList(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setCurrentPage(data.pagination?.page || 1);
      } else {
        toast.error("Không thể tải danh sách CSKH");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareList(currentPage, searchQuery, statusFilter, careTypeFilter);
  }, [currentPage, searchQuery, statusFilter, careTypeFilter]);

  const handleDelete = async () => {
    if (!deletingItem) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/customer-care/${deletingItem._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Đã xóa kế hoạch CSKH thành công");
        setShowDeleteModal(false);
        setDeletingItem(null);
        fetchCareList(currentPage, searchQuery, statusFilter, careTypeFilter);
      } else {
        toast.error("Không thể xóa kế hoạch này");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Lỗi khi xóa dữ liệu");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      "Hoàn thành": "bg-green-100 text-green-800",
      "Chờ báo cáo": "bg-yellow-100 text-yellow-800",
      Hủy: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || "bg-gray-100 text-gray-800"}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg mr-3">
              <Handshake className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Chăm sóc khách hàng
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                Quản lý hoạt động chăm sóc khách hàng
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-between">
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
              onClick={() => router.push("/customer-care/create")}
              className="flex-none flex items-center justify-center p-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-bold shadow-md shadow-blue-200"
            >
              <Plus className="w-5 h-5 sm:mr-2" />
              <span className="hidden sm:inline">Thêm mới</span>
            </button>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 flex items-center">
                <Filter className="w-3 h-3 mr-1" /> Trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Chờ báo cáo">Chờ báo cáo</option>
                <option value="Hoàn thành">Hoàn thành</option>
                <option value="Hủy">Hủy</option>
              </select>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">
                Loại hình
              </label>
              <select
                value={careTypeFilter}
                onChange={(e) => setCareTypeFilter(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">Tất cả loại hình</option>
                <option value="Khảo sát nhu cầu">Khảo sát nhu cầu</option>
                <option value="Làm rõ báo giá/hợp đồng">
                  Làm rõ báo giá/hợp đồng
                </option>
                <option value="Xử lý khiếu nại/bảo hành">
                  Xử lý khiếu nại/bảo hành
                </option>
                <option value="Thu hồi công nợ">Thu hồi công nợ</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div
            className={`${viewMode === "list" ? "bg-white rounded-lg shadow-sm" : ""} overflow-hidden`}
          >
            {viewMode === "list" ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã CSKH
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phụ trách
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loại hình
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian / Địa điểm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hình thức
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="sticky right-0 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-20 shadow-[-4px_0_4px_-2px_rgba(0,0,0,0.05)]">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {careList.length > 0 ? (
                      careList.map((item) => (
                        <tr
                          key={item._id}
                          className="hover:bg-gray-50 cursor-pointer group"
                          onClick={() => {
                            setViewingItem(item);
                            setShowDetailModal(true);
                          }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex flex-col">
                              <span className="text-blue-600 font-bold">
                                {item.careId}
                              </span>
                              {item.opportunityRef && (
                                <span className="text-[10px] text-gray-400 font-medium">
                                  Link: {item.opportunityRef.opportunityNo}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2 text-gray-400" />
                              {item.carePerson}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.careType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex flex-col">
                              <span className="flex items-center mb-1">
                                <Calendar className="w-3 h-3 mr-1" />
                                {item.timeFrom
                                  ? new Date(item.timeFrom).toLocaleDateString(
                                      "vi-VN",
                                    )
                                  : "-"}
                              </span>
                              {item.location && (
                                <span className="flex items-center text-xs">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {item.location}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.method}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(item.status)}
                          </td>
                          <td className="sticky right-0 px-6 py-4 whitespace-nowrap text-right text-sm font-medium bg-white group-hover:bg-gray-50 transition-colors z-10 shadow-[-4px_0_4px_-2px_rgba(0,0,0,0.05)]">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewingItem(item);
                                  setShowDetailModal(true);
                                }}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Xem chi tiết"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(
                                    `/customer-care/${item._id}/edit`,
                                  );
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Chỉnh sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingItem(item);
                                  setShowDeleteModal(true);
                                }}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          Không tìm thấy dữ liệu
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {careList.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all relative group overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 bottom-0 flex flex-col w-12 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={() => {
                          setViewingItem(item);
                          setShowDetailModal(true);
                        }}
                        className="flex-1 w-full flex items-center justify-center text-green-700 bg-green-100 hover:bg-green-200 rounded-none transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/customer-care/${item._id}/edit`)
                        }
                        className="flex-1 w-full flex items-center justify-center text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-none transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingItem(item);
                          setShowDeleteModal(true);
                        }}
                        className="flex-1 w-full flex items-center justify-center text-red-700 bg-red-100 hover:bg-red-200 rounded-none transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center mb-4 pr-10">
                      <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                        <Handshake className="w-6 h-6" />
                      </div>
                      <div className="ml-3 overflow-hidden">
                        <h3 className="font-bold text-gray-900 truncate">
                          {item.careId}
                        </h3>
                        {item.opportunityRef && (
                          <p className="text-xs text-blue-600 font-medium truncate">
                            Link: {item.opportunityRef.opportunityNo}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-gray-100 pr-10 lg:pr-0">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                        <span className="truncate">{item.carePerson}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                        <span className="truncate">
                          {item.timeFrom
                            ? new Date(item.timeFrom).toLocaleDateString(
                                "vi-VN",
                              )
                            : "-"}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FileText className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                        <span className="truncate">{item.careType}</span>
                      </div>
                      {(item.careResult || item.rejectReason) && (
                        <div className="flex items-center text-[11px]">
                          {item.careResult ? (
                            <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded truncate">
                              KQ: {item.careResult}
                            </span>
                          ) : (
                            <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded truncate">
                              Từ chối: {item.rejectReason}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-1">
                        {getStatusBadge(item.status)}
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {item.method}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Trang <span className="font-medium">{currentPage}</span> /{" "}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingItem && (
        <div
          className="fixed inset-0 bg-black/80 transition z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowDeleteModal(false);
            setDeletingItem(null);
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
              Xác nhận xóa kế hoạch
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              Bạn có chắc chắn muốn xóa kế hoạch CSKH{" "}
              <span className="font-semibold">{deletingItem.careId}</span>? Hành
              động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingItem(null);
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

      {/* Detail View Modal */}
      {showDetailModal && viewingItem && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => {
            setShowDetailModal(false);
            setViewingItem(null);
          }}
        >
          {/* Modal chi tiết CSKH */}
          <CustomerCareDetailModal
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setViewingItem(null);
            }}
            item={viewingItem}
            onUpdate={() =>
              fetchCareList(
                currentPage,
                searchQuery,
                statusFilter,
                careTypeFilter,
              )
            }
          />
        </div>
      )}
    </div>
  );
};

export default CustomerCareManagement;
