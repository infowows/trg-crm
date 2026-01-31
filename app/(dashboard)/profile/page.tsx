"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Shield,
  Key,
  Bell,
  Globe,
  Building,
} from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  ho_ten: string;
  so_dien_thoai: string;
  phong_ban: string;
  chuc_vu: string;
  dia_chi: string;
  avatar?: string;
  ngay_sinh?: string;
  gioi_tinh?: string;
  ngay_tao: string;
  lan_dang_nhap_cuoi: string;
}

const ProfilePage = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    ho_ten: "",
    so_dien_thoai: "",
    dia_chi: "",
    ngay_sinh: "",
    gioi_tinh: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setProfile(data.user);
            setFormData({
              ho_ten: data.user.ho_ten || "",
              so_dien_thoai: data.user.so_dien_thoai || "",
              dia_chi: data.user.dia_chi || "",
              ngay_sinh: data.user.ngay_sinh || "",
              gioi_tinh: data.user.gioi_tinh || "",
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        ho_ten: profile.ho_ten,
        so_dien_thoai: profile.so_dien_thoai,
        dia_chi: profile.dia_chi,
        ngay_sinh: profile.ngay_sinh || "",
        gioi_tinh: profile.gioi_tinh || "",
      });
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setProfile((prev) => (prev ? { ...prev, ...formData } : null));
        setIsEditing(false);
        alert("Cập nhật thông tin thành công!");
      } else {
        alert(data.message || "Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Không tìm thấy thông tin người dùng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Edit className="w-5 h-5 mr-2" />
                Chỉnh sửa
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Lưu
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <X className="w-5 h-5 mr-2" />
                  Hủy
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar và thông tin cơ bản */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-16 h-16 text-blue-600" />
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {isEditing ? (
                    <input
                      type="text"
                      name="ho_ten"
                      value={formData.ho_ten}
                      onChange={handleInputChange}
                      className="text-center border-b border-gray-300 focus:border-blue-500 outline-none"
                    />
                  ) : (
                    profile.ho_ten
                  )}
                </h2>
                <p className="text-gray-600 mb-4">@{profile.username}</p>

                <div className="space-y-3 text-left">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {profile.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="w-4 h-4 mr-2 text-gray-400" />
                    {profile.phong_ban}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="w-4 h-4 mr-2 text-gray-400" />
                    {profile.chuc_vu}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thao tác nhanh
              </h3>
              <div className="space-y-2">
                <button className="w-full flex items-center px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                  <Key className="w-4 h-4 mr-3 text-gray-400" />
                  Đổi mật khẩu
                </button>
                <button className="w-full flex items-center px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                  <Bell className="w-4 h-4 mr-3 text-gray-400" />
                  Cài đặt thông báo
                </button>
                <button className="w-full flex items-center px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                  <Globe className="w-4 h-4 mr-3 text-gray-400" />
                  Ngôn ngữ và vùng
                </button>
              </div>
            </div>
          </div>

          {/* Chi tiết thông tin */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Thông tin chi tiết
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="ho_ten"
                      value={formData.ho_ten}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.ho_ten}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="so_dien_thoai"
                      value={formData.so_dien_thoai}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {profile.so_dien_thoai}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="flex items-center text-gray-900">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {profile.email}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="ngay_sinh"
                      value={formData.ngay_sinh}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {profile.ngay_sinh || "Chưa cập nhật"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính
                  </label>
                  {isEditing ? (
                    <select
                      name="gioi_tinh"
                      value={formData.gioi_tinh}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">
                      {profile.gioi_tinh || "Chưa cập nhật"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phòng ban
                  </label>
                  <p className="text-gray-900">{profile.phong_ban}</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="dia_chi"
                      value={formData.dia_chi}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {profile.dia_chi}
                    </div>
                  )}
                </div>
              </div>

              {/* Thông tin hệ thống */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông tin hệ thống
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày tạo tài khoản
                    </label>
                    <p className="text-gray-900">
                      {new Date(profile.ngay_tao).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lần đăng nhập cuối
                    </label>
                    <p className="text-gray-900">
                      {new Date(profile.lan_dang_nhap_cuoi).toLocaleString(
                        "vi-VN",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
