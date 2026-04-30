# WhatsApp Cake Bot

Chatbot de atendimento para encomenda de bolos via WhatsApp Cloud API da Meta.

## Stack

- Node.js
- TypeScript
- Express
- Prisma
- PostgreSQL
- Supabase em producao
- Railway em producao

## Estrutura inicial

- `GET /webhook`: validacao do webhook da Meta
- `POST /webhook`: recebimento de mensagens
- `GET /health`: healthcheck para deploy

## Variaveis de ambiente

Use `.env.example` como base.

## Banco de dados

1. Suba o Postgres local com `docker-compose up -d`
2. Gere o client Prisma com `yarn prisma:generate`
3. Crie a migration com `yarn prisma:migrate`

## Proximos passos

- Evoluir o fluxo de atendimento para coletar sabor, recheio, tamanho, data e endereco
- Adicionar confirmacao de pedido
- Implementar catalogo e precificacao
- Criar testes para parser e fluxo
