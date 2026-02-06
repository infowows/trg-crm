"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Save,
  Trash2,
  Calendar,
  FileText,
  MapPin,
  ChevronDown,
  Handshake,
  User,
  Layers,
  ChevronUp,
  Search,
  X,
} from "lucide-react";

interface Survey {
  name: string;
  unit: "m2" | "m3";
  length: number;
  width: number;
  area: number;
  coefficient: number;
  volume: number;
  note?: string;
}

interface CategoryGroup {
  _id: string;
  name: string;
  code: string;
  note?: string;
  isActive: boolean;
}

interface CategoryItem {
  _id: string;
  groupId: any;
  name: string;
  code: string;
  note?: string;
  isActive: boolean;
}

const calculateVolume = (
  length: number,
  width: number,
  coefficient: number,
) => {
  return Math.round(length * width * coefficient * 100) / 100;
};

const calculateArea = (length: number, width: number) => {
  return Math.round(length * width * 100) / 100;
};

const CreateSurvey = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [surveyData, setSurveyData] = useState<Record<string, Survey>>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [groupSearchQuery, setGroupSearchQuery] = useState("");

  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    surveyDate: new Date().toISOString().split("T")[0],
    surveyAddress: "",
    surveyNotes: "",
    customerRef: "",
    opportunityRef: "",
  });

  useEffect(() => {
    loadCategoryGroups();
    loadCategoryItems();
    loadOpportunities();
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/customers?limit=1000", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const loadOpportunities = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/opportunities?limit=100&status=Open", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success || data.data) {
        setOpportunities(data.data || []);
      }
    } catch (error) {
      console.error("Error loading opportunities:", error);
    }
  };

  const loadCategoryGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/category-groups?isActive=true", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setCategoryGroups(data.data);
      }
    } catch (error) {
      console.error("Error loading category groups:", error);
    }
  };

  const loadCategoryItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "/api/category-items?isActive=true&limit=1000",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        setCategoryItems(data.data);
      }
    } catch (error) {
      console.error("Error loading category items:", error);
    }
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) newSet.delete(groupId);
      else newSet.add(groupId);
      return newSet;
    });
  };

  const updateSurveyItem = (itemId: string, field: string, value: any) => {
    setSurveyData((prev) => {
      const current = prev[itemId] || {
        name: "",
        unit: "m2",
        length: 0,
        width: 0,
        area: 0,
        coefficient: 1,
        volume: 0,
        note: "",
      };

      const newData = { ...current, [field]: value };

      if (["length", "width", "coefficient"].includes(field)) {
        const length = parseFloat(String(newData.length)) || 0;
        const width = parseFloat(String(newData.width)) || 0;
        const coefficient = parseFloat(String(newData.coefficient)) || 1;

        newData.area = calculateArea(length, width);
        newData.volume = calculateVolume(length, width, coefficient);
      }

      return { ...prev, [itemId]: newData };
    });
  };

  const getGroupColor = (index: number) => {
    const colors = [
      {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        icon: "bg-blue-100",
      },
      {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        icon: "bg-emerald-100",
      },
      {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        icon: "bg-amber-100",
      },
      {
        bg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-700",
        icon: "bg-purple-100",
      },
      {
        bg: "bg-pink-50",
        border: "border-pink-200",
        text: "text-pink-700",
        icon: "bg-pink-100",
      },
      {
        bg: "bg-indigo-50",
        border: "border-indigo-200",
        text: "text-indigo-700",
        icon: "bg-indigo-100",
      },
      {
        bg: "bg-cyan-50",
        border: "border-cyan-200",
        text: "text-cyan-700",
        icon: "bg-cyan-100",
      },
    ];
    return colors[index % colors.length];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter surveys with volume > 0
    const validSurveys = Object.values(surveyData).filter(
      (survey) => survey.name && survey.volume > 0,
    );

    if (validSurveys.length === 0) {
      toast.error(
        "Vui lòng nhập ít nhất một hạng mục khảo sát với đầy đủ thông tin",
      );
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const submitData = {
        surveys: validSurveys,
        surveyDate: formData.surveyDate,
        surveyAddress: formData.surveyAddress,
        surveyNotes: formData.surveyNotes,
        customerRef: formData.customerRef || null,
        opportunityRef: formData.opportunityRef || null,
      };

      const response = await fetch("/api/surveys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Tạo khảo sát thành công");
        router.push("/surveys");
      } else {
        toast.error(data.message || "Không thể tạo khảo sát");
      }
    } catch (error) {
      console.error("Error creating survey:", error);
      toast.error("Không thể tạo khảo sát");
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = categoryGroups.filter((group) =>
    group.name.toLowerCase().includes(groupSearchQuery.toLowerCase()),
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>
        <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
          Tạo Khảo sát Mới
        </h1>
        <p className="text-gray-600 font-medium opacity-80">
          Thiết lập thông tin khảo sát và tính toán khối lượng hạng mục
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Survey Information Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">
              Thông tin Khảo sát
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Khách hàng <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                <select
                  name="customerRef"
                  value={formData.customerRef}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customerRef: e.target.value,
                      opportunityRef: "",
                    })
                  }
                  required
                  className="pl-12 pr-4 py-3.5 w-full bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none appearance-none transition-all font-bold text-gray-900 shadow-sm"
                >
                  <option value="">-- Chọn Khách hàng --</option>
                  {customers.map((cust) => (
                    <option key={cust._id} value={cust._id}>
                      {cust.customerId} - {cust.fullName}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Cơ hội kinh doanh (Nguồn)
              </label>
              <div className="relative group">
                <Handshake className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                <select
                  name="opportunityRef"
                  value={formData.opportunityRef}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      opportunityRef: e.target.value,
                    })
                  }
                  disabled={!formData.customerRef}
                  className="pl-12 pr-4 py-3.5 w-full bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none appearance-none transition-all font-bold text-gray-900 disabled:opacity-50 shadow-sm"
                >
                  <option value="">-- Chọn Cơ hội kinh doanh --</option>
                  {opportunities
                    .filter((opp) => {
                      const custId = opp.customerRef?._id || opp.customerRef;
                      return custId === formData.customerRef;
                    })
                    .map((opp) => (
                      <option key={opp._id} value={opp._id}>
                        {opp.opportunityNo}
                      </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Ngày khảo sát <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="date"
                  name="surveyDate"
                  value={formData.surveyDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      surveyDate: e.target.value,
                    })
                  }
                  className="pl-12 pr-4 py-3.5 w-full bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-gray-900 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Địa chỉ khảo sát
              </label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  name="surveyAddress"
                  value={formData.surveyAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      surveyAddress: e.target.value,
                    })
                  }
                  className="pl-12 pr-4 py-3.5 w-full bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-gray-900 shadow-sm"
                  placeholder="Nhập địa chỉ khảo sát"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Ghi chú khảo sát
              </label>
              <div className="relative group">
                <FileText className="absolute left-4 top-4 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                <textarea
                  name="surveyNotes"
                  value={formData.surveyNotes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      surveyNotes: e.target.value,
                    })
                  }
                  className="pl-12 pr-4 py-4 w-full bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-gray-900 shadow-sm min-h-[120px]"
                  placeholder="Ghi chú thêm về điều kiện khảo sát, yêu cầu đặc biệt..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Survey Items Accordion Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">
                Hạng mục Khảo sát
              </h2>
            </div>

            {/* Filter Section */}
            <div className="relative group w-full sm:w-72">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Tìm nhanh nhóm hạng mục..."
                value={groupSearchQuery}
                onChange={(e) => setGroupSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-2xl focus:border-blue-600 outline-none transition-all text-sm font-medium shadow-sm"
              />
              {groupSearchQuery && (
                <button
                  type="button"
                  onClick={() => setGroupSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {filteredGroups.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-gray-900 font-bold mb-1">
                  Không tìm thấy kết quả
                </h3>
                <p className="text-gray-500 text-sm">
                  Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc
                </p>
              </div>
            ) : (
              filteredGroups.map((group, groupIndex) => {
                const isExpanded = expandedGroups.has(group._id);
                const groupItems = categoryItems.filter(
                  (item) => (item.groupId?._id || item.groupId) === group._id,
                );
                const color = getGroupColor(groupIndex);

                const itemsToRender =
                  groupItems.length > 0
                    ? groupItems
                    : [{ _id: group._id, name: group.name, isOnlyGroup: true }];

                return (
                  <div
                    key={group._id}
                    className={`rounded-3xl border ${color.border} overflow-hidden transition-all duration-300 shadow-sm bg-white`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleGroup(group._id)}
                      className={`w-full px-8 py-5 flex items-center justify-between ${color.bg} hover:opacity-90 transition-all`}
                    >
                      <div className="flex items-center gap-5">
                        <div
                          className={`p-3 ${color.icon} rounded-2xl shadow-inner-sm`}
                        >
                          <Layers className={`w-6 h-6 ${color.text}`} />
                        </div>
                        <div className="text-left">
                          <h3
                            className={`text-lg font-black ${color.text} uppercase tracking-tight`}
                          >
                            {group.name}
                          </h3>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider opacity-60">
                            {groupItems.length} hạng mục chi tiết
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className={`w-5 h-5 ${color.text}`} />
                      ) : (
                        <ChevronDown className={`w-5 h-5 ${color.text}`} />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                        {itemsToRender.map((item) => {
                          const itemId = item._id;
                          const itemName = (item as any).isOnlyGroup
                            ? group.name
                            : `${group.name} - ${item.name}`;
                          const itemData = surveyData[itemId] || {
                            name: itemName,
                            unit: "m2",
                            length: 0,
                            width: 0,
                            area: 0,
                            coefficient: 1,
                            volume: 0,
                            note: "",
                          };

                          if (!surveyData[itemId]) {
                            setSurveyData((prev) => ({
                              ...prev,
                              [itemId]: { ...itemData, name: itemName },
                            }));
                          }

                          return (
                            <div
                              key={itemId}
                              className="p-6 rounded-2xl border border-gray-100 bg-gray-50/20 hover:bg-gray-50 hover:border-gray-200 transition-all group/item"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <h4 className="font-bold text-gray-900 flex items-center gap-3 text-lg">
                                  <div
                                    className={`w-2.5 h-2.5 rounded-full ${color.text.replace("text", "bg")} shadow-sm`}
                                  ></div>
                                  {item.name}
                                </h4>
                                {itemData.volume > 0 && (
                                  <div className="flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-100 shadow-sm animate-in zoom-in duration-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-[11px] font-black uppercase tracking-tight">
                                      Đã nhập: {itemData.volume} {itemData.unit}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                                <div className="space-y-1.5">
                                  <label className="block text-[14px] font-black text-gray-400 uppercase tracking-widest ml-1 opacity-70">
                                    Đơn vị
                                  </label>
                                  <select
                                    value={itemData.unit}
                                    onChange={(e) =>
                                      updateSurveyItem(
                                        itemId,
                                        "unit",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none shadow-sm transition-all"
                                  >
                                    <option value="m2">m²</option>
                                    <option value="m3">m³</option>
                                  </select>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="block text-[14px] font-black text-gray-400 uppercase tracking-widest ml-1 opacity-70">
                                    Dài (m)
                                  </label>
                                  <input
                                    type="number"
                                    value={itemData.length || ""}
                                    onChange={(e) =>
                                      updateSurveyItem(
                                        itemId,
                                        "length",
                                        parseFloat(e.target.value) || 0,
                                      )
                                    }
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none shadow-sm transition-all"
                                    placeholder="0.0"
                                    step="0.1"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="block text-[14px] font-black text-gray-400 uppercase tracking-widest ml-1 opacity-70">
                                    Rộng (m)
                                  </label>
                                  <input
                                    type="number"
                                    value={itemData.width || ""}
                                    onChange={(e) =>
                                      updateSurveyItem(
                                        itemId,
                                        "width",
                                        parseFloat(e.target.value) || 0,
                                      )
                                    }
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none shadow-sm transition-all"
                                    placeholder="0.0"
                                    step="0.1"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="block text-[14px] font-black text-gray-400 uppercase tracking-widest ml-1 opacity-70">
                                    Hệ số
                                  </label>
                                  <input
                                    type="number"
                                    value={itemData.coefficient || ""}
                                    onChange={(e) =>
                                      updateSurveyItem(
                                        itemId,
                                        "coefficient",
                                        parseFloat(e.target.value) || 1,
                                      )
                                    }
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none shadow-sm transition-all"
                                    placeholder="1.0"
                                    step="0.01"
                                  />
                                </div>
                                <div className="col-span-2 space-y-1.5">
                                  <label className="block text-[14px] font-black text-gray-400 uppercase tracking-widest ml-1 opacity-70">
                                    Khối lượng ({itemData.unit})
                                  </label>
                                  <div className="px-5 py-2.5 bg-blue-600 rounded-xl text-sm font-black text-white flex justify-between items-center shadow-md shadow-blue-200 transition-all group-hover/item:scale-[1.02]">
                                    <span>{itemData.volume}</span>
                                    <span className="text-[9px] uppercase tracking-tighter opacity-70">
                                      Tự động tính
                                    </span>
                                  </div>
                                </div>
                                <div className="col-span-2 md:col-span-3 lg:col-span-6 space-y-1.5">
                                  <label className="block text-[14px] font-black text-gray-400 uppercase tracking-widest ml-1 opacity-70">
                                    Ghi chú
                                  </label>
                                  <input
                                    type="text"
                                    value={itemData.note || ""}
                                    onChange={(e) =>
                                      updateSurveyItem(
                                        itemId,
                                        "note",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none shadow-sm transition-all"
                                    placeholder="Nhập ghi chú chi tiết cho hạng mục này (nếu có)..."
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-5 pt-8 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-3.5 border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-3 px-10 py-3.5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:active:scale-100"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Save className="w-5 h-5" />
            )}
            {loading ? "Đang lưu hệ thống..." : "Lưu Phiếu Khảo sát"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSurvey;
