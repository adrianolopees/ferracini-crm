<h1 align="center">Ferracini CRM</h1>

<p align="center">
  Sistema de gestão de reservas para rede de calçados — controle do funil completo do atendimento, do cadastro ao fechamento da venda.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white&style=flat-square" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white&style=flat-square" />
  <img src="https://img.shields.io/badge/Firebase-12-ffca28?logo=firebase&logoColor=black&style=flat-square" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&logoColor=white&style=flat-square" />
  <img src="https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white&style=flat-square" />
  <img src="https://img.shields.io/badge/deploy-Vercel-000?logo=vercel&logoColor=white&style=flat-square" />
</p>

---

## Demo ao vivo

**[https://ferracini-crm.vercel.app](https://ferracini-crm.vercel.app)**

| Campo | Valor |
|-------|-------|
| E-mail | `demo@lojacrm.com` |
| Senha | `demo123456` |

> O workspace demo vem pré-carregado com ~60 clientes fictícios cobrindo todos os estados do funil: ativos, urgentes (+14 dias), em transferência, prontos para retirada, finalizados e arquivados.

---

## O problema que resolve

Redes de calçados gerenciam reservas por WhatsApp e cadernos físicos — sem visibilidade de quem está esperando há quanto tempo, sem rastreamento de transferências entre filiais e sem métricas de conversão. O Ferracini CRM centraliza tudo em um painel em tempo real.

---

## Funcionalidades

### Painel principal (Dashboard)
- 8 cards de métricas em tempo real: total ativo, pronto para retirada, em transferência, finalizados, arquivados, média de espera, urgentes (+14 dias) e longa espera (+30 dias)
- Cada card abre um modal com a lista de clientes daquele grupo
- Alerta automático para clientes aguardando há mais de 30 dias
- Ações por cliente direto no card: consultar filial, confirmar/rejeitar estoque, registrar transferência, notificar chegada, finalizar compra, arquivar

### Gráficos analíticos (Recharts)
- Produtos mais reservados
- Ranking de vendedores por conversão
- Motivos de arquivamento (loss reasons)
- Velocidade de conversão do funil

### Gestão de clientes
- Cadastro de reserva com validação em tempo real (Zod + React Hook Form) — nome, telefone com máscara, modelo, referência, tamanho, cor, vendedor
- Busca inteligente por nome, modelo ou referência com ações rápidas
- Histórico completo: finalizados, transferências entre filiais, arquivados e candidatos a auto-arquivamento (+60 dias)

### Integração WhatsApp
- Consulta de estoque em outras filiais via link direto para WhatsApp Web
- Notificação automática ao cliente quando o produto chega
- Mensagens pré-preenchidas com dados do produto e da loja

### Configurações de workspace
- Gerenciar filiais (nome, telefone, cor de destaque)
- Gerenciar equipe de vendedores
- Cor da loja refletida como variável CSS em todo o sistema

---

## Stack

| Categoria | Tecnologia |
|-----------|------------|
| UI | React 19 + TypeScript 5.9 |
| Build | Vite 7 |
| Estilização | Tailwind CSS 4 |
| Roteamento | React Router DOM 7 |
| Formulários | React Hook Form 7 + Zod 4 |
| Animações | Framer Motion 12 |
| Gráficos | Recharts 3 |
| Notificações | Sonner 2 |
| Modal | Radix UI Dialog |
| Backend | Firebase 12 (Firestore + Auth) |
| Datas | date-fns 4 |
| Testes | Vitest 4 |
| Linting | ESLint 9 (flat config) + Prettier 3 |
| Deploy | Vercel |

---

## Arquitetura

Arquitetura em camadas onde cada camada só conhece a imediatamente abaixo:

```
Pages → Hooks → Contexts → Services → Repositories → Firebase
         ↑                                  ↑
      Schemas (Zod)                    Utils (puras)
```

| Camada | Responsabilidade |
|--------|-----------------|
| `pages/` | Orquestra UI e estado local; chama hooks |
| `hooks/` | Busca dados, calcula métricas, expõe estado para páginas |
| `contexts/` | Estado global (Auth, StoreSettings) com listeners real-time |
| `services/` | Lógica de negócio pura — métricas e integração WhatsApp |
| `repositories/` | Único ponto de acesso ao Firestore; toda query filtra por `workspaceId` |
| `schemas/` | Validação Zod + tipos derivados via `z.infer<>` |
| `utils/` | Funções puras sem efeitos colaterais |

**Isolamento multi-tenant:** cada workspace é isolado por `workspaceId`. Nenhuma query retorna dados de outro workspace — garantia implementada tanto no repository quanto nas regras do Firestore.

---

## Estrutura de pastas

```
src/
├── components/
│   ├── animations/     # Wrappers Framer Motion
│   ├── dashboard/      # MetricCard, ActionCard, WorkflowCard, gráficos
│   ├── history/        # Cards de histórico por tipo
│   ├── layout/         # Navigation, PageLayout, PageHeader
│   ├── modals/         # DialogModal, CustomerListModal, ArchiveModal, ConfirmModal
│   ├── settings/       # SettingsModal (lojas e vendedores)
│   ├── skeletons/      # Loading states
│   └── ui/             # Button, Input, Select, Spinner, Tabs, Skeleton
├── contexts/           # AuthContext, StoreSettingsContext
├── hooks/              # useCustomerDashboard, useCustomerHistory, useProductRanking
├── pages/              # Dashboard, RegisterCustomer, SearchCustomers, History, Login
├── repositories/       # customerRepository, storeSettingsRepository, userRepository
├── schemas/            # customerSchema, storeSettingsSchema, userSchema, loginSchema
├── scripts/            # Seed e cleanup de dados demo
├── services/           # firebase, customerMetricsService, whatsappService
└── utils/              # dateUtils, phoneUtils, firebaseErrors, customerStatus
```

---

## Rodando localmente

**Pré-requisitos:** Node.js 20+, Yarn, projeto Firebase com Firestore e Authentication habilitados.

```bash
# 1. Clone
git clone https://github.com/seu-usuario/ferracini-crm.git
cd ferracini-crm

# 2. Dependências
yarn install

# 3. Variáveis de ambiente
cp .env.example .env
# Preencha .env com suas credenciais do Firebase

# 4. Inicie
yarn dev   # http://localhost:5173
```

### Variáveis de ambiente

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `yarn dev` | Dev server em localhost:5173 |
| `yarn build` | Build de produção |
| `yarn preview` | Preview da build |
| `yarn type-check` | Verificação TypeScript |
| `yarn test` | Testes com Vitest |
| `yarn lint` | ESLint |
| `yarn format` | Prettier |
| `yarn seed:demo` | Popula workspace demo com ~60 clientes fictícios |
| `yarn clear:demo` | Remove clientes do workspace demo |
| `yarn seed:stores` | Cria configurações iniciais de lojas |

---

## Modelo de dados

### `customers/{id}`

```ts
{
  workspaceId: string
  name: string
  phone: string                  // Formato: (XX) 9XXXX-XXXX
  model: string
  reference: string
  size: string
  color: string
  salesperson: string
  createdAt: string              // ISO 8601
  status: 'pending' | 'awaitingTransfer' | 'readyForPickup' | 'completed'
  archived: boolean
  archiveReason?: 'gave_up' | 'no_response' | 'bought_elsewhere'
                | 'product_unavailable' | 'other' | 'exceeded_wait_time'
  sourceStore?: string           // Filial de origem da transferência
  consultingStore?: string       // Filial sendo consultada
  contactedAt?: string
  transferredAt?: string
  completedAt?: string
  archivedAt?: string
}
```

### `workspace_settings/{workspaceId}`

```ts
{
  stores: Array<{ id: string; name: string; phone: string; color: string }>
  salespeople: string[]
  updatedAt: string
}
```

---

## Decisões técnicas

**Zod como source of truth:** todos os tipos derivam de schemas Zod via `z.infer<>`. Validação em runtime e tipo estático a partir de um único lugar. Dados do Firestore passam por `safeParse` antes de chegar ao componente — sem `any`, sem cast forçado.

**Context em vez de Redux/Zustand:** o estado global real é mínimo (auth + store settings). React Context com listeners Firestore atende com zero dependência extra. Estado de UI fica colocado no componente que o consome (colocation).

**`refreshTrigger` em vez de listeners real-time no dashboard:** o dashboard processa 60+ registros com agregações complexas. Listener em toda a coleção seria custoso. A UI invalida o cache via `refreshTrigger` apenas após ações do usuário.

**Datas centralizadas em `dateUtils`:** toda operação de data passa por `date-fns` + `parseISO` + `isValid`. Timestamps armazenados como ISO string via `getCurrentTimestamp()`. Zero `new Date()` espalhado no código.

---

## Licença

Projeto privado — todos os direitos reservados.
