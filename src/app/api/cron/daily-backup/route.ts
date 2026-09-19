import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(request: Request) {
  // Security lock temporarily commented out so you can test it in your browser
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  try {
    // 1. Authenticate with the Google Service Account
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,

        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/^"|"$/g, '').replace(/\\n/g, '\n')
      },
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });

    const drive = google.drive({ version: "v3", auth });

    // 2. Generate a test CSV string (We will replace this with real Supabase data next)
    const fileContent = "Date,Employee,Status\n2026-09-20,Test Worker,Present";

    // 3. Upload directly to the specific Drive folder
    const response = await drive.files.create({
      requestBody: {
        name: `Shanu_Backup_${new Date().toISOString().split("T")[0]}.csv`,
        mimeType: "text/csv",
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || ""],
      },
      media: {
        mimeType: "text/csv",
        body: fileContent,
      },
    });

    return NextResponse.json({
      success: true,
      message: "File successfully uploaded to Drive",
      fileId: response.data.id,
    });
  } catch (error: any) {
    console.error("Drive API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
