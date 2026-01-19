# Plano de Simplificação - Eliminação do customerActionService

## Diagnóstico Final

### Problema
O `customerActionService.ts` é uma camada de abstração **desnecessária**. Todas as suas funções fazem apenas:
- `updateCustomer()` + `window.open()` (WhatsApp)
- Ou apenas `updateCustomer()` com dados fixos

Isso não justifica uma camada intermediária.

### Arquitetura Atual (3 camadas)
```
Dashboard handler → customerActionService → repository → Firebase
                          ↓
                    wrapper inútil
```

### Arquitetura Final (2 camadas)
```
Dashboard handler → repository → Firebase
       ↓
  update + whatsapp
  (direto no handler)
```

---

## PASSO 1: Atualizar Imports do Dashboard

### Arquivo: `src/pages/Dashboard.tsx`

**ANTES (linhas 8-21):**
```typescript
import {
  checkStoreCampinas,
  checkStoreDomPedro,
  confirmStoreStock,
  acceptTransfer,
  rejectStoreStock,
  productArrived,
  declineTransfer,
  completeOrder,
  resetToInitial,
} from '@/services/customerActionService';
import { Customer, ArchiveReason } from '@/schemas/customerSchema';
import { sendGenericMessage } from '@/services/whatsappService';
```

**DEPOIS:**
```typescript
import { Customer, ArchiveReason } from '@/schemas/customerSchema';
import {
  sendGenericMessage,
  sendStoreCampinas,
  sendStoreDomPedro,
  notifyOtherStore,
  notifyProductArrived,
} from '@/services/whatsappService';
import { archiveCustomerById, updateCustomer } from '@/repositories';
import { getCurrentTimestamp } from '@/utils';
```

---

## PASSO 2: Criar Helper Genérico no Dashboard

### Arquivo: `src/pages/Dashboard.tsx`

**ADICIONAR** após a linha `const { metrics, lists, loading, refresh } = useCustomerDashboard();`:

```typescript
// Helper para executar ações com feedback padronizado
const executeAction = async (
  action: () => Promise<void>,
  successMessage: string,
  customerId: string
) => {
  try {
    await action();
    toast.success(successMessage);
    setHighlightedCustomerId(customerId);
    refresh();
    setTimeout(() => setHighlightedCustomerId(null), 5000);
  } catch (error) {
    console.error('Erro na operação:', error);
    toast.error('Erro ao processar ação');
  }
};
```

---

## PASSO 3: Reescrever Todos os Handlers

### Arquivo: `src/pages/Dashboard.tsx`

**SUBSTITUIR** todos os handlers (linhas 42-170) por:

```typescript
const handleCheckStoreCampinas = (customer: Customer) =>
  executeAction(
    async () => {
      await updateCustomer(customer.id, { consultingStore: 'Campinas' });
      sendStoreCampinas(customer);
    },
    'WhatsApp enviado para Loja Campinas',
    customer.id
  );

const handleCheckStoreDomPedro = (customer: Customer) =>
  executeAction(
    async () => {
      await updateCustomer(customer.id, { consultingStore: 'Dom Pedro' });
      sendStoreDomPedro(customer);
    },
    'WhatsApp enviado para Loja Dom Pedro',
    customer.id
  );

const handleConfirmStoreStock = (customer: Customer) =>
  executeAction(
    async () => {
      await updateCustomer(customer.id, { storeHasStock: true });
      notifyOtherStore(customer);
    },
    'Cliente notificado sobre disponibilidade',
    customer.id
  );

const handleRejectStoreStock = (customer: Customer) =>
  executeAction(
    () => updateCustomer(customer.id, {
      consultingStore: undefined,
      storeHasStock: false,
    }),
    'Produto não disponível. Pode consultar outra loja.',
    customer.id
  );

const handleAcceptTransfer = (customer: Customer) =>
  executeAction(
    () => updateCustomer(customer.id, {
      status: 'awaitingTransfer',
      sourceStore: customer.consultingStore!,
      transferredAt: getCurrentTimestamp(),
      consultingStore: undefined,
      storeHasStock: false,
    }),
    `Transferência confirmada de ${customer.consultingStore}!`,
    customer.id
  );

const handleDeclineTransfer = (customer: Customer) => {
  setModalType(null);
  setCustomerToArchive(customer);
  setArchiveModalOpen(true);
};

const handleArchiveCustomer = async (reason: ArchiveReason, notes?: string) => {
  if (!customerToArchive) return;

  try {
    await updateCustomer(customerToArchive.id, {
      consultingStore: undefined,
      storeHasStock: false,
    });
    await archiveCustomerById(customerToArchive.id, reason, notes || '');
    toast.success(`${customerToArchive.name} arquivado com sucesso!`);
    setArchiveModalOpen(false);
    setCustomerToArchive(null);
    refresh();
  } catch (error) {
    console.error('Erro ao arquivar cliente:', error);
    toast.error('Erro ao arquivar cliente');
  }
};

const handleProductArrived = (customer: Customer) =>
  executeAction(
    async () => {
      await updateCustomer(customer.id, {
        status: 'readyForPickup',
        contactedAt: getCurrentTimestamp(),
      });
      notifyProductArrived(customer);
    },
    'Cliente notificado - produto chegou!',
    customer.id
  );

const handleCompleteOrder = (customer: Customer) =>
  executeAction(
    () => updateCustomer(customer.id, {
      status: 'completed',
      completedAt: getCurrentTimestamp(),
    }),
    `Venda de ${customer.name} finalizada!`,
    customer.id
  );

const handleArchive = (customer: Customer) => {
  setModalType(null);
  setCustomerToArchive(customer);
  setArchiveModalOpen(true);
};

const handleResetToInitial = (customer: Customer) =>
  executeAction(
    () => updateCustomer(customer.id, {
      consultingStore: undefined,
      storeHasStock: false,
      status: 'pending',
      sourceStore: undefined,
      transferredAt: undefined,
      contactedAt: undefined,
    }),
    `Cliente ${customer.name} voltou ao status inicial.`,
    customer.id
  );
```

---

## PASSO 4: Deletar o customerActionService

### Arquivo: `src/services/customerActionService.ts`

**DELETAR** o arquivo inteiro.

---

## PASSO 5: Verificar History.tsx

### Arquivo: `src/pages/History.tsx`

Este arquivo **já está correto** - usa `updateCustomer` direto do repository (linha 143).

Não precisa de alterações.

---

## Resultado Final

### Estrutura de Arquivos

```
src/
├── repositories/
│   └── customerRepository.ts    ✅ Mantém (acesso a dados)
├── services/
│   ├── firebase.ts              ✅ Mantém (config)
│   ├── whatsappService.ts       ✅ Mantém (utilitários puros)
│   ├── customerMetricsService.ts ✅ Mantém (se usado)
│   └── customerActionService.ts ❌ DELETAR
└── pages/
    ├── Dashboard.tsx            ✅ Simplificado
    └── History.tsx              ✅ Já estava correto
```

### Métricas

| Métrica | Antes | Depois |
|---------|-------|--------|
| Arquivos de service | 4 | 3 |
| Funções wrapper | 10 | 0 |
| Linhas nos handlers | ~130 | ~80 |
| Camadas de abstração | 3 | 2 |

---

## Dashboard.tsx - Código Completo Final

Para referência, aqui está o arquivo completo após as mudanças:

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PageLayout } from '@/components/ui';
import { AnimatedContainer } from '@/components/animations';
import { ActionCard, MetricCard, LongWaitAlert, TopProductsChart } from '@/components/dashboard';
import { ArchiveModal, CustomerListModal } from '@/components/modals';
import { Customer, ArchiveReason } from '@/schemas/customerSchema';
import {
  sendGenericMessage,
  sendStoreCampinas,
  sendStoreDomPedro,
  notifyOtherStore,
  notifyProductArrived,
} from '@/services/whatsappService';
import { archiveCustomerById, updateCustomer } from '@/repositories';
import { getCurrentTimestamp } from '@/utils';
import { useCustomerDashboard } from '@/hooks';

function Dashboard() {
  const navigate = useNavigate();
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [customerToArchive, setCustomerToArchive] = useState<Customer | null>(null);
  const [modalType, setModalType] = useState<'awaiting' | 'awaitingTransfer' | 'readyForPickup' | null>(null);
  const [highlightedCustomerId, setHighlightedCustomerId] = useState<string | null>(null);
  const { metrics, lists, loading, refresh } = useCustomerDashboard();

  // Helper para executar ações com feedback padronizado
  const executeAction = async (
    action: () => Promise<void>,
    successMessage: string,
    customerId: string
  ) => {
    try {
      await action();
      toast.success(successMessage);
      setHighlightedCustomerId(customerId);
      refresh();
      setTimeout(() => setHighlightedCustomerId(null), 5000);
    } catch (error) {
      console.error('Erro na operação:', error);
      toast.error('Erro ao processar ação');
    }
  };

  const getCustomersByModalType = () => {
    if (!modalType) return [];
    const mapping = {
      awaiting: lists.awaiting,
      awaitingTransfer: lists.awaitingTransfer,
      readyForPickup: lists.readyForPickup,
    };
    return mapping[modalType];
  };

  const customers = getCustomersByModalType();

  const handleCheckStoreCampinas = (customer: Customer) =>
    executeAction(
      async () => {
        await updateCustomer(customer.id, { consultingStore: 'Campinas' });
        sendStoreCampinas(customer);
      },
      'WhatsApp enviado para Loja Campinas',
      customer.id
    );

  const handleCheckStoreDomPedro = (customer: Customer) =>
    executeAction(
      async () => {
        await updateCustomer(customer.id, { consultingStore: 'Dom Pedro' });
        sendStoreDomPedro(customer);
      },
      'WhatsApp enviado para Loja Dom Pedro',
      customer.id
    );

  const handleConfirmStoreStock = (customer: Customer) =>
    executeAction(
      async () => {
        await updateCustomer(customer.id, { storeHasStock: true });
        notifyOtherStore(customer);
      },
      'Cliente notificado sobre disponibilidade',
      customer.id
    );

  const handleRejectStoreStock = (customer: Customer) =>
    executeAction(
      () => updateCustomer(customer.id, {
        consultingStore: undefined,
        storeHasStock: false,
      }),
      'Produto não disponível. Pode consultar outra loja.',
      customer.id
    );

  const handleAcceptTransfer = (customer: Customer) =>
    executeAction(
      () => updateCustomer(customer.id, {
        status: 'awaitingTransfer',
        sourceStore: customer.consultingStore!,
        transferredAt: getCurrentTimestamp(),
        consultingStore: undefined,
        storeHasStock: false,
      }),
      `Transferência confirmada de ${customer.consultingStore}!`,
      customer.id
    );

  const handleDeclineTransfer = (customer: Customer) => {
    setModalType(null);
    setCustomerToArchive(customer);
    setArchiveModalOpen(true);
  };

  const handleArchiveCustomer = async (reason: ArchiveReason, notes?: string) => {
    if (!customerToArchive) return;

    try {
      await updateCustomer(customerToArchive.id, {
        consultingStore: undefined,
        storeHasStock: false,
      });
      await archiveCustomerById(customerToArchive.id, reason, notes || '');
      toast.success(`${customerToArchive.name} arquivado com sucesso!`);
      setArchiveModalOpen(false);
      setCustomerToArchive(null);
      refresh();
    } catch (error) {
      console.error('Erro ao arquivar cliente:', error);
      toast.error('Erro ao arquivar cliente');
    }
  };

  const handleProductArrived = (customer: Customer) =>
    executeAction(
      async () => {
        await updateCustomer(customer.id, {
          status: 'readyForPickup',
          contactedAt: getCurrentTimestamp(),
        });
        notifyProductArrived(customer);
      },
      'Cliente notificado - produto chegou!',
      customer.id
    );

  const handleCompleteOrder = (customer: Customer) =>
    executeAction(
      () => updateCustomer(customer.id, {
        status: 'completed',
        completedAt: getCurrentTimestamp(),
      }),
      `Venda de ${customer.name} finalizada!`,
      customer.id
    );

  const handleArchive = (customer: Customer) => {
    setModalType(null);
    setCustomerToArchive(customer);
    setArchiveModalOpen(true);
  };

  const handleResetToInitial = (customer: Customer) =>
    executeAction(
      () => updateCustomer(customer.id, {
        consultingStore: undefined,
        storeHasStock: false,
        status: 'pending',
        sourceStore: undefined,
        transferredAt: undefined,
        contactedAt: undefined,
      }),
      `Cliente ${customer.name} voltou ao status inicial.`,
      customer.id
    );

  const handleViewLongWait = () => {
    navigate('/history?tab=long_wait');
  };

  const getModalTitle = () => {
    if (modalType === 'awaiting') return `Clientes Aguardando (${metrics.totalActive})`;
    if (modalType === 'awaitingTransfer') return `Aguardando Transferência (${metrics.totalAwaitingTransfer})`;
    if (modalType === 'readyForPickup') return `Pronto para Retirada (${metrics.totalReadyForPickup})`;
    return '';
  };

  return (
    <PageLayout
      title="Painel de"
      highlight="Controle"
      subtitle="Sistema para gerenciar solicitações de clientes, transferências entre lojas e reposições de estoque"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 max-w-5xl mx-auto">
        {/* Card 1: Clientes Aguardando */}
        <AnimatedContainer type="slideDown" delay={0.1}>
          <ActionCard
            title="Aguardando"
            value={metrics.totalActive}
            subtitle={metrics.urgentCount > 0 ? `${metrics.urgentCount} urgente(s)` : 'Clientes na fila de espera'}
            icon="fa-solid fa-clock"
            colorScheme="blue"
            loading={loading}
            onClick={() => setModalType('awaiting')}
          />
        </AnimatedContainer>

        {/* Card 2: Aguardando Transferência */}
        <AnimatedContainer type="slideDown" delay={0.2}>
          <ActionCard
            title="Em Transferência"
            value={metrics.totalAwaitingTransfer}
            subtitle="Aguardando transferência"
            icon="fa-solid fa-truck"
            colorScheme="yellow"
            loading={loading}
            onClick={() => setModalType('awaitingTransfer')}
          />
        </AnimatedContainer>

        {/* Card 3: Pronto para Retirada */}
        <AnimatedContainer type="slideDown" delay={0.3}>
          <ActionCard
            title="Pronto para Retirada"
            value={metrics.totalReadyForPickup}
            subtitle={
              metrics.totalFinished > 0
                ? `${metrics.totalFinished} venda(s) finalizada(s)`
                : 'Produtos disponíveis para o cliente'
            }
            icon="fa-solid fa-box-open"
            colorScheme="green"
            loading={loading}
            onClick={() => setModalType('readyForPickup')}
          />
        </AnimatedContainer>
      </div>

      {/* Banner de Espera Longa */}
      <div className="px-4 max-w-5xl mx-auto mt-6">
        <LongWaitAlert count={metrics.longWaitCount} loading={loading} onClick={handleViewLongWait} />
      </div>

      {/* Estatísticas */}
      <div className="px-4 max-w-5xl mx-auto mt-8 mb-6">
        <AnimatedContainer type="slideUp" delay={0.1}>
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-6">Estatísticas</h2>

            {/* Mini Cards de Métricas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <MetricCard
                title="Tempo Médio"
                value={`${metrics.averageWaitTime}d`}
                subtitle="de espera"
                icon="fa-solid fa-hourglass-half"
                colorScheme="purple"
                loading={loading}
              />

              <MetricCard
                title="Total Ativos"
                value={metrics.totalActive + metrics.totalAwaitingTransfer + metrics.totalReadyForPickup}
                subtitle="clientes"
                icon="fa-solid fa-users"
                colorScheme="blue"
                loading={loading}
              />

              <MetricCard
                title="Taxa Conversão"
                value={`${
                  metrics.totalFinished > 0
                    ? Math.round(
                        (metrics.totalFinished /
                          (metrics.totalActive +
                            metrics.totalAwaitingTransfer +
                            metrics.totalReadyForPickup +
                            metrics.totalFinished)) *
                          100
                      )
                    : 0
                }%`}
                subtitle="vendidos"
                icon="fa-solid fa-chart-line"
                colorScheme="cyan"
                loading={loading}
              />

              <MetricCard
                title="Vendas"
                value={metrics.totalFinished}
                subtitle="finalizadas"
                icon="fa-solid fa-circle-check"
                colorScheme="emerald"
                loading={loading}
              />
            </div>

            {/* Gráfico de Top Produtos */}
            <div>
              <TopProductsChart />
            </div>
          </div>
        </AnimatedContainer>
      </div>

      {/* Modal de Lista de Clientes */}
      <CustomerListModal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        title={getModalTitle()}
        customers={customers}
        loading={loading}
        highlightedCustomerId={highlightedCustomerId}
        onSendMessage={sendGenericMessage}
        onArchive={handleArchive}
        onResetToInitial={handleResetToInitial}
        checkStoreCampinas={handleCheckStoreCampinas}
        checkStoreDomPedro={handleCheckStoreDomPedro}
        productArrived={handleProductArrived}
        completeOrder={handleCompleteOrder}
        confirmStoreStock={handleConfirmStoreStock}
        rejectStoreStock={handleRejectStoreStock}
        acceptTransfer={handleAcceptTransfer}
        declineTransfer={handleDeclineTransfer}
      />

      {/* Modal de Arquivamento */}
      <ArchiveModal
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        onConfirm={handleArchiveCustomer}
        customerName={customerToArchive?.name || ''}
      />
    </PageLayout>
  );
}

export default Dashboard;
```

---

## Checklist de Execução

- [ ] Atualizar imports do `Dashboard.tsx`
- [ ] Adicionar helper `executeAction`
- [ ] Substituir todos os handlers
- [ ] Testar cada funcionalidade:
  - [ ] Consultar loja Campinas
  - [ ] Consultar loja Dom Pedro
  - [ ] Confirmar estoque
  - [ ] Rejeitar estoque
  - [ ] Aceitar transferência
  - [ ] Recusar transferência (arquivar)
  - [ ] Produto chegou
  - [ ] Finalizar venda
  - [ ] Resetar para inicial
- [ ] Deletar `src/services/customerActionService.ts`
- [ ] Verificar se não há imports quebrados

---

## Ordem Recomendada

1. **Primeiro**: Atualize o `Dashboard.tsx` completo
2. **Segundo**: Teste todas as funcionalidades
3. **Terceiro**: Delete o `customerActionService.ts`
4. **Quarto**: Faça commit

> ⚠️ **Dica**: Mantenha o `customerActionService.ts` até testar tudo. Só delete depois de confirmar que funciona.
