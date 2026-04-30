import { Request, Response } from 'express';
import { env } from '../config/env';
import { buildChatbotReply } from '../services/chatbot-flow.service';
import {
  findOrCreateOpenConversation,
  updateConversationState
} from '../services/conversation.service';
import { findOrCreateCustomer } from '../services/customer.service';
import {
  createMessage,
  findMessageByMetaMessageId
} from '../services/message.service';
import { parseIncomingMessage } from '../services/message-parser.service';
import { sendTextMessage } from '../services/meta-whatsapp.service';
import {
  findOrCreateDraftOrder,
  updateDraftOrder
} from '../services/order.service';
import { MetaWebhookPayload } from '../types/meta-webhook';

export function verifyWebhook(req: Request, res: Response) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === env.metaVerifyToken) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
}

export async function handleWebhook(req: Request, res: Response) {
  const payload = req.body as MetaWebhookPayload;

  try {
    if (payload.object !== 'whatsapp_business_account') {
      return res.sendStatus(404);
    }

    const incomingMessage = parseIncomingMessage(payload);

    if (!incomingMessage) {
      return res.sendStatus(200);
    }

    if (incomingMessage.messageId) {
      const existingMessage = await findMessageByMetaMessageId(
        incomingMessage.messageId
      );

      if (existingMessage) {
        return res.sendStatus(200);
      }
    }

    const customer = await findOrCreateCustomer(
      incomingMessage.from,
      incomingMessage.customerName
    );
    const conversation = await findOrCreateOpenConversation(customer.id);

    await createMessage({
      conversationId: conversation.id,
      customerId: customer.id,
      direction: 'INBOUND',
      type: incomingMessage.type,
      content: incomingMessage.text,
      metaMessageId: incomingMessage.messageId
    });

    let order = await findOrCreateDraftOrder(customer.id, conversation.id);

    const flowResult = buildChatbotReply({
      customerName: customer.name,
      text: incomingMessage.text,
      conversation,
      order
    });

    if (flowResult.orderUpdate) {
      order = await updateDraftOrder(order.id, flowResult.orderUpdate);
    }

    if (flowResult.conversationUpdate) {
      await updateConversationState(conversation.id, flowResult.conversationUpdate);
    }

    if (flowResult.reply) {
      await sendTextMessage(incomingMessage.from, flowResult.reply);

      await createMessage({
        conversationId: conversation.id,
        customerId: customer.id,
        direction: 'OUTBOUND',
        type: 'text',
        content: flowResult.reply
      });
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.sendStatus(500);
  }
}
