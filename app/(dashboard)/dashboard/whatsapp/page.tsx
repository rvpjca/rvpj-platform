import { redirect } from "next/navigation";

export default function WhatsAppChatRedirect() {
  redirect("/dashboard/whatsapp/bulk");
  return null;
}



