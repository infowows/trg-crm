"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Calculator,
  User,
  Calendar,
  FileText,
  Search,
  X,
  Eye,
  Handshake,
  CheckSquare,
  LayoutList,
} from "lucide-react";
import {
  formatCurrency as formatCurrencyUtil,
  formatNumberInput,
  parseNumberInput,
} from "@/lib/utils";

interface ServicePackage {
  _id: string;
  packageName: string;
  unitPrice: number;
  servicePricing: number; // Thêm field này để match với model
  totalPrice: number;
  isSelected: boolean;
}

interface Service {
  _id: string;
  name: string;
  serviceName: string;
  description?: string;
  packages: ServicePackage[];
}

interface ServiceGroup {
  _id: string;
  name: string;
  services: Service[];
}

interface QuotationPackage {
  serviceGroup: string;
  service: string;
  volume: number;
  packages: ServicePackage[];
}

interface Customer {
  _id: string;
  customerId: string;
  fullName: string;
  phone?: string;
  address?: string;
}

interface Survey {
  _id: string;
  surveyNo: string;
  surveys: Array<{
    name: string;
    length: number;
    width: number;
    area: number;
    coefficient: number;
    volume: number;
    note?: string;
  }>;
  surveyDate: string;
  surveyAddress: string;
  customerRef?: any;
  surveyNotes: string;
  createdBy: string;
  createdAt: string;
}

const CreateQuotation = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
  const [selectedServiceGroup, setSelectedServiceGroup] =
    useState<ServiceGroup | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [servicePricingData, setServicePricingData] = useState<any>(null);
  const [selectedPackages, setSelectedPackages] = useState<ServicePackage[]>(
    [],
  );

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [showSurveyModal, setShowSurveyModal] = useState(false);

  const [quotationPackages, setQuotationPackages] = useState<
    QuotationPackage[]
  >([]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    notes: "",
    careRef: "",
  });

  const [customerCares, setCustomerCares] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("general");

  const [availablePackageHeaders, setAvailablePackageHeaders] = useState<any[]>(
    [],
  );

  useEffect(() => {
    loadCustomers();
    loadServiceGroups();
    loadSurveys();
    loadCustomerCares();
    loadAvailablePackages();
  }, []);

  const loadAvailablePackages = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/service-packages?limit=50", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        // Sắp xếp theo tên hoặc thứ tự tạo
        setAvailablePackageHeaders(data.data);
      }
    } catch (error) {
      console.error("Error loading available packages:", error);
    }
  };

  const loadCustomerCares = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/customer-care?limit=100", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success || data.data) {
        setCustomerCares(data.data || []);
      }
    } catch (error) {
      console.error("Error loading customer cares:", error);
    }
  };

  const loadCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/customers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setCustomers(data.data);
      }
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  };

  const loadServiceGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/service-groups", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

      // Lấy group info trước để lấy tên
      const group = serviceGroups.find((g) => g._id === groupId);
      if (!group) {
        console.error("Service group not found:", groupId);
        return;
      }

      console.log("Loading services for group:", group.name);

      // Lấy services theo serviceGroup (tên nhóm)
      const servicesResponse = await fetch(
        `/api/services?category=${encodeURIComponent(group.name)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const servicesData = await servicesResponse.json();
      console.log("Services API response:", servicesData);

      if (servicesData.success) {
        const updatedGroup = {
          ...group,
          services:
            servicesData.data.map((service: any) => ({
              ...service,
              name: service.serviceName, // Map serviceName to name
              serviceName: service.serviceName, // Keep original
              packages: [], // Empty packages, will load when service is selected
            })) || [],
        };
        console.log("Updated group:", updatedGroup);
        setSelectedServiceGroup(updatedGroup);
      }
    } catch (error) {
      console.error("Error loading services:", error);
    }
  };

  const loadSurveys = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/surveys", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setSurveys(data.data);
      }
    } catch (error) {
      console.error("Error loading surveys:", error);
    }
  };

  const calculateTotal = () => {
    return quotationPackages.reduce((total, qp) => {
      return (
        total +
        qp.packages.reduce((pkgTotal, pkg) => {
          return pkgTotal + (pkg.isSelected ? pkg.totalPrice || 0 : 0);
        }, 0)
      );
    }, 0);
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const calculatePackagePrices = () => {
    // Lấy khối lượng từ khảo sát đã chọn
    const totalVolume = selectedSurvey
      ? selectedSurvey.surveys.reduce(
          (total, survey) => total + (survey.volume || 0),
          0,
        )
      : 1; // Mặc định là 1 nếu không có khảo sát

    console.log("Calculating package prices with volume:", totalVolume);

    setSelectedPackages((prev) =>
      prev.map((pkg) => {
        const totalPrice = pkg.isSelected ? pkg.unitPrice * totalVolume : 0;
        console.log(
          `Package ${pkg.packageName}: ${pkg.unitPrice} x ${totalVolume} = ${totalPrice}`,
        );
        return {
          ...pkg,
          totalPrice: totalPrice,
        };
      }),
    );
  };

  const handleSurveySelect = (survey: Survey) => {
    setSelectedSurvey(survey);

    // Tính lại giá packages ngay khi có khảo sát mới
    if (selectedPackages.length > 0) {
      calculatePackagePrices();
    }
  };

  const handleServiceGroupChange = (groupId: string) => {
    const group = serviceGroups.find((g) => g._id === groupId);
    if (group) {
      setSelectedServiceGroup(group);
      setSelectedService(null);
      setSelectedPackages([]);
      loadServices(groupId);
    }
  };

  const handleServiceChange = async (serviceName: string) => {
    if (selectedServiceGroup) {
      const service = selectedServiceGroup.services.find(
        (s) => s.name === serviceName,
      );
      if (service) {
        console.log("Selected service:", service);
        setSelectedService(service);
        // Reset packages khi chọn dịch vụ mới
        setSelectedPackages([]);

        // Fetch packages cho dịch vụ này
        try {
          const token = localStorage.getItem("token");

          // Lấy pricing data trước (chỉ filter theo serviceName)
          const pricingResponse = await fetch(
            `/api/service-pricing?serviceName=${encodeURIComponent(service.serviceName)}&isActive=true&page=1&limit=50`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const pricingData = await pricingResponse.json();
          console.log("Filtered Pricing Data:", pricingData);
          setServicePricingData(pricingData);

          if (pricingData.success && pricingData.data.length > 0) {
            // Group pricing theo packageName và lấy bản ghi mới nhất
            const latestPricingByPackage = new Map();

            pricingData.data.forEach((pricing: any) => {
              const packageName = pricing.packageName;
              const existing = latestPricingByPackage.get(packageName);

              // Nếu chưa có hoặc bản ghi này mới hơn (dựa trên createdAt)
              if (
                !existing ||
                new Date(pricing.createdAt) > new Date(existing.createdAt)
              ) {
                latestPricingByPackage.set(packageName, pricing);
              }
            });

            console.log(
              "Latest Pricing by Package:",
              Array.from(latestPricingByPackage.values()),
            );

            // Tạo packages từ pricing data đã được lọc
            const servicePackages = Array.from(
              latestPricingByPackage.values(),
            ).map((pricing: any) => ({
              _id: pricing._id,
              packageName: pricing.packageName,
              unitPrice: pricing.unitPrice,
              servicePricing: pricing.unitPrice, // Thêm field này
              totalPrice: 0, // Sẽ tính sau khi có volume
              isSelected: false,
            }));

            console.log("Final Service Packages:", servicePackages);
            setSelectedPackages(servicePackages);
          } else {
            console.log("No pricing data found for this service");
            setSelectedPackages([]);
          }
        } catch (error) {
          console.error("Error loading packages:", error);
          setSelectedPackages([]);
        }
      }
    }
  };

  const handlePackageToggle = (packageId: string) => {
    setSelectedPackages((prev) =>
      prev.map((pkg) =>
        pkg._id === packageId ? { ...pkg, isSelected: !pkg.isSelected } : pkg,
      ),
    );

    // Tính lại totalPrice ngay lập tức khi có thay đổi selection
    calculatePackagePrices();
  };

  const handleToggleAllPackages = () => {
    const allSelected = selectedPackages.every((pkg) => pkg.isSelected);
    const newPackages = selectedPackages.map((pkg) => ({
      ...pkg,
      isSelected: !allSelected,
    }));
    setSelectedPackages(newPackages);

    // Tính lại giá cho danh sách mới ngay lập tức
    const totalVolume = selectedSurvey
      ? selectedSurvey.surveys.reduce(
          (total, survey) => total + (survey.volume || 0),
          0,
        )
      : 1;

    setSelectedPackages((prev) =>
      prev.map((pkg) => ({
        ...pkg,
        totalPrice: pkg.isSelected ? pkg.unitPrice * totalVolume : 0,
      })),
    );
  };

  const addQuotationPackage = () => {
    if (
      !selectedServiceGroup ||
      !selectedService ||
      selectedPackages.filter((pkg) => pkg.isSelected).length === 0
    ) {
      toast.error("Vui lòng chọn nhóm dịch vụ, dịch vụ và ít nhất một gói");
      return;
    }

    const volume = selectedSurvey
      ? selectedSurvey.surveys.reduce(
          (total, survey) => total + survey.volume,
          0,
        )
      : 1;

    const selectedPackagesList = selectedPackages
      .filter((pkg) => pkg.isSelected)
      .map((pkg) => ({
        ...pkg,
        totalPrice: pkg.unitPrice * volume,
      }));

    setQuotationPackages((prev) => {
      const existingServiceIndex = prev.findIndex(
        (qp) =>
          qp.service === selectedService.name &&
          qp.serviceGroup === selectedServiceGroup.name,
      );

      if (existingServiceIndex !== -1) {
        // Nếu đã tồn tại dịch vụ này, cập nhật (merge) thêm gói mới
        const updated = [...prev];
        const existingQP = { ...updated[existingServiceIndex] };

        // Tạo mảng gói mới không trùng lặp
        const existingPackageNames = existingQP.packages.map(
          (p) => p.packageName,
        );
        const newUniquePackages = selectedPackagesList.filter(
          (p) => !existingPackageNames.includes(p.packageName),
        );

        existingQP.packages = [...existingQP.packages, ...newUniquePackages];
        existingQP.volume = volume; // Cập nhật khối lượng mới nhất nếu cần
        updated[existingServiceIndex] = existingQP;
        return updated;
      } else {
        // Nếu chưa có, tạo mới hoàn toàn
        const newQuotationPackage: QuotationPackage = {
          serviceGroup: selectedServiceGroup.name,
          service: selectedService.name,
          volume: volume,
          packages: selectedPackagesList,
        };
        return [...prev, newQuotationPackage];
      }
    });

    // Reset selection
    setSelectedPackages((prev) =>
      prev.map((pkg) => ({ ...pkg, isSelected: false })),
    );

    toast.success("Đã thêm gói dịch vụ vào báo giá");
  };

  const removeQuotationPackage = (index: number) => {
    setQuotationPackages(quotationPackages.filter((_, i) => i !== index));
  };

  const handlePreviewPriceChange = (
    qpIndex: number,
    packageName: string,
    newValue: string,
  ) => {
    const price = parseNumberInput(newValue);

    setQuotationPackages((prev) => {
      const updated = [...prev];
      const qp = { ...updated[qpIndex] };
      const qpPackages = [...qp.packages];

      const pkgIndex = qpPackages.findIndex(
        (p) => p.packageName === packageName,
      );

      if (pkgIndex !== -1) {
        qpPackages[pkgIndex] = {
          ...qpPackages[pkgIndex],
          unitPrice: price,
          servicePricing: price,
          totalPrice: price * qp.volume,
          isSelected: price > 0,
        };
      } else {
        qpPackages.push({
          _id: `temp-${Date.now()}-${packageName}`,
          packageName: packageName,
          unitPrice: price,
          servicePricing: price,
          totalPrice: price * qp.volume,
          isSelected: price > 0,
        });
      }

      qp.packages = qpPackages;
      updated[qpIndex] = qp;
      return updated;
    });
  };

  const handlePreviewVolumeChange = (qpIndex: number, newVolume: string) => {
    const volume = parseNumberInput(newVolume);

    setQuotationPackages((prev) => {
      const updated = [...prev];
      const qp = { ...updated[qpIndex] };
      qp.volume = volume;
      qp.packages = qp.packages.map((pkg) => ({
        ...pkg,
        totalPrice: pkg.unitPrice * volume,
      }));
      updated[qpIndex] = qp;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) {
      toast.error("Vui lòng chọn khách hàng");
      return;
    }

    if (quotationPackages.length === 0) {
      toast.error("Vui lòng thêm ít nhất một gói dịch vụ");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Làm sạch dữ liệu: Loại bỏ các _id tạm thời (temp-...) trước khi gửi lên server
      const sanitizedPackages = quotationPackages.map((qp) => ({
        ...qp,
        packages: qp.packages.map(({ _id, ...pkg }) => {
          // Nếu _id là string và bắt đầu bằng "temp-", loại bỏ nó
          if (typeof _id === "string" && _id.startsWith("temp-")) {
            return pkg;
          }
          return { _id, ...pkg };
        }),
      }));

      const quotationData = {
        date: formData.date,
        customer: selectedCustomer.fullName,
        customerRef: selectedCustomer._id,
        surveyRef: selectedSurvey?._id || null,
        careRef: formData.careRef || null,
        packages: sanitizedPackages,
        totalAmount: calculateTotal(),
        grandTotal: calculateTotal(),
        notes: formData.notes,
      };

      const response = await fetch("/api/quotations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(quotationData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Tạo báo giá thành công");
        router.push("/quotations");
      } else {
        toast.error(data.message || "Tạo báo giá thất bại");
      }
    } catch (error) {
      console.error("Error creating quotation:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount);
  };

  return (
    <>
      <div className="bg-white min-h-screen flex flex-col">
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 pt-8 px-6 pb-0">
          <div className="max-w-[1800px] mx-auto">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-gray-400 hover:text-gray-900 mb-4 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    Quay lại danh sách
                  </span>
                </button>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Tạo Báo giá Mới
                </h1>
                <p className="text-gray-500 mt-1">
                  Thiết lập thông tin và lựa chọn các gói dịch vụ cho khách hàng
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || quotationPackages.length === 0}
                  className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 transition-all shadow-lg shadow-blue-50 font-bold active:scale-95"
                >
                  <Save className="w-5 h-5" />
                  {loading ? "Đang lưu..." : "Lưu báo giá"}
                </button>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex overflow-x-auto hide-scrollbar pt-2">
              {[
                { id: "general", label: "Thông tin chung", icon: User },
                { id: "services", label: "Cấu hình dịch vụ", icon: Plus },
                { id: "preview", label: "Xem trước & Lưu", icon: Eye },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center gap-2 px-4 md:px-8 py-4 md:py-5 border-b-4 font-bold text-xs md:text-sm transition-all whitespace-nowrap ${
                      isActive
                        ? "border-blue-600 text-blue-600 bg-blue-500/30 rounded-xl"
                        : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-gray-400"}`}
                    />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                    {tab.id === "services" && quotationPackages.length > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-[10px] bg-blue-100 text-blue-600 rounded-lg">
                        {quotationPackages.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className="max-w-[1800px] mx-auto">
            {activeTab === "general" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-6 md:p-8">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-6 md:mb-8 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                    Khách hàng & Thời gian
                  </h2>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-6">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                          Kế hoạch CSKH (Nguồn)
                        </label>
                        <div className="relative group">
                          <Handshake className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                          <select
                            name="careRef"
                            value={formData.careRef}
                            onChange={(e) => {
                              const careId = e.target.value;
                              setFormData({ ...formData, careRef: careId });
                              if (careId) {
                                const care = customerCares.find(
                                  (c) => c._id === careId,
                                );
                                if (care) {
                                  // Thử tìm theo nhiều nguồn: customerRef, customerInfo._id, hoặc name (nếu cần)
                                  const targetCustomerId =
                                    (typeof care.customerRef === "object"
                                      ? care.customerRef?._id ||
                                        care.customerRef
                                      : care.customerRef) ||
                                    care.customerInfo?._id ||
                                    care.customerRef;

                                  let customer = customers.find(
                                    (c) => c._id === targetCustomerId,
                                  );

                                  // Nếu không tìm thấy theo _id, thử tìm theo mã khách hàng (nếu care có customerId)
                                  if (!customer && care.customerId) {
                                    customer = customers.find(
                                      (c) => c.customerId === care.customerId,
                                    );
                                  }

                                  if (customer) handleCustomerSelect(customer);
                                }
                              }
                            }}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none appearance-none transition-all font-bold text-gray-900"
                          >
                            <option value="">
                              -- Chọn Kế hoạch CSKH (Không bắt buộc) --
                            </option>
                            {customerCares.map((care) => (
                              <option key={care._id} value={care._id}>
                                {care.careId} - {care.carePerson} (
                                {care.careType})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                          Khách hàng <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                          <select
                            value={selectedCustomer?._id || ""}
                            onChange={(e) => {
                              const customer = customers.find(
                                (c) => c._id === e.target.value,
                              );
                              if (customer) handleCustomerSelect(customer);
                            }}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none appearance-none transition-all font-bold text-gray-900"
                            required
                          >
                            <option value="">Chọn khách hàng...</option>
                            {customers.map((c) => (
                              <option key={c._id} value={c._id}>
                                {c.customerId} - {c.fullName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                          Ngày lập báo giá{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                          <input
                            type="date"
                            value={formData.date}
                            onChange={(e) =>
                              setFormData({ ...formData, date: e.target.value })
                            }
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-gray-900"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                          Hồ sơ khảo sát liên kết
                        </label>
                        <div className="relative group">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                          <select
                            value={selectedSurvey?._id || ""}
                            onChange={(e) => {
                              const survey = surveys.find(
                                (s) => s._id === e.target.value,
                              );
                              if (survey) handleSurveySelect(survey);
                              else {
                                setSelectedSurvey(null);
                              }
                            }}
                            className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none appearance-none transition-all font-bold text-gray-900"
                          >
                            <option value="">
                              -- Chọn hồ sơ khảo sát (Không bắt buộc) --
                            </option>
                            {surveys
                              .filter((s: any) => {
                                if (!selectedCustomer) return true;
                                const sCustId =
                                  typeof s.customerRef === "string"
                                    ? s.customerRef
                                    : s.customerRef?._id;
                                return sCustId === selectedCustomer._id;
                              })
                              .map((s) => (
                                <option key={s._id} value={s._id}>
                                  {s.surveyNo} - {s.surveyAddress}
                                </option>
                              ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ArrowLeft className="w-4 h-4 -rotate-90 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                          Ghi chú nghiệp vụ
                        </label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) =>
                            setFormData({ ...formData, notes: e.target.value })
                          }
                          className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-gray-900 resize-none"
                          placeholder="Nhập các điều khoản bổ sung hoặc ưu đãi riêng..."
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setActiveTab("services")}
                    className="group flex items-center gap-3 px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all active:scale-95 shadow-xl"
                  >
                    Tiếp tục chọn dịch vụ
                    <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === "services" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                    Lựa chọn Gói dịch vụ
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                        Nhóm ngành hàng
                      </label>
                      <select
                        onChange={(e) =>
                          handleServiceGroupChange(e.target.value)
                        }
                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none appearance-none transition-all font-bold text-gray-900 shadow-sm"
                        value={selectedServiceGroup?._id || ""}
                      >
                        <option value="">-- Chọn nhóm dịch vụ --</option>
                        {serviceGroups.map((g) => (
                          <option key={g._id} value={g._id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                        Dịch vụ cụ thể
                      </label>
                      <select
                        onChange={(e) => handleServiceChange(e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none appearance-none transition-all font-bold text-gray-900 shadow-sm disabled:opacity-50"
                        disabled={!selectedServiceGroup}
                        value={selectedService?.name || ""}
                      >
                        <option value="">-- Chọn dịch vụ --</option>
                        {(selectedServiceGroup?.services || []).map((s) => (
                          <option key={s._id} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedPackages.length > 0 && (
                    <div className="animate-in fade-in zoom-in-95 duration-500 border-t border-gray-50 pt-10">
                      {(() => {
                        const availablePackages = selectedPackages.filter(
                          (pkg) =>
                            !quotationPackages.some(
                              (qp) =>
                                qp.service === selectedService?.name &&
                                qp.packages.some(
                                  (p) => p.packageName === pkg.packageName,
                                ),
                            ),
                        );

                        if (availablePackages.length > 0) {
                          return (
                            <>
                              <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                  <h3 className="font-bold text-gray-900 text-lg">
                                    Danh sách gói khả dụng
                                  </h3>
                                  <button
                                    type="button"
                                    onClick={handleToggleAllPackages}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-xl text-xs font-bold border border-gray-100 hover:border-blue-100 transition-all active:scale-95"
                                  >
                                    <div
                                      className={`w-4 h-4 rounded-md flex items-center justify-center border-2 transition-all ${
                                        availablePackages.every(
                                          (p) => p.isSelected,
                                        )
                                          ? "bg-blue-600 border-blue-600 text-white"
                                          : "bg-white border-gray-300"
                                      }`}
                                    >
                                      {availablePackages.every(
                                        (p) => p.isSelected,
                                      ) && <CheckSquare className="w-3 h-3" />}
                                    </div>
                                    Chọn tất cả
                                  </button>
                                </div>
                                {selectedSurvey && (
                                  <div className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-bold border border-blue-100">
                                    Khối lượng:{" "}
                                    {selectedSurvey.surveys.reduce(
                                      (t, s) => t + (s.volume || 0),
                                      0,
                                    )}{" "}
                                    m³
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                {availablePackages.map((pkg) => (
                                  <div
                                    key={pkg._id}
                                    onClick={() => handlePackageToggle(pkg._id)}
                                    className={`p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                                      pkg.isSelected
                                        ? "border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-50"
                                        : "border-gray-50 bg-gray-50 hover:border-gray-200"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-4">
                                        <div
                                          className={`w-5 h-5 rounded flex items-center justify-center border-2 ${
                                            pkg.isSelected
                                              ? "bg-blue-600 border-blue-600 text-white"
                                              : "border-gray-300"
                                          }`}
                                        >
                                          {pkg.isSelected && (
                                            <CheckSquare className="w-4 h-4" />
                                          )}
                                        </div>
                                        <div>
                                          <div className="font-bold text-gray-900 text-sm">
                                            {pkg.packageName}
                                          </div>
                                          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                            {formatCurrency(pkg.unitPrice)}
                                          </div>
                                        </div>
                                      </div>
                                      <div
                                        className={`font-bold text-sm ${
                                          pkg.isSelected
                                            ? "text-blue-600"
                                            : "text-gray-400"
                                        }`}
                                      >
                                        {formatCurrency(pkg.totalPrice || 0)}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <button
                                onClick={addQuotationPackage}
                                disabled={
                                  availablePackages.filter((p) => p.isSelected)
                                    .length === 0
                                }
                                className="flex items-center gap-3 px-10 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 transition-all shadow-xl shadow-blue-50 active:scale-95"
                              >
                                <Plus className="w-5 h-5" />
                                Thêm vào hồ sơ
                              </button>
                            </>
                          );
                        } else {
                          return (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex flex-col items-center text-center">
                              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                                <CheckSquare className="w-6 h-6 text-emerald-600" />
                              </div>
                              <h4 className="text-lg font-bold text-emerald-900 mb-1">
                                Hoàn tất lựa chọn
                              </h4>
                              <p className="text-sm text-emerald-700 font-medium max-w-sm">
                                Bạn đã thêm tất cả các gói dịch vụ khả dụng của{" "}
                                <strong>{selectedService?.name}</strong> vào hồ
                                sơ báo giá rồi nhé!
                              </p>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}
                </div>

                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 mt-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-4">
                    <div className="w-2 h-8 bg-blue-600 rounded-full shadow-lg shadow-blue-200"></div>
                    Dấu trình các gói đã chọn
                  </h2>
                  {quotationPackages.length > 0 ? (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quotationPackages.map((qp, idx) => (
                          <div
                            key={idx}
                            className="group relative bg-white border border-gray-100 rounded-4xl p-6 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-500 hover:-translate-y-1"
                          >
                            <button
                              onClick={() => removeQuotationPackage(idx)}
                              className="absolute -top-3 -right-3 w-10 h-10 bg-white text-red-500 rounded-2xl flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500 hover:text-white hover:rotate-90 z-10 border border-gray-50"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>

                            <div className="mb-6">
                              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg mb-2">
                                {qp.serviceGroup}
                              </span>
                              <h3 className="text-base font-bold text-gray-900 line-clamp-2">
                                {qp.service}
                              </h3>
                            </div>

                            <div className="space-y-3 mb-6">
                              {qp.packages.map((pkg, pIdx) => (
                                <div
                                  key={pIdx}
                                  className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100/50 group-hover:bg-white group-hover:border-blue-100 transition-colors"
                                >
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-700">
                                      {pkg.packageName}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                      Đơn giá: {formatCurrency(pkg.unitPrice)}
                                    </span>
                                  </div>
                                  <span className="font-extrabold text-blue-600 text-xs">
                                    {formatCurrency(pkg.totalPrice)}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div className="pt-4 border-t border-dashed border-gray-100 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-gray-400">
                                <LayoutList className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                  Khối lượng
                                </span>
                              </div>
                              <span className="text-xs font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                                {qp.volume} m³
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-12 group">
                        <div className="relative bg-gray-900 rounded-[2.5rem] p-6 md:p-10 text-white overflow-hidden shadow-2xl shadow-gray-200">
                          {/* Decorative elements */}
                          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-all group-hover:bg-blue-500/20"></div>
                          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

                          <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                                <Calculator className="w-6 h-6 text-blue-400" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold">
                                  Tổng hợp phương án
                                </h3>
                                <p className="text-xs text-gray-400 font-medium">
                                  Giá trị dự kiến theo từng gói dịch vụ
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                              {Object.entries(
                                quotationPackages.reduce((acc: any, qp) => {
                                  qp.packages.forEach((pkg) => {
                                    if (!acc[pkg.packageName])
                                      acc[pkg.packageName] = 0;
                                    acc[pkg.packageName] += pkg.totalPrice;
                                  });
                                  return acc;
                                }, {}),
                              ).map(([packageName, total]: any) => (
                                <div
                                  key={packageName}
                                  className="group/item relative bg-white/5 border border-white/10 rounded-3xl p-6 transition-all hover:bg-white/10 hover:scale-105"
                                >
                                  <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2 opacity-80">
                                    {packageName}
                                  </div>
                                  <div className="text-3xl font-black tabular-nums tracking-tighter">
                                    {formatCurrency(total)}
                                  </div>
                                  <div className="mt-4 flex items-center gap-2">
                                    <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                      <div className="h-full bg-blue-500 w-full animate-pulse"></div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-24 bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Calculator className="w-10 h-10 text-gray-200" />
                      </div>
                      <p className="font-bold text-gray-400 text-lg">
                        Chưa có gói dịch vụ nào được chọn
                      </p>
                      <p className="text-sm text-gray-300 mt-2">
                        Vui lòng chọn các gói khả dụng ở trên để xây dựng báo
                        giá
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-10">
                  <button
                    onClick={() => setActiveTab("general")}
                    className="flex items-center gap-3 px-8 py-3 border-2 border-gray-100 text-gray-400 rounded-xl font-bold hover:bg-gray-50 hover:text-gray-900 transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Quay lại Thông tin
                  </button>
                  <button
                    onClick={() => setActiveTab("preview")}
                    className="flex items-center gap-3 px-10 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-50 active:scale-95"
                  >
                    Tiếp tục xem kết quả
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === "preview" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
                <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl p-10 relative overflow-hidden">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-16">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-2">
                        Chi tiết Dự thảo Báo giá
                      </h2>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                          <User className="w-4 h-4 text-blue-500" />
                          <span className="font-bold text-gray-900">
                            {selectedCustomer?.fullName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span className="font-bold text-gray-900">
                            {formData.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* <div className="bg-blue-600 rounded-3xl p-8 border border-blue-500 shadow-xl shadow-blue-100 w-full md:w-auto min-w-[300px] text-white">
                  <div className="space-y-1 mb-4">
                    <span className="text-[10px] font-bold opacity-70 uppercase tracking-widest">
                      Tổng giá trị thanh toán
                    </span>
                    <div className="text-xl font-bold tracking-tighter tabular-nums">
                      {formatCurrency(calculateTotal())}
                    </div>
                  </div>
                </div> */}
                  </div>

                  {/* Package Totals Summary */}
                  <div className="mb-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availablePackageHeaders.map((pkgHeader: any) => {
                      const total = quotationPackages.reduce((sum, qp) => {
                        const pkg = qp.packages.find(
                          (p) => p.packageName === pkgHeader.packageName,
                        );
                        return sum + (pkg?.totalPrice || 0);
                      }, 0);

                      if (total === 0) return null;

                      return (
                        <div
                          key={pkgHeader._id}
                          className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col justify-center"
                        >
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                            {pkgHeader.packageName}
                          </div>
                          <div className="text-xl font-bold text-gray-900">
                            {formatCurrency(total)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bảng 1: Cấu hình Đơn giá */}
                  <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-8 mb-8">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                      <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                      1. Bảng cấu hình Đơn giá chi tiết
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead>
                          <tr className="bg-gray-50/50 border-b border-gray-100 uppercase tracking-tighter">
                            <th
                              className="px-4 py-4 text-[10px] font-black text-gray-400 w-12 text-center"
                              rowSpan={2}
                            >
                              STT
                            </th>
                            <th
                              className="px-5 py-4 text-[10px] font-black text-gray-400"
                              rowSpan={2}
                            >
                              Chi tiết Dịch vụ & Hạng mục
                            </th>
                            <th
                              className="px-5 py-4 text-[10px] font-black text-gray-400 w-24 text-center"
                              rowSpan={2}
                            >
                              Khối lượng
                            </th>
                            <th
                              className="px-5 py-4 text-[10px] font-black text-gray-400 text-center border-l border-gray-100 bg-blue-50/30"
                              colSpan={availablePackageHeaders.length || 1}
                            >
                              Đơn giá chi tiết (VNĐ/m³)
                            </th>
                          </tr>
                          <tr className="bg-gray-50/50 border-b border-gray-100 uppercase tracking-tighter text-[9px] font-black">
                            {availablePackageHeaders.length > 0 ? (
                              availablePackageHeaders.map((pkgHeader) => (
                                <th
                                  key={pkgHeader._id}
                                  className="px-2 py-2 text-blue-600 text-center border-l border-gray-100 italic"
                                >
                                  {pkgHeader.packageName}
                                </th>
                              ))
                            ) : (
                              <th className="px-2 py-2 text-blue-600 text-center border-l border-gray-100 italic">
                                Chưa có gói
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {quotationPackages.map((qp, idx) => (
                            <tr
                              key={idx}
                              className="group hover:bg-blue-50/5 transition-colors"
                            >
                              <td className="px-4 py-6 text-sm font-bold text-gray-400 text-center">
                                {idx + 1}
                              </td>
                              <td className="px-5 py-6">
                                <div className="text-sm font-black text-gray-900 uppercase leading-tight">
                                  {qp.service}
                                </div>
                                <div className="text-[10px] text-gray-400 font-bold mt-1 opacity-70">
                                  Nhóm: {qp.serviceGroup}
                                </div>
                              </td>
                              <td className="px-3 py-6 text-center text-sm font-bold text-gray-400">
                                <input
                                  type="text"
                                  value={formatNumberInput(qp.volume)}
                                  onChange={(e) =>
                                    handlePreviewVolumeChange(
                                      idx,
                                      e.target.value,
                                    )
                                  }
                                  className="w-16 bg-gray-50 border border-transparent rounded-lg text-center font-bold focus:bg-white focus:border-blue-600 outline-none transition-all py-1"
                                />
                              </td>
                              {availablePackageHeaders.map((pkgHeader) => {
                                const pkg = qp.packages.find(
                                  (p) =>
                                    p.packageName === pkgHeader.packageName,
                                );
                                return (
                                  <td
                                    key={pkgHeader._id}
                                    className="px-3 py-6 text-center border-l border-gray-100 relative"
                                  >
                                    <input
                                      type="text"
                                      value={formatNumberInput(
                                        pkg?.unitPrice || "",
                                      )}
                                      onChange={(e) =>
                                        handlePreviewPriceChange(
                                          idx,
                                          pkgHeader.packageName,
                                          e.target.value,
                                        )
                                      }
                                      placeholder="-"
                                      className="w-full min-w-[120px] px-3 py-2 bg-gray-50 border border-transparent rounded-lg font-bold text-right focus:bg-white focus:border-blue-600 outline-none transition-all text-sm shadow-inner"
                                    />
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Bảng 2: Tính toán Thành tiền */}
                  <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-8 mb-12">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                      <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                      2. Bảng tính toán Thành tiền tổng hợp (Khối lượng x Đơn
                      giá)
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead>
                          <tr className="bg-gray-50/50 border-b border-gray-100 uppercase tracking-tighter">
                            <th
                              className="px-4 py-4 text-[10px] font-black text-gray-400 w-12 text-center"
                              rowSpan={2}
                            >
                              STT
                            </th>
                            <th
                              className="px-5 py-4 text-[10px] font-black text-gray-400"
                              rowSpan={2}
                            >
                              Chi tiết Dịch vụ & Hạng mục
                            </th>
                            <th
                              className="px-3 py-4 text-[10px] font-black text-gray-400 w-20 text-center"
                              rowSpan={2}
                            >
                              KL
                            </th>
                            <th
                              className="px-5 py-4 text-[10px] font-black text-gray-400 text-center border-l border-gray-100 bg-emerald-50/30"
                              colSpan={availablePackageHeaders.length || 1}
                            >
                              Thành tiền dự kiến (VNĐ)
                            </th>
                          </tr>
                          <tr className="bg-gray-50/50 border-b border-gray-100 uppercase tracking-tighter text-[9px] font-black">
                            {availablePackageHeaders.length > 0 ? (
                              availablePackageHeaders.map((pkgHeader) => (
                                <th
                                  key={pkgHeader._id}
                                  className="px-2 py-2 text-emerald-600 text-center border-l border-gray-100 italic"
                                >
                                  {pkgHeader.packageName}
                                </th>
                              ))
                            ) : (
                              <th className="px-2 py-2 text-emerald-600 text-center border-l border-gray-100 italic">
                                Chưa có gói
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {quotationPackages.map((qp, idx) => (
                            <tr
                              key={idx}
                              className="group hover:bg-emerald-50/5 transition-colors"
                            >
                              <td className="px-4 py-6 text-sm font-bold text-gray-400 text-center">
                                {idx + 1}
                              </td>
                              <td className="px-5 py-6">
                                <div className="text-sm font-bold text-gray-900 uppercase leading-tight">
                                  {qp.service}
                                </div>
                              </td>
                              <td className="px-3 py-6 text-center text-sm font-bold text-gray-400">
                                {qp.volume}
                              </td>
                              {availablePackageHeaders.map((pkgHeader) => {
                                const pkg = qp.packages.find(
                                  (p) =>
                                    p.packageName === pkgHeader.packageName,
                                );
                                return (
                                  <td
                                    key={pkgHeader._id}
                                    className="px-3 py-6 text-right border-l border-gray-100 font-black text-[11px] text-gray-900 tabular-nums"
                                  >
                                    {pkg && pkg.totalPrice > 0 ? (
                                      formatCurrency(pkg.totalPrice)
                                    ) : (
                                      <span className="text-gray-100">-</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-900 text-white">
                            <td
                              colSpan={3}
                              className="px-5 py-6 text-right font-black text-xs uppercase tracking-widest"
                            >
                              TỔNG CỘNG THEO PHƯƠNG ÁN
                            </td>
                            {availablePackageHeaders.map((pkgHeader) => {
                              const totalForPackage = quotationPackages.reduce(
                                (sum, qp) => {
                                  const pkg = qp.packages.find(
                                    (p) =>
                                      p.packageName === pkgHeader.packageName,
                                  );
                                  return sum + (pkg?.totalPrice || 0);
                                },
                                0,
                              );
                              return (
                                <td
                                  key={pkgHeader._id}
                                  className="px-3 py-6 text-right border-l border-gray-800 font-black text-xs tabular-nums text-blue-400"
                                >
                                  {totalForPackage > 0
                                    ? formatCurrency(totalForPackage)
                                    : "-"}
                                </td>
                              );
                            })}
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {formData.notes && (
                    <div className="p-8 bg-amber-50/50 border border-amber-100 rounded-3xl">
                      <label className="block text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3">
                        Ghi chú từ Chuyên viên
                      </label>
                      <p className="text-amber-900 font-bold leading-relaxed italic text-sm whitespace-pre-wrap">
                        "{formData.notes}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-6">
                  <button
                    onClick={() => setActiveTab("services")}
                    className="flex items-center gap-3 px-8 py-4 text-gray-400 font-bold hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Quay lại tab Dịch vụ
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="group flex items-center gap-4 px-12 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-2xl active:scale-95"
                  >
                    <Save className="w-5 h-5 text-blue-500" />
                    {loading ? "Đang xử lý..." : "Hoàn tất & Lưu hồ sơ"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Survey Modal */}
      {showSurveyModal && selectedSurvey && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex items-center justify-center p-4 transition-all animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Chi tiết Khảo sát
                </h2>
                <p className="text-gray-500 text-sm">
                  Mã: {selectedSurvey.surveyNo}
                </p>
              </div>
              <button
                onClick={() => setShowSurveyModal(false)}
                className="p-3 hover:bg-gray-100 rounded-2xl transition-all"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Ngày lập
                    </label>
                    <p className="text-gray-900 font-bold">
                      {new Date(selectedSurvey.surveyDate).toLocaleDateString(
                        "vi-VN",
                        { dateStyle: "full" },
                      )}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Địa chỉ
                    </label>
                    <p className="text-gray-900 font-bold truncate">
                      {selectedSurvey.surveyAddress}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-md font-bold text-gray-900 mb-4">
                    Danh sách hạng mục
                  </label>
                  <div className="space-y-3">
                    {selectedSurvey.surveys.map((survey, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50/50 transition-colors"
                      >
                        <div>
                          <div className="font-bold text-gray-900">
                            {survey.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Dimensions: {survey.length}m x {survey.width}m |
                            Coeff: {survey.coefficient}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-blue-600 font-bold">
                            {survey.volume} m³
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-gray-100 shrink-0 bg-gray-50/50 flex items-center gap-4">
              <button
                onClick={() => {
                  handleSurveySelect(selectedSurvey);
                  setShowSurveyModal(false);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Chọn hồ sơ này
              </button>
              <button
                onClick={() => setShowSurveyModal(false)}
                className="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-100 transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateQuotation;
