"use client";

import { useState, useEffect } from "react";
import { WeeklyReportData } from "@/services/attendanceCalculator";
import { generateWeeklyReportPDF } from "@/lib/pdfGenerator";
import { formatShortDate } from "@/lib/dateUtils";
import { markAsPaid, checkPaymentStatus } from "@/app/actions/payments";

interface Props {
  employee: any;
  rangeDates: string[];
  reportData: WeeklyReportData;
}

export default function EmployeeReportCard({
  employee,
  rangeDates,
  reportData,
}: Props) {
  const [isPaid, setIsPaid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      // 1. Safe extraction: Ensure employee exists before querying database
      if (!employee?.id) return;

      const map = await checkPaymentStatus(
        [employee.id],
        rangeDates[0],
        rangeDates[rangeDates.length - 1],
      );
      setIsPaid(!!map[employee.id]);
    };

    if (rangeDates?.length > 0) fetchStatus();

    // 2. Optional Chaining: employee?.id prevents the "undefined" crash
  }, [employee?.id, rangeDates]);

  // 3. Fallback: Do not render UI if data is missing
  if (!employee || !rangeDates || rangeDates.length === 0) return null;

  const dateRangeText = `${formatShortDate(rangeDates[0])} - ${formatShortDate(rangeDates[rangeDates.length - 1])}`;
  const dailySalary = Number(employee.daily_salary) || 0;
  const totalEarnings =
    reportData.present * dailySalary + reportData.halfDay * (dailySalary / 2);

  const handlePayment = async () => {
    setIsLoading(true);
    const res = await markAsPaid(
      employee.id,
      rangeDates[0],
      rangeDates[rangeDates.length - 1],
      totalEarnings,
    );
    if (res.success) setIsPaid(true);
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="p-6 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold">
            {employee.name_en}{" "}
            <span className="text-gray-500 font-normal">
              ({employee.name_hi})
            </span>
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {employee.category_name}{" "}
            {employee.employee_code && `• Code: ${employee.employee_code}`}
          </p>
          <p className="text-sm font-medium text-gray-700 mt-1">
            Period: {dateRangeText}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isPaid ? (
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-md font-bold flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Payment Settled
            </span>
          ) : (
            <button
              onClick={handlePayment}
              disabled={isLoading || totalEarnings === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Mark as Paid"}
            </button>
          )}

          <button
            onClick={() =>
              generateWeeklyReportPDF({
                employee,
                rangeDates,
                reportData,
                isPaid,
              })
            }
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
          >
            Generate PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 border-b">
        <div className="bg-white p-4 rounded border text-center">
          <div className="text-2xl font-bold text-green-600">
            {reportData.present}
          </div>
          <div className="text-xs uppercase font-bold mt-1">Present</div>
        </div>
        <div className="bg-white p-4 rounded border text-center">
          <div className="text-2xl font-bold text-red-600">
            {reportData.absent}
          </div>
          <div className="text-xs uppercase font-bold mt-1">Absent</div>
        </div>
        <div className="bg-white p-4 rounded border text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {reportData.halfDay}
          </div>
          <div className="text-xs uppercase font-bold mt-1">Half Days</div>
        </div>
        <div className="bg-green-50 p-4 rounded border border-green-200 text-center">
          <div className="text-2xl font-bold text-green-700">
            ₹{totalEarnings.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-green-700 uppercase font-bold mt-1">
            Total Pay
          </div>
        </div>
      </div>
    </div>
  );
}
