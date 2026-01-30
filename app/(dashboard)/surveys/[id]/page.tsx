"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import {
    ArrowLeft,
    Edit,
    Trash2,
    FileText,
    Calendar,
    MapPin,
    CheckCircle,
    Clock,
    AlertCircle,
    FileCheck,
    Plus,
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

interface SurveyData {
    _id: string;
    surveyNo: string;
    surveys: Survey[];
    quotationNo: string | null;
    status: "draft" | "surveyed" | "quoted" | "completed";
    surveyDate: string;
    surveyAddress?: string;
    surveyNotes?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

const SurveyDetail = () => {
    const router = useRouter();
    const params = useParams();
    const [surveyId, setSurveyId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        const initializeSurveyId = async () => {
            const resolvedParams = await params;
            const id = Array.isArray(resolvedParams.id)
                ? resolvedParams.id[0]
                : resolvedParams.id;
            setSurveyId(id || "");
        };

        initializeSurveyId();
    }, [params]);

    useEffect(() => {
        if (surveyId && surveyId.trim() !== "") {
            loadSurvey();
        }
    }, [surveyId]);

    const loadSurvey = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/surveys/${surveyId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                setSurveyData(data.data);
            } else {
                toast.error(data.message || "Không thể tải thông tin khảo sát");
                router.push("/surveys");
            }
        } catch (error) {
            console.error("Error loading survey:", error);
            toast.error("Không thể tải thông tin khảo sát");
            router.push("/surveys");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!surveyData) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/surveys/${surveyData._id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                toast.success("Xóa khảo sát thành công");
                setShowDeleteModal(false);
                router.push("/surveys");
            } else {
                toast.error(data.message || "Không thể xóa khảo sát");
            }
        } catch (error) {
            console.error("Error deleting survey:", error);
            toast.error("Không thể xóa khảo sát");
        }
    };

    const getStatusConfig = (status: string) => {
        const configs = {
            draft: {
                color: "bg-gray-100 text-gray-800",
                icon: FileText,
                label: "Bản nháp",
            },
            surveyed: {
                color: "bg-blue-100 text-blue-800",
                icon: CheckCircle,
                label: "Đã khảo sát",
            },
            quoted: {
                color: "bg-green-100 text-green-800",
                icon: FileCheck,
                label: "Đã báo giá",
            },
            completed: {
                color: "bg-purple-100 text-purple-800",
                icon: CheckCircle,
                label: "Hoàn thành",
            },
        };

        return configs[status as keyof typeof configs] || configs.draft;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const calculateTotalVolume = () => {
        if (!surveyData) return 0;
        return surveyData.surveys.reduce((total, survey) => total + survey.volume, 0);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!surveyData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Không tìm thấy khảo sát
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Khảo sát bạn tìm không tồn tại hoặc đã bị xóa.
                    </p>
                    <button
                        onClick={() => router.push("/surveys")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(surveyData.status);
    const StatusIcon = statusConfig.icon;
    const totalVolume = calculateTotalVolume();

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
                            Chi tiết Khảo sát
                        </h1>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-600">
                                Số khảo sát: <span className="font-medium">{surveyData.surveyNo}</span>
                            </span>
                            <span className="flex items-center gap-1 text-black">
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
                        {surveyData.status === "surveyed" && !surveyData.quotationNo && (
                            <button
                                onClick={() =>
                                    router.push(`/quotations/tao-moi?survey=${surveyData._id}`)
                                }
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Tạo Báo giá
                            </button>
                        )}
                        {surveyData.quotationNo && (
                            <button
                                onClick={() => router.push(`/quotations`)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <FileCheck className="w-4 h-4" />
                                Xem Báo giá
                            </button>
                        )}
                        {!surveyData.quotationNo && (
                            <>
                                <button
                                    onClick={() => router.push(`/surveys/${surveyData._id}/edit`)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    Chỉnh sửa
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Xóa
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Survey Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Thông tin Khảo sát
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Ngày khảo sát</p>
                                    <p className="font-medium">{formatDate(surveyData.surveyDate)}</p>
                                </div>
                            </div>
                            {surveyData.surveyAddress && (
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Địa chỉ</p>
                                        <p className="font-medium">{surveyData.surveyAddress}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Người tạo</p>
                                    <p className="font-medium">{surveyData.createdBy}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Ngày cập nhật</p>
                                    <p className="font-medium">{formatDate(surveyData.updatedAt)}</p>
                                </div>
                            </div>
                        </div>
                        {surveyData.surveyNotes && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-500 mb-2">Ghi chú khảo sát</p>
                                <p className="text-gray-900">{surveyData.surveyNotes}</p>
                            </div>
                        )}
                    </div>

                    {/* Survey Items */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Hạng mục Khảo sát
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 text-sm font-medium text-gray-700">
                                            Hạng mục
                                        </th>
                                        <th className="text-center py-2 text-sm font-medium text-gray-700">
                                            Đơn vị
                                        </th>
                                        <th className="text-center py-2 text-sm font-medium text-gray-700">
                                            Kích thước
                                        </th>
                                        <th className="text-center py-2 text-sm font-medium text-gray-700">
                                            Hệ số
                                        </th>
                                        <th className="text-center py-2 text-sm font-medium text-gray-700">
                                            Diện tích
                                        </th>
                                        <th className="text-center py-2 text-sm font-medium text-gray-700">
                                            Khối lượng
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {surveyData.surveys.map((survey, index) => (
                                        <tr key={index} className="border-b border-gray-100 text-black">
                                            <td className="py-3">
                                                <div>
                                                    <p className="font-medium">{survey.name}</p>
                                                    {survey.note && (
                                                        <p className="text-sm text-gray-500">{survey.note}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 text-center">{survey.unit}</td>
                                            <td className="py-3 text-center">
                                                {survey.length} × {survey.width}
                                            </td>
                                            <td className="py-3 text-center">{survey.coefficient}</td>
                                            <td className="py-3 text-center">{survey.area} m²</td>
                                            <td className="py-3 text-center font-medium">
                                                {survey.volume} {survey.unit}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-black">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Tổng hợp
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Số hạng mục:</span>
                                <span className="font-medium">{surveyData.surveys.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tổng khối lượng:</span>
                                <span className="font-medium">{totalVolume.toFixed(2)} m²/m³</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Trạng thái:</span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}>
                                    {statusConfig.label}
                                </span>
                            </div>
                            {surveyData.quotationNo && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Báo giá:</span>
                                    <span className="font-medium text-green-600">{surveyData.quotationNo}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Thao tác
                        </h2>
                        <div className="space-y-3">
                            {surveyData.status === "surveyed" && !surveyData.quotationNo && (
                                <button
                                    onClick={() =>
                                        router.push(`/quotations/tao-moi?survey=${surveyData._id}`)
                                    }
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Tạo Báo giá
                                </button>
                            )}
                            {!surveyData.quotationNo && (
                                <button
                                    onClick={() => router.push(`/surveys/${surveyData._id}/edit`)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    Chỉnh sửa
                                </button>
                            )}
                            {!surveyData.quotationNo && (
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Xóa
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
                            Xác nhận xóa khảo sát
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn xóa khảo sát "{surveyData.surveyNo}"?
                            Hành động này không thể hoàn tác.
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

export default SurveyDetail;
