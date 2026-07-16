export interface ConversationMessage {
  messageType: string;
  id: string;
  userMessage: string;
  aiResponse: string;
  timestamp: number;
  mode: string;
  topics: string[];
  keywords: string[];
  importance: number;
  context: string;
  userIntent: string;
}

export interface UserProfile {
  name?: string;
  hobby?: string;
  personalInfo?: string;
  age?: string;
  occupation?: string;
  preferences?: string[];
  lastUpdated?: number;
}

export interface MemoryStats {
  totalConversations: number;
  totalUserMessages: number;
  totalAiResponses: number;
  averageImportance: number;
  topTopics: string[];
  memoryHealth: 'excellent' | 'good' | 'fair' | 'poor';
  lastActivity: number;
}

const MEMORY_KEY = 'green_ai_conversations';
const USER_PROFILE_KEY = 'green_ai_user_profile';
const MAX_MEMORY_ENTRIES = 10000; // Increased for stronger memory

// Enhanced topic classification
const classifyTopics = (text: string): string[] => {
  const topicKeywords = {
    technology: ['tech', 'computer', 'software', 'programming', 'code', 'ai', 'artificial intelligence', 'machine learning', 'data', 'algorithm'],
    science: ['science', 'research', 'experiment', 'theory', 'physics', 'chemistry', 'biology', 'mathematics', 'study'],
    health: ['health', 'medical', 'doctor', 'medicine', 'fitness', 'exercise', 'diet', 'wellness', 'mental health'],
    education: ['learn', 'study', 'school', 'university', 'education', 'teaching', 'knowledge', 'academic', 'course'],
    business: ['business', 'work', 'job', 'career', 'money', 'finance', 'investment', 'company', 'management'],
    entertainment: ['movie', 'music', 'game', 'fun', 'entertainment', 'hobby', 'sport', 'art', 'creative'],
    personal: ['family', 'friend', 'relationship', 'personal', 'life', 'feeling', 'emotion', 'experience'],
    travel: ['travel', 'trip', 'vacation', 'country', 'city', 'culture', 'adventure', 'explore'],
    food: ['food', 'cooking', 'recipe', 'restaurant', 'eat', 'meal', 'cuisine', 'nutrition'],
    philosophy: ['philosophy', 'meaning', 'purpose', 'ethics', 'morality', 'existence', 'consciousness'],
    current_events: ['news', 'politics', 'world', 'society', 'government', 'economy', 'climate', 'environment'],
    creative: ['creative', 'writing', 'design', 'art', 'music', 'poetry', 'story', 'imagination'],
    romantic: ['love', 'romance', 'dating', 'relationship', 'attraction', 'feelings', 'intimate', 'affection'],
    emotional: ['emotion', 'feeling', 'mood', 'happy', 'sad', 'excited', 'worried', 'anxious', 'joy'],
    general: ['help', 'question', 'information', 'advice', 'support', 'assistance']
  };

  const lowerText = text.toLowerCase();
  const topics: string[] = [];

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      topics.push(topic);
    }
  }

  return topics.length > 0 ? topics : ['general'];
};

// Extract keywords from text
const extractKeywords = (text: string): string[] => {
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
  
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });
  
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
};

// Calculate importance score
const calculateImportance = (userMessage: string, aiResponse: string): number => {
  let score = 5; // Base score
  
  const importantIndicators = [
    'important', 'urgent', 'critical', 'remember', 'don\'t forget',
    'my name is', 'i am', 'i work', 'i live', 'i like', 'i love',
    'help me', 'problem', 'issue', 'error', 'fix', 'solve'
  ];
  
  const combinedText = (userMessage + ' ' + aiResponse).toLowerCase();
  
  importantIndicators.forEach(indicator => {
    if (combinedText.includes(indicator)) {
      score += 1;
    }
  });
  
  // Length bonus for detailed conversations
  if (combinedText.length > 500) score += 1;
  if (combinedText.length > 1000) score += 1;
  if (combinedText.length > 2000) score += 1; // Bonus for very long conversations
  
  return Math.min(score, 10);
};

// Detect user intent
const detectUserIntent = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('help') || lowerMessage.includes('assist')) return 'help_request';
  if (lowerMessage.includes('explain') || lowerMessage.includes('what is')) return 'information_seeking';
  if (lowerMessage.includes('how to') || lowerMessage.includes('tutorial')) return 'learning';
  if (lowerMessage.includes('problem') || lowerMessage.includes('error')) return 'problem_solving';
  if (lowerMessage.includes('opinion') || lowerMessage.includes('think')) return 'opinion_seeking';
  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) return 'recommendation';
  if (lowerMessage.includes('my name') || lowerMessage.includes('i am')) return 'personal_sharing';
  
  return 'general_conversation';
};

// Extract user profile information
const extractUserProfile = (message: string): Partial<UserProfile> => {
  const profile: Partial<UserProfile> = {};
  const lowerMessage = message.toLowerCase();
  
  // Name extraction
  const nameMatch = message.match(/(?:my name is|i'm|i am|call me)\s+([a-zA-Z]+)/i);
  if (nameMatch) {
    profile.name = nameMatch[1];
  }
  
  // Age extraction
  const ageMatch = message.match(/(?:i am|i'm)\s+(\d+)\s+(?:years old|year old)/i);
  if (ageMatch) {
    profile.age = ageMatch[1];
  }
  
  // Occupation extraction
  const occupationMatch = message.match(/(?:i work as|i am a|i'm a|my job is)\s+([^.!?]+)/i);
  if (occupationMatch) {
    profile.occupation = occupationMatch[1].trim();
  }
  
  // Hobby extraction
  const hobbyMatch = message.match(/(?:i like|i love|i enjoy|my hobby is)\s+([^.!?]+)/i);
  if (hobbyMatch) {
    profile.hobby = hobbyMatch[1].trim();
  }
  
  // General personal info
  if (lowerMessage.includes('i am') || lowerMessage.includes('i like') || lowerMessage.includes('i work')) {
    profile.personalInfo = message;
  }
  
  return profile;
};

export const saveConversationMessage = (
  conversationId: string,
  userMessage: string,
  aiResponse: string,
  mode: string,
  _messageIndex?: number
): void => {
  try {
    const conversations = getConversationHistory();
    
    const topics = classifyTopics(userMessage + ' ' + aiResponse);
    const keywords = extractKeywords(userMessage + ' ' + aiResponse);
    const importance = calculateImportance(userMessage, aiResponse);
    const userIntent = detectUserIntent(userMessage);
    
    const newMessage: ConversationMessage = {
      id: conversationId,
      userMessage,
      aiResponse,
      timestamp: Date.now(),
      mode,
      topics,
      keywords,
      importance,
      context: `${mode} mode conversation`,
      userIntent,
      messageType: ""
    };
    
    conversations.push(newMessage);
    
    // Keep only the most recent entries for performance
    if (conversations.length > MAX_MEMORY_ENTRIES) {
      // Remove oldest entries but keep important ones
      const sortedByImportance = conversations.sort((a, b) => b.importance - a.importance);
      const importantMessages = sortedByImportance.slice(0, Math.floor(MAX_MEMORY_ENTRIES * 0.3));
      const recentMessages = conversations.slice(-Math.floor(MAX_MEMORY_ENTRIES * 0.7));
      
      // Combine and remove duplicates
      const combinedMessages = [...importantMessages, ...recentMessages]
        .filter((item, index, self) => index === self.findIndex(t => t.id === item.id))
        .sort((a, b) => a.timestamp - b.timestamp);
      
      localStorage.setItem(MEMORY_KEY, JSON.stringify(combinedMessages));
      return;
    }
    
    localStorage.setItem(MEMORY_KEY, JSON.stringify(conversations));
    
    // Update user profile if personal information is detected
    const profileInfo = extractUserProfile(userMessage);
    if (Object.keys(profileInfo).length > 0) {
      updateUserProfile(profileInfo);
    }
  } catch (error) {
    console.error('Error saving conversation:', error);
  }
};

export const getConversationHistory = (conversationId?: string): ConversationMessage[] => {
  try {
    const stored = localStorage.getItem(MEMORY_KEY);
    const conversations: ConversationMessage[] = stored ? JSON.parse(stored) : [];
    
    if (conversationId) {
      return conversations.filter(conv => conv.id === conversationId);
    }
    
    return conversations;
  } catch (error) {
    console.error('Error getting conversation history:', error);
    return [];
  }
};

export const searchConversations = (query: string, limit: number = 10): ConversationMessage[] => {
  try {
    const conversations = getConversationHistory();
    const lowerQuery = query.toLowerCase();
    
    const scored = conversations.map(conv => {
      let score = 0;
      const searchText = (conv.userMessage + ' ' + conv.aiResponse).toLowerCase();
      
      // Exact phrase match
      if (searchText.includes(lowerQuery)) score += 10;
      
      // Keyword matches
      const queryWords = lowerQuery.split(' ');
      queryWords.forEach(word => {
        if (searchText.includes(word)) score += 2;
        if (conv.keywords.includes(word)) score += 3;
      });
      
      // Topic relevance
      conv.topics.forEach(topic => {
        if (lowerQuery.includes(topic)) score += 5;
      });
      
      // Importance bonus
      score += conv.importance * 0.5;
      
      return { ...conv, score };
    });
    
    return scored
      .filter(conv => conv.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error('Error searching conversations:', error);
    return [];
  }
};

export const getRelevantMemories = (query: string, limit: number = 5): ConversationMessage[] => {
  return searchConversations(query, limit);
};

export const getMemoriesByTopic = (topic: string, limit: number = 10): ConversationMessage[] => {
  try {
    const conversations = getConversationHistory();
    return conversations
      .filter(conv => conv.topics.includes(topic.toLowerCase()))
      .sort((a, b) => b.importance - a.importance)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting memories by topic:', error);
    return [];
  }
};

export const getUserProfile = (): UserProfile => {
  try {
    const stored = localStorage.getItem(USER_PROFILE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error getting user profile:', error);
    return {};
  }
};

export const updateUserProfile = (updates: Partial<UserProfile>): void => {
  try {
    const currentProfile = getUserProfile();
    const updatedProfile = {
      ...currentProfile,
      ...updates,
      lastUpdated: Date.now()
    };
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updatedProfile));
  } catch (error) {
    console.error('Error updating user profile:', error);
  }
};

export const getMemoryStats = (): MemoryStats => {
  try {
    const conversations = getConversationHistory();
    
    if (conversations.length === 0) {
      return {
        totalConversations: 0,
        totalUserMessages: 0,
        totalAiResponses: 0,
        averageImportance: 0,
        topTopics: [],
        memoryHealth: 'poor',
        lastActivity: 0
      };
    }
    
    const totalConversations = conversations.length;
    const totalUserMessages = conversations.length;
    const totalAiResponses = conversations.length;
    const averageImportance = conversations.reduce((sum, conv) => sum + conv.importance, 0) / conversations.length;
    
    // Count topics
    const topicCount = new Map<string, number>();
    conversations.forEach(conv => {
      conv.topics.forEach(topic => {
        topicCount.set(topic, (topicCount.get(topic) || 0) + 1);
      });
    });
    
    const topTopics = Array.from(topicCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);
    
    const lastActivity = Math.max(...conversations.map(conv => conv.timestamp));
    
    let memoryHealth: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
    if (totalConversations > 100) memoryHealth = 'excellent';
    else if (totalConversations > 50) memoryHealth = 'good';
    else if (totalConversations > 10) memoryHealth = 'fair';
    
    return {
      totalConversations,
      totalUserMessages,
      totalAiResponses,
      averageImportance,
      topTopics,
      memoryHealth,
      lastActivity
    };
  } catch (error) {
    console.error('Error getting memory stats:', error);
    return {
      totalConversations: 0,
      totalUserMessages: 0,
      totalAiResponses: 0,
      averageImportance: 0,
      topTopics: [],
      memoryHealth: 'poor',
      lastActivity: 0
    };
  }
};

export const clearConversationMemory = (): void => {
  try {
    localStorage.removeItem(MEMORY_KEY);
    localStorage.removeItem(USER_PROFILE_KEY);
  } catch (error) {
    console.error('Error clearing memory:', error);
  }
};

export const getLastUserMessage = (): string | null => {
  try {
    const conversations = getConversationHistory();
    if (conversations.length === 0) return null;
    
    // Find the most recent user message
    for (let i = conversations.length - 1; i >= 0; i--) {
      if (conversations[i].userMessage) {
        return conversations[i].userMessage;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting last user message:', error);
    return null;
  }
};

export const getConversationContext = (conversationId: string, limit: number = 10): string => {
  try {
    const conversations = getConversationHistory(conversationId);
    
    if (conversations.length === 0) {
      return "No previous conversation context found.";
    }
    
    const recentConversations = conversations.slice(-limit);
    let context = "Previous conversation context:\n\n";
    
    recentConversations.forEach((conv, _index) => {
      const date = new Date(conv.timestamp).toLocaleDateString();
      const time = new Date(conv.timestamp).toLocaleTimeString();
      
      context += `[${date} ${time}] User: ${conv.userMessage}\n`;
      context += `[${date} ${time}] AI: ${conv.aiResponse}\n\n`;
    });
    
    return context;
  } catch (error) {
    console.error('Error getting conversation context:', error);
    return "Error retrieving conversation context.";
  }
};

export const getConversationSummary = (limit: number = 10): string => {
  try {
    const conversations = getConversationHistory().slice(-limit);
    
    if (conversations.length === 0) {
      return "No conversation history found.";
    }
    
    let summary = `Here's a summary of our recent conversations:\n\n`;
    
    conversations.forEach((conv, index) => {
      const date = new Date(conv.timestamp).toLocaleDateString();
      const time = new Date(conv.timestamp).toLocaleTimeString();
      
      summary += `**Conversation ${index + 1}** (${date} at ${time}):\n`;
      summary += `You: "${conv.userMessage}"\n`;
      summary += `Me: "${conv.aiResponse.substring(0, 150)}${conv.aiResponse.length > 150 ? '...' : ''}"\n`;
      summary += `Topics: ${conv.topics.join(', ')}\n`;
      summary += `Importance: ${conv.importance}/10\n\n`;
    });
    
    return summary;
  } catch (error) {
    console.error('Error getting conversation summary:', error);
    return "Error retrieving conversation summary.";
  }
};