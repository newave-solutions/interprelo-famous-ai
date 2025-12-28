import React, { createContext, useContext, useState } from 'react';

interface AIConfig {
  openaiApiKey: string;
  anthropicApiKey: string;
  provider: 'openai' | 'anthropic';
  model: string;
  enableAIScenarios: boolean;
  enableCoaching: boolean;
}

interface AIConfigContextType {
  config: AIConfig;
  updateConfig: (updates: Partial<AIConfig>) => void;
  isConfigured: boolean;
}

// Vite environment variables with type safety
interface ImportMetaEnv {
  [key: string]: string | undefined;
}

const getEnvVar = (key: string, defaultValue: string = ''): string => {
  const env = (import.meta as { env?: ImportMetaEnv }).env;
  return env?.[key] || defaultValue;
};

const defaultConfig: AIConfig = {
  openaiApiKey: getEnvVar('VITE_OPENAI_API_KEY'),
  anthropicApiKey: getEnvVar('VITE_ANTHROPIC_API_KEY'),
  provider: (getEnvVar('VITE_LLM_PROVIDER', 'openai') as 'openai' | 'anthropic'),
  model: getEnvVar('VITE_OPENAI_MODEL', 'gpt-4o-mini'),
  enableAIScenarios: getEnvVar('VITE_ENABLE_AI_SCENARIOS') === 'true',
  enableCoaching: getEnvVar('VITE_ENABLE_COACHING') === 'true',
};

const AIConfigContext = createContext<AIConfigContextType | undefined>(undefined);

export const AIConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AIConfig>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('ai-config');
    if (saved) {
      try {
        return { ...defaultConfig, ...JSON.parse(saved) };
      } catch {
        return defaultConfig;
      }
    }
    return defaultConfig;
  });

  const updateConfig = (updates: Partial<AIConfig>) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates };
      localStorage.setItem('ai-config', JSON.stringify(newConfig));
      return newConfig;
    });
  };

  const isConfigured = Boolean(
    config.provider === 'openai' 
      ? config.openaiApiKey 
      : config.anthropicApiKey
  );

  return (
    <AIConfigContext.Provider value={{ config, updateConfig, isConfigured }}>
      {children}
    </AIConfigContext.Provider>
  );
};

// Export hook separately to avoid Fast Refresh warning
export function useAIConfig() {
  const context = useContext(AIConfigContext);
  if (!context) {
    throw new Error('useAIConfig must be used within AIConfigProvider');
  }
  return context;
}
