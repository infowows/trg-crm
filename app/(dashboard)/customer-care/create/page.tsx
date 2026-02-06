"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  User,
  Target,
  Calendar,
  MapPin,
  FileText,
  Clock,
  CheckCircle,
  Package,
  Upload,
  ImageIcon,
  X,
  Plus,
  Handshake,
  Layers,
  FileCheck,
  ChevronDown,
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
  opportunityRef: string;
  surveyRef: string;
  quotationRef: string;
  careType: string;
  careResult?: string;
  careResultClassification?: string;
  rejectGroup?: string;
  rejectReason?: string;
  timeFrom: string;
  timeTo: string;
  method: "Online" | "Trực tiếp";
  location: string;
  carePerson: string;
  discussionContent: string;
  needsNote: string;
  interestedServices: string[];
  status: "Chờ báo cáo" | "Hoàn thành" | "Hủy";
  images?: string[];
  files?: FileMetadata[];
}

const CreateCustomerCareForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchCustomer, setSearchCustomer] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);

  const [surveys, setSurveys] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);

  const [employees, setEmployees] = useState<
    Array<{ _id: string; fullName: string }>
  >([]);

  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
  const [selectedServiceGroup, setSelectedServiceGroup] =
    useState<ServiceGroup | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedPackages, setSelectedPackages] = useState<ServicePackage[]>(
    [],
  );

  const [careGroups, setCareGroups] = useState<any[]>([]);
  const [careResults, setCareResults] = useState<any[]>([]);
  const [filteredCareResults, setFilteredCareResults] = useState<any[]>([]);

  const [rejectGroups, setRejectGroups] = useState<any[]>([]);
  const [rejectReasons, setRejectReasons] = useState<any[]>([]);
  const [filteredRejectReasons, setFilteredRejectReasons] = useState<any[]>([]);

  const [formData, setFormData] = useState<FormData>({
    careId: "",
    customerId: "",
    opportunityRef: "",
    surveyRef: "",
    quotationRef: "",
    careType: "",
    careResult: "",
    careResultClassification: "",
    rejectGroup: "",
    rejectReason: "",
    timeFrom: new Date().toISOString().slice(0, 16),
    timeTo: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
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

  useEffect(() => {
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
    fetchOpportunities();
    fetchSurveys();
    fetchQuotations();
    fetchCareGroups();
    fetchCareResults();
    fetchRejectGroups();
    fetchRejectReasons();

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const opportunityId = searchParams.get("opportunityId");
    if (opportunityId && opportunities.length > 0) {
      if (formData.opportunityRef !== opportunityId) {
        handleOpportunityChange(opportunityId);
      }
    }
  }, [opportunities, searchParams]);

  const fetchOpportunities = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/opportunities?status=Open&limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOpportunities(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching opportunities:", err);
    }
  };

  const fetchSurveys = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/surveys?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSurveys(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching surveys:", err);
    }
  };

  const fetchQuotations = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/quotations?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setQuotations(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching quotations:", err);
    }
  };

  const fetchCareGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/care-groups?active=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCareGroups(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching care groups:", err);
    }
  };

  const fetchCareResults = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/care-results?active=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCareResults(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching care results:", err);
    }
  };

  const fetchRejectGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/reject-groups?active=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRejectGroups(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching reject groups:", err);
    }
  };

  const fetchRejectReasons = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/reject-reasons?active=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRejectReasons(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching reject reasons:", err);
    }
  };

  useEffect(() => {
    if (formData.careType) {
      const filtered = careResults.filter(
        (result) => result.careGroupName === formData.careType,
      );
      setFilteredCareResults(filtered);
    } else {
      setFilteredCareResults([]);
    }
  }, [formData.careType, careResults]);

  useEffect(() => {
    if (formData.rejectGroup) {
      const filtered = rejectReasons.filter(
        (reason) => reason.rejectGroupName === formData.rejectGroup,
      );
      setFilteredRejectReasons(filtered);
    } else {
      setFilteredRejectReasons([]);
    }
  }, [formData.rejectGroup, rejectReasons]);

  const handleOpportunityChange = (opportunityId: string) => {
    const opp = opportunities.find((o) => o._id === opportunityId);
    if (opp) {
      setSelectedOpportunity(opp);
      setSelectedCustomer(opp.customerRef);
      setSearchCustomer(opp.customerRef?.fullName || "");

      setFormData((prev) => ({
        ...prev,
        opportunityRef: opp._id,
        customerId: opp.customerRef?._id || "",
        interestedServices: opp.demands || [],
      }));
    } else {
      setSelectedOpportunity(null);
      setFormData((prev) => ({
        ...prev,
        opportunityRef: "",
        surveyRef: "",
        quotationRef: "",
      }));
    }
  };

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

    if (formData.opportunityRef) {
      const currentOpp = opportunities.find(
        (o) => o._id === formData.opportunityRef,
      );
      if (
        currentOpp &&
        (currentOpp.customerRef?._id || currentOpp.customerRef) !== customer._id
      ) {
        setFormData((prev) => ({
          ...prev,
          opportunityRef: "",
          surveyRef: "",
          quotationRef: "",
        }));
        setSelectedOpportunity(null);
      }
    }
  };

  const filteredOpportunities = selectedCustomer
    ? opportunities.filter(
        (opp) =>
          (opp.customerRef?._id || opp.customerRef) === selectedCustomer._id,
      )
    : opportunities;

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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.customerId && !selectedCustomer) {
      toast.error("Vui lòng chọn khách hàng");
      return;
    }
    if (!formData.careType) {
      toast.error("Vui lòng chọn nhóm chăm sóc");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const submitData = {
        ...formData,
        customerRef: formData.customerId,
        customerId: selectedCustomer?.customerCode || "",
      };

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
    <div className="bg-white min-h-screen flex flex-col">
      {/* Sticky Top Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 pt-8 px-6 pb-0">
        <div className="max-w-[1800px] mx-auto">
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Quay lại danh sách</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Lập Kế hoạch Chăm sóc Khách hàng
              </h1>
              <p className="text-gray-500 mt-1">
                Thiết lập thông tin và lộ trình chăm sóc khách hàng chuyên
                nghiệp
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-50 font-bold active:scale-95"
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {loading ? "Đang lưu..." : "Lưu kế hoạch"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 lg:p-8 bg-gray-50/30">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: General Info */}
            <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Card 1: Customer & Links */}
              <div className="bg-blue-300/50 border border-blue-500 rounded-[2.5rem] shadow-sm p-6 md:p-10 space-y-8">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                  Khách hàng & Liên kết
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div ref={dropdownRef}>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2 ml-1">
                        Khách hàng <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                        <input
                          type="text"
                          value={searchCustomer}
                          onChange={handleCustomerSearch}
                          onFocus={() => setShowCustomerDropdown(true)}
                          placeholder="Tìm mã hoặc tên khách hàng..."
                          className="w-full pl-12 pr-4 py-3.5 bg-white border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-gray-900 shadow-sm"
                          required
                        />
                        {showCustomerDropdown && (
                          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-80 overflow-y-auto overflow-x-hidden p-2">
                            {customers.length > 0 ? (
                              customers.map((customer) => (
                                <div
                                  key={customer._id}
                                  onClick={() => selectCustomer(customer)}
                                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer rounded-xl transition-colors"
                                >
                                  <div className="font-bold text-gray-900">
                                    {customer.fullName}
                                  </div>
                                  <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                    <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md font-bold">
                                      {customer.customerCode}
                                    </span>
                                    <span>{customer.phone}</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-center text-gray-700 text-sm italic">
                                Không tìm thấy khách hàng
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2 ml-1">
                        Cơ hội kinh doanh (Nguồn)
                      </label>
                      <div className="relative group">
                        <Handshake className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                        <select
                          name="opportunityRef"
                          value={formData.opportunityRef}
                          onChange={(e) =>
                            handleOpportunityChange(e.target.value)
                          }
                          className="w-full pl-12 pr-10 py-3.5 bg-white border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none appearance-none transition-all font-bold text-gray-900 shadow-sm disabled:opacity-50"
                        >
                          <option value="">-- Chọn Cơ hội liên kết --</option>
                          {filteredOpportunities.map((opp) => (
                            <option key={opp._id} value={opp._id}>
                              {opp.opportunityNo}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ChevronDown className="w-5 h-5 text-gray-700" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2 ml-1">
                        Mã CSKH
                      </label>
                      <div className="relative group">
                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                        <input
                          type="text"
                          name="careId"
                          value={formData.careId}
                          onChange={handleChange}
                          placeholder="Hệ thống tự tạo nếu để trống..."
                          className="w-full pl-12 pr-4 py-3.5 bg-white border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-gray-900 shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={!formData.opportunityRef ? "opacity-60" : ""}
                      >
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2 ml-1">
                          Phiếu Khảo sát
                        </label>
                        <select
                          name="surveyRef"
                          value={formData.surveyRef}
                          disabled={!formData.opportunityRef}
                          onChange={(e) => {
                            const surveyId = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              surveyRef: surveyId,
                            }));
                          }}
                          className="w-full px-4 py-3.5 bg-white border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-sm text-gray-900 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {formData.opportunityRef
                              ? "--"
                              : "Chọn cơ hội trước"}
                          </option>
                          {surveys.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.surveyNo}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div
                        className={!formData.opportunityRef ? "opacity-60" : ""}
                      >
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2 ml-1">
                          Bản Báo giá
                        </label>
                        <select
                          name="quotationRef"
                          value={formData.quotationRef}
                          disabled={!formData.opportunityRef}
                          onChange={(e) => {
                            const quoteId = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              quotationRef: quoteId,
                            }));
                          }}
                          className="w-full px-4 py-3.5 bg-white border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-sm text-gray-900 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {formData.opportunityRef
                              ? "--"
                              : "Chọn cơ hội trước"}
                          </option>
                          {quotations.map((q) => (
                            <option key={q._id} value={q._id}>
                              {q.quotationNo}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Nội dung & Nhu cầu */}
              <div className="bg-emerald-300/50 border border-emerald-500 rounded-[2.5rem] shadow-sm p-6 md:p-10 space-y-8">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                  Chi tiết Trao đổi & Nhu cầu
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2 ml-1">
                      Nội dung trao đổi chi tiết
                    </label>
                    <textarea
                      name="discussionContent"
                      value={formData.discussionContent}
                      onChange={handleChange}
                      rows={5}
                      className="w-full p-6 bg-white border border-transparent rounded-3xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-gray-900 shadow-sm resize-none"
                      placeholder="Ghi lại các ý chính đã thảo luận với khách hàng..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Dịch vụ quan tâm */}
                    <div className="bg-white rounded-[2rem] p-6 space-y-4 shadow-sm">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-500" />
                        Dịch vụ & Gói quan tâm
                      </label>

                      <div className="flex flex-wrap gap-2 min-h-[40px]">
                        {formData.interestedServices.length > 0 ? (
                          formData.interestedServices.map((service, index) => (
                            <div
                              key={index}
                              className="group flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl shadow-sm hover:border-red-200 transition-all animate-in zoom-in-95"
                            >
                              <span className="text-sm font-bold text-blue-700">
                                {service}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeServiceItem(index)}
                                className="text-gray-300 group-hover:text-red-500 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-gray-700 italic">
                            Chưa chọn dịch vụ nào
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-gray-100 space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            onChange={(e) =>
                              handleServiceGroupChange(e.target.value)
                            }
                            className="bg-gray-50 px-3 py-2 rounded-xl border-none text-xs font-bold outline-none shadow-sm"
                          >
                            <option value="">Chọn Nhóm...</option>
                            {serviceGroups.map((g) => (
                              <option key={g._id} value={g._id}>
                                {g.name}
                              </option>
                            ))}
                          </select>
                          <select
                            onChange={(e) =>
                              handleServiceChange(e.target.value)
                            }
                            disabled={!selectedServiceGroup}
                            className="bg-gray-50 px-3 py-2 rounded-xl border-none text-xs font-bold outline-none shadow-sm disabled:opacity-50"
                          >
                            <option value="">Chọn Dịch vụ...</option>
                            {(selectedServiceGroup?.services || []).map(
                              (s: any) => (
                                <option key={s._id} value={s.name}>
                                  {s.name}
                                </option>
                              ),
                            )}
                          </select>
                        </div>

                        {selectedPackages.length > 0 && (
                          <div className="grid grid-cols-1 gap-2 animate-in fade-in slide-in-from-top-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                            {selectedPackages
                              .filter(
                                (pkg) =>
                                  !formData.interestedServices.includes(
                                    `${selectedService?.serviceName}: ${pkg.packageName}`,
                                  ),
                              )
                              .map((pkg) => (
                                <button
                                  key={pkg._id}
                                  type="button"
                                  onClick={() =>
                                    addServiceItem(
                                      `${selectedService?.serviceName}: ${pkg.packageName}`,
                                    )
                                  }
                                  className="flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-600 hover:text-white rounded-xl shadow-sm transition-all group"
                                >
                                  <span className="text-xs font-bold">
                                    {pkg.packageName}
                                  </span>
                                  <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                              ))}
                            {selectedPackages.filter(
                              (pkg) =>
                                !formData.interestedServices.includes(
                                  `${selectedService?.serviceName}: ${pkg.packageName}`,
                                ),
                            ).length === 0 && (
                              <div className="text-center py-2 text-[10px] text-gray-700 italic">
                                Tất cả các gói đã được chọn
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ghi chú nhu cầu */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2 ml-1">
                        Ghi chú nhu cầu đặc biệt
                      </label>
                      <textarea
                        name="needsNote"
                        value={formData.needsNote}
                        onChange={handleChange}
                        rows={6}
                        className="w-full p-6 bg-white border border-transparent rounded-3xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-gray-900 shadow-sm resize-none"
                        placeholder="Có yêu cầu gì đặc biệt về thời gian, phong cách, ngân sách..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: File & Images */}
              <div className="bg-purple-300/50 border border-purple-500 rounded-[2.5rem] shadow-sm p-6 md:p-10 space-y-8">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                  Hình ảnh & Tài liệu
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">
                      Ảnh chụp buổi làm việc / khảo sát
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {formData.images?.map((url, i) => (
                        <div
                          key={i}
                          className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-lg group hover:scale-105 transition-transform"
                        >
                          <img
                            src={url}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const news = [...(formData.images || [])];
                              news.splice(i, 1);
                              setFormData({ ...formData, images: news });
                            }}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-6 h-6 text-white" />
                          </button>
                        </div>
                      ))}
                      <label className="bg-white w-24 h-24 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-100 transition-all text-gray-700">
                        {uploadingImages ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
                        ) : (
                          <>
                            <ImageIcon className="w-6 h-6" />
                            <span className="text-[10px] font-bold mt-1 uppercase">
                              Tải ảnh
                            </span>
                          </>
                        )}
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploadingImages}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">
                      Tệp tài liệu đính kèm
                    </label>
                    <div className="space-y-3">
                      {formData.files?.map((f, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                              <FileCheck className="w-5 h-5 text-emerald-500" />
                            </div>
                            <span className="text-sm font-bold text-gray-700 truncate">
                              {f.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const news = [...(formData.files || [])];
                              news.splice(i, 1);
                              setFormData({ ...formData, files: news });
                            }}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      <label className="bg-white flex items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-100 transition-all group">
                        <div className="flex items-center gap-3">
                          {uploadingFiles ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-600 border-t-transparent" />
                          ) : (
                            <Upload className="w-5 h-5 text-gray-700 group-hover:text-emerald-500 transition-colors" />
                          )}
                          <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-600 uppercase tracking-widest">
                            {uploadingFiles ? "Đang tải..." : "Tải tài liệu"}
                          </span>
                        </div>
                        <input
                          type="file"
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
            </div>

            {/* Right Column: Config & Schedule */}
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Card 4: Schedule */}
              <div className="bg-orange-300/50 border border-orange-100 rounded-[2.5rem] shadow-sm p-6 md:p-8 space-y-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
                  Lịch làm việc
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2 ml-1">
                      Người phụ trách <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                      <select
                        name="carePerson"
                        value={formData.carePerson}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none appearance-none transition-all font-bold text-gray-900 shadow-sm"
                        required
                      >
                        <option value="">Chọn nhân sự...</option>
                        {employees.map((e) => (
                          <option key={e._id} value={e.fullName}>
                            {e.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2 ml-1">
                        Từ thời gian
                      </label>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                        <input
                          type="datetime-local"
                          name="timeFrom"
                          value={formData.timeFrom}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3.5 bg-white border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-gray-900 shadow-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2 ml-1">
                        Đến thời gian
                      </label>
                      <div className="relative group">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                        <input
                          type="datetime-local"
                          name="timeTo"
                          value={formData.timeTo}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3.5 bg-white border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-gray-900 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2 ml-1">
                      Hình thức & Địa điểm
                    </label>
                    <div className="grid grid-cols-1 gap-4">
                      <select
                        name="method"
                        value={formData.method}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-white border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-gray-900 shadow-sm"
                      >
                        <option value="Online">Online / Điện thoại</option>
                        <option value="Trực tiếp">Gặp mặt trực tiếp</option>
                      </select>
                      {formData.method === "Trực tiếp" && (
                        <div className="relative group">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Địa chỉ cụ thể..."
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-gray-900 shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 5: Results & Status */}
              <div className="bg-blue-300/50 border border-blue-100 rounded-[2.5rem] shadow-sm p-6 md:p-8 space-y-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                  Kết quả & Trạng thái
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2 ml-1">
                      Nhóm Chăm sóc <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="careType"
                      value={formData.careType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          careType: e.target.value,
                          careResult: "",
                        })
                      }
                      className="w-full px-5 py-3.5 bg-white border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-gray-900 shadow-sm"
                      required
                    >
                      <option value="">Chọn loại chăm sóc...</option>
                      {careGroups.map((g) => (
                        <option key={g._id} value={g.name}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2 ml-1">
                      Kết quả cụ thể
                    </label>
                    <select
                      name="careResult"
                      value={formData.careResult}
                      onChange={(e) => {
                        const selectedResult = filteredCareResults.find(
                          (r) => r.resultName === e.target.value,
                        );
                        setFormData({
                          ...formData,
                          careResult: e.target.value,
                          careResultClassification:
                            selectedResult?.classification || "",
                        });
                      }}
                      disabled={!formData.careType}
                      className="w-full px-5 py-3.5 bg-white border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-gray-900 shadow-sm disabled:opacity-50"
                    >
                      <option value="">Chọn kết quả...</option>
                      {filteredCareResults.map((r) => (
                        <option key={r._id} value={r.resultName}>
                          {r.resultName}
                        </option>
                      ))}
                    </select>
                    {formData.careResultClassification && (
                      <div className="mt-2 text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-lg inline-block">
                        Xếp loại: {formData.careResultClassification}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2 ml-1">
                      Trạng thái Hồ sơ
                    </label>
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1">
                      {["Chờ báo cáo", "Hoàn thành", "Hủy"].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              status: s as any,
                            })
                          }
                          className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${
                            formData.status === s
                              ? "bg-white text-blue-600 shadow-sm scale-100"
                              : "text-gray-700 hover:text-gray-600 scale-95"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rejected Section */}
                  {(formData.careResultClassification === "Thất bại" ||
                    formData.careResultClassification === "Từ chối") && (
                    <div className="p-6 bg-red-50 rounded-3xl border border-red-100 space-y-4 animate-in zoom-in-95">
                      <div>
                        <label className="block text-[10px] font-black text-red-800 uppercase tracking-widest mb-2 ml-1">
                          Nhóm lý do từ chối
                        </label>
                        <select
                          name="rejectGroup"
                          value={formData.rejectGroup}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              rejectGroup: e.target.value,
                              rejectReason: "",
                            })
                          }
                          className="w-full px-4 py-2.5 bg-white border border-red-200 rounded-xl outline-none font-bold text-sm text-red-900"
                        >
                          <option value="">Chọn nhóm...</option>
                          {rejectGroups.map((g) => (
                            <option key={g._id} value={g.name}>
                              {g.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-red-800 uppercase tracking-widest mb-2 ml-1">
                          Lý do chi tiết
                        </label>
                        <select
                          name="rejectReason"
                          value={formData.rejectReason}
                          onChange={handleChange}
                          disabled={!formData.rejectGroup}
                          className="w-full px-4 py-2.5 bg-white border border-red-200 rounded-xl outline-none font-bold text-sm text-red-900 disabled:opacity-50"
                        >
                          <option value="">Chọn lý do...</option>
                          {filteredRejectReasons.map((r) => (
                            <option key={r._id} value={r.name}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

const CreateCustomerCare = () => {
  return (
    <Suspense fallback={<div>Đang tải giao diện...</div>}>
      <CreateCustomerCareForm />
    </Suspense>
  );
};

export default CreateCustomerCare;
