"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Calculator,
  Calendar,
  FileText,
  MapPin,
  Search,
  ChevronDown,
  Check,
  X,
  Handshake,
} from "lucide-react";
import { useRef } from "react";

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

const CategorySearchSelect = ({
  categoryGroups,
  categoryItems,
  onSelect,
  placeholder = "Chọn hạng mục...",
  value = "",
}: {
  categoryGroups: CategoryGroup[];
  categoryItems: CategoryItem[];
  onSelect: (groupName: string, itemName: string) => void;
  placeholder?: string;
  value?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredGroups = categoryGroups
    .map((group) => {
      const items = categoryItems.filter(
        (item) =>
          (item.groupId?._id || item.groupId) === group._id &&
          (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            group.name.toLowerCase().includes(searchTerm.toLowerCase())),
      );

      // Nếu không tìm thấy item nhưng group name khớp thì vẫn hiện group (nếu group không có item con)
      const isGroupMatch =
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        categoryItems.filter((i) => (i.groupId?._id || i.groupId) === group._id)
          .length === 0;

      return { ...group, items, isGroupMatch };
    })
    .filter((g) => g.items.length > 0 || g.isGroupMatch);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:border-blue-400 transition-all cursor-pointer shadow-sm group"
      >
        <span
          className={`truncate ${value ? "text-gray-900 font-medium" : "text-gray-400"}`}
        >
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 origin-top">
          <div className="p-3 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              className="w-full bg-transparent border-none outline-none text-sm placeholder:text-gray-400"
              placeholder="Tìm tên nhóm hoặc hạng mục..."
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <X
                className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm("");
                }}
              />
            )}
          </div>
          <div className="max-h-72 overflow-y-auto custom-scrollbar p-2">
            {filteredGroups.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm italic">
                Không tìm thấy kết quả phù hợp
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div key={group._id} className="mb-2 last:mb-0">
                  {group.items.length > 0 ? (
                    <>
                      <div className="px-3 py-1 text-[11px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50/50 rounded-lg mb-1">
                        {group.name}
                      </div>
                      <div className="space-y-0.5">
                        {group.items.map((item) => {
                          const fullName = `${group.name} - ${item.name}`;
                          const isSelected = value === fullName;
                          return (
                            <div
                              key={item._id}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer ${isSelected ? "bg-blue-600 text-white" : "hover:bg-blue-50 text-gray-700 hover:text-blue-700"}`}
                              onClick={() => {
                                onSelect(group.name, item.name);
                                setIsOpen(false);
                              }}
                            >
                              <span>{item.name}</span>
                              {isSelected && <Check className="w-4 h-4" />}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${value === group.name ? "bg-blue-600 text-white" : "hover:bg-blue-50 text-gray-900 group"}`}
                      onClick={() => {
                        onSelect(group.name, "");
                        setIsOpen(false);
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${value === group.name ? "bg-white" : "bg-blue-500"}`}
                        />
                        {group.name}
                      </span>
                      {value === group.name && <Check className="w-4 h-4" />}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CreateSurvey = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([
    {
      name: "",
      unit: "m2",
      length: 0,
      width: 0,
      area: 0,
      coefficient: 1,
      volume: 0,
      note: "",
    },
  ]);

  const [customerCares, setCustomerCares] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    surveyDate: new Date().toISOString().split("T")[0],
    surveyAddress: "",
    surveyNotes: "",
    careRef: "",
  });

  useEffect(() => {
    loadCategoryGroups();
    loadCategoryItems();
    loadCustomerCares();
  }, []);

  const loadCustomerCares = async () => {
    try {
      const token = localStorage.getItem("token");
      // Load all available customer plans (limit 100 for now, or implement search later)
      const response = await fetch("/api/customer-care?limit=100", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success || data.data) {
        setCustomerCares(data.data || []);
      }
      // console.log("CSKH:", data);
    } catch (error) {
      console.error("Error loading customer cares:", error);
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

  const updateSurvey = (index: number, field: string, value: any) => {
    const newSurveys = [...surveys];
    newSurveys[index] = { ...newSurveys[index], [field]: value };

    // Tự động tính toán khi thay đổi các trường liên quan
    if (["length", "width", "coefficient"].includes(field)) {
      const length = parseFloat(String(newSurveys[index].length)) || 0;
      const width = parseFloat(String(newSurveys[index].width)) || 0;
      const coefficient =
        parseFloat(String(newSurveys[index].coefficient)) || 1;

      newSurveys[index].area = calculateArea(length, width);
      newSurveys[index].volume = calculateVolume(length, width, coefficient);
    }

    setSurveys(newSurveys);
  };

  const updateSurveyName = (
    index: number,
    groupName: string,
    itemName: string,
  ) => {
    const newSurveys = [...surveys];
    newSurveys[index] = {
      ...newSurveys[index],
      name: itemName ? `${groupName} - ${itemName}` : groupName,
    };
    setSurveys(newSurveys);
  };

  const addSurvey = () => {
    setSurveys([
      ...surveys,
      {
        name: "",
        unit: "m2",
        length: 0,
        width: 0,
        area: 0,
        coefficient: 1,
        volume: 0,
        note: "",
      },
    ]);
  };

  const removeSurvey = (index: number) => {
    if (surveys.length > 1) {
      setSurveys(surveys.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate surveys
    const validSurveys = surveys.filter(
      (survey) => survey.name.trim() && survey.length > 0 && survey.width > 0,
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
        careRef: formData.careRef || null,
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

  return (
    <div className="p-6 bg-white">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Tạo Khảo sát Mới
        </h1>
        <p className="text-gray-600">
          Tạo khảo sát dự án mới để tính toán khối lượng
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Survey Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin Khảo sát
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kế hoạch CSKH (Nguồn)
              </label>
              <div className="relative">
                <Handshake className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  name="careRef"
                  value={formData.careRef}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      careRef: e.target.value,
                    })
                  }
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
                >
                  <option value="">
                    -- Chọn khách hàng / Kế hoạch CSKH --
                  </option>
                  {customerCares.map((care) => (
                    <option key={care._id} value={care._id}>
                      {care.careId} - {care.carePerson} ({care.careType})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày khảo sát <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ khảo sát
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Địa chỉ khảo sát"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú khảo sát
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  name="surveyNotes"
                  value={formData.surveyNotes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      surveyNotes: e.target.value,
                    })
                  }
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Ghi chú chi tiết về khảo sát"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Survey Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Hạng mục Khảo sát
            </h2>
            <button
              type="button"
              onClick={addSurvey}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Thêm hạng mục
            </button>
          </div>

          <div className="space-y-6">
            {surveys.map((survey, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 mr-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn Nhóm hạng mục
                    </label>
                    <CategorySearchSelect
                      categoryGroups={categoryGroups}
                      categoryItems={categoryItems}
                      value={survey.name}
                      onSelect={(groupName, itemName) =>
                        updateSurveyName(index, groupName, itemName)
                      }
                      placeholder="Gõ để tìm theo tên nhóm/hạng mục..."
                    />
                  </div>
                  {surveys.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSurvey(index)}
                      className="text-red-600 hover:text-red-800 mt-6"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  Tên hạng mục:{" "}
                  <span className="font-medium">
                    {survey.name || "Chưa chọn"}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đơn vị
                    </label>
                    <select
                      value={survey.unit}
                      onChange={(e) =>
                        updateSurvey(index, "unit", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="m2">m²</option>
                      <option value="m3">m³</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chiều dài (m)
                    </label>
                    <input
                      type="number"
                      value={survey.length}
                      onChange={(e) =>
                        updateSurvey(
                          index,
                          "length",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chiều rộng (m)
                    </label>
                    <input
                      type="number"
                      value={survey.width}
                      onChange={(e) =>
                        updateSurvey(
                          index,
                          "width",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hệ số
                    </label>
                    <input
                      type="number"
                      value={survey.coefficient}
                      onChange={(e) =>
                        updateSurvey(
                          index,
                          "coefficient",
                          parseFloat(e.target.value) || 1,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Diện tích (tự động tính)
                    </label>
                    <input
                      type="text"
                      value={`${survey.area} (m²)`}
                      readOnly
                      className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Khối lượng (tự động tính)
                    </label>
                    <input
                      type="text"
                      value={`${survey.volume} ${survey.unit}`}
                      readOnly
                      className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg text-black"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú
                    </label>
                    <input
                      type="text"
                      value={survey.note || ""}
                      onChange={(e) =>
                        updateSurvey(index, "note", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Ghi chú cho hạng mục này"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? "Đang lưu..." : "Lưu Khảo sát"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSurvey;
