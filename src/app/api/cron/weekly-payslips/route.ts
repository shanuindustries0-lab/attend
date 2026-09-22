import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function GET(request: Request) {
  try {
    // 1. Fetch live data from Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: employees } = await supabase.from("employees").select("*");

    if (!employees || employees.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No employees found.",
      });
    }

    // 2. Generate a fresh Dropbox Access Token
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
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: process.env.DROPBOX_REFRESH_TOKEN,
          client_id: process.env.DROPBOX_APP_KEY,
          client_secret: process.env.DROPBOX_APP_SECRET,
        }),
      },
    );

    if (!tokenResponse.ok) {
      throw new Error(
        `Failed to refresh Dropbox token: ${await tokenResponse.text()}`,
      );
    }
    const { access_token: dropboxToken } = await tokenResponse.json();

    // 3. Generate and Upload a PDF for each employee
    const dateStr = new Date().toISOString().split("T")[0];
    const uploadedFiles = [];

    for (const emp of employees) {
      // Create a new PDF document in memory
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 400]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Draw the Payslip Content
      page.drawText("Shanu Industries - Weekly Payslip", {
        x: 50,
        y: 350,
        size: 20,
        font: boldFont,
        color: rgb(0.1, 0.3, 0.7),
      });
      page.drawText(`Date Generated: ${dateStr}`, {
        x: 50,
        y: 320,
        size: 12,
        font,
      });

      page.drawText(`Employee Name: ${emp.name_en}`, {
        x: 50,
        y: 280,
        size: 14,
        font: boldFont,
      });
      page.drawText(`Employee Code: ${emp.employee_code || "N/A"}`, {
        x: 50,
        y: 260,
        size: 12,
        font,
      });
      page.drawText(`Base Daily Salary: Rs. ${emp.daily_salary || 0}`, {
        x: 50,
        y: 240,
        size: 12,
        font,
      });

      // Note: You can expand this section by fetching the 'attendance' table and
      // injecting their exact days worked, advances deducted, and final payout math here.
      page.drawText("--------------------------------------------------", {
        x: 50,
        y: 220,
        size: 12,
        font,
      });
      page.drawText("This is a system-generated document.", {
        x: 50,
        y: 190,
        size: 10,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });

      // Save PDF to a binary buffer
      const pdfBytes = await pdfDoc.save();
      const pdfBuffer = Buffer.from(pdfBytes);

      // Upload to Dropbox inside a dated folder
      const safeName = emp.name_en.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const filePath = `/Payslips/\({dateStr}/\){safeName}_payslip.pdf`;

      const uploadResponse = await fetch(
        "https://content.dropboxapi.com/2/files/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${dropboxToken}`,
            "Dropbox-API-Arg": JSON.stringify({
              path: filePath,
              mode: "overwrite",
              autorename: true,
              mute: true,
            }),
            "Content-Type": "application/octet-stream",
          },
          body: pdfBuffer,
        },
      );

      if (!uploadResponse.ok) {
        console.error(
          `Failed to upload PDF for ${emp.name_en}:`,
          await uploadResponse.text(),
        );
      } else {
        uploadedFiles.push(emp.name_en);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully generated and uploaded ${uploadedFiles.length} PDF payslips to Dropbox.`,
      files: uploadedFiles,
    });
  } catch (error: any) {
    const err = error as Error;
    console.error("Weekly Payslip Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
