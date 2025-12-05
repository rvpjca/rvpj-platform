import { NextResponse } from "next/server";

import { getWhatsAppManager } from "@/lib/whatsapp/manager";

export async function POST(req: Request) {
  try {
    const { phoneNumber, content } = await req.json();

    if (!phoneNumber || !content) {
      return NextResponse.json(
        { error: "phoneNumber and content are required" },
        { status: 400 },
      );
    }

    const manager = getWhatsAppManager();
    await manager.init();
    await manager.sendMessage({ phoneNumber, content });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[WhatsAppSend]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to send WhatsApp message",
      },
      { status: 500 },
    );
  }
}



