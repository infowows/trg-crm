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
  Target,
  Package,
  Plus,
  X,
  CheckCircle,
  ImageIcon,
  Upload,
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
  interestedServices: string[];
  status: "Chờ báo cáo" | "Hoàn thành" | "Hủy";
  opportunityRef?: {
    _id: string;
    opportunityNo: string;
  };
  images?: string[];
  files?: Array<{ url: string; name: string; format?: string }>;
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
    interestedServices: [],
    status: "Chờ báo cáo",
    images: [],
    files: [],
  });

  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const [serviceGroups, setServiceGroups] = useState<any[]>([]);
  const [selectedServiceGroup, setSelectedServiceGroup] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedPackages, setSelectedPackages] = useState<any[]>([]);

  useEffect(() => {
    fetchCustomers();
    fetchCareDetail();
    loadServiceGroups();
  }, [id]);

  const loadServiceGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/service-groups", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setServiceGroups(data.data);
    } catch (error) {
      console.error("Error loading service groups:", error);
    }
  };

  const loadServices = async (groupId: string) => {
    try {
      const token = localStorage.getItem("token");
      const group = serviceGroups.find((g) => g._id === groupId);
      if (!group) return;

      const servicesResponse = await fetch(
        `/api/services?category=${encodeURIComponent(group.name)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const servicesData = await servicesResponse.json();

      if (servicesData.success) {
        const updatedGroup = {
          ...group,
          services:
            servicesData.data.map((service: any) => ({
              ...service,
              name: service.serviceName,
              serviceName: service.serviceName,
              packages: [],
            })) || [],
        };
        setSelectedServiceGroup(updatedGroup);
      }
    } catch (error) {
      console.error("Error loading services:", error);
    }
  };

  const handleServiceChange = async (serviceName: string) => {
    if (selectedServiceGroup) {
      const service = selectedServiceGroup.services.find(
        (s: any) => s.name === serviceName,
      );
      if (service) {
        setSelectedService(service);
        try {
          const token = localStorage.getItem("token");
          const pricingResponse = await fetch(
            `/api/service-pricing?serviceName=${encodeURIComponent(service.serviceName)}&isActive=true&page=1&limit=50`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          const pricingData = await pricingResponse.json();

          if (pricingData.success && pricingData.data.length > 0) {
            const latestPricingByPackage = new Map();
            pricingData.data.forEach((pricing: any) => {
              const packageName = pricing.packageName;
              const existing = latestPricingByPackage.get(packageName);
              if (
                !existing ||
                new Date(pricing.createdAt) > new Date(existing.createdAt)
              ) {
                latestPricingByPackage.set(packageName, pricing);
              }
            });

            setSelectedPackages(
              Array.from(latestPricingByPackage.values()).map(
                (pricing: any) => ({
                  _id: pricing._id,
                  packageName: pricing.packageName,
                  unitPrice: pricing.unitPrice,
                }),
              ),
            );
          } else {
            setSelectedPackages([]);
          }
        } catch (error) {
          console.error("Error loading packages:", error);
          setSelectedPackages([]);
        }
      } else {
        setSelectedService(null);
        setSelectedPackages([]);
      }
    }
  };

  const addServiceItem = (item: string) => {
    if (!item) return;
    if (formData.interestedServices.includes(item)) {
      toast.warning("Dịch vụ này đã có trong danh sách");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      interestedServices: [...prev.interestedServices, item],
    }));
  };

  const removeServiceItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      interestedServices: prev.interestedServices.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const newImages = [...(formData.images || [])];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} quá lớn (max 5MB)`);
          continue;
        }

        const data = new FormData();
        data.append("file", file);
        data.append("folder", "care");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: data,
        });

        const result = await res.json();
        if (result.success && result.data.secure_url) {
          newImages.push(result.data.secure_url);
        } else {
          toast.error(`Lỗi upload ảnh ${file.name}`);
        }
      }
      setFormData((prev) => ({ ...prev, images: newImages }));
    } catch (error) {
      console.error("Upload image error:", error);
      toast.error("Lỗi khi tải ảnh lên");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    const newFiles = [...(formData.files || [])];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} quá lớn (max 10MB)`);
          continue;
        }

        const data = new FormData();
        data.append("file", file);
        data.append("folder", "file");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: data,
        });

        const result = await res.json();
        if (result.success && result.data.secure_url) {
          newFiles.push({
            url: result.data.secure_url,
            name: file.name,
            format: result.data.format || file.name.split(".").pop() || "file",
          });
        } else {
          toast.error(`Lỗi upload file ${file.name}`);
        }
      }
      setFormData((prev) => ({ ...prev, files: newFiles }));
    } catch (error) {
      console.error("Upload file error:", error);
      toast.error("Lỗi khi tải file lên");
    } finally {
      setUploadingFiles(false);
    }
  };

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

        // Set selected customer data if available
        if (data.customerRef && typeof data.customerRef === "object") {
          setSelectedCustomer({
            _id: data.customerRef._id,
            customerCode: data.customerRef.customerCode || "",
            fullName: data.customerRef.fullName || "",
            phone: data.customerRef.phone || "",
            address: data.customerRef.address || "",
          });
        }

        setFormData({
          careId: data.careId || "",
          customerId: data.customerRef?._id || data.customerId || "", // Use ID from Ref first
          careType: data.careType || "Khảo sát nhu cầu",
          timeFrom: formatDateForInput(data.timeFrom),
          timeTo: formatDateForInput(data.timeTo),
          method: data.method || "Online",
          location: data.location || "",
          carePerson: data.carePerson || "",
          discussionContent: data.discussionContent || "",
          needsNote: data.needsNote || "",
          interestedServices: Array.isArray(data.interestedServices)
            ? data.interestedServices
            : [],
          status: data.status || "Chờ báo cáo",
          opportunityRef: data.opportunityRef,
          images: data.images || [],
          files: data.files || [],
        });

        if (data.customerRef) {
          setSearchCustomer(data.customerRef.fullName || "");
        } else if (data.customerId) {
          // Fallback if only string ID is available
          setSearchCustomer(data.customerId);
        }
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

      const submitData = {
        ...formData,
        customerRef: formData.customerId,
        customerId: selectedCustomer?.customerCode || "",
        opportunityRef: formData.opportunityRef?._id || undefined, // Extract ID
      };

      const response = await fetch(`/api/customer-care/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
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

              {formData.opportunityRef && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cơ hội liên kết
                  </label>
                  <div className="flex items-center px-3 py-2 border border-blue-100 rounded-lg bg-blue-50 text-blue-700 font-bold">
                    <Target className="w-5 h-5 mr-2" />
                    {formData.opportunityRef.opportunityNo}
                  </div>
                </div>
              )}

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

            {/* UI CHỌN DỊCH VỤ TƯƠNG TỰ CREATE PAGE */}
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 mt-6">
              <label className="text-sm font-bold text-blue-800 mb-4 flex items-center uppercase tracking-wider">
                <Package className="w-5 h-5 mr-2" />
                Dịch vụ quan tâm & Giá tham khảo
              </label>

              <div className="space-y-2 mb-6">
                {formData.interestedServices.length > 0 ? (
                  formData.interestedServices.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200 shadow-sm"
                    >
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                        <span className="text-sm font-medium text-gray-700">
                          {service}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeServiceItem(index)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded-full transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 bg-blue-50/50 border border-dashed border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-400 italic">
                      Chưa có dịch vụ nào được chọn
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-white p-4 rounded-xl border border-blue-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">
                      Nhóm dịch vụ
                    </label>
                    <select
                      onChange={(e) => {
                        const groupId = e.target.value;
                        const group = serviceGroups.find(
                          (g) => g._id === groupId,
                        );
                        setSelectedServiceGroup(group);
                        setSelectedService(null);
                        setSelectedPackages([]);
                        if (groupId) loadServices(groupId);
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                    >
                      <option value="">Chọn nhóm...</option>
                      {serviceGroups.map((group) => (
                        <option key={group._id} value={group._id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">
                      Tên dịch vụ
                    </label>
                    <select
                      onChange={(e) => handleServiceChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                      disabled={!selectedServiceGroup}
                      value={selectedService?.name || ""}
                    >
                      <option value="">Chọn dịch vụ...</option>
                      {(selectedServiceGroup?.services || []).map(
                        (service: any) => (
                          <option key={service._id} value={service.name}>
                            {service.name}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                </div>

                {selectedPackages.length > 0 && (
                  <div className="grid grid-cols-1 gap-2 pt-2 border-t border-gray-100">
                    {selectedPackages
                      .filter((pkg) => {
                        const serviceString = `${selectedService?.serviceName}: ${pkg.packageName} (${pkg.unitPrice.toLocaleString()} VNĐ)`;
                        return !formData.interestedServices.includes(
                          serviceString,
                        );
                      })
                      .map((pkg) => (
                        <button
                          key={pkg._id}
                          type="button"
                          onClick={() =>
                            addServiceItem(
                              `${selectedService?.serviceName}: ${pkg.packageName} (${pkg.unitPrice.toLocaleString()} VNĐ)`,
                            )
                          }
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition group text-left"
                        >
                          <div className="flex items-center">
                            <Plus className="w-4 h-4 text-blue-500 mr-3" />
                            <span className="text-sm text-gray-700 font-medium">
                              {pkg.packageName}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-blue-600">
                            {pkg.unitPrice.toLocaleString()}đ
                          </span>
                        </button>
                      ))}
                    {selectedPackages.length > 0 &&
                      selectedPackages.filter((pkg) => {
                        const serviceString = `${selectedService?.serviceName}: ${pkg.packageName} (${pkg.unitPrice.toLocaleString()} VNĐ)`;
                        return !formData.interestedServices.includes(
                          serviceString,
                        );
                      }).length === 0 && (
                        <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                          <p className="text-xs text-gray-400 italic">
                            Tất cả các gói của dịch vụ này đã được chọn
                          </p>
                        </div>
                      )}
                  </div>
                )}
                {/* Manual add input */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="manualService"
                      placeholder="Hoặc nhập thủ công nhu cầu khác..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value;
                          if (val) {
                            addServiceItem(val);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById(
                          "manualService",
                        ) as HTMLInputElement;
                        if (input.value) {
                          addServiceItem(input.value);
                          input.value = "";
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm
                    </button>
                  </div>
                </div>
              </div>
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

            {/* Images & Files Section */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              {/* Image Upload */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="text-sm font-bold text-gray-700 mb-4 uppercase flex items-center">
                  <ImageIcon className="w-4 h-4 mr-2 text-blue-600" />
                  Hình ảnh đính kèm
                </label>
                <div className="flex flex-wrap gap-3">
                  {formData.images?.map((imgUrl, index) => (
                    <div
                      key={index}
                      className="relative group w-20 h-20 border border-gray-200 rounded-lg overflow-hidden bg-white"
                    >
                      <img
                        src={imgUrl}
                        alt="Care"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = [...(formData.images || [])];
                          newImages.splice(index, 1);
                          setFormData((prev) => ({
                            ...prev,
                            images: newImages,
                          }));
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-white hover:border-blue-500 transition-colors">
                    {uploadingImages ? (
                      <Upload className="w-5 h-5 text-blue-500 animate-pulse" />
                    ) : (
                      <Upload className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-[10px] text-gray-500 mt-1">
                      {uploadingImages ? "..." : "Thêm ảnh"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImages}
                    />
                  </label>
                </div>
              </div>

              {/* File Upload */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="text-sm font-bold text-gray-700 mb-4 uppercase flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-blue-600" />
                  Tài liệu (PDF, DOC...)
                </label>
                <div className="space-y-3">
                  {formData.files?.map((fileData, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center min-w-0">
                        <FileText className="w-4 h-4 text-blue-500 mr-2 shrink-0" />
                        <span className="text-xs text-gray-700 truncate">
                          {fileData.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newFiles = [...(formData.files || [])];
                          newFiles.splice(index, 1);
                          setFormData((prev) => ({ ...prev, files: newFiles }));
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <label className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg shadow-sm text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition">
                    {uploadingFiles ? (
                      <Upload className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    <span>
                      {uploadingFiles ? "Đang tải..." : "Tải tài liệu lên"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingFiles}
                    />
                  </label>
                </div>
              </div>
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
