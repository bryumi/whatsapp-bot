import {
  IncomingWhatsappMessage,
  MetaWebhookPayload
} from "../types/meta-webhook";

export function parseIncomingMessage(
  payload: MetaWebhookPayload
): IncomingWhatsappMessage | null {
  const change = payload.entry?.[0]?.changes?.[0];
  const contact = change?.value?.contacts?.[0];
  const message = change?.value?.messages?.[0];

  if (!message?.from) {
    return null;
  }

  return {
    customerName: contact?.profile?.name ?? null,
    from: message.from,
    messageId: message.id ?? null,
    text: message.text?.body?.trim() ?? "",
    type: message.type ?? "unknown"
  };
}
