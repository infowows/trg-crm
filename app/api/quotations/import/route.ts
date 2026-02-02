import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Quotation from "@/models/Quotation";
import ProjectSurvey from "@/models/ProjectSurvey";
import Customer from "@/models/Customer";
import { verifyToken } from "@/lib/auth";
import * as XLSX from "xlsx";

async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Không được phép truy cập" },
        { status: 401 },
      );
    }

    await dbConnect();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy file" },
        { status: 400 },
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });

    // Detect new 3-sheet format
    const quoteSheet = workbook.Sheets["3. Báo giá"];
    if (!quoteSheet) {
      return NextResponse.json(
        {
          success: false,
          message:
            "File không đúng định dạng mẫu mới (Thiếu sheet '3. Báo giá')",
        },
        { status: 400 },
      );
    }

    // 1. Read Metadata from Sheet 3
    const customerName = quoteSheet["B2"]?.v;
    const qDateStr = quoteSheet["D2"]?.v;
    const surveyNo = quoteSheet["F2"]?.v;

    // Build Service Group Map from Sheet 1
    const priceSheet = workbook.Sheets["1. Dịch vụ & Bảng giá"];
    const serviceGroupMap = new Map<string, string>();
    if (priceSheet) {
      const priceData: any[] = XLSX.utils.sheet_to_json(priceSheet);
      priceData.forEach((row) => {
        if (row["Tên Dịch Vụ"] && row["Nhóm Dịch Vụ"]) {
          serviceGroupMap.set(row["Tên Dịch Vụ"], row["Nhóm Dịch Vụ"]);
        }
      });
    }

    // Handle DD/MM/YYYY date format
    let quotationDate = new Date();
    if (qDateStr) {
      if (typeof qDateStr === "string" && qDateStr.includes("/")) {
        const parts = qDateStr.split("/");
        if (parts.length === 3) {
          quotationDate = new Date(
            parseInt(parts[2]),
            parseInt(parts[1]) - 1,
            parseInt(parts[0]),
          );
        }
      } else if (!isNaN(Date.parse(qDateStr))) {
        quotationDate = new Date(qDateStr);
      }
    }

    if (!customerName || !surveyNo) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Thông tin Khách hàng hoặc Mã khảo sát không hợp lệ trong file.",
        },
        { status: 400 },
      );
    }

    // Find Customer and Survey
    const [customer, existingSurvey] = await Promise.all([
      Customer.findOne({ fullName: customerName }),
      ProjectSurvey.findOne({ surveyNo: surveyNo }),
    ]);

    if (!existingSurvey) {
      return NextResponse.json(
        {
          success: false,
          message: `Không tìm thấy khảo sát mã ${surveyNo} trên hệ thống.`,
        },
        { status: 404 },
      );
    }

    // 2. Detect Package Count and Names from Header
    // Search row 4 (index 3) for "THÀNH TIỀN" to know where unit prices end
    let numPkgs = 0;
    for (let i = 3; i < 20; i++) {
      const addr = XLSX.utils.encode_cell({ r: 3, c: i });
      const val = quoteSheet[addr]?.v;
      if (val === "THÀNH TIỀN") {
        numPkgs = i - 3;
        break;
      }
    }
    if (numPkgs === 0) numPkgs = 3; // Fallback to 3 if detection fails

    const packageNames: string[] = [];
    for (let i = 0; i < numPkgs; i++) {
      const addr = XLSX.utils.encode_cell({ r: 4, c: 3 + i });
      const val = quoteSheet[addr]?.v;
      if (val) packageNames.push(val.toString());
    }

    // 3. Read Data Rows (Row 6 onwards in Sheet 3)
    // Use header: 1 to get raw array for better control over dynamic columns
    const qRows: any[][] = XLSX.utils.sheet_to_json(quoteSheet, {
      range: 5,
      header: 1,
    });

    const quotationPackages: any[] = [];
    let grandTotalAmount = 0;

    qRows.forEach((r) => {
      const serviceName = r[1];
      const volumeStr = r[2];
      if (!serviceName || !volumeStr) return;

      const rowKL = parseFloat(volumeStr) || 0;
      if (rowKL === 0) return;

      const rowPackages = packageNames
        .map((pName, idx) => {
          // Unit prices start from index 3
          const unitPrice = parseFloat(r[3 + idx]) || 0;
          const totalPrice = Math.round(rowKL * unitPrice);

          return {
            packageName: pName,
            servicePricing: unitPrice,
            totalPrice: totalPrice,
            isSelected: unitPrice > 0,
          };
        })
        .filter((pkg) => pkg.servicePricing > 0);

      if (rowPackages.length > 0) {
        // Add all selected packages to grand total
        rowPackages.forEach((pkg) => {
          grandTotalAmount += pkg.totalPrice;
        });

        quotationPackages.push({
          serviceGroup: serviceGroupMap.get(serviceName) || "Khác",
          service: serviceName,
          volume: rowKL,
          packages: rowPackages,
        });
      }
    });

    if (quotationPackages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy dữ liệu dịch vụ hợp lệ trong file.",
        },
        { status: 400 },
      );
    }

    // 4. Generate Quotation Number
    const lastQuotation = await Quotation.findOne().sort({ createdAt: -1 });
    let qNum = 1;
    if (lastQuotation && lastQuotation.quotationNo) {
      const match = lastQuotation.quotationNo.match(/\d+/);
      qNum = match ? parseInt(match[0]) + 1 : 1;
    }
    const quotationNo = `BG${String(qNum).padStart(3, "0")}`;

    // 5. Save Quotation
    const newQuotation = new Quotation({
      quotationNo,
      customer: customerName,
      customerRef: customer ? customer._id : null,
      surveyRef: existingSurvey._id,
      date: quotationDate,
      packages: quotationPackages,
      totalAmount: grandTotalAmount,
      grandTotal: grandTotalAmount,
      status: "draft",
      createdBy: auth.username,
    });

    await newQuotation.save();

    // Link survey to this quotation
    existingSurvey.quotationNo = quotationNo;
    existingSurvey.status = "quoted";
    await existingSurvey.save();

    return NextResponse.json({
      success: true,
      message: `Import thành công Báo giá ${quotationNo}`,
      data: { quotationNo },
    });
  } catch (error: any) {
    console.error("Import quotation error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Có lỗi xảy ra" },
      { status: 500 },
    );
  }
}
