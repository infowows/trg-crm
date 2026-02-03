"use client";

import React, { useState } from "react";
import CustomerCareDetailModal from "./CustomerCareDetailModal";
import {
  X,
  Target,
  User,
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  LayoutList,
  Edit,
  History,
  Briefcase,
  Phone,
  Mail,
} from "lucide-react";

interface Opportunity {
  _id: string;
  opportunityNo: string;
  customerRef: {
    _id: string;
    fullName: string;
    customerId: string;
    phone?: string;
    email?: string;
  };
  demands: string[];
  unitPrice?: number;
  opportunityValue: number;
  probability: number;
  status: "Open" | "Closed" | "Lost";
  closingDate?: string;
  actualRevenue?: number;
  careHistory: any[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface OpportunityModalProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (id: string) => void;
}

const OpportunityModal = ({
  opportunity,
  isOpen,
  onClose,
  onEdit,
}: OpportunityModalProps) => {
  const [selectedCare, setSelectedCare] = useState<any>(null);
  const [showCareModal, setShowCareModal] = useState(false);

  // Reset state khi đóng modal chính
  React.useEffect(() => {
    if (!isOpen) {
      setShowCareModal(false);
      setSelectedCare(null);
    }
  }, [isOpen]);

  if (!isOpen || !opportunity) return null;

  const handleCloseAll = () => {
    setShowCareModal(false);
    setSelectedCare(null);
    onClose();
  };

  const handleOpenCareDetail = (care: any) => {
    setSelectedCare(care);
    setShowCareModal(true);
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      Open: {
        color: "bg-blue-100 text-blue-800",
        label: "Đang mở",
        icon: Clock,
      },
      Closed: {
        color: "bg-green-100 text-green-800",
        label: "Thành công",
        icon: CheckCircle,
      },
      Lost: {
        color: "bg-red-100 text-red-800",
        label: "Thất bại",
        icon: AlertCircle,
      },
    };
    const config = configs[status as keyof typeof configs];
    const Icon = config.icon;
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        <Icon className="w-4 h-4 mr-1.5" />
        {config.label}
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 transition-all duration-500 flex items-center justify-center p-4 z-50 overflow-hidden"
      onClick={handleCloseAll}
    >
      <div
        className={`flex items-start justify-center transition-all duration-500 gap-6 w-full h-[85vh] ${
          showCareModal ? "max-w-[98vw]" : "max-w-5xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Cơ hội chính */}
        <div
          className={`bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-500 ease-in-out shrink-0 h-full flex flex-col ${
            showCareModal ? "w-[48%] opacity-100" : "w-full opacity-100"
          }`}
        >
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">
                {opportunity.opportunityNo}
              </h2>
              {getStatusBadge(opportunity.status)}
            </div>
            <button
              onClick={handleCloseAll}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-4 flex items-center">
                    <User className="w-4 h-4 mr-2" /> Thông tin khách hàng
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase">
                        Tên khách hàng
                      </p>
                      <p className="text-lg font-bold text-blue-600 mt-1">
                        {opportunity.customerRef?.fullName}
                      </p>
                      <p className="text-sm text-gray-500 font-medium">
                        Mã KH: {opportunity.customerRef?.customerId}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-700">
                        <Phone className="w-4 h-4 mr-2 text-black" />
                        {opportunity.customerRef?.phone || "---"}
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <Mail className="w-4 h-4 mr-2 text-black" />
                        {opportunity.customerRef?.email || "---"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Demands */}
                <div className="bg-white rounded-xl p-5 border border-gray-100">
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-4 flex items-center">
                    <LayoutList className="w-4 h-4 mr-2" /> Nhu cầu dịch vụ
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.demands.length > 0 ? (
                      opportunity.demands.map((demand, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100"
                        >
                          {demand}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 italic text-sm">
                        Chưa xác định nhu cầu cụ thể
                      </p>
                    )}
                  </div>
                </div>

                {/* Care History */}
                <div className="bg-white rounded-xl p-5 border border-gray-100">
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-4 flex items-center">
                    <History className="w-4 h-4 mr-2 text-blue-600" /> Lịch sử
                    chăm sóc
                  </h3>
                  <div className="space-y-4">
                    {opportunity.careHistory &&
                    opportunity.careHistory.length > 0 ? (
                      opportunity.careHistory.map((care, idx) => (
                        <div
                          key={care._id}
                          className="relative pl-6 border-l-2 border-blue-100 pb-4 last:pb-0"
                        >
                          <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                          </div>

                          <div
                            onClick={() => handleOpenCareDetail(care)}
                            className={`bg-gray-50 rounded-lg p-3 border transition-all cursor-pointer group/item ${
                              selectedCare?._id === care._id
                                ? "border-blue-500 bg-blue-50 shadow-sm"
                                : "border-gray-100 hover:border-blue-300 hover:bg-blue-50/50"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="text-sm font-bold text-gray-900">
                                  {care.careType}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="flex items-center text-[11px] text-gray-500">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {care.timeFrom
                                      ? new Date(
                                          care.timeFrom,
                                        ).toLocaleDateString("vi-VN")
                                      : care.actualCareDate
                                        ? new Date(
                                            care.actualCareDate,
                                          ).toLocaleDateString("vi-VN")
                                        : "---"}
                                  </span>
                                  <span className="flex items-center text-[11px] text-gray-500">
                                    <User className="w-3 h-3 mr-1" />
                                    {care.carePerson}
                                  </span>
                                  <span className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-medium text-gray-600">
                                    {care.method}
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                  care.status === "Hoàn thành"
                                    ? "bg-green-100 text-green-700"
                                    : care.status === "Hủy"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {care.status}
                              </span>
                            </div>
                            {care.careResult && (
                              <div className="mt-2 pt-2 border-t border-blue-100/50">
                                <p className="text-xs text-gray-600 italic line-clamp-2">
                                  <span className="font-bold not-italic">
                                    Kết quả:{" "}
                                  </span>
                                  {care.careResult}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 text-sm italic">
                          Không có dữ liệu chăm sóc cụ thể
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-4 flex items-center">
                    <Briefcase className="w-4 h-4 mr-2" /> Số liệu kinh doanh
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-sky-50 rounded-xl border border-sky-100 text-center">
                      <p className="text-[10px] font-bold text-sky-600 uppercase">
                        Giá trị cơ hội (dự kiến)
                      </p>
                      <p className="text-xl font-black text-sky-900 mt-1">
                        {(opportunity.unitPrice || 0).toLocaleString("vi-VN")}đ
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                      <p className="text-[10px] font-bold text-blue-600 uppercase">
                        Doanh thu dự kiến ({opportunity.probability}%)
                      </p>
                      <p className="text-xl font-black text-blue-900 mt-1">
                        {opportunity.opportunityValue.toLocaleString("vi-VN")}đ
                      </p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                      <p className="text-[10px] font-bold text-purple-600 uppercase text-center mb-2">
                        Xác suất thành công
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-purple-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${opportunity.probability}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-black text-purple-900">
                          {opportunity.probability}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2 text-sm">
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500 flex items-center text-xs">
                          <Calendar className="w-3 h-3 mr-2" /> Dự kiến chốt:
                        </span>
                        <span className="font-bold text-gray-900 text-xs text-right">
                          {opportunity.closingDate
                            ? new Date(
                                opportunity.closingDate,
                              ).toLocaleDateString("vi-VN")
                            : "---"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500 flex items-center text-xs">
                          <Calendar className="w-3 h-3 mr-2" /> Ngày tạo:
                        </span>
                        <span className="font-medium text-gray-900 text-xs text-right">
                          {new Date(opportunity.createdAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-500 flex items-center text-xs">
                          <User className="w-3 h-3 mr-2" /> Người tạo:
                        </span>
                        <span className="font-medium text-gray-900 text-xs truncate max-w-[80px] text-right">
                          {opportunity.createdBy}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3 sticky bottom-0 bg-white">
            <button
              onClick={handleCloseAll}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Đóng
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(opportunity._id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </button>
            )}
          </div>
        </div>

        {/* Modal chi tiết CSKH hiển thị bên phải (Side-by-side) */}
        <div
          className={`transition-all duration-500 ease-in-out shrink-0 h-full ${
            showCareModal
              ? "w-[48%] opacity-100 translate-x-0"
              : "w-0 opacity-0 translate-x-32 pointer-events-none"
          }`}
        >
          <CustomerCareDetailModal
            isOpen={showCareModal}
            onClose={() => {
              setShowCareModal(false);
              setSelectedCare(null);
            }}
            item={selectedCare}
            hideOverlay={true}
          />
        </div>
      </div>
    </div>
  );
};

export default OpportunityModal;
