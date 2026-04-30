import { prisma } from "../lib/prisma";

type CreateMessageInput = {
  conversationId: string;
  customerId: string;
  direction: "INBOUND" | "OUTBOUND";
  type: string;
  content: string;
  metaMessageId?: string | null;
};

export async function createMessage(input: CreateMessageInput) {
  return prisma.message.create({
    data: {
      conversationId: input.conversationId,
      customerId: input.customerId,
      direction: input.direction,
      type: input.type,
      content: input.content,
      metaMessageId: input.metaMessageId ?? undefined
    }
  });
}

export async function findMessageByMetaMessageId(metaMessageId: string) {
  return prisma.message.findUnique({
    where: {
      metaMessageId
    }
  });
}
