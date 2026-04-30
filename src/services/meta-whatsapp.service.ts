import { env } from "../config/env";

export async function sendTextMessage(to: string, body: string) {
  if (!env.metaWhatsappToken || !env.metaPhoneNumberId) {
    console.warn("Meta API credentials are missing. Outbound message was not sent.");
    return null;
  }

  const response = await fetch(
    `https://graph.facebook.com/${env.metaApiVersion}/${env.metaPhoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.metaWhatsappToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        text: {
          body
        }
      })
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Meta API error: ${response.status} ${errorBody}`);
  }

  return response.json();
}
