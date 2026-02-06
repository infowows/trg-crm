"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  ChevronDown,
  ChevronRight,
  Filter,
  Check,
  AlertCircle,
  Info,
} from "lucide-react";
import { toast } from "react-toastify";
import Popup from "@/components/Popup";
import { formatNumberInput, parseNumberInput } from "@/lib/utils";

const CreateOpportunityForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerIdFromUrl = searchParams.get("customer");
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [serviceGroups, setServiceGroups] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    customerRef: "",
    demands: [] as string[],
    unitPrice: 0,
    probability: 50,
    opportunityValue: 0,
    status: "Mới ghi nhận",
    closingDate: "",
    description: "",
  });

  const [selectedGroupFilter, setSelectedGroupFilter] = useState("all");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroupCollapse = (groupName: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [custRes, servRes, groupRes] = await Promise.all([
          fetch("/api/customers?limit=1000", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/services?limit=1000&active=true", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/service-groups?limit=100&status=active", {
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
        if (groupRes.ok) {
          const groupData = await groupRes.json();
          setServiceGroups(groupData.data || []);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (customerIdFromUrl) {
      setFormData((prev) => ({
        ...prev,
        customerRef: customerIdFromUrl,
      }));
    }
  }, [customerIdFromUrl]);

  // Group services by service group
  const groupedServices = React.useMemo(() => {
    const groups: Record<string, any[]> = {};

    // Khởi tạo các group từ danh sách serviceGroups để giữ thứ tự
    serviceGroups.forEach((g) => {
      groups[g.name] = [];
    });

    // Phân loại services vào groups
    services.forEach((s) => {
      const groupName = s.serviceGroup || "Khác";
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(s);
    });

    // Filter based on selected category if filter is active
    let filteredEntries = Object.entries(groups).filter(
      ([_, items]) => items.length > 0,
    );

    if (selectedGroupFilter !== "all") {
      filteredEntries = filteredEntries.filter(
        ([name]) => name === selectedGroupFilter,
      );
    }

    return filteredEntries;
  }, [services, serviceGroups, selectedGroupFilter]);

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
        toast.success("Tạo cơ hội kinh doanh mới thành công!");
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

  const getGroupColors = (index: number) => {
    const palette = [
      {
        icon: "bg-blue-100 text-blue-600",
        bg: "bg-blue-300/30",
        border: "border-blue-100",
        badge: "bg-blue-600 text-white",
        text: "text-blue-900",
      },
      {
        icon: "bg-purple-100 text-purple-600",
        bg: "bg-purple-300/30",
        border: "border-purple-100",
        badge: "bg-purple-600 text-white",
        text: "text-purple-900",
      },
      {
        icon: "bg-emerald-100 text-emerald-600",
        bg: "bg-emerald-300/30",
        border: "border-emerald-100",
        badge: "bg-emerald-600 text-white",
        text: "text-emerald-900",
      },
      {
        icon: "bg-orange-100 text-orange-600",
        bg: "bg-orange-300/30",
        border: "border-orange-100",
        badge: "bg-orange-600 text-white",
        text: "text-orange-900",
      },
      {
        icon: "bg-indigo-100 text-indigo-600",
        bg: "bg-indigo-300/30",
        border: "border-indigo-100",
        badge: "bg-indigo-600 text-white",
        text: "text-indigo-900",
      },
      {
        icon: "bg-rose-100 text-rose-600",
        bg: "bg-rose-300/30",
        border: "border-rose-100",
        badge: "bg-rose-600 text-white",
        text: "text-rose-900",
      },
      {
        icon: "bg-amber-100 text-amber-600",
        bg: "bg-amber-300/30",
        border: "border-amber-100",
        badge: "bg-amber-600 text-white",
        text: "text-amber-900",
      },
      {
        icon: "bg-cyan-100 text-cyan-600",
        bg: "bg-cyan-300/30",
        border: "border-cyan-100",
        badge: "bg-cyan-600 text-white",
        text: "text-cyan-900",
      },
    ];
    return palette[index % palette.length];
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32 tracking-tight font-sans">
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 mx-6 mt-6">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mr-4">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tạo cơ hội mới
              </h1>
              <p className="text-gray-500 text-sm font-medium">
                Bắt đầu hành trình chinh phục khách hàng
              </p>
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6"
      >
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Customer Info & Value */}
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <User className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-bold text-gray-900 uppercase">
                Thông tin khách hàng & Giá trị
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Khách hàng <span className="text-red-500">*</span>
                </label>
                <select
                  name="customerRef"
                  value={formData.customerRef}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-black"
                  required
                >
                  <option value="">-- Chọn khách hàng --</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id} className="text-black">
                      {c.fullName} ({c.customerId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Giá trị cơ hội (VNĐ)
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
                    className="w-full pl-12 pr-4 py-3 bg-blue-50/50 border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-700 text-lg"
                    placeholder="0"
                  />
                  <DollarSign className="absolute left-4 top-4 w-5 h-5 text-blue-500" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Xác suất chốt đơn (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="probability"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        probability: val,
                        opportunityValue: (prev.unitPrice * val) / 100,
                      }));
                    }}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-black"
                  />
                  <TrendingUp className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-emerald-100 rounded-xl mr-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                        Doanh thu dự kiến
                      </p>
                      <p className="text-xl font-bold text-emerald-800 tabular-nums">
                        {formatNumberInput(formData.opportunityValue)}{" "}
                        <span className="text-xs font-medium">VNĐ</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 uppercase">
                      Tính theo xác suất {formData.probability}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Services & Demands */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-50 rounded-lg mr-3">
                  <LayoutList className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 uppercase">
                    Nhu cầu & Dịch vụ quan tâm
                  </h2>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Lựa chọn các gói dịch vụ khách hàng đang quan tâm
                  </p>
                </div>
              </div>

              {/* Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedGroupFilter("all")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    selectedGroupFilter === "all"
                      ? "bg-gray-900 border-gray-900 text-white shadow-md"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  Tất cả
                </button>
                {serviceGroups.map((group) => (
                  <button
                    key={group._id}
                    type="button"
                    onClick={() => setSelectedGroupFilter(group.name)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      selectedGroupFilter === group.name
                        ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {group.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-2 space-y-2 bg-gray-50/50">
              {groupedServices.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-xl">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <Info className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    Không tìm thấy dịch vụ nào trong nhóm này
                  </p>
                </div>
              ) : (
                groupedServices.map(([groupName, groupItems], index) => {
                  const isExpanded = expandedGroups.has(groupName);
                  const selectedInGroup = groupItems.filter((s) =>
                    formData.demands.includes(s.serviceName),
                  ).length;
                  const colors = getGroupColors(index);

                  return (
                    <div
                      key={groupName}
                      className={`rounded-xl border transition-all overflow-hidden ${isExpanded ? `${colors.bg} ${colors.border}` : "bg-white border-gray-100"}`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleGroupCollapse(groupName)}
                        className={`w-full px-6 py-4 flex items-center justify-between transition-all ${
                          isExpanded ? "bg-white/40" : `hover:${colors.bg}`
                        }`}
                      >
                        <div className="flex items-center font-bold">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 transition-all ${colors.icon}`}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </div>
                          <span
                            className={`text-sm font-extrabold uppercase tracking-tight ${isExpanded ? colors.text : "text-gray-900"}`}
                          >
                            {groupName}
                          </span>
                          {selectedInGroup > 0 && (
                            <span
                              className={`ml-3 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm ${colors.badge}`}
                            >
                              {selectedInGroup} đã chọn
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-gray-400">
                          {groupItems.length} dịch vụ
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-6 pt-2 border-t border-gray-50">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                            {groupItems.map((s) => {
                              const isSelected = formData.demands.includes(
                                s.serviceName,
                              );
                              return (
                                <button
                                  key={s._id}
                                  type="button"
                                  onClick={() =>
                                    handleDemandToggle(s.serviceName)
                                  }
                                  className={`group relative px-4 py-4 rounded-2xl text-sm transition-all duration-300 text-left border overflow-hidden ${
                                    isSelected
                                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 scale-[1.02]"
                                      : "bg-white border-gray-100 text-gray-600 hover:border-blue-300 hover:shadow-md hover:bg-gray-50/50"
                                  }`}
                                >
                                  <div className="relative z-10 flex flex-col h-full justify-between">
                                    <span
                                      className={`text-[18px] font-medium leading-tight ${isSelected ? "text-white" : "text-gray-900 group-hover:text-blue-600"}`}
                                    >
                                      {s.serviceName}
                                    </span>
                                    <div className="flex items-center justify-between mt-3">
                                      <span
                                        className={`text-[10px] font-bold opacity-60 ${isSelected ? "text-blue-100" : "text-gray-400"}`}
                                      >
                                        {s.code}
                                      </span>
                                      {isSelected && (
                                        <Check className="w-3.5 h-3.5 text-white" />
                                      )}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-1 h-full">
          <div className="flex flex-col h-full gap-6 relative">
            {/* Project Status & Timeline Card */}
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <Clock className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-bold text-gray-900 uppercase">
                  Trạng thái & Thời hạn
                </h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 leading-none">
                    Trạng thái dự án
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-black"
                  >
                    <option value="Mới ghi nhận">Mới ghi nhận</option>
                    <option value="Đang tư vấn">Đang tư vấn</option>
                    <option value="Đã gửi đề xuất">Đã gửi đề xuất</option>
                    <option value="Chờ quyết định">Chờ quyết định</option>
                    <option value="Thành công">Thành công</option>
                    <option value="Không thành công">Không thành công</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 leading-none">
                    Ngày dự kiến chốt
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="closingDate"
                      value={formData.closingDate}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-black"
                    />
                    <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <label className="text-sm font-bold text-gray-700 leading-none">
                    Mô tả thêm / Ghi chú
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Ghi nhận thêm thông tin về cơ hội này..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-black font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Spacer to push action bar down in the sticky flow */}
            <div className="flex-1 min-h-[50px]"></div>

            {/* Sticky/Fixed Bottom Action Bar - Constrained to Sidebar Width */}
            <div className="sticky bottom-6 z-50">
              <div className="bg-white/90 backdrop-blur-xl border border-blue-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2.5rem] p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between px-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">
                      Dịch vụ đã chọn
                    </span>
                    <span className="text-2xl font-extrabold text-blue-600 tabular-nums">
                      {formData.demands.length}
                    </span>
                  </div>
                  <div className="h-10 w-px bg-gray-100"></div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">
                      Dự kiến doanh thu
                    </span>
                    <span className="text-xl font-bold text-emerald-600 tabular-nums">
                      {formatNumberInput(formData.opportunityValue)}
                      <span className="text-[10px] font-bold opacity-60 ml-1">
                        VND
                      </span>
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-2xl text-white font-bold text-lg transition-all shadow-xl flex items-center justify-center active:scale-95 ${
                    loading
                      ? "bg-gray-400"
                      : "bg-blue-600 hover:bg-blue-700 shadow-blue-400/30"
                  }`}
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-3" />
                      Lưu cơ hội
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const CreateOpportunity = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <CreateOpportunityForm />
    </Suspense>
  );
};

export default CreateOpportunity;
