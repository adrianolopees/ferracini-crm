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

## ✅ Fase 7 - Refatoração CustomerCard & Melhorias UX (CONCLUÍDO)

### 🎯 Refatoração de CustomerCard no Dashboard

**Concluído em:** 25/10/2025 | **Resultado:** -67% código duplicado, UX profissional

#### Implementações Realizadas

**1. Expandir CustomerCard.tsx** ✅

- [x] Adicionadas 8 props opcionais para botões contextuais do Dashboard
- [x] Props implementadas: `onCheckLojaCampinas`, `onCheckLojaDomPedro`, `onStoreHasStock`, `onStoreNoStock`, `onClientAccepted`, `onClientDeclined`, `onProductArrived`, `onPurchaseCompleted`
- [x] Seção de "Botões Contextuais" condicional baseada no status
- [x] Layout 2 colunas mantido com botões no canto superior direito

**2. Refatorar CustomerListModal.tsx** ✅

- [x] Removidas ~230 linhas de JSX duplicado (linhas 82-318)
- [x] Substituído por componente `<CustomerCard />` reutilizável
- [x] Arquivo reduzido de **341 → 113 linhas** (67% de redução!)
- [x] Mantida apenas lógica de modal e listagem

**3. Limpeza de Código Legado** ✅

- [x] Removida prop `onAcceptTransfer` obsoleta (nunca foi usada)
- [x] Identificada função `handleAcceptTransfer` desconectada

**4. Otimização de Badges Informativos** ✅

- [x] Removido badge da loja em status "aguardando" (redundante)
- [x] Removido badge "De: [Loja]" em "aguardando_transferencia" (redundante)
- [x] Informações contextuais aparecem apenas quando relevantes

**5. SearchCustomers.tsx - Sistema de Arquivamento Profissional** ✅

- [x] Substituído `deleteDoc` por `updateDoc` com arquivamento
- [x] Removido `Modal` genérico e implementado `ArchiveModal` profissional
- [x] Adicionado dropdown de motivos de arquivamento
- [x] Dados preservados (não deletados permanentemente)
- [x] Sistema consistente com Dashboard

**6. Ícone de Arquivar - Padrão da Indústria** ✅

- [x] Trocado `fa-trash-can` (vermelho) por `fa-box-archive` (cinza)
- [x] Cor neutra (padrão Gmail, Slack, Outlook, Discord)
- [x] Título atualizado: "Arquivar cliente"
- [x] Botões com cores discretas e profissionais

**7. SearchCustomers.tsx - Busca Inteligente** ✅

- [x] Busca apenas clientes aguardando produto NOVO (não transferências)
- [x] Filtro: status "aguardando" + não consultando outra loja
- [x] Exclui: arquivados, em transferência, contactados, finalizados
- [x] Subtitle atualizado: "Produto novo chegou? Encontre quem está aguardando"

#### Resultados Alcançados

- ✅ **-67% de código duplicado** (230 linhas removidas)
- ✅ **DRY:** Um componente único para todos os cards
- ✅ **Consistência:** Visual idêntico em Dashboard/History/Search
- ✅ **Manutenção:** Mudanças em 1 lugar só
- ✅ **UX Profissional:** Ícones e cores padrão da indústria
- ✅ **Busca focada:** Caso de uso correto (produto novo chegou)
- ✅ **Segurança:** Nenhum dado deletado permanentemente

#### Arquivos Modificados

- `src/components/features/CustomerCard.tsx` (expandido: 242 → 383 linhas)
- `src/components/features/CustomerListModal.tsx` (simplificado: 341 → 113 linhas)
- `src/pages/SearchCustomers.tsx` (refatorado: arquivamento + busca inteligente)
- `src/pages/Dashboard.tsx` (limpeza: removida prop obsoleta)

---

## 🔜 Próximas Melhorias

### 🌍 IMPORTANTE: Padronização de Idioma (Recomendado)

**Estimativa:** 4-6 horas | **Prioridade:** Alta | **Risco:** Médio

**Problema Identificado:**

- Código mistura português e inglês (não profissional)
- Collections Firebase: `'clientes'` (PT) + `'contacted'` (EN)
- Interface Customer: nome em inglês, fields em português
- Status values em português: `'aguardando'`, `'finalizado'`

**Solução Recomendada:**

- ✅ Padronizar TODO código para **INGLÊS** (padrão da indústria)
- ✅ Interface do usuário permanece em português
- ✅ Alinhamento com 99% das empresas tech

**Documentação Completa:**
📄 Ver arquivo `MIGRATION-PT-TO-EN.md` para plano detalhado:

- Mapeamento completo de campos PT → EN
- Script de migração do Firebase
- Ordem de execução passo a passo
- Checklist de validação
- Plano de rollback

**Benefícios:**

- Portfolio mais profissional
- Facilita colaboração internacional
- Código mais fácil de manter
- Padrão da indústria tech

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

- [x] Remover código morto e componentes não usados ✅
- [x] Remover props e funções não utilizadas ✅
- [x] Criar hook useCustomerActions (lógica de negócio separada) ✅
- [ ] Refatorar Dashboard.tsx usando useCustomerActions 🔄
- [ ] Criar hook useDashboardState (consolidar estados) 🔄
- [ ] Extrair lógica de busca para hook customizado
- [ ] Adicionar error boundary para capturar erros globais
- [ ] Otimizar re-renders com React.memo
- [ ] Adicionar PropTypes ou JSDoc para documentação
- [ ] Code splitting por rota (lazy loading de páginas)
- [ ] Adicionar índices compostos no Firestore
- [ ] Implementar logger centralizado (analytics de erros)

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
- ✅ **Componente CustomerCard unificado** (-67% código duplicado)
- ✅ **Ícones e cores padrão da indústria** (arquivar, WhatsApp, restaurar)
- ✅ **Busca inteligente** (apenas clientes aguardando produto novo)
- ✅ **Sistema de arquivamento profissional** (dados preservados, motivos rastreados)

**Próximo foco:** Performance, paginação e analytics avançado
