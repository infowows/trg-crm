"use client";

import React, { forwardRef } from "react";

interface NestedPackage {
  _id: string;
  packageName: string;
  servicePricing: number;
  totalPrice: number;
  isSelected: boolean;
  unit?: string;
}

interface ServicePackage {
  _id: string;
  service: string;
  volume: number;
  packages: NestedPackage[];
  note?: string;
}

interface Quotation {
  quotationNo: string;
  customer: string;
  date: string;
  packages: ServicePackage[];
  totalAmount?: number;
  grandTotal?: number;
}

interface Props {
  quotation: Quotation;
}

const QuotationPDFTemplate = forwardRef<HTMLDivElement, Props>(
  ({ quotation }, ref) => {
    const formatDate = (dateString: string) => {
      if (!dateString) return "";
      const d = new Date(dateString);
      return `Ngày ${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`;
    };

    const formatCurrency = (amount?: number) => {
      if (amount === undefined || amount === null) return "";
      return new Intl.NumberFormat("vi-VN").format(amount);
    };

    const packageNames = Array.from(
      new Set(
        quotation.packages.flatMap((p) =>
          p.packages
            .filter((pkg) => pkg.isSelected)
            .map((pkg) => pkg.packageName),
        ),
      ),
    ) as string[];

    const numPkgs = packageNames.length || 1;
    // Nếu số lượng gói từ 5 trở lên, tự động tách thành 2 bảng riêng biệt
    const isSplitView = numPkgs > 3;

    const renderTable = (type: "unit" | "total" | "both") => {
      const showUnit = type === "unit" || type === "both";
      const showTotal = type === "total" || type === "both";

      // Tính toán colSpan
      const priceCols = (showUnit ? numPkgs : 0) + (showTotal ? numPkgs : 0);
      const fontSize = isSplitView ? "9pt" : numPkgs > 3 ? "8pt" : "9pt";

      return (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize,
            tableLayout: "fixed",
            marginBottom: "30px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#D9EAD3" }}>
              <th style={{ ...styles.th, width: "35px" }} rowSpan={2}>
                STT
              </th>
              <th style={styles.th} rowSpan={2}>
                NỘI DUNG CÔNG VIỆC
              </th>
              <th style={{ ...styles.th, width: "55px" }} rowSpan={2}>
                KL (m2)
              </th>
              {showUnit && (
                <th style={styles.th} colSpan={numPkgs}>
                  ĐƠN GIÁ (VNĐ)
                </th>
              )}
              {showTotal && (
                <th style={styles.th} colSpan={numPkgs}>
                  THÀNH TIỀN (VNĐ)
                </th>
              )}
              <th style={{ ...styles.th, width: "90px" }} rowSpan={2}>
                GHI CHÚ
              </th>
            </tr>
            <tr style={{ backgroundColor: "#D9EAD3" }}>
              {showUnit &&
                packageNames.map((name) => (
                  <th key={`dg-head-${name}`} style={styles.thSub}>
                    {name}
                  </th>
                ))}
              {showTotal &&
                packageNames.map((name) => (
                  <th key={`tt-head-${name}`} style={styles.thSub}>
                    {name}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {quotation.packages.map((item, index) => (
              <tr key={item._id || index}>
                <td style={{ ...styles.td, textAlign: "center" }}>
                  {index + 1}
                </td>
                <td
                  style={{
                    ...styles.td,
                    textAlign: "left",
                    paddingLeft: "5px",
                  }}
                >
                  {item.service}
                </td>
                <td style={{ ...styles.td, textAlign: "center" }}>
                  {item.volume || "-"}
                </td>

                {showUnit &&
                  packageNames.map((name) => {
                    const pkg = item.packages.find(
                      (p) => p.packageName === name && p.isSelected,
                    );
                    return (
                      <td
                        key={`dg-val-${name}`}
                        style={{
                          ...styles.td,
                          textAlign: "right",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatCurrency(pkg?.servicePricing)}
                      </td>
                    );
                  })}

                {showTotal &&
                  packageNames.map((name) => {
                    const pkg = item.packages.find(
                      (p) => p.packageName === name && p.isSelected,
                    );
                    return (
                      <td
                        key={`tt-val-${name}`}
                        style={{
                          ...styles.td,
                          textAlign: "right",
                          backgroundColor: "#f9f9f9",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatCurrency(pkg?.totalPrice)}
                      </td>
                    );
                  })}

                <td style={styles.td}>{item.note || "-"}</td>
              </tr>
            ))}

            {/* Hàng tổng cộng chỉ hiển thị ở bảng Thành Tiền hoặc bảng gộp */}
            {showTotal && (
              <tr style={{ backgroundColor: "#f2f2f2", fontWeight: "bold" }}>
                <td
                  colSpan={3 + (showUnit ? numPkgs : 0)}
                  style={{ ...styles.td, textAlign: "center" }}
                >
                  TỔNG CỘNG CHI PHÍ
                </td>
                {packageNames.map((name) => {
                  const total = quotation.packages.reduce((sum, item) => {
                    const pkg = item.packages.find(
                      (p) => p.packageName === name && p.isSelected,
                    );
                    return sum + (pkg?.totalPrice || 0);
                  }, 0);
                  return (
                    <td
                      key={`total-tt-${name}`}
                      style={{ ...styles.td, textAlign: "right" }}
                    >
                      {formatCurrency(total)}
                    </td>
                  );
                })}
                <td style={styles.td}></td>
              </tr>
            )}
          </tbody>
        </table>
      );
    };

    return (
      <div
        ref={ref}
        style={{
          width: "297mm",
          margin: "0 auto",
          padding: "15mm",
          backgroundColor: "white",
          color: "black",
          fontFamily: "'Times New Roman', Times, serif",
          boxSizing: "border-box",
        }}
      >
        <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          .print-container { width: 100% !important; margin: 0 !important; padding: 0 !important; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; page-break-inside: auto; }
          th, td { border: 1px solid black !important; word-wrap: break-word; }
          thead { display: table-header-group; }
          tr { page-break-inside: avoid; }
        }
      `}</style>

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "30px",
            borderBottom: "2px solid #1a365d",
            paddingBottom: "10px",
            alignItems: "center",
          }}
        >
          <div style={{ color: "#1a365d", flex: 1 }}>
            <div style={{ fontWeight: "bold", fontSize: "14pt" }}>
              CÔNG TY CỔ PHẦN THIẾT KẾ KIẾN TRÚC XÂY DỰNG TRƯỜNG GIANG
            </div>
            <div style={{ fontSize: "10pt", marginTop: "5px" }}>
              Địa chỉ: Lô K6-D6, KDC PHT6, Bình An, Dĩ An, Bình Dương
            </div>
            <div style={{ fontSize: "10pt" }}>
              Hotline: 0939910448 - 0972463082
            </div>
          </div>
          <div style={{ width: "120px", marginLeft: "20px" }}>
            <img
              src="/images/logo.png"
              alt="Logo"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        </div>

        <h1
          style={{
            textAlign: "center",
            fontSize: "22pt",
            fontWeight: "bold",
            margin: "10px 0",
            color: "#2c5282",
          }}
        >
          THƯ BÁO GIÁ
        </h1>

        <div
          style={{ marginBottom: "20px", fontSize: "11pt", lineHeight: "1.6" }}
        >
          <div>
            <span style={{ fontWeight: "bold" }}>Kính gửi :</span>{" "}
            {quotation.customer}
          </div>
          <div>
            <span style={{ fontWeight: "bold" }}>Công trình :</span> Báo giá
            thiết kế & thi công xây dựng
          </div>
          <div>
            <span style={{ fontWeight: "bold" }}>Ngày lập :</span>{" "}
            {formatDate(quotation.date)}
          </div>
        </div>

        <div
          style={{ marginBottom: "20px", fontSize: "11pt", lineHeight: "1.4" }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "5px" }}>Căn cứ:</div>
          <div style={{ marginLeft: "15px" }}>
            <div>- Căn cứ nhu cầu và trao đổi thực tế với khách hàng.</div>
            <div>
              - Căn cứ năng lực và đơn giá hiện hành của Công ty Trường Giang.
            </div>
          </div>
        </div>

        {isSplitView ? (
          <>
            <div
              style={{
                fontWeight: "bold",
                marginBottom: "10px",
                color: "#2c5282",
                textTransform: "uppercase",
              }}
            >
              Phần I: Chi tiết đơn giá (VNĐ/m2)
            </div>
            {renderTable("unit")}

            <div
              style={{
                fontWeight: "bold",
                marginBottom: "10px",
                color: "#2c5282",
                textTransform: "uppercase",
                marginTop: "20px",
              }}
            >
              Phần II: Tổng hợp thành tiền (VNĐ)
            </div>
            {renderTable("total")}
          </>
        ) : (
          <>
            <div style={{ fontWeight: "bold", marginBottom: "10px" }}>
              Chi tiết báo giá:
            </div>
            {renderTable("both")}
          </>
        )}

        {/* Footer Notes */}
        <div style={{ marginTop: "20px", fontSize: "10pt", lineHeight: "1.6" }}>
          <div style={{ fontWeight: "bold", textDecoration: "underline" }}>
            Ghi chú:
          </div>
          <div style={{ marginLeft: "10px" }}>
            <div>- Báo giá trên chưa bao gồm thuế VAT 10%.</div>
            <div>
              - Đơn giá trên áp dụng cho công trình có điều kiện thi công bình
              thường.
            </div>
            <div>
              - Hiệu lực báo giá trong vòng 30 ngày kể từ ngày phát hành.
            </div>
          </div>
        </div>

        {/* Signature Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "40px",
            pageBreakInside: "avoid",
          }}
        >
          <div style={{ textAlign: "center", width: "350px" }}>
            <div style={{ fontStyle: "italic", marginBottom: "5px" }}>
              Bình Dương, {formatDate(quotation.date)}
            </div>
            <div style={{ fontWeight: "bold", fontSize: "11pt" }}>
              CÔNG TY CP TKKT XD TRƯỜNG GIANG
            </div>
            <div
              style={{
                marginTop: "80px",
                fontWeight: "bold",
                fontSize: "12pt",
              }}
            >
              NGUYỄN VĂN GIANG
            </div>
            <div style={{ fontSize: "10pt" }}>(Giám đốc)</div>
          </div>
        </div>
      </div>
    );
  },
);

const styles = {
  th: {
    border: "1px solid black",
    padding: "8px",
    fontWeight: "bold",
    textAlign: "center" as const,
  },
  thSub: {
    border: "1px solid black",
    padding: "4px",
    textAlign: "center" as const,
  },
  td: { border: "1px solid black", padding: "6px" },
};

QuotationPDFTemplate.displayName = "QuotationPDFTemplate";
export default QuotationPDFTemplate;
