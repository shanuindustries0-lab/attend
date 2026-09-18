"use client";

import { useState, useEffect } from "react";
import { AttendanceStatus } from "@/app/actions/attendance";
import { markAsPaid, checkPaymentStatus } from "@/app/actions/payments";

interface Props {
  weekDates: string[];
  employees: any[];
  initialAttendance: Record<string, AttendanceStatus>;
  holidays: Record<string, { title: string }>;
  isLocked?: boolean;
}

export default function AttendanceGrid({
  weekDates,
  employees,
  initialAttendance,
  holidays,
}: Props) {
  const [paidMap, setPaidMap] = useState<Record<string, boolean>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchPayments = async () => {
      if (employees.length === 0 || weekDates.length === 0) return;
      const empIds = employees.map((e) => e.id);
      const map = await checkPaymentStatus(
        empIds,
        weekDates[0],
        weekDates[weekDates.length - 1],
      );
      setPaidMap(map);
    };
    fetchPayments();
  }, [employees, weekDates]);

  const handleMarkPaid = async (empId: string, amount: number) => {
    setLoadingMap((prev) => ({ ...prev, [empId]: true }));
    const res = await markAsPaid(
      empId,
      weekDates[0],
      weekDates[weekDates.length - 1],
      amount,
    );
    if (res.success) setPaidMap((prev) => ({ ...prev, [empId]: true }));
    setLoadingMap((prev) => ({ ...prev, [empId]: false }));
  };

  const getStatusDisplay = (status?: AttendanceStatus) => {
    switch (status) {
      case "present":
        return (
          <span className="bg-green-100 text-green-800 font-bold px-3 py-1 rounded">
            P
          </span>
        );
      case "half_day":
        return (
          <span className="bg-yellow-100 text-yellow-800 font-bold px-3 py-1 rounded">
            HD
          </span>
        );
      case "absent":
        return (
          <span className="bg-red-100 text-red-800 font-bold px-3 py-1 rounded">
            A
          </span>
        );
      default:
        return (
          <span className="text-gray-300 font-medium tracking-wider text-sm">
            NM
          </span>
        );
    }
  };

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b border-r sticky left-0 bg-gray-50 z-10">
              Employee
            </th>
            {weekDates.map((date) => (
              <th
                key={date}
                className={`px-4 py-4 text-center text-sm font-semibold border-b ${holidays[date] ? "bg-purple-50 text-purple-700" : "text-gray-700"}`}
              >
                <div>
                  <span>
                    {new Date(date).toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                {holidays[date] && (
                  <div className="text-xs uppercase mt-1 tracking-wider font-bold">
                    Holiday
                  </div>
                )}
              </th>
            ))}
            <th className="px-6 py-4 text-center text-sm font-bold text-green-800 border-b border-l bg-green-50 shadow-inner">
              Weekly Pay
            </th>
            <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 border-b bg-gray-50">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {employees.map((emp) => {
            let presentCount = 0;
            let halfDayCount = 0;
            weekDates.forEach((date) => {
              if (!holidays[date]) {
                const status = initialAttendance[`${emp.id}_${date}`];
                if (status === "present") presentCount++;
                if (status === "half_day") halfDayCount++;
              }
            });
            const dailySalary = Number(emp.daily_salary) || 0;
            const weeklyPay =
              presentCount * dailySalary + halfDayCount * (dailySalary / 2);

            return (
              <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 border-r sticky left-0 bg-white z-10">
                  <div className="font-medium text-gray-900">{emp.name_en}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {emp.name_hi} • ₹{dailySalary}/day
                  </div>
                </td>
                {weekDates.map((date) => (
                  <td
                    key={date}
                    className={`px-4 py-4 text-center border-gray-200 ${holidays[date] ? "bg-purple-50/30" : ""}`}
                  >
                    {holidays[date] ? (
                      <span className="text-xs font-bold text-purple-400 uppercase">
                        Holiday
                      </span>
                    ) : (
                      getStatusDisplay(initialAttendance[`${emp.id}_${date}`])
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 text-center font-bold text-green-700 bg-green-50/30 border-l border-gray-200">
                  ₹
                  {weeklyPay.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="px-6 py-4 text-center border-gray-200">
                  {paidMap[emp.id] ? (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      PAID
                    </span>
                  ) : (
                    <button
                      onClick={() => handleMarkPaid(emp.id, weeklyPay)}
                      disabled={loadingMap[emp.id] || weeklyPay === 0}
                      className="text-xs font-bold bg-gray-100 hover:bg-emerald-500 hover:text-white text-gray-600 px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                    >
                      {loadingMap[emp.id] ? "..." : "Mark Paid"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
