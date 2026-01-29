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
  date: string;
  validTo?: string;
  packages: QuotationService[];
  totalAmount: number;
  taxAmount?: number;
  grandTotal: number;
  status: "draft" | "sent" | "approved" | "rejected" | "completed";
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
        router.push("/bao-gia");
      }
    } catch (error) {
      console.error("Error loading quotation:", error);
      toast.error("Không thể tải thông tin báo giá");
      router.push("/bao-gia");
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
        router.push("/bao-gia");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Không tìm thấy báo giá
          </h2>
          <p className="text-gray-600 mb-4">
            Báo giá bạn tìm không tồn tại hoặc đã bị xóa.
          </p>
          <button
            onClick={() => router.push("/bao-gia")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(quotation.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="p-6">
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
              Chi tiết Báo giá
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                Số báo giá:{" "}
                <span className="font-medium">{quotation.quotationNo}</span>
              </span>
              <span className="flex items-center gap-1">
                <StatusIcon className="w-4 h-4" />
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}
                >
                  {statusConfig.label}
                </span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {quotation.status === "draft" && (
              <>
                <button
                  onClick={() => handleStatusChange("sent")}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Gửi báo giá
                </button>
                <button
                  onClick={() => router.push(`/bao-gia/${quotation._id}/edit`)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Chỉnh sửa
                </button>
              </>
            )}
            {quotation.status === "sent" && (
              <>
                <button
                  onClick={() => handleStatusChange("approved")}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Duyệt báo giá
                </button>
                <button
                  onClick={() => handleStatusChange("rejected")}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Từ chối
                </button>
              </>
            )}
            {quotation.status === "approved" && (
              <button
                onClick={() => handleStatusChange("completed")}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Hoàn thành
              </button>
            )}
            {(quotation.status === "draft" ||
              quotation.status === "rejected") && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Xóa
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quotation Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin báo giá
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Ngày tạo</p>
                  <p className="font-medium text-black">{formatDate(quotation.date)}</p>
                </div>
              </div>
              {quotation.validTo && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Hạn giá</p>
                    <p className="font-medium">
                      {formatDate(quotation.validTo)}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Người tạo</p>
                  <p className="font-medium text-black">{quotation.createdBy}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Ngày cập nhật</p>
                  <p className="font-medium text-black">
                    {formatDate(quotation.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Dịch vụ và Gói
            </h2>
            <div className="space-y-6">
              {quotation.packages && quotation.packages.length > 0 ? (
                quotation.packages.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {item.serviceGroup} - {item.service}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Khối lượng: {item.volume}
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 text-sm font-medium text-gray-700">
                              Gói dịch vụ
                            </th>
                            <th className="text-right py-2 text-sm font-medium text-gray-700">
                              Đơn giá
                            </th>
                            <th className="text-right py-2 text-sm font-medium text-gray-700">
                              Thành tiền
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.packages.map((pkg, packageIndex) => (
                            <tr
                              key={packageIndex}
                              className="border-b border-gray-100"
                            >
                              <td className="py-3">
                                <p className="font-medium text-black">{pkg.packageName}</p>
                              </td>
                              <td className="py-3 text-right text-black">
                                {formatCurrency(pkg.servicePricing)}
                              </td>
                              <td className="py-3 text-right font-medium text-black">
                                {formatCurrency(pkg.totalPrice)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">Không có dịch vụ nào</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin khách hàng
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Khách hàng</p>
                  <p className="font-medium text-black">{quotation.customer}</p>
                </div>
              </div>
              {quotation.customerRef && (
                <>
                  {quotation.customerRef.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Điện thoại</p>
                        <p className="font-medium text-black">
                          {quotation.customerRef.phone}
                        </p>
                      </div>
                    </div>
                  )}
                  {quotation.customerRef.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Địa chỉ</p>
                        <p className="font-medium text-black">
                          {quotation.customerRef.address}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tổng cộng
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <span className="text-black font-medium text-sm">Tổng thành tiền:</span>
                <span className="font-medium text-black">
                  {formatCurrency(quotation.totalAmount)}
                </span>
              </div>
              {quotation.taxAmount && (
                <div className="flex justify-between text-lg">
                  <span>Thuế:</span>
                  <span className="font-medium">
                    {formatCurrency(quotation.taxAmount)}
                  </span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between text-xl font-bold text-blue-600">
                  <span>Tổng cộng:</span>
                  <span>{formatCurrency(quotation.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Thao tác
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                In báo giá
              </button>
              {quotation.status === "draft" && (
                <button
                  onClick={() => router.push(`/bao-gia/${quotation._id}/edit`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Chỉnh sửa
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Xác nhận xóa báo giá
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa báo giá "{quotation.quotationNo}"? Hành
              động này không thể hoàn tác.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
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
    </div>
  );
};

export default QuotationDetail;
