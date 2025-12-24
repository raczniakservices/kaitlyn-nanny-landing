import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.redirect(new URL("/admin", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
  
  // Clear the auth cookie
  response.cookies.delete("kaitlyn_admin_auth");
  
  return response;
}

