import { prisma } from "../lib/prisma";

export async function findOrCreateDraftOrder(customerId: string, conversationId: string) {
  const existingOrder = await prisma.order.findFirst({
    where: {
      customerId,
      conversationId,
      status: "STARTED"
    },
    orderBy: {
      updatedAt: "desc"
    }
  });

  if (existingOrder) {
    return existingOrder;
  }

  return prisma.order.create({
    data: {
      customerId,
      conversationId
    }
  });
}

type UpdateDraftOrderInput = {
  cakeType?: string | null;
  cakeSize?: string | null;
  filling?: string | null;
  eventDate?: Date | null;
  deliveryAddress?: string | null;
  notes?: string | null;
  status?: "STARTED" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
};

export async function updateDraftOrder(orderId: string, data: UpdateDraftOrderInput) {
  return prisma.order.update({
    where: {
      id: orderId
    },
    data
  });
}
