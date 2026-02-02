import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { CUSTOMER_TEMPLATE_COLUMNS } from "./template-Customer";

export const exportCustomerData = async (data: any[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Danh Sách Khách Hàng");

  // Thiết lập các cột dựa trên template để đồng bộ
  worksheet.columns = CUSTOMER_TEMPLATE_COLUMNS.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width,
  }));

  // Style cho dòng Header
  const headerRow = worksheet.getRow(1);
  headerRow.height = 30;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFF" }, size: 12 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "2F75B5" }, // Dark Blue
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Thêm dữ liệu
  data.forEach((item) => {
    const row = worksheet.addRow({
      fullName: item.fullName,
      shortName: item.shortName,
      phone: item.phone,
      email: item.email,
      address: item.address,
      source: item.source,
      referrer: item.referrer,
      referrerPhone: item.referrerPhone,
      serviceGroup: item.serviceGroup,
      marketingClassification: item.marketingClassification || "Phù hợp",
      potentialLevel: item.potentialLevel,
      salesPerson: item.salesPerson,
      needsNote: item.needsNote,
    });

    // Thêm border cho tất cả các ô trong dòng (kể cả ô trống)
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { vertical: "middle" };
    });
  });

  // Xuất file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const fileName = `Danh_sach_Khach_hang_${new Date().toISOString().split("T")[0]}.xlsx`;
  saveAs(blob, fileName);
};
