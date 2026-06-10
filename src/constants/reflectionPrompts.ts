import type { PromptQuestion, PromptLevel, PromptType } from '@/types/reflection';

export interface PromptSet {
  quick: PromptQuestion[];
  standard: PromptQuestion[];
  deep: PromptQuestion[];
}

export const REFLECTION_PROMPTS: Record<PromptType, PromptSet> = {
  post_match_win: {
    quick: [
      {
        id: 'win_quick_2',
        question: 'What went well?',
        placeholder: 'e.g., My serve was consistent, I stayed focused during key points...',
        required: false,
      },
      {
        id: 'win_quick_3',
        question: 'What will you focus on next time?',
        placeholder: 'One process goal for your next match...',
        required: false,
      },
    ],
    standard: [
      {
        id: 'win_standard_2',
        question: 'What were your key strengths today?',
        placeholder: 'Describe the specific skills or strategies that worked well...',
        required: false,
      },
      {
        id: 'win_standard_3',
        question: 'Where did your focus go when you were ahead or behind?',
        placeholder: 'e.g., When ahead I relaxed too much; when behind I rushed points...',
        required: false,
      },
      {
        id: 'win_standard_4',
        question: 'What specific moments were you most proud of?',
        placeholder: 'Think about particular points, shots, or decisions that stood out...',
        required: false,
      },
      {
        id: 'win_standard_5',
        question: 'What will you build on for next time?',
        placeholder: 'How will you use this experience to improve further?',
        required: false,
      },
    ],
    deep: [
      {
        id: 'win_deep_1',
        question: 'Goal: What was your goal for this match?',
        placeholder: 'What were you trying to achieve or work on?',
        required: false,
      },
      {
        id: 'win_deep_2',
        question: 'Reality: What actually happened?',
        placeholder: 'Describe the match objectively, including key moments and turning points...',
        required: false,
      },
      {
        id: 'win_deep_3',
        question: 'Options: What strategies or techniques did you use?',
        placeholder: 'What different approaches did you try? What worked and what didn\'t?',
        required: false,
      },
      {
        id: 'win_deep_4',
        question: 'Will: What will you commit to doing differently or continuing?',
        placeholder: 'What specific actions will you take based on this experience?',
        required: false,
      },
      {
        id: 'win_deep_5',
        question: 'Emotion: How did you feel before and during the match?',
        placeholder: 'Describe how your energy, nerves, and emotions shifted...',
        inputType: 'scale',
        scaleLowLabel: 'Calm',
        scaleHighLabel: 'Very nervous',
        required: false,
      },
      {
        id: 'win_deep_6',
        question: 'Focus: Where did your attention go when you were ahead or behind?',
        placeholder: 'e.g., When ahead I started playing safe; when behind I lost my routine...',
        required: false,
      },
      {
        id: 'win_deep_7',
        question: 'Situation: What was the context of this match?',
        placeholder: 'Opponent style, court conditions, your physical state...',
        required: false,
      },
      {
        id: 'win_deep_8',
        question: 'Task: What was your specific role or responsibility?',
        placeholder: 'What did you need to focus on or execute?',
        required: false,
      },
      {
        id: 'win_deep_9',
        question: 'Action: What did you do?',
        placeholder: 'Describe your actions, decisions, and responses...',
        required: false,
      },
      {
        id: 'win_deep_10',
        question: 'Result: What was the outcome?',
        placeholder: 'What happened as a result of your actions?',
        required: false,
      },
      {
        id: 'win_deep_11',
        question: 'Reflection: What did you learn?',
        placeholder: 'What insights can you take from this experience?',
        required: false,
      },
    ],
  },
  post_match_loss: {
    quick: [
      {
        id: 'loss_quick_2',
        question: 'What did you learn?',
        placeholder: 'e.g., I need to work on my consistency, my opponent\'s strategy exposed a weakness...',
        required: false,
      },
      {
        id: 'loss_quick_3',
        question: 'What will you work on before your next match?',
        placeholder: 'One concrete focus area...',
        required: false,
      },
    ],
    standard: [
      {
        id: 'loss_standard_1',
        question: 'What went well despite the result?',
        placeholder: 'Focus on positive aspects, even in defeat...',
        required: false,
      },
      {
        id: 'loss_standard_3',
        question: 'Where did your focus go when you were ahead or behind?',
        placeholder: 'e.g., When ahead I got tight; when behind I panicked on big points...',
        required: false,
      },
      {
        id: 'loss_standard_4',
        question: 'What positive can you take from this?',
        placeholder: 'Every match teaches us something valuable...',
        required: false,
      },
      {
        id: 'loss_standard_5',
        question: 'What will you work on before your next match?',
        placeholder: 'Identify concrete steps for improvement...',
        required: false,
      },
    ],
    deep: [
      {
        id: 'loss_deep_1',
        question: 'Goal: What was your goal for this match?',
        placeholder: 'What were you trying to achieve or work on?',
        required: false,
      },
      {
        id: 'loss_deep_2',
        question: 'Reality: What actually happened?',
        placeholder: 'Describe the match objectively, including where things went wrong...',
        required: false,
      },
      {
        id: 'loss_deep_3',
        question: 'Options: What strategies did you try? What else could you have done?',
        placeholder: 'What different approaches did you use? What alternatives existed?',
        required: false,
      },
      {
        id: 'loss_deep_4',
        question: 'Will: What will you commit to doing differently?',
        placeholder: 'What specific actions will you take to improve?',
        required: false,
      },
      {
        id: 'loss_deep_5',
        question: 'Emotion: How did you feel before and during the match?',
        placeholder: 'Describe how your energy, nerves, and emotions shifted...',
        inputType: 'scale',
        scaleLowLabel: 'Calm',
        scaleHighLabel: 'Very nervous',
        required: false,
      },
      {
        id: 'loss_deep_6',
        question: 'Focus: Where did your attention go when you were ahead or behind?',
        placeholder: 'e.g., When ahead I played not to lose; when behind I rushed decisions...',
        required: false,
      },
      {
        id: 'loss_deep_7',
        question: 'Situation: What was the context?',
        placeholder: 'Opponent style, court conditions, your physical state...',
        required: false,
      },
      {
        id: 'loss_deep_8',
        question: 'Task: What was your specific role or responsibility?',
        placeholder: 'What did you need to focus on or execute?',
        required: false,
      },
      {
        id: 'loss_deep_9',
        question: 'Action: What did you do?',
        placeholder: 'Describe your actions, decisions, and responses...',
        required: false,
      },
      {
        id: 'loss_deep_10',
        question: 'Result: What was the outcome?',
        placeholder: 'What happened as a result of your actions?',
        required: false,
      },
      {
        id: 'loss_deep_11',
        question: 'Reflection: What did you learn?',
        placeholder: 'What insights can you take from this experience?',
        required: false,
      },
    ],
  },
  post_training: {
    quick: [
      {
        id: 'training_quick_1',
        question: 'What did you work on today?',
        placeholder: 'e.g., Backhand technique, serve placement, footwork...',
        required: false,
      },
      {
        id: 'training_quick_2',
        question: 'What felt good? What didn\'t?',
        placeholder: 'Briefly note what worked and what needs more practice...',
        required: false,
      },
    ],
    standard: [
      {
        id: 'training_standard_1',
        question: 'What did you work on today?',
        placeholder: 'Describe the specific drills, techniques, or strategies you focused on...',
        required: false,
      },
      {
        id: 'training_standard_2',
        question: 'What felt good?',
        placeholder: 'What skills or movements felt natural and effective?',
        required: false,
      },
      {
        id: 'training_standard_3',
        question: 'What didn\'t feel good?',
        placeholder: 'What areas felt awkward, difficult, or need more work?',
        required: false,
      },
      {
        id: 'training_standard_4',
        question: 'What progress did you make?',
        placeholder: 'What improvements did you notice compared to previous sessions?',
        required: false,
      },
      {
        id: 'training_standard_5',
        question: 'What will you focus on next session?',
        placeholder: 'What specific areas or drills will you prioritise?',
        required: false,
      },
    ],
    deep: [
      {
        id: 'training_deep_1',
        question: 'What was the focus of today\'s training?',
        placeholder: 'Describe the main objectives and goals...',
        required: false,
      },
      {
        id: 'training_deep_2',
        question: 'What specific drills or exercises did you do?',
        placeholder: 'Detail the activities and their purpose...',
        required: false,
      },
      {
        id: 'training_deep_3',
        question: 'What technical improvements did you notice?',
        placeholder: 'Be specific about form, technique, and execution...',
        required: false,
      },
      {
        id: 'training_deep_4',
        question: 'What challenges did you face?',
        placeholder: 'What was difficult or frustrating?',
        required: false,
      },
      {
        id: 'training_deep_5',
        question: 'How did you overcome those challenges?',
        placeholder: 'What strategies or adjustments did you make?',
        required: false,
      },
      {
        id: 'training_deep_6',
        question: 'What feedback did you receive?',
        placeholder: 'From coach, training partner, or self-observation...',
        required: false,
      },
      {
        id: 'training_deep_7',
        question: 'What will you focus on next session?',
        placeholder: 'Specific goals and priorities for improvement...',
        required: false,
      },
      {
        id: 'training_deep_8',
        question: 'How does this session fit into your overall development?',
        placeholder: 'Connect today\'s work to your long-term goals...',
        required: false,
      },
    ],
  },
};

export function getPromptSet(type: PromptType, level: PromptLevel): PromptQuestion[] {
  return REFLECTION_PROMPTS[type][level] || [];
}

export function getPromptIdentifier(type: PromptType, level: PromptLevel): string {
  return `${type}_${level}`;
}

