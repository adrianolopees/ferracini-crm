# 📚 PLANO DETALHADO: Multi-Tenant com Workspaces

Guia completo com explicações para implementar multi-tenancy no projeto salvar-contatos-loja-v2.

---

## 🧠 PARTE 1: FUNDAMENTOS (Entenda ANTES de codificar)

### 1.1 O que é Multi-Tenancy?

**Multi-tenancy** = **Múltiplos inquilinos** (tenants) compartilhando a mesma aplicação.

**Analogia simples:**

```
🏢 Prédio = Sua aplicação
🚪 Apartamentos = Workspaces
👥 Moradores = Usuários

- Todos moram no mesmo prédio (mesmo código)
- Cada apartamento tem suas próprias coisas (dados isolados)
- Ninguém vê as coisas do vizinho (segurança)
```

**No seu caso:**

- **Workspace "real"** → Dados reais da loja Ferracini
- **Workspace "demo"** → Dados fictícios para recrutadores

### 1.2 Como funciona o isolamento?

**Estratégias comuns:**

| Estratégia                | Como funciona                         | Prós               | Contras                        |
| ------------------------- | ------------------------------------- | ------------------ | ------------------------------ |
| **Database por tenant**   | Cada workspace tem seu próprio banco  | Isolamento máximo  | Caro, difícil de gerenciar     |
| **Schema por tenant**     | Tabelas separadas no mesmo banco      | Bom isolamento     | Complexo com NoSQL             |
| **Coluna discriminadora** | Campo `workspaceId` em cada documento | Simples, eficiente | Precisa de regras de segurança |

**Vamos usar a 3ª** (coluna discriminadora) porque:

- ✅ Firestore não tem schemas/tabelas
- ✅ Mais simples de implementar
- ✅ Melhor custo-benefício
- ✅ Escalável (usado por SaaS gigantes)

### 1.3 Como o Firestore garante segurança?

**3 camadas de proteção:**

```
1. Frontend (React)
   ↓ Filtra dados por workspaceId
   ↓ (mas pode ser burlado via DevTools)

2. Firestore Rules (Backend)
   ↓ VALIDA que workspaceId do documento == workspaceId do usuário
   ↓ (REAL proteção, não pode ser burlada)

3. Custom Claims (Firebase Auth)
   ↓ workspaceId armazenado no TOKEN JWT do usuário
   ↓ (impossível falsificar sem as chaves do Firebase)
```

**Por isso é seguro!** Mesmo que alguém tente modificar o código JS no navegador, as Firestore Rules vão bloquear.

---

## 🚀 PARTE 2: PLANO DE IMPLEMENTAÇÃO (Passo a Passo)

---

## 📋 FASE 1: Criar coleção `users` e preparar schemas

**🎯 Objetivo:** Cada usuário precisa saber a qual workspace pertence.

### 1.1 Criar schema do User

**Onde:** Crie novo arquivo `src/schemas/userSchema.ts`

```typescript
import { z } from 'zod';

// Schema que define o formato dos dados do usuário no Firestore
export const WorkspaceSchema = z.enum(['real', 'demo']);

export const UserSchema = z.object({
  uid: z.string(), // UID vem do Firebase Auth
  email: z.string().email(), // Email do usuário
  workspaceId: WorkspaceSchema, // ← A CHAVE DO MULTI-TENANT
  displayName: z.string().optional(),
  createdAt: z.string(),
});

export const FirebaseUserSchema = UserSchema.omit({ uid: true });

export type User = z.infer<typeof UserSchema>;
export type WorkspaceId = z.infer<typeof WorkspaceSchema>;
```

**💡 Explicação:**

- `WorkspaceSchema`: Define os workspaces permitidos ('real' ou 'demo')
- `UserSchema`: Define como um usuário é armazenado
- `workspaceId`: O campo mágico que separa os ambientes
- `FirebaseUserSchema`: Remove o `uid` porque ele vira o ID do documento

---

### 1.2 Atualizar CustomerSchema para incluir workspaceId

**Onde:** `src/schemas/customerSchema.ts`

```typescript
// Adicione no topo do arquivo:
import { WorkspaceSchema } from './userSchema';

// Modifique o CustomerSchema (adicione essa linha):
export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  model: z.string(),
  reference: z.string(),
  size: z.string(),
  color: z.string(),
  workspaceId: WorkspaceSchema, // ← NOVO CAMPO
  salesperson: z.string().optional(),
  createdAt: z.string(),
  status: CustomerStatusSchema.optional(),
  contactedAt: z.string().nullable().optional(),
  transferredAt: z.string().nullable().optional(),
  completedAt: z.string().optional(),
  sourceStore: z.enum(['Campinas', 'Dom Pedro', 'Jundiaí']).nullable().optional(),
  archived: z.boolean().optional(),
  archiveReason: ArchiveReasonSchema.nullable().optional(),
  archivedAt: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  consultingStore: z.enum(['Campinas', 'Dom Pedro']).nullable().optional(),
  storeHasStock: z.boolean().optional(),
});
```

**💡 Explicação:**

- Agora TODOS os customers têm um `workspaceId`
- Quando você buscar customers, vai filtrar por esse campo
- Isso garante que cada workspace veja apenas seus próprios dados

---

### 1.3 Criar userRepository

**Onde:** Crie `src/repositories/userRepository.ts`

```typescript
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { UserSchema, FirebaseUserSchema, User, WorkspaceId } from '@/schemas/userSchema';
import { getCurrentTimestamp } from '@/utils';

const COLLECTION_NAME = 'users';

/**
 * Busca os dados do usuário no Firestore
 *
 * @param uid - ID do usuário (vem do Firebase Auth)
 * @returns Dados do usuário incluindo workspaceId
 *
 * Essa função é chamada APÓS o login para descobrir
 * qual workspace o usuário pertence.
 */
export async function getUserById(uid: string): Promise<User | null> {
  const docRef = doc(db, COLLECTION_NAME, uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const result = UserSchema.safeParse({ uid: docSnap.id, ...docSnap.data() });
  return result.success ? result.data : null;
}

/**
 * Cria um novo usuário no Firestore
 *
 * @param uid - ID do usuário (do Firebase Auth)
 * @param email - Email do usuário
 * @param workspaceId - Workspace ao qual o usuário pertence
 *
 * Chamado apenas uma vez quando o usuário é criado
 * (você vai fazer isso manualmente no console do Firebase)
 */
export async function createUser(
  uid: string,
  email: string,
  workspaceId: WorkspaceId,
  displayName?: string
): Promise<void> {
  const userData = FirebaseUserSchema.parse({
    email,
    workspaceId,
    displayName: displayName || email.split('@')[0],
    createdAt: getCurrentTimestamp(),
  });

  await setDoc(doc(db, COLLECTION_NAME, uid), userData);
}

/**
 * Busca apenas o workspaceId do usuário
 * Função helper para quando você só precisa do workspace
 */
export async function getUserWorkspace(uid: string): Promise<WorkspaceId | null> {
  const user = await getUserById(uid);
  return user?.workspaceId || null;
}
```

**💡 Explicação:**

- `getUserById`: Busca os dados completos do usuário
- `getUserWorkspace`: Versão otimizada que retorna só o workspaceId
- `createUser`: Você vai usar isso no console do Firebase para criar usuários

**Por que não criar users via interface de cadastro?**

- Por enquanto, você vai criar usuários manualmente no Firebase Console
- Em produção, a empresa controlaria quem pode criar contas
- Para o portfólio, você só precisa de 2 usuários: um real e um demo

---

## 📋 FASE 2: Atualizar AuthContext para gerenciar workspace

**🎯 Objetivo:** Depois que o usuário loga, buscar seu workspaceId e disponibilizar globalmente.

### 2.1 Modificar AuthContext

**Onde:** `src/contexts/AuthContext.tsx`

```typescript
import { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User, UserCredential } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { getUserWorkspace } from '@/repositories/userRepository'; // ← NOVO
import { WorkspaceId } from '@/schemas/userSchema'; // ← NOVO

interface AuthProviderProps {
  children?: ReactNode;
}

export interface AuthContextType {
  user: User | null;
  workspaceId: WorkspaceId | null; // ← NOVO
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  loading: boolean;
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [workspaceId, setWorkspaceId] = useState<WorkspaceId | null>(null); // ← NOVO
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      // ← NOVO: Buscar workspace quando usuário loga
      if (user) {
        const workspace = await getUserWorkspace(user.uid);
        setWorkspaceId(workspace);
      } else {
        setWorkspaceId(null);
      }

      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      setWorkspaceId(null); // ← NOVO: Limpar workspace ao deslogar
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, workspaceId, login, logout, loading, isLoggingOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
```

**💡 Explicação linha por linha:**

```typescript
const [workspaceId, setWorkspaceId] = useState<WorkspaceId | null>(null);
```

- Novo estado para armazenar o workspace do usuário logado
- Disponível para TODA a aplicação via Context

```typescript
if (user) {
  const workspace = await getUserWorkspace(user.uid);
  setWorkspaceId(workspace);
}
```

- Quando o Firebase Auth detecta um usuário logado
- Busca o workspaceId dele no Firestore
- Armazena no estado global

```typescript
setWorkspaceId(null);
```

- Ao deslogar, limpa o workspace
- Garante que a próxima pessoa que logar não veja dados do anterior

---

## 📋 FASE 3: Atualizar CustomerRepository para filtrar por workspace

**🎯 Objetivo:** TODAS as queries devem filtrar por workspaceId automaticamente.

### 3.1 Modificar customerRepository

**Onde:** `src/repositories/customerRepository.ts`

**Mudanças necessárias:**

```typescript
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, query, where } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { CustomerSchema, FirebaseCustomerSchema, Customer, ArchiveReason } from '@/schemas/customerSchema';
import { WorkspaceId } from '@/schemas/userSchema'; // ← NOVO
import { getCurrentTimestamp } from '@/utils';

const COLLECTION_NAME = 'customers';

// ==========================================
//  CRUD - AGORA COM WORKSPACE
// ==========================================

/**
 * Busca todos os customers do workspace atual
 *
 * @param workspaceId - Workspace do usuário logado
 * @returns Lista de customers filtrados por workspace
 *
 * 💡 A mágica acontece aqui: where("workspaceId", "==", workspaceId)
 * Isso garante que você NUNCA veja dados de outro workspace
 */
export async function getAllCustomers(workspaceId: WorkspaceId): Promise<Customer[]> {
  // ← MUDOU: agora precisa receber workspaceId como parâmetro
  const q = query(
    collection(db, COLLECTION_NAME),
    where('workspaceId', '==', workspaceId) // ← NOVO FILTRO
  );

  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => {
      const result = CustomerSchema.safeParse({ id: doc.id, ...doc.data() });
      return result.success ? result.data : null;
    })
    .filter((c): c is Customer => c !== null);
}

/**
 * Cria um novo customer automaticamente no workspace correto
 *
 * @param customer - Dados do customer (sem workspaceId)
 * @param workspaceId - Workspace onde criar o customer
 *
 * 💡 O workspaceId é adicionado automaticamente, o usuário não precisa passar
 */
export async function createCustomer(
  customer: Omit<Customer, 'id' | 'workspaceId'>, // ← MUDOU: remove workspaceId do input
  workspaceId: WorkspaceId // ← NOVO parâmetro
): Promise<string> {
  const validated = FirebaseCustomerSchema.parse({
    ...customer,
    workspaceId, // ← ADICIONA automaticamente o workspace correto
    createdAt: customer.createdAt || getCurrentTimestamp(),
  });

  const docRef = await addDoc(collection(db, COLLECTION_NAME), validated);
  return docRef.id;
}

/**
 * Atualiza um customer (não permite mudar workspaceId)
 */
export async function updateCustomer(id: string, data: Partial<Customer>): Promise<void> {
  const { id: _, workspaceId: __, ...dataWithoutIdAndWorkspace } = data; // ← MUDOU: remove workspaceId também
  const validated = FirebaseCustomerSchema.partial().parse(dataWithoutIdAndWorkspace);
  await updateDoc(doc(db, COLLECTION_NAME, id), validated);
}

/**
 * Delete não precisa de mudanças (Firestore Rules vão proteger)
 */
export async function deleteCustomerById(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
}

// ==========================================
//  QUERIES ESPECÍFICAS - TODAS COM WORKSPACE
// ==========================================

export async function findCustomersByReference(
  reference: string,
  workspaceId: WorkspaceId // ← NOVO parâmetro
): Promise<Customer[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('workspaceId', '==', workspaceId), // ← NOVO FILTRO
    where('reference', '==', reference.toLowerCase())
  );
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => {
      const result = CustomerSchema.safeParse({ id: doc.id, ...doc.data() });
      return result.success ? result.data : null;
    })
    .filter((c): c is Customer => c !== null);
}

export async function findCustomersByModel(
  model: string,
  workspaceId: WorkspaceId // ← NOVO parâmetro
): Promise<Customer[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('workspaceId', '==', workspaceId), // ← NOVO FILTRO
    where('model', '==', model.toLowerCase())
  );
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => {
      const result = CustomerSchema.safeParse({ id: doc.id, ...doc.data() });
      return result.success ? result.data : null;
    })
    .filter((c): c is Customer => c !== null);
}

export async function findArchivedCustomers(
  workspaceId: WorkspaceId // ← NOVO parâmetro
): Promise<Customer[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('workspaceId', '==', workspaceId), // ← NOVO FILTRO
    where('archived', '==', true)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => {
      const result = CustomerSchema.safeParse({ id: doc.id, ...doc.data() });
      return result.success ? result.data : null;
    })
    .filter((c): c is Customer => c !== null);
}

export async function findCompletedCustomers(
  workspaceId: WorkspaceId // ← NOVO parâmetro
): Promise<Customer[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('workspaceId', '==', workspaceId), // ← NOVO FILTRO
    where('status', '==', 'completed')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => {
      const result = CustomerSchema.safeParse({ id: doc.id, ...doc.data() });
      return result.success ? result.data : null;
    })
    .filter((c): c is Customer => c !== null);
}

// ==========================================
// OPERAÇÕES ESPECÍFICAS DE NEGÓCIO (não mudam)
// ==========================================

export async function archiveCustomerById(id: string, reason: ArchiveReason, notes?: string): Promise<void> {
  await updateCustomer(id, {
    archived: true,
    archiveReason: reason,
    archivedAt: getCurrentTimestamp(),
    notes: notes || '',
  });
}

export async function restoreCustomerById(id: string, status: Customer['status'] = 'readyForPickup'): Promise<void> {
  await updateCustomer(id, {
    archived: false,
    archiveReason: null,
    archivedAt: null,
    notes: null,
    status,
    contactedAt: getCurrentTimestamp(),
  });
}
```

**💡 Explicação do padrão:**

**ANTES (sem multi-tenant):**

```typescript
getAllCustomers(); // Retorna TODOS os customers
```

**DEPOIS (com multi-tenant):**

```typescript
getAllCustomers(workspaceId); // Retorna só os do workspace
// onde("workspaceId", "==", workspaceId)
```

**Por que isso funciona?**

1. Usuário loga → AuthContext busca seu workspaceId
2. Componente chama `getAllCustomers(workspaceId)`
3. Query filtra apenas customers daquele workspace
4. Firestore Rules validam que o request.auth.token.workspaceId bate

---

## 📋 FASE 4: Atualizar todos os hooks e componentes

**🎯 Objetivo:** Passar o workspaceId do contexto para todas as chamadas do repository.

### 4.1 Padrão a seguir em TODOS os lugares

**ANTES:**

```typescript
const customers = await getAllCustomers();
```

**DEPOIS:**

```typescript
const { workspaceId } = useAuth();
const customers = await getAllCustomers(workspaceId);
```

### 4.2 Exemplo: Atualizar useCustomerDashboard

**Onde:** `src/hooks/useCustomerDashboard.ts`

```typescript
import { useState, useEffect } from 'react';
import { getAllCustomers } from '@/repositories';
import { Customer } from '@/schemas/customerSchema';
import { useAuth } from './useAuth'; // ← ADICIONAR

// ... interfaces existentes ...

export function useCustomerDashboard() {
  const { workspaceId } = useAuth(); // ← NOVO
  const [dashboard, setDashboard] = useState<CustomerDashboard>({
    lists: { pending: [], awaitingTransfer: [], readyForPickup: [], longWait: [] },
    metrics: { total: 0, pending: 0, awaitingTransfer: 0, readyForPickup: 0, longWait: 0, averageWaitTime: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      // ← ADICIONAR: só carregar se tiver workspaceId
      if (!workspaceId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const customers = await getAllCustomers(workspaceId); // ← PASSAR workspaceId

        // ... resto do código permanece igual ...
      } catch (err) {
        setError('Erro ao carregar dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [workspaceId]); // ← ADICIONAR workspaceId nas dependências

  return { dashboard, loading, error };
}
```

**💡 Explicação:**

- `const { workspaceId } = useAuth()`: Busca o workspace do contexto
- `if (!workspaceId)`: Não tenta carregar sem workspace (evita erro)
- `getAllCustomers(workspaceId)`: Passa o workspace para o repository
- `[workspaceId]`: Se o workspace mudar (logout/login), recarrega dados

### 4.3 Lista de arquivos para atualizar

Você precisa fazer a mesma mudança em:

1. ✅ `src/hooks/useCustomerDashboard.ts` (exemplo acima)
2. ✅ `src/hooks/useCustomerHistory.ts`
3. ✅ `src/pages/Dashboard.tsx`
4. ✅ `src/pages/History.tsx`
5. ✅ `src/pages/RegisterCustomer.tsx`
6. ✅ `src/pages/SearchCustomers.tsx`
7. ✅ `src/services/customerActionService.ts`
8. ✅ `src/components/dashboard/WorkflowCard.tsx`

**Padrão sempre o mesmo:**

```typescript
// No topo do arquivo
import { useAuth } from '@/hooks/useAuth';

// No componente/hook
const { workspaceId } = useAuth();

// Antes de chamar qualquer função do repository
if (!workspaceId) return; // ou outra lógica de proteção

// Ao chamar funções
await getAllCustomers(workspaceId);
await createCustomer(customerData, workspaceId);
await findArchivedCustomers(workspaceId);
```

---

## 📋 FASE 5: Firestore Security Rules

**🎯 Objetivo:** A VERDADEIRA proteção. Mesmo que alguém burle o front-end, as regras do Firestore bloqueiam.

### 5.1 Entendendo Firestore Rules

**Firestore Rules = Firewall do seu banco de dados**

```
┌─────────────────┐
│   Frontend      │  ← Pode ser hackeado (DevTools, Postman, etc)
└────────┬────────┘
         │ Request com workspaceId
         ↓
┌─────────────────┐
│ Firestore Rules │  ← VALIDA se o usuário pode acessar
└────────┬────────┘
         │ Autorizado?
         ↓
┌─────────────────┐
│   Firestore DB  │  ← Dados seguros
└─────────────────┘
```

**Como as regras sabem o workspaceId do usuário?**

Você vai criar um documento na coleção `users` com o workspaceId. As regras vão ler esse documento para validar.

### 5.2 Regras básicas (versão 1 - simples)

**Onde:** Firebase Console → Firestore Database → Rules

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function: verifica se o usuário está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function: busca o workspaceId do usuário
    function getUserWorkspace() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.workspaceId;
    }

    // Regras para coleção 'users'
    match /users/{userId} {
      // Usuários podem ler apenas seus próprios dados
      allow read: if isAuthenticated() && request.auth.uid == userId;

      // Ninguém pode criar/atualizar users pelo client (só via Admin SDK ou console)
      allow write: if false;
    }

    // Regras para coleção 'customers'
    match /customers/{customerId} {
      // Pode ler se:
      // 1. Está autenticado
      // 2. O workspaceId do documento == workspaceId do usuário
      allow read: if isAuthenticated()
                  && resource.data.workspaceId == getUserWorkspace();

      // Pode criar se:
      // 1. Está autenticado
      // 2. Está criando no SEU workspace (não pode criar em outro)
      allow create: if isAuthenticated()
                    && request.resource.data.workspaceId == getUserWorkspace();

      // Pode atualizar/deletar se:
      // 1. Está autenticado
      // 2. O documento pertence ao SEU workspace
      // 3. Não está tentando mudar o workspaceId
      allow update, delete: if isAuthenticated()
                            && resource.data.workspaceId == getUserWorkspace()
                            && request.resource.data.workspaceId == resource.data.workspaceId;
    }
  }
}
```

**💡 Explicação linha por linha:**

```javascript
function getUserWorkspace() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.workspaceId;
}
```

- `get(...)`: Busca um documento no Firestore
- `/users/$(request.auth.uid)`: Documento do usuário atual
- `.data.workspaceId`: Pega o campo workspaceId
- **IMPORTANTE:** Essa função faz uma leitura extra (conta no plano gratuito)

```javascript
allow read: if isAuthenticated()
            && resource.data.workspaceId == getUserWorkspace();
```

- `isAuthenticated()`: Usuário está logado?
- `resource.data`: Dados do documento que está tentando ler
- `getUserWorkspace()`: Workspace do usuário logado
- Só permite se os dois workspaces baterem

```javascript
allow create: if isAuthenticated()
              && request.resource.data.workspaceId == getUserWorkspace();
```

- `request.resource.data`: Dados que o usuário está tentando criar
- Garante que o usuário está criando no próprio workspace

```javascript
&& request.resource.data.workspaceId == resource.data.workspaceId;
```

- Impede que alguém atualize um customer e mude o workspace dele
- Ex: não pode pegar um customer "demo" e mover para "real"

### 5.3 Testando as regras

**No Firebase Console:**

1. Vá em **Firestore Database** → **Rules**
2. Clique em **Rules Playground** (simulador)
3. Teste cenários:

**Teste 1: Leitura autorizada**

```
Location: /customers/abc123
Read: true
Auth: uid123 (com documento em /users/uid123 = {workspaceId: "demo"})
Document data: {workspaceId: "demo", name: "Test"}

Resultado: ✅ Permitido (workspace bate)
```

**Teste 2: Leitura negada**

```
Location: /customers/xyz789
Read: true
Auth: uid123 (workspace: "demo")
Document data: {workspaceId: "real", name: "Cliente Real"}

Resultado: ❌ Negado (workspaces diferentes)
```

---

## 📋 FASE 6: Criar usuários e popular dados

**🎯 Objetivo:** Criar contas de teste e popular com dados demo.

### 6.1 Criar usuários no Firebase Console

**Passo a passo:**

1. **Firebase Console** → **Authentication** → **Users** → **Add user**

2. **Criar usuário REAL:**
   - Email: `seu-email-real@gmail.com`
   - Password: `senha-segura-123`
   - Copie o **UID** gerado (ex: `dH7jKx9pLmN2...`)

3. **Criar usuário DEMO:**
   - Email: `demo@ferracini.com`
   - Password: `demo123456`
   - Copie o **UID** gerado

4. **Ir para Firestore** → **Adicionar coleção** → Nome: `users`

5. **Criar documento para usuário REAL:**
   - Document ID: `zZTYRSzTnyUwvoGFS2y8MtqgCqu2` (o UID copiado)
   - Campos:
     ```
     email: "seu-email-real@gmail.com"
     workspaceId: "real"
     displayName: "Seu Nome"
     createdAt: "2025-01-26T10:00:00.000Z"
     ```

6. **Criar documento para usuário DEMO:**
   - Document ID: `zHJ3c9gsixazGoYZiPf0F7ADlWx1`
   - Campos:
     ```
     email: "demo@lojacrm.com"
     workspaceId: "demo"
     displayName: "Usuário Demo"
     createdAt: "2025-01-26T10:00:00.000Z"
     ```

### 6.2 Script para popular dados demo

**Onde:** Crie `scripts/populateDemoData.ts`

```typescript
/**
 * Script para popular dados demo no Firestore
 *
 * USO: Execute diretamente no console do navegador após logar com conta demo
 *
 * 1. Logue com demo@ferracini.com
 * 2. Abra DevTools (F12)
 * 3. Cole esse script no Console
 * 4. Aperte Enter
 */

import { createCustomer } from '@/repositories/customerRepository';

// Dados fictícios mas realistas
const demoCustomers = [
  {
    name: 'João Silva',
    phone: '(19) 98765-4321',
    model: 'oxford',
    reference: 'ref-5432',
    size: '42',
    color: 'preto',
    salesperson: 'Maria Santos',
    status: 'pending' as const,
    consultingStore: 'Campinas' as const,
    storeHasStock: false,
  },
  {
    name: 'Ana Costa',
    phone: '(19) 91234-5678',
    model: 'social',
    reference: 'ref-7890',
    size: '38',
    color: 'marrom',
    salesperson: 'João Pedro',
    status: 'readyForPickup' as const,
    consultingStore: 'Dom Pedro' as const,
    storeHasStock: true,
  },
  {
    name: 'Carlos Mendes',
    phone: '(19) 99876-5432',
    model: 'casual',
    reference: 'ref-1234',
    size: '41',
    color: 'azul',
    salesperson: 'Maria Santos',
    status: 'awaitingTransfer' as const,
    consultingStore: 'Campinas' as const,
    sourceStore: 'Jundiaí' as const,
    storeHasStock: false,
  },
  // ... adicione mais 10-15 clientes demo
];

// Função para executar
async function populateDemoData() {
  console.log('🚀 Iniciando população de dados demo...');

  for (const customer of demoCustomers) {
    try {
      const id = await createCustomer(customer, 'demo');
      console.log(`✅ Cliente criado: ${customer.name} (${id})`);
    } catch (error) {
      console.error(`❌ Erro ao criar ${customer.name}:`, error);
    }
  }

  console.log('🎉 Dados demo populados com sucesso!');
}

// Executar
populateDemoData();
```

**Como usar:**

1. Compile o projeto: `npm run build`
2. Logue com `demo@ferracini.com`
3. Abra DevTools (F12) → Console
4. Cole o código acima
5. Aperte Enter

**Alternativa manual:**

- Ir no Firestore Console
- Adicionar documentos manualmente na coleção `customers`
- Sempre colocar `workspaceId: "demo"`

---

## 📋 FASE 7: Adicionar indicador visual de workspace

**🎯 Objetivo:** Deixar claro quando está no modo demo.

### 7.1 Criar componente WorkspaceBadge

**Onde:** Crie `src/components/ui/WorkspaceBadge.tsx`

```typescript
import { useAuth } from '@/hooks/useAuth';

export function WorkspaceBadge() {
  const { workspaceId } = useAuth();

  if (workspaceId !== 'demo') {
    return null; // Não mostra nada no workspace real
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg font-bold">
        🎭 MODO DEMONSTRAÇÃO
      </div>
    </div>
  );
}
```

### 7.2 Adicionar no layout principal

**Onde:** `src/App.tsx` ou `src/components/ui/PageLayout.tsx`

```typescript
import { WorkspaceBadge } from '@/components/ui/WorkspaceBadge';

export function App() {
  return (
    <>
      <WorkspaceBadge /> {/* ← Adicionar aqui */}
      {/* ... resto do app */}
    </>
  );
}
```

**💡 Explicação:**

- Badge só aparece quando `workspaceId === 'demo'`
- Recrutadores vão ver claramente que é ambiente de demonstração
- Não interfere na experiência do usuário real

---

## 📋 FASE 8: Criar índices compostos no Firestore

**🎯 Objetivo:** Otimizar queries que filtram por múltiplos campos.

### 8.1 Por que índices são necessários?

Quando você faz queries como:

```typescript
where('workspaceId', '==', 'demo').where('status', '==', 'pending');
```

O Firestore precisa de um **índice composto** (combinação de campos).

### 8.2 Como criar índices

**Método 1: Automático (recomendado)**

1. Rode a aplicação
2. Faça uma query que precisa de índice
3. O Firestore vai mostrar erro no console com um LINK
4. Clique no link → índice criado automaticamente

**Método 2: Manual**

1. Firebase Console → Firestore → **Indexes** → **Composite**
2. Clique em **Create Index**
3. Coleção: `customers`
4. Campos:
   - `workspaceId` (Ascending)
   - `status` (Ascending)
5. Query scope: Collection
6. Criar

**Índices recomendados para seu projeto:**

| Coleção   | Campos                  | Por quê                     |
| --------- | ----------------------- | --------------------------- |
| customers | workspaceId + status    | Dashboard filtra por status |
| customers | workspaceId + archived  | Página History              |
| customers | workspaceId + reference | Busca por referência        |
| customers | workspaceId + model     | Busca por modelo            |
| customers | workspaceId + createdAt | Ordenar por data            |

---

## 🧪 PARTE 3: TESTES E VALIDAÇÃO

---

## 📋 FASE 9: Checklist de testes

**🎯 Objetivo:** Garantir que tudo funciona e está seguro.

### 9.1 Testes funcionais

**✅ Teste 1: Isolamento de dados**

```
1. Logue com conta REAL
2. Crie 3 customers
3. Faça logout
4. Logue com conta DEMO
5. Verifique: Não deve ver os customers reais
6. Crie 2 customers demo
7. Faça logout
8. Logue com conta REAL
9. Verifique: Não deve ver os customers demo
```

**✅ Teste 2: Todas as queries**

```
1. Logue com conta DEMO
2. Teste cada funcionalidade:
   - Dashboard mostra só customers demo
   - Criar customer cria no workspace demo
   - Buscar por referência busca só no demo
   - Arquivar customer funciona
   - History mostra só customers demo
```

**✅ Teste 3: Firestore Rules**

```
1. Abra DevTools (F12) → Network
2. Logue com conta DEMO
3. No Console, tente forçar uma query "proibida":

   getDocs(collection(db, 'customers'))
   // (sem filtro de workspace)

4. Deve dar erro: "permission-denied"
5. Agora tente com filtro correto:

   getDocs(query(
     collection(db, 'customers'),
     where('workspaceId', '==', 'demo')
   ))

6. Deve funcionar ✅
```

### 9.2 Testes de segurança

**🔒 Teste 1: Tentativa de burlar pelo front**

```javascript
// No console do navegador, tente:
const fakeWorkspace = 'real'; // Usuário demo tentando acessar dados reais
const q = query(collection(db, 'customers'), where('workspaceId', '==', fakeWorkspace));
const result = await getDocs(q);

// RESULTADO ESPERADO: Erro de permissão
// Por quê? As Firestore Rules validam getUserWorkspace()
```

**🔒 Teste 2: Tentativa de criar em outro workspace**

```javascript
// Logado como demo, tente criar no workspace real:
await addDoc(collection(db, 'customers'), {
  name: 'Hacker',
  workspaceId: 'real', // Tentando criar no workspace errado
  // ... outros campos
});

// RESULTADO ESPERADO: Erro de permissão
// Por quê? A regra valida: request.resource.data.workspaceId == getUserWorkspace()
```

**🔒 Teste 3: Tentativa de mudar workspace**

```javascript
// Tente atualizar um customer demo para workspace real:
await updateDoc(doc(db, 'customers', 'demoCustomerId'), {
  workspaceId: 'real', // Tentando mover para outro workspace
});

// RESULTADO ESPERADO: Erro de permissão
// Por quê? A regra impede mudar workspaceId em updates
```

---

## 📚 PARTE 4: EXTRAS E BOAS PRÁTICAS

---

## 📋 FASE 10: Melhorias opcionais

### 10.1 Custom Claims (nível avançado)

**O que é?** Armazenar o workspaceId no TOKEN JWT do usuário.

**Vantagens:**

- ✅ Firestore Rules mais rápidas (não precisa fazer `get(...)` na coleção users)
- ✅ WorkspaceId disponível sem buscar no Firestore
- ✅ Mais seguro (impossível falsificar)

**Desvantagens:**

- ❌ Requer Firebase Admin SDK (não funciona no client)
- ❌ Precisa de Cloud Functions ou backend Node.js

**Como implementar (resumo):**

1. Criar Cloud Function:

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Trigger: quando usuário é criado
export const setUserClaims = functions.auth.user().onCreate(async (user) => {
  // Buscar workspaceId do Firestore
  const userDoc = await admin.firestore().doc(`users/${user.uid}`).get();
  const workspaceId = userDoc.data()?.workspaceId;

  // Adicionar ao token
  await admin.auth().setCustomUserClaims(user.uid, { workspaceId });
});
```

2. Atualizar Firestore Rules:

```javascript
function getUserWorkspace() {
  return request.auth.token.workspaceId; // Agora vem direto do token
}
```

**Por enquanto, não precisa disso.** A abordagem com `get(...)` funciona perfeitamente para seu caso.

---

### 10.2 Adicionar mais workspaces no futuro

**Cenário:** Você quer adicionar workspace "staging" (homologação).

**Mudanças necessárias:**

1. Atualizar schema:

```typescript
export const WorkspaceSchema = z.enum(['real', 'demo', 'staging']);
```

2. Criar usuário staging no Firebase Auth
3. Criar documento em `/users/{uid}` com `workspaceId: "staging"`
4. Pronto! O código já funciona para 3+ workspaces

**Escalando para multi-empresa:**

Se cada empresa tivesse seu workspace:

```typescript
export const WorkspaceSchema = z.string(); // Aceita qualquer string

// Exemplos:
workspaceId: 'empresa-abc';
workspaceId: 'empresa-xyz';
workspaceId: 'loja-campinas';
```

---

### 10.3 Página de Admin (opcional)

**Criar interface para gerenciar workspaces:**

```typescript
// Apenas para usuários admin
function AdminPanel() {
  const [users, setUsers] = useState([]);

  // Listar todos os usuários e seus workspaces
  // Permitir trocar workspace de um usuário
  // Criar novos workspaces
}
```

**Firestore Rules:**

```javascript
match /users/{userId} {
  allow read, write: if request.auth.token.role == 'admin';
}
```

---

## 📋 FASE 11: Documentação final

### 11.1 Atualizar README.md

**Adicione seção no README:**

```markdown
## 🎭 Modo Demonstração

Este projeto suporta múltiplos ambientes (multi-tenancy) para separar dados reais de dados de demonstração.

### Acessar modo demo

Use as seguintes credenciais para acessar o ambiente de demonstração:

- **Email:** demo@ferracini.com
- **Senha:** demo123456

O modo demo contém dados fictícios e é seguro para exploração.

### Arquitetura Multi-Tenant

- Dados são isolados por `workspaceId` (campo em cada documento)
- Firestore Rules garantem que usuários só acessam seu próprio workspace
- Não há risco de cruzamento de dados entre ambientes

Para mais detalhes técnicos, veja [docs/multi-tenancy.md](docs/multi-tenancy.md)
```

### 11.2 Diagrama de Arquitetura

```
┌─────────────────────────────────────────┐
│          Firebase Auth                   │
│  (user.uid, email)                       │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│     Firestore: /users/{uid}              │
│  {email, workspaceId, displayName}       │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│        AuthContext                       │
│  (user, workspaceId)                     │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│     Todas as queries incluem:            │
│  where("workspaceId", "==", workspace)   │
└─────────────────────────────────────────┘
```

---

## 🎯 RESUMO EXECUTIVO

### Checklist de implementação

Use esta lista para acompanhar o progresso:

- [ ] **FASE 1:** Criar schemas (userSchema, atualizar customerSchema)
- [ ] **FASE 2:** Criar userRepository
- [ ] **FASE 3:** Atualizar AuthContext com workspaceId
- [ ] **FASE 4:** Atualizar customerRepository com filtros
- [ ] **FASE 5:** Atualizar hooks (useCustomerDashboard, useCustomerHistory)
- [ ] **FASE 6:** Atualizar páginas (Dashboard, History, Register, Search)
- [ ] **FASE 7:** Atualizar serviços (customerActionService)
- [ ] **FASE 8:** Implementar Firestore Rules
- [ ] **FASE 9:** Criar usuários no Firebase Console
- [ ] **FASE 10:** Popular dados demo
- [ ] **FASE 11:** Adicionar WorkspaceBadge
- [ ] **FASE 12:** Criar índices compostos
- [ ] **FASE 13:** Testes funcionais
- [ ] **FASE 14:** Testes de segurança
- [ ] **FASE 15:** Atualizar README
- [ ] **FASE 16:** Documentação técnica

### Tempo estimado

- Desenvolvimento: **4-6 horas**
- Testes: **1-2 horas**
- Documentação: **1 hora**
- **Total: 6-9 horas**

### Ordem de implementação recomendada

1. **Dia 1 (2-3h):** Fases 1-3 (schemas + repositories + context)
2. **Dia 2 (2-3h):** Fases 4-7 (atualizar hooks, páginas, serviços)
3. **Dia 3 (2-3h):** Fases 8-16 (segurança, dados, testes, docs)

---

## ❓ FAQ - Dúvidas Comuns

### 1. E se eu esquecer de passar workspaceId em alguma query?

**R:** TypeScript vai reclamar! As funções agora exigem o parâmetro:

```typescript
getAllCustomers(); // ❌ ERRO: Expected 1 argument
getAllCustomers(workspaceId); // ✅ OK
```

### 2. As Firestore Rules consomem leituras do plano gratuito?

**R:** Sim. Cada `get(/databases/.../users/...)` conta como 1 leitura. Mas:

- Plano gratuito: 50.000 leituras/dia
- Para 100 usuários com 20 queries/dia = 2.000 leituras/dia
- Muito abaixo do limite

### 3. Posso ter 3+ workspaces?

**R:** Sim! Basta:

1. Adicionar no `WorkspaceSchema`
2. Criar usuários com o novo workspaceId
3. Código funciona automaticamente

### 4. Como migrar dados existentes?

**R:** Se você já tem customers sem workspaceId:

```typescript
// Script de migração
const batch = writeBatch(db);
const snapshot = await getDocs(collection(db, 'customers'));

snapshot.docs.forEach((doc) => {
  batch.update(doc.ref, { workspaceId: 'real' });
});

await batch.commit();
```

### 5. Preciso duplicar Firestore Rules para cada coleção?

**R:** Sim, mas pode criar funções helper:

```javascript
function canAccessWorkspace(workspace) {
  return getUserWorkspace() == workspace;
}

match /customers/{doc} {
  allow read: if canAccessWorkspace(resource.data.workspaceId);
}

match /orders/{doc} {
  allow read: if canAccessWorkspace(resource.data.workspaceId);
}
```

---

## 🎓 CONCEITOS APRENDIDOS

Após implementar, você terá dominado:

✅ **Multi-tenancy** (padrão usado por SaaS enterprise)
✅ **Firestore Security Rules** (proteção backend real)
✅ **Context API** + estado global compartilhado
✅ **Repository Pattern** com filtros dinâmicos
✅ **Type safety** com TypeScript + Zod
✅ **Firebase Auth** + Custom data
✅ **Índices compostos** para performance
✅ **Arquitetura escalável** (adicionar workspaces é trivial)

---

## 📞 Próximos Passos

Após ler este guia, você pode:

1. **Começar pela FASE 1** (criar schemas)
2. **Seguir a ordem das fases** sequencialmente
3. **Usar o checklist** para acompanhar progresso
4. **Testar cada fase** antes de avançar
5. **Consultar FAQ** quando tiver dúvidas

Boa implementação! 🚀
