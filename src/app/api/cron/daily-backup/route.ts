import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";

export async function GET(request: Request) {
  try {
    // 1. Fetch live data from Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const [
      { data: employees },
      { data: attendance },
      { data: payments },
      { data: advances },
    ] = await Promise.all([
      supabase.from("employees").select("*"),
      supabase.from("attendance").select("*"),
      supabase.from("payments").select("*"),
      supabase.from("salary_advances").select("*"),
    ]);

    // 2. Create a new Excel Workbook
    const workbook = XLSX.utils.book_new();

    // Convert each table array into an Excel sheet and add it as a tab
    if (employees)
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(employees),
        "Employees",
      );
    if (attendance)
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(attendance),
        "Attendance",
      );
    if (payments)
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(payments),
        "Payments",
      );
    if (advances)
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(advances),
        "Advances",
      );

    // Generate the Excel file as a binary Buffer
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // 3. Generate a fresh Dropbox Access Token
    if (
      !process.env.DROPBOX_APP_KEY ||
      !process.env.DROPBOX_APP_SECRET ||
      !process.env.DROPBOX_REFRESH_TOKEN
    ) {
      throw new Error(
        "CRITICAL: Missing Dropbox credentials in .env.local file.",
      );
    }

    const tokenResponse = await fetch(
      "https://api.dropboxapi.com/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: process.env.DROPBOX_REFRESH_TOKEN,
          client_id: process.env.DROPBOX_APP_KEY,
          client_secret: process.env.DROPBOX_APP_SECRET,
        }),
      },
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Failed to refresh Dropbox token: ${errorText}`);
    }

    const { access_token: dropboxToken } = await tokenResponse.json();

    // 4. Upload the Excel File to Dropbox
    const dateStr = new Date().toISOString().split("T")[0];
    const fileName = `/shanu_db_backup_${dateStr}.xlsx`; // Note the .xlsx extension

    const uploadResponse = await fetch(
      "https://content.dropboxapi.com/2/files/upload",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${dropboxToken}`,
          "Dropbox-API-Arg": JSON.stringify({
            path: fileName,
            mode: "overwrite",
            autorename: true,
            mute: true,
          }),
          "Content-Type": "application/octet-stream", // Proper header for binary files like Excel
        },
        body: excelBuffer, // Sending the binary buffer instead of a string
      },
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Dropbox Upload Failed: ${errorText}`);
    }

    return NextResponse.json({
      success: true,
      message: `Excel backup securely saved to Dropbox as ${fileName}`,
    });
  } catch (error: any) {
    const err = error as Error;
    console.error("Backup Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
