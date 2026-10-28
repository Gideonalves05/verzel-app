# Verzel Auction — Frontend

Interface web da **Casa de Leilões online** do teste técnico Elite Dev / Verzel.
Consome a API e o WebSocket especificados em [`verzel-backend`](../verzel-backend) e
entrega todas as telas pedidas no PDF do desafio:

- Vitrine pública com abas **ao vivo / agendados / encerrados** (cancelados não aparecem)
- Painel do leiloeiro (busca de itens em API externa, criação e cancelamento de lote, KPI de receita)
- Sala do lote ao vivo com lance atual, histórico, countdown, badge "ganhando / superado" — atualizados por WebSocket, sem recarregar
- Carteira do licitante (saldo total / comprometido / disponível + depósito simulado)
- Meus arremates com link do recibo
- Página pública de auditoria com badge de integridade
- Página pública do recibo acessível por token

> O design completo (CSR vs SSR, React Query, WS, mapeamento pt-BR dos códigos de erro) está em
> [`openspec/changes/add-auction-frontend/design.md`](openspec/changes/add-auction-frontend/design.md).
> As regras de cada tela (cenários WHEN/THEN) ficam em
> [`openspec/changes/add-auction-frontend/specs/`](openspec/changes/add-auction-frontend/specs/).

---

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** com modo claro/escuro via `next-themes` (estratégia `class`)
- **@tanstack/react-query** para estado do servidor
- **react-hook-form** + **zod** para formulários e validação
- **socket.io-client** para a sala do lote ao vivo
- **sonner** para toasts

---

## Como rodar localmente

### Pré-requisitos

- Node.js 22+
- O backend rodando em algum lugar (local ou deploy). Veja [`verzel-backend/README.md`](../verzel-backend/README.md).

### 1. Instalar

```bash
cd verzel-app
npm install
```

### 2. Configurar o `.env.local`

```bash
cp .env.example .env.local
```

Variáveis:

| Variável                     | Exemplo                                | Descrição                                            |
|------------------------------|----------------------------------------|------------------------------------------------------|
| `NEXT_PUBLIC_API_BASE_URL`   | `http://localhost:3001/api`            | Base da API REST do backend                          |
| `NEXT_PUBLIC_WS_URL`         | `http://localhost:3001`                | Base do WebSocket (o namespace `/live-lots` é fixo)  |

### 3. Rodar

```bash
npm run dev
# Frontend em http://localhost:3000
```

---

## Scripts

| Script             | O que faz                                     |
|--------------------|-----------------------------------------------|
| `npm run dev`      | Dev server com HMR                            |
| `npm run build`    | Build de produção                             |
| `npm start`        | Serve o build                                 |
| `npm run lint`     | ESLint                                        |

---

## Rotas

| Rota                        | Pública? | Papel         | O que mostra                                                             |
|-----------------------------|----------|---------------|--------------------------------------------------------------------------|
| `/`                         | sim      | —             | Vitrine com abas de status (`?status=live|scheduled|ended&page=&q=`)     |
| `/register`                 | sim      | —             | Cadastro com seleção de papel (leiloeiro / licitante)                    |
| `/login`                    | sim      | —             | Login (JWT) com suporte a `?next=`                                       |
| `/dashboard`                | não      | auctioneer    | KPIs e tabela dos próprios lotes                                         |
| `/dashboard/new-lot`        | não      | auctioneer    | Busca na API externa + formulário de criação de lote                     |
| `/lots/:id`                 | sim      | —             | Sala do lote (CSR + WS). Guest vê sem o formulário de lance.             |
| `/wallet`                   | não      | bidder        | Saldo + depósito simulado                                                |
| `/my-wins`                  | não      | bidder        | Lances ativos + lotes arrematados com link do recibo                     |
| `/audit/lots/:id`           | **sim**  | —             | Histórico de lances + badge de integridade (sem login)                   |
| `/receipt/:token`           | **sim**  | —             | Recibo público do vencedor                                               |

---

## Realtime

A sala do lote (`/lots/:id`) mantém **uma conexão Socket.IO** no namespace `/live-lots`.

- Entra na sala com `emit('join', { lot_id })` ao montar.
- Reage a `bid.placed`, `lot.extended`, `lot.ended`, `you.winning`, `you.outbid`.
- Reconecta sozinho e dá um `join` + refetch REST para "pegar o fio" sem perder eventos.
- Conexão **anônima** é aceita como somente-leitura — guests veem a sala atualizando sem precisar logar.

Nenhuma outra tela usa WebSocket. A vitrine usa SSR com `revalidate: 10` + um `refetchInterval` leve para manter os cards frescos sem o custo de WS.

---

## Modo escuro

- Toggle no header, movido pelo `next-themes` com estratégia `class`.
- Primeira visita respeita `prefers-color-scheme`. Escolha manual persiste em `localStorage`.
- Sem *flash* de tema errado graças ao script pré-hidratação do `next-themes`.

---

## Mensagens de feedback

Toda rejeição do backend chega com um `code` estável. O arquivo
[`lib/i18n/errors.ts`](openspec/changes/add-auction-frontend/specs/feedback-messages/spec.md)
mapeia cada código para a frase em pt-BR exatamente como o brief pede:

- `below_min_increment` → "O lance deve ser maior ou igual ao atual mais o incremento mínimo."
- `insufficient_available_balance` → "Saldo disponível insuficiente para este lance."
- `already_leading` → "Você já está ganhando este lote."
- `lot_not_started` / `lot_ended` / `lot_cancelled` → as frases do brief
- `email_taken`, `invalid_credentials` → caem no input correto, não só no toast
- (lista completa na spec)

---

## Estrutura (quando a implementação terminar)

```
verzel-app/
├── app/
│   ├── layout.tsx
│   ├── providers.tsx                # QueryClient + Theme + Auth + Toaster
│   ├── page.tsx                     # vitrine (SSR)
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── new-lot/page.tsx
│   ├── lots/[id]/page.tsx           # sala ao vivo (CSR)
│   ├── wallet/page.tsx
│   ├── my-wins/page.tsx
│   ├── audit/lots/[id]/page.tsx     # auditoria pública (SSR)
│   ├── receipt/[token]/page.tsx     # recibo público (SSR)
│   ├── error.tsx
│   └── not-found.tsx
├── components/                      # LotCard, Countdown, IntegrityBadge, Header, etc.
├── lib/
│   ├── api/       # apiFetch, hooks React Query, DTOs
│   ├── ws/        # getSocket, useLiveLot
│   ├── auth/      # AuthProvider, useSession, RequireRole
│   └── i18n/      # errors.ts
├── public/
└── openspec/      # specs do projeto
```

---

## Deploy

Recomendado: **Vercel**.

1. Importar o repositório.
2. Setar `NEXT_PUBLIC_API_BASE_URL` e `NEXT_PUBLIC_WS_URL` nas env vars (apontando para o backend em produção).
3. Deploy.

---

## Comportamentos esperados que merecem atenção

> O brief pede documentar funcionalidades com comportamento inesperado.
> Nenhuma é bug — são decisões de produto.

- **Vitrine atualiza sozinha a cada 15 s** (sem WebSocket). Para ver cada lance em tempo real, abra a sala do lote.
- **Guest pode acompanhar o lote ao vivo** (lances, countdown) mas vê um CTA "Entrar para dar lance" no lugar do formulário.
- **Prorrogação (+2 min)** é aplicada pelo backend, mas sentida aqui: a página mostra um toast "Lote estendido em 2 minutos" e o countdown reseta.
- **Badge de posição** é derivado do estado local (`currentLeaderHandle === meHandle`) — nunca desincroniza se um evento WS chegar fora de ordem; os eventos `you.winning` / `you.outbid` só disparam o toast.
- **Mapeamento de erros**: códigos desconhecidos caem no `message` do backend; se também vier vazio, mostramos "Ocorreu um erro inesperado.".
- **Token do recibo** vai na URL (`/receipt/<uuid>`) — é por design: qualquer pessoa com o link vê o recibo. É esse o fluxo "compartilhar por link" pedido no brief.

---

## OpenSpec

Como no backend, o frontend é especificado antes da implementação com [OpenSpec](https://github.com/Fission-AI/OpenSpec).
Change ativa: [`add-auction-frontend`](openspec/changes/add-auction-frontend/).

- [`proposal.md`](openspec/changes/add-auction-frontend/proposal.md) — o quê e por quê
- [`design.md`](openspec/changes/add-auction-frontend/design.md) — decisões técnicas
- [`specs/`](openspec/changes/add-auction-frontend/specs/) — 11 capabilities com cenários WHEN/THEN
- [`tasks.md`](openspec/changes/add-auction-frontend/tasks.md) — checklist de implementação

```bash
openspec status --change add-auction-frontend
openspec validate add-auction-frontend --strict
```
