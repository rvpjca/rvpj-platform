import { NextResponse } from "next/server";

import { getWhatsAppManager } from "@/lib/whatsapp/manager";

export async function POST() {
  try {
    const manager = getWhatsAppManager();
    await manager.init();
    await manager.logout();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[WhatsAppLogout]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to logout WhatsApp session",
      },
      { status: 500 },
    );
  }
}



