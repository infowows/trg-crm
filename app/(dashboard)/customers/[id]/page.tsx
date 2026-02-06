"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import mapboxgl from "mapbox-gl";
import {
  User,
  ArrowLeft,
  Building,
  MapPin,
  Phone,
  Target,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ImageIcon,
  Upload,
  X,
  Calendar,
  Save,
} from "lucide-react";
import Popup from "@/components/Popup";
import { toast } from "react-toastify";

interface CustomerFormData {
  registrationDate: string;
  fullName: string;
  shortName: string;
  address: string;
  phone: string;
  image: string;
  googleMapsUrl: string;
  source: string;
  referrer: string;
  referrerPhone: string;
  appraisalDate: string;
  appraisalStatus: string;
  appraisalNote: string;
  trueCustomerDate: string;
  firstContractValue: number;
  potentialLevel: string;
  assignedTo: string;
  needsNote: string;
  isActive: boolean;
  lat: number;
  lng: number;
}

const CustomerUpdate = () => {
  const router = useRouter();
  const params = useParams();
  const [customerId, setCustomerId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [salesPersons, setSalesPersons] = useState<
    Array<{ _id: string; fullName: string; position: string; role: string }>
  >([]);
  const [sources, setSources] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Mapbox state
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 21.0285, lng: 105.8542 });
  const [showMap, setShowMap] = useState(true);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shortNameTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState<CustomerFormData>({
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
    appraisalDate: "",
    appraisalStatus: "Cần theo dõi",
    appraisalNote: "",
    trueCustomerDate: "",
    firstContractValue: 0,
    potentialLevel: "⭐⭐⭐",
    assignedTo: "",
    needsNote: "",
    isActive: true,
    lat: 0,
    lng: 0,
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

  // Initialize customerId from params
  useEffect(() => {
    const initializeId = async () => {
      const resolvedParams = (await params) as { id: string };
      setCustomerId(resolvedParams.id || "");
    };
    initializeId();
  }, [params]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      if (!customerId) return;

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const userDataStr = localStorage.getItem("userData");
        if (userDataStr) setCurrentUser(JSON.parse(userDataStr));

        // Load employees
        const salesResponse = await fetch(
          "/api/employees?active=true&limit=200",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (salesResponse.ok) {
          const data = await salesResponse.json();
          if (data.success) setSalesPersons(data.data);
        }

        // Load sources
        const sourcesResponse = await fetch(
          "/api/source-settings?active=true&limit=100",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (sourcesResponse.ok) {
          const data = await sourcesResponse.json();
          if (data.success) setSources(data.data || []);
        }

        // Load customer data
        const customerResponse = await fetch(`/api/customers/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (customerResponse.ok) {
          const data = await customerResponse.json();
          if (data.success) {
            const customer = data.data;
            setFormData({
              registrationDate: customer.registrationDate
                ? new Date(customer.registrationDate)
                    .toISOString()
                    .split("T")[0]
                : "",
              fullName: customer.fullName || "",
              shortName: customer.shortName || "",
              address: customer.address || "",
              phone: customer.phone || "",
              image: customer.image || "",
              googleMapsUrl: "",
              source: customer.source || "",
              referrer: customer.referrer || "",
              referrerPhone: customer.referrerPhone || "",
              appraisalDate: customer.appraisalDate
                ? new Date(customer.appraisalDate).toISOString().split("T")[0]
                : "",
              appraisalStatus: customer.appraisalStatus || "Cần theo dõi",
              appraisalNote: customer.appraisalNote || "",
              trueCustomerDate: customer.trueCustomerDate
                ? new Date(customer.trueCustomerDate)
                    .toISOString()
                    .split("T")[0]
                : "",
              firstContractValue: customer.firstContractValue || 0,
              potentialLevel: customer.potentialLevel || "⭐⭐⭐",
              assignedTo:
                typeof customer.assignedTo === "object"
                  ? customer.assignedTo?._id || ""
                  : customer.assignedTo || "",
              needsNote: customer.needsNote || "",
              isActive: customer.isActive !== false,
              lat: customer.latitude || 0,
              lng: customer.longitude || 0,
            });
            if (customer.latitude && customer.longitude) {
              setMapCenter({ lat: customer.latitude, lng: customer.longitude });
            }
          } else {
            toast.error(data.message || "Không thể tải dữ liệu khách hàng");
            router.push("/customers");
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId, router]);

  // Mapbox initialization
  useEffect(() => {
    if (showMap && typeof window !== "undefined" && !loading) {
      mapboxgl.accessToken =
        "pk.eyJ1IjoidG9uMDkxNjQiLCJhIjoiY21rdzIyb2h0MGUxcTNjcTBjdGwwZWVjcCJ9.XvgoEicoaAllA1h_j6m0PA";

      const mapContainer = document.getElementById("mapbox-map");
      if (!mapRef.current && mapContainer) {
        const map = new mapboxgl.Map({
          container: "mapbox-map",
          style: "mapbox://styles/mapbox/streets-v11",
          center: [mapCenter.lng, mapCenter.lat],
          zoom: 15,
        });

        map.on("click", (e: any) => {
          handleMapClick(e.lngLat.lat, e.lngLat.lng);
        });

        mapRef.current = map;
      } else if (mapRef.current) {
        mapRef.current.setCenter([mapCenter.lng, mapCenter.lat]);
      }

      if (mapRef.current) {
        const markers = document.getElementsByClassName("mapboxgl-marker");
        while (markers.length > 0) markers[0].remove();

        if (formData.lat !== 0 && formData.lng !== 0) {
          new mapboxgl.Marker()
            .setLngLat([formData.lng, formData.lat])
            .addTo(mapRef.current);
        }
      }
    }
  }, [showMap, mapCenter, formData.lat, formData.lng, loading]);

  const handleMapClick = (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
    setMapCenter({ lat, lng });

    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&language=vi`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data?.features?.length > 0) {
          const placeName =
            data.features[0].place_name_vi || data.features[0].place_name;
          setFormData((prev) => ({ ...prev, address: placeName }));
        }
      })
      .catch(console.error);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    setUploadingImage(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "customers");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!response.ok) throw new Error("Upload ảnh thất bại");

      const result = await response.json();
      if (result.success && result.data.secure_url) {
        setFormData((prev) => ({ ...prev, image: result.data.secure_url }));
        toast.success("Tải ảnh lên thành công");
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải ảnh lên");
    } finally {
      setUploadingImage(false);
    }
  };

  const generateShortName = (name: string) => {
    if (!name) return "";
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
    const suffix = otherWords.map((w) => w[0]).join("");
    return (lastWord + suffix).toUpperCase();
  };

  const handleFullNameBlur = () => {
    if (formData.fullName.trim() && !formData.shortName) {
      setFormData((prev) => ({
        ...prev,
        shortName: generateShortName(prev.fullName),
      }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      toast.error("Vui lòng nhập tên đầy đủ");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const submitData = {
        ...formData,
        registrationDate: formData.registrationDate
          ? new Date(formData.registrationDate)
          : undefined,
        appraisalDate: formData.appraisalDate
          ? new Date(formData.appraisalDate)
          : undefined,
        trueCustomerDate: formData.trueCustomerDate
          ? new Date(formData.trueCustomerDate)
          : undefined,
        latitude: formData.lat || undefined,
        longitude: formData.lng || undefined,
      };

      const response = await fetch(`/api/customers/${customerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) throw new Error("Cập nhật thất bại");

      const data = await response.json();
      if (data.success) {
        toast.success("Cập nhật thông tin khách hàng thành công!");
        setTimeout(() => router.push("/customers"), 2000);
      }
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra khi lưu dữ liệu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <link
        href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css"
        rel="stylesheet"
      />

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.push("/customers")}
            className="mr-4 p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mr-4">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Cập nhật khách hàng
              </h1>
              <p className="text-gray-500">
                Chỉnh sửa thông tin chi tiết khách hàng
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Section */}
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <Building className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-bold text-gray-900">
                  Thông tin cơ bản
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Tên khách hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    onBlur={handleFullNameBlur}
                    placeholder="Nhập tên khách hàng"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Tên ngắn <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="shortName"
                    value={formData.shortName}
                    onChange={handleInputChange}
                    placeholder="GIAUAN"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0916xxxxxx"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Ngày đăng ký
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="registrationDate"
                      value={formData.registrationDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    <Calendar className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Địa chỉ
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Nhập địa chỉ khách hàng..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Business & Appraisal Info Section */}
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <Target className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-bold text-gray-900">
                  Thông tin kinh doanh
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Nguồn khách hàng
                  </label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="">-- Chọn nguồn --</option>
                    {sources.map((s) => (
                      <option key={s._id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Mức độ tiềm năng
                  </label>
                  <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-2xl h-[50px]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            potentialLevel: "⭐".repeat(star),
                          }))
                        }
                        className="transition-transform hover:scale-120"
                      >
                        <Star
                          className={`w-6 h-6 ${[...formData.potentialLevel].length >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Xếp loại thẩm định
                  </label>
                  <select
                    name="appraisalStatus"
                    value={formData.appraisalStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="Phù hợp">Phù hợp</option>
                    <option value="Không phù hợp">Không phù hợp</option>
                    <option value="Cần theo dõi">Cần theo dõi</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Người phụ trách <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    disabled={isStaff}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white disabled:bg-gray-50 disabled:text-gray-500"
                    required
                  >
                    {!isStaff && (
                      <option value="">-- Chọn người phụ trách --</option>
                    )}
                    {salesPersons
                      .filter((p) => !isStaff || p._id === currentUser?.id)
                      .map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.fullName} ({p.position})
                        </option>
                      ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Ngày thẩm định
                  </label>
                  <input
                    type="date"
                    name="appraisalDate"
                    value={formData.appraisalDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Ghi chú thẩm định
                  </label>
                  <textarea
                    name="appraisalNote"
                    value={formData.appraisalNote}
                    onChange={handleInputChange}
                    placeholder="Ghi chú chi tiết lý do thẩm định..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Needs & Notes Section */}
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <Clock className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-bold text-gray-900">
                  Ghi chú nhu cầu
                </h2>
              </div>
              <textarea
                name="needsNote"
                value={formData.needsNote}
                onChange={handleInputChange}
                placeholder="Nhập ghi chú yêu cầu khách hàng..."
                rows={4}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <ImageIcon className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-bold text-gray-900">
                  Hình ảnh đại diện
                </h2>
              </div>
              <div className="space-y-4">
                <div className="relative group">
                  <div
                    className={`aspect-square rounded-3xl overflow-hidden border-2 border-dashed transition-all ${formData.image ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-gray-50 hover:border-blue-400"}`}
                  >
                    {uploadingImage ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                        <span className="text-xs text-blue-600 font-bold">
                          Đang tải...
                        </span>
                      </div>
                    ) : formData.image ? (
                      <img
                        src={formData.image}
                        className="w-full h-full object-cover"
                        alt="Avatar"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <Upload className="w-8 h-8 mb-2" />
                        <span className="text-xs font-bold uppercase tracking-widest">
                          Tải ảnh
                        </span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    id="avatar"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <label
                    htmlFor="avatar"
                    className="absolute inset-0 cursor-pointer"
                  />

                  {formData.image && !uploadingImage && (
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, image: "" }))}
                      className="absolute -top-2 -right-2 bg-white text-red-500 p-2 rounded-xl shadow-lg border border-red-50 hover:bg-red-500 hover:text-white transition-all scale-0 group-hover:scale-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Bấm vào khung để thay đổi ảnh
                </p>
              </div>
            </div>

            {/* Referrer Info Section */}
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <Star className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-bold text-gray-900">
                  Thông tin bổ sung
                </h2>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Người giới thiệu
                  </label>
                  <input
                    name="referrer"
                    value={formData.referrer}
                    onChange={handleInputChange}
                    placeholder="Tên người giới thiệu"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    SĐT người giới thiệu
                  </label>
                  <input
                    name="referrerPhone"
                    value={formData.referrerPhone}
                    onChange={handleInputChange}
                    placeholder="09xx..."
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Trạng thái
                  </label>
                  <select
                    name="isActive"
                    value={formData.isActive.toString()}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        isActive: e.target.value === "true",
                      }))
                    }
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="true">Đang hoạt động</option>
                    <option value="false">Tạm ngưng</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Map Section */}
            {/* <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100 overflow-hidden">
              <div className="flex items-center mb-6">
                <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-bold text-gray-900">
                  Vị trí bản đồ
                </h2>
              </div>
              <div
                id="mapbox-map"
                className="w-full h-48 rounded-2xl border border-gray-100"
              />
              <p className="text-[10px] text-gray-400 font-bold mt-4 uppercase tracking-widest">
                Click vào bản đồ để cập nhật vị trí
              </p>
            </div> */}
            {/* Action Buttons Sticky Bar */}
            <div className="sticky bottom-6 z-50">
              <div className="bg-white/80 backdrop-blur-xl border border-blue-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2.5rem] p-6 space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                      Tên khách hàng
                    </span>
                    <span className="text-lg font-bold text-gray-900 truncate max-w-[150px]">
                      {formData.fullName || "N/A"}
                    </span>
                  </div>
                  <div className="h-8 w-px bg-gray-100"></div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                      Mức độ TN
                    </span>
                    <span className="text-lg">{formData.potentialLevel}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-400/30 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5 mr-3" />
                    )}
                    Lưu thay đổi
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/customers")}
                    className="w-full py-2 text-gray-400 font-bold hover:text-gray-600 transition-colors text-sm"
                  >
                    Hủy thay đổi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CustomerUpdate;
