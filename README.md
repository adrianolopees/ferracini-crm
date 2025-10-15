# Ferracini CRM - Sistema de Gestão de Reservas

Sistema profissional de CRM para gerenciamento de reservas de produtos da loja Ferracini. Desenvolvido com React, TypeScript, Firebase e Tailwind CSS.

## Funcionalidades

### Dashboard
- Visualização em tempo real de métricas principais
- Cards interativos com modals de detalhes
- Indicadores de urgência (clientes aguardando 7+ dias)
- Cálculo automático de tempo médio de espera

### Gestão de Clientes
- **Cadastro de Reservas**: Formulário validado com Zod para registro de novos clientes
- **Busca Inteligente**: Pesquisa por nome, telefone, modelo ou cor
- **Contato via WhatsApp**: Integração direta com WhatsApp Web
- **Indicadores Visuais**: Cores para identificar urgência de atendimento

### Segurança
- Autenticação via Firebase Auth
- Rotas protegidas (acesso apenas para usuários autenticados)
- Regras de segurança do Firestore configuradas

## Stack Tecnológica

### Core
- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Firebase 12** - Backend (Firestore + Auth)

### UI/UX
- **Tailwind CSS 4** - Estilização
- **Framer Motion** - Animações suaves
- **Radix UI** - Componentes acessíveis (Dialog)
- **React Hot Toast** - Notificações
- **React Router DOM** - Navegação

### Qualidade de Código
- **ESLint 9** - Linting com flat config
- **Prettier** - Formatação automática
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

### Utilitários
- **date-fns** - Manipulação de datas
- **@hookform/resolvers** - Integração React Hook Form + Zod

## Pré-requisitos

- Node.js 18+ ou superior
- Yarn ou npm
- Conta no Firebase (Firestore + Authentication)

## Instalação

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd salvar-contatos-loja-v2
```

### 2. Instale as dependências
```bash
yarn install
# ou
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

Preencha as credenciais do Firebase no arquivo `.env`:
```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

### 4. Configure o Firebase

#### Firestore Database
Crie uma coleção chamada `customers` com a seguinte estrutura:
```typescript
{
  name: string
  phone: string
  model: string
  color: string
  size: string
  createdAt: Timestamp
}
```

#### Authentication
Ative o método de autenticação **Email/Password** no console do Firebase.

#### Regras de Segurança do Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /customers/{customerId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Execute o projeto

```bash
# Modo desenvolvimento
yarn dev

# Build para produção
yarn build

# Preview da build
yarn preview

# Linting
yarn lint

# Formatação
yarn format
```

O servidor de desenvolvimento estará rodando em `http://localhost:5173`

## Estrutura do Projeto

```
salvar-contatos-loja-v2/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes UI reutilizáveis
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── DialogModal.tsx
│   │   ├── animations/      # Componentes com animações
│   │   │   ├── AnimatedButton.tsx
│   │   │   ├── AnimatedContainer.tsx
│   │   │   └── AnimatedList.tsx
│   │   ├── CustomerListModal.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── RegisterCustomer.tsx
│   │   ├── SearchCustomers.tsx
│   │   └── Login.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx  # Contexto de autenticação
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useDashboardMetrics.ts
│   │   └── useCustomersList.ts
│   ├── lib/
│   │   └── firebase.ts      # Configuração do Firebase
│   ├── utils/
│   │   └── date.ts          # Funções utilitárias
│   ├── App.tsx
│   └── main.tsx
├── public/                   # Assets estáticos
├── .env.example             # Template de variáveis de ambiente
├── vite.config.ts           # Configuração do Vite
├── tsconfig.json            # Configuração do TypeScript
├── eslint.config.js         # Configuração do ESLint
├── .prettierrc              # Configuração do Prettier
└── package.json
```

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `yarn dev` | Inicia o servidor de desenvolvimento |
| `yarn build` | Gera build de produção na pasta `dist/` |
| `yarn preview` | Preview da build de produção |
| `yarn lint` | Executa o ESLint para encontrar problemas |
| `yarn format` | Formata código com Prettier |

## Deploy

### Vercel (Recomendado)

O projeto já está configurado com `vercel.json` para deploy automático:

1. Instale o Vercel CLI:
```bash
npm i -g vercel
```

2. Faça o deploy:
```bash
vercel
```

3. Configure as variáveis de ambiente no painel da Vercel (Settings > Environment Variables)

### Firebase Hosting (Alternativa)

```bash
# Instale o Firebase CLI
npm install -g firebase-tools

# Login no Firebase
firebase login

# Inicialize o projeto
firebase init hosting

# Build e deploy
yarn build
firebase deploy
```

## Convenções de Código

### TypeScript
- Strict mode habilitado
- Path alias: `@/` para imports (ex: `import { Button } from '@/components/ui/Button'`)

### Estilo de Código
- Single quotes para strings
- Ponto e vírgula obrigatório
- Tab width: 2 espaços
- Print width: 80 caracteres

### Commits
Siga a convenção de commits semânticos:
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

## Próximas Funcionalidades (Roadmap)

- [ ] Histórico de clientes contactados
- [ ] Paginação na busca de clientes
- [ ] Filtros avançados (cor, numeração, data)
- [ ] Gráficos e visualizações de dados
- [ ] Modo escuro
- [ ] PWA (funcionar offline)
- [ ] Exportar relatórios em PDF/Excel

Veja o arquivo `TODO.md` para o roadmap completo.

## Troubleshooting

### Erro de autenticação do Firebase
Verifique se:
- As credenciais no `.env` estão corretas
- O método Email/Password está ativado no Firebase Console
- As regras de segurança do Firestore permitem acesso autenticado

### Erro ao fazer build
```bash
# Limpe o cache e reinstale
rm -rf node_modules yarn.lock
yarn install
yarn build
```

### Porta 5173 já está em uso
Altere a porta em `vite.config.ts`:
```typescript
server: {
  port: 3000, // ou outra porta disponível
}
```

## Contribuindo

1. Crie uma branch para sua feature: `git checkout -b feat/nova-feature`
2. Commit suas mudanças: `git commit -m 'feat: adiciona nova feature'`
3. Push para a branch: `git push origin feat/nova-feature`
4. Abra um Pull Request

## Licença

Este projeto é proprietário e confidencial. Todos os direitos reservados.

## Contato

Para dúvidas ou sugestões, entre em contato com a equipe de desenvolvimento.

---

Desenvolvido com React + TypeScript + Firebase
