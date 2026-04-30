import { prisma } from "../lib/prisma";

export async function findOrCreateCustomer(phoneNumber: string, name?: string | null) {
  const existingCustomer = await prisma.customer.findUnique({
    where: { phoneNumber }
  });

  if (existingCustomer) {
    if (name && existingCustomer.name !== name) {
      return prisma.customer.update({
        where: { id: existingCustomer.id },
        data: { name }
      });
    }

    return existingCustomer;
  }

  return prisma.customer.create({
    data: {
      phoneNumber,
      name: name ?? undefined
    }
  });
}
