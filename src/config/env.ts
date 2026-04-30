import "dotenv/config";

function getEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const env = {
  appEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: getEnv("DATABASE_URL"),
  metaVerifyToken: getEnv("META_VERIFY_TOKEN", "dev_verify_token"),
  metaWhatsappToken: process.env.META_WHATSAPP_TOKEN ?? "",
  metaPhoneNumberId: process.env.META_PHONE_NUMBER_ID ?? "",
  metaApiVersion: process.env.META_API_VERSION ?? "v22.0"
};
