import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    // Placeholder: In future, save to DB/Supabase and send notifications.
    console.info("Career application received:", {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      role: formData.get("role"),
      experience: formData.get("experience"),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Career application error", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}



