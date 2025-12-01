# 🔄 Plano de Refatoração: Spinners e Skeletons

## 📋 Objetivo
Padronizar e melhorar a experiência de loading em todo o projeto, substituindo spinners inline por componentes reutilizáveis e criando skeletons para melhor UX.

---

## 🎯 Fase 1: Melhorar o Componente Spinner Existente

### Passo 1.1: Atualizar `src/components/ui/Spinner.tsx`
**Objetivo:** Adicionar mais tamanhos e variações de cor

**Código atual:**
- Tem apenas: `sm`, `md`, `lg`, `fullscreen`
- Cor fixa: azul

**Melhorias a fazer:**
```typescript
interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'fullscreen';
  color?: 'blue' | 'purple' | 'green' | 'yellow' | 'cyan' | 'teal' | 'emerald' | 'white';
}
```

**Adicionar tamanho `xs`:**
```typescript
const sizes = {
  xs: 'w-3 h-3 border-2',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
};
```

**Adicionar cores:**
```typescript
const colors = {
  blue: 'border-blue-600 border-t-transparent',
  purple: 'border-purple-600 border-t-transparent',
  green: 'border-green-600 border-t-transparent',
  yellow: 'border-yellow-600 border-t-transparent',
  cyan: 'border-cyan-600 border-t-transparent',
  teal: 'border-teal-600 border-t-transparent',
  emerald: 'border-emerald-600 border-t-transparent',
  white: 'border-white border-t-transparent',
};
```

**Atualizar o return:**
```typescript
return (
  <div
    className={`${sizes[size]} ${colors[color]} rounded-full animate-spin`}
  />
);
```

---

## 🎨 Fase 2: Criar Componentes Skeleton

### Passo 2.1: Criar `src/components/ui/Skeleton.tsx`
**Objetivo:** Componente base reutilizável

```typescript
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200';

  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`} />
  );
}

export default Skeleton;
```

### Passo 2.2: Criar `src/components/skeletons/CustomerSkeleton.tsx`
**Objetivo:** Skeleton para cards de clientes

```typescript
import Skeleton from '@/components/ui/Skeleton';

function CustomerSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <Skeleton variant="circular" className="w-10 h-10" />
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-20" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>

      <div className="flex gap-2 mt-4">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}

export default CustomerSkeleton;
```

### Passo 2.3: Criar `src/components/skeletons/MetricCardSkeleton.tsx`
**Objetivo:** Skeleton para cards de métricas

```typescript
import Skeleton from '@/components/ui/Skeleton';

function MetricCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <Skeleton variant="circular" className="w-4 h-4" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-8 w-16 mb-1" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export default MetricCardSkeleton;
```

### Passo 2.4: Criar `src/components/skeletons/index.ts`
**Objetivo:** Exportar todos os skeletons

```typescript
export { default as CustomerSkeleton } from './CustomerSkeleton';
export { default as MetricCardSkeleton } from './MetricCardSkeleton';
```

### Passo 2.5: Atualizar `src/components/ui/index.ts`
**Objetivo:** Exportar o Skeleton base

Adicionar:
```typescript
export { default as Skeleton } from './Skeleton';
```

---

## 🔧 Fase 3: Substituir Spinners Inline

### Passo 3.1: ActionCard.tsx (linha 44)
**Arquivo:** `src/components/dashboard/ActionCard.tsx`

**De:**
```typescript
{loading ? <i className={`fa-solid fa-spinner fa-spin ${colors.spinner}`} /> : value}
```

**Para:**
```typescript
import Spinner from '@/components/ui/Spinner';

// No JSX:
{loading ? <Spinner size="md" color={colorScheme} /> : value}
```

**Observação:** O `colorScheme` já vem como prop ('blue' | 'yellow' | 'green')

---

### Passo 3.2: MetricCard.tsx (linha 71)
**Arquivo:** `src/components/dashboard/MetricCard.tsx`

**De:**
```typescript
{loading ? <i className={`fa-solid fa-spinner fa-spin ${colors.icon} text-2xl`} /> : value}
```

**Para:**
```typescript
import Spinner from '@/components/ui/Spinner';

// Mapear colorScheme para cores do Spinner
const spinnerColorMap = {
  purple: 'purple',
  blue: 'blue',
  green: 'green',
  emerald: 'emerald',
  teal: 'teal',
  cyan: 'cyan',
} as const;

// No JSX:
{loading ? <Spinner size="md" color={spinnerColorMap[colorScheme]} /> : value}
```

---

### Passo 3.3: CustomerListModal.tsx (linha 50)
**Arquivo:** `src/components/modals/CustomerListModal.tsx`

**OPÇÃO A - Usar Spinner (mais simples):**
```typescript
import Spinner from '@/components/ui/Spinner';

{loading ? (
  <div className="flex justify-center items-center py-12">
    <Spinner size="lg" color="blue" />
  </div>
) : ...
```

**OPÇÃO B - Usar Skeleton (mais profissional):** ⭐ RECOMENDADO
```typescript
import { CustomerSkeleton } from '@/components/skeletons';

{loading ? (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => <CustomerSkeleton key={i} />)}
  </div>
) : ...
```

---

### Passo 3.4: TopProductsChart.tsx (linha 37)
**Arquivo:** `src/components/dashboard/TopProductsChart.tsx`

**De:**
```typescript
<i className="fa-solid fa-spinner fa-spin text-4xl text-blue-500"></i>
```

**Para:**
```typescript
import Spinner from '@/components/ui/Spinner';

<Spinner size="lg" color="blue" />
```

---

### Passo 3.5: Navigation.tsx (linha 78)
**Arquivo:** `src/components/ui/Navigation.tsx`

**De:**
```typescript
<i className="fa-solid fa-spinner fa-spin text-lg"></i>
```

**Para:**
```typescript
import Spinner from '@/components/ui/Spinner';

<Spinner size="sm" color="white" />
```

**Observação:** Verificar se precisa de `color="white"` dependendo do background

---

### Passo 3.6: History.tsx (linha 306)
**Arquivo:** `src/pages/History.tsx`

**OPÇÃO A - Usar Spinner:**
```typescript
import Spinner from '@/components/ui/Spinner';

{loading ? (
  <div className="text-center py-12">
    <Spinner size="lg" color="blue" />
    <p className="text-gray-600 mt-4">Carregando...</p>
  </div>
) : ...
```

**OPÇÃO B - Usar Skeleton:** ⭐ RECOMENDADO
```typescript
import { CustomerSkeleton } from '@/components/skeletons';

{loading ? (
  <div className="mt-6 space-y-4">
    {[1, 2, 3, 4, 5].map((i) => <CustomerSkeleton key={i} />)}
  </div>
) : ...
```

---

### Passo 3.7: MigrateWorkspace.tsx (linha 177)
**Arquivo:** `src/pages/MigrateWorkspace.tsx`

**De:**
```typescript
{status === 'running' && <i className="fa-solid fa-spinner fa-spin mr-2"></i>}
```

**Para:**
```typescript
import Spinner from '@/components/ui/Spinner';

{status === 'running' && <Spinner size="sm" color="blue" />}
```

**Observação:** Adicionar `className="mr-2"` no Spinner ou wrapper se necessário

---

## ✅ Fase 4: Checklist de Validação

### 4.1: Testes Visuais
- [ ] Abrir Dashboard e verificar loading dos MetricCards
- [ ] Abrir Dashboard e verificar loading dos ActionCards
- [ ] Clicar em cards do Dashboard e verificar CustomerListModal
- [ ] Abrir página History e verificar loading
- [ ] Testar logout/login para verificar Navigation spinner
- [ ] Testar MigrateWorkspace (se aplicável)
- [ ] Verificar TopProductsChart loading

### 4.2: Testes de Responsividade
- [ ] Mobile (320px - 480px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (1280px+)

### 4.3: Testes de Performance
- [ ] Verificar se animações não causam lag
- [ ] Confirmar que skeletons aparecem instantaneamente
- [ ] Validar transição suave entre skeleton → conteúdo

---

## 📊 Fase 5: Melhorias Futuras (Opcional)

### 5.1: Criar mais variações de Skeleton
- `ChartSkeleton` para gráficos
- `TableSkeleton` para tabelas
- `FormSkeleton` para formulários

### 5.2: Adicionar transições suaves
```typescript
// No componente que usa skeleton:
<div className="transition-opacity duration-300">
  {loading ? <Skeleton /> : <Content />}
</div>
```

### 5.3: Skeleton com gradiente animado
Atualizar `Skeleton.tsx` para usar:
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

---

## 🎯 Resultado Esperado

### Antes:
❌ Spinners inconsistentes (FontAwesome + Tailwind)
❌ Loading states genéricos
❌ UX menos polida

### Depois:
✅ Componentes padronizados e reutilizáveis
✅ Skeletons que refletem o conteúdo real
✅ UX profissional e moderna
✅ Código mais limpo e manutenível

---

## 📝 Notas Importantes

1. **Imports:** Sempre verificar os imports após cada alteração
2. **TypeScript:** Garantir que as props estão tipadas corretamente
3. **Testes:** Testar cada arquivo modificado individualmente
4. **Git:** Fazer commits incrementais:
   - "refactor: improve Spinner component with colors and sizes"
   - "feat: add Skeleton components"
   - "refactor: replace inline spinners in ActionCard and MetricCard"
   - "refactor: replace inline spinners in modals and pages"

5. **Prioridade de implementação:**
   - **Alta:** Fase 1 e Fase 3 (Spinners)
   - **Média:** Fase 2 (Skeletons básicos)
   - **Baixa:** Fase 5 (Melhorias futuras)

---

## 🚀 Tempo Estimado

- Fase 1: 15-20 minutos
- Fase 2: 30-40 minutos
- Fase 3: 40-50 minutos
- Fase 4: 20-30 minutos
- **Total:** ~2-2.5 horas

---

**Boa sorte! 🎉**
