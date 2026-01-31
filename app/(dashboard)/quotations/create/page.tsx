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
  User,
  Calendar,
  FileText,
  Search,
  X,
  Eye,
} from "lucide-react";

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
  status: string;
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
  const [surveySearch, setSurveySearch] = useState("");
  const [showSurveyDropdown, setShowSurveyDropdown] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [showSurveyModal, setShowSurveyModal] = useState(false);

  const [quotationPackages, setQuotationPackages] = useState<
    QuotationPackage[]
  >([]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    loadCustomers();
    loadServiceGroups();
    loadSurveys();
  }, []);

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
    setSurveySearch(survey.surveyNo);
    setShowSurveyDropdown(false);

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

    const newQuotationPackage: QuotationPackage = {
      serviceGroup: selectedServiceGroup.name,
      service: selectedService.name,
      volume: volume,
      packages: selectedPackages
        .filter((pkg) => pkg.isSelected)
        .map((pkg) => ({
          ...pkg,
          totalPrice: pkg.unitPrice * volume,
        })),
    };

    setQuotationPackages([...quotationPackages, newQuotationPackage]);

    // Reset selection
    setSelectedPackages((prev) =>
      prev.map((pkg) => ({ ...pkg, isSelected: false })),
    );

    toast.success("Đã thêm gói dịch vụ vào báo giá");
  };

  const removeQuotationPackage = (index: number) => {
    setQuotationPackages(quotationPackages.filter((_, i) => i !== index));
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
      const quotationData = {
        date: formData.date,
        customer: selectedCustomer.fullName,
        customerRef: selectedCustomer._id,
        surveyRef: selectedSurvey?._id || null,
        packages: quotationPackages,
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

  const filteredSurveys = surveys.filter(
    (survey) =>
      survey.surveyNo.toLowerCase().includes(surveySearch.toLowerCase()) ||
      survey.surveyAddress.toLowerCase().includes(surveySearch.toLowerCase()),
  );

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
          Tạo Báo giá Mới
        </h1>
        <p className="text-gray-600">
          Tạo báo giá cho khách hàng với các gói dịch vụ đã chọn
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin Khách hàng
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Khách hàng <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedCustomer?._id || ""}
                  onChange={(e) => {
                    const customer = customers.find(
                      (c) => c._id === e.target.value,
                    );
                    if (customer) {
                      handleCustomerSelect(customer);
                    }
                  }}
                  className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none"
                  required
                >
                  <option value="">Chọn khách hàng...</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.customerId} - {customer.fullName}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày báo giá <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      date: e.target.value,
                    })
                  }
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Survey Selection */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin Khảo sát (Không bắt buộc)
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Khảo sát
            </label>
            <div className="flex gap-5 items-start">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <input
                  type="text"
                  value={surveySearch}
                  onChange={(e) => {
                    setSurveySearch(e.target.value);
                    setShowSurveyDropdown(true);
                  }}
                  onFocus={() => setShowSurveyDropdown(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSurveyDropdown(false), 200)
                  }
                  className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Tìm kiếm hoặc chọn khảo sát..."
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                {showSurveyDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredSurveys.length > 0 ? (
                      <>
                        {!surveySearch && (
                          <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-b border-gray-200">
                            Tất cả khảo sát ({surveys.length})
                          </div>
                        )}
                        {filteredSurveys.map((survey) => (
                          <div
                            key={survey._id}
                            onClick={() => handleSurveySelect(survey)}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  {survey.surveyNo}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  {survey.surveyAddress}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {new Date(
                                    survey.surveyDate,
                                  ).toLocaleDateString("vi-VN")}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSurvey(survey);
                                  setShowSurveyModal(true);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors ml-2"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <div className="text-gray-400 mb-2">
                          <Search className="w-8 h-8 mx-auto" />
                        </div>
                        <p className="text-gray-500 text-sm">
                          Không tìm thấy khảo sát
                        </p>
                        {surveySearch && (
                          <p className="text-gray-400 text-xs mt-1">
                            Thử tìm kiếm với từ khóa khác
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {selectedSurvey && (
                <div className="flex-1 p-3 bg-blue-50 border border-blue-200 rounded-lg min-w-[300px]">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-2">
                      <div className="text-sm font-medium text-blue-900">
                        {selectedSurvey.surveyNo}
                      </div>
                      <div className="text-xs text-blue-700 mt-1 line-clamp-1">
                        {selectedSurvey.surveyAddress}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSurvey(null);
                        setSurveySearch("");
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors flex-shrink-0"
                      title="Xóa lựa chọn"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Service Selection */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Chọn Dịch vụ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nhóm Dịch vụ *
              </label>
              <select
                onChange={(e) => handleServiceGroupChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              >
                <option value="">Chọn nhóm dịch vụ</option>
                {serviceGroups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dịch vụ *
              </label>
              <select
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={!selectedServiceGroup}
                required
              >
                <option value="">Chọn dịch vụ</option>
                {(selectedServiceGroup?.services || []).map((service) => (
                  <option
                    className="text-black"
                    key={service._id}
                    value={service.name}
                  >
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Packages */}
          {selectedPackages.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-medium text-gray-900">
                  Các{" "}
                  <span className="text-red-600 font-bold">Gói Dịch vụ</span> và{" "}
                  <span className="text-red-600 font-bold">Giá kèm theo</span>{" "}
                  sau khi đã tính với khối lượng
                </h3>
                {selectedSurvey && (
                  <div className="text-sm text-gray-600">
                    Khối lượng:{" "}
                    <span className="font-medium">
                      {selectedSurvey.surveys
                        .reduce(
                          (total, survey) => total + (survey.volume || 0),
                          0,
                        )
                        .toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {selectedPackages.map((pkg) => {
                  // Dữ liệu đã có đúng trong pkg từ pricing data
                  const actualUnitPrice = pkg.unitPrice || 0;

                  return (
                    <div
                      key={pkg._id}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={pkg.isSelected}
                          onChange={() => handlePackageToggle(pkg._id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {pkg.packageName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Đơn giá:{" "}
                            <span className="font-medium">
                              {actualUnitPrice.toLocaleString()} VNĐ
                            </span>
                            {selectedSurvey && (
                              <span className="ml-2">
                                ×{" "}
                                {selectedSurvey.surveys
                                  .reduce(
                                    (total, survey) =>
                                      total + (survey.volume || 0),
                                    0,
                                  )
                                  .toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {(
                            (pkg.isSelected
                              ? actualUnitPrice *
                                (selectedSurvey?.surveys?.reduce(
                                  (total, survey) =>
                                    total + (survey.volume || 0),
                                  0,
                                ) || 0)
                              : 0) || 0
                          ).toLocaleString()}{" "}
                          VNĐ
                        </div>
                        {!pkg.isSelected && (
                          <div className="text-xs text-gray-400">Chưa chọn</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={addQuotationPackage}
                disabled={
                  selectedPackages.filter((pkg) => pkg.isSelected).length === 0
                }
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
                Thêm vào báo giá
              </button>
            </div>
          )}
        </div>

        {/* Selected Quotation Packages */}
        {quotationPackages.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Các gói đã chọn
            </h2>
            <div className="space-y-4">
              {quotationPackages.map((qp, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="gap-10 flex ">
                      <p className="font-medium text-gray-900">
                        <span className="font-bold">Nhóm dịch vụ: </span>
                        {qp.serviceGroup}
                      </p>
                      <p className="font-medium text-gray-900">
                        <span className="font-bold">Dịch vụ: </span>
                        {qp.service}
                      </p>

                      <p className="font-medium text-gray-900">
                        <span className="font-bold">Khối lượng: </span>
                        {qp.volume}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuotationPackage(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {qp.packages.map((pkg, pkgIndex) => (
                      <div key={pkgIndex} className="flex gap-3 text-sm">
                        <span className="text-black font-bold text-sm">
                          {pkg.packageName}:
                        </span>
                        <span
                          className="text-green-500 font-bold text-sm"
                          style={{
                            fontStyle: "italic",
                          }}
                        >
                          {(pkg.totalPrice || 0).toLocaleString()} VNĐ
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ghi chú
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Nhập ghi chú cho báo giá..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {loading ? "Đang lưu..." : "Lưu Báo giá"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Hủy
          </button>
        </div>
      </form>

      {/* Survey Modal */}
      {showSurveyModal && selectedSurvey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Chi tiết Khảo sát
                </h2>
                <button
                  onClick={() => setShowSurveyModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Số khảo sát
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedSurvey.surveyNo}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ngày khảo sát
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedSurvey.surveyDate).toLocaleDateString(
                        "vi-VN",
                      )}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Địa chỉ khảo sát
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedSurvey.surveyAddress}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hạng mục khảo sát
                  </label>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                            Tên hạng mục
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                            Dài (m)
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                            Rộng (m)
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                            Diện tích (m²)
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                            Hệ số
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                            Khối lượng (m³)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSurvey.surveys.map((survey, index) => (
                          <tr key={index} className="border-t border-gray-200">
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {survey.name}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {survey.length}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {survey.width}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {survey.area}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {survey.coefficient}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {survey.volume}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button
                    onClick={() => {
                      handleSurveySelect(selectedSurvey);
                      setShowSurveyModal(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Chọn Khảo sát này
                  </button>
                  <button
                    onClick={() => setShowSurveyModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateQuotation;
