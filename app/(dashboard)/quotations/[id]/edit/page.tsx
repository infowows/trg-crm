"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  User,
  Calendar,
  FileText,
  Search,
  X,
  CheckCircle,
  Send,
  XCircle,
} from "lucide-react";

interface ServicePackage {
  _id: string;
  packageName: string;
  unitPrice: number;
  servicePricing: number;
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

interface Customer {
  _id: string;
  customerId: string;
  fullName: string;
  phone?: string;
  address?: string;
}

interface Quotation {
  _id: string;
  quotationNo: string;
  customer: string;
  customerRef?: string;
  surveyRef?: string;
  date: string;
  validTo?: string;
  packages: QuotationPackage[];
  totalAmount: number;
  taxAmount?: number;
  grandTotal: number;
  status: "draft" | "sent" | "approved" | "rejected" | "completed";
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const EditQuotation = () => {
  const router = useRouter();
  const params = useParams();
  const [quotationId, setQuotationId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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

  const [quotationPackages, setQuotationPackages] = useState<
    QuotationPackage[]
  >([]);

  const [quotation, setQuotation] = useState<Quotation | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    validTo: "",
    taxAmount: 0,
    notes: "",
  });

  useEffect(() => {
    const initializeQuotationId = async () => {
      const resolvedParams = await params;
      const id = Array.isArray(resolvedParams.id)
        ? resolvedParams.id[0]
        : resolvedParams.id;
      setQuotationId(id || "");
    };

    initializeQuotationId();
  }, [params]);

  useEffect(() => {
    if (quotationId && quotationId.trim() !== "") {
      loadAllData();
    }
  }, [quotationId]);

  const loadAllData = async () => {
    try {
      setInitialLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Fetch all lookup data in parallel
      const [customersRes, surveysRes, groupsRes] = await Promise.all([
        fetch("/api/customers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/surveys", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/service-groups", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const customersData = await customersRes.json();
      const surveysData = await surveysRes.json();
      const groupsData = await groupsRes.json();

      let loadedCustomers: Customer[] = customersData.data || [];
      let loadedSurveys: Survey[] = surveysData.data || [];

      // Fetch the quotation
      const quotationRes = await fetch(`/api/quotations/${quotationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const qData = await quotationRes.json();
      if (qData.success) {
        const quotationData = qData.data;
        setQuotation(quotationData);
        setQuotationPackages(quotationData.packages || []);

        setFormData({
          date: new Date(quotationData.date).toISOString().split("T")[0],
          validTo: quotationData.validTo
            ? new Date(quotationData.validTo).toISOString().split("T")[0]
            : "",
          taxAmount: quotationData.taxAmount || 0,
          notes: quotationData.notes || "",
        });

        // Robust Customer selection
        const custRef = quotationData.customerRef;
        const custName = quotationData.customer;

        if (custRef || custName) {
          const refId =
            typeof custRef === "string" ? custRef : custRef?._id || custRef?.id;
          let customer = loadedCustomers.find(
            (c) => c._id === refId || (c as any).id === refId,
          );

          if (!customer && custName) {
            customer = loadedCustomers.find((c) => c.fullName === custName);
          }

          if (customer) {
            setSelectedCustomer(customer);
          } else if (refId) {
            // Inject placeholder if not in list to ensure selection shows
            const placeholder: Customer = {
              _id: refId,
              fullName: custName || "Khách hàng hiện tại",
              customerId: "REF",
            };
            loadedCustomers = [...loadedCustomers, placeholder];
            setSelectedCustomer(placeholder);
          }
        }

        // Robust Survey selection
        const survRef = quotationData.surveyRef;
        if (survRef) {
          const refId =
            typeof survRef === "string" ? survRef : survRef?._id || survRef?.id;
          let survey = loadedSurveys.find(
            (s) => s._id === refId || (s as any).id === refId,
          );

          if (survey) {
            setSelectedSurvey(survey);
            setSurveySearch(survey.surveyNo);
          } else if (refId) {
            // Inject placeholder survey
            const placeholder: Survey = {
              _id: refId,
              surveyNo: "Khảo sát hiện tại",
              surveys: [],
              surveyDate: "",
              surveyAddress: "",
              status: "",
              createdBy: "",
              createdAt: "",
            };
            loadedSurveys = [...loadedSurveys, placeholder];
            setSelectedSurvey(placeholder);
            setSurveySearch("Khảo sát hiện tại");
          }
        }

        // Update states at once
        setCustomers(loadedCustomers);
        setSurveys(loadedSurveys);
        if (groupsData.success) {
          setServiceGroups(groupsData.data);
        }
      } else {
        toast.error(qData.message || "Không thể tải thông tin báo giá");
        router.push("/quotations");
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Không thể tải dữ liệu ban đầu");
    } finally {
      setInitialLoading(false);
    }
  };

  const loadServices = async (groupId: string) => {
    try {
      const token = localStorage.getItem("token");

      const group = serviceGroups.find((g) => g._id === groupId);
      if (!group) {
        console.error("Service group not found:", groupId);
        return;
      }

      console.log("Loading services for group:", group.name);

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
              name: service.serviceName,
              serviceName: service.serviceName,
              packages: [],
            })) || [],
        };
        console.log("Updated group:", updatedGroup);
        setSelectedServiceGroup(updatedGroup);
      }
    } catch (error) {
      console.error("Error loading services:", error);
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
    const totalVolume = selectedSurvey
      ? selectedSurvey.surveys.reduce(
          (total, survey) => total + (survey.volume || 0),
          0,
        )
      : 1;

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
        setSelectedPackages([]);

        try {
          const token = localStorage.getItem("token");

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

            console.log(
              "Latest Pricing by Package:",
              Array.from(latestPricingByPackage.values()),
            );

            const servicePackages = Array.from(
              latestPricingByPackage.values(),
            ).map((pricing: any) => ({
              _id: pricing._id,
              packageName: pricing.packageName,
              unitPrice: pricing.unitPrice,
              servicePricing: pricing.unitPrice,
              totalPrice: 0,
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

    // Check if service packages already exist
    const selectedPackagesToAdd = selectedPackages.filter(
      (pkg) => pkg.isSelected,
    );
    const duplicates: string[] = [];

    quotationPackages.forEach((qp) => {
      if (
        qp.serviceGroup === selectedServiceGroup.name &&
        qp.service === selectedService.name
      ) {
        selectedPackagesToAdd.forEach((newPkg) => {
          if (qp.packages.some((p) => p.packageName === newPkg.packageName)) {
            duplicates.push(newPkg.packageName);
          }
        });
      }
    });

    if (duplicates.length > 0) {
      toast.error(
        `Gói "${duplicates.join(", ")}" đã tồn tại trong dịch vụ này của báo giá`,
      );
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

    setSelectedPackages((prev) =>
      prev.map((pkg) => ({ ...pkg, isSelected: false })),
    );

    toast.success("Đã thêm gói dịch vụ vào báo giá");
  };

  const removeQuotationPackage = (index: number) => {
    setQuotationPackages(quotationPackages.filter((_, i) => i !== index));
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!quotation) return;

    try {
      const token = localStorage.getItem("token");

      // Cập nhật trạng thái báo giá
      const response = await fetch(`/api/quotations/${quotation._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        // Cập nhật trạng thái khảo sát nếu báo giá có liên kết với khảo sát
        if (quotation.surveyRef) {
          let surveyStatus = null;

          // Xác định trạng thái mới cho khảo sát dựa trên trạng thái báo giá
          if (newStatus === "approved") {
            surveyStatus = "completed"; // Báo giá được duyệt -> Khảo sát hoàn thành
          } else if (newStatus === "rejected") {
            surveyStatus = "cancelled"; // Báo giá bị từ chối -> Khảo sát hủy
          }

          // Gọi API cập nhật trạng thái khảo sát nếu cần
          if (surveyStatus) {
            try {
              const surveyResponse = await fetch(
                `/api/surveys/${quotation.surveyRef}`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ status: surveyStatus }),
                },
              );

              const surveyData = await surveyResponse.json();
              if (surveyData.success) {
                console.log("Đã cập nhật trạng thái khảo sát:", surveyStatus);
              } else {
                console.warn(
                  "Không thể cập nhật trạng thái khảo sát:",
                  surveyData.message,
                );
              }
            } catch (surveyError) {
              console.error(
                "Lỗi khi cập nhật trạng thái khảo sát:",
                surveyError,
              );
            }
          }
        }

        toast.success("Cập nhật trạng thái thành công");
        setQuotation({ ...quotation, status: newStatus as any });
      } else {
        toast.error(data.message || "Không thể cập nhật trạng thái");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) {
      toast.error("Vui lòng chọn khách hàng");
      return;
    }

    if (
      quotation &&
      (quotation.status === "approved" || quotation.status === "completed")
    ) {
      toast.error("Không thể chỉnh sửa báo giá đã được duyệt hoặc hoàn thành");
      return;
    }

    if (quotationPackages.length === 0) {
      toast.error("Vui lòng thêm ít nhất một gói dịch vụ");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const submitData = {
        customer: selectedCustomer.fullName,
        customerRef: selectedCustomer._id,
        surveyRef: selectedSurvey?._id || null,
        date: formData.date,
        validTo: formData.validTo || null,
        packages: quotationPackages,
        totalAmount: calculateTotal(),
        grandTotal: calculateTotal() + formData.taxAmount,
        taxAmount: formData.taxAmount,
        notes: formData.notes,
      };

      const response = await fetch(`/api/quotations/${quotationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Cập nhật báo giá thành công");
        router.push("/quotations");
      } else {
        toast.error(data.message || "Không thể cập nhật báo giá");
      }
    } catch (error) {
      console.error("Error updating quotation:", error);
      toast.error("Không thể cập nhật báo giá");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      draft: {
        color: "bg-gray-100 text-gray-800",
        icon: FileText,
        label: "Bản nháp",
      },
      sent: {
        color: "bg-blue-100 text-blue-800",
        icon: Send,
        label: "Đã gửi",
      },
      approved: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        label: "Đã duyệt",
      },
      rejected: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        label: "Từ chối",
      },
      completed: {
        color: "bg-purple-100 text-purple-800",
        icon: CheckCircle,
        label: "Hoàn thành",
      },
    };

    return configs[status as keyof typeof configs] || configs.draft;
  };

  const filteredSurveys = surveys.filter(
    (survey) =>
      survey.surveyNo.toLowerCase().includes(surveySearch.toLowerCase()) ||
      survey.surveyAddress.toLowerCase().includes(surveySearch.toLowerCase()),
  );

  // Hàm kiểm tra xem có thể chuyển tới trạng thái nào
  const canChangeToStatus = (targetStatus: string): boolean => {
    if (!quotation) return false;

    const currentStatus = quotation.status;

    // Quy tắc chuyển trạng thái
    const allowedTransitions: Record<string, string[]> = {
      draft: ["sent"], // Từ nháp chỉ sang gửi
      sent: ["approved", "rejected"], // Từ gửi sang duyệt hoặc từ chối
      approved: ["completed"], // Từ duyệt sang hoàn thành
      rejected: [], // Từ chối không thể chuyển
      completed: [], // Hoàn thành không thể chuyển
    };

    return allowedTransitions[currentStatus]?.includes(targetStatus) ?? false;
  };

  // Hàm lấy style cho button dựa trên trạng thái
  const getButtonStyle = (targetStatus: string) => {
    const canChange = canChangeToStatus(targetStatus);

    if (!canChange) {
      return "px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed opacity-50";
    }

    const styles: Record<string, string> = {
      draft:
        "px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors",
      sent: "px-4 py-2 bg-blue-200 text-blue-800 rounded-lg hover:bg-blue-300 transition-colors",
      approved:
        "px-4 py-2 bg-green-200 text-green-800 rounded-lg hover:bg-green-300 transition-colors",
      rejected:
        "px-4 py-2 bg-red-200 text-red-800 rounded-lg hover:bg-red-300 transition-colors",
      completed:
        "px-4 py-2 bg-purple-200 text-purple-800 rounded-lg hover:bg-purple-300 transition-colors",
    };

    return styles[targetStatus] || styles.draft;
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Không tìm thấy báo giá
          </h2>
          <p className="text-gray-600 mb-4">
            Báo giá bạn tìm không tồn tại hoặc đã bị xóa.
          </p>
          <button
            onClick={() => router.push("/quotations")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(quotation.status);
  const StatusIcon = statusConfig.icon;
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Chỉnh sửa Báo giá
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                Số báo giá:{" "}
                <span className="font-medium">{quotation.quotationNo}</span>
              </span>
              <span className="flex items-center gap-1">
                <StatusIcon className="w-4 h-4" />
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}
                >
                  {statusConfig.label}
                </span>
              </span>
            </div>
          </div>

          {/* phần các hành động thay đổi trạng thái cho báo giá "draft", "sent", "approved", "rejected", "completed"*/}
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleStatusChange("draft")}
              disabled={!canChangeToStatus("draft")}
              className={getButtonStyle("draft")}
            >
              Bản nháp
            </button>
            <button
              onClick={() => handleStatusChange("sent")}
              disabled={!canChangeToStatus("sent")}
              className={getButtonStyle("sent")}
            >
              Đã gửi
            </button>
            <button
              onClick={() => handleStatusChange("approved")}
              disabled={!canChangeToStatus("approved")}
              className={getButtonStyle("approved")}
            >
              Đã duyệt
            </button>
            <button
              onClick={() => handleStatusChange("rejected")}
              disabled={!canChangeToStatus("rejected")}
              className={getButtonStyle("rejected")}
            >
              Từ chối
            </button>
            {quotation.status === "approved" && (
              <button
                onClick={() => handleStatusChange("completed")}
                disabled={!canChangeToStatus("completed")}
                className={getButtonStyle("completed")}
              >
                Hoàn thành
              </button>
            )}
          </div>
        </div>
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
                  <option value="">Chọn khách hàng</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.customerId} - {customer.fullName}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
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

            {quotation.status !== "approved" &&
              quotation.status !== "completed" && (
                <>
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hạn giá
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        value={formData.validTo}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            validTo: e.target.value,
                          })
                        }
                        min={formData.date}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div> */}

                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thuế (VND)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.taxAmount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            taxAmount: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="pl-4 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        min="0"
                        step="1000"
                      />
                    </div>
                  </div> */}
                </>
              )}
          </div>
        </div>

        {/* Survey Selection */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin Khảo sát (Không bắt buộc)
          </h2>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Khảo sát
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Tìm kiếm khảo sát..."
              />
            </div>
            {showSurveyDropdown && surveySearch && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredSurveys.length > 0 ? (
                  filteredSurveys.map((survey) => (
                    <div
                      key={survey._id}
                      onClick={() => handleSurveySelect(survey)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">
                        {survey.surveyNo}
                      </div>
                      <div className="text-sm text-gray-500">
                        {survey.surveyAddress}
                      </div>
                      <div className="text-xs text-gray-400">
                        Tổng khối lượng:{" "}
                        {survey.surveys.reduce(
                          (total, s) => total + (s.volume || 0),
                          0,
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500">
                    Không tìm thấy khảo sát
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Service Selection */}
        {quotation.status !== "approved" &&
          quotation.status !== "completed" && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Chọn Dịch vụ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nhóm Dịch vụ
                  </label>
                  <select
                    onChange={(e) => handleServiceGroupChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                    Dịch vụ
                  </label>
                  <select
                    onChange={(e) => handleServiceChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={!selectedServiceGroup}
                  >
                    <option value="">Chọn dịch vụ</option>
                    {(selectedServiceGroup?.services || []).map((service) => (
                      <option key={service._id} value={service.name}>
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
                      Các gói dịch vụ (Giá đã được cập nhật với khối lượng)
                    </h3>
                    {selectedSurvey && (
                      <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded">
                        Khối lượng:{" "}
                        {Math.round(
                          selectedSurvey.surveys.reduce(
                            (total, s) => total + (s.volume || 0),
                            0,
                          ) * 100,
                        ) / 100}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {selectedPackages.map((pkg) => (
                      <div
                        key={pkg._id}
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={pkg.isSelected}
                            onChange={() => handlePackageToggle(pkg._id)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {pkg.packageName}
                            </p>
                            <p className="text-sm text-gray-500">
                              Đơn giá: {formatCurrency(pkg.unitPrice)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">
                            {formatCurrency(pkg.totalPrice || 0)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addQuotationPackage}
                    disabled={
                      selectedPackages.filter((pkg) => pkg.isSelected)
                        .length === 0
                    }
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm vào báo giá
                  </button>
                </div>
              )}
            </div>
          )}

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
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {qp.serviceGroup} - {qp.service}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Khối lượng: {qp.volume}
                      </p>
                    </div>
                    {quotation.status !== "approved" &&
                      quotation.status !== "completed" && (
                        <button
                          type="button"
                          onClick={() => removeQuotationPackage(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 font-medium text-gray-700">
                            Gói dịch vụ
                          </th>
                          <th className="text-right py-2 font-medium text-gray-700">
                            Đơn giá
                          </th>
                          <th className="text-right py-2 font-medium text-gray-700">
                            Thành tiền
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {qp.packages.map((pkg, pkgIndex) => (
                          <tr
                            key={pkgIndex}
                            className="border-b border-gray-100"
                          >
                            <td className="py-2">
                              <p className="font-medium text-gray-900">
                                {pkg.packageName}
                              </p>
                            </td>
                            <td className="py-2 text-right text-gray-900">
                              {formatCurrency(pkg.servicePricing)}
                            </td>
                            <td className="py-2 text-right font-medium text-gray-900">
                              {formatCurrency(pkg.totalPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {quotationPackages.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <span className="text-gray-700">Tổng thành tiền:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
              {/* {quotation.status !== "approved" &&
                quotation.status !== "completed" && (
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-700">Thuế:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(formData.taxAmount)}
                    </span>
                  </div>
                )} */}
              <div className="border-t pt-3">
                <div className="flex justify-between text-xl font-bold text-blue-600">
                  <span>Tổng cộng:</span>
                  <span>
                    {formatCurrency(calculateTotal() + formData.taxAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {quotation.status !== "approved" &&
          quotation.status !== "completed" && (
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
          )}

        {/* Status Update Section */}
        {quotation &&
          quotation.status !== "approved" &&
          quotation.status !== "completed" &&
          quotation.status !== "rejected" && (
            <div className="bg-amber-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Cập nhật Trạng thái
              </h2>
              <div className="flex flex-wrap gap-3">
                {quotation.status === "draft" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStatusChange("sent")}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Gửi báo giá
                    </button>
                  </>
                )}
                {quotation.status === "sent" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStatusChange("approved")}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Duyệt báo giá
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange("rejected")}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Từ chối báo giá
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

        {/* Actions */}
        {quotation.status !== "approved" &&
          quotation.status !== "completed" && (
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
            </div>
          )}
      </form>
    </div>
  );
};

export default EditQuotation;
