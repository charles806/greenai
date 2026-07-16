import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useAuth } from './auth/hooks/useAuth';
import { useAuthModal } from './auth/providers/AuthModalProvider';
import { sendMessage } from './services/geminiApi';
import { clearConversationMemory } from './utils/memoryUtils';
import { Message, Conversation, AppSettings } from './types';

export default function App() {
  const [messages, setMessages] = useLocalStorage<Message[]>('greenai-messages', []);
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('greenai-conversations', []);
  const [currentConversationId, setCurrentConversationId] = useState(() => `conv-${Date.now()}`);
  const [settings, setSettings] = useLocalStorage<AppSettings>('greenai-settings', {
    currentMode: 'basic',
    currentModel: 'gx-2.0',
    darkMode: true,
    fontSize: 'medium',
    autoSave: true,
    companionMode: false,
    selectedLanguage: 'English',
    userProfile: {
      name: '',
      hobby: '',
      personalInfo: '',
      age: '',
      occupation: '',
      interests: ''
    }
  });

  const [isTyping, setIsTyping] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // ChatGPT: sidebar open by default on desktop
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const { user, signOut } = useAuth();
  const { showAuthModal } = useAuthModal();
  const isAuthenticated = !!user;

  const handleAuthRequired = useCallback((feature: string) => {
    const messages: Record<string, { title: string; description: string }> = {
      'upload files': {
        title: 'Sign in to upload files',
        description: 'Create a free account to upload images, documents, and keep your conversations synced across devices.',
      },
      'use voice input': {
        title: 'Sign in to use voice input',
        description: 'Create a free account to record voice messages and keep your conversations synced across devices.',
      },
      'upload audio': {
        title: 'Sign in to upload audio',
        description: 'Create a free account to upload audio files and keep your conversations synced across devices.',
      },
      'view settings': {
        title: 'Sign in to access settings',
        description: 'Create a free account to customize your experience and manage your profile.',
      },
    };
    const config = messages[feature] || {
      title: 'Sign in to continue',
      description: 'Create a free account to access this feature.',
    };
    showAuthModal(config);
  }, [showAuthModal]);

  // Friendly rotating messages
  const friendlyMessages = [
    "What can I help with?",
    "How can I assist you today?",
    "What would you like to explore?",
    "Ready to help with anything!",
    "What's on your mind?",
    "How may I be of service?",
    "What can we work on together?",
    "I'm here to help!",
    "What questions do you have?",
    "Let's create something amazing!",
    "What would you like to know?",
    "Ready for our next adventure?"
  ];

  // Rotate messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % friendlyMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [friendlyMessages.length]);

  // ─── Conversation helpers ──────────────────────────────────────────────────

  const saveCurrentConversation = useCallback(() => {
    if (!Array.isArray(messages) || messages.length === 0) return;

    const existingIndex = conversations.findIndex(c => c.id === currentConversationId);
    const firstUserMsg = messages.find(m => m.sender === 'user')?.text ?? '';
    const title = firstUserMsg.slice(0, 50) + (firstUserMsg.length > 50 ? '...' : '') || 'New chat';

    const conversation: Conversation = {
      id: currentConversationId,
      title,
      messages,
      createdAt: existingIndex >= 0 ? conversations[existingIndex].createdAt : Date.now(),
      updatedAt: Date.now()
    };

    if (existingIndex >= 0) {
      const updated = [...conversations];
      updated[existingIndex] = conversation;
      setConversations(updated);
    } else {
      setConversations([conversation, ...conversations]);
    }
  }, [messages, conversations, currentConversationId]);

  const loadConversation = (conversationId: string) => {
    if (Array.isArray(messages) && messages.length > 0 && settings.autoSave) {
      saveCurrentConversation();
    }
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setMessages(conversation.messages || []);
      setCurrentConversationId(conversation.id);
    }
    // On mobile, close sidebar after selecting — on desktop keep it open (ChatGPT behaviour)
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleNewChat = () => {
    if (Array.isArray(messages) && messages.length > 0 && settings.autoSave) {
      saveCurrentConversation();
    }
    setMessages([]);
    setCurrentConversationId(`conv-${Date.now()}`);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev: any[]) => prev.filter(c => c.id !== id));
    if (id === currentConversationId) handleNewChat();
  };

  // ─── Messaging ────────────────────────────────────────────────────────────

  const handleSendMessage = async (text: string, files?: any[], webSearch?: boolean) => {
    if (isProcessing) return;

    setIsProcessing(true);
    setIsTyping(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text + (files && files.length > 0 ? ` [${files.length} file(s) attached]` : ''),
      sender: 'user',
      timestamp: Date.now(),
      mode: settings.currentMode
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    try {
      const response = await sendMessage(
        text,
        settings.currentMode,
        settings.currentModel,
        currentConversationId,
        settings.companionMode,
        settings.selectedLanguage,
        { ...settings.userProfile, email: '' },
        files,
        webSearch ?? false
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'ai',
        timestamp: Date.now(),
        mode: settings.currentMode,
        webSearch: response.webSearch ?? false,
      };

      setMessages([...newMessages, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Something went wrong. Please try again.',
        sender: 'ai',
        timestamp: Date.now(),
        mode: settings.currentMode
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsProcessing(false);
      setIsTyping(false);
    }
  };

  const handleMessageReaction = (messageId: string, reaction: 'like' | 'dislike') => {
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id !== messageId) return msg;
        return reaction === 'like'
          ? { ...msg, liked: !msg.liked, disliked: false }
          : { ...msg, disliked: !msg.disliked, liked: false };
      })
    );
  };

  const handleSettingsChange = (newSettings: AppSettings) => setSettings(newSettings);

  const handleClearMemory = () => {
    setMessages([]);
    setConversations([]);
    setCurrentConversationId(`conv-${Date.now()}`);
    clearConversationMemory();
  };

  // ─── Side effects ─────────────────────────────────────────────────────────

  // Auto-save on message change
  useEffect(() => {
    if (!Array.isArray(messages) || messages.length === 0 || !settings.autoSave) return;
    const id = setTimeout(saveCurrentConversation, 100);
    return () => clearTimeout(id);
  }, [messages, saveCurrentConversation, settings.autoSave]);

  // Document title
  useEffect(() => {
    if (!settings.currentMode) return;
    const modeNames: Record<string, string> = {
      basic: 'Basic', scary: 'Scary', green: 'Green', humanize: 'Humanize AI',
      gptzero: 'GPTzero', companion: 'Companion', utility: 'Utility',
      translator: 'Translator', law: 'LAW', service: 'SERVICE', gxdev: 'GXdev'
    };
    document.title = `GREEN AI — ${modeNames[settings.currentMode] ?? settings.currentMode}`;
  }, [settings.currentMode]);

  // ─── ChatGPT layout ───────────────────────────────────────────────────────
  // ChatGPT structure:
  //   • Full-height flex row
  //   • Sidebar is always rendered on desktop (lg+), overlaid on mobile
  //   • Main column = flex-col, fills remaining width
  //   • No visible top Header on desktop (sidebar handles nav) — Header stays for mobile burger menu
  //   • Chat area grows, input pinned to bottom

  const isEmptyChat = !Array.isArray(messages) || messages.length === 0;

  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{ backgroundColor: settings.darkMode ? '#212121' : '#ffffff' }}
    >
      {/* ── Sidebar ── */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSettingsClick={() => {
          if (isAuthenticated) {
            setIsSettingsOpen(true);
          } else {
            handleAuthRequired('view settings');
          }
        }}
        onToggleDarkMode={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
        conversations={Array.isArray(conversations) ? conversations : []}
        currentConversationId={currentConversationId}
        onSelectConversation={loadConversation}
        onDeleteConversation={handleDeleteConversation}
        onNewConversation={handleNewChat}
        darkMode={settings.darkMode}
        userEmail={user?.email ?? ''}
        isAuthenticated={isAuthenticated}
        onSignOut={signOut}
      />

      {/* ── Main column ── */}
      <div className="flex flex-col flex-1 min-w-0 relative">

        {/* Mobile-only header (burger + new chat) */}
        <Header
          currentMode={settings.currentMode}
          currentModel={settings.currentModel}
          darkMode={settings.darkMode}
          companionMode={settings.companionMode}
          selectedLanguage={settings.selectedLanguage}
          onSidebarToggle={() => setIsSidebarOpen(prev => !prev)}
          onNewChat={handleNewChat}
        />

        {/* Chat body — scrollable */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {isEmptyChat ? (
            /* ── Empty state: centred greeting like ChatGPT ── */
            <div className="flex-1 flex flex-col items-center justify-center px-4 pb-32">
              <h1
                className="text-3xl font-semibold mb-2 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 bg-clip-text text-transparent transition-all duration-500 ease-in-out"
                style={{
                  fontFamily: "'Söhne', ui-sans-serif, system-ui, sans-serif"
                }}
              >
                {friendlyMessages[currentMessageIndex]}
              </h1>
            </div>
          ) : (
            <ChatArea
              messages={messages}
              isTyping={isTyping}
              darkMode={settings.darkMode}
              currentMode={settings.currentMode}
              companionMode={settings.companionMode}
              userProfile={{ ...settings.userProfile, email: '' }}
              onMessageReaction={handleMessageReaction}
            />
          )}
        </div>

        {/* ── Input bar — pinned to bottom, centred, max-width like ChatGPT ── */}
        <div
          className="w-full px-4 pb-4 pt-2"
          style={{
            background: settings.darkMode
              ? 'linear-gradient(to top, #212121 80%, transparent)'
              : 'linear-gradient(to top, #ffffff 80%, transparent)',
          }}
        >
          <div className="max-w-3xl mx-auto">
            <ChatInput
              onSendMessage={(message, files, webSearch) => handleSendMessage(message, files, webSearch)}
              disabled={isProcessing}
              placeholder="Message GREEN AI"
              darkMode={settings.darkMode}
              onAuthRequired={isAuthenticated ? undefined : handleAuthRequired}
            />
            <p
              className="text-center mt-2"
              style={{ fontSize: '11px', color: settings.darkMode ? '#8e8ea0' : '#acacac' }}
            >
              GREEN AI can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>

      {/* ── Settings modal ── */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onClearMemory={handleClearMemory}
        darkMode={settings.darkMode}
      />
    </div>
  );
}