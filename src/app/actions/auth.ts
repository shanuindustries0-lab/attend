"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { success: false, error: "Username and password are required." };
  }

  // Use the Service Role client to securely query the database
  const supabase = await createClient();

  // Call the secure Postgres function we created in Supabase
  const { data: isValid, error } = await supabase.rpc("verify_admin_login", {
    input_username: username,
    input_password: password,
  });

  if (error) {
    return {
      success: false,
      error: "Database connection error. Please try again.",
    };
  }

  // If the database returns true, the password hash matched
  if (isValid) {
    const cookieStore = await cookies();

    // Set a secure HTTP-only session cookie
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1-week session
      path: "/",
    });

    return { success: true };
  }

  return { success: false, error: "Invalid username or password." };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/login");
}
