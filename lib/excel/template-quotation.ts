import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface QuotationTemplateOptions {
  customerName: string;
  customers: { name: string; id: string }[];
  survey: {
    surveyNo: string;
    surveyDate: string;
    surveyAddress: string;
    items: { name: string; unit: string; volume: number }[];
    totalVolume: number;
  };
  services: { serviceName: string; serviceGroup: string }[];
  packages: string[];
  pricing: any[];
}

const applyHeaderStyle = (
  cell: ExcelJS.Cell,
  bgColor: string = "FFD9EAD3",
  isBold: boolean = true,
) => {
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: bgColor },
  };
  cell.font = {
    bold: isBold,
    color: { argb: "FF000000" },
    size: 10,
    name: "Arial",
  };
  cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  cell.border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };
};

const applyDataStyle = (
  cell: ExcelJS.Cell,
  horizontal: ExcelJS.Alignment["horizontal"] = "left",
  numFmt?: string,
) => {
  cell.border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };
  cell.font = { size: 10, name: "Arial" };
  cell.alignment = { vertical: "middle", horizontal };
  if (numFmt) {
    cell.numFmt = numFmt;
  }
};

export const generateQuotationTemplate = async (
  options: QuotationTemplateOptions,
) => {
  const workbook = new ExcelJS.Workbook();
  const packageNames =
    options.packages.length > 0
      ? options.packages
      : ["Tối ưu", "Trung bình", "Khá"];
  const numPkgs = packageNames.length;

  // --- SHEET 1: DỊCH VỤ & BẢNG GIÁ ---
  const priceSheet = workbook.addWorksheet("1. Dịch vụ & Bảng giá");
  priceSheet.columns = [
    { header: "Tên Dịch Vụ", key: "serviceName", width: 45 },
    { header: "Nhóm Dịch Vụ", key: "serviceGroup", width: 25 },
    ...packageNames.map((pkg) => ({ header: pkg, width: 15 })),
  ];

  // Style Header
  const headerRow = priceSheet.getRow(1);
  headerRow.height = 25;
  headerRow.eachCell((cell) => {
    applyHeaderStyle(cell, "FF4472C4", true); // Blue header
    cell.font = { ...cell.font, color: { argb: "FFFFFFFF" }, size: 11 }; // White bold text
  });

  // Group services by group
  const servicesByGroup: Record<string, any[]> = {};
  options.services.forEach((s) => {
    if (!servicesByGroup[s.serviceGroup]) servicesByGroup[s.serviceGroup] = [];
    servicesByGroup[s.serviceGroup].push(s);
  });

  const groupColors = ["FFC6E0B4", "FFFFEB9C"]; // Alternating light green and light yellow (slightly darker)
  let groupIdx = 0;

  Object.entries(servicesByGroup).forEach(([groupName, svcs]) => {
    const bgColor = groupColors[groupIdx % groupColors.length];

    svcs.forEach((svcObj) => {
      const svc = svcObj.serviceName;
      const rowData = [
        svc,
        groupName,
        ...packageNames.map((pkg) => {
          const p = options.pricing.find(
            (item) =>
              item.serviceName === svc &&
              (item.packageName === pkg ||
                item.packageName === pkg.replace("Gói ", "")),
          );
          return p ? p.unitPrice : 0;
        }),
      ];

      const row = priceSheet.addRow(rowData);
      row.height = 20;
      row.eachCell((cell) => {
        applyDataStyle(
          cell,
          cell.col === "1" || cell.col === "2" ? "left" : "right",
        );
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: bgColor },
        };
        if (Number(cell.col) > 2) {
          cell.numFmt = "#,##0";
        }
      });
    });
    groupIdx++;
  });

  // --- SHEET 1.1: DATA LISTS (HIDDEN) ---
  const dataListsSheet = workbook.addWorksheet("DataLists");
  dataListsSheet.state = "hidden";
  options.customers.forEach((cust, i) => {
    dataListsSheet.getCell(i + 1, 1).value = cust.name;
  });

  // --- SHEET 2: THÔNG TIN KHẢO SÁT (TINH GỌN) ---
  const surveySheet = workbook.addWorksheet("2. Thông tin khảo sát");

  const sHeaders = ["STT", "Hạng mục", "Đvt", "Khối lượng", "Ghi chú"];
  const sHeaderRow = surveySheet.getRow(1);
  sHeaders.forEach((h, i) => {
    const cell = sHeaderRow.getCell(i + 1);
    cell.value = h;
    applyHeaderStyle(cell, "FFD9EAD3");
  });

  options.survey.items.forEach((item, i) => {
    const row = surveySheet.addRow([
      i + 1,
      item.name,
      item.unit,
      item.volume,
      "",
    ]);
    row.eachCell((cell) => {
      applyDataStyle(cell, Number(cell.col) === 2 ? "left" : "center");
      if (Number(cell.col) === 4) cell.numFmt = "#,##0.00";
    });
  });

  const sTotalRow = surveySheet.addRow([
    "",
    "TỔNG CỘNG KHỐI LƯỢNG",
    "m2",
    options.survey.totalVolume,
    "",
  ]);
  sTotalRow.eachCell((cell) => applyHeaderStyle(cell, "FFD9EAD3"));

  surveySheet.getColumn(2).width = 40;
  surveySheet.getColumn(4).width = 15;

  // --- SHEET 3: BÁO GIÁ (GỒM METADATA ĐỂ IMPORT) ---
  const quoteSheet = workbook.addWorksheet("3. Báo giá");

  // Style for Metadata Region
  const applyMetaStyle = (cell: ExcelJS.Cell, isLabel: boolean = false) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: isLabel ? "FFF2F2F2" : "FFFFFFFF" },
    };
    cell.font = { bold: isLabel, size: 10, name: "Arial" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: isLabel ? "right" : "left",
    };
  };

  // Title
  quoteSheet.mergeCells("A1:F1");
  const qTitleCell = quoteSheet.getCell("A1");
  qTitleCell.value = "BẢNG BÁO GIÁ DỰ TOÁN CHI TIẾT";
  qTitleCell.font = { bold: true, size: 14, color: { argb: "FF1F4E78" } };
  qTitleCell.alignment = { horizontal: "center", vertical: "middle" };
  qTitleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFDDEBF7" },
  };

  // Metadata for Import (Formatting and Coloring)
  quoteSheet.getCell("A2").value = "Khách hàng:";
  const custCell = quoteSheet.getCell("B2");
  custCell.value = options.customerName;
  custCell.dataValidation = {
    type: "list",
    allowBlank: true,
    formulae: [`DataLists!$A$1:$A$${Math.max(options.customers.length, 1)}`],
  };

  quoteSheet.getCell("C2").value = "Ngày báo giá:";
  const dateCell = quoteSheet.getCell("D2");
  dateCell.value = new Date().toLocaleDateString("vi-VN"); // DD/MM/YYYY

  quoteSheet.getCell("E2").value = "Mã khảo sát:";
  const surveyCell = quoteSheet.getCell("F2");
  surveyCell.value = options.survey.surveyNo;

  ["A2", "C2", "E2"].forEach((addr) =>
    applyMetaStyle(quoteSheet.getCell(addr), true),
  );
  ["B2", "D2", "F2"].forEach((addr) =>
    applyMetaStyle(quoteSheet.getCell(addr), false),
  );

  const hRow = 4; // Table header starts at Row 4
  // Merge STT, NOIDUNG, KL
  ["A", "B", "C"].forEach((col) => {
    quoteSheet.mergeCells(`${col}${hRow}:${col}${hRow + 1}`);
    applyHeaderStyle(quoteSheet.getCell(`${col}${hRow}`));
  });
  quoteSheet.getCell(`A${hRow}`).value = "STT";
  quoteSheet.getCell(`B${hRow}`).value = "NỘI DUNG";
  quoteSheet.getCell(`C${hRow}`).value = "KL(m2)";

  // ĐƠN GIÁ region (Starts from Col D - Index 4)
  const startPriceIdx = 4;
  const endPriceIdx = startPriceIdx + numPkgs - 1;
  quoteSheet.mergeCells(hRow, startPriceIdx, hRow, endPriceIdx);
  const qPriceHeader = quoteSheet.getCell(hRow, startPriceIdx);
  qPriceHeader.value = "ĐƠN GIÁ";
  applyHeaderStyle(qPriceHeader, "FFD9EAD3");

  // THÀNH TIỀN region
  const startTimeIdx = endPriceIdx + 1;
  const endTimeIdx = startTimeIdx + numPkgs - 1;
  quoteSheet.mergeCells(hRow, startTimeIdx, hRow, endTimeIdx);
  const qTimeHeader = quoteSheet.getCell(hRow, startTimeIdx);
  qTimeHeader.value = "THÀNH TIỀN";
  applyHeaderStyle(qTimeHeader, "FFDEEAF6");

  // GHI CHÚ
  const noteColIdx = endTimeIdx + 1;
  const noteColChar = String.fromCharCode(64 + noteColIdx);
  quoteSheet.mergeCells(`${noteColChar}${hRow}:${noteColChar}${hRow + 1}`);
  applyHeaderStyle(quoteSheet.getCell(`${noteColChar}${hRow}`));
  quoteSheet.getCell(`${noteColChar}${hRow}`).value = "GHI CHÚ";

  // Subheaders (Package Names)
  packageNames.forEach((name, i) => {
    const pCell = quoteSheet.getCell(hRow + 1, startPriceIdx + i);
    pCell.value = name;
    applyHeaderStyle(pCell, "FFD9EAD3", false);

    const tCell = quoteSheet.getCell(hRow + 1, startTimeIdx + i);
    tCell.value = name;
    applyHeaderStyle(tCell, "FFDEEAF6", false);
  });

  // Table Data with Formulas
  const totalVolAddr = `'2. Thông tin khảo sát'!$D$${options.survey.items.length + 2}`;
  for (let i = 1; i <= 10; i++) {
    const rIdx = hRow + 1 + i; // i=1 -> Row 6
    const row = quoteSheet.getRow(rIdx);
    row.getCell(1).value = i;
    row.getCell(2).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: ["'1. Dịch vụ & Bảng giá'!$A$2:$A$1000"],
    };

    // Volume
    row.getCell(3).value = {
      formula: `IF(B${rIdx}<>"", IF(${totalVolAddr}>0, ${totalVolAddr}, 0), "")`,
      result: 0,
    };
    row.getCell(3).numFmt = "#,##0.00";

    packageNames.forEach((_, pIdx) => {
      const uPriceCell = row.getCell(startPriceIdx + pIdx);
      const uPriceColChar = String.fromCharCode(64 + startPriceIdx + pIdx);

      // VLOOKUP Price (Starts from index 3 in priceSheet as index 1 is Name, 2 is Group)
      uPriceCell.value = {
        formula: `IF(B${rIdx}<>"", VLOOKUP(B${rIdx}, '1. Dịch vụ & Bảng giá'!$A$2:$Z$1000, ${3 + pIdx}, FALSE), 0)`,
        result: 0,
      };
      applyDataStyle(uPriceCell, "right", "#,##0");

      // Total Price
      const totalCell = row.getCell(startTimeIdx + pIdx);
      totalCell.value = {
        formula: `IF(OR(B${rIdx}="", C${rIdx}=""), 0, ${uPriceColChar}${rIdx} * C${rIdx})`,
        result: 0,
      };
      applyDataStyle(totalCell, "right", "#,##0");
      totalCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFDEEAF6" },
      };
    });

    [1, 2, 3, noteColIdx].forEach((c) =>
      applyDataStyle(row.getCell(c), c === 2 ? "left" : "center"),
    );
  }

  quoteSheet.getColumn(2).width = 45;
  quoteSheet.getColumn(3).width = 12;
  [startPriceIdx, startTimeIdx].forEach((start) => {
    for (let j = 0; j < numPkgs; j++)
      quoteSheet.getColumn(start + j).width = 15;
  });
  quoteSheet.views = [{ state: "frozen", ySplit: hRow + 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `BaoGia_${options.survey.surveyNo}.xlsx`);
};
