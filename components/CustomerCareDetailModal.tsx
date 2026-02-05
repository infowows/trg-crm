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
  Info,
  MessageSquare,
  Image as ImageIcon,
  Paperclip,
  Clock,
  Layers,
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
  opportunityRef?:
    | {
        _id: string;
        opportunityNo: string;
      }
    | string;
  surveyRef?:
    | {
        _id: string;
        surveyNo: string;
      }
    | string;
  quotationRef?:
    | {
        _id: string;
        quotationNo: string;
      }
    | string;
  surveyNo?: string;
  quotationNo?: string;
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
  const [activeTab, setActiveTab] = React.useState("general");

  // Reset tab when modal opens with new item
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab("general");
    }
  }, [isOpen]);

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

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-100 bg-gray-50/50 px-6 overflow-x-auto hide-scrollbar shrink-0">
        {[
          { id: "general", label: "Tổng quan", icon: Info },
          { id: "details", label: "Chi tiết trao đổi", icon: MessageSquare },
          { id: "attachments", label: "Đính kèm", icon: Paperclip },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 text-sm font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "border-blue-600 text-blue-600 bg-white shadow-sm"
                  : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-gray-400"}`}
              />
              {tab.label}
              {tab.id === "attachments" && (
                <span className="ml-1 px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-md text-[10px]">
                  {(item.images?.length || 0) + (item.files?.length || 0)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-8 overflow-y-auto flex-1">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === "general" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Left Column: Core Info */}
              <div className="space-y-8">
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Info className="w-3 h-3" />
                    Thông tin định danh
                  </h4>
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                        Mã CSKH
                      </label>
                      <p className="text-lg font-black text-blue-600 tracking-tight">
                        {item.careId}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                          Người phụ trách
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                            <User className="w-4 h-4" />
                          </div>
                          <p className="text-sm font-bold text-gray-900 line-clamp-1">
                            {item.carePerson}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                          Trạng thái
                        </label>
                        <div className="mt-1">
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">
                        Liên kết nghiệp vụ
                      </label>
                      <div className="grid grid-cols-1 gap-3">
                        {item.opportunityRef && (
                          <div className="flex items-center justify-between p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 transition-hover hover:shadow-md">
                            <div className="flex items-center gap-3">
                              <Target className="w-4 h-4" />
                              <span className="text-[10px] font-black uppercase">
                                Cơ hội
                              </span>
                            </div>
                            <span className="font-bold text-sm">
                              {/* @ts-ignore */}
                              {typeof item.opportunityRef === "object"
                                ? // @ts-ignore
                                  item.opportunityRef.opportunityNo
                                : "Đã liên kết"}
                            </span>
                          </div>
                        )}
                        {item.surveyRef && (
                          <div className="flex items-center justify-between p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-100 transition-hover hover:shadow-md">
                            <div className="flex items-center gap-3">
                              <Layers className="w-4 h-4" />
                              <span className="text-[10px] font-black uppercase">
                                Khảo sát
                              </span>
                            </div>
                            <span className="font-bold text-sm">
                              {/* @ts-ignore */}
                              {typeof item.surveyRef === "object"
                                ? // @ts-ignore
                                  item.surveyRef.surveyNo
                                : item.surveyNo || "Đã liên kết"}
                            </span>
                          </div>
                        )}
                        {item.quotationRef && (
                          <div className="flex items-center justify-between p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 transition-hover hover:shadow-md">
                            <div className="flex items-center gap-3">
                              <FileText className="w-4 h-4" />
                              <span className="text-[10px] font-black uppercase">
                                Báo giá
                              </span>
                            </div>
                            <span className="font-bold text-sm">
                              {/* @ts-ignore */}
                              {typeof item.quotationRef === "object"
                                ? // @ts-ignore
                                  item.quotationRef.quotationNo
                                : item.quotationNo || "Đã liên kết"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Logistics */}
              <div className="space-y-8">
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Lịch trình & Địa điểm
                  </h4>
                  <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-gray-100">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Thời gian
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-600 rounded-lg font-bold">
                            {item.careType}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          {item.timeFrom
                            ? new Date(item.timeFrom).toLocaleString("vi-VN")
                            : "N/A"}
                          <span className="mx-2 text-gray-300">→</span>
                          {item.timeTo
                            ? new Date(item.timeTo).toLocaleString("vi-VN")
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-gray-100">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                          Hình thức & Địa điểm
                        </span>
                        <p className="text-sm font-bold text-gray-900">
                          {item.method}{" "}
                          {item.location ? `@ ${item.location}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-black text-gray-400 uppercase tracking-widest">
                          Ngày khởi tạo hồ sơ
                        </span>
                        <span className="font-bold text-gray-900">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString("vi-VN")
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "details" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Interested Services */}
              {item.interestedServices &&
                item.interestedServices.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Target className="w-3 h-3" />
                      Dịch vụ khách hàng quan tâm
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {item.interestedServices.map((service, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-100 shadow-sm transition-hover hover:bg-blue-600 hover:text-white"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Discussion Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {item.discussionContent && (
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <MessageSquare className="w-3 h-3" />
                      Nội dung trao đổi
                    </h4>
                    <div className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {item.discussionContent}
                    </div>
                  </div>
                )}

                {item.needsNote && (
                  <div className="bg-amber-50/50 rounded-3xl p-6 border border-amber-100 shadow-sm">
                    <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Edit className="w-3 h-3" />
                      Ghi chú nhu cầu
                    </h4>
                    <div className="text-amber-900 text-sm leading-relaxed whitespace-pre-wrap font-bold italic">
                      "{item.needsNote}"
                    </div>
                  </div>
                )}
              </div>

              {!item.discussionContent && !item.needsNote && (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="font-bold text-gray-400 italic text-sm">
                    Chưa có nhật ký trao đổi hoặc ghi chú nhu cầu cho phiên CSKH
                    này.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "attachments" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Images Section */}
              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" />
                  Hình ảnh hiện trường ({item.images?.length || 0})
                </h4>
                {item.images && item.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {item.images.map((img, index) => (
                      <a
                        key={index}
                        href={img}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative aspect-video rounded-2xl overflow-hidden border border-gray-100 hover:border-blue-500 transition-all shadow-sm"
                      >
                        <img
                          src={img}
                          alt={`Field evidence ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
                    <p className="text-sm text-gray-400 font-bold italic">
                      Không có hình ảnh đính kèm
                    </p>
                  </div>
                )}
              </div>

              {/* Files Section */}
              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  Hồ sơ & Tài liệu đính kèm ({item.files?.length || 0})
                </h4>
                {item.files && item.files.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {item.files.map((file, idx) => {
                      const fileUrl =
                        typeof file === "string" ? file : file.url;
                      const fileName =
                        typeof file === "string"
                          ? `Tài liệu ${idx + 1}`
                          : file.name;
                      const fileFormat =
                        typeof file === "string"
                          ? fileUrl.split(".").pop()
                          : file.format;

                      return (
                        <div
                          key={idx}
                          className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 transition-all hover:shadow-lg shadow-sm gap-4"
                        >
                          <div className="flex items-center min-w-0 w-full sm:w-auto">
                            <div className="shrink-0 w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              <FileText className="w-6 h-6" />
                            </div>
                            <div className="ml-4 min-w-0 flex-1">
                              <p
                                className="text-sm font-black text-gray-900 truncate pr-2"
                                title={fileName}
                              >
                                {fileName}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-black uppercase">
                                  {fileFormat || "FILE"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex w-full sm:w-auto gap-2">
                            <a
                              href={getPreviewUrl(fileUrl, fileFormat)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 sm:flex-none flex items-center justify-center px-6 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-black hover:bg-blue-600 hover:text-white transition-all whitespace-nowrap"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Xem trực tiếp
                            </a>
                            <button
                              onClick={() =>
                                handleDownloadFile(fileUrl, fileName)
                              }
                              className="flex-1 sm:flex-none flex items-center justify-center px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-black hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Tải về
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
                    <p className="text-sm text-gray-400 font-bold italic">
                      Không có tài liệu đính kèm
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50/80 px-8 py-6 rounded-b-4xl flex justify-end gap-3 shrink-0 border-t border-gray-100 backdrop-blur-sm">
        <button
          onClick={() => router.push(`/customer-care/${item._id}/edit`)}
          className="px-8 py-3 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all flex items-center shadow-lg active:scale-95 text-sm font-bold tracking-tight"
        >
          <Edit className="w-4 h-4 mr-2" />
          Hiệu chỉnh hồ sơ
        </button>
        <button
          onClick={onClose}
          className="px-8 py-3 bg-white border border-gray-200 text-gray-500 rounded-2xl hover:bg-gray-50 hover:text-gray-900 transition-all text-sm font-bold active:scale-95"
        >
          Đóng cửa sổ
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
