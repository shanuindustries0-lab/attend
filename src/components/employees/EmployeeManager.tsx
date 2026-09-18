"use client";

import { useState, useEffect, useMemo } from "react";
import { addEmployee, updateEmployeeSalary } from "@/app/actions/employees";

type Category = { id: string; name_en: string };
type Employee = {
  id: string;
  name_en: string;
  name_hi: string;
  category_id: string;
  employee_code?: string;
  is_active: boolean;
  daily_salary: number;
};

interface Props {
  initialEmployees?: Employee[];
  categories?: Category[];
}

export default function EmployeeManager({
  initialEmployees = [],
  categories = [],
}: Props) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  const [newJoiningDate, setNewJoiningDate] = useState("");
  useEffect(() => {
    setNewJoiningDate(new Date().toISOString().split("T")[0]);
  }, []);

  const [nameEn, setNameEn] = useState("");
  const [nameHi, setNameHi] = useState("");
  const [editingSalaryId, setEditingSalaryId] = useState<string | null>(null);
  const [editSalaryValue, setEditSalaryValue] = useState<number | string>("");

  const handleEnglishNameChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const text = e.target.value;
    setNameEn(text);
    if (!text.trim()) return setNameHi("");
    try {
      const res = await fetch(
        `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=hi-t-i0-und&num=4&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`,
      );
      const data = await res.json();
      if (data[0] === "SUCCESS") setNameHi(data[1][0][1][0]);
    } catch (err) {}
  };

  const handleAddEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await addEmployee(new FormData(e.currentTarget));
    if (result.success) window.location.reload();
    else setIsLoading(false);
  };

  const handleSaveSalary = async (employeeId: string) => {
    const newSalary = Number(editSalaryValue);
    if (isNaN(newSalary) || newSalary < 0) return alert("Invalid amount.");
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId ? { ...emp, daily_salary: newSalary } : emp,
      ),
    );
    setEditingSalaryId(null);
    await updateEmployeeSalary(employeeId, newSalary);
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name_en.toLowerCase().includes(search.toLowerCase()) ||
        (emp.employee_code &&
          emp.employee_code.toLowerCase().includes(search.toLowerCase()));
      return (
        matchesSearch &&
        (categoryFilter === "all" || emp.category_id === categoryFilter)
      );
    });
  }, [employees, search, categoryFilter]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="w-full lg:w-1/3">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-6">
          <h2 className="text-lg font-semibold mb-4">Add New Employee</h2>
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <input
              name="name_en"
              type="text"
              required
              value={nameEn}
              onChange={handleEnglishNameChange}
              placeholder="Name (English)"
              className="w-full p-2 border rounded"
            />
            <input
              name="name_hi"
              type="text"
              required
              value={nameHi}
              onChange={(e) => setNameHi(e.target.value)}
              placeholder="Name (Hindi)"
              className="w-full p-2 border rounded"
            />
            <select
              name="category_id"
              required
              className="w-full p-2 border rounded bg-white"
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name_en}
                </option>
              ))}
            </select>
            <div className="flex gap-4">
              <input
                name="employee_code"
                type="text"
                placeholder="Emp Code"
                className="w-1/2 p-2 border rounded"
              />
              <input
                name="daily_salary"
                type="number"
                min="0"
                required
                defaultValue="0"
                placeholder="Daily Salary (₹)"
                className="w-1/2 p-2 border border-green-300 rounded bg-green-50"
              />
            </div>
            <input
              name="joining_date"
              type="date"
              required
              value={newJoiningDate}
              onChange={(e) => setNewJoiningDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              {isLoading ? "Adding..." : "+ Add Employee"}
            </button>
          </form>
        </div>
      </div>
      <div className="w-full lg:w-2/3 space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex gap-4">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-48 p-2 border rounded"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name_en}
              </option>
            ))}
          </select>
        </div>
        <div className="bg-white rounded-lg shadow-sm border divide-y">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
            >
              <div>
                <span className="font-medium text-gray-900">{emp.name_en}</span>{" "}
                <span className="text-gray-500 text-sm">({emp.name_hi})</span>
                <div className="text-sm text-gray-500 mt-1">
                  {categories.find((c) => c.id === emp.category_id)?.name_en}{" "}
                  {emp.employee_code && `• ${emp.employee_code}`}
                </div>
              </div>
              <div className="flex items-center gap-4 bg-gray-50 p-2 rounded border w-full sm:w-auto">
                {editingSalaryId === emp.id ? (
                  <div className="flex items-center gap-2">
                    <span className="font-bold">₹</span>
                    <input
                      type="number"
                      value={editSalaryValue}
                      onChange={(e) => setEditSalaryValue(e.target.value)}
                      className="w-20 p-1 border border-blue-300 rounded"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveSalary(emp.id)}
                      className="text-xs bg-green-600 text-white px-2 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingSalaryId(null)}
                      className="text-xs text-gray-500 px-2 py-1"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      Salary:{" "}
                      <span className="font-bold text-green-700">
                        ₹{emp.daily_salary || 0}
                      </span>
                      /day
                    </div>
                    <button
                      onClick={() => {
                        setEditingSalaryId(emp.id);
                        setEditSalaryValue(emp.daily_salary || 0);
                      }}
                      className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
