# 📚 Plano de Estudo: Lojas Dinâmicas (7 Dias)

## 🎯 Objetivo Final
Permitir que cada workspace configure suas próprias lojas (nome, telefone, cor) de forma dinâmica, e definir uma loja padrão para operações não-transferência.

---

## 🏗️ Decisões Arquiteturais Tomadas

✅ **Estrutura de Dados**: Array dentro do documento do workspace
- Collection: `workspace_settings`
- Document ID: `{workspaceId}`
- Campo: `stores: Store[]`

✅ **Permissões**: Qualquer usuário do workspace pode editar
- Validado via Firestore Rules (mesmo workspaceId)

✅ **Loja Padrão**: Via EMAIL do usuário do Firebase Auth
- Padrão de email: `ferracini@{nome-da-loja}.com`
- Exemplos reais:
  - `ferracini@maxi.com` → Loja Maxi Shopping (Jundiaí) - LOJA PADRÃO
  - `ferracini@campinas.com` → Loja Campinas Shopping
  - `ferracini@dompedro.com` → Loja Dom Pedro Shopping
- Cada loja tem campo `userEmail` correspondente ao email no Firebase Auth
- **Usuários são gerenciados manualmente via Firebase Console (não há auto-registro)**
- Vantagens:
  - ✅ Padrão de nomenclatura consistente
  - ✅ Fácil identificar loja pelo email
  - ✅ Multi-login: vários vendedores podem usar mesmo email (compartilhar login)
  - ✅ Sincronização real-time: desktop + mobile simultâneos

✅ **Ordenação**: Ordem alfabética (sem drag-and-drop)

---

## 📅 DIA 1: Schema Zod e Estrutura de Dados

### 🎓 **O que você vai aprender:**
- Como usar Zod para validação de tipos e runtime
- Como estruturar tipos TypeScript para Firestore
- Regex para validação de telefone brasileiro
- Validação de cores hexadecimais

### 📝 **Tarefas:**
1. Criar arquivo `src/schemas/storeSettingsSchema.ts`
2. Definir `StoreSchema` com validações
3. Definir `StoreSettingsSchema` (document completo)
4. Criar tipos TypeScript derivados

### 📖 **Conceitos a estudar antes:**

**Zod Basics:**
```typescript
import { z } from 'zod';

// Schema simples
const UserSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  age: z.number().min(18, 'Deve ser maior de idade'),
});

// Inferir tipo TypeScript do schema
type User = z.infer<typeof UserSchema>;

// Validar dados
const result = UserSchema.safeParse({ name: 'João', age: 25 });
if (result.success) {
  console.log(result.data); // { name: 'João', age: 25 }
} else {
  console.log(result.error.errors); // Array de erros
}
```

**Regex para Telefone:**
```typescript
// Formato: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;

// Exemplos válidos:
// "(19) 98221-5561" ✅
// "(11) 3456-7890" ✅
// "1998221556" ❌
```

**Regex para Cor Hexadecimal:**
```typescript
// Formato: #RRGGBB (case insensitive)
const colorRegex = /^#[0-9A-F]{6}$/i;

// Exemplos válidos:
// "#3B82F6" ✅
// "#ff0000" ✅
// "blue" ❌
```

### ✍️ **Exercício Prático:**

Crie o schema seguindo este modelo:

```typescript
import { z } from 'zod';

// Schema para uma loja individual
export const StoreSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Formato inválido'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve ser hexadecimal'),
  userEmail: z.string().email('Email inválido'), // Email do usuário (Firebase Auth) responsável por essa loja
});

export type Store = z.infer<typeof StoreSchema>;

// Schema para configurações do workspace
export const StoreSettingsSchema = z.object({
  workspaceId: z.string(), // Ajustar se tiver WorkspaceSchema
  stores: z.array(StoreSchema).min(1, 'Deve ter pelo menos 1 loja'),
  updatedAt: z.date(),
  updatedBy: z.string().email(),
});

export type StoreSettings = z.infer<typeof StoreSettingsSchema>;

// Schema para criar/editar loja (sem ID gerado ainda)
export const CreateStoreSchema = StoreSchema.omit({ id: true });
export type CreateStore = z.infer<typeof CreateStoreSchema>;
```

### 💡 **Como funciona a Loja Padrão via Email do Firebase Auth:**

Cada loja tem um campo `userEmail` que corresponde ao email de um usuário cadastrado no Firebase Auth.

**Fluxo:**
1. Usuário faz login no Firebase Auth com email `ferracini@maxi.com`
2. Sistema busca todas as stores do workspace
3. Encontra a store onde `store.userEmail === user.email`
4. Essa é a loja padrão do usuário logado!

**Exemplo de uso no código:**
```typescript
const { stores, getDefaultStore } = useStoreSettings();
const { user } = useAuth();

// Encontrar loja padrão do usuário logado
const defaultStore = getDefaultStore();
// OU manualmente:
// const defaultStore = stores.find(store => store.userEmail === user.email);

// Usar em notificações
if (defaultStore) {
  notifyProductArrived(customer, defaultStore);
} else {
  console.error('Usuário não tem loja padrão configurada!');
}
```

**Estrutura de dados:**
```typescript
// Firestore: workspace_settings/real
{
  workspaceId: "real",
  stores: [
    {
      id: "maxi",
      name: "Maxi Shopping (Jundiaí)",
      phone: "(XX) XXXXX-XXXX",
      color: "#F59E0B",
      userEmail: "ferracini@maxi.com" // ← Email do usuário no Firebase Auth
    },
    {
      id: "campinas",
      name: "Campinas Shopping",
      phone: "(19) 98221-5561",
      color: "#3B82F6",
      userEmail: "ferracini@campinas.com" // ← Outro usuário
    }
  ]
}

// Firebase Auth: users
- ferracini@maxi.com (usuário 1)
- ferracini@campinas.com (usuário 2)
```

**Vantagens:**
- ✅ Automático: cada usuário já sabe sua loja pelo email do Auth
- ✅ Simples: não precisa configuração extra
- ✅ Seguro: usa autenticação do Firebase
- ✅ Multi-usuário: cada funcionário tem sua loja específica

### 🤔 **Perguntas para reflexão:**
1. Por que usar `.min(1)` no array de stores?
2. Por que ter `CreateStoreSchema` separado de `StoreSchema`?
3. O que acontece se o regex falhar? Como capturar esse erro?
4. E se um usuário fizer login com email que não corresponde a nenhuma loja?

### 📦 **Entregável do Dia 1:**
- [ ] Arquivo `storeSettingsSchema.ts` criado
- [ ] Testes manuais no console do navegador validando schemas

---

## 📅 DIA 2: Repository Layer (Firestore CRUD)

### 🎓 **O que você vai aprender:**
- Como estruturar camada de acesso a dados (Repository Pattern)
- Firestore SDK: `getDoc`, `setDoc`, `updateDoc`, `onSnapshot`
- Como converter Timestamps do Firestore para Date
- Error handling e validação de dados vindos do banco

### 📝 **Tarefas:**
1. Criar arquivo `src/repositories/storeSettingsRepository.ts`
2. Implementar `getStoreSettings(workspaceId)`
3. Implementar `addStore(workspaceId, store, userEmail)`
4. Implementar `updateStore(workspaceId, storeId, updates, userEmail)`
5. Implementar `removeStore(workspaceId, storeId, userEmail)`
6. Implementar `onStoreSettingsChange(workspaceId, callback)` (listener real-time)

### 📖 **Conceitos a estudar antes:**

**Repository Pattern:**
```
┌─────────────┐
│  Component  │  <-- Chama hook
└──────┬──────┘
       │
┌──────▼──────┐
│    Hook     │  <-- Gerencia estado React
└──────┬──────┘
       │
┌──────▼──────┐
│ Repository  │  <-- Faz operações no Firestore
└──────┬──────┘
       │
┌──────▼──────┐
│  Firestore  │
└─────────────┘
```

**Firestore Operations:**
```typescript
import { db } from '../services/firebase';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';

// Ler documento
const docRef = doc(db, 'workspace_settings', workspaceId);
const docSnap = await getDoc(docRef);
if (docSnap.exists()) {
  const data = docSnap.data();
}

// Criar/Atualizar (merge = não sobrescreve campos não mencionados)
await setDoc(docRef, { stores: [...] }, { merge: true });

// Atualizar campos específicos
await updateDoc(docRef, {
  stores: newStoresArray,
  updatedAt: Timestamp.now()
});

// Listener real-time
const unsubscribe = onSnapshot(docRef, (snapshot) => {
  const data = snapshot.data();
  callback(data);
});

// Cleanup (useEffect)
return () => unsubscribe();
```

**Converter Timestamps:**
```typescript
// Firestore retorna Timestamp, Zod espera Date
const data = docSnap.data();
const parsed = StoreSettingsSchema.parse({
  ...data,
  updatedAt: data.updatedAt?.toDate(), // Timestamp → Date
});
```

### ✍️ **Exercício Prático:**

Implemente a função `addStore`:

```typescript
export async function addStore(
  workspaceId: string,
  store: CreateStore,
  userEmail: string
): Promise<Store> {
  try {
    // 1. Gerar ID único para a nova store
    const storeId = `store-${Date.now()}`;

    // 2. Criar objeto Store completo (com ID)
    const newStore: Store = {
      ...store,
      id: storeId,
    };

    // 3. Buscar settings atuais do workspace
    const currentSettings = await getStoreSettings(workspaceId);
    if (!currentSettings) {
      throw new Error('Workspace não encontrado');
    }

    // 4. Adicionar nova store ao array
    const updatedStores = [...currentSettings.stores, newStore];

    // 5. Atualizar no Firestore
    const docRef = doc(db, 'workspace_settings', workspaceId);
    await updateDoc(docRef, {
      stores: updatedStores,
      updatedAt: Timestamp.now(),
      updatedBy: userEmail,
    });

    // 6. Retornar a nova store criada
    return newStore;
  } catch (error) {
    console.error('Error adding store:', error);
    throw error;
  }
}
```

### 🤔 **Perguntas para reflexão:**
1. Por que usar `Date.now()` para gerar ID? Há riscos de colisão?
2. Por que buscar settings atuais antes de adicionar? Não poderia fazer array push direto?
3. O que acontece se dois usuários adicionarem uma store ao mesmo tempo?
4. Como o `onSnapshot` detecta mudanças? Ele fica fazendo polling?

### 📦 **Entregável do Dia 2:**
- [ ] Arquivo `storeSettingsRepository.ts` com todas as funções
- [ ] Teste manual: criar documento no Firestore Console e buscar via `getStoreSettings`

---

## 📅 DIA 3: Hook Customizado (useStoreSettings)

### 🎓 **O que você vai aprender:**
- Como criar hooks customizados no React
- Padrão de separação: state + mutations + utilities
- Como integrar listeners real-time com useEffect
- Cleanup de listeners para evitar memory leaks

### 📝 **Tarefas:**
1. Criar arquivo `src/hooks/useStoreSettings.ts`
2. Implementar estado (settings, stores, loading, error)
3. Implementar useEffect com listener real-time
4. Criar wrappers para mutations (addStore, updateStore, removeStore)
5. Criar utilities (getStoreById, getStoreByName)

### 📖 **Conceitos a estudar antes:**

**Anatomia de um Hook Customizado:**
```typescript
function useCustomHook() {
  // 1. Estado local
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. Side effects
  useEffect(() => {
    // Buscar dados
    fetchData().then(setData);

    // Cleanup
    return () => cleanup();
  }, [dependency]);

  // 3. Mutations (funções que alteram dados)
  const updateData = async (newData) => {
    await api.update(newData);
  };

  // 4. Utilities (helpers)
  const getById = (id) => data.find(item => item.id === id);

  // 5. Retornar interface
  return { data, loading, updateData, getById };
}
```

**Real-time Listener com Cleanup:**
```typescript
useEffect(() => {
  if (!workspaceId) {
    setSettings(null);
    setLoading(false);
    return; // Early return se não tiver workspaceId
  }

  setLoading(true);

  // Iniciar listener
  const unsubscribe = onStoreSettingsChange(workspaceId, (newSettings) => {
    setSettings(newSettings);
    setLoading(false);
  });

  // Cleanup: executado quando workspaceId muda ou componente desmonta
  return () => {
    unsubscribe(); // Para de escutar
  };
}, [workspaceId]);
```

### ✍️ **Exercício Prático:**

Complete o hook:

```typescript
import { useState, useEffect } from 'react';
import useAuth from './useAuth';
import { StoreSettings, Store, CreateStore } from '../schemas/storeSettingsSchema';
import {
  addStore as addStoreRepo,
  updateStore as updateStoreRepo,
  removeStore as removeStoreRepo,
  onStoreSettingsChange,
} from '../repositories/storeSettingsRepository';

export function useStoreSettings() {
  const { workspaceId, user } = useAuth();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Real-time listener
  useEffect(() => {
    // TODO: Implementar listener
    // Dica: seguir exemplo acima
  }, [workspaceId]);

  // Derivar array de stores
  const stores = settings?.stores || [];

  // Mutation: Adicionar store
  const addStore = async (store: CreateStore): Promise<Store> => {
    // TODO: Validar autenticação
    // TODO: Chamar addStoreRepo
    // TODO: Tratar erros
  };

  // Mutation: Atualizar store
  const updateStore = async (storeId: string, updates: Partial<CreateStore>) => {
    // TODO: Implementar
  };

  // Mutation: Remover store
  const removeStore = async (storeId: string) => {
    // TODO: Implementar
  };

  // Utility: Buscar por ID
  const getStoreById = (storeId: string) => {
    return stores.find(s => s.id === storeId);
  };

  // Utility: Buscar por nome
  const getStoreByName = (name: string) => {
    return stores.find(s => s.name === name);
  };

  // Utility: Buscar loja padrão do usuário logado
  const getDefaultStore = () => {
    if (!user?.email) return null;
    return stores.find(s => s.userEmail === user.email);
  };

  return {
    settings,
    stores,
    loading,
    error,
    addStore,
    updateStore,
    removeStore,
    getStoreById,
    getStoreByName,
    getDefaultStore, // Nova utility function!
  };
}
```

### 🤔 **Perguntas para reflexão:**
1. Por que derivar `stores` de `settings?.stores` ao invés de ter state separado?
2. O que acontece se você esquecer o cleanup do listener?
3. Por que injetar `workspaceId` e `user.email` no hook ao invés de passar como parâmetro nas funções?
4. Se dois componentes usarem `useStoreSettings()`, eles compartilham o mesmo estado?

### 📦 **Entregável do Dia 3:**
- [ ] Arquivo `useStoreSettings.ts` completo
- [ ] Teste: usar hook em um componente temporário e console.log(stores)

---

## 📅 DIA 4: UI de Configurações (Settings Page)

### 🎓 **O que você vai aprender:**
- Estruturação de componentes complexos
- Formulários controlados com validação
- Máscara de input (telefone)
- Color picker
- Estados de loading e feedback visual

### 📝 **Tarefas:**
1. Criar `src/pages/Settings.tsx`
2. Criar `src/components/settings/StoreForm.tsx`
3. Criar `src/components/settings/StoreList.tsx`
4. Adicionar rota `/settings` no App.tsx
5. Adicionar link no Navigation

### 📖 **Conceitos a estudar antes:**

**Controlled Components (Formulário Controlado):**
```typescript
function Form() {
  const [name, setName] = useState('');

  return (
    <input
      value={name}                        // React controla o valor
      onChange={e => setName(e.target.value)}  // Atualiza state
    />
  );
}
```

**Validação com Zod no Submit:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrors({});

  // Validar dados
  const result = CreateStoreSchema.safeParse(formData);

  if (!result.success) {
    // Transformar erros do Zod em objeto { field: message }
    const fieldErrors: Record<string, string> = {};
    result.error.errors.forEach(err => {
      if (err.path[0]) {
        fieldErrors[err.path[0].toString()] = err.message;
      }
    });
    setErrors(fieldErrors);
    return;
  }

  // Dados válidos, pode submeter
  await onSubmit(result.data);
};
```

**Máscara de Telefone:**
```typescript
function formatPhone(value: string): string {
  // Remove não-dígitos
  let cleaned = value.replace(/\D/g, '');

  // Limita a 11 dígitos
  cleaned = cleaned.slice(0, 11);

  // Aplica máscara: (XX) XXXXX-XXXX
  let formatted = '';
  if (cleaned.length > 0) {
    formatted = '(' + cleaned.slice(0, 2);
    if (cleaned.length > 2) {
      formatted += ') ' + cleaned.slice(2, cleaned.length === 11 ? 7 : 6);
    }
    if (cleaned.length > (cleaned.length === 11 ? 7 : 6)) {
      formatted += '-' + cleaned.slice(cleaned.length === 11 ? 7 : 6);
    }
  }

  return formatted;
}
```

### ✍️ **Exercício Prático:**

**Estrutura de Settings.tsx:**
```typescript
export default function Settings() {
  const { stores, loading, addStore, updateStore, removeStore } = useStoreSettings();
  const [isAddingStore, setIsAddingStore] = useState(false);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);

  const handleAddStore = async (store: CreateStore) => {
    try {
      await addStore(store);
      toast.success('Loja adicionada!');
      setIsAddingStore(false);
    } catch (error) {
      toast.error('Erro ao adicionar');
    }
  };

  // TODO: implementar handleUpdateStore e handleRemoveStore

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h1>Configurações</h1>

      <button onClick={() => setIsAddingStore(true)}>
        Adicionar Loja
      </button>

      {isAddingStore && (
        <StoreForm
          onSubmit={handleAddStore}
          onCancel={() => setIsAddingStore(false)}
        />
      )}

      <StoreList
        stores={stores}
        onEdit={setEditingStoreId}
        onRemove={handleRemoveStore}
        editingStoreId={editingStoreId}
        onUpdate={handleUpdateStore}
        onCancelEdit={() => setEditingStoreId(null)}
      />
    </div>
  );
}
```

### 🤔 **Perguntas para reflexão:**
1. Por que separar `StoreForm` e `StoreList` ao invés de ter tudo em `Settings.tsx`?
2. Como o `editingStoreId` controla qual loja está sendo editada?
3. Por que validar no submit e não no onChange de cada campo?
4. Como funciona o color picker nativo do HTML5?

### 📦 **Entregável do Dia 4:**
- [ ] Página Settings funcional
- [ ] Consegue adicionar, editar e remover lojas
- [ ] Validações funcionando
- [ ] Toasts de feedback

---

## 📅 DIA 5: Refatorar Serviços (WhatsApp)

### 🎓 **O que você vai aprender:**
- Como refatorar código legado mantendo compatibilidade
- Deprecation de funções antigas
- Como passar objetos ao invés de valores primitivos

### 📝 **Tarefas:**
1. Refatorar `src/services/whatsappService.ts`
2. Criar funções genéricas que recebem `Store` como parâmetro
3. Marcar funções antigas como `@deprecated`
4. Atualizar `customerActionService.ts` para usar novas funções

### 📖 **Conceitos a estudar antes:**

**Antes (hardcoded):**
```typescript
const campinasNumber = '(19) 98221-5561';

export function sendStoreCampinas(customer: Customer) {
  const message = `Consulta sobre ${customer.model}`;
  openWhatsApp(campinasNumber, message);
}
```

**Depois (dinâmico):**
```typescript
import { Store } from '@/schemas/storeSettingsSchema';

export function sendStoreMessage(customer: Customer, store: Store) {
  const message = `Consulta sobre ${customer.model}`;
  openWhatsApp(store.phone, message);
}
```

**Deprecation:**
```typescript
/**
 * @deprecated Use sendStoreMessage(customer, store) instead
 */
export function sendStoreCampinas(customer: Customer) {
  console.warn('sendStoreCampinas is deprecated');
  // Manter funcionando por enquanto
  sendStoreMessage(customer, {
    name: 'Campinas',
    phone: '(19) 98221-5561'
  });
}
```

### ✍️ **Exercício Prático:**

Refatore estas funções:

```typescript
// ANTES
export function notifyProductArrived(customer: Customer) {
  const message = `Oi ${customer.name}! Ferracini Maxi Shopping aqui! O ${customer.model} chegou!`;
  openWhatsApp(customer.phone, message);
}

// DEPOIS
export function notifyProductArrived(customer: Customer, store: Store) {
  const message = `Oi ${customer.name}! ${store.name} aqui! O ${customer.model} chegou!`;
  openWhatsApp(customer.phone, message);
}

// Agora refatore notifyOtherStore para receber sourceStore e consultingStore
```

### 🤔 **Perguntas para reflexão:**
1. Por que manter funções antigas marcadas como deprecated ao invés de deletar?
2. Como avisar outros desenvolvedores que uma função está deprecated?
3. O que acontece com código antigo que usa `sendStoreCampinas`?

### 📦 **Entregável do Dia 5:**
- [ ] whatsappService.ts refatorado
- [ ] Funções antigas marcadas como deprecated
- [ ] Novas funções recebem Store como parâmetro

---

## 📅 DIA 6: Atualizar Componentes (WorkflowCard, Dashboard)

### 🎓 **O que você vai aprender:**
- Como migrar componentes para usar dados dinâmicos
- Renderização condicional com .map()
- Estilos inline vs Tailwind classes
- Passar callbacks entre componentes

### 📝 **Tarefas:**
1. Atualizar `WorkflowCard.tsx` para renderizar botões dinamicamente
2. Atualizar `Dashboard.tsx` para usar `onCheckStore` genérico
3. Atualizar `TransferCard.tsx` para cores dinâmicas
4. Atualizar `History.tsx` para filtros dinâmicos

### 📖 **Conceitos a estudar antes:**

**Renderização Dinâmica:**
```typescript
// ANTES (hardcoded)
<div>
  <button onClick={onCheckStoreCampinas}>Campinas</button>
  <button onClick={onCheckStoreDomPedro}>Dom Pedro</button>
</div>

// DEPOIS (dinâmico)
<div>
  {stores.map(store => (
    <button
      key={store.id}
      onClick={() => onCheckStore(store)}
      style={{ backgroundColor: store.color }}
    >
      {store.name}
    </button>
  ))}
</div>
```

**Cores Dinâmicas:**
```typescript
// Tailwind não aceita classes dinâmicas, use style inline
<div
  className="badge"
  style={{
    backgroundColor: store.color,
    color: '#ffffff'
  }}
>
  {store.name}
</div>
```

### ✍️ **Exercício Prático:**

Atualize o WorkflowCard:

```typescript
interface WorkflowCardProps {
  customer: Customer;
  stores: Store[];  // Nova prop
  onCheckStore?: (customer: Customer, store: Store) => void;  // Novo handler

  // Deprecated (manter para compatibilidade)
  checkStoreCampinas?: (customer: Customer) => void;
  checkStoreDomPedro?: (customer: Customer) => void;
}

function WorkflowCard({ customer, stores, onCheckStore, ... }: WorkflowCardProps) {
  return (
    <div>
      {/* Novo código dinâmico */}
      {onCheckStore && stores.map(store => (
        <button
          key={store.id}
          onClick={() => onCheckStore(customer, store)}
          style={{ backgroundColor: store.color }}
        >
          {store.name}
        </button>
      ))}

      {/* Fallback para código antigo */}
      {!onCheckStore && (
        <>
          {checkStoreCampinas && <button onClick={() => checkStoreCampinas(customer)}>Campinas</button>}
          {checkStoreDomPedro && <button onClick={() => checkStoreDomPedro(customer)}>Dom Pedro</button>}
        </>
      )}
    </div>
  );
}
```

### 🤔 **Perguntas para reflexão:**
1. Por que passar `stores` como prop ao invés de usar `useStoreSettings()` dentro do componente?
2. Como garantir compatibilidade com código antigo durante a migração?
3. Por que `style` inline ao invés de Tailwind classes para cores?

### 📦 **Entregável do Dia 6:**
- [ ] WorkflowCard renderiza botões dinamicamente
- [ ] Dashboard usa handler genérico `handleCheckStore`
- [ ] TransferCard usa cores das stores configuradas
- [ ] History filtra por stores configuradas

---

## 📅 DIA 7: Migração de Dados, Firestore Rules e Testes

### ⚠️ **IMPORTANTE: Migração de Dados Existentes**

Como você já tem clientes cadastrados com `sourceStore: "Campinas"` e `sourceStore: "Dom Pedro"`, precisamos garantir compatibilidade durante a migração.

**Situação Atual:**
- Workspace `real` já tem clientes no banco
- Customers têm campos: `sourceStore`, `consultingStore` (strings: "Campinas", "Dom Pedro", "Jundiaí")
- Sistema atual usa strings hardcoded

**Situação Desejada:**
- Adicionar loja `Maxi` (Jundiaí) como padrão para `ferracini@maxi.com`
- Manter lojas `Campinas` e `Dom Pedro` funcionando
- Todos os dados antigos continuam funcionando

**Estratégia de Migração:**

1. **Não alterar schema do Customer** (manter `sourceStore` e `consultingStore` como string)
2. **Compatibilidade via nome**: comparar `customer.sourceStore` com `store.name`
3. **Adicionar validação**: se store não existir, usar fallback visual (mas não quebrar)

### 📋 **Passo Extra: Mapeamento de Compatibilidade (OBRIGATÓRIO)**

Como você escolheu nome "Maxi" mas tem dados antigos com "Jundiaí", **você precisa adicionar mapeamento**:

```typescript
// Hook: useStoreSettings.ts
const getStoreByNameCompatible = (storeName: string | null | undefined): Store | undefined => {
  if (!storeName) return undefined;

  // Mapeamento de nomes antigos para novos
  const nameMapping: Record<string, string> = {
    'Jundiaí': 'Maxi', // ⚠️ IMPORTANTE: mapear nome antigo → novo
  };

  const mappedName = nameMapping[storeName] || storeName;
  return stores.find(s => s.name === mappedName);
};
```

**Uso nos componentes:**
```typescript
// Ao invés de:
const store = getStoreByName(customer.sourceStore);

// Use:
const store = getStoreByNameCompatible(customer.sourceStore);
```

**Como funciona:**
- Customer antigo: `{ sourceStore: "Jundiaí" }`
- Mapeamento: `"Jundiaí"` → `"Maxi"`
- Resultado: encontra loja "Maxi" corretamente ✅

### 📋 **Alternativa: Migração Permanente dos Dados**

Se preferir atualizar os dados permanentemente ao invés de mapeamento:

```typescript
// Script: src/scripts/migrateStoreNames.ts
import { db } from '../services/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

async function migrateStoreNames() {
  const customersRef = collection(db, 'customers');

  // Buscar customers com Jundiaí
  const q = query(customersRef, where('sourceStore', '==', 'Jundiaí'));
  const snapshot = await getDocs(q);

  console.log(`🔄 Migrando ${snapshot.size} customers...`);

  for (const docSnap of snapshot.docs) {
    await updateDoc(doc(db, 'customers', docSnap.id), {
      sourceStore: 'Maxi'
    });
  }

  console.log('✅ Migração concluída!');
}
```

**Recomendação**: Use o **mapeamento** primeiro (não precisa alterar dados), e só faça migração permanente se quiser limpar o código depois.

## 📅 DIA 7: Firestore Rules, Seed e Testes

### 🎓 **O que você vai aprender:**
- Como escrever Firestore Security Rules
- Multi-tenancy e isolamento de dados
- Como fazer seed de dados iniciais
- Testes manuais sistemáticos

### 📝 **Tarefas:**
1. Adicionar regras para `workspace_settings` no `firestore.rules`
2. Criar script `src/scripts/seedStoreSettings.ts`
3. Executar seed para workspace `real`
4. Testar todas as funcionalidades

### 📖 **Conceitos a estudar antes:**

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: pegar workspace do usuário
    function getUserWorkspace() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.workspaceId;
    }

    match /workspace_settings/{workspaceId} {
      // Só pode ler se pertence ao workspace
      allow read: if request.auth != null
                  && getUserWorkspace() == workspaceId;

      // Só pode escrever se pertence ao workspace
      // E não está tentando mudar o workspaceId
      allow write: if request.auth != null
                   && getUserWorkspace() == workspaceId
                   && request.resource.data.workspaceId == workspaceId;
    }
  }
}
```

**Script de Seed:**
```typescript
import { db } from '../services/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

async function seedStoreSettings() {
  const realSettings = {
    workspaceId: 'real',
    stores: [
      {
        id: 'maxi',
        name: 'Maxi', // Nome compatível com dados existentes (ou 'Jundiaí')
        phone: '(XX) XXXXX-XXXX',  // TODO: Ajustar número real da loja Maxi
        color: '#F59E0B', // Laranja/Âmbar
        userEmail: 'ferracini@maxi.com', // LOJA PADRÃO - email no Firebase Auth
      },
      {
        id: 'campinas',
        name: 'Campinas', // Manter nome igual aos dados antigos
        phone: '(19) 98221-5561',
        color: '#3B82F6', // Azul
        userEmail: 'ferracini@campinas.com',
      },
      {
        id: 'dompedro',
        name: 'Dom Pedro', // Manter nome igual aos dados antigos
        phone: '(19) 99682-1710',
        color: '#10B981', // Verde
        userEmail: 'ferracini@dompedro.com',
      }
    ],
    updatedAt: Timestamp.now(),
    updatedBy: 'seed@system.com'
  };

  await setDoc(doc(db, 'workspace_settings', 'real'), realSettings);
  console.log('✅ Workspace REAL configurado');
  console.log('📋 Lojas criadas:', realSettings.stores.map(s => s.name).join(', '));
  console.log('⚠️  IMPORTANTE: Certifique-se de criar os usuários no Firebase Auth:');
  console.log('   - ferracini@maxi.com (LOJA PADRÃO)');
  console.log('   - ferracini@campinas.com');
  console.log('   - ferracini@dompedro.com');
}

seedStoreSettings();
```

### 🔑 **DECISÃO IMPORTANTE: Nomes das Lojas**

Você precisa escolher entre:

**Opção A: Nomes simples (recomendado para compatibilidade)**
```typescript
stores: [
  { name: 'Maxi', ... },        // Ou 'Jundiaí'?
  { name: 'Campinas', ... },    // Igual dados antigos
  { name: 'Dom Pedro', ... }    // Igual dados antigos
]
```
✅ **Vantagem**: Customers antigos com `sourceStore: "Campinas"` continuam funcionando
❌ **Desvantagem**: Nome "Maxi" pode não ser claro (pode usar "Jundiaí" mesmo)

**Opção B: Nomes descritivos**
```typescript
stores: [
  { name: 'Maxi Shopping (Jundiaí)', ... },
  { name: 'Campinas Shopping', ... },
  { name: 'Dom Pedro Shopping', ... }
]
```
✅ **Vantagem**: Mais claro na UI
❌ **Desvantagem**: Precisa atualizar customers antigos (`sourceStore: "Campinas"` → `sourceStore: "Campinas Shopping"`)

**Recomendação**: Use **Opção A** primeiro para evitar migração complexa. Depois, se quiser, pode adicionar campo `displayName` separado.

### 🤔 **Perguntas para reflexão:**
1. Por que as Firestore Rules são a última linha de defesa?
2. O que acontece se você não validar `workspaceId` nas rules?
3. Qual nome vai usar para a loja Maxi? "Maxi", "Jundiaí", ou "Maxi Shopping (Jundiaí)"?
4. Como garantir que dados antigos continuam funcionando após migração?

### 📦 **Entregável do Dia 7:**
- [ ] Firestore Rules atualizadas
- [ ] Seed executado com sucesso
- [ ] Checklist de testes completo
- [ ] Sistema funcionando end-to-end

---

## ✅ Checklist Final de Testes

- [ ] Login no workspace → vê lojas configuradas
- [ ] Adicionar nova loja → aparece imediatamente
- [ ] Editar loja → atualiza em todos os componentes
- [ ] Remover loja → desaparece
- [ ] Tentar remover última loja → mostra erro
- [ ] Botões de workflow usam cores corretas
- [ ] WhatsApp abre com número correto
- [ ] Filtros de histórico funcionam
- [ ] Cores dinâmicas nos cards
- [ ] Real-time: editar em outra aba atualiza

---

## 📚 Recursos de Estudo Extras

### Documentação Oficial:
- [Zod Documentation](https://zod.dev/)
- [Firestore Get Data](https://firebase.google.com/docs/firestore/query-data/get-data)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [React Hooks](https://react.dev/reference/react)

### Vídeos Recomendados:
- "Zod Tutorial" - Web Dev Simplified
- "Firestore Real-time Listeners" - Fireship
- "Custom React Hooks" - Ben Awad

---

## 🎯 Próximos Passos (Após 7 Dias)

Depois de completar essa feature, você pode:
1. Implementar drag-and-drop para ordenação
2. Adicionar roles (admin/user)
3. Histórico de mudanças (audit log)
4. Exportar/importar configurações
5. Temas de cores automáticos

---

**Boa jornada de aprendizado! 🚀**

Lembre-se: o objetivo não é só fazer funcionar, mas **entender** cada linha de código que você escreve.
