# 📅 Plano Semanal FINAL: Configurações Dinâmicas de Lojas

## 🎯 Meta da Semana

Transformar configurações hardcoded (nomes e telefones das lojas) em configurações dinâmicas editáveis via Settings page.

**Problema atual:**

- ❌ Telefones das lojas hardcoded no código
- ❌ Nomes das lojas hardcoded
- ❌ Workspace demo usa mesmos dados
- ❌ Adicionar nova loja = alterar código

**Resultado esperado:**

- ✅ Configurações editáveis (nome, telefone, cor)
- ✅ Workspace maxi com suas lojas configuradas
- ✅ Workspace demo com dados de teste
- ✅ Adicionar/remover lojas sem alterar código
- ✅ Compatível com dados existentes (sourceStore)
- ✅ Recrutador pode testar livremente

---

## 🏗️ Arquitetura Final

### Como funciona:

```
Workspace: maxi
├─ defaultStoreId: "maxi"  ← Sua loja principal
└─ stores: [
    { id: "maxi", name: "Maxi", phone: "...", color: "..." },      ← Você (recebe produtos)
    { id: "campinas", name: "Campinas", phone: "...", color: "..." },  ← Origem (envia para você)
    { id: "dompedro", name: "Dom Pedro", phone: "...", color: "..." }  ← Origem (envia para você)
   ]

Fluxo:
1. Cliente quer produto que não tem no Maxi
2. Consulta Campinas via WhatsApp (número dinâmico!)
3. Campinas tem → Marca sourceStore: "Campinas"
4. Produto chega de Campinas
5. Cliente compra no Maxi
6. Controle: Ressarcir Campinas
```

### Firestore Structure:

```
workspace_settings/
├─ maxi
│  ├─ workspaceId: "maxi"
│  ├─ defaultStoreId: "maxi"
│  ├─ stores: [Maxi, Campinas, Dom Pedro]
│  ├─ updatedAt: "2025-01-06T..."
│  └─ updatedBy: "user@email.com"
│
└─ demo
   ├─ workspaceId: "demo"
   ├─ defaultStoreId: "loja1"
   ├─ stores: [Loja Demo 1, Loja Demo 2]
   └─ ...

customers/
└─ customer-1
   ├─ workspaceId: "maxi"
   ├─ sourceStore: "Campinas"  ← Compatível com dados existentes!
   └─ ...
```

---

## 📅 SEGUNDA-FEIRA: Schemas e Fundação

### ⏰ Tempo: 2-3 horas

### 🎓 Aprendizado: Zod schemas, validações, TypeScript types

### ✅ Tarefas:

#### 1. Atualizar WorkspaceSchema (5min)

```typescript
// src/schemas/userSchema.ts

import { z } from 'zod';

// Apenas maxi e demo (por enquanto)
export const WorkspaceSchema = z.enum(['maxi', 'demo']);

export const UserShcema = z.object({
  uid: z.string(),
  email: z.email(),
  workspaceId: WorkspaceSchema,
  displayName: z.string().optional(),
  createdAt: z.string(),
});

export const FirebaseUserSchema = UserShcema.omit({ uid: true });

export type User = z.infer<typeof UserShcema>;
export type WorkspaceId = z.infer<typeof WorkspaceSchema>;
```

**📚 O que você aprende:**

- `z.enum()` limita valores possíveis
- `z.infer<>` cria TypeScript type do schema
- Type safety em compile time

---

#### 2. Criar StoreSettingsSchema (40min)

```typescript
// src/schemas/storeSettingsSchema.ts

import { z } from 'zod';
import { WorkspaceSchema } from './userSchema';

// Schema para uma loja individual
export const StoreSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  phone: z.string().regex(/^\(?[1-9]{2}\)?\s?9[0-9]{4}-?[0-9]{4}$/, 'Formato inválido. Use: (11) 98765-4321'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve ser hexadecimal'),
});

export type Store = z.infer<typeof StoreSchema>;

// Schema para configurações do workspace
export const StoreSettingsSchema = z.object({
  workspaceId: WorkspaceSchema,
  defaultStoreId: z.string(), // ← Loja principal do workspace
  stores: z.array(StoreSchema).min(1, 'Deve ter pelo menos 1 loja'),
  updatedAt: z.string(),
  updatedBy: z.email(),
});

export type StoreSettings = z.infer<typeof StoreSettingsSchema>;

// Schema para criar loja (sem ID)
export const CreateStoreSchema = StoreSchema.omit({ id: true });
export type CreateStore = z.infer<typeof CreateStoreSchema>;

// Schema para edição parcial
export const UpdateStoreSchema = CreateStoreSchema.partial();
export type UpdateStore = z.infer<typeof UpdateStoreSchema>;
```

**📚 O que você aprende:**

- `.regex()` para validação customizada
- `.min()` / `.max()` para limites
- `.omit()` remove campos
- `.partial()` torna todos campos opcionais
- Regex telefone brasileiro
- Regex cor hexadecimal

---

#### 3. Testar schemas no console (30min)

Abra DevTools e teste:

```typescript
import { StoreSchema, CreateStoreSchema } from './schemas/storeSettingsSchema';

// ✅ Teste 1: Loja válida
const validStore = {
  id: 'maxi',
  name: 'Maxi Shopping',
  phone: '(11) 98765-4321',
  color: '#F59E0B',
};
console.log(StoreSchema.parse(validStore));

// ❌ Teste 2: Telefone inválido
const invalidPhone = {
  id: 'maxi',
  name: 'Maxi',
  phone: '11987654321', // Sem formatação
  color: '#F59E0B',
};
const result = StoreSchema.safeParse(invalidPhone);
console.log(result.success); // false
console.log(result.error.errors); // Array de erros

// ❌ Teste 3: Cor inválida
const invalidColor = {
  id: 'maxi',
  name: 'Maxi',
  phone: '(11) 98765-4321',
  color: 'blue', // Não é hexadecimal
};
console.log(StoreSchema.safeParse(invalidColor));

// ✅ Teste 4: Partial update
const partialUpdate = { phone: '(11) 99999-9999' };
console.log(UpdateStoreSchema.parse(partialUpdate));
```

**📚 O que você aprende:**

- `.parse()` vs `.safeParse()`
- Como capturar erros de validação
- Testar regex patterns
- Validação em runtime

---

#### 4. Documentar o que aprendeu (30min)

Crie arquivo `APRENDIZADOS.md`:

```markdown
# Dia 1: Schemas e Validações

## Conceitos aprendidos:

### 1. Zod Schemas

- Schema = contrato de dados
- Valida em runtime (não só compile time)
- Gera tipos TypeScript automaticamente

### 2. Validações

- `.regex()` - expressões regulares
- `.min()` / `.max()` - limites
- `.email()` - email válido
- Mensagens de erro customizadas

### 3. Regex Patterns

- Telefone: /^\(?[1-9]{2}\)?\s?9[0-9]{4}-?[0-9]{4}$/
  - \(? = parêntese opcional
  - [1-9]{2} = DDD (11, 19, etc)
  - 9[0-9]{4} = 9XXXX (celular)

- Cor hex: /^#[0-9A-F]{6}$/i
  - ^ = início
  - # = obrigatório
  - [0-9A-F]{6} = 6 caracteres hex
  - $ = fim
  - i = case insensitive

### 4. TypeScript Inference

- z.infer<typeof Schema> gera type
- Type safety automático
- Autocomplete no VSCode

## Dúvidas que surgiram:

- [ ] Por que usar .safeParse() ao invés de .parse()?
      Resposta: safeParse não lança erro, retorna {success, data/error}
```

**📚 O que você aprende:**

- Documentar aprendizados
- Revisão ativa
- Criar referência futura

---

### 📦 Checklist do Dia 1:

- [x] WorkspaceSchema atualizado
- [x] StoreSettingsSchema criado
- [x] Todos os testes passando no console
- [x] APRENDIZADOS.md criado com suas anotações
- [x] Entendeu diferença entre parse e safeParse
- [x] Entendeu os regex patterns

---

## 📅 TERÇA-FEIRA: Repository Layer (Firestore)

### ⏰ Tempo: 3-4 horas

### 🎓 Aprendizado: Firestore CRUD, Timestamps, Real-time listeners

### ✅ Tarefas:

#### 1. Criar Repository (2h)

```typescript
// src/repositories/storeSettingsRepository.ts

import { db } from '../services/firebase';
import { doc, getDoc, updateDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { StoreSettings, Store, StoreSettingsSchema, UpdateStore, CreateStore } from '../schemas/storeSettingsSchema';

/**
 * Busca configurações de um workspace
 */
export async function getStoreSettings(workspaceId: string): Promise<StoreSettings | null> {
  try {
    const docRef = doc(db, 'workspace_settings', workspaceId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.warn(`Workspace settings not found: ${workspaceId}`);
      return null;
    }

    const data = docSnap.data();

    // Converter Timestamp → ISO string
    const parsed = StoreSettingsSchema.parse({
      ...data,
      updatedAt: data.updatedAt?.toDate().toISOString(),
    });

    return parsed;
  } catch (error) {
    console.error('Error getting store settings:', error);
    throw error;
  }
}

/**
 * Atualiza dados de uma loja específica
 */
export async function updateStore(
  workspaceId: string,
  storeId: string,
  updates: UpdateStore,
  userEmail: string
): Promise<void> {
  try {
    const currentSettings = await getStoreSettings(workspaceId);
    if (!currentSettings) {
      throw new Error('Workspace settings não encontrado');
    }

    // Encontrar índice da loja
    const storeIndex = currentSettings.stores.findIndex((s) => s.id === storeId);
    if (storeIndex === -1) {
      throw new Error(`Loja ${storeId} não encontrada`);
    }

    // Merge updates com dados atuais
    const updatedStore: Store = {
      ...currentSettings.stores[storeIndex],
      ...updates,
    };

    // Substituir loja no array
    const updatedStores = [...currentSettings.stores];
    updatedStores[storeIndex] = updatedStore;

    // Salvar no Firestore
    const docRef = doc(db, 'workspace_settings', workspaceId);
    await updateDoc(docRef, {
      stores: updatedStores,
      updatedAt: Timestamp.now(),
      updatedBy: userEmail,
    });

    console.log(`✅ Loja ${storeId} atualizada`);
  } catch (error) {
    console.error('Error updating store:', error);
    throw error;
  }
}

/**
 * Adiciona nova loja ao workspace
 */
export async function addStore(workspaceId: string, newStore: CreateStore, userEmail: string): Promise<Store> {
  try {
    const currentSettings = await getStoreSettings(workspaceId);
    if (!currentSettings) {
      throw new Error('Workspace settings não encontrado');
    }

    // Gerar ID único
    const storeId = `store-${Date.now()}`;

    const store: Store = {
      ...newStore,
      id: storeId,
    };

    // Adicionar ao array
    const updatedStores = [...currentSettings.stores, store];

    // Salvar
    const docRef = doc(db, 'workspace_settings', workspaceId);
    await updateDoc(docRef, {
      stores: updatedStores,
      updatedAt: Timestamp.now(),
      updatedBy: userEmail,
    });

    console.log(`✅ Loja ${storeId} adicionada`);
    return store;
  } catch (error) {
    console.error('Error adding store:', error);
    throw error;
  }
}

/**
 * Remove loja do workspace
 */
export async function removeStore(workspaceId: string, storeId: string, userEmail: string): Promise<void> {
  try {
    const currentSettings = await getStoreSettings(workspaceId);
    if (!currentSettings) {
      throw new Error('Workspace settings não encontrado');
    }

    // Não permitir remover loja principal
    if (storeId === currentSettings.defaultStoreId) {
      throw new Error('Não é possível remover a loja principal');
    }

    // Filtrar loja removida
    const updatedStores = currentSettings.stores.filter((s) => s.id !== storeId);

    if (updatedStores.length === 0) {
      throw new Error('Deve ter pelo menos 1 loja');
    }

    // Salvar
    const docRef = doc(db, 'workspace_settings', workspaceId);
    await updateDoc(docRef, {
      stores: updatedStores,
      updatedAt: Timestamp.now(),
      updatedBy: userEmail,
    });

    console.log(`✅ Loja ${storeId} removida`);
  } catch (error) {
    console.error('Error removing store:', error);
    throw error;
  }
}

/**
 * Listener real-time para mudanças
 */
export function onStoreSettingsChange(
  workspaceId: string,
  callback: (settings: StoreSettings | null) => void
): () => void {
  const docRef = doc(db, 'workspace_settings', workspaceId);

  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      try {
        const data = snapshot.data();
        const parsed = StoreSettingsSchema.parse({
          ...data,
          updatedAt: data.updatedAt?.toDate().toISOString(),
        });
        callback(parsed);
      } catch (error) {
        console.error('Error parsing store settings:', error);
        callback(null);
      }
    },
    (error) => {
      console.error('Error listening to store settings:', error);
      callback(null);
    }
  );

  return unsubscribe;
}
```

**📚 O que você aprende:**

- CRUD no Firestore (Create, Read, Update, Delete)
- `getDoc` vs `getDocs`
- `updateDoc` vs `setDoc`
- `onSnapshot` para real-time
- Converter Timestamp → ISO string
- Array manipulation (findIndex, filter, spread)
- Error handling com try/catch
- Validações de negócio (não remover loja principal)

---

#### 2. Criar Script de Seed (1h)

```typescript
// src/scripts/seedStoreSettings.ts

import { db } from '../services/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

async function seedStoreSettings() {
  console.log('🌱 Iniciando seed de configurações de lojas...\n');

  const workspaces = [
    {
      workspaceId: 'maxi',
      defaultStoreId: 'maxi',
      stores: [
        {
          id: 'maxi',
          name: 'Maxi', // ⚠️ Manter nome igual aos dados existentes!
          phone: '(11) 99999-9999', // TODO: Substituir pelo real
          color: '#F59E0B',
        },
        {
          id: 'campinas',
          name: 'Campinas', // ⚠️ Igual ao sourceStore nos customers
          phone: '(19) 98221-5561',
          color: '#3B82F6',
        },
        {
          id: 'dompedro',
          name: 'Dom Pedro', // ⚠️ Igual ao sourceStore nos customers
          phone: '(19) 99682-1710',
          color: '#10B981',
        },
      ],
    },
    {
      workspaceId: 'demo',
      defaultStoreId: 'loja1',
      stores: [
        {
          id: 'loja1',
          name: 'Loja Demo Principal',
          phone: '(11) 98765-4321',
          color: '#F59E0B',
        },
        {
          id: 'loja2',
          name: 'Loja Demo Origem 1',
          phone: '(11) 11111-1111',
          color: '#3B82F6',
        },
        {
          id: 'loja3',
          name: 'Loja Demo Origem 2',
          phone: '(11) 22222-2222',
          color: '#8B5CF6',
        },
      ],
    },
  ];

  try {
    for (const ws of workspaces) {
      const settings = {
        workspaceId: ws.workspaceId,
        defaultStoreId: ws.defaultStoreId,
        stores: ws.stores,
        updatedAt: Timestamp.now(),
        updatedBy: 'seed@system.com',
      };

      await setDoc(doc(db, 'workspace_settings', ws.workspaceId), settings);

      console.log(`✅ Workspace "${ws.workspaceId}" configurado`);
      console.log(`   🏪 Loja principal: ${ws.stores.find((s) => s.id === ws.defaultStoreId)?.name}`);
      console.log(`   📋 Total de lojas: ${ws.stores.length}`);
      ws.stores.forEach((store) => {
        console.log(`      - ${store.name} (${store.phone})`);
      });
      console.log('');
    }

    console.log('✅ Seed concluído com sucesso!\n');
    console.log('📝 Próximos passos:');
    console.log('1. Verifique no Firebase Console');
    console.log('2. Teste login e veja as configurações carregando');
    console.log('3. Vá para DIA 3 (criar hook e UI)\n');
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
  }
}

seedStoreSettings();
```

**📚 O que você aprende:**

- `setDoc` para criar documentos
- `Timestamp.now()` do Firestore
- Seed patterns
- Data fixtures para testes

---

#### 3. Executar Seed (30min)

**Opção 1: Via console do navegador**

1. Copie todo o código do seed
2. Cole no DevTools Console
3. Execute

**Opção 2: Via script npm**

```json
// package.json
"scripts": {
  "seed:stores": "tsx src/scripts/seedStoreSettings.ts"
}
```

```bash
yarn seed:stores
```

---

#### 4. Verificar no Firebase Console (15min)

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Firestore Database
3. Collection: `workspace_settings`
4. Documentos: `maxi` e `demo`
5. Verificar estrutura dos dados

---

#### 5. Atualizar APRENDIZADOS.md (15min)

```markdown
# Dia 2: Repository e Firestore

## Conceitos aprendidos:

### 1. Firestore Operations

- getDoc() - busca 1 documento
- updateDoc() - atualiza campos específicos
- setDoc() - cria/substitui documento completo
- onSnapshot() - listener real-time

### 2. Timestamps

- Firestore.Timestamp != JavaScript Date
- Conversão: timestamp.toDate().toISOString()
- Sempre usar Timestamp.now() ao salvar

### 3. Real-time Listeners

- onSnapshot retorna função de cleanup (unsubscribe)
- Callback executa quando dados mudam
- Importante fazer cleanup no useEffect

### 4. Array Operations

- findIndex() - encontra posição
- filter() - remove itens
- spread [...array] - copia array
- Firestore substitui array inteiro (não faz merge)

### 5. Validações de Negócio

- Não remover loja principal
- Manter pelo menos 1 loja
- Validar antes de salvar

## Dúvidas:

- [ ] Por que usar updateDoc ao invés de setDoc?
      Resposta: updateDoc atualiza campos específicos,
      setDoc substitui documento inteiro
```

---

### 📦 Checklist do Dia 2:

- [ ] Repository criado com CRUD completo
- [ ] Script de seed executado
- [ ] Dados no Firebase Console (maxi + demo)
- [ ] APRENDIZADOS.md atualizado
- [ ] Entendeu diferença updateDoc vs setDoc
- [ ] Entendeu como funciona onSnapshot

---

## 📅 QUARTA-FEIRA: Hook e Settings UI

### ⏰ Tempo: 4-5 horas

### 🎓 Aprendizado: Custom hooks, useEffect, Formulários React

### ✅ Tarefas:

#### 1. Criar Hook useStoreSettings (1h30min)

```typescript
// src/hooks/useStoreSettings.ts

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { StoreSettings, Store, UpdateStore, CreateStore } from '../schemas/storeSettingsSchema';
import {
  updateStore as updateStoreRepo,
  addStore as addStoreRepo,
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
    if (!workspaceId) {
      setSettings(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Listener
    const unsubscribe = onStoreSettingsChange(workspaceId, (newSettings) => {
      setSettings(newSettings);
      setLoading(false);
    });

    // Cleanup (IMPORTANTE!)
    return () => {
      unsubscribe();
    };
  }, [workspaceId]);

  // Derivar dados
  const allStores = settings?.stores || [];
  const defaultStore = allStores.find((s) => s.id === settings?.defaultStoreId) || null;
  const transferStores = allStores.filter((s) => s.id !== settings?.defaultStoreId);

  // Mutation: Atualizar loja
  const updateStore = async (storeId: string, updates: UpdateStore) => {
    if (!workspaceId || !user?.email) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setError(null);
      await updateStoreRepo(workspaceId, storeId, updates, user.email);
      // onSnapshot atualiza automaticamente
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    }
  };

  // Mutation: Adicionar loja
  const addStore = async (newStore: CreateStore) => {
    if (!workspaceId || !user?.email) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setError(null);
      const store = await addStoreRepo(workspaceId, newStore, user.email);
      return store;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    }
  };

  // Mutation: Remover loja
  const removeStore = async (storeId: string) => {
    if (!workspaceId || !user?.email) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setError(null);
      await removeStoreRepo(workspaceId, storeId, user.email);
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    }
  };

  // Utility: Buscar loja por nome (compatibilidade com sourceStore)
  const getStoreByName = (name: string) => {
    return allStores.find((s) => s.name === name);
  };

  return {
    settings,
    defaultStore, // Sua loja principal
    transferStores, // Lojas de origem de transferência
    allStores, // Todas as lojas
    loading,
    error,
    updateStore,
    addStore,
    removeStore,
    getStoreByName,
  };
}
```

**📚 O que você aprende:**

- Custom hooks pattern
- useEffect dependencies
- Cleanup functions (return)
- State derivation
- Error handling
- Async functions em hooks

---

#### 2. Criar Settings Page (1h30min)

```typescript
// src/pages/Settings.tsx

import { useState } from 'react';
import { useStoreSettings } from '../hooks/useStoreSettings';
import StoreCard from '../components/settings/StoreCard';
import StoreForm from '../components/settings/StoreForm';
import { CreateStore } from '../schemas/storeSettingsSchema';
import { toast } from 'react-hot-toast';

export default function Settings() {
  const {
    defaultStore,
    transferStores,
    loading,
    updateStore,
    addStore,
    removeStore,
  } = useStoreSettings();

  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddStore = async (data: CreateStore) => {
    try {
      await addStore(data);
      toast.success('Loja adicionada com sucesso!');
      setShowAddForm(false);
    } catch (error) {
      toast.error('Erro ao adicionar loja');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 text-lg">Carregando configurações...</div>
      </div>
    );
  }

  if (!defaultStore) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg">
          Erro: Configurações não encontradas
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Configurações de Lojas</h1>

      {/* Loja Principal */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-semibold">Minha Loja</h2>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
            Principal
          </span>
        </div>
        <StoreCard
          store={defaultStore}
          onUpdate={(updates) => updateStore(defaultStore.id, updates)}
          canDelete={false}
        />
      </section>

      {/* Lojas de Transferência */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Lojas de Origem (Transferência)</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
          >
            + Adicionar Loja
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Configure as lojas de onde você recebe produtos por transferência.
          Essas lojas aparecem nos botões de consulta.
        </p>

        {/* Formulário Adicionar */}
        {showAddForm && (
          <div className="mb-6">
            <StoreForm
              onSubmit={handleAddStore}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {/* Lista de lojas */}
        <div className="space-y-4">
          {transferStores.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-500">
                Nenhuma loja de transferência configurada.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Adicione as lojas de onde você recebe produtos.
              </p>
            </div>
          ) : (
            transferStores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                onUpdate={(updates) => updateStore(store.id, updates)}
                onDelete={() => {
                  if (confirm(`Remover loja ${store.name}?`)) {
                    removeStore(store.id)
                      .then(() => toast.success('Loja removida'))
                      .catch(() => toast.error('Erro ao remover loja'));
                  }
                }}
                canDelete={true}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
```

**📚 O que você aprende:**

- Composição de componentes
- Conditional rendering
- Event handlers
- Toast notifications
- Loading states
- Error states
- Confirm dialog

---

#### 3. Criar StoreCard Component (1h)

```typescript
// src/components/settings/StoreCard.tsx

import { useState } from 'react';
import { Store, UpdateStore } from '../../schemas/storeSettingsSchema';
import StoreForm from './StoreForm';

interface StoreCardProps {
  store: Store;
  onUpdate: (updates: UpdateStore) => Promise<void>;
  onDelete?: () => void;
  canDelete: boolean;
}

export default function StoreCard({
  store,
  onUpdate,
  onDelete,
  canDelete,
}: StoreCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = async (updates: UpdateStore) => {
    await onUpdate(updates);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <StoreForm
        initialData={store}
        onSubmit={handleUpdate}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Nome */}
          <div className="mb-4">
            <label className="text-sm text-gray-500 block mb-1">Nome da Loja</label>
            <div className="text-xl font-semibold">{store.name}</div>
          </div>

          {/* Telefone */}
          <div className="mb-4">
            <label className="text-sm text-gray-500 block mb-1">Telefone</label>
            <div className="text-lg">{store.phone}</div>
          </div>

          {/* Cor */}
          <div>
            <label className="text-sm text-gray-500 block mb-1">Cor</label>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
                style={{ backgroundColor: store.color }}
              />
              <span className="text-lg font-mono">{store.color}</span>
            </div>
          </div>
        </div>

        {/* Preview da cor em badge */}
        <div
          className="px-4 py-2 rounded-full text-white font-semibold shadow-sm"
          style={{ backgroundColor: store.color }}
        >
          {store.name}
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={() => setIsEditing(true)}
          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Editar
        </button>
        {canDelete && onDelete && (
          <button
            onClick={onDelete}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Remover
          </button>
        )}
      </div>
    </div>
  );
}
```

**📚 O que você aprende:**

- Component props typing
- Conditional rendering (isEditing)
- Inline styles (backgroundColor)
- Optional props (onDelete?)

---

#### 4. Criar StoreForm Component (1h)

```typescript
// src/components/settings/StoreForm.tsx

import { useState, FormEvent } from 'react';
import { Store, CreateStore, CreateStoreSchema } from '../../schemas/storeSettingsSchema';

interface StoreFormProps {
  initialData?: Store;
  onSubmit: (data: CreateStore) => Promise<void>;
  onCancel: () => void;
}

export default function StoreForm({
  initialData,
  onSubmit,
  onCancel,
}: StoreFormProps) {
  const [formData, setFormData] = useState<CreateStore>({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    color: initialData?.color || '#3B82F6',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    // Validar
    const result = CreateStoreSchema.safeParse(formData);

    if (!result.success) {
      // Converter erros do Zod
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(result.data);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">
        {initialData ? 'Editar Loja' : 'Nova Loja'}
      </h3>

      {/* Nome */}
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nome da Loja *
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ex: Itu Shopping"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Telefone */}
      <div className="mb-4">
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Telefone *
        </label>
        <input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="(11) 98765-4321"
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        <p className="text-gray-500 text-xs mt-1">Formato: (XX) 9XXXX-XXXX</p>
      </div>

      {/* Cor */}
      <div className="mb-6">
        <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
          Cor *
        </label>
        <div className="flex items-center gap-3">
          <input
            id="color"
            type="color"
            value={formData.color}
            onChange={(e) =>
              setFormData({ ...formData, color: e.target.value.toUpperCase() })
            }
            className="w-20 h-12 rounded cursor-pointer border-2 border-gray-300"
          />
          <input
            type="text"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-mono"
            placeholder="#3B82F6"
            maxLength={7}
          />
        </div>
        {errors.color && <p className="text-red-500 text-sm mt-1">{errors.color}</p>}
      </div>

      {/* Botões */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
```

**📚 O que você aprende:**

- Controlled components
- Form handling
- Validação on submit
- Color picker nativo HTML5
- Disabled states
- Error display
- Spread operator para state updates

---

#### 5. Adicionar rota (15min)

```typescript
// src/App.tsx

import Settings from './pages/Settings';

// Adicione a rota
<Route path="/settings" element={<Settings />} />
```

---

#### 6. Atualizar APRENDIZADOS.md (15min)

````markdown
# Dia 3: Hook e UI

## Conceitos aprendidos:

### 1. Custom Hooks

- Padrão: use + Nome
- Encapsular lógica reutilizável
- Pode usar outros hooks
- Return object com estado e funções

### 2. useEffect Cleanup

```typescript
useEffect(() => {
  const unsubscribe = onSnapshot(...);
  return () => unsubscribe();  // ← Cleanup!
}, [deps]);
```
````

- Executado quando componente desmonta
- Ou quando dependencies mudam
- Importante para evitar memory leaks

### 3. State Derivation

- Derivar dados de state existente
- Não criar state duplicado
- Melhor performance

```typescript
const defaultStore = stores.find(...);  // ← Derivado
```

### 4. Formulários Controlados

- value + onChange
- React controla o valor
- Single source of truth

```typescript
<input
  value={formData.name}
  onChange={e => setFormData({...formData, name: e.target.value})}
/>
```

### 5. Color Picker

- `<input type="color">` nativo
- Retorna hex em lowercase
- .toUpperCase() para padronizar

### 6. Validação on Submit

- Usar schema.safeParse()
- Converter erros para objeto
- Exibir erros por campo

```typescript
if (!result.success) {
  const errors = {};
  result.error.errors.forEach((err) => {
    errors[err.path[0]] = err.message;
  });
}
```

## Dúvidas:

- [ ] Por que não usar useState para cada campo do form?
      Resposta: Um objeto é mais fácil de passar e validar

````

---

### 📦 Checklist do Dia 3:
- [ ] Hook useStoreSettings criado
- [ ] Settings page renderizando
- [ ] StoreCard component funcional
- [ ] StoreForm com validações
- [ ] Rota /settings adicionada
- [ ] Consegue visualizar lojas
- [ ] Consegue editar loja
- [ ] Consegue adicionar loja
- [ ] Consegue remover loja
- [ ] Toast de feedback funciona
- [ ] APRENDIZADOS.md atualizado

---

## 📅 QUINTA-FEIRA: Refatorar WhatsApp + Integração

### ⏰ Tempo: 3-4 horas
### 🎓 Aprendizado: Refatoração, integração de sistemas

### ✅ Tarefas:

#### 1. Refatorar whatsappService (1h30min)

```typescript
// src/services/whatsappService.ts

import { Store } from '../schemas/storeSettingsSchema';
import { Customer } from '../schemas/customerSchema';

/**
 * Abre WhatsApp Web com mensagem
 */
function openWhatsApp(phone: string, message: string) {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/55${cleanPhone}?text=${encodedMessage}`;
  window.open(url, '_blank');
}

/**
 * Notifica cliente que produto chegou
 */
export function notifyProductArrived(customer: Customer, store: Store) {
  const message = `Oi ${customer.name}! ${store.name} aqui! 🎉\n\nO ${customer.model} ref ${customer.reference} chegou!\n\nPode vir buscar quando quiser! 😊`;
  openWhatsApp(customer.phone, message);
}

/**
 * Notifica que produto está pronto para retirada
 */
export function notifyReadyForPickup(customer: Customer, store: Store) {
  const message = `Oi ${customer.name}! ${store.name} aqui!\n\nSeu ${customer.model} está pronto para retirada! 🎉\n\nTe esperamos aqui!`;
  openWhatsApp(customer.phone, message);
}

/**
 * Consulta outra loja sobre disponibilidade de produto
 */
export function consultStoreAboutProduct(
  targetStore: Store,
  fromStore: Store,
  customer: Customer
) {
  const message = `Oi! ${fromStore.name} aqui.\n\nTemos um cliente interessado nesse produto:\n\n📦 Modelo: ${customer.model}\n🔖 Referência: ${customer.reference}\n📏 Tamanho: ${customer.size}\n🎨 Cor: ${customer.color}\n\nVocês têm em estoque?`;
  openWhatsApp(targetStore.phone, message);
}

/**
 * Mensagem genérica para cliente
 */
export function sendCustomerMessage(
  customer: Customer,
  store: Store,
  customMessage: string
) {
  const message = `Oi ${customer.name}! ${store.name} aqui!\n\n${customMessage}`;
  openWhatsApp(customer.phone, message);
}
````

**📚 O que você aprende:**

- Passar objetos em vez de valores primitivos
- Template strings multi-line
- Função pura (não depende de estado global)
- Named exports
- JSDoc comments

---

#### 2. Atualizar componentes (1h30min)

**Exemplo: WorkflowCard**

```typescript
// src/components/dashboard/WorkflowCard.tsx (exemplo)

import { useStoreSettings } from '../../hooks/useStoreSettings';
import { consultStoreAboutProduct } from '../../services/whatsappService';
import { Customer } from '../../schemas/customerSchema';

interface WorkflowCardProps {
  customer: Customer;
  // ... outras props
}

export default function WorkflowCard({ customer }: WorkflowCardProps) {
  const { defaultStore, transferStores } = useStoreSettings();

  if (!defaultStore) return null;

  return (
    <div>
      {/* ... outros elementos ... */}

      {/* Botões de consulta - DINÂMICOS! */}
      <div className="flex flex-wrap gap-2">
        <p className="w-full text-sm text-gray-600 mb-2">
          Consultar disponibilidade em:
        </p>
        {transferStores.map((store) => (
          <button
            key={store.id}
            onClick={() => consultStoreAboutProduct(store, defaultStore, customer)}
            className="px-4 py-2 rounded-lg text-white font-semibold transition hover:opacity-90"
            style={{ backgroundColor: store.color }}
          >
            {store.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

**📚 O que você aprende:**

- Usar hook em componentes
- Array.map() para renderizar botões
- Inline styles dinâmicos
- Event handlers com parâmetros

---

#### 3. Compatibilidade com dados existentes (45min)

**Utility para buscar loja por nome:**

```typescript
// No componente que exibe histórico

import { useStoreSettings } from '../hooks/useStoreSettings';

export default function History() {
  const { getStoreByName } = useStoreSettings();

  // Customer existente
  const customer = {
    sourceStore: "Campinas"  // ← String salva
  };

  // Buscar configurações da loja
  const sourceStoreConfig = getStoreByName(customer.sourceStore);

  return (
    <div>
      {sourceStoreConfig ? (
        <div className="flex items-center gap-2">
          <span>Origem:</span>
          <span
            className="px-3 py-1 rounded-full text-white"
            style={{ backgroundColor: sourceStoreConfig.color }}
          >
            {sourceStoreConfig.name}
          </span>
        </div>
      ) : (
        <span>Origem: {customer.sourceStore}</span>
      )}
    </div>
  );
}
```

**📚 O que você aprende:**

- Backward compatibility
- Graceful degradation
- Conditional rendering

---

#### 4. Testar integração completa (30min)

**Checklist de testes:**

- [ ] Editar telefone de Campinas
- [ ] Criar novo cliente
- [ ] Clicar "Consultar Campinas"
- [ ] WhatsApp abre com número NOVO ✅
- [ ] Adicionar loja "Itu"
- [ ] Botão "Consultar Itu" aparece ✅
- [ ] Marcar sourceStore: "Itu"
- [ ] Ver no histórico com cor/badge de Itu ✅

---

#### 5. Atualizar APRENDIZADOS.md (15min)

```markdown
# Dia 4: Refatoração e Integração

## Conceitos aprendidos:

### 1. Refatoração

- Passar Store ao invés de phone separado
- Facilita mudanças futuras
- Menos parâmetros = código mais limpo

### 2. Integração de Sistemas

- Hook provê dados
- Componentes consomem
- Serviços usam os dados
- Fluxo unidirecional

### 3. Backward Compatibility

- Dados antigos continuam funcionando
- Buscar por nome (sourceStore)
- Graceful degradation se não achar

### 4. Dynamic Rendering

- .map() para criar botões
- Cores dinâmicas via style
- Número de botões = número de lojas

## Fluxo completo:

1. Settings: Edita telefone
2. Firestore: Salva
3. onSnapshot: Detecta mudança
4. Hook: Atualiza state
5. Componente: Re-renderiza
6. Botão: Usa novo telefone
7. WhatsApp: Abre com número atualizado

## Dúvidas:

- Nenhuma! Tudo funcionando! 🎉
```

---

### 📦 Checklist do Dia 4:

- [ ] WhatsApp service refatorado
- [ ] Componentes atualizados
- [ ] Botões dinâmicos renderizando
- [ ] Cores dinâmicas funcionando
- [ ] Compatibilidade com dados antigos
- [ ] Testes de integração passando
- [ ] APRENDIZADOS.md atualizado

---

## 📅 SEXTA-FEIRA: Testes, Polish e Preparação

### ⏰ Tempo: 3-4 horas

### 🎓 Aprendizado: QA, UX polish, Documentação

### ✅ Tarefas:

#### 1. Firestore Rules (45min)

```javascript
// firestore.rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: pegar workspace do usuário
    function getUserWorkspace() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.workspaceId;
    }

    // Workspace Settings
    match /workspace_settings/{workspaceId} {
      // Só pode acessar do seu workspace
      allow read: if request.auth != null
                  && getUserWorkspace() == workspaceId;

      // Só pode editar do seu workspace
      allow write: if request.auth != null
                   && getUserWorkspace() == workspaceId
                   && request.resource.data.workspaceId == workspaceId;
    }

    // Customers
    match /customers/{customerId} {
      // Só vê clientes do seu workspace
      allow read: if request.auth != null
                  && getUserWorkspace() == resource.data.workspaceId;

      // Só cria no seu workspace
      allow create: if request.auth != null
                    && getUserWorkspace() == request.resource.data.workspaceId;

      // Só edita/deleta do seu workspace
      allow update, delete: if request.auth != null
                            && getUserWorkspace() == resource.data.workspaceId;
    }

    // Users (read-only para o próprio usuário)
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Deploy:**

```bash
firebase deploy --only firestore:rules
```

**📚 O que você aprende:**

- Firestore Security Rules
- Função helper
- Multi-tenancy security
- Data validation

---

#### 2. Polish da UI (1h)

**Melhorias importantes:**

**Loading states melhores:**

```typescript
if (loading) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="mt-4 text-gray-500">Carregando configurações...</p>
    </div>
  );
}
```

**Empty states:**

```typescript
{transferStores.length === 0 && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
    <p className="text-blue-700 font-semibold mb-2">
      Nenhuma loja de transferência configurada
    </p>
    <p className="text-blue-600 text-sm">
      Adicione as lojas de onde você recebe produtos
    </p>
  </div>
)}
```

**Toast messages:**

```typescript
toast.success('✅ Loja atualizada com sucesso!');
toast.error('❌ Erro ao atualizar loja');
toast.success('🎉 Loja adicionada!');
toast.success('🗑️ Loja removida');
```

**Confirmações:**

```typescript
const handleRemove = async () => {
  if (!confirm(`Tem certeza que deseja remover a loja "${store.name}"?`)) {
    return;
  }
  await removeStore(store.id);
};
```

**📚 O que você aprende:**

- Loading spinners CSS
- Empty states UX
- Toast best practices
- Confirm dialogs

---

#### 3. Testes Completos (1h)

**Workspace maxi:**

- [ ] Login
- [ ] Ver 3 lojas (Maxi, Campinas, Dom Pedro)
- [ ] Editar telefone do Maxi
- [ ] Salvar → Toast de sucesso
- [ ] Editar nome de Campinas
- [ ] Adicionar loja "Itu"
- [ ] Telefone: (11) 98888-8888
- [ ] Cor: Roxa
- [ ] Salvar → Loja aparece na lista
- [ ] Ir para Dashboard
- [ ] Ver botões: Campinas, Dom Pedro, Itu ✅
- [ ] Clicar "Consultar Itu"
- [ ] WhatsApp abre com número correto ✅
- [ ] Criar cliente
- [ ] Marcar sourceStore: "Itu"
- [ ] Ver no histórico com badge roxo ✅
- [ ] Voltar Settings
- [ ] Remover loja Itu
- [ ] Confirmar → Loja removida
- [ ] Botão "Consultar Itu" desaparece ✅

**Workspace demo:**

- [ ] Logout
- [ ] Login com demo
- [ ] Ver lojas demo (3 lojas)
- [ ] Editar, adicionar, remover
- [ ] Verificar isolamento (não vê dados do maxi) ✅

**Real-time:**

- [ ] Abrir em 2 abas
- [ ] Editar em aba 1
- [ ] Ver atualização em aba 2 ✅

**📚 O que você aprende:**

- QA systematic testing
- Regression testing
- Multi-tab testing
- Isolamento de dados

---

#### 4. Documentação (1h)

**README.md principal:**

```markdown
# 🏪 Sistema de Gestão - Ferracini CRM

Sistema de CRM multi-tenant para gestão de clientes e transferências entre lojas.

## ✨ Features

- ✅ **Multi-tenancy**: Workspaces isolados (maxi, demo)
- ✅ **Configurações dinâmicas**: Nome, telefone e cores editáveis
- ✅ **Real-time**: Mudanças instantâneas via Firestore
- ✅ **Validações**: Zod schemas para integridade de dados
- ✅ **Segurança**: Firestore Rules impedem acesso entre workspaces
- ✅ **Escalável**: Adicionar loja = preencher formulário

## 🎯 Como Testar (Recrutadores)

### Login Demo:

- Email: `demo@teste.com`
- Password: `******`

### Fluxo de teste:

1. **Configurações Dinâmicas**
   - Vá em `/settings`
   - Edite nome, telefone ou cor de uma loja
   - Salve e veja mudanças em tempo real

2. **Adicionar Loja**
   - Clique "Adicionar Loja"
   - Preencha: Nome, Telefone, Cor
   - Botão aparece automaticamente nos workflows

3. **Workflow Completo**
   - Crie novo cliente
   - Consulte lojas via WhatsApp (botões dinâmicos!)
   - Marque transferência
   - Veja no histórico com cores configuradas

4. **Isolamento**
   - Dados demo isolados
   - Sem risco de afetar dados reais

## 🏗️ Arquitetura

### Stack:

- React + TypeScript
- Firebase (Firestore + Auth)
- Zod para validações
- Tailwind CSS

### Estrutura:
```

src/
├── schemas/ # Zod schemas (validação)
├── repositories/ # Firestore CRUD
├── hooks/ # Custom hooks
├── services/ # WhatsApp, etc
├── pages/ # Settings, Dashboard, History
└── components/ # Reutilizáveis

```

### Firestore:
```

workspace_settings/{workspaceId}
├─ defaultStoreId
└─ stores: [...]

customers/{customerId}
├─ workspaceId
└─ sourceStore (nome da loja de origem)

```

## 🚀 Diferenciais Técnicos

### Multi-Tenancy
- Isolamento completo de dados
- Firestore Rules garantem segurança
- Escalável: adicionar workspace = 1 linha no enum

### Type Safety
- Zod valida runtime + compile time
- TypeScript end-to-end
- Inferência automática de tipos

### Real-time
- onSnapshot do Firestore
- Mudanças refletem instantaneamente
- Cleanup adequado (sem memory leaks)

### Configurações Dinâmicas
- Zero hardcode
- Admin pode ajustar sem deploy
- Versionamento via updatedAt/updatedBy

## 📚 Aprendizados

Durante este projeto aprendi:

- ✅ Zod schemas e validações complexas
- ✅ Firestore real-time listeners
- ✅ Custom hooks pattern
- ✅ Formulários controlados
- ✅ Multi-tenancy architecture
- ✅ Firestore Security Rules
- ✅ TypeScript avançado
- ✅ Component composition
- ✅ Error handling
- ✅ State management

## 🎯 Próximas Features

- [ ] Roles (admin/vendedor)
- [ ] Dashboard de métricas
- [ ] Exportar relatórios
- [ ] Transferências via Cloud Functions
- [ ] Mobile app (React Native)

---

**Desenvolvido por:** [Seu Nome]
**LinkedIn:** [seu-linkedin]
**GitHub:** [seu-github]
**Portfolio:** [seu-site]
```

---

#### 5. APRENDIZADOS.md Final (30min)

```markdown
# 📚 Aprendizados - Semana de Lojas Dinâmicas

## 🎯 Objetivo Alcançado

Transformei configurações hardcoded em sistema dinâmico e escalável.

## 📅 Cronologia de Aprendizados

### Dia 1: Schemas e Validações

- Zod schemas
- Regex patterns
- Type inference
- Runtime validation

### Dia 2: Repository e Firestore

- CRUD operations
- Timestamps
- Real-time listeners
- Array manipulations

### Dia 3: Hook e UI

- Custom hooks
- useEffect cleanup
- Controlled forms
- Component composition

### Dia 4: Integração

- Refatoração
- Backward compatibility
- Dynamic rendering
- Integration testing

### Dia 5: Polish e QA

- Security Rules
- UX polish
- Systematic testing
- Documentation

## 💡 Insights Importantes

### 1. Type Safety é poder

Zod + TypeScript = menos bugs, mais confiança

### 2. Real-time é mágico

onSnapshot torna app responsivo sem esforço

### 3. Cleanup é essencial

Sempre retornar cleanup no useEffect

### 4. Validação em camadas

- Schema (estrutura)
- Regex (formato)
- Business rules (lógica)

### 5. Componentes pequenos

Fácil testar, fácil reutilizar

## 🚀 Habilidades Desenvolvidas

### Técnicas:

- [x] Zod schemas avançados
- [x] Firestore real-time
- [x] Custom hooks
- [x] TypeScript genéricos
- [x] Security Rules

### Soft:

- [x] Planejamento semanal
- [x] Documentação clara
- [x] Testes sistemáticos
- [x] Resolução de problemas

## 📊 Métricas

- **Linhas de código:** ~800
- **Componentes criados:** 4
- **Hooks criados:** 1
- **Schemas criados:** 3
- **Tempo total:** ~18 horas
- **Bugs encontrados:** 0 (até agora!)

## 🎓 Para Próximos Projetos

### O que fazer:

- ✅ Planejar antes de codar
- ✅ Documentar enquanto aprende
- ✅ Testar incrementalmente
- ✅ Commits pequenos e frequentes

### O que evitar:

- ❌ Hardcode
- ❌ State duplicado
- ❌ Componentes grandes
- ❌ Esquecer cleanup

## 💬 Perguntas para Entrevistas

Estou preparado para falar sobre:

1. **Multi-tenancy**: Como isolei dados entre workspaces
2. **Type Safety**: Zod + TypeScript em produção
3. **Real-time**: onSnapshot e performance
4. **Validações**: Camadas de validação
5. **Arquitetura**: Repository pattern
6. **Security**: Firestore Rules
7. **UX**: Loading, error, empty states
8. **Refatoração**: De hardcoded para dinâmico

## 🙏 Agradecimentos

A mim mesmo por não desistir! 🎉

Próximo desafio: [definir próxima feature]
```

---

### 📦 Checklist FINAL da Semana:

#### Código:

- [ ] WorkspaceSchema (maxi, demo)
- [ ] StoreSettingsSchema completo
- [ ] Repository com CRUD
- [ ] Hook useStoreSettings
- [ ] Settings page polida
- [ ] StoreCard + StoreForm
- [ ] WhatsApp service refatorado
- [ ] Componentes integrados

#### Firestore:

- [ ] Seed executado
- [ ] Rules deployadas
- [ ] Dados maxi configurados
- [ ] Dados demo configurados

#### Testes:

- [ ] Editar loja funciona
- [ ] Adicionar loja funciona
- [ ] Remover loja funciona
- [ ] Botões dinâmicos aparecem
- [ ] WhatsApp com número correto
- [ ] Real-time updates funcionando
- [ ] Isolamento entre workspaces
- [ ] Compatibilidade dados antigos

#### Documentação:

- [ ] README.md completo
- [ ] APRENDIZADOS.md detalhado
- [ ] Comentários no código
- [ ] Screenshots (opcional)

---

## 🎉 PARABÉNS!

Ao final da semana você terá:

✅ Sistema totalmente dinâmico
✅ Zero hardcode
✅ Escalável (fácil adicionar lojas)
✅ Type-safe (Zod + TypeScript)
✅ Real-time (Firestore)
✅ Seguro (Rules)
✅ Documentado
✅ Testado
✅ Pronto para portfólio
✅ Pronto para primeiro emprego!

---

## 💼 Apresentando para Recrutadores

### Elevator Pitch (30 segundos):

> "Desenvolvi um sistema multi-tenant de gestão de lojas usando React, TypeScript e Firebase. O diferencial é que todas as configurações são dinâmicas - o admin pode adicionar novas lojas, editar telefones e cores sem mexer no código. Usei Zod para validação type-safe, Firestore para real-time, e implementei isolamento completo de dados com Security Rules. O workspace demo permite que vocês testem livremente."

### Destaques Técnicos:

1. **"Implementei multi-tenancy completo"**
   - Dados isolados por workspace
   - Firestore Rules garantem segurança

2. **"Type safety em runtime e compile time"**
   - Zod valida dados do Firestore
   - TypeScript garante tipos em desenvolvimento

3. **"Real-time sem esforço"**
   - onSnapshot do Firestore
   - Cleanup adequado com useEffect

4. **"Arquitetura escalável"**
   - Adicionar loja = preencher formulário
   - Sem alterar código

5. **"Validações em camadas"**
   - Schema (estrutura)
   - Regex (formato)
   - Business rules (lógica)

---

## 🎯 Próxima Semana

Agora que você domina:

- Schemas e validações
- Firestore real-time
- Custom hooks
- Formulários complexos
- Multi-tenancy

Pode partir para:

- [ ] Dashboard de métricas
- [ ] Sistema de roles
- [ ] Exportar relatórios
- [ ] Testes automatizados (Jest, React Testing Library)
- [ ] CI/CD (GitHub Actions)

---

**Boa semana de muito aprendizado! 🚀**

**Você VAI conseguir esse primeiro emprego!** 💪
