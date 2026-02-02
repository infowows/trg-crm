import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/dbConnect";
import Customer from "@/models/Customer";
import { verifyToken } from "@/lib/auth";
import * as XLSX from "xlsx";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Không có quyền truy cập" },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Token không hợp lệ" },
        { status: 401 },
      );
    }

    // Get file from form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy file" },
        { status: 400 },
      );
    }

    // Check file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "File phải có định dạng .xlsx hoặc .xls",
        },
        { status: 400 },
      );
    }

    // Read file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = XLSX.read(buffer, { type: "buffer" });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON - Bắt đầu đọc từ dòng 3 (index 2) nơi có Header thực sự
    const data = XLSX.utils.sheet_to_json(worksheet, { range: 2 });

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, message: "File không có dữ liệu" },
        { status: 400 },
      );
    }

    // Connect to database
    await connectDB();

    // Cache to keep track of next sequences per shortName during this import batch
    const sequenceCache = new Map<string, number>();

    // Helper to remove Vietnamese tones and get initials
    const getInitials = (name: string) => {
      return name
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .split(/\s+/)
        .map((p) => p.charAt(0))
        .join("")
        .toUpperCase();
    };

    const removeVietnameseTones = (str: string) => {
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase();
    };

    // Process and validate data
    const customers: any[] = [];
    const errors: any[] = [];

    for (let i = 0; i < data.length; i++) {
      const row: any = data[i];

      // Map column names (flexible mapping)
      const fullName = (row["Tên đầy đủ"] || row["fullName"] || "")
        .toString()
        .trim();
      const phone = (row["Điện thoại"] || row["phone"] || "").toString().trim();

      if (!fullName && !phone) continue;

      const email = (row["Email"] || row["email"] || "").toString().trim();
      const address = (row["Địa chỉ"] || row["address"] || "")
        .toString()
        .trim();
      const shortName = (row["Tên viết tắt"] || row["shortName"] || "")
        .toString()
        .trim();
      const source = (row["Nguồn"] || row["source"] || "").toString().trim();
      const referrer = (row["Người giới thiệu"] || row["referrer"] || "")
        .toString()
        .trim();
      const referrerPhone = (
        row["SĐT người giới thiệu"] ||
        row["referrerPhone"] ||
        ""
      )
        .toString()
        .trim();
      const serviceGroup = (
        row["Nhóm dịch vụ quan tâm"] ||
        row["serviceGroup"] ||
        ""
      )
        .toString()
        .trim();
      const marketingClassification = (
        row["Phân loại marketing"] ||
        row["marketingClassification"] ||
        ""
      )
        .toString()
        .trim();
      const potentialLevel = (
        row["Mức độ tiềm năng"] ||
        row["potentialLevel"] ||
        ""
      )
        .toString()
        .trim();
      const salesPerson = (
        row["Nhân viên phụ trách"] ||
        row["salesPerson"] ||
        ""
      )
        .toString()
        .trim();
      const needsNote = (row["Ghi chú nhu cầu"] || row["needsNote"] || "")
        .toString()
        .trim();

      // Validate required fields - Chỉ báo lỗi nếu có dữ liệu dở dang
      if (!fullName || !phone) {
        errors.push({
          row: i + 4,
          message: `Dòng ${i + 4}: Thiếu tên đầy đủ hoặc số điện thoại`,
        });
        continue;
      }

      // Check if customer already exists (only non-deleted ones)
      const duplicateConditions = [];
      if (phone) duplicateConditions.push({ phone });
      if (email) duplicateConditions.push({ email });

      if (duplicateConditions.length > 0) {
        const existingCustomer = await Customer.findOne({
          $or: duplicateConditions,
          isDel: { $ne: true },
        });

        if (existingCustomer) {
          errors.push({
            row: i + 4,
            message: `Dòng ${i + 4}: Khách hàng đã tồn tại (${fullName} - ${phone})`,
          });
          continue;
        }
      }

      // Handle shortName and customerId generation
      let finalShortName = shortName;
      if (!finalShortName && fullName) {
        const parts = removeVietnameseTones(fullName.trim()).split(/\s+/);
        if (parts.length > 0) {
          const lastName = parts.pop();
          const initials = parts.map((p) => p.charAt(0)).join("");
          finalShortName = (lastName + initials).toLowerCase();
        }
      }

      const shortNamePart = finalShortName
        ? finalShortName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
        : getInitials(fullName);

      // Determine next sequence for this shortNamePart
      let nextSeq = sequenceCache.get(shortNamePart);

      if (nextSeq === undefined) {
        // Find max sequence in DB (including deleted ones to stay unique)
        const prefix = "KH";
        const regex = new RegExp(`^${prefix}-${shortNamePart}-\\d{4}$`);
        const latestInDb = await Customer.findOne({
          customerId: { $regex: regex },
        })
          .sort({ customerId: -1 })
          .select("customerId");

        if (latestInDb && latestInDb.customerId) {
          const parts = latestInDb.customerId.split("-");
          const lastNum = parseInt(parts[parts.length - 1]);
          nextSeq = isNaN(lastNum) ? 1 : lastNum + 1;
        } else {
          nextSeq = 1;
        }
      }

      const customerId = `KH-${shortNamePart}-${String(nextSeq).padStart(4, "0")}`;
      sequenceCache.set(shortNamePart, nextSeq + 1);

      // Create customer object
      const customer = {
        customerId,
        fullName,
        shortName: finalShortName,
        phone,
        email,
        address,
        source,
        referrer,
        referrerPhone,
        serviceGroup,
        marketingClassification,
        potentialLevel,
        salesPerson,
        needsNote,
        isActive: true,
        isDel: false,
      };

      customers.push(customer);
    }

    // Insert customers
    let imported = 0;
    if (customers.length > 0) {
      const result = await Customer.insertMany(customers);
      imported = result.length;
    }

    return NextResponse.json({
      success: true,
      message: `Import thành công ${imported} khách hàng`,
      imported,
      total: data.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi khi import file",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
