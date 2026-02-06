"use client";

import React, { useState, useEffect } from "react";
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
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Phone,
  Briefcase,
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
  customerRef?: {
    _id: string;
    fullName: string;
    customerCode: string;
    phone: string;
    address: string;
  };
  discussionContent?: string;
  needsNote?: string;
  interestedServices?: string[];
  careResult?: string;
  careResultClassification?: string;
  rejectGroup?: string;
  rejectReason?: string;
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
  onUpdate?: () => void;
}

const CustomerCareDetailModal = ({
  isOpen,
  onClose,
  item: initialItem,
  hideOverlay = false,
  onUpdate,
}: CustomerCareDetailModalProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [updating, setUpdating] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [item, setItem] = useState<CustomerCare | null>(null);

  const [showUpdateActions, setShowUpdateActions] = useState(false);
  const [updateType, setUpdateType] = useState<"complete" | "cancel" | null>(
    null,
  );

  // States for metadata
  const [careResults, setCareResults] = useState<any[]>([]);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [rejectGroups, setRejectGroups] = useState<any[]>([]);
  const [rejectReasons, setRejectReasons] = useState<any[]>([]);
  const [filteredReasons, setFilteredReasons] = useState<any[]>([]);

  const [formUpdate, setFormUpdate] = useState({
    careResult: "",
    careResultClassification: "",
    rejectGroup: "",
    rejectReason: "",
  });

  useEffect(() => {
    if (isOpen && initialItem) {
      fetchDetail(initialItem._id);
      setActiveTab("general");
      setShowUpdateActions(false);
      setUpdateType(null);
      setFormUpdate({
        careResult: "",
        careResultClassification: "",
        rejectGroup: "",
        rejectReason: "",
      });
    } else {
      setItem(null);
    }
  }, [isOpen, initialItem]);

  const fetchDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/customer-care/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setItem(d.data);
        if (d.data.status === "Chờ báo cáo") {
          fetchMetadata();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải thông tin chi tiết");
    } finally {
      setLoadingDetail(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [resResults, resGroups, resReasons] = await Promise.all([
        fetch("/api/care-results?active=true", { headers }),
        fetch("/api/reject-groups?active=true", { headers }),
        fetch("/api/reject-reasons?active=true", { headers }),
      ]);

      if (resResults.ok) {
        const d = await resResults.json();
        setCareResults(d.data || []);
      }
      if (resGroups.ok) {
        const d = await resGroups.json();
        setRejectGroups(d.data || []);
      }
      if (resReasons.ok) {
        const d = await resReasons.json();
        setRejectReasons(d.data || []);
      }
    } catch (err) {
      console.error("Error fetching metadata:", err);
    }
  };

  useEffect(() => {
    if (careResults.length > 0 && item?.careType) {
      const filtered = careResults.filter(
        (r) => r.careGroupName === item.careType,
      );
      setFilteredResults(filtered);
    }
  }, [careResults, item?.careType]);

  useEffect(() => {
    if (rejectReasons.length > 0 && formUpdate.rejectGroup) {
      const filtered = rejectReasons.filter(
        (r) => r.rejectGroupName === formUpdate.rejectGroup,
      );
      setFilteredReasons(filtered);
    }
  }, [rejectReasons, formUpdate.rejectGroup]);

  if (!isOpen || !initialItem) return null;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      "Hoàn thành": "bg-green-100 text-green-800 border-green-200",
      "Chờ báo cáo": "bg-yellow-100 text-yellow-800 border-yellow-200",
      Hủy: "bg-red-100 text-red-800 border-red-200",
    };
    return (
      <span
        className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${styles[status] || "bg-gray-100 text-gray-800"}`}
      >
        {status}
      </span>
    );
  };

  const handleQuickUpdate = async () => {
    if (!updateType || !item) return;

    if (updateType === "complete" && !formUpdate.careResult) {
      toast.warning("Vui lòng chọn kết quả chăm sóc");
      return;
    }
    if (
      updateType === "cancel" &&
      (!formUpdate.rejectGroup || !formUpdate.rejectReason)
    ) {
      toast.warning("Vui lòng nhập đầy đủ nhóm và lý do từ chối");
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const status = updateType === "complete" ? "Hoàn thành" : "Hủy";

      // Sanitize item to send only IDs for populated fields
      const submitData = {
        ...item,
        status,
        customerRef: item.customerRef?._id || item.customerId,
        opportunityRef:
          typeof item.opportunityRef === "object"
            ? item.opportunityRef._id
            : item.opportunityRef,
        surveyRef:
          typeof item.surveyRef === "object"
            ? item.surveyRef._id
            : item.surveyRef,
        quotationRef:
          typeof item.quotationRef === "object"
            ? item.quotationRef._id
            : item.quotationRef,
        careResult: formUpdate.careResult || item.careResult,
        careResultClassification:
          formUpdate.careResultClassification || item.careResultClassification,
        rejectGroup: formUpdate.rejectGroup || item.rejectGroup,
        rejectReason: formUpdate.rejectReason || item.rejectReason,
      };

      const response = await fetch(`/api/customer-care/${item._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success(`Đã cập nhật trạng thái: ${status}`);
        if (onUpdate) onUpdate();
        onClose();
      } else {
        const d = await response.json();
        toast.error(d.message || "Cập nhật không thành công");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setUpdating(false);
    }
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
      toast.error("Không thể tải file");
    }
  };

  const modalContent = (
    <div
      className={`bg-white rounded-4xl shadow-2xl w-full flex flex-col overflow-hidden transition-all duration-300 ${
        hideOverlay
          ? "border border-gray-100 h-full"
          : "max-w-5xl my-4 max-h-[95vh] animate-in fade-in zoom-in-95 duration-300"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-linear-to-r from-blue-600 via-blue-700 to-indigo-800 px-4 sm:px-8 py-4 sm:py-6 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
              <RefreshCw
                className={`w-5 h-5 sm:w-6 sm:h-6 text-white ${updating || loadingDetail ? "animate-spin" : ""}`}
              />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-black text-white tracking-tight uppercase">
                Hồ sơ Chăm sóc
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-blue-100 text-[10px] sm:text-xs font-bold bg-white/10 px-2 py-0.5 rounded-lg border border-white/10">
                  ID: {initialItem.careId}
                </span>
                {getStatusBadge(item?.status || initialItem.status)}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white rounded-2xl p-2 sm:p-3 transition-all active:scale-90"
          >
            <X className="w-5 h-5 sm:w-6 s:h-6" />
          </button>
        </div>
      </div>

      {!item && loadingDetail ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 bg-gray-50/30">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">
            Đang truy xuất dữ liệu chi tiết...
          </p>
        </div>
      ) : item ? (
        <>
          <div className="flex border-b border-gray-100 bg-gray-50/80 px-4 sm:px-8 overflow-x-auto hide-scrollbar shrink-0 sticky top-0 z-20 backdrop-blur-sm">
            {[
              { id: "general", label: "Tổng quan", icon: Info },
              { id: "details", label: "Nội dung", icon: MessageSquare },
              { id: "attachments", label: "Đính kèm", icon: Paperclip },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b-4 text-xs sm:text-sm font-black transition-all whitespace-nowrap relative ${
                    isActive
                      ? `border-blue-600 text-blue-600 bg-white shadow-sm`
                      : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-white/50"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-gray-400"}`}
                  />
                  {tab.label}
                  {tab.id === "attachments" && (
                    <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-black">
                      {(item.images?.length || 0) + (item.files?.length || 0)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Main Container Scrollable */}
          <div className="flex-1 overflow-y-auto bg-gray-50/30 custom-scrollbar">
            <div className="p-4 sm:p-8 pb-12 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === "general" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  {/* Left: Customer Info (Blue Tint) */}
                  <div className="bg-blue-300/10 border border-blue-200 rounded-4xl p-5 sm:p-8 space-y-6">
                    <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                      Thông tin Khách hàng
                    </h4>

                    {item.customerRef ? (
                      <div className="space-y-6">
                        <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-blue-100">
                          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                            <User className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-lg font-black text-gray-900">
                              {item.customerRef.fullName}
                            </p>
                            <p className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block mt-1 uppercase tracking-wider">
                              {item.customerRef.customerCode}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-blue-100">
                            <Phone className="w-5 h-5 text-emerald-500" />
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Số điện thoại
                              </p>
                              <p className="text-sm font-bold text-gray-900">
                                {item.customerRef.phone}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-blue-100">
                            <MapPin className="w-5 h-5 text-orange-500" />
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Địa chỉ đăng ký
                              </p>
                              <p className="text-sm font-bold text-gray-900 line-clamp-2">
                                {item.customerRef.address}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-10 bg-white rounded-2xl text-center border border-dashed border-gray-200">
                        <User className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-xs text-gray-400 font-bold italic">
                          Không có thông tin khách hàng chi tiết
                        </p>
                      </div>
                    )}

                    <div className="space-y-4 pt-4 border-t border-blue-200">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                        Phụ trách & Thời gian
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                            Nhân sự thực hiện
                          </label>
                          <p className="text-sm font-black text-gray-900">
                            {item.carePerson}
                          </p>
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                            Phương thức
                          </label>
                          <p className="text-sm font-black text-blue-600">
                            {item.method}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Plan Logistics (Orange Tint) */}
                  <div className="bg-orange-300/10 border border-orange-200 rounded-4xl p-8 space-y-6">
                    <h4 className="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-4 bg-orange-600 rounded-full"></div>
                      Kế hoạch & Lịch trình
                    </h4>

                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-orange-500" />
                            <span className="text-xs font-black text-gray-900 uppercase">
                              Khung giờ làm việc
                            </span>
                          </div>
                          <span className="text-[10px] font-black bg-orange-100 text-orange-700 px-3 py-1 rounded-full uppercase">
                            {item.careType}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400">
                              Bắt đầu:
                            </span>
                            <span className="text-sm font-black text-gray-900">
                              {item.timeFrom
                                ? new Date(item.timeFrom).toLocaleString(
                                    "vi-VN",
                                  )
                                : "---"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400">
                              Kết thúc:
                            </span>
                            <span className="text-sm font-black text-gray-900">
                              {item.timeTo
                                ? new Date(item.timeTo).toLocaleString("vi-VN")
                                : "---"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {item.location && (
                        <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-orange-100">
                          <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-1" />
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              Địa điểm buổi làm việc
                            </p>
                            <p className="text-sm font-bold text-gray-900">
                              {item.location}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t border-orange-200 space-y-4">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                          Liên kết hệ thống
                        </h4>
                        <div className="space-y-2">
                          {item.opportunityRef && (
                            <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                              <div className="flex items-center gap-3">
                                <Briefcase className="w-4 h-4 text-indigo-500" />
                                <span className="text-[10px] font-black text-gray-500 uppercase">
                                  Cơ hội
                                </span>
                              </div>
                              <span className="text-sm font-black text-indigo-600">
                                {typeof item.opportunityRef === "object"
                                  ? item.opportunityRef.opportunityNo
                                  : "X"}
                              </span>
                            </div>
                          )}
                          {item.surveyRef && (
                            <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                              <div className="flex items-center gap-3">
                                <Target className="w-4 h-4 text-emerald-500" />
                                <span className="text-[10px] font-black text-gray-500 uppercase">
                                  Khảo sát
                                </span>
                              </div>
                              <span className="text-sm font-black text-emerald-600">
                                {typeof item.surveyRef === "object"
                                  ? item.surveyRef.surveyNo
                                  : item.surveyNo || "X"}
                              </span>
                            </div>
                          )}
                          {item.quotationRef && (
                            <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                              <div className="flex items-center gap-3">
                                <FileText className="w-4 h-4 text-blue-500" />
                                <span className="text-[10px] font-black text-gray-500 uppercase">
                                  Báo giá
                                </span>
                              </div>
                              <span className="text-sm font-black text-blue-600">
                                {typeof item.quotationRef === "object"
                                  ? item.quotationRef.quotationNo
                                  : item.quotationNo || "X"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "details" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  {/* Services Section */}
                  <div className="bg-emerald-300/10 border border-emerald-200 rounded-4xl p-8 space-y-6">
                    <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Dịch vụ & Gói giải pháp khách hàng quan tâm
                    </h4>
                    {item.interestedServices &&
                    item.interestedServices.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {item.interestedServices.map((service, index) => (
                          <div
                            key={index}
                            className="px-5 py-3 bg-white border border-emerald-100 text-emerald-700 rounded-2xl text-sm font-black shadow-sm hover:shadow-md transition-all active:scale-95"
                          >
                            {service}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 font-bold italic px-4 py-6 bg-white/50 rounded-2xl border border-dashed border-gray-200">
                        Chưa cập nhật thông tin dịch vụ quan tâm
                      </p>
                    )}
                  </div>

                  {/* Discussion & Needs */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-4xl p-8 border border-gray-100 shadow-sm relative group overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                      <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
                        <MessageSquare className="w-4 h-4" />
                        Nội dung trao đổi chi tiết
                      </h4>
                      <div className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap font-medium relative z-10 bg-gray-50/50 p-6 rounded-2xl min-h-[160px]">
                        {item.discussionContent ||
                          "Cần bổ sung nhật ký làm việc chi tiết..."}
                      </div>
                    </div>

                    <div className="bg-orange-300/10 rounded-4xl p-8 border border-orange-200 shadow-sm">
                      <h4 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Ghi chú nhu cầu & Lưu ý đặc biệt
                      </h4>
                      <div className="text-orange-900 text-sm leading-relaxed whitespace-pre-wrap font-bold italic bg-white/80 p-6 rounded-2xl min-h-[160px] border border-orange-100 shadow-inner">
                        {item.needsNote
                          ? `"${item.needsNote}"`
                          : "Không có ghi chú nhu cầu đặc biệt hồ sơ này."}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "attachments" && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                  {/* Images */}
                  <div className="bg-purple-300/10 border border-purple-200 rounded-4xl p-8">
                    <h4 className="text-xs font-black text-purple-600 uppercase tracking-widest mb-8 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Hình ảnh tư liệu hiện trường ({item.images?.length || 0})
                    </h4>
                    {item.images && item.images.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {item.images.map((img, index) => (
                          <a
                            key={index}
                            href={img}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative aspect-video rounded-3xl overflow-hidden border-2 border-white shadow-lg hover:shadow-purple-200 hover:scale-105 transition-all duration-300"
                          >
                            <img
                              src={img}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                            <div className="absolute inset-0 bg-purple-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                              <Eye className="w-8 h-8 text-white" />
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-white/50 rounded-2xl border border-dashed border-gray-200">
                        <ImageIcon className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                        <p className="text-sm text-gray-400 font-bold italic">
                          Chưa có hình ảnh được tải lên
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Files */}
                  <div className="bg-gray-900 rounded-4xl p-8 text-white">
                    <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Tài liệu & Hồ sơ liên quan ({item.files?.length || 0})
                    </h4>
                    {item.files && item.files.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {item.files.map((file, idx) => {
                          const fileUrl =
                            typeof file === "string" ? file : file.url;
                          const fileName =
                            typeof file === "string"
                              ? `Document ${idx + 1}`
                              : file.name;
                          const fileFormat =
                            typeof file === "string"
                              ? fileUrl.split(".").pop()
                              : file.format;

                          return (
                            <div
                              key={idx}
                              className="group flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all"
                            >
                              <div className="flex items-center gap-5 min-w-0">
                                <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center shrink-0 border border-blue-500/30">
                                  <FileText className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-sm truncate pr-4">
                                    {fileName}
                                  </p>
                                  <span className="text-[10px] font-black text-gray-400 uppercase mt-1 inline-block">
                                    {fileFormat || "PDF"}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all text-blue-400"
                                >
                                  <Eye className="w-5 h-5" />
                                </a>
                                <button
                                  onClick={() =>
                                    handleDownloadFile(fileUrl, fileName)
                                  }
                                  className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all text-emerald-400"
                                >
                                  <Download className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                        <p className="text-sm text-gray-500 font-bold italic">
                          Danh sách tài liệu trống
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Result Display (If any) */}
              {(item.careResult || item.rejectReason) && (
                <div
                  className={`p-8 rounded-4xl border-2 shadow-sm animate-in zoom-in-95 ${item.status === "Hủy" ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"}`}
                >
                  <div className="flex items-start gap-5">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${item.status === "Hủy" ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}
                    >
                      {item.status === "Hủy" ? (
                        <X className="w-8 h-8" />
                      ) : (
                        <CheckCircle className="w-8 h-8" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h5
                          className={`text-lg font-black uppercase tracking-tight ${item.status === "Hủy" ? "text-red-700" : "text-green-700"}`}
                        >
                          {item.status === "Hủy"
                            ? "Báo cáo: Hồ sơ đã hủy"
                            : "Báo cáo: Hoàn thành"}
                        </h5>
                        <span className="text-[10px] bg-white border border-gray-100 px-3 py-1 rounded-full text-gray-400 font-black italic">
                          Cập nhật bởi {item.carePerson}
                        </span>
                      </div>
                      {item.careResult && (
                        <div className="bg-white p-4 rounded-2xl border border-blue-50 mb-3 shadow-xs">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                            Kết quả ghi nhận
                          </p>
                          <p className="text-sm font-black text-gray-900">
                            {item.careResult}
                          </p>
                          {item.careResultClassification && (
                            <span className="text-[10px] text-blue-600 font-black mt-2 inline-block bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase italic">
                              Phân loại: {item.careResultClassification}
                            </span>
                          )}
                        </div>
                      )}
                      {item.rejectReason && (
                        <div className="bg-white p-4 rounded-2xl border border-red-50 shadow-xs">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                            Lý do từ chối cụ thể
                          </p>
                          <p className="text-sm font-black text-red-600">
                            {item.rejectReason}
                          </p>
                          {item.rejectGroup && (
                            <span className="text-[10px] text-red-800 font-black mt-2 inline-block bg-red-50 px-2 py-0.5 rounded border border-red-100 uppercase italic">
                              Nhóm: {item.rejectGroup}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer / Quick Actions Header */}
          {item.status === "Chờ báo cáo" && (
            <div className="bg-white border-t border-gray-100 px-8 py-6 shrink-0 relative shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
              {!showUpdateActions ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4 text-gray-500">
                    <AlertCircle className="w-8 h-8 text-amber-500 animate-pulse" />
                    <div>
                      <p className="font-black text-gray-900 tracking-tight">
                        Cập nhật Báo cáo nhanh
                      </p>
                      <p className="text-xs font-bold">
                        Hãy chọn trạng thái xử lý cuối cùng cho hồ sơ này
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setUpdateType("complete");
                        setShowUpdateActions(true);
                      }}
                      className="flex-1 sm:flex-none px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Hoàn thành
                    </button>
                    <button
                      onClick={() => {
                        setUpdateType("cancel");
                        setShowUpdateActions(true);
                      }}
                      className="flex-1 sm:flex-none px-10 py-4 bg-red-600 text-white rounded-2xl font-black text-sm hover:bg-red-700 shadow-xl shadow-red-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Hủy bỏ
                    </button>
                  </div>
                </div>
              ) : (
                <div className="animate-in slide-in-from-bottom-4 space-y-6">
                  <div className="flex items-center justify-between">
                    <h5
                      className={`text-sm font-black uppercase tracking-widest flex items-center gap-3 ${updateType === "complete" ? "text-emerald-700" : "text-red-700"}`}
                    >
                      {updateType === "complete" ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                      {updateType === "complete"
                        ? "Cập nhật Kết quả Hoàn thành"
                        : "Xác nhận Lý do Hủy bỏ"}
                    </h5>
                    <button
                      onClick={() => setShowUpdateActions(false)}
                      className="text-gray-400 hover:text-gray-900 p-2 font-bold text-xs flex items-center gap-2"
                    >
                      Thay đổi lựa chọn <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    {updateType === "complete" ? (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
                            Kết quả chăm sóc
                          </label>
                          <select
                            value={formUpdate.careResult}
                            onChange={(e) => {
                              const res = filteredResults.find(
                                (r) => r.resultName === e.target.value,
                              );
                              setFormUpdate({
                                ...formUpdate,
                                careResult: e.target.value,
                                careResultClassification:
                                  res?.classification || "",
                              });
                            }}
                            className="w-full px-5 py-4 bg-white border-2 border-transparent focus:border-blue-600 rounded-2xl outline-none font-bold text-gray-900 transition-all shadow-sm"
                          >
                            <option value="">-- Chọn kết quả --</option>
                            {filteredResults.map((r) => (
                              <option key={r._id} value={r.resultName}>
                                {r.resultName}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
                            Phân loại tự động
                          </label>
                          <div className="px-5 py-4 bg-white rounded-2xl border-2 border-gray-100 font-bold text-blue-600 tracking-wide shadow-sm">
                            {formUpdate.careResultClassification ||
                              "(Chưa có phân loại)"}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
                            Nhóm lý do từ chối
                          </label>
                          <select
                            value={formUpdate.rejectGroup}
                            onChange={(e) =>
                              setFormUpdate({
                                ...formUpdate,
                                rejectGroup: e.target.value,
                                rejectReason: "",
                              })
                            }
                            className="w-full px-5 py-4 bg-white border-2 border-transparent focus:border-red-600 rounded-2xl outline-none font-bold text-gray-900 transition-all shadow-sm"
                          >
                            <option value="">-- Chọn nhóm --</option>
                            {rejectGroups.map((g) => (
                              <option key={g._id} value={g.name}>
                                {g.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
                            Lý do chi tiết
                          </label>
                          <select
                            value={formUpdate.rejectReason}
                            disabled={!formUpdate.rejectGroup}
                            onChange={(e) =>
                              setFormUpdate({
                                ...formUpdate,
                                rejectReason: e.target.value,
                              })
                            }
                            className="w-full px-5 py-4 bg-white border-2 border-transparent focus:border-red-600 rounded-2xl outline-none font-bold text-gray-900 transition-all shadow-sm disabled:opacity-50"
                          >
                            <option value="">-- Chọn lý do --</option>
                            {filteredReasons.map((r) => (
                              <option key={r._id} value={r.name}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setShowUpdateActions(false)}
                      disabled={updating}
                      className="px-6 py-3 bg-white border border-gray-200 text-gray-500 rounded-2xl font-bold hover:bg-gray-50 disabled:opacity-50"
                    >
                      Suy nghĩ lại
                    </button>
                    <button
                      onClick={handleQuickUpdate}
                      disabled={updating}
                      className={`px-10 py-3 text-white rounded-2xl font-black shadow-lg transition-all active:scale-95 flex items-center gap-2 ${updateType === "complete" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}
                    >
                      {updating && (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      )}
                      Xác nhận Lưu Báo cáo
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Primary Footer (Always visible) */}
          <div className="bg-gray-100/50 px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 border-t border-gray-200 backdrop-blur-md">
            <div className="flex gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <span>
                Khởi tạo:{" "}
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                  : "--"}
              </span>
              <span className="text-gray-200 px-2">|</span>
              <span>
                Cập nhật:{" "}
                {item.updatedAt
                  ? new Date(item.updatedAt).toLocaleDateString("vi-VN")
                  : "--"}
              </span>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => router.push(`/customer-care/${item._id}/edit`)}
                className="flex-1 sm:flex-none px-8 py-3 bg-white border border-gray-200 text-gray-900 rounded-2xl hover:bg-gray-900 hover:text-white transition-all flex items-center justify-center shadow-sm text-xs font-black"
              >
                <Edit className="w-4 h-4 mr-2" />
                Vào trang Hiệu chỉnh
              </button>
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-8 py-3 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all text-xs font-black shadow-lg"
              >
                Thoát xem chi tiết
              </button>
            </div>
          </div>
        </>
      ) : null}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );

  if (hideOverlay) return modalContent;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity flex items-center justify-center p-4 z-60 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div className="max-w-5xl w-full h-full flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto h-full sm:h-auto flex items-center justify-center w-full">
          {modalContent}
        </div>
      </div>
    </div>
  );
};

export default CustomerCareDetailModal;
