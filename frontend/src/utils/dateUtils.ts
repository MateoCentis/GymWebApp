/**
 * Format a date string from YYYY-MM-DD to DD/MM/YYYY
 * @param dateString - Date string in ISO format (YYYY-MM-DD)
 * @returns Formatted date string (DD/MM/YYYY)
 */
export function formatDateToDDMMYYYY(
  dateString: string | null | undefined
): string {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid date

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString; // Return original if formatting fails
  }
}
