import { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User, UserCredential } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { getUserWorkspace } from '@/repositories/userRepository';
import { WorkspaceId } from '@/schemas/userSchema';

interface AuthProviderProps {
  children?: ReactNode;
}

export interface AuthContextType {
  user: User | null;
  workspaceId: WorkspaceId | null;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  loading: boolean;
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [workspaceId, setWorkspaceId] = useState<WorkspaceId | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

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
      setWorkspaceId(null);
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
