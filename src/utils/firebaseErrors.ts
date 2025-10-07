import { FirebaseError } from 'firebase/app';

// Mapeamento de erros do Firebase Auth
const authErrorMessages: Record<string, string> = {
  'auth/invalid-email': 'Email inválido',
  'auth/user-disabled': 'Usuário desativado',
  'auth/user-not-found': 'Usuário não encontrado',
  'auth/wrong-password': 'Senha incorreta',
  'auth/email-already-in-use': 'Email já cadastrado',
  'auth/weak-password': 'Senha muito fraca (mínimo 6 caracteres)',
  'auth/operation-not-allowed': 'Operação não permitida',
  'auth/invalid-credential': 'Email ou senha incorretos',
  'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
  'auth/network-request-failed': 'Erro de conexão. Verifique sua internet',
};

// Mapeamento de erros do Firestore
const firestoreErrorMessages: Record<string, string> = {
  'permission-denied': 'Você não tem permissão para esta operação',
  unavailable: 'Serviço temporariamente indisponível. Tente novamente',
  'not-found': 'Documento não encontrado',
  'already-exists': 'Documento já existe',
  'resource-exhausted': 'Limite de requisições excedido',
  unauthenticated: 'Você precisa estar autenticado',
  aborted: 'Operação cancelada',
  cancelled: 'Operação cancelada pelo usuário',
  'data-loss': 'Perda de dados detectada',
  'deadline-exceeded': 'Tempo limite excedido',
  'failed-precondition': 'Pré-condição falhou',
  internal: 'Erro interno do servidor',
  'invalid-argument': 'Argumento inválido',
  'out-of-range': 'Valor fora do intervalo permitido',
  unknown: 'Erro desconhecido',
};

export function getFirebaseErrorMessage(error: unknown): string {
  // Se não for erro do Firebase, retorna mensagem genérica
  if (!(error instanceof FirebaseError)) {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Ocorreu um erro inesperado';
  }

  // Verifica se é erro de Auth
  if (error.code.startsWith('auth/')) {
    return authErrorMessages[error.code] || 'Erro de autenticação';
  }

  // Verifica se é erro de Firestore
  return firestoreErrorMessages[error.code] || 'Erro ao acessar banco de dados';
}
