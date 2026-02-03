"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Target,
  ArrowLeft,
  User,
  DollarSign,
  TrendingUp,
  Calendar,
  Save,
  CheckCircle,
  Clock,
  LayoutList,
} from "lucide-react";
import { toast } from "react-toastify";
import Popup from "@/components/Popup";
import { formatNumberInput, parseNumberInput } from "@/lib/utils";

const CreateOpportunity = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [popup, setPopup] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const [formData, setFormData] = useState({
    customerRef: "",
    demands: [] as string[],
    unitPrice: 0,
    probability: 50,
    opportunityValue: 0,
    status: "Open",
    closingDate: "",
    description: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [custRes, servRes] = await Promise.all([
          fetch("/api/customers?limit=1000", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/services?limit=1000", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (custRes.ok) {
          const custData = await custRes.json();
          setCustomers(custData.data || []);
        }
        if (servRes.ok) {
          const servData = await servRes.json();
          setServices(servData.data || []);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    const newVal = name === "probability" ? Number(value) : value;
    setFormData((prev) => {
      const updated = { ...prev, [name]: newVal };
      if (name === "probability") {
        updated.opportunityValue = (prev.unitPrice * Number(value)) / 100;
      }
      return updated;
    });
  };

  const handleDemandToggle = (serviceName: string) => {
    setFormData((prev) => ({
      ...prev,
      demands: prev.demands.includes(serviceName)
        ? prev.demands.filter((d) => d !== serviceName)
        : [...prev.demands, serviceName],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerRef) {
      toast.error("Vui lòng chọn khách hàng");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setPopup({
          isOpen: true,
          title: "Thành công",
          message: "Tạo cơ hội kinh doanh mới thành công!",
          type: "success",
        });
        setTimeout(() => router.push("/opportunities"), 2000);
      } else {
        const err = await res.json();
        throw new Error(err.message || "Không thể tạo cơ hội");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Target className="w-6 h-6 mr-2 text-blue-600" />
              Tạo cơ hội mới
            </h1>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-black">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Thông tin khách hàng & Giá trị
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khách hàng *
                </label>
                <select
                  name="customerRef"
                  value={formData.customerRef}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">-- Chọn khách hàng --</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.fullName} ({c.customerId})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá trị cơ hội dự kiến (VNĐ)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="unitPrice"
                    value={formatNumberInput(formData.unitPrice)}
                    onChange={(e) => {
                      const rawValue = parseNumberInput(e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        unitPrice: rawValue,
                        opportunityValue: (rawValue * prev.probability) / 100,
                      }));
                    }}
                    className="w-full pl-10 pr-3 py-2 border border-blue-300 ring-1 ring-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-700"
                    placeholder="0"
                  />
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doanh thu dự kiến (Xác suất {formData.probability}%)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formatNumberInput(formData.opportunityValue)}
                    disabled
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 font-bold"
                  />
                  <TrendingUp className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400">
                    Auto
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xác suất chốt đơn (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="probability"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <Clock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-black">
              <LayoutList className="w-5 h-5 mr-2 text-blue-600" />
              Nhu cầu & Dịch vụ quan tâm
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {services.map((s) => (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => handleDemandToggle(s.serviceName)}
                  className={`px-3 py-2 rounded-lg text-sm transition text-left border ${
                    formData.demands.includes(s.serviceName)
                      ? "bg-blue-50 border-blue-500 text-blue-700 font-medium"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {s.serviceName}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-black">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Trạng thái & Thời hạn
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Open">Đang mở (Open)</option>
                  <option value="Closed">Thành công (Closed)</option>
                  <option value="Lost">Thất bại (Lost)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày dự kiến chốt
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="closingDate"
                    value={formData.closingDate}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-bold transition flex items-center justify-center ${
                loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? "Đang xử lý..." : "Lưu cơ hội"}
            </button>
          </div>
        </div>
      </form>

      <Popup
        isOpen={popup.isOpen}
        onClose={() => setPopup((prev) => ({ ...prev, isOpen: false }))}
        title={popup.title}
        message={popup.message}
        type={popup.type}
      />
    </div>
  );
};

export default CreateOpportunity;
