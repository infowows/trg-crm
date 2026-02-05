"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  User,
  Calendar,
  DollarSign,
  Building,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Download,
  Send,
  LayoutList,
  Calculator,
} from "lucide-react";

interface QuotationPackage {
  packageName: string;
  servicePricing: number;
  totalPrice: number;
  isSelected?: boolean;
}

interface QuotationService {
  serviceGroup: string;
  service: string;
  volume: number;
  packages: QuotationPackage[];
}

interface Customer {
  _id: string;
  customerId: string;
  fullName: string;
  phone?: string;
  address?: string;
  email?: string;
}

interface Quotation {
  _id: string;
  quotationNo: string;
  customer: string;
  customerRef?: Customer;
  surveyRef?: any;
  careRef?: any;
  date: string;
  validTo?: string;
  packages: QuotationService[];
  totalAmount: number;
  taxAmount?: number;
  grandTotal: number;
  status: "draft" | "sent" | "approved" | "rejected" | "completed";
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const QuotationDetail = () => {
  const router = useRouter();
  const params = useParams();
  const [quotationId, setQuotationId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const initializeQuotationId = async () => {
      const resolvedParams = await params;
      const id = Array.isArray(resolvedParams.id)
        ? resolvedParams.id[0]
        : resolvedParams.id;
      setQuotationId(id || "");
    };

    initializeQuotationId();
  }, [params]);

  useEffect(() => {
    if (quotationId && quotationId.trim() !== "") {
      loadQuotation();
    }
  }, [quotationId]);

  const loadQuotation = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/quotations/${quotationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setQuotation(data.data);
      } else {
        toast.error(data.message || "Không thể tải thông tin báo giá");
        router.push("/quotations");
      }
    } catch (error) {
      console.error("Error loading quotation:", error);
      toast.error("Không thể tải thông tin báo giá");
      router.push("/quotations");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!quotation) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/quotations/${quotation._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Xóa báo giá thành công");
        setShowDeleteModal(false);
        router.push("/quotations");
      } else {
        toast.error(data.message || "Không thể xóa báo giá");
      }
    } catch (error) {
      console.error("Error deleting quotation:", error);
      toast.error("Không thể xóa báo giá");
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!quotation) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/quotations/${quotation._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Cập nhật trạng thái thành công");
        setQuotation({ ...quotation, status: newStatus as any });
      } else {
        toast.error(data.message || "Không thể cập nhật trạng thái");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      draft: {
        color: "bg-gray-100 text-gray-800",
        icon: FileText,
        label: "Bản nháp",
      },
      sent: {
        color: "bg-blue-100 text-blue-800",
        icon: Send,
        label: "Đã gửi",
      },
      approved: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        label: "Đã duyệt",
      },
      rejected: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        label: "Từ chối",
      },
      completed: {
        color: "bg-purple-100 text-purple-800",
        icon: CheckCircle,
        label: "Hoàn thành",
      },
    };

    return configs[status as keyof typeof configs] || configs.draft;
  };

  const [activeTab, setActiveTab] = useState<
    "general" | "services" | "preview"
  >("general");

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">
            Đang tải hồ sơ...
          </p>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gray-50 rounded-4xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <XCircle className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-sm font-bold text-gray-900 tracking-tight mb-4">
            Hồ sơ không tồn tại
          </h2>
          <p className="text-gray-500 font-medium italic mb-8">
            Hồ sơ báo giá bạn đang tìm kiếm có thể đã bị xóa hoặc đường dẫn
            không chính xác.
          </p>
          <button
            onClick={() => router.push("/quotations")}
            className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl active:scale-95 mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            Về danh sách
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(quotation.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      {/* Header Section */}
      <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-all font-bold text-[10px] uppercase tracking-[0.2em] group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Quay lại danh sách
          </button>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm flex items-center gap-2 border ${statusConfig.color}`}
              >
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </span>
              <span className="hidden md:inline text-gray-200">|</span>
              <span className="text-gray-400 font-bold text-xs uppercase tracking-[0.15em]">
                {quotation.quotationNo}
              </span>
            </div>
            <h1 className="text-2xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
              Chi tiết{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
                Hồ sơ Báo giá
              </span>
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {quotation.status === "draft" && (
            <button
              onClick={() => router.push(`/quotations/${quotation._id}/edit`)}
              className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
            >
              <Edit className="w-5 h-5" />
              Chỉnh sửa
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-gray-100 text-gray-600 rounded-2xl font-bold hover:border-blue-600 hover:text-blue-600 transition-all active:scale-95 shadow-sm"
          >
            <Download className="w-5 h-5" />
            PDF / In
          </button>

          {(quotation.status === "draft" ||
            quotation.status === "rejected") && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="md:w-auto p-4 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center font-bold hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-sm"
              title="Xóa hồ sơ"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-10">
        <div className="flex border-b border-gray-100 overflow-x-auto hide-scrollbar sticky top-0 bg-white/80 backdrop-blur-md z-20">
          {[
            { id: "general", label: "01. Thông tin chung", icon: User },
            { id: "services", label: "02. Chi tiết dịch vụ", icon: FileText },
            { id: "preview", label: "03. Phê duyệt & Ký", icon: CheckCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-8 py-6 border-b-4 font-bold text-sm transition-all whitespace-nowrap ${
                  isActive
                    ? "border-blue-600 text-blue-600 bg-blue-50/30"
                    : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400"}`}
                />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="">
        {activeTab === "general" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Customer Info Card */}
              <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-6 md:p-10 hover:shadow-xl transition-all duration-500 group">
                <div className="flex items-center gap-4 mb-8 md:mb-10">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Building className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                      Thông tin Khách hàng
                    </h3>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                      Customer Profile
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-3xl p-6">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                      Tên tổ chức/Cá nhân
                    </label>
                    <p className="text-lg font-bold text-gray-900">
                      {quotation.customer}
                    </p>
                  </div>

                  {quotation.customerRef && (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl group/item hover:border-blue-200 transition-colors">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover/item:text-blue-600 transition-colors">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Điện thoại
                          </p>
                          <p className="font-bold text-gray-900">
                            {quotation.customerRef.phone || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl group/item hover:border-blue-200 transition-colors">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover/item:text-blue-600 transition-colors">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Email liên hệ
                          </p>
                          <p className="font-bold text-gray-900 truncate max-w-[200px]">
                            {quotation.customerRef.email || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl group/item hover:border-blue-200 transition-colors">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover/item:text-blue-600 transition-colors">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Địa chỉ trụ sở
                          </p>
                          <p className="font-bold text-gray-900 line-clamp-1">
                            {quotation.customerRef.address || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quotation Identity Card */}
              <div className="bg-gray-900 rounded-[2.5rem] shadow-2xl p-6 md:p-10 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <FileText className="w-32 h-32 md:w-48 md:h-48" />
                </div>

                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-10 md:mb-12">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-blue-400">
                      <Calendar className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        Định danh Hồ sơ
                      </h3>
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                        Quotation Identity
                      </p>
                    </div>
                  </div>

                  <div className="space-y-8 flex-1">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
                        Mã số tham chiếu
                      </label>
                      <p className="text-sm font-bold text-white tracking-tighter">
                        {quotation.quotationNo}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
                          Ngày lập
                        </label>
                        <p className="font-bold text-gray-200">
                          {formatDate(quotation.date)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
                          Hết hạn
                        </label>
                        <p className="font-bold text-red-400">
                          {quotation.validTo
                            ? formatDate(quotation.validTo)
                            : "Không xác định"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
                          Người thực hiện
                        </label>
                        <p className="font-bold text-gray-200">
                          {quotation.createdBy}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
                          Cập nhật cuối
                        </label>
                        <p className="font-bold text-gray-200">
                          {formatDate(quotation.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Trạng thái hiện tại
                    </span>
                    <span
                      className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ${statusConfig.color} shadow-lg shadow-black/20`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                Dữ liệu Khảo sát & Ghi chú
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Hồ sơ khảo sát
                  </label>
                  {quotation.surveyRef ? (
                    <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl flex items-center justify-between group/survey">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm transition-transform group-hover/survey:scale-110">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-blue-900 uppercase">
                            {typeof quotation.surveyRef === "object"
                              ? quotation.surveyRef.surveyNo
                              : "Khảo sát hiện tại"}
                          </div>
                          <div className="text-[10px] text-blue-600 font-bold italic mt-0.5 truncate max-w-[250px]">
                            {typeof quotation.surveyRef === "object"
                              ? quotation.surveyRef.surveyAddress
                              : "Đã liên kết khảo sát"}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (typeof quotation.surveyRef === "object") {
                            router.push(`/surveys/${quotation.surveyRef._id}`);
                          }
                        }}
                        className="px-4 py-2 bg-white text-blue-600 text-[10px] font-bold border border-blue-200 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all uppercase tracking-widest shadow-sm"
                      >
                        Chi tiết
                      </button>
                    </div>
                  ) : (
                    <div className="p-8 border-2 border-dashed border-gray-100 rounded-3xl text-center">
                      <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                      <p className="text-xs font-bold text-gray-400 italic">
                        Không có hồ sơ khảo sát liên kết
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Ghi chú nghiệp vụ
                  </label>
                  <div className="p-8 bg-gray-50 border border-gray-100 rounded-3xl min-h-[140px] flex items-center justify-center text-center">
                    {quotation.notes ? (
                      <p className="text-gray-600 font-bold italic text-sm leading-relaxed whitespace-pre-wrap text-left w-full h-full">
                        "{quotation.notes}"
                      </p>
                    ) : (
                      <p className="text-xs font-bold text-gray-400 italic">
                        Không có ghi chú đi kèm
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setActiveTab("services")}
                className="flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-50 active:scale-95"
              >
                Xem chi tiết dịch vụ
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>
          </div>
        )}

        {activeTab === "services" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
            <div className="bg-white border border-gray-100 rounded-[3rem] shadow-sm p-6 md:p-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-10 flex items-center gap-4">
                <div className="w-2 h-10 bg-blue-600 rounded-full shadow-lg shadow-blue-200"></div>
                Dấu trình các gói đã chọn
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {quotation.packages.map((qp, idx) => (
                  <div
                    key={idx}
                    className="group relative bg-white border border-gray-100 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-blue-100/30 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                  >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full translate-x-12 -translate-y-12 transition-transform group-hover:scale-150"></div>

                    <div className="relative z-10">
                      <div className="mb-8">
                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-[0.2em] rounded-lg mb-3">
                          {qp.serviceGroup}
                        </span>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                          {qp.service}
                        </h3>
                      </div>

                      <div className="space-y-4 mb-8">
                        {qp.packages.map((pkg, pIdx) => (
                          <div
                            key={pIdx}
                            className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group-hover:bg-white group-hover:border-blue-100 transition-all"
                          >
                            <div className="flex flex-col gap-1 mb-2">
                              <span className="text-sm font-bold text-gray-800 tracking-tight uppercase">
                                {pkg.packageName}
                              </span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                Đơn giá: {formatCurrency(pkg.servicePricing)}
                              </span>
                            </div>
                            <div className="flex items-center justify-end">
                              <span className="text-lg font-bold text-blue-600 tracking-tighter tabular-nums">
                                {formatCurrency(pkg.totalPrice)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-6 border-t border-dashed border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400">
                          <LayoutList className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
                            Khối lượng áp dụng
                          </span>
                        </div>
                        <span className="text-xs font-bold text-gray-900 bg-gray-50 px-4 py-2 rounded-xl">
                          {qp.volume} m³
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setActiveTab("general")}
                className="flex items-center gap-3 px-10 py-5 border-2 border-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-50 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Về tab Thông tin
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className="flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-50 active:scale-95"
              >
                Tiếp tục xem kết quả
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>
          </div>
        )}

        {activeTab === "preview" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
            {/* Economic Summary Card */}
            <div className="group">
              <div className="relative bg-gray-900 rounded-[3rem] p-8 md:p-16 text-white shadow-2xl overflow-hidden">
                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-48 -mt-48 transition-all group-hover:bg-blue-500/20 duration-1000"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -ml-48 -mb-48"></div>

                <div className="relative z-10 flex flex-col xl:flex-row justify-between xl:items-center gap-16">
                  <div className="space-y-12 flex-1">
                    <div>
                      <h2 className="text-sm font-bold mb-3 flex items-center gap-4 uppercase tracking-tighter">
                        <div className="w-12 h-1.5 bg-blue-600 rounded-full"></div>
                        Tổng kết Giá trị Hồ sơ
                      </h2>
                      <p className="text-gray-400 font-bold italic tracking-wide">
                        Phân tích các chỉ số tài chính dự kiến của dự án
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-8 md:gap-12">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] block">
                          Giá trị gốc dịch vụ
                        </label>
                        <p className="text-sm md:text-2xl lg:text-5xl font-bold text-white tracking-tighter tabular-nums wrap-break-word">
                          {formatCurrency(quotation.totalAmount)}
                        </p>
                      </div>
                      {/* <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] block">
                          Thuế GTGT (VAT)
                        </label>
                        <p className="text-sm md:text-2xl lg:text-5xl font-bold text-blue-400 tracking-tighter tabular-nums wrap-break-word">
                          {formatCurrency(quotation.taxAmount || 0)}
                        </p>
                      </div> */}
                    </div>
                  </div>

                  <div className="relative bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-10 md:p-12 border border-white/10 shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)]">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                        <Calculator className="w-5 h-5 text-blue-400" />
                      </div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                        Tổng mức đầu tư quyết toán
                      </label>
                    </div>
                    <p className="text-5xl md:text-7xl font-bold text-blue-500 tracking-tighter tabular-nums mb-6">
                      {formatCurrency(quotation.grandTotal)}
                    </p>
                    <div className="flex items-center gap-3 text-emerald-400 text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      Đã bao gồm đầy đủ chi phí & thuế hệ thống
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Approval & Management Workflow */}
            {!["approved", "completed", "rejected"].includes(
              quotation.status,
            ) && (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-5xl p-12 text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-4xl flex items-center justify-center mx-auto mb-8 shadow-inner shadow-blue-100">
                  <AlertCircle className="w-10 h-10 text-blue-600 animate-pulse" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 tracking-tight mb-4">
                  Quy trình Phê duyệt
                </h3>
                <p className="text-gray-500 font-medium italic mb-10 max-w-xl mx-auto text-lg leading-relaxed">
                  Lưu ý: Sau khi chuyển trạng thái sang{" "}
                  <span className="text-green-600 font-bold">"Đã duyệt"</span>{" "}
                  hoặc{" "}
                  <span className="text-purple-600 font-bold">
                    "Hoàn thành"
                  </span>
                  , hồ sơ sẽ bị khóa chỉnh sửa để đảm bảo tính pháp lý.
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                  {quotation.status === "draft" && (
                    <button
                      onClick={() => handleStatusChange("sent")}
                      className="flex items-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-4xl font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                    >
                      <Send className="w-6 h-6" />
                      Gửi hồ sơ cho khách hàng
                    </button>
                  )}
                  {quotation.status === "sent" && (
                    <>
                      <button
                        onClick={() => handleStatusChange("approved")}
                        className="flex items-center gap-3 px-12 py-5 bg-green-500 hover:bg-green-600 text-white rounded-4xl font-bold shadow-xl shadow-green-500/20 transition-all active:scale-95"
                      >
                        <CheckCircle className="w-6 h-6" />
                        Duyệt báo giá
                      </button>
                      <button
                        onClick={() => handleStatusChange("rejected")}
                        className="flex items-center gap-3 px-10 py-5 bg-red-500 hover:bg-red-600 text-white rounded-4xl font-bold shadow-xl shadow-red-500/20 transition-all active:scale-95"
                      >
                        <XCircle className="w-6 h-6" />
                        Từ chối
                      </button>
                    </>
                  )}
                  {quotation.status === "approved" && (
                    <button
                      onClick={() => handleStatusChange("completed")}
                      className="flex items-center gap-3 px-12 py-5 bg-purple-600 hover:bg-purple-700 text-white rounded-4xl font-bold shadow-xl shadow-purple-500/20 transition-all active:scale-95"
                    >
                      <CheckCircle className="w-6 h-6" />
                      Hoàn thành dự án
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-6">
              <button
                onClick={() => setActiveTab("services")}
                className="flex items-center gap-3 px-8 py-4 text-gray-400 font-bold hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Về tab Dịch vụ
              </button>
              <div className="flex gap-4">
                <button
                  onClick={() => window.print()}
                  className="px-10 py-5 bg-white border-2 border-gray-100 text-gray-600 rounded-3xl font-bold hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm active:scale-95"
                >
                  Xuất PDF lưu trữ
                </button>
                {quotation.status === "draft" && (
                  <button
                    onClick={() =>
                      router.push(`/quotations/${quotation._id}/edit`)
                    }
                    className="flex items-center gap-4 px-12 py-5 bg-gray-900 text-white rounded-3xl font-bold hover:bg-black transition-all shadow-2xl active:scale-95"
                  >
                    <Edit className="w-6 h-6 text-blue-400" />
                    Cập nhật hồ sơ
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal Re-styled */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-5xl p-12 max-w-lg w-full shadow-2xl text-center transform animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-red-50 rounded-4xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Trash2 className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 tracking-tight mb-4">
              Xác nhận xóa hồ sơ?
            </h3>
            <p className="text-gray-500 font-medium italic mb-10 leading-relaxed">
              Bạn đang yêu cầu xóa hồ sơ{" "}
              <span className="text-gray-900 font-bold">
                "{quotation.quotationNo}"
              </span>
              . Hành động này mang tính vĩnh viễn và không thể khôi phục dữ liệu
              sau khi thực hiện.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="order-2 sm:order-1 flex-1 px-8 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all"
              >
                Khoan, đừng xóa
              </button>
              <button
                onClick={handleDelete}
                className="order-1 sm:order-2 flex-1 px-8 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-100 active:scale-95"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationDetail;
