import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { UserSchema, FirebaseUserSchema, User, WorkspaceId } from '@/schemas/userSchema';
import { getCurrentTimestamp } from '@/utils';

const COLLECTION_NAME = 'users';

/**
 *  Busca os dados do usuário no Firestore
 *
 * @param uid - ID do usuário (vem do Firebase Auth)
 * @returns Dados do usuário incluindo workspaceId
 *
 * Essa funçao é chamada APÓS o login para descobrir
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
