# ✅ Checklist: O que commitar no Git

---

## 📦 **DEVE IR PRO GIT** ✅

### **Código da Aplicação**
- ✅ `src/**/*.{ts,tsx}` - Todo o código fonte
- ✅ `src/schemas/userSchema.ts` - **NOVO** schema de usuário
- ✅ `src/repositories/userRepository.ts` - **NOVO** repository
- ✅ `src/contexts/AuthContext.tsx` - **MODIFICADO** (workspaceId)
- ✅ `src/hooks/useCustomerDashboard.ts` - **MODIFICADO**
- ✅ `src/hooks/useCustomerHistory.ts` - **MODIFICADO**
- ✅ `src/hooks/useProductRanking.ts` - **MODIFICADO**
- ✅ `src/pages/RegisterCustomer.tsx` - **MODIFICADO**
- ✅ `src/pages/SearchCustomers.tsx` - **MODIFICADO**
- ✅ `src/pages/MigrateWorkspace.tsx` - **NOVO** (útil para futuras migrações)

### **Configuração**
- ✅ `firestore.rules` - **NOVO** Regras de segurança do Firestore
- ✅ `.gitignore` - **MODIFICADO** (removido docs/)
- ✅ `package.json` - Dependências
- ✅ `tsconfig.json` - Configuração TypeScript
- ✅ `vite.config.ts` - Configuração Vite
- ✅ `.env.example` - **CRIAR** (template sem dados sensíveis)

### **Documentação**
- ✅ `docs/README.md` - **NOVO** Índice da documentação
- ✅ `docs/MULTI-TENANCY-IMPLEMENTATION-GUIDE.md` - **NOVO** Guia completo
- ✅ `docs/DASHBOARD-MULTI-TENANT-IMPLEMENTATION.md` - **NOVO** Guia Dashboard
- ✅ `docs/MIGRATION-GUIDE.md` - **NOVO** Guia de migração
- ✅ `docs/IMPLEMENTATION-STATUS.md` - **NOVO** Status atual
- ✅ `docs/GIT-CHECKLIST.md` - **NOVO** Este arquivo
- ✅ `README.md` - Arquivo principal do projeto

---

## 🚫 **NÃO DEVE IR PRO GIT** ❌

### **Dados Sensíveis**
- ❌ `.env` - **NUNCA COMMITAR** (chaves do Firebase, secrets)
- ❌ `.env.local` - Variáveis locais

### **Arquivos Gerados**
- ❌ `node_modules/` - Dependências (npm install)
- ❌ `dist/` - Build de produção
- ❌ `*.log` - Logs

### **Arquivos Temporários**
- ❌ `TODO.md` - Notas pessoais
- ❌ `.vscode/` - Configurações do editor (exceto extensions.json)

---

## 📝 **IMPORTANTE: .env.example**

Você precisa criar um arquivo `.env.example` (SEM dados reais) para servir de template:

### Criar arquivo:

```bash
# .env.example (na raiz do projeto)

# Firebase Configuration
VITE_FIREBASE_API_KEY=sua-api-key-aqui
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

**⚠️ NUNCA coloque os valores reais no .env.example!**

---

## 🔥 **firestore.rules - VAI PRO GIT?**

✅ **SIM!** O arquivo `firestore.rules` **DEVE** ir pro Git porque:

1. **Não contém dados sensíveis** - São apenas regras de validação
2. **Faz parte do código** - É lógica de segurança do backend
3. **Facilita deploy** - Pode aplicar via Firebase CLI: `firebase deploy --only firestore:rules`
4. **Versionamento** - Histórico de mudanças nas regras

### Como o Firebase CLI usa:

```bash
# firebase.json (se estivesse usando Firebase CLI)
{
  "firestore": {
    "rules": "firestore.rules"
  }
}
```

Por enquanto, você aplica manualmente no console, mas é bom ter no Git.

---

## 🎯 **Resumo Visual**

```
📦 Seu Projeto
├── 📂 src/                        ✅ COMMITAR
│   ├── schemas/userSchema.ts     ✅ NOVO
│   ├── repositories/userRepo...  ✅ NOVO
│   ├── contexts/AuthContext.tsx  ✅ MODIFICADO
│   ├── hooks/useCustomer*.ts     ✅ MODIFICADO
│   ├── pages/Register*.tsx       ✅ MODIFICADO
│   └── pages/MigrateWorkspace... ✅ NOVO (opcional manter)
│
├── 📂 docs/                       ✅ COMMITAR (agora vai!)
│   ├── README.md                 ✅ NOVO
│   ├── MULTI-TENANCY-*.md        ✅ NOVO
│   └── *.md                      ✅ TODOS
│
├── 📄 firestore.rules             ✅ COMMITAR (segurança)
├── 📄 .env.example                ✅ COMMITAR (template)
├── 📄 package.json                ✅ COMMITAR
├── 📄 README.md                   ✅ COMMITAR
│
├── 🚫 .env                        ❌ NÃO COMMITAR (secrets!)
├── 🚫 TODO.md                     ❌ NÃO COMMITAR (pessoal)
├── 🚫 node_modules/               ❌ NÃO COMMITAR (gerado)
└── 🚫 dist/                       ❌ NÃO COMMITAR (build)
```

---

## 🔍 **Verificar antes de commitar:**

```bash
# 1. Ver o que mudou
git status

# 2. Ver diff dos arquivos
git diff

# 3. Verificar se .env NÃO aparece
git status | grep .env
# Deve aparecer apenas .env.example (se criou)

# 4. Verificar se docs/ aparece
git status | grep docs/
# Deve listar os arquivos .md ✅
```

---

## ✅ **Ordem de commit recomendada:**

### Commit 1: Schemas e Repositories
```bash
git add src/schemas/userSchema.ts
git add src/repositories/userRepository.ts
git commit -m "feat: add multi-tenant schemas and user repository"
```

### Commit 2: Context e Hooks
```bash
git add src/contexts/AuthContext.tsx
git add src/hooks/useCustomerDashboard.ts
git add src/hooks/useCustomerHistory.ts
git add src/hooks/useProductRanking.ts
git commit -m "feat: update hooks and context for multi-tenant support"
```

### Commit 3: Páginas
```bash
git add src/pages/*.tsx
git add src/pages/index.ts
git add src/App.tsx
git commit -m "feat: update pages to use workspaceId for multi-tenant"
```

### Commit 4: Configuração
```bash
git add firestore.rules
git add .gitignore
git add .env.example
git commit -m "feat: add Firestore rules and update gitignore"
```

### Commit 5: Documentação
```bash
git add docs/
git commit -m "docs: add complete multi-tenant implementation guide"
```

---

## 📚 **Mensagens de Commit Sugeridas:**

Use o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `refactor:` - Refatoração (sem mudar funcionalidade)
- `chore:` - Tarefas de manutenção

**Exemplos:**
```bash
feat: implement multi-tenant architecture with workspace isolation
feat: add user repository and workspace management
feat: update customer repository with workspace filtering
docs: add comprehensive multi-tenant implementation guide
fix: resolve workspaceId validation in customer creation
```

---

## ⚠️ **IMPORTANTE:**

1. ✅ Sempre commitar `firestore.rules` - É código de segurança
2. ❌ NUNCA commitar `.env` - Contém chaves secretas
3. ✅ Criar `.env.example` - Para outros devs saberem o que precisam
4. ✅ Commitar toda a pasta `docs/` - Recrutadores vão ler

---

**Pronto para commitar?** Siga a ordem acima! 🚀
