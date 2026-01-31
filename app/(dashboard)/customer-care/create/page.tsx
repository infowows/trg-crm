"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  User,
  Calendar,
  MapPin,
  FileText,
  Clock,
  CheckCircle,
  Package,
  Upload,
  ImageIcon,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

interface Customer {
  _id: string;
  customerCode: string;
  fullName: string;
  phone: string;
  address: string;
}

interface ServicePackage {
  _id: string;
  packageName: string;
  unitPrice: number;
  isSelected: boolean;
}

interface Service {
  _id: string;
  name: string;
  serviceName: string;
  packages: ServicePackage[];
}

interface ServiceGroup {
  _id: string;
  name: string;
  services: Service[];
}

interface FileMetadata {
  url: string;
  name: string;
  format?: string;
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
  images?: string[];
  files?: FileMetadata[];
}

const CreateCustomerCare = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchCustomer, setSearchCustomer] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  // Employee states
  const [employees, setEmployees] = useState<
    Array<{ _id: string; fullName: string }>
  >([]);

  // Service Selection States
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
  const [selectedServiceGroup, setSelectedServiceGroup] =
    useState<ServiceGroup | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedPackages, setSelectedPackages] = useState<ServicePackage[]>(
    [],
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
    images: [],
    files: [],
  });

  useEffect(() => {
    // Get current user info
    const userDataStr = localStorage.getItem("userData");
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      setFormData((prev) => ({
        ...prev,
        carePerson: userData.ho_ten || "",
      }));
    }

    fetchCustomers();
    fetchEmployees();
    loadServiceGroups();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/employees?isActive=true&limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const loadServiceGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/service-groups", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setServiceGroups(data.data);
      }
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

  const handleServiceGroupChange = (groupId: string) => {
    const group = serviceGroups.find((g) => g._id === groupId);
    if (group) {
      setSelectedServiceGroup(group);
      setSelectedService(null);
      setSelectedPackages([]);
      loadServices(groupId);
    } else {
      setSelectedServiceGroup(null);
      setSelectedService(null);
      setSelectedPackages([]);
    }
  };

  const handleServiceChange = async (serviceName: string) => {
    if (selectedServiceGroup) {
      const service = selectedServiceGroup.services.find(
        (s) => s.name === serviceName,
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
            // Logic to get latest pricing per package
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

            const servicePackages = Array.from(
              latestPricingByPackage.values(),
            ).map((pricing: any) => ({
              _id: pricing._id,
              packageName: pricing.packageName,
              unitPrice: pricing.unitPrice,
              isSelected: false,
            }));
            setSelectedPackages(servicePackages);
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

  const handlePackageToggle = (packageId: string) => {
    setSelectedPackages((prev) => {
      const updated = prev.map((pkg) =>
        pkg._id === packageId ? { ...pkg, isSelected: !pkg.isSelected } : pkg,
      );
      updateInterestedServicesString(selectedService, updated);
      return updated;
    });
  };

  const updateInterestedServicesString = (
    service: Service | null,
    packages: ServicePackage[],
  ) => {
    if (!service) return;

    const selectedPkgNames = packages
      .filter((p) => p.isSelected)
      .map((p) => `${p.packageName} (${p.unitPrice.toLocaleString()} VNĐ)`)
      .join(", ");

    let newInterestedServices = "";
    if (selectedPkgNames) {
      newInterestedServices = `${service.serviceName}: ${selectedPkgNames}`;
    } else {
      // If no package selected but service selected, maybe just show service name?
      newInterestedServices = service.serviceName;
    }

    setFormData((prev) => ({
      ...prev,
      interestedServices: newInterestedServices,
    }));
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
        data.append("folder", "care"); // Specify folder for images

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
        // Allow common doc types and pdf
        // No strict type check here as input accept handles it mostly, strict check if needed
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} quá lớn (max 10MB)`);
          continue;
        }

        const data = new FormData();
        data.append("file", file);
        data.append("folder", "file"); // Specify folder for files

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
      const submitData = { ...formData };

      const response = await fetch("/api/customer-care", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Tạo kế hoạch CSKH thành công");
        router.push("/customer-care");
      } else {
        toast.error(data.error || "Không thể tạo kế hoạch");
      }
    } catch (error) {
      console.error("Error creating customer care:", error);
      toast.error("Đã xảy ra lỗi khi tạo kế hoạch");
    } finally {
      setLoading(false);
    }
  };

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
          Thêm mới kế hoạch Chăm sóc khách hàng
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
                <label className="block text-sm font-medium text-black mb-1">
                  Mã CSKH (Tự động tạo nếu để trống)
                </label>
                <input
                  type="text"
                  name="careId"
                  value={formData.careId}
                  onChange={handleChange}
                  placeholder="CSKH..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khách hàng
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchCustomer}
                    onChange={handleCustomerSearch}
                    onFocus={() => setShowCustomerDropdown(true)}
                    placeholder="Tìm kiếm khách hàng..."
                    className="text-black w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                <select
                  name="carePerson"
                  required
                  value={formData.carePerson}
                  onChange={handleChange}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Chọn người phụ trách...</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee.fullName}>
                      {employee.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại hình CSKH
                </label>
                <select
                  name="careType"
                  value={formData.careType}
                  onChange={handleChange}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                      className="text-black w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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

            {/* SERVICE SELECTION AREA START */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <label className="text-sm font-medium text-blue-800 mb-3 flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Dịch vụ quan tâm & Giá tham khảo
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <select
                    onChange={(e) => handleServiceGroupChange(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">Chọn nhóm dịch vụ...</option>
                    {serviceGroups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    onChange={(e) => handleServiceChange(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                    disabled={!selectedServiceGroup}
                    value={selectedService?.name || ""}
                  >
                    <option value="">Chọn dịch vụ...</option>
                    {/* Fix: Add fallback to empty array if services is undefined */}
                    {(selectedServiceGroup?.services || []).map((service) => (
                      <option key={service._id} value={service.name}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedPackages.length > 0 && (
                <div className="space-y-2 mt-2 bg-white p-3 rounded border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                    Các gói dịch vụ (Tích chọn để thêm vào ghi chú)
                  </p>
                  {selectedPackages.map((pkg) => (
                    <div
                      key={pkg._id}
                      className="flex items-center justify-between py-1 border-b last:border-0 border-gray-100"
                    >
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pkg.isSelected}
                          onChange={() => handlePackageToggle(pkg._id)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {pkg.packageName}
                        </span>
                      </label>
                      <span className="text-sm font-medium text-blue-600">
                        {pkg.unitPrice.toLocaleString()} VNĐ
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3">
                <label className="block text-xs text-gray-500 mb-1">
                  Preview nội dung sẽ lưu:
                </label>
                <input
                  type="text"
                  name="interestedServices"
                  value={formData.interestedServices}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-medium text-sm"
                  placeholder="Dịch vụ quan tâm..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  Bạn có thể chỉnh sửa nội dung này thủ công nếu cần.
                </p>
              </div>
            </div>
            {/* SERVICE SELECTION AREA END */}

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
                  className="text-black w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Upload Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
              <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                Hình ảnh & Tài liệu đính kèm
              </h3>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh chăm sóc
                </label>
                <div className="flex flex-wrap gap-4 items-start">
                  {/* Image List */}
                  {(formData.images || []).map((imgUrl, index) => (
                    <div
                      key={index}
                      className="relative group w-24 h-24 border border-gray-200 rounded-lg overflow-hidden bg-white"
                    >
                      <img
                        src={imgUrl}
                        alt="Care image"
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

                  {/* Upload Button */}
                  <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 hover:border-blue-500 transition-colors">
                    {uploadingImages ? (
                      <Upload className="w-6 h-6 text-blue-500 animate-pulse" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    )}
                    <span className="text-xs text-center text-gray-500 mt-1">
                      {uploadingImages ? "Đang tải..." : "Thêm ảnh"}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File đính kèm (PDF, DOC, XLS...)
                </label>
                <div className="space-y-2">
                  {/* File List */}
                  {(formData.files || []).map((fileData, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                        <a
                          href={fileData.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline truncate"
                        >
                          {fileData.name}
                        </a>
                        {/* <span className="text-xs text-gray-400 shrink-0">
                          .{fileData.format}
                        </span> */}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newFiles = [...(formData.files || [])];
                          newFiles.splice(index, 1);
                          setFormData((prev) => ({ ...prev, files: newFiles }));
                        }}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                    {uploadingFiles ? (
                      <Upload className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    <span>
                      {uploadingFiles ? "Đang tải file..." : "Tải file lên"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt"
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
              Lưu kế hoạch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCustomerCare;
