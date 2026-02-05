"use client";

import { useState } from "react";
import {
  X,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Building,
  Star,
  Calendar,
  User,
  Image as ImageIcon,
  FileText,
  TrendingUp,
} from "lucide-react";

interface Customer {
  _id: string;
  customerId: string;
  fullName: string;
  shortName?: string;
  address?: string;
  phone?: string;
  email?: string;
  image?: string;
  source?: string;
  referrer?: string;
  referrerPhone?: string;
  serviceGroup?: string;
  marketingClassification?: string;
  potentialLevel?: string;
  assignedTo?: {
    _id: string;
    fullName: string;
  } | null;
  needsNote?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lat?: number;
  lng?: number;
  companyName?: string;
  status?: string;
}

interface CustomerModalProps {
  customer: Customer | null;
  mode: "view" | "delete";
  onClose: () => void;
  onEdit?: (customer: Customer) => void;
  onDelete?: (customerId: string) => void;
}

const CustomerModal = ({
  customer,
  mode,
  onClose,
  onEdit,
  onDelete,
}: CustomerModalProps) => {
  const [loading, setLoading] = useState(false);

  if (!customer) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const getStatusLabel = (isActive: boolean) => {
    return isActive ? "Hoạt động" : "Ngừng hoạt động";
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setLoading(true);
    try {
      await onDelete(customer._id);
      onClose();
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (mode === "delete") {
    return (
      <div
        className="fixed inset-0 bg-black/80 transition flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Xác nhận xóa
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                Bạn có chắc chắn muốn xóa khách hàng này?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-900">{customer.fullName}</p>
                {customer.companyName && (
                  <p className="text-sm text-gray-600">
                    {customer.companyName}
                  </p>
                )}
                {customer.phone && (
                  <p className="text-sm text-gray-600">{customer.phone}</p>
                )}
              </div>
              <p className="text-red-600 text-sm mt-3">
                ⚠️ Hành động này không thể hoàn tác.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xóa...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 transition flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-8 py-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Chi tiết khách hàng
          </h2>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Customer Header with Large Image */}
          <div className="mb-10">
            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Large Avatar */}
              <div className="shrink-0">
                <div className="w-64 h-64 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shadow-xl">
                  {customer.image ? (
                    <img
                      src={customer.image}
                      alt={customer.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-32 h-32 text-blue-600" />
                  )}
                </div>
                {customer.image && (
                  <button
                    onClick={() => window.open(customer.image, "_blank")}
                    className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Xem ảnh đầy đủ
                  </button>
                )}
              </div>

              {/* Customer Info */}
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-3xl font-bold text-gray-900 mb-3">
                  {customer.fullName}
                </h3>
                {customer.companyName && (
                  <p className="text-xl text-gray-600 mb-2">
                    {customer.companyName}
                  </p>
                )}
                {customer.customerId && (
                  <p className="text-lg text-gray-500 mb-4">
                    Mã KH: {customer.customerId}
                  </p>
                )}

                {/* Status Badges */}
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-6">
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                      customer.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {customer.isActive ? "Đang hoạt động" : "Không hoạt động"}
                  </span>

                  {customer.status && (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {customer.status}
                    </span>
                  )}

                  {customer.potentialLevel && (
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                        customer.potentialLevel === "Cao"
                          ? "bg-green-100 text-green-800"
                          : customer.potentialLevel === "Trung bình"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      Tiềm năng: {customer.potentialLevel}
                    </span>
                  )}
                </div>
              </div>
              {/* Notes Section */}
              {customer.needsNote && (
                <div className="flex-2 border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-6 h-6 mr-2 text-blue-600" />
                    Ghi chú nhu cầu
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {customer.needsNote}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customer Details - Three Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Column 1: Thông tin cá nhân */}
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-6 h-6 mr-2 text-blue-600" />
                  Thông tin cá nhân
                </h4>
                <div className="space-y-4">
                  {customer.shortName ? (
                    <div className="flex items-start space-x-3">
                      <span className="flex-1 text-sm font-medium text-gray-500 w-24 shrink-0">
                        Tên ngắn:
                      </span>
                      <span className="text-sm text-gray-900 flex-2 bg-linear-to-r from-blue-50 to-cyan-50 p-2 rounded-lg border border-blue-200">
                        {customer.shortName}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-3">
                      <span className="flex-1 text-sm font-medium text-gray-500 w-24 shrink-0">
                        Tên ngắn:
                      </span>
                      <span className="text-sm text-gray-400 flex-2 italic">
                        chưa có dữ liệu
                      </span>
                    </div>
                  )}

                  {customer.phone ? (
                    <div className="flex items-start space-x-3">
                      {/* <Phone className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" /> */}
                      <span className="flex-1 text-sm font-medium text-gray-500 w-24 shrink-0">
                        Điện thoại:
                      </span>
                      <span className="text-sm text-gray-900 flex-2 bg-linear-to-r from-blue-50 to-cyan-50 p-2 rounded-lg border border-blue-200">
                        {customer.phone}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-3">
                      <span className="flex-1 text-sm font-medium text-gray-500 w-24 shrink-0">
                        Điện thoại:
                      </span>
                      <span className="text-sm text-gray-400 flex-2 italic">
                        chưa có dữ liệu
                      </span>
                    </div>
                  )}

                  {customer.address ? (
                    <div className="flex items-start space-x-3">
                      {/* <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" /> */}
                      <span className="flex-1 text-sm font-medium text-gray-500 w-24 shrink-0">
                        Địa chỉ:
                      </span>
                      <span className="text-sm text-gray-900 flex-2 bg-linear-to-r from-blue-50 to-cyan-50 p-2 rounded-lg border border-blue-200">
                        {customer.address}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-3">
                      <span className="flex-1 text-sm font-medium text-gray-500 w-24 shrink-0">
                        Địa chỉ:
                      </span>
                      <span className="text-sm text-gray-400 flex-2 italic">
                        chưa có dữ liệu
                      </span>
                    </div>
                  )}

                  {/* {customer.image && (
                                        <div className="flex items-start space-x-3">
                                            <ImageIcon className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                                            <span className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer underline flex-1">
                                                {customer.image}
                                            </span>
                                        </div>
                                    )} */}

                  {customer.email ? (
                    <div className="flex items-start space-x-3">
                      <span className="flex-1 text-sm font-medium text-gray-500 w-24 shrink-0">
                        Email:
                      </span>
                      <span className="text-sm text-gray-900 flex-2 bg-linear-to-r from-blue-50 to-cyan-50 p-2 rounded-lg border border-blue-200">
                        {customer.email}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-3">
                      <span className="flex-1 text-sm font-medium text-gray-500 w-24 shrink-0">
                        Email:
                      </span>
                      <span className="text-sm text-gray-400 flex-2 italic">
                        chưa có dữ liệu
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Column 2: Thông tin kinh doanh */}
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Star className="w-6 h-6 mr-2 text-blue-600" />
                  Thông tin kinh doanh
                </h4>
                <div className="space-y-4">
                  {customer.source ? (
                    <div className="flex items-start space-x-3">
                      <span className="flex-1 text-sm font-medium text-gray-500 w-24 shrink-0">
                        Nguồn khách hàng:
                      </span>
                      <span className="text-sm text-gray-900 flex-1 bg-linear-to-r from-blue-50 to-cyan-50 p-2 rounded-lg border border-blue-200">
                        {customer.source}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-3">
                      <span className="flex-1 text-sm font-medium text-gray-500 w-24 shrink-0">
                        Nguồn khách hàng:
                      </span>
                      <span className="text-sm text-gray-400 flex-1 italic">
                        chưa có dữ liệu
                      </span>
                    </div>
                  )}

                  {customer.serviceGroup ? (
                    <div className="flex items-start space-x-3">
                      {/* <Building className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" /> */}
                      <span className="flex-1 text-sm font-medium text-gray-500 w-24 shrink-0">
                        Nhóm dịch vụ quan tâm:
                      </span>
                      <span className="text-sm text-gray-900 flex-1 bg-linear-to-r from-blue-50 to-cyan-50 p-2 rounded-lg border border-blue-200">
                        {customer.serviceGroup}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-3">
                      <span className="flex-1 text-sm font-medium text-gray-500 w-24 shrink-0">
                        Nhóm dịch vụ quan tâm:
                      </span>
                      <span className="text-sm text-gray-400 flex-1 italic">
                        chưa có dữ liệu
                      </span>
                    </div>
                  )}

                  {customer.marketingClassification ? (
                    <div className="flex items-start space-x-3">
                      {/* <TrendingUp className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" /> */}
                      <span className="flex-1 text-sm font-medium text-gray-500 w-24 shrink-0">
                        Phân loại marketing:
                      </span>
                      <span className="text-sm text-gray-900 flex-1 bg-linear-to-r from-blue-50 to-cyan-50 p-2 rounded-lg border border-blue-200">
                        {customer.marketingClassification}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-3">
                      <span className="flex-1 text-sm font-medium text-gray-500 w-24 shrink-0">
                        Phân loại marketing:
                      </span>
                      <span className="text-sm text-gray-400 flex-1 italic">
                        chưa có dữ liệu
                      </span>
                    </div>
                  )}

                  {customer.assignedTo ? (
                    <div className="flex items-start space-x-3">
                      <span className="flex-1 text-sm font-medium text-gray-500 w-24 shrink-0">
                        Được phân bổ cho:
                      </span>
                      <span className="text-sm text-gray-900 flex-1 bg-linear-to-r from-blue-50 to-cyan-50 p-2 rounded-lg border border-blue-200">
                        {customer.assignedTo.fullName}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-3">
                      <span className="flex-1 text-sm font-medium text-gray-500 w-24 shrink-0">
                        Được phân bổ cho:
                      </span>
                      <span className="text-sm text-gray-400 flex-1 italic">
                        chưa có dữ liệu
                      </span>
                    </div>
                  )}

                  {customer.referrer ? (
                    <div className="flex items-start space-x-3">
                      <span className="flex-1 text-sm font-medium text-gray-500 w-24 shrink-0">
                        Giới thiệu:
                      </span>
                      <span className="text-sm text-gray-900 flex-1 bg-linear-to-r from-blue-50 to-cyan-50 p-2 rounded-lg border border-blue-200">
                        {customer.referrer}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-3">
                      <span className="flex-1 text-sm font-medium text-gray-500 w-24 shrink-0">
                        Giới thiệu:
                      </span>
                      <span className="text-sm text-gray-400 flex-1 italic">
                        chưa có dữ liệu
                      </span>
                    </div>
                  )}

                  {customer.referrerPhone ? (
                    <div className="flex items-start space-x-3">
                      {/* <Phone className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" /> */}
                      <span className="flex-1 text-sm font-medium text-gray-500 w-24 shrink-0">
                        Số điện thoại:
                      </span>
                      <span className="text-sm text-gray-900 flex-1 bg-linear-to-r from-blue-50 to-cyan-50 p-2 rounded-lg border border-blue-200">
                        {customer.referrerPhone}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-3">
                      <span className="flex-1 text-sm font-medium text-gray-500 w-24 shrink-0">
                        Số điện thoại giới thiệu:
                      </span>
                      <span className="text-sm text-gray-400 flex-1 italic">
                        chưa có dữ liệu
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Column 3: Thời gian & Địa điểm */}
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-6 h-6 mr-2 text-blue-600" />
                  Thời gian
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="flex-1 text-sm font-medium text-gray-500 w-24 shrink-0">
                      Tạo:
                    </span>
                    <span className="text-sm text-gray-900 flex-2 bg-linear-to-r from-blue-50 to-cyan-50 p-2 rounded-lg border border-blue-200">
                      {new Date(customer.createdAt).toLocaleDateString(
                        "vi-VN",
                        {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="flex-1 text-sm font-medium text-gray-500 w-24 shrink-0">
                      Cập nhật:
                    </span>
                    <span className="text-sm text-gray-900 flex-2 bg-linear-to-r from-blue-50 to-cyan-50 p-2 rounded-lg border border-blue-200">
                      {new Date(customer.updatedAt).toLocaleDateString(
                        "vi-VN",
                        {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {customer.lat && customer.lng && (
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-6 h-6 mr-2 text-blue-600" />
                    Tọa độ
                  </h4>
                  <div className="space-y-4">
                    {customer.lat ? (
                      <div className="flex items-start space-x-3">
                        <span className="flex-1 text-sm font-medium text-gray-500 w-24 shrink-0">
                          Vĩ độ:
                        </span>
                        <span className="text-sm text-gray-900 flex-1 bg-linear-to-r from-blue-50 to-cyan-50 p-2 rounded-lg border border-blue-200">
                          {customer.lat}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-start space-x-3">
                        <span className="flex-1 text-sm font-medium text-gray-500 w-24 shrink-0">
                          Vĩ độ:
                        </span>
                        <span className="text-sm text-gray-400 flex-1 italic">
                          chưa có dữ liệu
                        </span>
                      </div>
                    )}
                    {customer.lng ? (
                      <div className="flex items-start space-x-3">
                        <span className="flex-1 text-sm font-medium text-gray-500 w-24 shrink-0">
                          Kinh độ:
                        </span>
                        <span className="text-sm text-gray-900 flex-1 bg-linear-to-r from-blue-50 to-cyan-50 p-2 rounded-lg border border-blue-200">
                          {customer.lng}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-start space-x-3">
                        <span className="flex-1 text-sm font-medium text-gray-500 w-24 shrink-0">
                          Kinh độ:
                        </span>
                        <span className="text-sm text-gray-400 flex-1 italic">
                          chưa có dữ liệu
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-8 py-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>
          {onEdit && (
            <button
              onClick={() => {
                onEdit(customer);
                onClose();
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <div className="flex items-center">
                <Edit className="w-5 h-5 mr-2" />
                Chỉnh sửa
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;
