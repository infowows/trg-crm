"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import mapboxgl from "mapbox-gl";
import {
  User,
  ArrowLeft,
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Target,
  TrendingUp,
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
  salesPerson: string;
  assignedTo: string; // ID của nhân viên được gán
  needsNote: string;
  isActive: boolean;
  lat: number;
  lng: number;
}

const CreateCustomer = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [popup, setPopup] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });
  const [salesPersons, setSalesPersons] = useState<
    Array<{ _id: string; fullName: string; position: string }>
  >([]);
  const [sources, setSources] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Mapbox state
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 21.0285, lng: 105.8542 }); // Default: Hanoi
  const [showMap, setShowMap] = useState(true); // Always show map
  const [searchResults, setSearchResults] = useState<
    Array<{ display_name: string; lat: string; lon: string }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shortNameTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState<CustomerFormData>({
    registrationDate: new Date().toISOString().split("T")[0],
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
    salesPerson: "",
    assignedTo: "",
    needsNote: "",
    isActive: true,
    lat: 0,
    lng: 0,
  });

  // Fetch sales persons and service groups
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        // Get current user info
        const userDataStr = localStorage.getItem("userData");
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          setCurrentUser(userData);

          // Auto-assign to current user if staff
          const position = userData.chuc_vu?.toLowerCase() || "";
          const isStaff =
            !position.includes("lead") &&
            !position.includes("trưởng") &&
            !position.includes("quản lý") &&
            userData.phan_quyen !== "admin";

          if (isStaff) {
            setFormData((prev) => ({ ...prev, assignedTo: userData.id }));
          }
        }

        // Fetch sales persons
        const salesResponse = await fetch("/api/employees", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Fetch sources
        const sourcesResponse = await fetch(
          "/api/source-settings?active=true&limit=100",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (salesResponse.ok) {
          const salesData = await salesResponse.json();
          if (salesData.success) {
            setSalesPersons(salesData.data);
          }
        }

        if (sourcesResponse.ok) {
          const sourcesData = await sourcesResponse.json();
          if (sourcesData.success) {
            setSources(sourcesData.data || []);
          }
          console.log(sourcesData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [router]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (shortNameTimeoutRef.current) {
        clearTimeout(shortNameTimeoutRef.current);
      }
    };
  }, []);

  // Initialize Mapbox map when showMap changes
  useEffect(() => {
    if (showMap && typeof window !== "undefined") {
      // Set access token
      mapboxgl.accessToken =
        "pk.eyJ1IjoidG9uMDkxNjQiLCJhIjoiY21rdzIyb2h0MGUxcTNjcTBjdGwwZWVjcCJ9.XvgoEicoaAllA1h_j6m0PA";

      // Initialize map if not already initialized
      const mapContainer = document.getElementById("mapbox-map");
      if (!mapRef.current && mapContainer) {
        const map = new mapboxgl.Map({
          container: "mapbox-map",
          style: "mapbox://styles/mapbox/streets-v11",
          center: [mapCenter.lng, mapCenter.lat],
          zoom: 15,
        });

        // Add click handler
        map.on("click", (e: any) => {
          handleMapClick(e.lngLat.lat, e.lngLat.lng);
        });

        mapRef.current = map;
      } else if (mapRef.current) {
        // Update existing map center
        mapRef.current.setCenter([mapCenter.lng, mapCenter.lat]);
        mapRef.current.setZoom(15);
      }

      // Update marker
      if (mapRef.current) {
        // Remove existing markers
        const markers = document.getElementsByClassName("mapboxgl-marker");
        while (markers.length > 0) {
          markers[0].remove();
        }

        // Add new marker if coordinates exist
        if (formData.lat !== 0 && formData.lng !== 0) {
          new mapboxgl.Marker()
            .setLngLat([formData.lng, formData.lat])
            .addTo(mapRef.current);
        }
      }
    }
  }, [showMap, mapCenter, formData.lat, formData.lng]);

  // Address search handlers
  const handleAddressSearch = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debouncing (2 seconds - faster UX)
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      setShowSuggestions(true);
      setSelectedIndex(-1);

      try {
        // Tối ưu query cho Việt Nam - tập trung vào query gốc trước
        let searchQueries = [];

        // Query gốc (quan trọng nhất)
        const baseQuery = query.toLowerCase().includes("việt nam")
          ? query
          : `${query}, Việt Nam`;
        searchQueries.push(baseQuery);

        // Nếu query đã có các thành phố lớn, không thêm nữa
        const hasMajorCity = query
          .toLowerCase()
          .match(/(hà nội|ho chi minh|tp\.hcm|da nang|hanoi|saigon)/);

        // Chỉ thêm các thành phố lớn nếu query không có cụ thể
        if (
          !hasMajorCity &&
          !query.toLowerCase().includes("quận") &&
          !query.toLowerCase().includes("phường")
        ) {
          searchQueries.push(`${query}, TP.HCM, Việt Nam`);
          searchQueries.push(`${query}, Hà Nội, Việt Nam`);
          searchQueries.push(`${query}, Đà Nẵng, Việt Nam`);
        }

        // Nếu là địa chỉ cụ thể (có số nhà), thêm các quận/phường phổ biến
        if (query.match(/^\d+/)) {
          // Ưu tiên các quận trung tâm của TP.HCM
          searchQueries.push(`${query}, Quận 1, TP.HCM, Việt Nam`);
          searchQueries.push(`${query}, Quận 3, TP.HCM, Việt Nam`);
          searchQueries.push(`${query}, Quận 5, TP.HCM, Việt Nam`);
          searchQueries.push(`${query}, Quận 10, TP.HCM, Việt Nam`);
          searchQueries.push(`${query}, Phú Nhuận, TP.HCM, Việt Nam`);

          // Ưu tiên các quận trung tâm của Hà Nội
          searchQueries.push(`${query}, Hoàn Kiếm, Hà Nội, Việt Nam`);
          searchQueries.push(`${query}, Ba Đình, Hà Nội, Việt Nam`);
          searchQueries.push(`${query}, Đống Đa, Hà Nội, Việt Nam`);
          searchQueries.push(`${query}, Hai Bà Trưng, Hà Nội, Việt Nam`);
        }

        let allResults: Array<{
          display_name: string;
          lat: string;
          lon: string;
        }> = [];

        // Thử từng query cho đến khi có kết quả
        for (const searchQuery of searchQueries) {
          if (allResults.length >= 5) break; // Giới hạn 5 kết quả

          const maxRetries = 2;
          let retryCount = 0;
          let data = null;

          while (retryCount < maxRetries && !data) {
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                  searchQuery,
                )}&countrycodes=VN&limit=${5 - allResults.length}`,
                {
                  headers: {
                    "User-Agent": "CRM-App/1.0",
                    Accept: "application/json",
                  },
                },
              );

              if (response.ok) {
                data = await response.json();
                if (data && data.length > 0) {
                  // Loại bỏ trùng lặp
                  const newResults = data.filter(
                    (item: any) =>
                      !allResults.some(
                        (existing) =>
                          existing.display_name === item.display_name,
                      ),
                  );
                  allResults = [...allResults, ...newResults];

                  // Nếu query gốc có kết quả, ưu tiên và break early
                  if (searchQuery === baseQuery && newResults.length > 0) {
                    break;
                  }
                }
              } else if (response.status === 429) {
                await new Promise((resolve) =>
                  setTimeout(resolve, 1000 * (retryCount + 1)),
                );
              }
            } catch (error) {
              console.warn(
                `Search attempt ${retryCount + 1} failed for query: ${searchQuery}`,
                error,
              );
              if (retryCount < maxRetries - 1) {
                await new Promise((resolve) =>
                  setTimeout(resolve, 500 * (retryCount + 1)),
                );
              }
            }
            retryCount++;
          }

          // Nếu đã có kết quả tốt từ query gốc, break
          if (allResults.length > 0 && searchQuery === baseQuery) {
            break;
          }
        }

        // Sắp xếp kết quả: ưu tiên kết quả có nhiều chi tiết hơn và match query gốc
        allResults.sort((a, b) => {
          // Ưu tiên kết quả chứa query gốc
          const aContainsQuery = a.display_name
            .toLowerCase()
            .includes(query.toLowerCase());
          const bContainsQuery = b.display_name
            .toLowerCase()
            .includes(query.toLowerCase());

          if (aContainsQuery && !bContainsQuery) return -1;
          if (!aContainsQuery && bContainsQuery) return 1;

          // Sau đó ưu tiên kết quả chi tiết hơn
          const aScore = a.display_name.split(",").length;
          const bScore = b.display_name.split(",").length;
          return bScore - aScore;
        });

        setSearchResults(allResults.slice(0, 5));
      } catch (error) {
        console.error("Error searching address:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 2000); // Giảm xuống 2 giây để UX tốt hơn
  };

  const selectAddress = (place: {
    display_name: string;
    lat: string;
    lon: string;
  }) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);

    setFormData((prev) => ({
      ...prev,
      address: place.display_name,
      lat,
      lng,
    }));

    setMapCenter({ lat, lng });
    setSearchResults([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setShowMap(true);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || searchResults.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          selectAddress(searchResults[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle input changes
  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, address: value }));
    handleAddressSearch(value);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      lat,
      lng,
    }));

    setMapCenter({ lat, lng });

    // Reverse geocoding using Mapbox API
    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=pk.eyJ1IjoidG9uMDkxNjQiLCJhIjoiY21rdzIyb2h0MGUxcTNjcTBjdGwwZWVjcCJ9.XvgoEicoaAllA1h_j6m0PA&language=vi`,
    )
      .then((response) => response.json())
      .then((data) => {
        if (data && data.features && data.features.length > 0) {
          const placeName =
            data.features[0].place_name_vi || data.features[0].place_name;
          setFormData((prev) => ({
            ...prev,
            address: placeName,
          }));
        }
      })
      .catch((error) => {
        console.error("Error reverse geocoding:", error);
      });
  };

  // Handle image upload to Cloudinary
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "customers");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload ảnh thất bại");
      }

      const result = await response.json();

      // Update form with image URL
      if (result.success && result.data.secure_url) {
        setFormData((prev) => ({
          ...prev,
          image: result.data.secure_url,
        }));
      } else {
        throw new Error("Không nhận được URL ảnh từ server");
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Parse Google Maps URL to extract coordinates
  const parseGoogleMapsUrl = async (url: string) => {
    try {
      console.log("Parsing URL:", url);

      // Handle iframe embed code
      if (url.includes("<iframe")) {
        const srcMatch = url.match(/src="([^"]+)"/);
        if (srcMatch) {
          url = srcMatch[1];
          console.log("Extracted URL from iframe:", url);
        }
      }

      // Handle short URLs using server-side proxy
      let finalUrl = url;
      if (url.includes("maps.app.goo.gl")) {
        try {
          console.log("Resolving short URL via proxy...");
          const response = await fetch("/api/resolve-maps-url", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.finalUrl) {
              finalUrl = data.finalUrl;
              console.log("Redirected to:", finalUrl);
            }
          }
        } catch (e) {
          console.log("Could not resolve short URL via proxy:", e);
        }
      }

      console.log("Final URL to parse:", finalUrl);

      // Parse coordinates from different formats
      const patterns = [
        /@(-?\d+\.\d+),(-?\d+\.\d+)/, // @lat,lng
        /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // !3dlat!4dlng (embed)
        /(-?\d+\.\d+),(-?\d+\.\d+)/, // Any coordinate pattern
      ];

      for (const pattern of patterns) {
        const match = finalUrl.match(pattern);
        if (match) {
          console.log("Found coordinates:", match);
          return {
            lat: parseFloat(match[1]),
            lng: parseFloat(match[2]),
          };
        }
      }

      console.log("No coordinates found");
      return null;
    } catch (error) {
      console.error("Error parsing Google Maps URL:", error);
      return null;
    }
  };

  // Handle Google Maps URL input
  const handleGoogleMapsUrl = async (url: string) => {
    if (!url) return;

    setIsSearching(true);
    setError(null);

    try {
      console.log("Processing Google Maps URL:", url);
      const coords = await parseGoogleMapsUrl(url);

      if (coords) {
        console.log("Successfully parsed coordinates:", coords);

        setFormData((prev) => ({
          ...prev,
          lat: coords.lat,
          lng: coords.lng,
        }));

        setMapCenter({ lat: coords.lat, lng: coords.lng });
        setShowMap(true);

        // Reverse geocoding using Mapbox API
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.lng},${coords.lat}.json?access_token=pk.eyJ1IjoidG9uMDkxNjQiLCJhIjoiY21rdzIyb2h0MGUxcTNjcTBjdGwwZWVjcCJ9.XvgoEicoaAllA1h_j6m0PA&language=vi`,
        );

        if (response.ok) {
          const data = await response.json();
          if (data && data.features && data.features.length > 0) {
            const placeName =
              data.features[0].place_name_vi || data.features[0].place_name;
            console.log("Reverse geocoding successful:", placeName);
            setFormData((prev) => ({
              ...prev,
              address: placeName,
            }));
          } else {
            setFormData((prev) => ({
              ...prev,
              address: `Tọa độ: ${coords.lat}, ${coords.lng}`,
            }));
          }
        }
      } else {
        setPopup({
          isOpen: true,
          title: "Lỗi",
          message:
            "Không thể lấy tọa độ từ đường dẫn Google Maps. Vui lòng kiểm tra lại URL.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error processing Google Maps URL:", error);
      setPopup({
        isOpen: true,
        title: "Lỗi",
        message: "Có lỗi xảy ra khi xử lý đường dẫn Google Maps.",
        type: "error",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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

  // Validate form
  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError("Vui lòng nhập tên đầy đủ của khách hàng");
      return false;
    }

    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      setError("Số điện thoại không hợp lệ");
      return false;
    }

    if (
      formData.referrerPhone &&
      !/^[0-9+\-\s()]+$/.test(formData.referrerPhone)
    ) {
      setError("Số điện thoại người giới thiệu không hợp lệ");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Clean form data
      const submitData = {
        ...formData,
        registrationDate: new Date(formData.registrationDate),
        shortName: formData.shortName.trim() || undefined,
        address: formData.address.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        image: formData.image.trim() || undefined,
        source: formData.source.trim() || undefined,
        referrer: formData.referrer.trim() || undefined,
        referrerPhone: formData.referrerPhone.trim() || undefined,
        appraisalDate: formData.appraisalDate
          ? new Date(formData.appraisalDate)
          : undefined,
        appraisalStatus: formData.appraisalStatus,
        appraisalNote: formData.appraisalNote,
        trueCustomerDate: formData.trueCustomerDate
          ? new Date(formData.trueCustomerDate)
          : undefined,
        firstContractValue: formData.firstContractValue,
        salesPerson: formData.salesPerson.trim() || undefined,
        needsNote: formData.needsNote.trim() || undefined,
      };

      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể tạo khách hàng mới");
      }

      const data = await response.json();
      if (data.success) {
        setPopup({
          isOpen: true,
          title: "Thành công",
          message: "Tạo khách hàng mới thành công!",
          type: "success",
        });
        setTimeout(() => {
          router.push("/customers");
        }, 2000);
      }
    } catch (err) {
      console.error("Error creating customer:", err);
      setPopup({
        isOpen: true,
        title: "Lỗi",
        message: err instanceof Error ? err.message : "Có lỗi xảy ra",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get potential level icon
  const getPotentialIcon = (level: string) => {
    switch (level) {
      case "Cao":
        return <TrendingUp className="w-4 h-4" />;
      case "Trung bình":
        return <Star className="w-4 h-4" />;
      case "Thấp":
        return <Clock className="w-4 h-4" />;
    }
  };

  const showMapInfo = false; // Toggle this to show/hide map features

  // Map information section (Technical fields)
  const mapInfo = (
    <>
      <div className="md:col-span-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Đường dẫn Google Maps
        </label>
        <input
          type="url"
          placeholder="https://maps.app.goo.gl/w4yMSQyzwbDirjSg9 hoặc iframe embed code"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          value={formData.googleMapsUrl || ""}
          onChange={(e) => {
            const value = e.target.value;
            setFormData((prev) => ({
              ...prev,
              googleMapsUrl: value,
            }));

            // Auto-execute if it looks like a valid URL
            if (
              value &&
              (value.includes("maps.app.goo.gl") ||
                value.includes("google.com/maps") ||
                value.includes("<iframe"))
            ) {
              handleGoogleMapsUrl(value);
            }
          }}
        />
        {error && error !== null && error.includes("Google Maps") && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Dán đường dẫn Google Maps hoặc iframe embed code để tự động lấy tọa độ
          và địa chỉ
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vĩ độ
        </label>
        <input
          type="number"
          step="any"
          name="lat"
          value={formData.lat}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Vĩ độ"
          readOnly
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kinh độ
        </label>
        <input
          type="number"
          step="any"
          name="lng"
          value={formData.lng}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Kinh độ"
          readOnly
        />
      </div>

      <div className="md:col-span-3 mt-6">
        <div
          id="mapbox-map"
          className="border border-gray-300 rounded-lg overflow-hidden"
          style={{ height: "400px" }}
        />
        <p className="text-sm text-gray-500 mt-2">
          Click vào bản đồ để chọn vị trí hoặc sử dụng ô tìm kiếm địa chỉ ở trên
        </p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Add Mapbox GL CSS */}
      <link
        href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css"
        rel="stylesheet"
      />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center">
              <User className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Tạo khách hàng mới
                </h1>
                <p className="text-gray-600">
                  Thêm thông tin khách hàng tiềm năng vào hệ thống
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Building className="w-5 h-5 mr-2 text-blue-600" />
            Thông tin cơ bản
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên đầy đủ <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                onBlur={handleFullNameBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Nhập tên đầy đủ của khách hàng"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày đăng ký
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="registrationDate"
                  value={formData.registrationDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <Calendar className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên viết tắt <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="shortName"
                value={formData.shortName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Tên viết tắt"
                required
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={
                    showMapInfo ? handleAddressInputChange : handleInputChange
                  }
                  onKeyDown={showMapInfo ? handleKeyDown : undefined}
                  onFocus={
                    showMapInfo
                      ? () => setShowSuggestions(searchResults.length > 0)
                      : undefined
                  }
                  onBlur={
                    showMapInfo
                      ? () => setTimeout(() => setShowSuggestions(false), 200)
                      : undefined
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder={
                    showMapInfo
                      ? "Nhập địa chỉ và chọn từ gợi ý"
                      : "Nhập địa chỉ khách hàng"
                  }
                />
                {showMapInfo && isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  </div>
                )}
                {showMapInfo && !isSearching && formData.address && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <MapPin className="w-4 h-4 text-green-600" />
                  </div>
                )}
              </div>

              {/* Search Status & Autocomplete - Only show if map is enabled */}
              {showMapInfo && (
                <>
                  {searchTimeoutRef.current &&
                    !isSearching &&
                    formData.address.length >= 3 && (
                      <div className="mt-1 text-xs text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Đang tìm kiếm địa chỉ...
                      </div>
                    )}

                  {showSuggestions && searchResults.length > 0 && (
                    <div className="mt-1 border border-gray-300 rounded-lg shadow-lg bg-white max-h-60 overflow-y-auto z-50">
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          onClick={() => selectAddress(result)}
                          className={`px-3 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                            selectedIndex === index
                              ? "bg-blue-50 text-blue-700 border-l-2 border-blue-500"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm text-gray-900 leading-relaxed">
                                {result.display_name}
                              </p>
                            </div>
                            {selectedIndex === index && (
                              <CheckCircle className="w-4 h-4 text-blue-600 ml-2 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <div className="flex items-center h-10">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 text-sm text-gray-700"
                >
                  Khách hàng hoạt động
                </label>
              </div>
            </div>
          </div>

          {showMapInfo && mapInfo}
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Phone className="w-5 h-5 mr-2 text-blue-600" />
            Thông tin liên hệ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Số điện thoại liên hệ"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh
              </label>
              <div className="space-y-3">
                {/* Image Upload Area */}
                <div className="relative">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`
                                            flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition
                                            ${
                                              uploadingImage
                                                ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                                                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                                            }
                                        `}
                  >
                    {uploadingImage ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                        <span className="text-sm text-gray-600">
                          Đang tải ảnh...
                        </span>
                      </div>
                    ) : formData.image ? (
                      <div className="flex flex-col items-center">
                        <ImageIcon className="w-8 h-8 text-green-600 mb-2" />
                        <span className="text-sm text-green-600">
                          Đã tải ảnh
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          Click để thay đổi
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          Tải ảnh lên
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          JPG, PNG, GIF (max 5MB)
                        </span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Image Preview */}
                {formData.image && (
                  <div className="relative">
                    <img
                      src={formData.image}
                      alt="Customer preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          image: "",
                        }))
                      }
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Hidden input for form submission */}
                <input type="hidden" name="image" value={formData.image} />
              </div>
            </div>
          </div>
        </div>

        {/* Source and Classification */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-blue-600" />
            Nguồn và Phân loại
          </h2>

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
                <option value="">-- Chọn nguồn --</option>
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
              <div className="flex items-center space-x-2 bg-white px-3 py-2 border border-gray-300 rounded-lg h-[42px]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      const stars = "⭐".repeat(star);
                      setFormData((prev) => ({
                        ...prev,
                        potentialLevel: stars,
                      }));
                    }}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        [...formData.potentialLevel].length >= star
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-3 text-sm text-gray-500 font-medium whitespace-nowrap">
                  {formData.potentialLevel &&
                  [...formData.potentialLevel].length > 0
                    ? `${[...formData.potentialLevel].length} / 5 sao`
                    : "Chưa đánh giá"}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xếp loại thẩm định
              </label>
              <select
                name="appraisalStatus"
                value={formData.appraisalStatus}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="Phù hợp">Phù hợp</option>
                <option value="Không phù hợp">Không phù hợp</option>
                <option value="Cần theo dõi">Cần theo dõi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày thẩm định
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="appraisalDate"
                  value={formData.appraisalDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <Calendar className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú thẩm định
              </label>
              <textarea
                name="appraisalNote"
                value={formData.appraisalNote}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Ghi chú chi tiết lý do thẩm định..."
              />
            </div>
          </div>
        </div>

        {/* Referrer Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Thông tin người giới thiệu
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên người giới thiệu
              </label>
              <input
                type="text"
                name="referrer"
                value={formData.referrer}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Tên người giới thiệu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại người giới thiệu
              </label>
              <input
                type="tel"
                name="referrerPhone"
                value={formData.referrerPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Số điện thoại người giới thiệu"
              />
            </div>
          </div>
        </div>

        {/* Assignment and Notes */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Phân công và Ghi chú
          </h2>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhân viên phụ trách
              </label>
              <select
                name="salesPerson"
                value={formData.salesPerson}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">-- Chọn nhân viên --</option>
                {salesPersons.map((person) => (
                  <option key={person._id} value={person.fullName}>
                    {person.fullName} - {person.position || "Nhân viên"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhu cầu và ghi chú
              </label>
              <textarea
                name="needsNote"
                value={formData.needsNote}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Ghi chú về nhu cầu, yêu cầu của khách hàng..."
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              <X className="w-5 h-5 mr-2" />
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? "Đang lưu..." : "Lưu khách hàng"}
            </button>
          </div>
        </div>
      </form>

      {/* Popup Component */}
      <Popup
        isOpen={popup.isOpen}
        onClose={() => setPopup((prev) => ({ ...prev, isOpen: false }))}
        title={popup.title}
        message={popup.message}
        type={popup.type}
      />
    </div>
  );
};

export default CreateCustomer;
