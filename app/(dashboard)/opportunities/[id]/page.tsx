"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Target,
  ArrowLeft,
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

const OpportunityDetail = () => {
  const params = useParams();
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/opportunities/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setOpportunity(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchOpportunity();
  }, [params.id]);

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  if (!opportunity)
    return (
      <div className="p-10 text-center text-gray-500">
        Không tìm thấy thông tin cơ hội
      </div>
    );

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {opportunity.opportunityNo}
                </h1>
                {getStatusBadge(opportunity.status)}
              </div>
              <p className="text-gray-600 mt-1">Chi tiết cơ hội kinh doanh</p>
            </div>
          </div>
          <button
            onClick={() =>
              router.push(`/opportunities/${opportunity._id}/edit`)
            }
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa cơ hội
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Thông tin khách hàng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên khách hàng
                  </p>
                  <p
                    className="text-lg font-semibold text-blue-600 mt-1 cursor-pointer hover:underline"
                    onClick={() => router.push(`/customers`)}
                  >
                    {opportunity.customerRef?.fullName}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã khách hàng
                  </p>
                  <p className="font-medium text-gray-900 mt-1">
                    {opportunity.customerRef?.customerId}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số điện thoại
                  </p>
                  <p className="font-medium text-gray-900 mt-1">
                    {opportunity.customerRef?.phone || "---"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </p>
                  <p className="font-medium text-gray-900 mt-1">
                    {opportunity.customerRef?.email || "---"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center">
              <LayoutList className="w-5 h-5 mr-2 text-blue-600" />
              Nhu cầu dịch vụ
            </h2>
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
                <p className="text-gray-500 italic">
                  Chưa xác định nhu cầu cụ thể
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center">
              <History className="w-5 h-5 mr-2 text-blue-600" />
              Lịch sử chăm sóc liên quan
            </h2>
            <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <History className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">
                Không có dữ liệu chăm sóc trực tiếp cho cơ hội này
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
              Số liệu kinh doanh
            </h2>
            <div className="space-y-6">
              <div className="p-4 bg-sky-50 rounded-xl border border-sky-100">
                <p className="text-xs font-semibold text-sky-600 uppercase">
                  Giá trị cơ hội (dự kiến)
                </p>
                <p className="text-2xl font-bold text-sky-900 mt-1">
                  {(opportunity.unitPrice || 0).toLocaleString("vi-VN")}đ
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs font-semibold text-blue-600 uppercase">
                  Doanh thu dự kiến ({opportunity.probability}%)
                </p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {opportunity.opportunityValue.toLocaleString("vi-VN")}đ
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <p className="text-xs font-semibold text-purple-600 uppercase">
                  Xác suất thành công
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 bg-purple-200 rounded-full h-2.5">
                    <div
                      className="bg-purple-600 h-2.5 rounded-full"
                      style={{ width: `${opportunity.probability}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-bold text-purple-900">
                    {opportunity.probability}%
                  </span>
                </div>
              </div>
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" /> Ngày dự kiến chốt:
                  </span>
                  <span className="font-semibold text-gray-900">
                    {opportunity.closingDate
                      ? new Date(opportunity.closingDate).toLocaleDateString(
                          "vi-VN",
                        )
                      : "Chưa đặt"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-t pt-4">
                  <span className="text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" /> Ngày tạo:
                  </span>
                  <span className="font-medium text-gray-900">
                    {new Date(opportunity.createdAt).toLocaleDateString(
                      "vi-VN",
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 flex items-center">
                    <User className="w-4 h-4 mr-2" /> Người tạo:
                  </span>
                  <span className="font-medium text-gray-900">
                    {opportunity.createdBy}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetail;
