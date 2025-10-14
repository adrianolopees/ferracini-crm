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
  - [ ] Gráfico de linha: contactos por período (últimos 7/30 dias)
  - [ ] Gráfico de barras: produtos mais procurados (top 10)
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

## 🎯 Prioridade para próxima sessão

1. ~~**Dashboard**~~ ✅ CONCLUÍDO - Dashboard funcional com métricas e modal interativo
2. **Histórico de Contactados** - Implementar funcionalidade de mover clientes para histórico ao clicar no WhatsApp
3. **Paginação na busca** - Melhorar UX quando houver muitos resultados
4. **Filtros avançados** - Permitir filtrar por cor, numeração, data
5. **Gráficos no Dashboard** - Visualizações de dados (Chart.js ou Recharts)

---

## 💡 Ideias para o futuro

- Sistema de etiquetas/tags para clientes
- Histórico de interações (quando foi contatado, resposta)
- Exportar relatórios em PDF/Excel
- Integração com Instagram Direct
- Chat interno entre vendedores
- Sistema de comissões
