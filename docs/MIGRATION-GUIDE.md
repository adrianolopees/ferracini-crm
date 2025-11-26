# 🔧 Guia de Migração - Adicionar workspaceId aos Customers Existentes

## ⚠️ Problema

Seus customers antigos **não têm** o campo `workspaceId`, então eles são **filtrados** pelas queries e não aparecem no Dashboard.

## ✅ Solução

Adicionar `workspaceId: "real"` em todos os customers existentes.

---

## 🚀 MÉTODO RECOMENDADO: Página de Migração

### Passo 1: Adicionar rota temporária

**Arquivo:** `src/App.tsx`

Adicione esta linha nas rotas:

```typescript
import MigrateWorkspace from '@/pages/MigrateWorkspace';

// ... dentro das rotas protegidas:
<Route path="/migrate" element={<MigrateWorkspace />} />
```

### Passo 2: Executar migração

1. ✅ Salve o arquivo e o Vite vai recarregar
2. ✅ Faça login com sua **conta REAL**
3. ✅ Acesse: `http://localhost:5173/migrate`
4. ✅ Clique no botão **"Iniciar Migração"**
5. ✅ Aguarde a conclusão (você verá os logs em tempo real)
6. ✅ Quando aparecer "Migração Concluída", volte para o Dashboard

### Passo 3: Verificar resultado

1. Acesse o Dashboard: `http://localhost:5173/dashboard`
2. Seus customers antigos devem aparecer agora! ✅

### Passo 4: Remover rota temporária

**Arquivo:** `src/App.tsx`

Remova ou comente a linha:

```typescript
// <Route path="/migrate" element={<MigrateWorkspace />} /> // ← REMOVER
```

---

## 🔄 MÉTODO ALTERNATIVO: Firebase Console (Manual)

Se preferir fazer manualmente:

1. Firebase Console → **Firestore Database**
2. Coleção **customers**
3. Para cada documento:
   - Clique no documento
   - Clique **"Add field"**
   - Field: `workspaceId`
   - Type: `string`
   - Value: `real`
   - Salve

**⚠️ Desvantagem:** Trabalhoso se você tem muitos customers.

---

## 🧪 MÉTODO ALTERNATIVO: Console do Navegador

Se não quiser criar a página temporária:

1. Logue com sua conta REAL
2. Abra DevTools (F12) → Console
3. Cole este código:

```javascript
// Importar Firebase
import { collection, getDocs, writeBatch } from 'firebase/firestore';
import { db } from './src/services/firebase';

// Executar migração
(async () => {
  console.log('🚀 Iniciando migração...');

  const customersRef = collection(db, 'customers');
  const snapshot = await getDocs(customersRef);

  console.log(`📊 Encontrados ${snapshot.size} customers`);

  const batch = writeBatch(db);
  let count = 0;

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (!data.workspaceId) {
      batch.update(doc.ref, { workspaceId: 'real' });
      console.log(`✅ Migrando: ${data.name}`);
      count++;
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`🎉 ${count} customers migrados!`);
  } else {
    console.log('⚠️ Nenhum customer precisava de migração');
  }
})();
```

4. Aperte Enter
5. Aguarde a mensagem de conclusão
6. Recarregue a página (F5)

---

## 📊 Como verificar se funcionou

### No Firestore Console:

1. Abra qualquer customer
2. Verifique se aparece o campo: `workspaceId: "real"`

### No Dashboard:

1. Faça login com a conta REAL
2. Os customers devem aparecer normalmente
3. Métricas devem mostrar números corretos

### Teste de isolamento:

1. Faça logout
2. Logue com `demo@ferracini.com`
3. Dashboard deve estar **vazio** (não deve mostrar os customers reais)
4. ✅ Se estiver vazio, a migração funcionou!

---

## ⚠️ Problemas Comuns

### Problema: "Cannot read property 'commit' of undefined"

**Causa:** Firebase não está importado corretamente.

**Solução:** Use o **MÉTODO RECOMENDADO** (página de migração).

---

### Problema: Customers ainda não aparecem após migração

**Verificar:**

1. ✅ Você está logado com a conta **REAL**?
2. ✅ O documento `/users/{seu-uid}` existe no Firestore?
3. ✅ O documento tem `workspaceId: "real"`?
4. ✅ Você recarregou a página após a migração?

**Solução:**

Abra o console (F12) e verifique se há erros. Procure por:
- `permission-denied` → Problema nas Firestore Rules
- `workspaceId is not defined` → AuthContext não está pegando o workspace

---

### Problema: Migração executou mas alguns customers não foram migrados

**Causa:** Firestore Batch tem limite de 500 operações.

**Solução:** A página de migração já trata isso automaticamente. Se você usou o método do console, rode novamente.

---

## 🎯 Resumo

1. ✅ **Crie a rota** `/migrate` no App.tsx
2. ✅ **Execute** a migração pela interface visual
3. ✅ **Verifique** se os customers aparecem no Dashboard
4. ✅ **Remova** a rota temporária do App.tsx

**Tempo estimado:** 5 minutos

---

## 💡 Dica Extra

Se você quiser criar **customers demo** também:

1. Logue com `demo@ferracini.com`
2. Acesse `/register` e crie alguns customers fictícios
3. Eles serão criados automaticamente com `workspaceId: "demo"`
4. Teste fazendo logout/login entre as contas para ver o isolamento funcionando

✅ Pronto! Seus dados antigos estão migrados e o multi-tenant está funcionando!
