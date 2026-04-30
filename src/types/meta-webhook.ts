export type MetaWebhookPayload = {
  object?: string;
  entry?: MetaWebhookEntry[];
};

export type MetaWebhookEntry = {
  changes?: MetaWebhookChange[];
};

export type MetaWebhookChange = {
  field?: string;
  value?: {
    contacts?: Array<{
      profile?: {
        name?: string;
      };
      wa_id?: string;
    }>;
    messages?: Array<{
      id?: string;
      from?: string;
      type?: string;
      text?: {
        body?: string;
      };
      timestamp?: string;
    }>;
  };
};

export type IncomingWhatsappMessage = {
  customerName: string | null;
  from: string;
  messageId: string | null;
  text: string;
  type: string;
};
