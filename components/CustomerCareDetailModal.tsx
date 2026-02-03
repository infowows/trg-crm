"use client";

import React from "react";
import {
  X,
  User,
  Target,
  Calendar,
  MapPin,
  FileText,
  Eye,
  Download,
  Edit,
} from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

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
  images?: string[];
  files?: FileMetadata[] | string[];
  opportunityRef?: {
    _id: string;
    opportunityNo: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface CustomerCareDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CustomerCare | null;
  hideOverlay?: boolean;
}

const CustomerCareDetailModal = ({
  isOpen,
  onClose,
  item,
  hideOverlay = false,
}: CustomerCareDetailModalProps) => {
  const router = useRouter();

  if (!isOpen || !item) return null;

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

  const getPreviewUrl = (fileUrl: string, fileFormat?: string) => {
    const officeFormats = ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "pdf"];
    const format = fileFormat?.toLowerCase();

    if (format && officeFormats.includes(format)) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    }
    return fileUrl.replace("/upload/", "/upload/fl_inline/");
  };

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

  const modalContent = (
    <div
      className={`bg-white rounded-lg shadow-xl w-full flex flex-col overflow-hidden transition-all duration-300 ${
        hideOverlay
          ? "border border-gray-100 h-full"
          : "max-w-4xl my-8 max-h-[90vh] animate-in fade-in zoom-in duration-200"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Eye className="w-6 h-6 text-white mr-3" />
            <h3 className="text-xl font-semibold text-white">
              Chi tiết kế hoạch CSKH
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-500 rounded-lg p-2 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Thông tin cơ bản
            </h4>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Mã CSKH
              </label>
              <p className="text-gray-900 font-semibold">{item.careId}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Người phụ trách
              </label>
              <p className="text-gray-900 flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                {item.carePerson}
              </p>
            </div>

            {item.opportunityRef && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Cơ hội liên kết
                </label>
                <p className="text-blue-600 font-bold flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  {item.opportunityRef.opportunityNo}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500">
                Loại hình CSKH
              </label>
              <p className="text-gray-900">{item.careType}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Trạng thái
              </label>
              <div className="mt-1">{getStatusBadge(item.status)}</div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Hình thức
              </label>
              <p className="text-gray-900">{item.method}</p>
            </div>
          </div>

          {/* Time & Location */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Thời gian & Địa điểm
            </h4>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Từ thời gian
              </label>
              <p className="text-gray-900 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                {item.timeFrom
                  ? new Date(item.timeFrom).toLocaleString("vi-VN")
                  : "-"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Đến thời gian
              </label>
              <p className="text-gray-900 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                {item.timeTo
                  ? new Date(item.timeTo).toLocaleString("vi-VN")
                  : "-"}
              </p>
            </div>

            {item.location && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Địa điểm
                </label>
                <p className="text-gray-900 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  {item.location}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500">
                Ngày tạo
              </label>
              <p className="text-gray-900 text-sm">
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleString("vi-VN")
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="mt-6 space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Nội dung chi tiết
          </h4>

          {item.interestedServices && item.interestedServices.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-500">
                Dịch vụ quan tâm
              </label>
              <div className="flex flex-wrap gap-2 mt-1">
                {item.interestedServices.map((service, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.discussionContent && (
            <div>
              <label className="text-sm font-medium text-gray-500">
                Nội dung trao đổi
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 whitespace-pre-wrap">
                {item.discussionContent}
              </p>
            </div>
          )}

          {item.needsNote && (
            <div>
              <label className="text-sm font-medium text-gray-500">
                Ghi chú nhu cầu
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 whitespace-pre-wrap">
                {item.needsNote}
              </p>
            </div>
          )}
        </div>

        {/* Images */}
        {item.images && item.images.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-3">
              Hình ảnh ({item.images.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {item.images.map((img, index) => (
                <a
                  key={index}
                  href={img}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 transition"
                >
                  <img
                    src={img}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        {item.files && item.files.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Tài liệu đính kèm ({item.files.length})
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {item.files.map((file, idx) => {
                const fileUrl = typeof file === "string" ? file : file.url;
                const fileName =
                  typeof file === "string" ? `Tài liệu ${idx + 1}` : file.name;
                const fileFormat =
                  typeof file === "string"
                    ? fileUrl.split(".").pop()
                    : file.format;

                return (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition gap-3"
                  >
                    <div className="flex items-center min-w-0 w-full sm:w-auto">
                      <div className="shrink-0 p-2 bg-white rounded-lg border border-gray-200 text-blue-600">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="ml-3 min-w-0 flex-1">
                        <p
                          className="text-sm font-semibold text-gray-900 truncate pr-2"
                          title={fileName}
                        >
                          {fileName}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">
                          {fileFormat || "FILE"}
                        </p>
                      </div>
                    </div>

                    <div className="flex w-full sm:w-auto gap-2">
                      <a
                        href={getPreviewUrl(fileUrl, fileFormat)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-200 transition whitespace-nowrap"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Xem
                      </a>
                      <button
                        onClick={() => handleDownloadFile(fileUrl, fileName)}
                        className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition shadow-sm whitespace-nowrap"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Tải về
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end gap-3 shrink-0">
        <button
          onClick={() => router.push(`/customer-care/${item._id}/edit`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center shadow-sm text-sm font-medium"
        >
          <Edit className="w-4 h-4 mr-2" />
          Chỉnh sửa
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
        >
          Đóng
        </button>
      </div>
    </div>
  );

  if (hideOverlay) return modalContent;

  return (
    <div
      className="fixed inset-0 bg-black/50 transition-opacity flex items-center justify-center p-4 z-60"
      onClick={onClose}
    >
      <div className="max-w-4xl w-full">{modalContent}</div>
    </div>
  );
};

export default CustomerCareDetailModal;
