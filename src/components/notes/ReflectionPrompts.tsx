import { useState, useEffect, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Clock, Zap, Target, BookOpen } from 'lucide-react';
import type { PromptType, PromptLevel, PromptAnswers } from '@/types/reflection';
import { getPromptSet, getPromptIdentifier } from '@/constants/reflectionPrompts';

interface ReflectionPromptsProps {
  promptType: PromptType;
  promptLevel: PromptLevel;
  onAnswersChange: (notes: string, answers: PromptAnswers, promptUsed: string) => void;
  initialAnswers?: PromptAnswers;
  onPromptLevelChange?: (level: PromptLevel) => void;
}

const LEVEL_INFO: Record<PromptLevel, { label: string; time: string; icon: typeof Clock }> = {
  quick: { label: 'Quick', time: '30 sec', icon: Zap },
  standard: { label: 'Standard', time: '2-3 min', icon: Target },
  deep: { label: 'Deep', time: '10+ min', icon: BookOpen },
};

export const ReflectionPrompts = ({
  promptType,
  promptLevel: initialPromptLevel,
  onAnswersChange,
  initialAnswers = {},
  onPromptLevelChange,
}: ReflectionPromptsProps) => {
  const [promptLevel, setPromptLevel] = useState<PromptLevel>(initialPromptLevel);
  const [answers, setAnswers] = useState<PromptAnswers>(initialAnswers);

  const prompts = useMemo(() => getPromptSet(promptType, promptLevel), [promptType, promptLevel]);

  useEffect(() => {
    setPromptLevel(initialPromptLevel);
  }, [initialPromptLevel]);

  useEffect(() => {
    setAnswers(initialAnswers);
  }, [initialAnswers]);

  const handleAnswerChange = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    
    // Format notes with question headers
    const formattedNotes = formatAnswersToNotes(prompts, newAnswers);
    const promptUsed = getPromptIdentifier(promptType, promptLevel);
    onAnswersChange(formattedNotes, newAnswers, promptUsed);
  };

  const handleLevelChange = (level: PromptLevel) => {
    setPromptLevel(level);
    if (onPromptLevelChange) {
      onPromptLevelChange(level);
    }
    // Clear answers when changing level
    setAnswers({});
    onAnswersChange('', {}, getPromptIdentifier(promptType, level));
  };

  return (
    <div className="space-y-6">
      {/* Level Selector */}
      <div className="space-y-3">
        <Label className="text-base font-semibold text-gray-700">Reflection Depth</Label>
        <RadioGroup
          value={promptLevel}
          onValueChange={(value) => handleLevelChange(value as PromptLevel)}
          className="grid grid-cols-3 gap-3"
        >
          {Object.entries(LEVEL_INFO).map(([level, info]) => {
            const Icon = info.icon;
            const isSelected = promptLevel === level;
            return (
              <div key={level} className="relative">
                <RadioGroupItem
                  value={level}
                  id={`level-${level}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`level-${level}`}
                  className={`
                    flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer
                    transition-all duration-300
                    ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }
                  `}
                >
                  <Icon
                    className={`w-5 h-5 mb-2 ${
                      isSelected ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  />
                  <span
                    className={`text-sm font-semibold mb-1 ${
                      isSelected ? 'text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    {info.label}
                  </span>
                  <span
                    className={`text-xs ${
                      isSelected ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    {info.time}
                  </span>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </div>

      {/* Prompt Questions */}
      <div className="space-y-4">
        {prompts.map((prompt, index) => (
          <Card
            key={prompt.id}
            className="p-5 bg-white/80 backdrop-blur-sm border-2 border-blue-200/50"
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <Label
                  htmlFor={prompt.id}
                  className="text-base font-semibold text-gray-800 flex-1"
                >
                  {prompt.question}
                  {prompt.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </Label>
              </div>
              <div className="relative ml-9">
                <Textarea
                  id={prompt.id}
                  value={answers[prompt.id] || ''}
                  onChange={(e) => handleAnswerChange(prompt.id, e.target.value)}
                  placeholder={prompt.placeholder || 'Share your thoughts...'}
                  className="min-h-[100px] rounded-xl border-2 border-gray-200 focus:border-blue-400 transition-colors resize-none"
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white/90 px-2 py-1 rounded-full">
                  {(answers[prompt.id] || '').length} characters
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {prompts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No prompts available for this combination.
        </div>
      )}
    </div>
  );
};

/**
 * Format answers into a readable notes format with question headers
 */
function formatAnswersToNotes(
  prompts: Array<{ id: string; question: string }>,
  answers: PromptAnswers
): string {
  const sections = prompts
    .filter((prompt) => answers[prompt.id]?.trim())
    .map((prompt) => {
      const answer = answers[prompt.id].trim();
      return `${prompt.question}\n${answer}`;
    });

  return sections.join('\n\n');
}

