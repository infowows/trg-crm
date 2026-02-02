import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface ExcelColumn {
  header: string;
  key: string;
  width: number;
  style?: Partial<ExcelJS.Style>;
}

export const CUSTOMER_TEMPLATE_COLUMNS: ExcelColumn[] = [
  { header: "Tên đầy đủ", key: "fullName", width: 30 },
  { header: "Tên viết tắt", key: "shortName", width: 15 },
  { header: "Điện thoại", key: "phone", width: 20 },
  { header: "Email", key: "email", width: 25 },
  { header: "Địa chỉ", key: "address", width: 40 },
  { header: "Nguồn", key: "source", width: 15 },
  { header: "Người giới thiệu", key: "referrer", width: 20 },
  { header: "SĐT người giới thiệu", key: "referrerPhone", width: 20 },
  { header: "Nhóm dịch vụ quan tâm", key: "serviceGroup", width: 20 },
  { header: "Phân loại marketing", key: "marketingClassification", width: 25 },
  { header: "Mức độ tiềm năng", key: "potentialLevel", width: 20 },
  { header: "Nhân viên phụ trách", key: "salesPerson", width: 25 },
  { header: "Ghi chú nhu cầu", key: "needsNote", width: 50 },
];

interface TemplateOptions {
  sources: string[];
  serviceGroups: string[];
  employees: string[];
}

export const generateCustomerTemplate = async (options: TemplateOptions) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Mẫu Khách Hàng");

  // Tạo sheet phụ để chứa các danh sách (nếu cần cho các danh sách dài)
  const dataSheet = workbook.addWorksheet("DataLists");
  dataSheet.state = "hidden"; // Ẩn sheet này đi

  // Đưa dữ liệu vào sheet phụ
  options.sources.forEach((item, index) => {
    dataSheet.getCell(index + 1, 1).value = item;
  });
  options.serviceGroups.forEach((item, index) => {
    dataSheet.getCell(index + 1, 2).value = item;
  });
  options.employees.forEach((item, index) => {
    dataSheet.getCell(index + 1, 3).value = item;
  });

  const marketingOptions = ["Phù hợp", "Chưa phù hợp"];
  const potentialOptions = [
    "Ngắn hạn",
    "Trung hạn",
    "Dài hạn",
    "Không phù hợp",
  ];

  marketingOptions.forEach((item, index) => {
    dataSheet.getCell(index + 1, 4).value = item;
  });
  potentialOptions.forEach((item, index) => {
    dataSheet.getCell(index + 1, 5).value = item;
  });

  // 1. Thêm khu vực chú thích (Dòng 1 - 3)
  for (let i = 1; i <= 3; i++) {
    worksheet.getRow(i).height = 25;
  }

  // Tiêu đề chú thích
  worksheet.mergeCells("A1:B1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "CHÚ THÍCH PHÂN LOẠI CỘT:";
  titleCell.font = { bold: true, size: 11, name: "Arial" };
  titleCell.alignment = { vertical: "middle" };

  // Chú thích Bắt buộc
  const mandatoryLegend = worksheet.getCell("C1");
  mandatoryLegend.value = "BẮT BUỘC NHẬP";
  mandatoryLegend.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  mandatoryLegend.alignment = { vertical: "middle", horizontal: "center" };
  mandatoryLegend.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFDC2626" }, // Red-600
  };
  mandatoryLegend.border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  // chú thích nhập bình thường
  const normalLegend = worksheet.getCell("D1");
  normalLegend.value = "NHẬP BÌNH THƯỜNG";
  normalLegend.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  normalLegend.alignment = { vertical: "middle", horizontal: "center" };
  normalLegend.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E40AF" }, // blue-600
  };
  normalLegend.border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  // Chú thích Dropdown
  const dropdownLegend = worksheet.getCell("E1");
  dropdownLegend.value = "CHỌN TỪ DANH SÁCH";
  dropdownLegend.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  dropdownLegend.alignment = { vertical: "middle", horizontal: "center" };
  dropdownLegend.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF16A34A" }, // Green-600
  };
  dropdownLegend.border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  // 2. Cấu hình cột (Tiêu đề bắt đầu từ Dòng 3)
  worksheet.getRow(3).values = CUSTOMER_TEMPLATE_COLUMNS.map(
    (col) => col.header,
  );

  // Thiết lập độ rộng cột và định dạng số
  CUSTOMER_TEMPLATE_COLUMNS.forEach((col, index) => {
    const column = worksheet.getColumn(index + 1);
    column.width = col.width;
    column.key = col.key;
    if (["phone", "referrerPhone"].includes(col.key)) {
      column.numFmt = "@";
    }
  });

  // 3. Định dạng Header (Dòng 3)
  const headerRow = worksheet.getRow(3);
  headerRow.height = 30;

  headerRow.eachCell((cell, colNumber) => {
    const colKey = CUSTOMER_TEMPLATE_COLUMNS[colNumber - 1].key;
    const isMandatory = ["fullName", "phone"].includes(colKey);
    const isDropdownCol = [
      "source",
      "serviceGroup",
      "marketingClassification",
      "potentialLevel",
      "salesPerson",
    ].includes(colKey);

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: isMandatory
          ? "FFDC2626" // Red
          : isDropdownCol
            ? "FF16A34A" // Green
            : "FF1E40AF", // Dark Blue (cho các cột khác)
      },
    };
    cell.font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
      size: 11,
      name: "Arial",
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // 4. Thêm dữ liệu mẫu (Dòng 5)
  const sampleRowData = [
    "Nguyễn Văn A",
    "NVA",
    "0901234567",
    "nguyenvana@example.com",
    "123 Đường ABC, Quận 1, TP.HCM",
    options.sources[0] || "Facebook",
    "Trần Văn B",
    "0907654321",
    options.serviceGroups[0] || "Tư vấn",
    "Phù hợp",
    "Ngắn hạn",
    options.employees[0] || "Admin",
    "Cần tư vấn về sản phẩm mới và chính sách đại lý",
  ];
  const sampleRow = worksheet.addRow(sampleRowData);
  sampleRow.height = 25;
  sampleRow.eachCell((cell) => {
    cell.alignment = { vertical: "middle" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // 5. Data Validation & Styling cho 1000 dòng liệt kê (Từ dòng 5 đến 1005)
  const dropdownFill: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF0FDF4" }, // Xanh lá cực nhạt Green-50
  };

  const mandatoryFill: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFF1F2" }, // Hồng/Đỏ cực nhạt Rose-50
  };

  for (let i = 5; i <= 1005; i++) {
    const row = worksheet.getRow(i);
    // Thêm khung cho tất cả các ô trong dòng
    for (let j = 1; j <= CUSTOMER_TEMPLATE_COLUMNS.length; j++) {
      const cell = row.getCell(j);
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }

    // Styling cho các cột bắt buộc (Cột 1 và 3)
    [1, 3].forEach((colIndex) => {
      worksheet.getCell(i, colIndex).fill = mandatoryFill;
    });

    // Cấu hình chung cho dropdown
    const dropdownConfigs = [
      { col: 6, list: options.sources, ref: "A", name: "Nguồn" },
      {
        col: 9,
        list: options.serviceGroups,
        ref: "B",
        name: "Nhóm dịch vụ quan tâm",
      },
      { col: 10, list: marketingOptions, ref: "D", name: "Phân loại" },
      { col: 11, list: potentialOptions, ref: "E", name: "Tiềm năng" },
      { col: 12, list: options.employees, ref: "C", name: "Nhân viên" },
    ];

    dropdownConfigs.forEach((cfg) => {
      const cell = worksheet.getCell(i, cfg.col);
      cell.fill = dropdownFill;

      // Đặt giá trị mặc định "Phù hợp" cho 100 dòng đầu tiên của cột Phân loại marketing (cột 10)
      if (cfg.col === 10 && i < 105) {
        cell.value = "Phù hợp";
      }

      if (cfg.list.length > 0) {
        cell.dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`DataLists!$${cfg.ref}$1:$${cfg.ref}$${cfg.list.length}`],
          showInputMessage: true,
          promptTitle: `Chọn ${cfg.name}`,
          prompt: "Vui lòng click vào mũi tên bên phải ô để chọn từ danh sách.",
        };
      }
    });
  }

  // 6. Bỏ qua các cảnh báo "Number stored as text" của Excel
  (worksheet as any).ignoreErrors = [
    {
      range: "C5:C1005",
      numberStoredAsText: true,
    },
    {
      range: "H5:H1005",
      numberStoredAsText: true,
    },
  ];

  // 7. Freeze header (Cố định 4 dòng đầu)
  worksheet.views = [{ state: "frozen", ySplit: 4 }];

  // 8. Xuất file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, "Mẫu thêm khách hàng.xlsx");
};
