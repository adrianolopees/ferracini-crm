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

## ✅ Fase 4 - UI/UX Profissional (EM ANDAMENTO)

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
- [ ] Skeleton loaders
- [ ] Empty states ilustrados

## 🔜 Fase 5 - Features Avançadas

### Paginação e Performance

- [ ] Implementar paginação na página de busca
- [ ] Adicionar filtros avançados (cor, numeração, data)
- [ ] Ordenação de resultados (mais urgente, alfabético, data)
- [ ] Busca com debounce para melhor performance

### Dashboard - Visão Geral Unificada ✅ (CONCLUÍDO)

- [x] Criar página Dashboard.tsx (nova home do sistema)
- [x] Adicionar ao Navigation como primeira aba (📊 Dashboard)
- [x] Rota configurada e protegida
- [x] **Cards de Métricas Principais:**
  - [x] Total de clientes aguardando (ativos) - busca real do Firestore
  - [x] Total de clientes contactados (histórico) - placeholder (aguardando implementação)
  - [x] Tempo médio de espera até contato - calculado automaticamente
  - [x] Casos urgentes (7+ dias) - calculado automaticamente
- [x] **Interatividade dos Cards:**
  - [x] Cards clicáveis que abrem modal com lista de clientes
  - [x] Card "Aguardando" mostra todos os clientes ativos
  - [x] Card "Urgentes" mostra apenas clientes com 7+ dias
  - [x] Card "Contactados" mostra toast informativo (em desenvolvimento)
  - [x] Card "Tempo Médio" mostra lista completa ordenada
- [x] **Modal de Lista de Clientes:**
  - [x] Componente CustomerListModal reutilizável
  - [x] Mostra clientes com mesmo layout do SearchCustomers
  - [x] Ações disponíveis: WhatsApp e Deletar
  - [x] Loading states e empty states
  - [x] Animações com AnimatedListItem
  - [x] Indicadores visuais de urgência (cores)
- [x] **Hooks Customizados:**
  - [x] useDashboardMetrics - busca e calcula métricas em tempo real
  - [x] useCustomersList - filtra clientes por tipo (all/urgent)
- [x] Design responsivo com grid de cards (1/2/4 colunas)
- [ ] **Gráficos e Visualizações:** (futuro)
  - [x] Gráfico de barras: produtos mais procurados (top 10)
  - [ ] Gráfico de pizza: distribuição por cor/numeração

### Histórico de Clientes Contactados

- [ ] Adicionar aba "Histórico" no Navigation (📋 Histórico)
- [ ] Criar página ContactedCustomers.tsx
- [ ] Criar coleção `contacted` no Firestore (separada de `customers`)
- [ ] **Ao clicar no botão WhatsApp em SearchCustomers:**
  - Mover documento do cliente para coleção `contacted`
  - Adicionar campo `contactedAt` (timestamp do contato)
  - Manter campo `createdAt` original para calcular tempo de espera
  - Remover da coleção `customers` (ativa)
- [ ] **Interface do Histórico:**
  - Listar todos os clientes contactados
  - Mostrar data de contato, tempo de espera, produto
  - Busca e filtros (por data, modelo, cor, numeração)
  - Ordenação (mais recente, mais antigo, maior tempo de espera)
- [ ] **Estatísticas do Histórico:**
  - Total de contactados no período
  - Tempo médio de espera (contactedAt - createdAt)
  - Ranking de produtos mais procurados
- [ ] **Ações disponíveis:**
  - Visualizar detalhes do cliente
  - Restaurar para reservas ativas (se necessário)
  - Deletar permanentemente do histórico

## 🔜 Fase 6 - Melhorias de UX

- [ ] Confirmação visual ao salvar (além do toast)
- [ ] Undo/Redo para exclusões
- [ ] Busca com sugestões (autocomplete)
- [ ] Atalhos de teclado
- [ ] Tour guiado para novos usuários
- [ ] Modo escuro (dark mode)
- [ ] PWA (funcionar offline)

## 🔜 Fase 7 - DevOps & Deploy

- [ ] CI/CD com GitHub Actions
- [ ] Deploy automático (Vercel/Firebase Hosting)
- [ ] Monitoramento de erros (Sentry)
- [ ] Analytics (Google Analytics/Plausible)
- [ ] Backup automático do Firebase
- [ ] Testes E2E (Playwright/Cypress)
- [ ] Testes unitários (Vitest)

## 🔜 Fase 8 - Multi-loja (expansão)

- [ ] Sistema multi-tenant
- [ ] Gestão de múltiplas lojas
- [ ] Permissões por usuário (admin, vendedor, gerente)
- [ ] Relatórios por loja
- [ ] API para integração com outros sistemas

---

## 📝 Notas Técnicas

### Bugs conhecidos

- Nenhum no momento

### Melhorias de código pendentes

- [ ] Extrair lógica de busca para hook customizado (useCustomerSearch)
- [x] Criar componente reutilizável de CustomerCard (CustomerListModal implementado)
- [x] Criar componente DialogModal genérico (para modais sem ações fixas)
- [ ] Adicionar error boundary para capturar erros globais
- [ ] Configurar code splitting para melhor performance
- [ ] Otimizar re-renders com React.memo onde necessário

### Débito técnico

- [ ] Revisar queries do Firebase (possível otimização)
- [ ] Adicionar indices no Firestore para queries mais rápidas
- [ ] Implementar cache de resultados de busca
- [ ] Lazy loading de componentes pesados

---

## 🎯 ROADMAP ESTRATÉGICO - Preparação para Portfólio/Vendas

### 🔥 FASE CRÍTICA - Sistema de Proteção de Dados & Métricas (PRIORIDADE MÁXIMA)

> **Objetivo:** Transformar o app em ferramenta de vendas com dados mensuráveis de ROI

#### ✅ Melhorias em Clientes Finalizados (CONCLUÍDO)
- [x] Remover marcações de urgência para status 'finalizado'
- [x] Trocar bolinha por ícone de check verde
- [x] Background verde suave (bg-emerald-50/50)
- [x] Mostrar "Finalizada em DD/MM/AAAA" ao invés de "Aguardando há X dias"

#### 🚀 FASE 1 - Controle de Exclusão & Arquivamento (FAZER HOJE)

**1.1 - Sistema de Arquivamento (ao invés de exclusão completa)**
- [ ] Adicionar campo `arquivado: boolean` ao tipo Customer
- [ ] Adicionar campo `motivoArquivamento?: string` (dropdown)
- [ ] Adicionar campo `dataArquivamento?: string`
- [ ] Criar enum com motivos: "Desistiu", "Não respondeu", "Comprou concorrente", "Produto não disponível", "Outro"
- [ ] Modificar queries para filtrar `arquivado === false` por padrão
- [ ] **REGRA CRÍTICA:** Clientes com `status === 'finalizado'` NÃO podem ser arquivados/excluídos

**1.2 - Modal de Arquivamento (substituir exclusão simples)**
- [ ] Criar componente `ArchiveModal.tsx`
- [ ] Campos: Dropdown de motivo + textarea opcional para observações
- [ ] Botão "Arquivar" ao invés de "Excluir"
- [ ] Substituir chamadas de `deleteDoc()` por `updateDoc()` com flag `arquivado: true`

**1.3 - Página de Clientes Arquivados**
- [ ] Criar rota `/archived`
- [ ] Adicionar ao Navigation (apenas para gerente/admin)
- [ ] Listar clientes arquivados com motivo
- [ ] Ação: "Restaurar" (volta para ativo)
- [ ] Busca e filtros por motivo de arquivamento

**1.4 - Proteção de Vendas Concluídas**
- [ ] Esconder botão de exclusão/arquivamento quando `status === 'finalizado'`
- [ ] Adicionar tooltip: "Vendas concluídas não podem ser removidas para preservar histórico"
- [ ] Validação no backend (Firebase Rules): bloquear exclusão de documentos com `status: 'finalizado'`

---

#### 🚀 FASE 2 - Sistema de Métricas & Analytics (FAZER HOJE/AMANHÃ)

**2.1 - Estrutura de Dados para Analytics**
- [ ] Criar coleção `analytics` no Firebase
- [ ] Documento `global` com métricas gerais:
  ```typescript
  {
    totalReservas: number,
    totalContactados: number,
    totalVendasConcluidas: number,
    taxaConversao: number, // (vendas / reservas) * 100
    receitaTotal?: number, // se souber valores
    ultimaAtualizacao: timestamp
  }
  ```
- [ ] Documento `por_vendedor/{vendedorId}`:
  ```typescript
  {
    nome: string,
    totalAtendimentos: number,
    totalVendas: number,
    taxaConversao: number,
    receitaGerada?: number
  }
  ```
- [ ] Documento `por_produto/{modelo}`:
  ```typescript
  {
    modelo: string,
    referencia: string,
    quantidadeReservas: number,
    quantidadeVendas: number,
    taxaConversao: number
  }
  ```

**2.2 - Funções de Atualização de Métricas**
- [ ] Criar `analyticsService.ts`
- [ ] Função `updateGlobalMetrics()` - atualiza após cada ação
- [ ] Função `updateVendedorMetrics(vendedor)` - rastreia performance individual
- [ ] Função `updateProdutoMetrics(modelo, referencia)` - produtos mais vendidos
- [ ] Chamar funções ao:
  - Cadastrar novo cliente
  - Mover para contactado
  - Finalizar venda
  - Arquivar cliente

**2.3 - Dashboard de Analytics (nova página)**
- [ ] Criar rota `/analytics`
- [ ] Adicionar ao Navigation (📊 Analytics - apenas gerente/admin)
- [ ] **Cards de Métricas Principais:**
  - Total de Reservas (histórico completo)
  - Total de Vendas Concluídas
  - Taxa de Conversão Geral (%)
  - Receita Gerada (se disponível)
- [ ] **Gráficos:**
  - Gráfico de linha: Evolução de vendas por mês (Chart.js ou Recharts)
  - Gráfico de barras: Ranking de vendedores
  - Gráfico de pizza: Motivos de arquivamento (para melhorar processo)
  - Tabela: Top 10 produtos mais vendidos
- [ ] **Comparações temporais:**
  - Este mês vs mês anterior
  - Indicadores de crescimento (↑ +15% nas vendas)

---

#### 🚀 FASE 3 - Sistema de Permissões Básico (OPCIONAL - se houver tempo)

**3.1 - Tipos de Usuário**
- [ ] Adicionar campo `role: 'vendedor' | 'gerente' | 'admin'` no Firebase Auth
- [ ] Criar contexto `usePermissions()`

**3.2 - Regras de Permissão**
- **Vendedor:**
  - ✅ Ver clientes
  - ✅ Cadastrar clientes
  - ✅ Contactar via WhatsApp
  - ✅ Marcar como finalizado
  - ❌ Arquivar clientes
  - ❌ Ver Analytics
  - ❌ Ver clientes arquivados

- **Gerente:**
  - ✅ Tudo do vendedor +
  - ✅ Arquivar clientes (exceto finalizados)
  - ✅ Ver Analytics
  - ✅ Ver e restaurar clientes arquivados
  - ❌ Excluir permanentemente

- **Admin:**
  - ✅ Acesso total
  - ✅ Gerenciar usuários
  - ✅ Exportar dados

**3.3 - UI Condicional**
- [ ] Mostrar/esconder botões baseado em permissões
- [ ] Esconder rotas protegidas no Navigation
- [ ] Mensagem de erro ao tentar ação sem permissão

---

## 🎯 ORDEM DE IMPLEMENTAÇÃO RECOMENDADA (HOJE)

### ✅ Etapa 1: Proteção de Dados (1-2h)
1. Adicionar campos de arquivamento ao tipo Customer
2. Bloquear exclusão de clientes finalizados (esconder botão)
3. Criar ArchiveModal com dropdown de motivos
4. Substituir `deleteDoc()` por arquivamento

### ✅ Etapa 2: Página de Arquivados (1h)
5. Criar página ArchivedCustomers
6. Listar clientes arquivados
7. Função de restaurar

### ✅ Etapa 3: Estrutura de Métricas (1-2h)
8. Criar analyticsService.ts
9. Criar coleção analytics no Firebase
10. Implementar funções de atualização
11. Integrar com ações existentes (cadastro, finalização)

### ⏰ Etapa 4: Dashboard de Analytics (2-3h - se houver tempo)
12. Criar página Analytics
13. Buscar dados da coleção analytics
14. Implementar cards de métricas
15. Adicionar gráfico básico (produtos mais vendidos já existe!)

---

## 💼 ARGUMENTOS PARA PORTFÓLIO/ENTREVISTAS

### Antes do Sistema:
❌ Clientes esquecidos sem controle
❌ Zero rastreamento de conversão
❌ Impossível medir performance de vendedores
❌ Dados perdidos com exclusões acidentais
❌ Sem noção de quanto o processo ajuda a vender

### Depois do Sistema:
✅ Taxa de conversão de X% (dados reais!)
✅ Tempo médio de atendimento: Y dias
✅ R$ XXX em vendas rastreadas pelo sistema
✅ Ranking de vendedores para motivar equipe
✅ Histórico protegido (vendas nunca são apagadas)
✅ Métricas em tempo real para tomada de decisão
✅ ROI mensurável: "Este app aumentou vendas em X%"

---

## 🎯 Prioridade para próxima sessão

1. ~~**Dashboard**~~ ✅ CONCLUÍDO - Dashboard funcional com métricas e modal interativo
2. ✅ **Melhorias em Finalizados** ✅ CONCLUÍDO
3. 🔥 **Sistema de Arquivamento** - CRÍTICO para preservar dados
4. 🔥 **Analytics Service** - CRÍTICO para métricas de vendas
5. **Dashboard de Analytics** - Para demonstrações e portfólio
6. **Paginação na busca** - Melhorar UX quando houver muitos resultados
7. **Gráficos no Dashboard** - Visualizações de dados (Chart.js ou Recharts)

---

## 💡 Ideias para o futuro

- Sistema de etiquetas/tags para clientes
- Histórico de interações (quando foi contatado, resposta)
- Exportar relatórios em PDF/Excel
- Integração com Instagram Direct
- Chat interno entre vendedores
- Sistema de comissões
