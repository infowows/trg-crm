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
    name: string;
    code: string;
    note?: string;
    isActive: boolean;
}

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

    const [formData, setFormData] = useState({
        surveyDate: new Date().toISOString().split("T")[0],
        surveyAddress: "",
        surveyNotes: "",
    });

    useEffect(() => {
        loadCategoryGroups();
        loadCategoryItems();
    }, []);

    const loadCategoryGroups = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/category-groups?active=true", {
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
            const response = await fetch("/api/category-items?active=true", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
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
            newSurveys[index].volume = calculateVolume(
                length,
                width,
                coefficient,
            );
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
            name: `${groupName} - ${itemName}`,
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
            (survey) =>
                survey.name.trim() && survey.length > 0 && survey.width > 0,
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ngày khảo sát{" "}
                                <span className="text-red-500">*</span>
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
                                        <select
                                            onChange={(e) => {
                                                const [groupName, itemName] =
                                                    e.target.value.split("|");
                                                updateSurveyName(
                                                    index,
                                                    groupName,
                                                    itemName,
                                                );
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        >
                                            <option value="">
                                                Chọn nhóm hạng mục
                                            </option>
                                            {categoryGroups.map((group) => (
                                                <optgroup
                                                    key={group._id}
                                                    label={group.name}
                                                >
                                                    {categoryItems.map(
                                                        (item) => (
                                                            <option
                                                                key={item._id}
                                                                value={`${group.name}|${item.name}`}
                                                            >
                                                                {group.name} -{" "}
                                                                {item.name}
                                                            </option>
                                                        ),
                                                    )}
                                                </optgroup>
                                            ))}
                                        </select>
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
                                                updateSurvey(
                                                    index,
                                                    "unit",
                                                    e.target.value,
                                                )
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
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
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
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
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
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 1,
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
                                                updateSurvey(
                                                    index,
                                                    "note",
                                                    e.target.value,
                                                )
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

