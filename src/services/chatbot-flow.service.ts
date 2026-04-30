type DraftOrder = {
  cakeType: string | null;
  cakeSize: string | null;
  filling: string | null;
  eventDate: Date | null;
  deliveryAddress: string | null;
  notes: string | null;
  status: 'STARTED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
};

type ConversationState = {
  currentFlow?: string;
  currentStep?: string;
  botPaused?: boolean;
};

type ConversationLike = {
  status?: string;
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  customerId?: string;
  currentFlow?: string | null;
  currentStep?: string | null;
  botPaused?: boolean | null;
};

type FlowContext = {
  customerName?: string | null;
  text: string;
  conversation: ConversationLike;
  order: DraftOrder;
};

type FlowResult = {
  reply: string | null;
  orderUpdate?: Partial<DraftOrder>;
  conversationUpdate?: Partial<ConversationState>;
};

const MENU_MESSAGE = [
  'Ola! Seja bem-vindo(a) a loja.',
  'Escolha uma opcao:',
  '1 - Encomenda de bolo',
  '2 - Compra de produtos na loja',
  '3 - Falar com atendente'
].join('\n');

function normalizeText(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function isGreeting(text: string) {
  return ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite'].some((greeting) =>
    text.includes(greeting)
  );
}

function isMenuRequest(text: string) {
  return text === 'menu' || text === 'voltar' || text === 'inicio';
}

function parseEventDate(text: string): Date | null {
  const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (!match) {
    return null;
  }

  const [, dayValue, monthValue, yearValue] = match;
  const day = Number(dayValue);
  const month = Number(monthValue);
  const year = Number(yearValue);
  const parsedDate = new Date(year, month - 1, day);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getDate() !== day ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getFullYear() !== year
  ) {
    return null;
  }

  return parsedDate;
}

function buildOrderSummary(order: DraftOrder) {
  const eventDate = order.eventDate
    ? order.eventDate.toLocaleDateString('pt-BR')
    : 'nao informada';

  return [
    `Massa/sabor: ${order.cakeType ?? 'nao informado'}`,
    `Tamanho: ${order.cakeSize ?? 'nao informado'}`,
    `Recheio: ${order.filling ?? 'nao informado'}`,
    `Data: ${eventDate}`,
    `Entrega: ${order.deliveryAddress ?? 'nao informado'}`
  ].join('\n');
}

function buildGreetingMenu(customerName?: string | null) {
  const greetingName = customerName ? `, ${customerName}` : '';
  return `Ola${greetingName}!\n${MENU_MESSAGE.replace('Ola! Seja bem-vindo(a) a loja.\n', '')}`;
}

function handleMenuSelection(
  normalizedText: string,
  customerName?: string | null
): FlowResult {
  if (isGreeting(normalizedText) || isMenuRequest(normalizedText)) {
    return {
      reply: buildGreetingMenu(customerName)
    };
  }

  if (normalizedText === '1') {
    return {
      reply:
        'Perfeito. Vamos cuidar da sua encomenda de bolo. Qual e o sabor ou tipo do bolo?',
      conversationUpdate: {
        currentFlow: 'CAKE_ORDER',
        currentStep: 'CAKE_TYPE',
        botPaused: false
      }
    };
  }

  if (normalizedText === '2') {
    return {
      reply:
        'Certo. Me envie a lista dos produtos da loja que voce quer comprar e, se puder, ja informe as quantidades.',
      conversationUpdate: {
        currentFlow: 'STORE_PURCHASE',
        currentStep: 'STORE_ITEMS',
        botPaused: false
      }
    };
  }

  if (normalizedText === '3') {
    return {
      reply:
        'Perfeito. Me conte os detalhes da sua encomenda personalizada: produto, quantidade, data e qualquer observacao importante.',
      conversationUpdate: {
        currentFlow: 'CUSTOM_ORDER',
        currentStep: 'CUSTOM_DETAILS',
        botPaused: false
      }
    };
  }

  if (normalizedText === '4') {
    return {
      reply:
        'Certo. Vou te encaminhar para um atendente humano agora. Enquanto isso, pode enviar sua duvida que a equipe assume por aqui.',
      conversationUpdate: {
        currentFlow: 'HUMAN_SUPPORT',
        currentStep: 'WAITING_HUMAN',
        botPaused: true
      }
    };
  }

  return {
    reply: `Nao entendi sua opcao.\n${buildGreetingMenu(customerName)}`
  };
}

function handleCakeOrderFlow(
  normalizedText: string,
  trimmedText: string,
  order: DraftOrder
): FlowResult {
  if (isMenuRequest(normalizedText)) {
    return {
      reply: MENU_MESSAGE,
      conversationUpdate: {
        currentFlow: 'MENU',
        currentStep: 'AWAITING_SELECTION',
        botPaused: false
      }
    };
  }

  if (order.status === 'CONFIRMED') {
    return {
      reply:
        "Esse pedido ja foi confirmado. Se quiser iniciar outro atendimento, responda 'menu'."
    };
  }

  if (!order.cakeType) {
    return {
      reply:
        'Anotado. Qual e o tamanho que voce quer? De acordo com o cardápio',
      orderUpdate: {
        cakeType: trimmedText
      },
      conversationUpdate: {
        currentStep: 'CAKE_SIZE'
      }
    };
  }

  if (!order.cakeSize) {
    return {
      reply: 'Perfeito. Qual recheio voce gostaria?',
      orderUpdate: {
        cakeSize: trimmedText
      },
      conversationUpdate: {
        currentStep: 'CAKE_FILLING'
      }
    };
  }

  if (!order.filling) {
    return {
      reply: 'Agora me passe a data da entrega no formato DD/MM/AAAA.',
      orderUpdate: {
        filling: trimmedText
      },
      conversationUpdate: {
        currentStep: 'CAKE_EVENT_DATE'
      }
    };
  }

  if (!order.eventDate) {
    const parsedDate = parseEventDate(trimmedText);

    if (!parsedDate) {
      return {
        reply:
          'Me passe a data da entrega no formato DD/MM/AAAA, por exemplo 15/06/2026.'
      };
    }

    return {
      reply: 'Data anotada. Qual e o endereco de entrega ou retirada?',
      orderUpdate: {
        eventDate: parsedDate
      },
      conversationUpdate: {
        currentStep: 'CAKE_DELIVERY_ADDRESS'
      }
    };
  }

  if (!order.deliveryAddress) {
    return {
      reply:
        "Endereco salvo. Se quiser, me envie uma observacao final. Se nao tiver, responda apenas 'sem observacoes'.",
      orderUpdate: {
        deliveryAddress: trimmedText
      },
      conversationUpdate: {
        currentStep: 'CAKE_NOTES'
      }
    };
  }

  if (!order.notes) {
    const notes =
      normalizedText === 'sem observacoes' ? 'Sem observacoes.' : trimmedText;

    return {
      reply:
        'Pedido montado com sucesso. Aqui esta o resumo:\n' +
        `${buildOrderSummary({
          ...order,
          notes,
          deliveryAddress: order.deliveryAddress,
          eventDate: order.eventDate
        })}\n` +
        "Se estiver tudo certo, responda 'confirmar pedido'.",
      orderUpdate: {
        notes
      },
      conversationUpdate: {
        currentStep: 'CAKE_CONFIRMATION'
      }
    };
  }

  if (normalizedText === 'confirmar pedido') {
    return {
      reply:
        'Pedido confirmado! Se quiser, posso te mostrar o menu novamente para um novo atendimento.',
      orderUpdate: {
        status: 'CONFIRMED'
      },
      conversationUpdate: {
        currentFlow: 'MENU',
        currentStep: 'AWAITING_SELECTION',
        botPaused: false
      }
    };
  }

  return {
    reply:
      "Se estiver tudo certo com o resumo, responda 'confirmar pedido'. Para voltar ao menu, responda 'menu'."
  };
}

function handleStorePurchaseFlow(
  normalizedText: string,
  trimmedText: string
): FlowResult {
  if (isMenuRequest(normalizedText)) {
    return {
      reply: MENU_MESSAGE,
      conversationUpdate: {
        currentFlow: 'MENU',
        currentStep: 'AWAITING_SELECTION',
        botPaused: false
      }
    };
  }

  if (normalizedText === 'confirmar compra') {
    return {
      reply:
        "Compra registrada. Nossa equipe vai conferir os itens e seguir com o atendimento. Se quiser iniciar outro fluxo, responda 'menu'.",
      conversationUpdate: {
        currentFlow: 'MENU',
        currentStep: 'AWAITING_SELECTION',
        botPaused: false
      }
    };
  }

  return {
    reply:
      `Anotei seu pedido da loja: "${trimmedText}". ` +
      "Se estiver certo, responda 'confirmar compra'. Se quiser ajustar, envie a lista novamente. Para voltar, responda 'menu'.",
    conversationUpdate: {
      currentStep: 'STORE_CONFIRMATION'
    }
  };
}

function handleCustomOrderFlow(
  normalizedText: string,
  trimmedText: string
): FlowResult {
  if (isMenuRequest(normalizedText)) {
    return {
      reply: MENU_MESSAGE,
      conversationUpdate: {
        currentFlow: 'MENU',
        currentStep: 'AWAITING_SELECTION',
        botPaused: false
      }
    };
  }

  if (normalizedText === 'confirmar encomenda') {
    return {
      reply:
        "Encomenda personalizada registrada. Nossa equipe vai analisar os detalhes e continuar o atendimento. Para voltar ao menu, responda 'menu'.",
      conversationUpdate: {
        currentFlow: 'MENU',
        currentStep: 'AWAITING_SELECTION',
        botPaused: false
      }
    };
  }

  return {
    reply:
      `Anotei os detalhes da encomenda: "${trimmedText}". ` +
      "Se estiver tudo certo, responda 'confirmar encomenda'. Para voltar ao menu, responda 'menu'.",
    conversationUpdate: {
      currentStep: 'CUSTOM_CONFIRMATION'
    }
  };
}

export function buildChatbotReply({
  customerName,
  text,
  conversation,
  order
}: FlowContext): FlowResult {
  const normalizedText = normalizeText(text);
  const trimmedText = text.trim();
  const currentFlow = conversation.currentFlow ?? 'MENU';
  const botPaused = conversation.botPaused ?? false;

  if (botPaused) {
    if (isMenuRequest(normalizedText)) {
      return {
        reply: buildGreetingMenu(customerName),
        conversationUpdate: {
          currentFlow: 'MENU',
          currentStep: 'AWAITING_SELECTION',
          botPaused: false
        }
      };
    }

    return {
      reply: null
    };
  }

  if (currentFlow === 'MENU') {
    return handleMenuSelection(normalizedText, customerName);
  }

  if (currentFlow === 'CAKE_ORDER') {
    return handleCakeOrderFlow(normalizedText, trimmedText, order);
  }

  if (currentFlow === 'STORE_PURCHASE') {
    return handleStorePurchaseFlow(normalizedText, trimmedText);
  }

  if (currentFlow === 'CUSTOM_ORDER') {
    return handleCustomOrderFlow(normalizedText, trimmedText);
  }

  return {
    reply: buildGreetingMenu(customerName),
    conversationUpdate: {
      currentFlow: 'MENU',
      currentStep: 'AWAITING_SELECTION',
      botPaused: false
    }
  };
}
