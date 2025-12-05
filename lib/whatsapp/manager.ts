import { EventEmitter } from "events";
import qrcode from "qrcode";

import { prisma } from "@/lib/prisma";
import {
  WhatsAppMessageStatus,
  WhatsAppMessageType,
} from "@prisma/client";

type WWebJSModule = typeof import("whatsapp-web.js");
type Message = import("whatsapp-web.js").Message;
type Client = import("whatsapp-web.js").Client;
type LocalAuth = import("whatsapp-web.js").LocalAuth;
type InternalMessage = Message & { _data?: { notifyName?: string } };

type NodeRequire = (name: string) => unknown;

let cachedModule: WWebJSModule | null = null;

async function loadWhatsAppModule(): Promise<WWebJSModule> {
  if (!cachedModule) {
    const nodeRequire =
      (globalThis as unknown as { require?: NodeRequire }).require ??
      (eval("require") as NodeRequire);
    const mod = nodeRequire("whatsapp-web.js") as WWebJSModule | {
      default: WWebJSModule;
    };
    cachedModule =
      (mod as { default?: WWebJSModule }).default ?? (mod as WWebJSModule);
  }
  return cachedModule;
}

type WhatsAppRuntimeStatus =
  | "idle"
  | "initializing"
  | "qr"
  | "authenticated"
  | "ready"
  | "disconnected"
  | "error";

type StatusPayload = {
  status: WhatsAppRuntimeStatus;
  qr?: string | null;
  error?: string | null;
};

type SendPayload = {
  phoneNumber: string;
  content: string;
};

class WhatsAppManager extends EventEmitter {
  private client: Client | null = null;
  private status: WhatsAppRuntimeStatus = "idle";
  private qr: string | null = null;
  private lastError: string | null = null;
  private initialized = false;

  constructor() {
    super();
  }

  public async init() {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    this.status = "initializing";

    const { Client: WClient, LocalAuth: WLocalAuth } =
      await loadWhatsAppModule();

    this.client = new WClient({
      authStrategy: new WLocalAuth({
        clientId: "rvpj-admin",
        dataPath: ".wwebjs_auth",
      }),
      puppeteer: {
        headless: false,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
        ],
      },
    });

    this.registerEvents();
    this.client.initialize();
  }

  private registerEvents() {
    if (!this.client) return;

    this.client.on("qr", async (qr) => {
      this.status = "qr";
      this.qr = await qrcode.toDataURL(qr);
      this.emitStatus();
    });

    this.client.on("authenticated", () => {
      this.status = "authenticated";
      this.qr = null;
      this.emitStatus();
    });

    this.client.on("ready", () => {
      this.status = "ready";
      this.qr = null;
      this.emitStatus();
    });

    this.client.on("disconnected", async () => {
      this.status = "disconnected";
      this.qr = null;
      this.emitStatus();
      try {
        await this.client?.initialize();
      } catch (error) {
        this.handleError(error);
      }
    });

    this.client.on("auth_failure", (msg) => {
      this.status = "error";
      this.lastError = msg;
      this.emitStatus();
    });

    this.client.on("message", (message) => {
      void this.handleIncomingMessage(message);
    });
  }

  private emitStatus() {
    this.emit("status", this.getStatus());
  }

  public getStatus(): StatusPayload {
    return {
      status: this.status,
      qr: this.qr,
      error: this.lastError,
    };
  }

  private handleError(error: unknown) {
    console.error("[WhatsAppManager] error", error);
    this.status = "error";
    this.lastError =
      error instanceof Error ? error.message : "Unknown WhatsApp error";
    this.emitStatus();
  }

  private sanitizePhone(input: string) {
    return input.replace(/\D/g, "");
  }

  private formatJid(phoneNumber: string) {
    const digits = this.sanitizePhone(phoneNumber);
    return `${digits}@c.us`;
  }

  private async ensureContact(phoneNumber: string, name?: string | null) {
    const formatted = this.sanitizePhone(phoneNumber);

    const existing = await prisma.whatsAppContact.findUnique({
      where: { phoneNumber: formatted },
    });

    if (existing) {
      if (name && !existing.name) {
        return prisma.whatsAppContact.update({
          where: { id: existing.id },
          data: { name },
        });
      }
      return existing;
    }

    return prisma.whatsAppContact.create({
      data: {
        phoneNumber: formatted,
        name,
        tags: [],
      },
    });
  }

  private async handleIncomingMessage(message: Message) {
    try {
      if (message.from.endsWith("@g.us")) {
        return;
      }

      const phoneNumber = this.sanitizePhone(message.from);
      const internalMessage = message as InternalMessage;
      const contact = await this.ensureContact(
        phoneNumber,
        internalMessage._data?.notifyName,
      );

      await prisma.whatsAppContact.update({
        where: { id: contact.id },
        data: { lastMessageAt: new Date() },
      });

      await prisma.whatsAppMessage.create({
        data: {
          contactId: contact.id,
          content: message.body || "",
          messageType: WhatsAppMessageType.TEXT,
          status: WhatsAppMessageStatus.DELIVERED,
          isIncoming: true,
          externalId: message.id._serialized,
          sentAt: new Date((message.timestamp || Date.now()) * 1000),
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  public async sendMessage({ phoneNumber, content }: SendPayload) {
    if (!this.client || this.status !== "ready") {
      throw new Error("WhatsApp session is not ready");
    }

    const jid = this.formatJid(phoneNumber);

    const result = await this.client.sendMessage(jid, content);
    const contact = await this.ensureContact(phoneNumber);

    await prisma.whatsAppContact.update({
      where: { id: contact.id },
      data: { lastMessageAt: new Date() },
    });

    await prisma.whatsAppMessage.create({
      data: {
        contactId: contact.id,
        content,
        messageType: WhatsAppMessageType.TEXT,
        status: WhatsAppMessageStatus.SENT,
        isIncoming: false,
        externalId: result.id._serialized,
        sentAt: new Date(),
      },
    });

    return { success: true };
  }

  public async logout() {
    if (!this.client) return;
    await this.client.logout();
    this.status = "disconnected";
    this.qr = null;
    this.emitStatus();
  }
}

declare global {
  // eslint-disable-next-line no-var
  var _whatsappManager: WhatsAppManager | undefined;
}

export function getWhatsAppManager() {
  if (!global._whatsappManager) {
    global._whatsappManager = new WhatsAppManager();
  }
  return global._whatsappManager;
}

