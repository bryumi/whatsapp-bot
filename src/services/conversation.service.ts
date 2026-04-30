import { prisma } from "../lib/prisma";

export async function findOrCreateOpenConversation(customerId: string) {
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      customerId,
      status: "OPEN"
    },
    orderBy: {
      updatedAt: "desc"
    }
  });

  if (existingConversation) {
    return existingConversation;
  }

  return prisma.conversation.create({
    data: {
      customerId
    }
  });
}

type UpdateConversationStateInput = {
  status?: "OPEN" | "CLOSED";
  currentFlow?: string;
  currentStep?: string;
  botPaused?: boolean;
};

export async function updateConversationState(
  conversationId: string,
  data: UpdateConversationStateInput
) {
  return prisma.conversation.update({
    where: {
      id: conversationId
    },
    data
  });
}
