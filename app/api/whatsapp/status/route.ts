import { NextResponse } from "next/server";

import { getWhatsAppManager } from "@/lib/whatsapp/manager";

export async function GET() {
  const manager = getWhatsAppManager();
  await manager.init();
  return NextResponse.json(manager.getStatus());
}



