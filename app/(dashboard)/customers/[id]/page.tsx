"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Star,
  Calendar,
  Briefcase,
} from "lucide-react";

interface Customer {
  customerId: string;
  registrationDate?: Date;
  fullName: string;
  shortName?: string;
  address?: string;
  phone?: string;
  image?: string;
  source?: string;
  referrer?: string;
  referrerPhone?: string;
  serviceGroup?: string;
  marketingClassification?: string;
  potentialLevel?: string;

  assignedTo?: any; // ObjectId hoặc populated employee object
  needsNote?: string;
  isActive: boolean;
  latitude?: number;
  longitude?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SourceSetting {
  _id: string;
  name: string;
  description?: string;
  active: boolean;
}

interface Department {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface User {
  _id: string;
  fullName: string;
  email: string;
  department?: string;
  isActive: boolean;
}

const CustomerUpdate = () => {
  const router = useRouter();
  const params = useParams();
  const [customerId, setCustomerId] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serviceGroups, setServiceGroups] = useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [sources, setSources] = useState<SourceSetting[]>([]);
  const [employees, setEmployees] = useState<
    Array<{ _id: string; fullName: string; position: string; role: string }>
  >([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const shortNameTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [formData, setFormData] = useState({
    registrationDate: "",
    fullName: "",
    shortName: "",
    address: "",
    phone: "",
    image: "",
    googleMapsUrl: "",
    source: "",
    referrer: "",
    referrerPhone: "",
    serviceGroup: "",
    marketingClassification: "",
    potentialLevel: "Trung bình",

    assignedTo: "",
    needsNote: "",
    isActive: true,
    latitude: "",
    longitude: "",
  });

  const position = currentUser?.chuc_vu?.toLowerCase() || "";
  const role = currentUser?.phan_quyen || "";

  const isAdmin = role === "admin";
  const isLead =
    !isAdmin &&
    (position.includes("lead") ||
      position.includes("trưởng") ||
      position.includes("quản lý"));
  const isStaff = !isAdmin && !isLead;

  useEffect(() => {
    const initializeCustomerId = async () => {
      const resolvedParams = await params;
      const id = Array.isArray(resolvedParams.id)
        ? resolvedParams.id[0]
        : resolvedParams.id;
      setCustomerId(id || "");
    };

    initializeCustomerId();
  }, [params]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (shortNameTimeoutRef.current) {
        clearTimeout(shortNameTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!customerId || customerId.trim() === "") {
      console.log("ID khách hàng rỗng, chờ initialization...");
      return;
    }

    console.log("ID khách hàng hợp lệ:", customerId);

    // Load current user info
    const userDataStr = localStorage.getItem("userData");
    if (userDataStr) {
      setCurrentUser(JSON.parse(userDataStr));
    }

    loadSources();
    loadServiceGroups();
    loadEmployees();
    loadCustomer();
  }, [customerId]);

  const loadEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/employees?active=true&limit=200", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setEmployees(data.data);
      }
    } catch (error) {
      console.error("Error loading employees:", error);
    }
  };

  // useEffect để xử lý trường hợp ID không hợp lệ sau khi đã initialization
  useEffect(() => {
    // Chỉ kiểm tra sau khi params đã được resolve
    if (params && typeof params.then !== "function") {
      const resolvedParams = params as { id: string | string[] };
      const id = Array.isArray(resolvedParams.id)
        ? resolvedParams.id[0]
        : resolvedParams.id;

      if (!id || id.trim() === "") {
        console.log(
          "ID không hợp lệ sau initialization, redirect về danh sách",
        );
        toast.error("ID khách hàng không hợp lệ");
        router.push("/customers");
      }
    }
  }, [params, router]);

  // useEffect để debug khi customer đã được tải
  useEffect(() => {
    console.log("Customer loaded:", {
      customer: !!customer,
    });
  }, [customer]);

  const loadSources = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/source-settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setSources(data.data.filter((s: SourceSetting) => s.active));
      }
      console.log("nguồn khách:", data);
    } catch (error) {
      console.error("Error loading sources:", error);
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

  const loadCustomer = async () => {
    try {
      console.log("Loading customer with ID:", customerId);
      console.log("Customer ID type:", typeof customerId);

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage");
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/customers/${customerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Response status:", response.status);

      if (!response.ok) {
        console.error("Response not OK:", response.status, response.statusText);
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (data.success) {
        const customerData = data.data;
        setCustomer(customerData);
        setFormData({
          registrationDate: customerData.registrationDate
            ? new Date(customerData.registrationDate)
                .toISOString()
                .split("T")[0]
            : "",
          fullName: customerData.fullName || "",
          shortName: customerData.shortName || "",
          address: customerData.address || "",
          phone: customerData.phone || "",
          image: customerData.image || "",
          googleMapsUrl: "", // Không có trong model, để trống
          source: customerData.source || "",
          referrer: customerData.referrer || "",
          referrerPhone: customerData.referrerPhone || "",
          serviceGroup: customerData.serviceGroup || "",
          marketingClassification: customerData.marketingClassification || "",
          potentialLevel: customerData.potentialLevel || "Trung bình",

          assignedTo:
            typeof customerData.assignedTo === "object"
              ? customerData.assignedTo?._id || ""
              : customerData.assignedTo || "",
          needsNote: customerData.needsNote || "",
          isActive: customerData.isActive !== false,
          latitude: customerData.latitude?.toString() || "",
          longitude: customerData.longitude?.toString() || "",
        });
        console.log("formdata:", customerData);
      } else {
        console.error("API returned error:", data);
        toast.error(data.message || "Không thể tải thông tin khách hàng");
        router.push("/customers");
      }
    } catch (error) {
      console.error("Error loading customer:", error);
      toast.error(
        `Không thể tải thông tin khách hàng: ${error instanceof Error ? error.message : "Lỗi không xác định"}`,
      );
      router.push("/customers");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Hàm tạo tên viết tắt từ tên đầy đủ theo quy tắc:
  // Tên cuối (Normalized) + Ký tự đầu của tất cả các từ phía trước
  const generateShortName = (name: string) => {
    if (!name) return "";

    // Chuẩn hóa và loại bỏ dấu tiếng Việt
    const normalized = name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .trim();

    const words = normalized.split(/\s+/).filter((w) => w.length > 0);
    if (words.length === 0) return "";
    if (words.length === 1) return words[0].toUpperCase();

    const lastWord = words[words.length - 1];
    const otherWords = words.slice(0, words.length - 1);

    // Lấy ký tự đầu của tất cả các từ phía trước
    const suffix = otherWords.map((w) => w[0]).join("");

    return (lastWord + suffix).toUpperCase();
  };

  // Xử lý khi rời khỏi trường Tên đầy đủ
  const handleFullNameBlur = () => {
    // Xóa timeout cũ nếu có
    if (shortNameTimeoutRef.current) {
      clearTimeout(shortNameTimeoutRef.current);
    }

    // Luôn cập nhật tên viết tắt theo tên đầy đủ mới nhất
    shortNameTimeoutRef.current = setTimeout(() => {
      setFormData((prev) => {
        if (prev.fullName.trim()) {
          return {
            ...prev,
            shortName: generateShortName(prev.fullName),
          };
        }
        return prev;
      });
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation các trường required
    if (!formData.fullName.trim()) {
      toast.error("Vui lòng nhập tên khách hàng");
      return;
    }

    if (!formData.shortName.trim()) {
      toast.error("Vui lòng nhập tên ngắn");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }

    setSaving(true);
    try {
      const submitData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude
          ? parseFloat(formData.longitude)
          : undefined,
      };

      const token = localStorage.getItem("token");
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Cập nhật khách hàng thành công");
        router.push("/customers");
      } else {
        toast.error(data.message || "Không thể cập nhật khách hàng");
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error("Không thể cập nhật khách hàng");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin khách hàng...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy khách hàng</p>
          <button
            onClick={() => router.push("/customers")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push("/customers")}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <User className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Cập nhật khách hàng
              </h1>
              <p className="text-gray-600">Chỉnh sửa thông tin khách hàng</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin cơ bản
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên khách hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    onBlur={handleFullNameBlur}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Nhập tên khách hàng"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên ngắn <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="shortName"
                    value={formData.shortName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Nhập tên ngắn"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Nhập số điện thoại"
                    required
                  />
                </div>

                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="Nhập email"
                                    />
                                </div> */}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Nhập địa chỉ khách hàng"
                />
              </div>
            </div>

            {/* Business Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin kinh doanh
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nguồn khách hàng
                  </label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Chọn nguồn</option>
                    {sources.map((source) => (
                      <option key={source._id} value={source.name}>
                        {source.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mức độ tiềm năng
                  </label>
                  <select
                    name="potentialLevel"
                    value={formData.potentialLevel}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="Ngắn hạn">Ngắn hạn</option>
                    <option value="Trung hạn">Trung hạn</option>
                    <option value="Dài hạn">Dài hạn</option>
                    <option value="Không phù hợp">Không phù hợp</option>
                  </select>
                </div>

                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phòng ban
                                    </label>
                                    <select
                                        value={selectedDepartment}
                                        onChange={handleDepartmentChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    >
                                        <option value="all">
                                            Tất cả phòng ban
                                        </option>
                                        {departments.map((dept) => (
                                            <option
                                                key={dept._id}
                                                value={dept._id}
                                            >
                                                {dept.name}
                                            </option>
                                        ))}
                                    </select>
                                </div> */}

                {/* Người phụ trách */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Người phụ trách <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    disabled={isStaff}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${isStaff ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    required
                  >
                    {!isStaff && (
                      <option value="">-- Chọn người phụ trách --</option>
                    )}
                    {employees
                      .filter((emp) => {
                        // Nếu là staff, chỉ hiện chính mình (để hiển thị đúng value đã chọn)
                        // Hoặc có thể hiện tất cả trong list nhưng disabled.
                        // Logic thống nhất:
                        // Staff: chỉ xem chính mình (nếu data assign đúng behavior)
                        // Lead: không xem admin
                        if (isStaff) return emp._id === currentUser?.id;
                        if (isLead) return emp.role !== "admin";
                        return true;
                      })
                      .map((person) => (
                        <option key={person._id} value={person._id}>
                          {person.fullName} ({person.position})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin bổ sung
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày đăng ký
                  </label>
                  <input
                    type="date"
                    name="registrationDate"
                    value={formData.registrationDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tên ngắn
                                    </label>
                                    <input
                                        type="text"
                                        name="shortName"
                                        value={formData.shortName}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="Nhập tên ngắn"
                                    />
                                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Người giới thiệu
                  </label>
                  <input
                    type="text"
                    name="referrer"
                    value={formData.referrer}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Nhập người giới thiệu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Điện thoại người giới thiệu
                  </label>
                  <input
                    type="tel"
                    name="referrerPhone"
                    value={formData.referrerPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Nhập điện thoại người giới thiệu"
                  />
                </div>

                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nhóm dịch vụ
                                    </label>
                                    <select
                                        name="serviceGroup"
                                        value={formData.serviceGroup}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    >
                                        <option value="">
                                            Chọn nhóm dịch vụ
                                        </option>
                                        {serviceGroups.map((group) => (
                                            <option
                                                key={group._id}
                                                value={group.name}
                                            >
                                                {group.name}
                                            </option>
                                        ))}
                                    </select>
                                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phân loại marketing
                  </label>
                  <select
                    name="marketingClassification"
                    value={formData.marketingClassification}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="Phù hợp">Phù hợp</option>
                    <option value="Chưa phù hợp">Chưa phù hợp</option>
                    {/* <option value="Rác">Rác</option> */}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    name="isActive"
                    value={formData.isActive.toString()}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isActive: e.target.value === "true",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="true">Hoạt động</option>
                    <option value="false">Không hoạt động</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú nhu cầu
                </label>
                <textarea
                  name="needsNote"
                  value={formData.needsNote}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Nhập ghi chú về nhu cầu khách hàng"
                />
              </div>
            </div>

            {/* Location */}
            {/* <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Vị trí
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Vĩ độ (Latitude)
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        name="latitude"
                                        value={formData.latitude}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="10.8231"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kinh độ (Longitude)
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        name="longitude"
                                        value={formData.longitude}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="106.6297"
                                    />
                                </div>
                            </div>
                        </div> */}

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.push("/customers")}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang lưu...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Lưu thay đổi
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerUpdate;
