import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.info("Contact form submission:", body);
    // TODO: save to database or trigger notification email
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}



