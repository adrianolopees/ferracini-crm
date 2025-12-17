# 📋 Resumo das Decisões - Lojas Dinâmicas

## ✅ Decisões Arquiteturais Finais

### 1. Estrutura de Dados
- **Collection**: `workspace_settings`
- **Document ID**: `{workspaceId}` (ex: `real`)
- **Estrutura**: Array de stores dentro do documento
```typescript
{
  workspaceId: "real",
  stores: [Store, Store, Store],
  updatedAt: Date,
  updatedBy: "user@email.com"
}
```

### 2. Permissões
- Qualquer usuário autenticado do workspace pode editar
- Validado via Firestore Rules (multi-tenancy)

### 3. Ordenação
- Alfabética por nome (sem drag-and-drop)

### 4. Loja Padrão
**Via email do Firebase Auth:**
- Padrão: `ferracini@{nome-loja}.com`
- Exemplos:
  - `ferracini@maxi.com` → Loja padrão (Jundiaí/Maxi)
  - `ferracini@campinas.com` → Loja Campinas
  - `ferracini@dompedro.com` → Loja Dom Pedro

**Como funciona:**
```typescript
const { getDefaultStore } = useStoreSettings();
const { user } = useAuth();

// user.email = "ferracini@maxi.com"
const defaultStore = getDefaultStore();
// Retorna: { name: "Maxi", userEmail: "ferracini@maxi.com", ... }
```

---

## 🏗️ Requisitos Específicos do Projeto Real

### 1. Gerenciamento de Usuários
- ✅ Usuários são criados **manualmente** no Firebase Console
- ❌ Não há auto-registro de usuários na aplicação
- ✅ Admin gerencia emails no formato: `ferracini@{loja}.com`

### 2. Multi-Login (Importante!)
- ✅ **Vários vendedores podem usar o mesmo login**
- ✅ Desktop + Mobile simultâneos com mesmo email
- ✅ Real-time sync via Firestore (onSnapshot)
- 📝 Exemplo: vendedor A no desktop + vendedor B no mobile, ambos com `ferracini@maxi.com`

### 3. Migração de Dados Existentes
**Situação atual:**
- Workspace `real` JÁ TEM clientes cadastrados
- Customers têm: `sourceStore: "Campinas"` ou `"Dom Pedro"` (strings)
- Sistema atual usa números hardcoded

**Requisitos:**
- ✅ Manter dados antigos funcionando
- ✅ Adicionar loja "Maxi" como padrão
- ✅ Campinas e Dom Pedro continuam como lojas válidas
- ⚠️ **Não quebrar nada durante migração**

**Estratégia:**
1. Manter schema do Customer inalterado (sourceStore continua string)
2. Comparar `customer.sourceStore` com `store.name` por nome
3. Usar nomes compatíveis no seed (ex: "Campinas" ao invés de "Campinas Shopping")

---

## 🎯 Lojas Configuradas (Workspace Real)

| ID | Nome | Telefone | Cor | Email | Nota |
|----|------|----------|-----|-------|------|
| maxi | Maxi | (XX) XXXXX-XXXX | #F59E0B (laranja) | ferracini@maxi.com | **LOJA PADRÃO** |
| campinas | Campinas | (19) 98221-5561 | #3B82F6 (azul) | ferracini@campinas.com | Dados antigos compatíveis |
| dompedro | Dom Pedro | (19) 99682-1710 | #10B981 (verde) | ferracini@dompedro.com | Dados antigos compatíveis |

---

## 🚨 Pontos de Atenção

### 1. Nome da Loja "Maxi" ✅
**Decisão tomada:**
- ✅ `name: "Maxi"` - nome escolhido

**Consequências:**
- ⚠️ Customers antigos com `sourceStore: "Jundiaí"` precisam ser atualizados
- ⚠️ Ou adicionar mapeamento de compatibilidade no código (ver Dia 7)

### 2. Telefone da Loja Maxi
- **TODO**: Adicionar número real da loja Maxi/Jundiaí no seed
- Atualmente está como placeholder: `(XX) XXXXX-XXXX`

### 3. Compatibilidade de Nomes
Se você mudar nome de "Jundiaí" para "Maxi", precisa:
- OU: Atualizar todos customers antigos com `sourceStore: "Jundiaí"` → `"Maxi"`
- OU: Adicionar mapeamento no código:
```typescript
const nameMapping = {
  'Jundiaí': 'Maxi',
};
```

---

## 📅 Cronograma de Implementação

| Dia | Tarefa | Status |
|-----|--------|--------|
| 0 | Planejamento e decisões | ✅ Concluído |
| 1 | Schema Zod | ⏳ Próximo |
| 2 | Repository Layer | 📋 Pendente |
| 3 | Hook customizado | 📋 Pendente |
| 4 | UI de configurações | 📋 Pendente |
| 5 | Refatorar WhatsApp service | 📋 Pendente |
| 6 | Atualizar componentes | 📋 Pendente |
| 7 | Migração + Testes | 📋 Pendente |

---

## ✅ Checklist Pré-Implementação

Antes de começar o Dia 1, certifique-se:

- [ ] Sabe qual nome vai usar para loja Maxi
- [ ] Tem número de telefone da loja Maxi
- [ ] Entende como multi-login funciona
- [ ] Sabe que dados antigos precisam continuar funcionando
- [ ] Leu o plano completo em `PLANO_ESTUDO_LOJAS_DINAMICAS.md`

---

## 📚 Documentação Completa

Ver arquivo: **`PLANO_ESTUDO_LOJAS_DINAMICAS.md`**
- Contém tutoriais detalhados de cada dia
- Exemplos de código
- Conceitos a estudar
- Perguntas de reflexão
- Exercícios práticos

---

## 🤝 Próximos Passos

1. **Decidir nome da loja Maxi** (hoje)
2. **Ler Dia 1 do plano** (hoje/amanhã)
3. **Criar schema Zod** (Dia 1)
4. **Seguir plano dia a dia** (próximos 6 dias)

**Quando estiver pronto para começar, me avise!** 🚀
