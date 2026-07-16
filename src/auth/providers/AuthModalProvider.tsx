import { createContext, useState, useCallback, useContext, type ReactNode } from 'react';
import { AuthModal, type AuthModalConfig } from '../components/AuthModal';

interface AuthModalContextType {
  showAuthModal: (config: AuthModalConfig) => void;
  hideAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [modalConfig, setModalConfig] = useState<AuthModalConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const showAuthModal = useCallback((config: AuthModalConfig) => {
    setModalConfig(config);
    setIsOpen(true);
  }, []);

  const hideAuthModal = useCallback(() => {
    setIsOpen(false);
    setModalConfig(null);
  }, []);

  return (
    <AuthModalContext.Provider value={{ showAuthModal, hideAuthModal }}>
      {children}
      <AuthModal isOpen={isOpen} config={modalConfig} onClose={hideAuthModal} />
    </AuthModalContext.Provider>
  );
}
