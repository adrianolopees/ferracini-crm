# Roadmap - Ferracini CRM

## ✅ Fase 1 - Fundação (CONCLUÍDO)

- [x] Vite + React configurado
- [x] Firebase configurado com .env
- [x] ESLint + Prettier
- [x] Estrutura de pastas profissional
- [x] Componentes UI base (Button, Input, Modal)
- [x] Página de cadastro (RegisterCustomer)
- [x] Página de busca (SearchCustomers)
- [x] Integração com WhatsApp
- [x] Sistema de exclusão com modal

## ✅ Fase 2 - Segurança & Backend (CONCLUÍDO)

- [x] Implementar autenticação (Firebase Auth)
- [x] Criar tela de login
- [x] Proteger rotas (apenas usuários autenticados)
- [x] Melhorar regras de segurança do Firestore
- [x] Sistema de hooks customizados (useAuth)

## ✅ Fase 3 - Qualidade (CONCLUÍDO)

- [x] Migrar para TypeScript
- [x] Validação com Zod
- [x] Tratamento de erros robusto
- [x] Máscaras de input (telefone)
- [x] Formatação de datas (date-fns)

## ✅ Fase 4 - UI/UX Profissional (CONCLUÍDO)

- [x] Migrar para Tailwind CSS
- [x] Design system completo com cores e tipografia
- [x] Responsividade 100% (mobile-first)
- [x] Loading states com Spinner component
- [x] Modal com Radix UI Dialog
- [x] Toasts profissionais (react-hot-toast)
- [x] Indicadores visuais de urgência (dias de espera)
- [x] Login page modernizado
- [x] Remover CSS legado (index.css, App.css, Modal.css)
- [x] Animações suaves (framer-motion)

## ✅ Fase 5 - Dashboard & Gestão de Clientes (CONCLUÍDO)

### Dashboard Principal
- [x] Página Dashboard.tsx como home do sistema
- [x] Título "Gestão de Clientes" com subtitle focado em ação
- [x] **Seção "Ações Rápidas":**
  - [x] Card "Aguardando" (clientes ativos)
  - [x] Card "Aguardando Transferência" (produtos em trânsito)
  - [x] Card "Pronto para Retirada" (produtos disponíveis)
  - [x] Cards clicáveis que abrem modal com lista
- [x] **Seção "Estatísticas":**
  - [x] Mini cards: Tempo Médio, Total Ativos, Taxa Conversão, Vendas
  - [x] Gráfico horizontal de produtos mais procurados (top 10)
- [x] Real-time updates sem reload de página
- [x] Hooks: useDashboardMetrics, useCustomersList

### Sistema de Status e Workflow
- [x] Status: aguardando → aguardando_transferencia → contactado → finalizado
- [x] **Sub-estados em "Aguardando":**
  - [x] Inicial: Botões "Verificar Campinas/Dom Pedro"
  - [x] Aguardando resposta loja: Botões "Tem Estoque/Não Tem"
  - [x] Aguardando resposta cliente: Botões "Cliente Aceitou/Recusou"
- [x] Campos: consultandoLoja, lojaTemEstoque
- [x] WhatsApp integrado em cada etapa do fluxo
- [x] Proteção: vendas finalizadas não podem ser arquivadas

### Sistema de Arquivamento
- [x] Campo `arquivado: boolean` no Customer
- [x] Campos de metadados: motivoArquivamento, dataArquivamento, observacoes
- [x] ArchiveModal com dropdown de motivos
- [x] Enum de motivos: Desistiu, Não respondeu, Comprou concorrente, etc
- [x] Queries filtram arquivados por padrão
- [x] Botão de arquivar oculto para status finalizado

### Histórico Unificado
- [x] Página History.tsx com sistema de tabs
- [x] **Tab "Vendas Finalizadas":**
  - [x] Lista vendas com status finalizado
  - [x] Background verde, ícone de check
  - [x] Mostra data de finalização
- [x] **Tab "Contactados":**
  - [x] Clientes prontos para retirada
  - [x] Integração com coleção legada 'contacted'
  - [x] Mostra tempo de espera até contato
  - [x] Botão "Cliente Comprou" para finalizar venda
- [x] **Tab "Arquivados":**
  - [x] Clientes arquivados com motivo
  - [x] Botão "Restaurar" para voltar a ativo
  - [x] Mostra data e motivo do arquivamento
- [x] Busca unificada em cada tab
- [x] Proteção: arquivados não aparecem em métricas

## ✅ Fase 6 - Refinamentos de UX Mobile & Cards (CONCLUÍDO)

### Navigation Mobile Profissional
- [x] Implementar Bottom Navigation no mobile (padrão Instagram/YouTube)
- [x] Tabs fixas no bottom em mobile, top em desktop
- [x] Ícones + labels sempre visíveis para melhor UX
- [x] Redução de altura do bottom nav (mais compacto)
- [x] Ajuste de padding no PageLayout para evitar sobreposição de conteúdo

### Otimização de CustomerCards
- [x] **Redução de 36% na altura dos cards** através de:
  - [x] Layout horizontal para informações contextuais (desktop)
  - [x] Padding reduzido (p-5 → p-4)
  - [x] Espaçamentos otimizados (mb-3 → mb-2, gap-4 → gap-3)
  - [x] Grid de produto mais compacto (text-base → text-sm)
  - [x] Ícones menores e consistentes (text-sm)
- [x] **Informações contextuais por etapa do workflow:**
  - [x] **Finalizado:** Data/hora precisa + tempo total + loja de origem
  - [x] **Pronto p/ Retirada:** Tempo disponível + badge de loja origem
  - [x] **Aguardando Transferência:** Loja origem + tempo em trânsito
  - [x] **Aguardando:** Badge de "consultando loja" (se aplicável)
- [x] WhatsApp removido em vendas finalizadas (mantém só celular para relatórios)
- [x] Separadores visuais "•" entre informações inline (desktop)

### Refatoração de Código
- [x] Centralizar funções de formatação em `@/utils/formatDate.ts`
- [x] Adicionar `formatDateTime()` para data/hora completa
- [x] Adicionar `formatDaysElapsed()` para cálculo de tempo decorrido
- [x] Remover duplicação de código nos componentes

## 🔜 Próximas Melhorias

### 🎯 PRIORIDADE: Refatoração de CustomerCard no Dashboard
**Estimativa:** 2-3 horas | **Objetivo:** Eliminar duplicação de código e garantir consistência visual

#### Contexto
Atualmente temos **2 implementações diferentes** de cards de cliente:
- ✅ **CustomerCard.tsx** - Usado em History e Search (novo layout 2 colunas)
- ❌ **CustomerListModal.tsx** - Implementação inline (~200 linhas JSX duplicado)

#### Problemas
- **Duplicação de código:** Mesma lógica de status/cores em 2 lugares
- **Inconsistência visual:** Dashboard tem visual diferente das outras páginas
- **Manutenção difícil:** Mudanças precisam ser feitas em 2 arquivos
- **Violação DRY:** Bug fixes precisam ser duplicados

#### Plano de Execução

**1. Expandir CustomerCard.tsx (30 min)**
- [ ] Adicionar props opcionais para botões contextuais do Dashboard:
  ```typescript
  interface CustomerCardProps {
    // Existentes
    customer: Customer;
    variant?: 'default' | 'compact' | 'finalized';
    onWhatsApp?: (customer: Customer) => void;
    onDelete?: (customer: Customer) => void;
    onRestore?: (customer: Customer) => void;
    showActions?: boolean;

    // NOVOS - Dashboard específicos
    onCheckLojaCampinas?: (customer: Customer) => void;
    onCheckLojaDomPedro?: (customer: Customer) => void;
    onAcceptTransfer?: (customer: Customer, store: 'Campinas' | 'Dom Pedro') => void;
    onProductArrived?: (customer: Customer) => void;
    onPurchaseCompleted?: (customer: Customer) => void;
    onStoreHasStock?: (customer: Customer) => void;
    onStoreNoStock?: (customer: Customer) => void;
    onClientAccepted?: (customer: Customer) => void;
    onClientDeclined?: (customer: Customer) => void;
  }
  ```
- [ ] Adicionar seção condicional de "Botões Contextuais" baseada no status do cliente
- [ ] Manter layout 2 colunas (Cliente | Produto) com botões no canto superior direito

**2. Refatorar CustomerListModal.tsx (60 min)**
- [ ] Remover todo JSX inline do card (linhas 82-300+)
- [ ] Substituir por:
  ```tsx
  <CustomerCard
    customer={customer}
    variant="compact"
    onWhatsApp={onWhatsApp}
    onDelete={onDelete}
    onCheckLojaCampinas={onCheckLojaCampinas}
    onCheckLojaDomPedro={onCheckLojaDomPedro}
    // ... demais callbacks
  />
  ```
- [ ] Manter apenas lógica de modal e listagem
- [ ] Reduzir arquivo de ~400 linhas para ~150 linhas

**3. Testes e Validação (60 min)**
- [ ] Testar todos os fluxos do Dashboard:
  - [ ] Status "Aguardando" → Sub-estados (verificar lojas, resposta loja, resposta cliente)
  - [ ] Status "Aguardando Transferência" → Produto chegou
  - [ ] Status "Contactado" → Cliente comprou
- [ ] Verificar botões contextuais aparecem corretamente em cada estado
- [ ] Garantir callbacks funcionam (WhatsApp, arquivamento, etc)
- [ ] Testar responsividade mobile/desktop
- [ ] Validar consistência visual entre Dashboard/History/Search

#### Benefícios
- ✅ **DRY:** Um componente único para todos os cards
- ✅ **Consistência:** Visual idêntico em todo o app
- ✅ **Manutenção:** Mudanças em 1 lugar só
- ✅ **Performance:** Melhor re-render com React.memo
- ✅ **Testabilidade:** Lógica centralizada

#### Arquivos Afetados
- `src/components/features/CustomerCard.tsx` (expandir props)
- `src/components/features/CustomerListModal.tsx` (simplificar)
- `src/pages/Dashboard.tsx` (sem mudanças, só testar)

---

### Performance & Paginação
- [ ] Implementar paginação na página de busca
- [ ] Busca com debounce para melhor performance
- [ ] Filtros avançados (cor, numeração, período)
- [ ] Ordenação customizada (urgente, alfabético, data)

### Analytics Avançado
- [ ] Exportar relatórios em PDF/Excel
- [ ] Gráfico de evolução de vendas por período
- [ ] Comparação temporal (mês atual vs anterior)
- [ ] Métricas por vendedor individual

### UX Refinements
- [ ] Skeleton loaders
- [ ] Empty states ilustrados
- [ ] Confirmação visual ao salvar
- [ ] Atalhos de teclado
- [ ] Modo escuro (dark mode)

### Código & Qualidade
- [ ] Extrair lógica de busca para hook customizado
- [ ] Adicionar error boundary para capturar erros globais
- [ ] Otimizar re-renders com React.memo
- [ ] Adicionar indices no Firestore para queries mais rápidas
- [ ] Lazy loading de componentes pesados

## 💡 Ideias para o Futuro

- Sistema de etiquetas/tags para clientes
- Histórico detalhado de interações
- Sistema de notificações push
- Integração com Instagram Direct
- Chat interno entre vendedores
- Sistema de comissões por venda

---

## 📊 Status Atual do Projeto

**Sistema 100% funcional** com:
- ✅ Gestão completa do fluxo de clientes
- ✅ Dashboard profissional com métricas em tempo real
- ✅ Sistema de arquivamento preservando histórico
- ✅ Workflows com sub-estados para melhor controle
- ✅ Proteção de dados de vendas finalizadas
- ✅ Interface responsiva e moderna
- ✅ Integração WhatsApp em todas as etapas
- ✅ **Bottom Navigation mobile profissional** (padrão apps modernos)
- ✅ **Cards otimizados com 36% menos altura** e informações contextuais
- ✅ **Informações específicas por etapa** do workflow (tempo, origem, etc)

**Próximo foco:** Performance, paginação e analytics avançado
