export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const parseCurrency = (value: string): number => {
  return Number(value.replace(/[^0-9.-]+/g, ""));
};

/**
 * Formats a number for display in input fields (with dots as thousand separators)
 * e.g., 1000000 -> "1.000.000"
 */
export const formatNumberInput = (value: string | number): string => {
  if (value === undefined || value === null || value === "") return "";
  const numString = value.toString().replace(/[^0-9]/g, "");
  if (!numString) return "";
  return parseInt(numString).toLocaleString("vi-VN");
};

/**
 * Extracts raw number from a formatted string
 * e.g., "1.000.000" -> 1000000
 */
export const parseNumberInput = (value: string): number => {
  const rawValue = value.replace(/\./g, "");
  return parseInt(rawValue) || 0;
};
