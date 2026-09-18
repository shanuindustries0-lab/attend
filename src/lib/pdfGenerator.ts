import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { WeeklyReportData } from "@/services/attendanceCalculator";
import { formatShortDate } from "./dateUtils";
import { notoDevanagariBase64 } from "./fonts/NotoSansDevanagariBase64";

interface PDFParams {
  employee: {
    name_en: string;
    name_hi: string;
    category_name: string;
    employee_code?: string;
    daily_salary?: number;
  };
  rangeDates: string[]; // Changed from weekDates
  reportData: WeeklyReportData;
  isPaid?: boolean;
}

export function generateWeeklyReportPDF({
  employee,
  rangeDates,
  reportData,
  isPaid,
}: PDFParams) {
  const doc = new jsPDF();

  doc.addFileToVFS("NotoSansDevanagari.ttf", notoDevanagariBase64);
  doc.addFont("NotoSansDevanagari.ttf", "NotoSansDevanagari", "normal");

  // Dynamic Header
  doc.setFontSize(18);
  doc.setTextColor(33, 37, 41);
  doc.text("Attendance & Payroll Report", 14, 20); // Removed "Weekly"

  doc.setFontSize(10);
  doc.setTextColor(108, 117, 125);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}`,
    14,
    26,
  );

  // ... (Keep the Employee Details Section exactly the same)
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Employee Name: ${employee.name_en}`, 14, 40);

  doc.setFont("NotoSansDevanagari");
  doc.text(`Name (Hindi): ${employee.name_hi}`, 14, 46);

  doc.setFont("helvetica", "normal");
  doc.text(`Category: ${employee.category_name}`, 14, 52);

  const dailySalary = Number(employee.daily_salary) || 0;
  doc.text(`Daily Rate: Rs. ${dailySalary.toLocaleString("en-IN")}`, 14, 58);

  if (employee.employee_code) {
    doc.text(`Employee Code: ${employee.employee_code}`, 14, 64);
  }

  // Use rangeDates instead of weekDates here
  const dateRange = `${formatShortDate(rangeDates[0])} to ${formatShortDate(rangeDates[rangeDates.length - 1])}`;
  doc.text(`Reporting Period: ${dateRange}`, 14, 70);

  // Dynamic Payment Status Stamp (Top Right)
  if (isPaid) {
    doc.setTextColor(22, 163, 74); // Green
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("STATUS: PAID", 150, 20);
  } else {
    doc.setTextColor(220, 38, 38); // Red
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("STATUS: PENDING", 150, 20);
  }

  // Reset typography for the table
  doc.setTextColor(33, 37, 41);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // Format Data for Grid
  const tableBody = reportData.dailyBreakdown.map((day) => {
    let statusText = "";
    if (day.isHoliday) statusText = `Holiday (Unpaid)`;
    else if (day.isFuture) statusText = "-";
    else {
      switch (day.status) {
        case "present":
          statusText = "Present (Full Pay)";
          break;
        case "absent":
          statusText = "Absent (No Pay)";
          break;
        case "half_day":
          statusText = "Half Day (50% Pay)";
          break;
        default:
          statusText = "Not Marked";
          break;
      }
    }
    return [
      formatShortDate(day.date),
      new Date(day.date).toLocaleDateString("en-GB", { weekday: "long" }),
      statusText,
    ];
  });

  autoTable(doc, {
    startY: 78,
    head: [["Date", "Day", "Attendance Status"]],
    body: tableBody,
    theme: "grid",
    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [55, 65, 81],
      fontStyle: "bold",
    },
    styles: { font: "helvetica", fontSize: 10, textColor: [17, 24, 39] },
    alternateRowStyles: { fillColor: [250, 250, 250] },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 15;

  // Attendance Summary
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Attendance & Payroll Summary", 14, finalY);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Present: ${reportData.present}`, 14, finalY + 8);
  doc.text(`Total Absent: ${reportData.absent}`, 14, finalY + 14);
  doc.text(`Half Days: ${reportData.halfDay}`, 14, finalY + 20);

  doc.text(`Working Days: ${reportData.workingDays}`, 80, finalY + 8);
  doc.text(`Holidays: ${reportData.holidays}`, 80, finalY + 14);

  // Payroll Calculation
  const totalEarnings =
    reportData.present * dailySalary + reportData.halfDay * (dailySalary / 2);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(21, 128, 61); // Dark Green for Earnings
  doc.text(
    `Total Earnings: Rs. ${totalEarnings.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    80,
    finalY + 24,
  );

  const safeName = employee.name_en.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  doc.save("payroll-report-${safeName}-${rangeDates[0]}.pdf");
}
