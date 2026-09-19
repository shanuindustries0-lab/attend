import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(request: Request) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, 
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/^"|"$/g, '').replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const fileContent = "Date,Employee,Status\n2026-09-20,Test Worker,Present";

    const response = await drive.files.create({
      requestBody: {
        name: `Shanu_Backup_${new Date().toISOString().split('T')[0]}.csv`,
        mimeType: 'text/csv',
    
        parents: ['1pCViHzbDQLE2oxu-ZFr2v0Yc15fSMx59'], 
      },
      media: {
        mimeType: 'text/csv',
        body: fileContent,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "File successfully uploaded to Drive",
      fileId: response.data.id 
    });

  } catch (error: any) {
    console.error("Drive API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
