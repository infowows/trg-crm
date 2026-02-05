"use client";

import { useState, useEffect, Fragment } from "react";
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
  HeartHandshake,
  Eye,
  Calculator,
  CheckSquare,
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
  customerRef?: any;
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
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  const [customerCares, setCustomerCares] = useState<any[]>([]);
  const [selectedCare, setSelectedCare] = useState<any | null>(null);

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

  const [activeTab, setActiveTab] = useState("general");

  const [availablePackageHeaders, setAvailablePackageHeaders] = useState<any[]>(
    [],
  );

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
      loadAvailablePackages();
    }
  }, [quotationId]);

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
        setAvailablePackageHeaders(data.data);
      }
    } catch (error) {
      console.error("Error loading available packages:", error);
    }
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

  const loadAllData = async () => {
    try {
      setInitialLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Fetch all lookup data in parallel
      const [customersRes, surveysRes, groupsRes, caresRes] = await Promise.all(
        [
          fetch("/api/customers", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/surveys", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/service-groups", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/customer-care?limit=100", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ],
      );

      const customersData = await customersRes.json();
      const surveysData = await surveysRes.json();
      const groupsData = await groupsRes.json();
      const caresData = await caresRes.json();

      let loadedCustomers: Customer[] = customersData.data || [];
      let loadedSurveys: Survey[] = surveysData.data || [];
      let loadedCares: any[] = caresData.data || [];

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
          }
        }

        // Robust Care selection
        const careRef = quotationData.careRef;
        if (careRef) {
          const refId =
            typeof careRef === "string" ? careRef : careRef?._id || careRef?.id;
          let care = loadedCares.find(
            (c) => c._id === refId || (c as any).id === refId,
          );

          if (care) {
            setSelectedCare(care);
          } else if (refId) {
            const placeholder = {
              _id: refId,
              careId: "CSKH hiện tại",
              careType: "",
            };
            loadedCares = [...loadedCares, placeholder];
            setSelectedCare(placeholder);
          }
        }

        // Update states at once
        setCustomers(loadedCustomers);
        setSurveys(loadedSurveys);
        setCustomerCares(loadedCares);
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

      const submitData = {
        customer: selectedCustomer.fullName,
        customerRef: selectedCustomer._id,
        surveyRef: selectedSurvey?._id || null,
        careRef: selectedCare?._id || null,
        date: formData.date,
        validTo: formData.validTo || null,
        packages: sanitizedPackages,
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
    return formatCurrencyUtil(amount);
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
    <div className="bg-white min-h-screen flex flex-col">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 pt-4 md:pt-8 px-4 md:px-6 pb-0">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-4 md:mb-6 flex flex-col gap-4">
            <div className="flex-1">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-400 hover:text-gray-900 mb-3 md:mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-sm font-medium">
                  Quay lại danh sách
                </span>
              </button>
              <div className="flex flex-wrap items-baseline gap-2 md:gap-3">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                  {quotation.quotationNo}
                </h1>
                <div
                  className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider ${statusConfig.color} border border-current opacity-80`}
                >
                  {statusConfig.label}
                </div>
              </div>
              <p className="text-sm md:text-base text-gray-500 mt-1">
                Chỉnh sửa thông tin báo giá cho khách hàng{" "}
                <span className="text-gray-900 font-bold">
                  {quotation.customer}
                </span>
              </p>
            </div>

            <div className="flex gap-2 md:gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  loading ||
                  quotation.status === "approved" ||
                  quotation.status === "completed"
                }
                className="flex items-center justify-center gap-2 px-6 md:px-8 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 transition-all shadow-xl shadow-blue-100 font-black active:scale-95 text-sm md:text-base flex-1 md:flex-none"
              >
                <Save className="w-4 h-4 md:w-5 md:h-5" />
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex overflow-x-auto hide-scrollbar pt-2">
            {[
              { id: "general", label: "Thông tin chung", icon: User },
              { id: "services", label: "Gói dịch vụ", icon: Plus },
              { id: "preview", label: "Xem trước & Gửi", icon: Eye },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 md:px-8 py-4 md:py-5 border-b-4 font-black text-xs md:text-sm transition-all whitespace-nowrap ${
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
        <div className="max-w-[1600px] mx-auto">
          {activeTab === "general" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-6 md:p-8">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-6 md:mb-8 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                  Thông tin Khách hàng & Thời gian
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                  <div className="space-y-8">
                    <div className="relative">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                        Khách hàng mục tiêu
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
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none appearance-none transition-all font-bold text-gray-900"
                          required
                          disabled={
                            quotation.status === "approved" ||
                            quotation.status === "completed"
                          }
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

                    <div className="relative">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                        Liên kết CSKH
                      </label>
                      <div className="relative group">
                        <HeartHandshake className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                        <select
                          value={selectedCare?._id || ""}
                          onChange={(e) => {
                            const care = customerCares.find(
                              (c) => c._id === e.target.value,
                            );
                            setSelectedCare(care || null);
                          }}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none appearance-none transition-all font-bold text-gray-900"
                          disabled={
                            quotation.status === "approved" ||
                            quotation.status === "completed"
                          }
                        >
                          <option value="">-- Không có liên kết --</option>
                          {customerCares.map((care) => (
                            <option key={care._id} value={care._id}>
                              {care.careId} - {care.careType}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="relative">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                        Ngày lập báo giá
                      </label>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) =>
                            setFormData({ ...formData, date: e.target.value })
                          }
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-gray-900"
                          required
                          disabled={
                            quotation.status === "approved" ||
                            quotation.status === "completed"
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                  Dữ liệu Khảo sát & Ghi chú
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
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
                        className="w-full pl-12 pr-10 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none appearance-none transition-all font-bold text-gray-900 shadow-sm"
                        disabled={["approved", "completed"].includes(
                          quotation.status,
                        )}
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
                  <div className="space-y-4">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                      Ghi chú báo giá
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          notes: e.target.value,
                        })
                      }
                      className="w-full h-full min-h-[120px] p-6 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-gray-900 shadow-sm resize-none"
                      placeholder="Nhập các điều khoản bổ sung hoặc ưu đãi riêng..."
                      disabled={
                        quotation.status === "approved" ||
                        quotation.status === "completed"
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setActiveTab("services")}
                  className="group flex items-center gap-3 px-10 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all active:scale-95"
                >
                  Tiếp tục chọn dịch vụ
                  <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {activeTab === "services" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              {/* Service Selection */}
              {quotation.status !== "approved" &&
                quotation.status !== "completed" && (
                  <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-6 md:p-8">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-6 md:mb-8 flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                      Cấu hình Dịch vụ
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-10">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                          Nhóm ngành hàng
                        </label>
                        <select
                          onChange={(e) =>
                            handleServiceGroupChange(e.target.value)
                          }
                          className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none appearance-none transition-all font-bold text-gray-900 shadow-sm"
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
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                          Dịch vụ cụ thể
                        </label>
                        <select
                          onChange={(e) => handleServiceChange(e.target.value)}
                          className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none appearance-none transition-all font-bold text-gray-900 shadow-sm disabled:opacity-50"
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
                      <div className="animate-in fade-in zoom-in-95 duration-500">
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
                                  selectedPackages.length > 0 &&
                                  selectedPackages.every((p) => p.isSelected)
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : "bg-white border-gray-300"
                                }`}
                              >
                                {selectedPackages.length > 0 &&
                                  selectedPackages.every(
                                    (p) => p.isSelected,
                                  ) && <CheckSquare className="w-3 h-3" />}
                              </div>
                              Chọn tất cả
                            </button>
                          </div>
                          {selectedSurvey && (
                            <div className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold border border-blue-100">
                              Khối lượng áp dụng:{" "}
                              {selectedSurvey.surveys.reduce(
                                (t, s) => t + (s.volume || 0),
                                0,
                              )}{" "}
                              m³
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                          {selectedPackages.map((pkg) => (
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
                                    className={`w-5 h-5 rounded flex items-center justify-center border-2 ${pkg.isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300"}`}
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
                                <div className="text-right">
                                  <div
                                    className={`font-black ${pkg.isSelected ? "text-blue-600" : "text-gray-400"}`}
                                  >
                                    {formatCurrency(pkg.totalPrice || 0)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={addQuotationPackage}
                          disabled={
                            selectedPackages.filter((p) => p.isSelected)
                              .length === 0
                          }
                          className="w-full md:w-auto flex items-center justify-center gap-3 px-12 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 transition-all shadow-xl shadow-blue-50 active:scale-95"
                        >
                          <Plus className="w-5 h-5" />
                          Thêm gói này vào hồ sơ
                        </button>
                      </div>
                    )}
                  </div>
                )}

              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                  Dấu trình các gói đã chọn
                </h2>
                {quotationPackages.length > 0 ? (
                  <div className="space-y-6">
                    {quotationPackages.map((qp, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
                          <div>
                            <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">
                              {qp.serviceGroup}
                            </div>
                            <h3 className="text-lg font-black text-gray-900">
                              {qp.service}
                            </h3>
                            <div className="text-xs text-gray-400 mt-1 font-bold italic">
                              Khối lượng: {qp.volume} m³
                            </div>
                          </div>
                          {quotation.status !== "approved" &&
                            quotation.status !== "completed" && (
                              <button
                                onClick={() => removeQuotationPackage(idx)}
                                className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {qp.packages.map((pkg, pIdx) => (
                            <div
                              key={pIdx}
                              className="flex items-center justify-between px-5 py-3 bg-gray-50 rounded-2xl border border-gray-100/50 hover:bg-blue-50/50 transition-colors"
                            >
                              <span className="text-xs font-black text-gray-600 uppercase tracking-tight truncate mr-2">
                                {pkg.packageName}
                              </span>
                              <span className="text-sm font-black text-blue-600 whitespace-nowrap">
                                {formatCurrency(pkg.totalPrice)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="mt-10 bg-gray-900 rounded-5xl p-10 text-white relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 p-10 opacity-10">
                        <Calculator className="w-40 h-40" />
                      </div>
                      <div className="relative z-10">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 block">
                          Tổng giá trị dự kiến theo từng phương án (VND)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                              className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 shadow-inner"
                            >
                              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                                {packageName}
                              </div>
                              <div className="text-xl font-black text-blue-400 tabular-nums">
                                {formatCurrency(total)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 bg-gray-50 rounded-5xl border-2 border-dashed border-gray-200">
                    <Calculator className="w-20 h-20 text-gray-200 mx-auto mb-6" />
                    <p className="font-black text-gray-400">
                      Danh sách trống. Hãy thêm các gói dịch vụ phía trên.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-10">
                <button
                  onClick={() => setActiveTab("general")}
                  className="flex items-center gap-3 px-10 py-4 border-2 border-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-50 transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Quay lại tab Thông tin
                </button>
                <button
                  onClick={() => setActiveTab("preview")}
                  className="flex items-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-50 active:scale-95"
                >
                  Tiếp tục xem kết quả
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </button>
              </div>
            </div>
          )}

          {activeTab === "preview" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
              <div className="bg-white border border-gray-100 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl p-6 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 blur-3xl"></div>

                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-6 md:gap-10 mb-10 md:mb-16">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-4">
                        Chi tiết Báo giá
                      </h2>
                      <div className="inline-flex items-center gap-3 px-4 py-2 bg-gray-900 text-white rounded-2xl">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <span className="font-black text-sm tracking-widest uppercase">
                          {quotation?.quotationNo}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 w-full md:w-auto">
                      {Object.entries(
                        quotationPackages.reduce((acc: any, qp) => {
                          qp.packages.forEach((pkg) => {
                            if (!acc[pkg.packageName]) acc[pkg.packageName] = 0;
                            acc[pkg.packageName] += pkg.totalPrice;
                          });
                          return acc;
                        }, {}),
                      ).map(([packageName, total]: any) => (
                        <div
                          key={packageName}
                          className="bg-gray-50 rounded-3xl p-6 border border-gray-100 min-w-[200px]"
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                              {packageName} (Gồm thuế)
                            </span>
                            <div className="text-xl font-bold text-blue-600 tabular-nums">
                              {formatCurrency(
                                total + (formData.taxAmount || 0),
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
                              <td className="px-5 py-6 text-center">
                                <input
                                  type="text"
                                  value={formatNumberInput(qp.volume)}
                                  onChange={(e) =>
                                    handlePreviewVolumeChange(
                                      idx,
                                      e.target.value,
                                    )
                                  }
                                  className="w-16 bg-gray-50 border border-transparent rounded-lg text-center font-bold focus:bg-white focus:border-blue-600 outline-none transition-all py-1 text-sm text-gray-600"
                                />
                              </td>
                              {availablePackageHeaders.map((pkgHeader) => {
                                const pkg = qp.packages.find(
                                  (p) =>
                                    p.packageName.toLowerCase() ===
                                    pkgHeader.packageName.toLowerCase(),
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
                                    p.packageName.toLowerCase() ===
                                    pkgHeader.packageName.toLowerCase(),
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
                          {/* Summary Row for Grand Totals */}
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
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {formData.notes && (
                    <div className="mt-20 p-10 bg-amber-50 rounded-[3rem] border-2 border-amber-100 shadow-inner">
                      <label className="block text-xs font-black text-amber-500 uppercase tracking-widest mb-4">
                        Ghi chú từ Chuyên viên
                      </label>
                      <p className="text-amber-900 font-bold leading-relaxed italic text-lg whitespace-pre-wrap">
                        "{formData.notes}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Critical Actions */}
              {quotation &&
                !["approved", "completed", "rejected"].includes(
                  quotation.status,
                ) && (
                  <div className="bg-gray-900 rounded-[3rem] p-12 text-white shadow-2xl shadow-gray-200">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                      <div className="text-center md:text-left">
                        <h3 className="text-2xl font-black mb-2 flex items-center justify-center md:justify-start gap-4 uppercase tracking-tighter">
                          <div className="w-10 h-1 bg-blue-500 rounded-full"></div>
                          Phê duyệt & Vận hành
                        </h3>
                        <p className="text-gray-400 font-bold italic">
                          Vui lòng xác thực thông tin trước khi chuyển trạng
                          thái của báo giá.
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-4">
                        {quotation.status === "draft" && (
                          <button
                            onClick={() => handleStatusChange("sent")}
                            className="flex items-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-4xl font-black shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                          >
                            <Send className="w-6 h-6" />
                            Gửi hồ sơ cho khách hàng
                          </button>
                        )}
                        {quotation.status === "sent" && (
                          <>
                            <button
                              onClick={() => handleStatusChange("approved")}
                              className="flex items-center gap-3 px-12 py-5 bg-green-500 hover:bg-green-600 text-white rounded-4xl font-black shadow-xl shadow-green-500/20 transition-all active:scale-95"
                            >
                              <CheckCircle className="w-6 h-6" />
                              Duyệt báo giá
                            </button>
                            <button
                              onClick={() => handleStatusChange("rejected")}
                              className="flex items-center gap-3 px-10 py-5 bg-red-500 hover:bg-red-600 text-white rounded-4xl font-black shadow-xl shadow-red-500/20 transition-all active:scale-95"
                            >
                              <XCircle className="w-6 h-6" />
                              Từ chối
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              <div className="flex justify-between items-center pt-6">
                <button
                  onClick={() => setActiveTab("services")}
                  className="flex items-center gap-3 px-8 py-4 text-gray-400 font-black hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Quay lại tab Dịch vụ
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    loading ||
                    ["approved", "completed"].includes(quotation.status)
                  }
                  className="group flex items-center gap-4 px-12 py-5 bg-gray-900 text-white rounded-[2.5rem] font-black hover:bg-black transition-all shadow-2xl active:scale-95"
                >
                  <Save className="w-7 h-7 text-blue-500" />
                  Lưu toàn bộ thay đổi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditQuotation;
