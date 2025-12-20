import React, { useState } from 'react';
import { Settings, Key, Brain, Shield, Info, ExternalLink } from 'lucide-react';
import { useAIConfig } from '@/contexts/AIConfigContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose }) => {
  const { config, updateConfig } = useAIConfig();
  const [localConfig, setLocalConfig] = useState(config);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = () => {
    updateConfig(localConfig);
    onClose();
  };

  const maskApiKey = (key: string): string => {
    if (!key || key.length < 8) return key;
    return key.slice(0, 4) + '•'.repeat(20) + key.slice(-4);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            AI Configuration Settings
          </DialogTitle>
          <DialogDescription>
            Configure your AI provider and API keys for interactive scenarios
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">About AI Integration</p>
                <p>
                  AI-powered scenarios use language models to simulate realistic conversations.
                  Your API key is stored locally and never sent to our servers.
                </p>
              </div>
            </div>
          </div>

          {/* Provider Selection */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">AI Provider</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLocalConfig({ ...localConfig, provider: 'openai' })}
                className={`p-4 border-2 rounded-lg transition-all ${
                  localConfig.provider === 'openai'
                    ? 'border-[#2C5F8D] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">OpenAI</span>
                  {localConfig.provider === 'openai' && (
                    <Badge variant="default">Selected</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600">GPT-4o, GPT-4, GPT-3.5</p>
              </button>

              <button
                onClick={() => setLocalConfig({ ...localConfig, provider: 'anthropic' })}
                className={`p-4 border-2 rounded-lg transition-all ${
                  localConfig.provider === 'anthropic'
                    ? 'border-[#2C5F8D] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Anthropic</span>
                  {localConfig.provider === 'anthropic' && (
                    <Badge variant="default">Selected</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600">Claude 3.5, Claude 3</p>
              </button>
            </div>
          </div>

          {/* OpenAI Configuration */}
          {localConfig.provider === 'openai' && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="openai-key" className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  OpenAI API Key
                </Label>
                <div className="relative">
                  <Input
                    id="openai-key"
                    type={showApiKey ? 'text' : 'password'}
                    value={localConfig.openaiApiKey}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, openaiApiKey: e.target.value })
                    }
                    placeholder="sk-..."
                    className="pr-20"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
                  >
                    {showApiKey ? 'Hide' : 'Show'}
                  </button>
                </div>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  Get your API key from OpenAI
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-2">
                <Label htmlFor="openai-model">Model</Label>
                <select
                  id="openai-model"
                  value={localConfig.model}
                  onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="gpt-4o">GPT-4o (Recommended)</option>
                  <option value="gpt-4o-mini">GPT-4o Mini (Faster, Cheaper)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>
            </div>
          )}

          {/* Anthropic Configuration */}
          {localConfig.provider === 'anthropic' && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="anthropic-key" className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Anthropic API Key
                </Label>
                <div className="relative">
                  <Input
                    id="anthropic-key"
                    type={showApiKey ? 'text' : 'password'}
                    value={localConfig.anthropicApiKey}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, anthropicApiKey: e.target.value })
                    }
                    placeholder="sk-ant-..."
                    className="pr-20"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
                  >
                    {showApiKey ? 'Hide' : 'Show'}
                  </button>
                </div>
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  Get your API key from Anthropic
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-2">
                <Label htmlFor="anthropic-model">Model</Label>
                <select
                  id="anthropic-model"
                  value={localConfig.model}
                  onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Recommended)</option>
                  <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                  <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                  <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                </select>
              </div>
            </div>
          )}

          {/* Feature Toggles */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Features</Label>
            
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-[#2C5F8D]" />
                <div>
                  <p className="font-medium">AI-Powered Scenarios</p>
                  <p className="text-xs text-gray-600">Enable interactive role-play with AI</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localConfig.enableAIScenarios}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, enableAIScenarios: e.target.checked })
                }
                className="w-5 h-5"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Real-time Coaching</p>
                  <p className="text-xs text-gray-600">Get instant feedback on your interpretations</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localConfig.enableCoaching}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, enableCoaching: e.target.checked })
                }
                className="w-5 h-5"
              />
            </label>
          </div>

          {/* Privacy Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">Privacy & Security</p>
                <ul className="space-y-1 text-xs">
                  <li>✓ API keys stored locally in your browser</li>
                  <li>✓ No keys sent to our servers</li>
                  <li>✓ Direct communication with AI provider</li>
                  <li>✓ You control your data</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-[#2C5F8D] hover:bg-[#234B73]">
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AISettingsModal;
