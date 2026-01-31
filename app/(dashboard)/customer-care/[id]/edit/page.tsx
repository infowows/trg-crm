"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  User,
  Calendar,
  MapPin,
  FileText,
} from "lucide-react";
import { toast } from "react-toastify";

interface Customer {
  _id: string;
  customerCode: string;
  fullName: string;
  phone: string;
  address: string;
}

interface FormData {
  careId: string;
  customerId: string;
  careType: string;
  timeFrom: string;
  timeTo: string;
  method: "Online" | "Trực tiếp";
  location: string;
  carePerson: string;
  discussionContent: string;
  needsNote: string;
  interestedServices: string;
  status: "Chờ báo cáo" | "Hoàn thành" | "Hủy";
}

const formatDateForInput = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  // Format YYYY-MM-DDThh:mm for datetime-local
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const EditCustomerCare = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchCustomer, setSearchCustomer] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const [formData, setFormData] = useState<FormData>({
    careId: "",
    customerId: "",
    careType: "Khảo sát nhu cầu",
    timeFrom: "",
    timeTo: "",
    method: "Online",
    location: "",
    carePerson: "",
    discussionContent: "",
    needsNote: "",
    interestedServices: "",
    status: "Chờ báo cáo",
  });

  useEffect(() => {
    fetchCustomers();
    fetchCareDetail();
  }, [id]);

  const fetchCareDetail = async () => {
    try {
      setInitialLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/customer-care/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data;

        setFormData({
          careId: data.careId || "",
          customerId: data.customerId || "",
          careType: data.careType || "Khảo sát nhu cầu",
          timeFrom: formatDateForInput(data.timeFrom),
          timeTo: formatDateForInput(data.timeTo),
          method: data.method || "Online",
          location: data.location || "",
          carePerson: data.carePerson || "",
          discussionContent: data.discussionContent || "",
          needsNote: data.needsNote || "",
          interestedServices: data.interestedServices || "",
          status: data.status || "Chờ báo cáo",
        });

        // If customerId exists, try to find/set search text (basic implementation)
        // Ideally we fetch the specific customer details if not in list
        // For simplicity, we assume we might need to search again or just show ID if not found
      } else {
        toast.error("Không thể tải thông tin kế hoạch");
        router.push("/customer-care");
      }
    } catch (error) {
      console.error("Error fetching detail:", error);
      toast.error("Lỗi khi tải dữ liệu");
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchCustomers = async (search = "") => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({ limit: "20" });
      if (search) params.append("search", search);

      const response = await fetch(`/api/customers?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleCustomerSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchCustomer(value);
    setShowCustomerDropdown(true);
    fetchCustomers(value);
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData((prev) => ({ ...prev, customerId: customer._id }));
    setSearchCustomer(customer.fullName);
    setShowCustomerDropdown(false);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/customer-care/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Cập nhật kế hoạch CSKH thành công");
        router.push("/customer-care");
      } else {
        toast.error(data.message || "Không thể cập nhật kế hoạch");
      }
    } catch (error) {
      console.error("Error updating customer care:", error);
      toast.error("Đã xảy ra lỗi khi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>

        <h1 className="text-2xl font-bold text-gray-900">
          Chỉnh sửa kế hoạch CSKH:{" "}
          <span className="text-blue-600">{formData.careId}</span>
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thông tin chung */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Thông tin chung
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã CSKH
                </label>
                <input
                  type="text"
                  name="careId"
                  value={formData.careId}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khách hàng (ID: {formData.customerId})
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchCustomer}
                    onChange={handleCustomerSearch}
                    onFocus={() => setShowCustomerDropdown(true)}
                    placeholder="Tìm kiếm khách hàng để thay đổi..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {showCustomerDropdown && customers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {customers.map((customer) => (
                      <div
                        key={customer._id}
                        onClick={() => selectCustomer(customer)}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="font-medium text-gray-900">
                          {customer.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.phone} - {customer.address}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Người phụ trách <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="carePerson"
                  required
                  value={formData.carePerson}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại hình CSKH
                </label>
                <select
                  name="careType"
                  value={formData.careType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Khảo sát nhu cầu">Khảo sát nhu cầu</option>
                  <option value="Làm rõ báo giá/hợp đồng">
                    Làm rõ báo giá/hợp đồng
                  </option>
                  <option value="Xử lý khiếu nại/bảo hành">
                    Xử lý khiếu nại/bảo hành
                  </option>
                  <option value="Thu hồi công nợ">Thu hồi công nợ</option>
                </select>
              </div>
            </div>

            {/* Thời gian và Địa điểm */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Thời gian & Địa điểm
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Từ thời gian
                  </label>
                  <input
                    type="datetime-local"
                    name="timeFrom"
                    value={formData.timeFrom}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đến thời gian
                  </label>
                  <input
                    type="datetime-local"
                    name="timeTo"
                    value={formData.timeTo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hình thức
                </label>
                <select
                  name="method"
                  value={formData.method}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Online">Online</option>
                  <option value="Trực tiếp">Trực tiếp</option>
                </select>
              </div>

              {formData.method === "Trực tiếp" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa điểm
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Nhập địa điểm..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Chờ báo cáo">Chờ báo cáo</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                  <option value="Hủy">Hủy</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Nội dung chi tiết
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dịch vụ quan tâm
              </label>
              <input
                type="text"
                name="interestedServices"
                value={formData.interestedServices}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nội dung trao đổi
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  name="discussionContent"
                  rows={4}
                  value={formData.discussionContent}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ghi chú nội dung trao đổi..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú nhu cầu
              </label>
              <textarea
                name="needsNote"
                rows={2}
                value={formData.needsNote}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomerCare;
