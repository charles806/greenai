import React from 'react';
import { X, Leaf, Zap, Heart, Trash2, Wand2, Search, Briefcase, Languages, Globe, Scale, GraduationCap, User, Coffee, Info, ChevronDown, ChevronRight, Code } from 'lucide-react';
import { AIMode, AIModel, AppSettings, UserProfile } from '../types';
import { getMemoryStats } from '../utils/memoryUtils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onClearMemory: () => void;
  darkMode: boolean;
}

const languages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
  'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Dutch', 'Swedish',
  'Norwegian', 'Danish', 'Finnish', 'Polish', 'Turkish', 'Greek', 'Hebrew',
  'Thai', 'Vietnamese', 'Indonesian', 'Malay', 'Filipino', 'Swahili'
];

const modelModes = {
  'gx-1.5': [
    { value: 'basic' as AIMode, label: 'Basic Mode', description: 'Precise and concise answers', icon: Zap, color: 'text-blue-400' },
    { value: 'green' as AIMode, label: 'Green Mode', description: 'Helpful advice and guidance', icon: Leaf, color: 'text-emerald-400' }
  ],
  'gx-2.0': [
    { value: 'basic' as AIMode, label: 'Basic Mode', description: 'Precise and concise answers', icon: Zap, color: 'text-blue-400' },
    { value: 'scary' as AIMode, label: 'Scary Mode', description: 'Elaborate and detailed responses', icon: Heart, color: 'text-red-400' },
    { value: 'companion' as AIMode, label: 'Companion Mode', description: 'Emotional and intimate conversations', icon: Heart, color: 'text-pink-400' },
    { value: 'law' as AIMode, label: 'LAW Mode', description: 'Legal advice and explanations', icon: Scale, color: 'text-amber-400' },
    { value: 'humanize' as AIMode, label: 'Humanize AI Mode', description: 'Humanize AI-generated text', icon: Wand2, color: 'text-purple-400' },
    { value: 'service' as AIMode, label: 'SERVICE Mode', description: 'Assignment solutions', icon: GraduationCap, color: 'text-cyan-400' }
  ],
  'gx-3.0': [
    { value: 'basic' as AIMode, label: 'Basic Mode', description: 'Precise and concise answers', icon: Zap, color: 'text-blue-400' },
    { value: 'scary' as AIMode, label: 'Scary Mode', description: 'Elaborate and detailed responses', icon: Heart, color: 'text-red-400' },
    { value: 'green' as AIMode, label: 'Green Mode', description: 'Helpful advice and guidance', icon: Leaf, color: 'text-emerald-400' },
    { value: 'humanize' as AIMode, label: 'Humanize AI Mode', description: 'Humanize AI-generated text', icon: Wand2, color: 'text-purple-400' },
    { value: 'gptzero' as AIMode, label: 'GPTzero Mode', description: 'Detect AI vs human-written text', icon: Search, color: 'text-orange-400' },
    { value: 'companion' as AIMode, label: 'Companion Mode', description: 'Emotional and intimate conversations', icon: Heart, color: 'text-pink-400' },
    { value: 'utility' as AIMode, label: 'Utility Mode', description: 'Emails, messages, responses', icon: Briefcase, color: 'text-indigo-400' },
    { value: 'translator' as AIMode, label: 'Translator Mode', description: 'Translate between languages', icon: Languages, color: 'text-yellow-400' },
    { value: 'law' as AIMode, label: 'LAW Mode', description: 'Legal advice and explanations', icon: Scale, color: 'text-amber-400' },
    { value: 'service' as AIMode, label: 'SERVICE Mode', description: 'Assignment solutions', icon: GraduationCap, color: 'text-cyan-400' },
    { value: 'gxdev' as AIMode, label: 'GXdev Mode', description: 'Full-stack development assistant', icon: Code, color: 'text-blue-400' }
  ]
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  onClearMemory,
  darkMode
}) => {
  const [showModes, setShowModes] = React.useState(false);
  const [memoryStats, setMemoryStats] = React.useState({
    totalConversations: 0,
    oldestDate: null as Date | null,
    newestDate: null as Date | null,
    topTopics: [] as string[],
    importantMemories: 0,
    userMessages: 0,
    aiMessages: 0,
    averageImportance: 0
  });

  // Load memory stats when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const loadStats = async () => {
        const stats = getMemoryStats();
        setMemoryStats(stats);
      };
      loadStats();
    }
  }, [isOpen]);
  
  if (!isOpen) return null;

  const handleModeChange = (mode: AIMode) => {
    onSettingsChange({ ...settings, currentMode: mode });
  };

  const handleModelChange = (model: AIModel) => {
    // When changing model, set to first available mode for that model
    const availableModes = modelModes[model];
    const newMode = availableModes.length > 0 ? availableModes[0].value : 'basic';
    onSettingsChange({ ...settings, currentModel: model, currentMode: newMode });
  };

  const handleLanguageChange = (language: string) => {
    onSettingsChange({ ...settings, selectedLanguage: language });
  };

  const handleUserProfileChange = (field: keyof UserProfile, value: string) => {
    onSettingsChange({
      ...settings,
      userProfile: {
        ...settings.userProfile,
        [field]: value
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6">
      <div className={`${
        darkMode ? 'bg-black border border-gray-800' : 'bg-white'
      } rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent`}>
        <div className={`flex items-center justify-between p-6 ${
          darkMode ? 'border-b border-gray-800' : 'border-b border-gray-200'
        }`}>
          <h2 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Settings
          </h2>
          <button
            onClick={onClose}
            className={`${
              darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            } transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 touch-manipulation`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4 sm:p-6 space-y-6">
          {/* Model Selection */}
          <div>
            <h4 className={`${darkMode ? 'text-white' : 'text-gray-900'} font-medium mb-3 text-sm sm:text-base`}>
              AI Model Selection
            </h4>
            <select
              value={settings.currentModel}
              onChange={(e) => handleModelChange(e.target.value as AIModel)}
              className={`w-full ${
                darkMode 
                  ? 'bg-gray-800 text-white border border-gray-600' 
                  : 'bg-white text-gray-900 border border-gray-300'
              } rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base touch-manipulation`}
            >
              <option value="gx-1.5">GX-1.5 (Basic & Green modes)</option>
              <option value="gx-2.0">GX-2.0 (6 modes available)</option>
              <option value="gx-3.0">GX-3.0 (10 modes available)</option>
            </select>
            <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              Different models offer different capabilities and modes
            </p>
          </div>
          
          {/* Modes Section */}
          <div>
            <button
              onClick={() => setShowModes(!showModes)}
              className={`flex items-center justify-between w-full p-3 sm:p-4 ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              } rounded-lg transition-colors touch-manipulation`}
            >
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} text-sm sm:text-base`}>
                AI Modes for {settings.currentModel.toUpperCase()}
              </span>
              {showModes ? (
                <ChevronDown className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              ) : (
                <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              )}
            </button>
            
            {showModes && (
              <div className="mt-3 space-y-3">
                {modelModes[settings.currentModel].map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleModeChange(option.value)}
                      className={`w-full flex items-center p-3 sm:p-4 rounded-lg border-2 transition-all ${
                        settings.currentMode === option.value
                          ? 'border-emerald-500 bg-emerald-900/20'
                          : darkMode 
                            ? 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                      } touch-manipulation`}
                    >
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${option.color} mr-3`} />
                      <div className="text-left flex-1">
                        <div className={`${darkMode ? 'text-white' : 'text-gray-900'} font-medium text-sm sm:text-base`}>
                          {option.label}
                        </div>
                        <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-xs sm:text-sm`}>
                          {option.description}
                        </div>
                      </div>
                      {settings.currentMode === option.value && (
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Companion Mode Override - For models that support companion mode */}
          {modelModes[settings.currentModel].some(mode => mode.value === 'companion') && (
            <div className={`pt-4 ${darkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <span className={`${darkMode ? 'text-white' : 'text-gray-900'} font-medium`}>
                  Companion Mode Override
                </span>
                <button
                  onClick={() => onSettingsChange({ ...settings, companionMode: !settings.companionMode })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.companionMode ? 'bg-pink-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.companionMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                Override current mode with companion mode for emotional support
              </p>
            </div>
          )}

          {/* User Profile Section */}
          <div className={`pt-4 ${darkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
            <h4 className={`${darkMode ? 'text-white' : 'text-gray-900'} font-medium mb-3 flex items-center`}>
              <User className="w-4 h-4 mr-2" />
              Personal Information
            </h4>
            <div className="space-y-3">
              <div>
                <label className={`block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Your Name
                </label>
                <input
                  type="text"
                  value={settings.userProfile.name}
                  onChange={(e) => handleUserProfileChange('name', e.target.value)}
                  placeholder="Enter your name"
                  className={`w-full ${
                    darkMode 
                      ? 'bg-gray-800 text-white border border-gray-600 placeholder-gray-400' 
                      : 'bg-white text-gray-900 border border-gray-300 placeholder-gray-500'
                  } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm`}
                />
              </div>
              
              <div>
                <label className={`block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Your Hobby
                </label>
                <input
                  type="text"
                  value={settings.userProfile.hobby}
                  onChange={(e) => handleUserProfileChange('hobby', e.target.value)}
                  placeholder="What do you enjoy doing?"
                  className={`w-full ${
                    darkMode 
                      ? 'bg-gray-800 text-white border border-gray-600 placeholder-gray-400' 
                      : 'bg-white text-gray-900 border border-gray-300 placeholder-gray-500'
                  } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm`}
                />
              </div>
              
              <div>
                <label className={`block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  About Yourself
                </label>
                <textarea
                  value={settings.userProfile.personalInfo}
                  onChange={(e) => handleUserProfileChange('personalInfo', e.target.value)}
                  placeholder="Tell me about yourself, your interests, goals, etc."
                  rows={3}
                  className={`w-full ${
                    darkMode 
                      ? 'bg-gray-800 text-white border border-gray-600 placeholder-gray-400' 
                      : 'bg-white text-gray-900 border border-gray-300 placeholder-gray-500'
                  } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none`}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={settings.userProfile.age || ''}
                  onChange={(e) => handleUserProfileChange('age', e.target.value)}
                  placeholder="Age (optional)"
                  className={`${
                    darkMode 
                      ? 'bg-gray-800 text-white border border-gray-600 placeholder-gray-400' 
                      : 'bg-white text-gray-900 border border-gray-300 placeholder-gray-500'
                  } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm`}
                />
                <input
                  type="text"
                  value={settings.userProfile.occupation || ''}
                  onChange={(e) => handleUserProfileChange('occupation', e.target.value)}
                  placeholder="Occupation (optional)"
                  className={`${
                    darkMode 
                      ? 'bg-gray-800 text-white border border-gray-600 placeholder-gray-400' 
                      : 'bg-white text-gray-900 border border-gray-300 placeholder-gray-500'
                  } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm`}
                />
              </div>
            </div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              This information helps GREEN AI provide more personalized responses
            </p>
          </div>

          {/* Language Selection */}
          <div className={`pt-4 ${darkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
            <h4 className={`${darkMode ? 'text-white' : 'text-gray-900'} font-medium mb-3`}>
              Language Selection
            </h4>
            <select
              value={settings.selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className={`w-full ${
                darkMode 
                  ? 'bg-gray-800 text-white border border-gray-600' 
                  : 'bg-white text-gray-900 border border-gray-300'
              } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* Auto-save Toggle */}
          <div className={`pt-4 ${darkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`${darkMode ? 'text-white' : 'text-gray-900'} font-medium`}>
                Auto-save conversations
              </span>
              <button
                onClick={() => onSettingsChange({ ...settings, autoSave: !settings.autoSave })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoSave ? 'bg-emerald-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoSave ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          {/* Memory Management */}
          <div className={`pt-4 ${darkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
            <div className={`mb-4 p-3 ${
              darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            } rounded-lg`}>
              <h4 className={`${darkMode ? 'text-white' : 'text-gray-900'} font-medium mb-2`}>
                Enhanced Memory System Status
              </h4>
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                <p>Total memory entries: {memoryStats.totalConversations}</p>
                <p>Your messages: {memoryStats.userMessages}</p>
                <p>AI responses: {memoryStats.aiMessages}</p>
                <p>Important memories: {memoryStats.importantMemories}</p>
                <p>Average importance: {memoryStats.averageImportance}/10</p>
                {memoryStats.oldestDate && (
                  <p>Oldest: {memoryStats.oldestDate.toLocaleDateString()}</p>
                )}
                {memoryStats.newestDate && (
                  <p>Most recent: {memoryStats.newestDate.toLocaleDateString()}</p>
                )}
                {memoryStats.topTopics.length > 0 && (
                  <p>Top topics: {memoryStats.topTopics.slice(0, 3).join(', ')}</p>
                )}
              </div>
              <div className={`mt-3 p-2 ${
                darkMode ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'
              } rounded text-xs`}>
                <p className={`${darkMode ? 'text-green-300' : 'text-green-700'} font-medium`}>
                  ✅ Enhanced Memory Active
                </p>
                <p className={`${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  AI remembers everything you say and can recall any conversation detail
                </p>
              </div>
            </div>
            
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear ALL conversation memory and chat history? This will permanently delete everything the AI remembers about you and your conversations. This action cannot be undone.')) {
                  onClearMemory();
                }
              }}
              className="w-full flex items-center justify-center p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Clear All Memory & History
            </button>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-xs mt-2 text-center`}>
              This will permanently delete ALL conversation history, memory, and personal information
            </p>
          </div>
        </div>
        
        <div className={`p-6 ${
          darkMode ? 'border-t border-gray-700 bg-gray-900/50' : 'border-t border-gray-200 bg-gray-50'
        }`}>
          <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
            <div className="flex items-center justify-center mb-2">
              <Leaf className="w-4 h-4 text-emerald-500 mr-2" />
              <span>GREEN AI v2.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 