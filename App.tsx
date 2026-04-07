import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import birthPlanQuestions from './data/birthPlanQuestions.json';
import interventions from './data/interventions.json';
import bagCategories from './data/bagCategories.json';
import partnerTips from './data/partnerTips.json';
import { BulkActionBar, SelectionHeader, SelectableCard, type BulkAction } from './components/BulkSelection';
import { borderRadius, colors, shadows, spacing, typography } from './lib/theme';
import type { BirthPlanQuestion } from './lib/types';

type AppSection = 'overview' | 'interview' | 'interventions' | 'bag' | 'playbook';

type EditableIntervention = {
  id: string;
  name: string;
  description: string;
  preference: string;
  reviewed: boolean;
  stage: string;
};

type BagForWhom = 'her' | 'partner' | 'baby' | 'shared';

type EditableBagItem = {
  id: string;
  name: string;
  forWhom: BagForWhom;
  packed: boolean;
};

type EditableBagCategory = {
  id: string;
  name: string;
  emoji: string;
  items: EditableBagItem[];
};

type PlaybookTip = {
  id: string;
  text: string;
};

type PlaybookCategory = {
  id: string;
  name: string;
  tips: PlaybookTip[];
};

type InterviewStatus = 'draft' | 'submitted';

type AppData = {
  partnerName: string;
  motherName: string;
  dueDate: string;
  birthAnswers: Record<string, string>;
  currentQuestionIndex: number;
  interviewStatus: InterviewStatus;
  interventionsState: EditableIntervention[];
  bagState: EditableBagCategory[];
  playbookState: PlaybookCategory[];
};

type SelectionSection = 'interventions' | 'bag' | 'playbook';

type ConfirmationState = {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: null | (() => void);
};

type SnackbarState = {
  visible: boolean;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

const STORAGE_KEY = 'labor-prep-web-app-v2';
const sections: Array<{ key: AppSection; label: string }> = [
  { key: 'overview', label: 'Review' },
  { key: 'interview', label: 'Interview' },
  { key: 'interventions', label: 'Interventions' },
  { key: 'bag', label: 'Labor Bag' },
  { key: 'playbook', label: 'Playbook' },
];

const relationshipMap: Record<string, string[]> = {
  bp2: ['int_epidural', 'int_narcotics', 'int_nitrous'],
  bp4: ['int_monitor', 'int_epidural'],
  bp5: ['int_water'],
  bp6: ['int_monitor'],
  bp7: ['int_csection'],
  bp8: ['int_csection'],
  bp9: ['int_csection'],
};

const interventionStageMap: Record<string, string> = {
  int_cervix: 'Early Labor',
  int_water: 'Active Labor',
  int_iv: 'Admission',
  int_monitor: 'Throughout Labor',
  int_epidural: 'Active Labor',
  int_narcotics: 'Early Labor',
  int_nitrous: 'Early Labor',
  int_induction: 'Before Labor',
  int_pitocin: 'Active Labor',
  int_vacuum: 'Delivery',
  int_csection: 'Delivery',
};

const stageOptions = [
  'Before Labor',
  'Admission',
  'Early Labor',
  'Active Labor',
  'Throughout Labor',
  'Delivery',
  'General',
];

const interviewData = birthPlanQuestions as BirthPlanQuestion[];
const setupQuestions = [
  { id: 'setup_partner', label: 'Partner name', placeholder: 'Partner name' },
  { id: 'setup_birthing_parent', label: 'Birthing Parent name', placeholder: 'Birthing Parent name' },
  { id: 'setup_due_date', label: 'Due date', placeholder: 'May 20th' },
] as const;

function createInitialInterventions(): EditableIntervention[] {
  return (interventions as Array<{ id: string; name: string; description: string; defaultPref: string }>).map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    preference: item.defaultPref,
    reviewed: false,
    stage: interventionStageMap[item.id] ?? 'General',
  }));
}

function createInitialBagState(): EditableBagCategory[] {
  return (
    bagCategories as Array<{
      id: string;
      name: string;
      emoji: string;
      items: Array<{ name: string; forWhom: BagForWhom }>;
    }>
  ).map((category) => ({
    id: category.id,
    name: category.name,
    emoji: category.emoji,
    items: category.items.map((item) => ({
      id: createId('bag-item'),
      name: item.name,
      forWhom: item.forWhom,
      packed: false,
    })),
  }));
}

function createInitialPlaybook(): PlaybookCategory[] {
  return (partnerTips as Array<{ category: string; tips: string[] }>).map((group) => ({
    id: createId('playbook'),
    name: group.category,
    tips: group.tips.map((tip) => ({
      id: createId('tip'),
      text: tip,
    })),
  }));
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function labelForWhom(forWhom: BagForWhom, motherName: string, partnerName: string) {
  const birthingParentLabel = motherName?.trim() ? `For ${motherName.trim()}` : 'For Birthing Parent';
  const partnerLabel = partnerName?.trim() ? `For ${partnerName.trim()}` : 'For Partner';
  switch (forWhom) {
    case 'her':
      return birthingParentLabel;
    case 'partner':
      return partnerLabel;
    case 'baby':
      return 'For baby';
    default:
      return 'Shared';
  }
}

function firstRelatedAnswer(interventionId: string, answers: Record<string, string>) {
  const linkedQuestionId = Object.keys(relationshipMap).find((questionId) =>
    relationshipMap[questionId]?.includes(interventionId) && answers[questionId]?.trim(),
  );

  if (!linkedQuestionId) {
    return null;
  }

  const question = interviewData.find((item) => item.id === linkedQuestionId);
  const answer = answers[linkedQuestionId];

  return {
    question: question?.question ?? 'Interview answer',
    answer,
  };
}

function personalizeQuestionText(text: string, motherName: string) {
  return text.replace(/\bshe\b/gi, motherName || 'the birthing parent');
}

function personalizePlaceholder(text: string, motherName: string) {
  const name = motherName || 'the birthing parent';
  return text.replace(/\bher mom\b/gi, `${name}'s mom`);
}

function normalizeCategoryName(value: string) {
  return value.trim().toLowerCase();
}

function normalizeOwnerToken(value: string): BagForWhom {
  const token = value.trim().toLowerCase();
  if (['her', 'mom', 'mother', 'birthing parent', 'birthingparent', 'birthing-parent'].includes(token)) {
    return 'her';
  }
  if (['him', 'dad', 'partner', 'support partner', 'support'].includes(token)) {
    return 'partner';
  }
  if (['baby', 'infant', 'newborn'].includes(token)) {
    return 'baby';
  }
  return 'shared';
}

function normalizePackedToken(value: string) {
  const token = value.trim().toLowerCase();
  return ['packed', 'yes', 'y', 'done', 'true', '1', 'checked'].includes(token);
}

function parseBulkBagText(text: string) {
  const valid: Array<{ name: string; categoryName: string; forWhom: BagForWhom; packed: boolean }> = [];
  const invalid: string[] = [];

  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const parts = line.split('|').map((part) => part.trim());
      if (parts.length < 2 || !parts[0] || !parts[1]) {
        invalid.push(line);
        return;
      }

      valid.push({
        name: parts[0],
        categoryName: parts[1],
        forWhom: normalizeOwnerToken(parts[2] ?? 'shared'),
        packed: normalizePackedToken(parts[3] ?? ''),
      });
    });

  return { valid, invalid };
}

function parseBulkPlaybookText(text: string) {
  const valid: Array<{ text: string; categoryName: string }> = [];
  const invalid: string[] = [];

  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const parts = line.split('|').map((part) => part.trim());
      if (parts.length < 2 || !parts[0] || !parts[1]) {
        invalid.push(line);
        return;
      }

      valid.push({
        text: parts[0],
        categoryName: parts[1],
      });
    });

  return { valid, invalid };
}

function bagBulkTextFromState(categories: EditableBagCategory[], motherName: string, partnerName: string) {
  return categories
    .flatMap((category) =>
      category.items.map(
        (item) =>
          `${item.name} | ${category.name} | ${labelForWhom(item.forWhom, motherName, partnerName).replace(/^For /, '')} | ${
            item.packed ? 'Packed' : 'Unpacked'
          }`,
      ),
    )
    .join('\n');
}

function playbookBulkTextFromState(categories: PlaybookCategory[]) {
  return categories.flatMap((category) => category.tips.map((tip) => `${tip.text} | ${category.name}`)).join('\n');
}

function firstName(value: string) {
  return value.trim().split(/\s+/)[0] ?? '';
}

function ordinalSuffix(day: number) {
  const remainder = day % 10;
  const teen = day % 100;
  if (teen >= 11 && teen <= 13) {
    return 'th';
  }
  if (remainder === 1) {
    return 'st';
  }
  if (remainder === 2) {
    return 'nd';
  }
  if (remainder === 3) {
    return 'rd';
  }
  return 'th';
}

function normalizeDueDate(value: string) {
  const trimmed = value.trim();
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!isoMatch) {
    return trimmed;
  }

  const monthIndex = Number(isoMatch[2]) - 1;
  const day = Number(isoMatch[3]);
  const month = new Date(2000, monthIndex, 1).toLocaleString('en-US', { month: 'long' });
  return `${month} ${day}${ordinalSuffix(day)}`;
}

function toggleSelectionId(selectedIds: string[], id: string) {
  return selectedIds.includes(id) ? selectedIds.filter((entry) => entry !== id) : [...selectedIds, id];
}

export default function App() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1080;
  const isTablet = width >= 760;

  const [activeSection, setActiveSection] = useState<AppSection>('overview');
  const [partnerName, setPartnerName] = useState('Dad');
  const [motherName, setMotherName] = useState('Mama');
  const [dueDate, setDueDate] = useState('May 10th');
  const [birthAnswers, setBirthAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewStatus, setInterviewStatus] = useState<InterviewStatus>('draft');
  const [interventionsState, setInterventionsState] = useState<EditableIntervention[]>(createInitialInterventions);
  const [bagState, setBagState] = useState<EditableBagCategory[]>(createInitialBagState);
  const [playbookState, setPlaybookState] = useState<PlaybookCategory[]>(createInitialPlaybook);
  const [hydrated, setHydrated] = useState(Platform.OS !== 'web');

  const [newInterventionName, setNewInterventionName] = useState('');
  const [newInterventionDescription, setNewInterventionDescription] = useState('');
  const [newInterventionPreference, setNewInterventionPreference] = useState('');
  const [newInterventionStage, setNewInterventionStage] = useState('General');
  const [newBagCategoryName, setNewBagCategoryName] = useState('');
  const [newBagCategoryEmoji, setNewBagCategoryEmoji] = useState('👜');
  const [newPlaybookCategory, setNewPlaybookCategory] = useState('');
  const [addingIntervention, setAddingIntervention] = useState(false);
  const [addingBagCategory, setAddingBagCategory] = useState(false);
  const [addingBagItem, setAddingBagItem] = useState(false);
  const [addingBagBulk, setAddingBagBulk] = useState(false);
  const [editingBagBulk, setEditingBagBulk] = useState(false);
  const [bagAdvancedOpen, setBagAdvancedOpen] = useState(false);
  const [addingPlaybookCategory, setAddingPlaybookCategory] = useState(false);
  const [addingPlaybookTip, setAddingPlaybookTip] = useState(false);
  const [addingPlaybookBulk, setAddingPlaybookBulk] = useState(false);
  const [editingPlaybookBulk, setEditingPlaybookBulk] = useState(false);
  const [playbookAdvancedOpen, setPlaybookAdvancedOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingInterventionId, setEditingInterventionId] = useState<string | null>(null);
  const [editingBagCategoryId, setEditingBagCategoryId] = useState<string | null>(null);
  const [editingBagItemId, setEditingBagItemId] = useState<string | null>(null);
  const [editingPlaybookCategoryId, setEditingPlaybookCategoryId] = useState<string | null>(null);
  const [editingPlaybookTipId, setEditingPlaybookTipId] = useState<string | null>(null);
  const [interviewNotice, setInterviewNotice] = useState('');
  const [questionDraft, setQuestionDraft] = useState('');
  const [interventionDraft, setInterventionDraft] = useState({
    name: '',
    description: '',
    preference: '',
    stage: 'General',
  });
  const [bagCategoryDraft, setBagCategoryDraft] = useState({ emoji: '', name: '' });
  const [bagItemDraft, setBagItemDraft] = useState<{ name: string; forWhom: BagForWhom; categoryId: string }>({
    name: '',
    forWhom: 'shared',
    categoryId: '',
  });
  const [bagBulkDraft, setBagBulkDraft] = useState('');
  const [playbookCategoryDraft, setPlaybookCategoryDraft] = useState('');
  const [playbookTipDraft, setPlaybookTipDraft] = useState({ text: '', categoryId: '' });
  const [playbookBulkDraft, setPlaybookBulkDraft] = useState('');
  const [activeSelectionSection, setActiveSelectionSection] = useState<SelectionSection | null>(null);
  const [interventionSelectionIds, setInterventionSelectionIds] = useState<string[]>([]);
  const [bagSelectionIds, setBagSelectionIds] = useState<string[]>([]);
  const [playbookSelectionIds, setPlaybookSelectionIds] = useState<string[]>([]);
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>({
    visible: false,
    title: '',
    body: '',
    confirmLabel: 'Confirm',
    destructive: false,
    onConfirm: null,
  });
  const [snackbarState, setSnackbarState] = useState<SnackbarState>({ visible: false, message: '' });

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    try {
      const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AppData>;
        setPartnerName(parsed.partnerName ?? 'Dad');
        setMotherName(parsed.motherName ?? 'Mama');
        setDueDate(normalizeDueDate(parsed.dueDate ?? 'May 10th'));
        setBirthAnswers(parsed.birthAnswers ?? {});
        setCurrentQuestionIndex(parsed.currentQuestionIndex ?? 0);
        setInterviewStatus(parsed.interviewStatus ?? 'draft');
        setInterventionsState(parsed.interventionsState ?? createInitialInterventions());
        setBagState(parsed.bagState ?? createInitialBagState());
        setPlaybookState(parsed.playbookState ?? createInitialPlaybook());
      }
    } catch (error) {
      console.warn('Failed to load saved data', error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || !hydrated) {
      return;
    }

    const payload: AppData = {
      partnerName,
      motherName,
      dueDate,
      birthAnswers,
      currentQuestionIndex,
      interviewStatus,
      interventionsState,
      bagState,
      playbookState,
    };

    try {
      globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn('Failed to save data', error);
    }
  }, [
    bagState,
    birthAnswers,
    currentQuestionIndex,
    dueDate,
    hydrated,
    interviewStatus,
    interventionsState,
    motherName,
    partnerName,
    playbookState,
  ]);

  useEffect(() => {
    if (!snackbarState.visible) {
      return;
    }

    const timeout = setTimeout(() => {
      setSnackbarState((current) => ({ ...current, visible: false }));
    }, 4000);

    return () => clearTimeout(timeout);
  }, [snackbarState.visible, snackbarState.message]);

  const totalInterviewQuestions = interviewData.length;
  const totalInterviewSteps = totalInterviewQuestions + setupQuestions.length;
  const setupAnswers = [partnerName.trim(), motherName.trim(), dueDate.trim()];
  const setupComplete = setupAnswers.every(Boolean);
  const answeredCount = interviewData.filter((item) => (birthAnswers[item.id] ?? '').trim().length > 0).length;
  const interviewComplete = interviewStatus === 'submitted' && answeredCount === totalInterviewQuestions && setupComplete;
  const totalInterventions = interventionsState.length;
  const reviewedCount = interventionsState.filter((item) => item.reviewed).length;
  const totalBagItems = bagState.reduce((sum, category) => sum + category.items.length, 0);
  const packedCount = bagState.reduce(
    (sum, category) => sum + category.items.filter((item) => item.packed).length,
    0,
  );
  const prepScore = Math.round(
    ((answeredCount / Math.max(totalInterviewQuestions, 1)) * 35) +
      ((reviewedCount / Math.max(totalInterventions, 1)) * 30) +
      ((packedCount / Math.max(totalBagItems, 1)) * 35),
  );
  const currentSetupQuestion = currentQuestionIndex < setupQuestions.length ? setupQuestions[currentQuestionIndex] : null;
  const currentQuestion = currentQuestionIndex >= setupQuestions.length ? interviewData[currentQuestionIndex - setupQuestions.length] : null;
  const currentAnswer = currentSetupQuestion
    ? currentSetupQuestion.id === 'setup_partner'
      ? partnerName
      : currentSetupQuestion.id === 'setup_birthing_parent'
        ? motherName
        : dueDate
    : currentQuestion
      ? birthAnswers[currentQuestion.id] ?? ''
      : '';
  const editingQuestion = editingQuestionId
    ? interviewData.find((question) => question.id === editingQuestionId) ?? null
    : null;
  const editingIntervention = editingInterventionId
    ? interventionsState.find((item) => item.id === editingInterventionId) ?? null
    : null;
  const editingBagCategory = editingBagCategoryId
    ? bagState.find((item) => item.id === editingBagCategoryId) ?? null
    : null;
  const editingBagItem =
    editingBagItemId
      ? bagState.flatMap((category) => category.items.map((item) => ({ ...item, categoryId: category.id }))).find((item) => item.id === editingBagItemId) ?? null
      : null;
  const editingPlaybookCategory = editingPlaybookCategoryId
    ? playbookState.find((item) => item.id === editingPlaybookCategoryId) ?? null
    : null;
  const editingPlaybookTip =
    editingPlaybookTipId
      ? playbookState
          .flatMap((category) => category.tips.map((tip) => ({ ...tip, categoryId: category.id })))
          .find((tip) => tip.id === editingPlaybookTipId) ?? null
      : null;
  const firstUnansweredQuestionIndex = interviewData.findIndex((item) => !(birthAnswers[item.id] ?? '').trim());
  const firstMissingSetupIndex = setupAnswers.findIndex((value) => !value);
  const firstUnansweredIndex =
    firstMissingSetupIndex !== -1
      ? firstMissingSetupIndex
      : firstUnansweredQuestionIndex !== -1
        ? firstUnansweredQuestionIndex + setupQuestions.length
        : -1;
  const parsedBagBulkDraft = parseBulkBagText(bagBulkDraft);
  const parsedPlaybookBulkDraft = parseBulkPlaybookText(playbookBulkDraft);
  const isSelectingInterventions = activeSelectionSection === 'interventions';
  const isSelectingBag = activeSelectionSection === 'bag';
  const isSelectingPlaybook = activeSelectionSection === 'playbook';
  const bagItemIds = bagState.flatMap((category) => category.items.map((item) => item.id));
  const playbookTipIds = playbookState.flatMap((category) => category.tips.map((tip) => tip.id));
  const anySelectionActive = Boolean(activeSelectionSection);

  function exitSelection(section?: SelectionSection) {
    if (!section || section === 'interventions') {
      setInterventionSelectionIds([]);
    }
    if (!section || section === 'bag') {
      setBagSelectionIds([]);
    }
    if (!section || section === 'playbook') {
      setPlaybookSelectionIds([]);
    }
    if (!section || activeSelectionSection === section) {
      setActiveSelectionSection(null);
    }
  }

  function enterSelection(section: SelectionSection, initialId?: string) {
    setActiveSelectionSection(section);
    if (section === 'interventions') {
      setInterventionSelectionIds(initialId ? [initialId] : []);
      setBagSelectionIds([]);
      setPlaybookSelectionIds([]);
    }
    if (section === 'bag') {
      setBagSelectionIds(initialId ? [initialId] : []);
      setInterventionSelectionIds([]);
      setPlaybookSelectionIds([]);
    }
    if (section === 'playbook') {
      setPlaybookSelectionIds(initialId ? [initialId] : []);
      setInterventionSelectionIds([]);
      setBagSelectionIds([]);
    }
  }

  function showConfirmation(options: Omit<ConfirmationState, 'visible'>) {
    setConfirmationState({
      visible: true,
      ...options,
    });
  }

  function showSnackbar(message: string, actionLabel?: string, onAction?: () => void) {
    setSnackbarState({
      visible: true,
      message,
      actionLabel,
      onAction,
    });
  }

  useEffect(() => {
    exitSelection();
  }, [activeSection]);

  useEffect(() => {
    setInterventionSelectionIds((current) => current.filter((id) => interventionsState.some((item) => item.id === id)));
  }, [interventionsState]);

  useEffect(() => {
    setBagSelectionIds((current) => current.filter((id) => bagItemIds.includes(id)));
  }, [bagItemIds]);

  useEffect(() => {
    setPlaybookSelectionIds((current) => current.filter((id) => playbookTipIds.includes(id)));
  }, [playbookTipIds]);

  useEffect(() => {
    if (editingQuestion) {
      setQuestionDraft(birthAnswers[editingQuestion.id] ?? '');
    }
  }, [birthAnswers, editingQuestion]);

  useEffect(() => {
    if (editingIntervention) {
      setInterventionDraft({
        name: editingIntervention.name,
        description: editingIntervention.description,
        preference: editingIntervention.preference,
        stage: editingIntervention.stage,
      });
    }
  }, [editingIntervention]);

  useEffect(() => {
    if (editingBagCategory) {
      setBagCategoryDraft({
        emoji: editingBagCategory.emoji,
        name: editingBagCategory.name,
      });
    }
  }, [editingBagCategory]);

  useEffect(() => {
    if (editingBagItem) {
      setBagItemDraft({
        name: editingBagItem.name,
        forWhom: editingBagItem.forWhom,
        categoryId: editingBagItem.categoryId,
      });
    }
  }, [editingBagItem]);

  useEffect(() => {
    if (editingPlaybookCategory) {
      setPlaybookCategoryDraft(editingPlaybookCategory.name);
    }
  }, [editingPlaybookCategory]);

  useEffect(() => {
    if (editingPlaybookTip) {
      setPlaybookTipDraft({
        text: editingPlaybookTip.text,
        categoryId: editingPlaybookTip.categoryId,
      });
    }
  }, [editingPlaybookTip]);

  const submitInterview = () => {
    if (firstUnansweredIndex !== -1) {
      setInterviewNotice('One or more questions still need an answer. I moved you to the first missing one.');
      setCurrentQuestionIndex(firstUnansweredIndex);
      return;
    }

    setInterviewNotice('Interview submitted.');
    setInterviewStatus('submitted');
    setInterventionsState((current) =>
      current.map((item) => {
        const related = firstRelatedAnswer(item.id, birthAnswers);
        return related ? { ...item, reviewed: true } : item;
      }),
    );
  };

  const startReviewingInterview = () => {
    setInterviewStatus('draft');
    setCurrentQuestionIndex(0);
  };

  const startEditingQuestion = (questionId: string) => {
    setEditingQuestionId(questionId);
    setInterviewStatus('submitted');
  };

  const startEditingSetupQuestion = (index: number) => {
    setInterviewStatus('draft');
    setCurrentQuestionIndex(index);
  };

  const setAnswer = (questionId: string, value: string) => {
    if (interviewNotice) {
      setInterviewNotice('');
    }
    setBirthAnswers((current) => ({ ...current, [questionId]: value }));
  };

  const setSetupAnswer = (value: string) => {
    if (!currentSetupQuestion) {
      return;
    }
    if (interviewNotice) {
      setInterviewNotice('');
    }
    if (currentSetupQuestion.id === 'setup_partner') {
      setPartnerName(value);
      return;
    }
    if (currentSetupQuestion.id === 'setup_birthing_parent') {
      setMotherName(value);
      return;
    }
    setDueDate(normalizeDueDate(value));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < totalInterviewSteps - 1) {
      setCurrentQuestionIndex((index) => index + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((index) => index - 1);
    }
  };

  const addIntervention = () => {
    if (!newInterventionName.trim()) {
      return;
    }

    setInterventionsState((current) => [
      ...current,
      {
        id: createId('intervention'),
        name: newInterventionName.trim(),
        description: newInterventionDescription.trim(),
        preference: newInterventionPreference.trim(),
        reviewed: false,
        stage: newInterventionStage.trim() || 'General',
      },
    ]);
    setNewInterventionName('');
    setNewInterventionDescription('');
    setNewInterventionPreference('');
    setNewInterventionStage('General');
    setAddingIntervention(false);
  };

  const addBagCategory = () => {
    if (!newBagCategoryName.trim()) {
      return;
    }

    setBagState((current) => [
      ...current,
      {
        id: createId('bag-category'),
        name: newBagCategoryName.trim(),
        emoji: newBagCategoryEmoji.trim() || '👜',
        items: [],
      },
    ]);
    setNewBagCategoryName('');
    setNewBagCategoryEmoji('👜');
    setAddingBagCategory(false);
  };

  const addPlaybookCategory = () => {
    if (!newPlaybookCategory.trim()) {
      return;
    }

    setPlaybookState((current) => [
      ...current,
      {
        id: createId('playbook-category'),
        name: newPlaybookCategory.trim(),
        tips: [],
      },
    ]);
    setNewPlaybookCategory('');
    setAddingPlaybookCategory(false);
  };

  const applyBagBulkAdd = () => {
    if (!parsedBagBulkDraft.valid.length) {
      return;
    }

    setBagState((current) => {
      const next = current.map((category) => ({ ...category, items: [...category.items] }));

      parsedBagBulkDraft.valid.forEach((entry) => {
        const normalizedName = normalizeCategoryName(entry.categoryName);
        let category = next.find((item) => normalizeCategoryName(item.name) === normalizedName);

        if (!category) {
          category = {
            id: createId('bag-category'),
            name: entry.categoryName,
            emoji: '👜',
            items: [],
          };
          next.push(category);
        }

        category.items.push({
          id: createId('bag-item'),
          name: entry.name,
          forWhom: entry.forWhom,
          packed: entry.packed,
        });
      });

      return next;
    });

    setBagBulkDraft('');
    setAddingBagBulk(false);
  };

  const applyBagBulkEdit = () => {
    if (!parsedBagBulkDraft.valid.length && bagBulkDraft.trim()) {
      return;
    }

    setBagState((current) => {
      const next = current.map((category) => ({ ...category, items: [] as EditableBagItem[] }));

      parsedBagBulkDraft.valid.forEach((entry) => {
        const normalizedName = normalizeCategoryName(entry.categoryName);
        let category = next.find((item) => normalizeCategoryName(item.name) === normalizedName);

        if (!category) {
          category = {
            id: createId('bag-category'),
            name: entry.categoryName,
            emoji: '👜',
            items: [],
          };
          next.push(category);
        }

        category.items.push({
          id: createId('bag-item'),
          name: entry.name,
          forWhom: entry.forWhom,
          packed: entry.packed,
        });
      });

      return next;
    });

    setEditingBagBulk(false);
  };

  const applyPlaybookBulkAdd = () => {
    if (!parsedPlaybookBulkDraft.valid.length) {
      return;
    }

    setPlaybookState((current) => {
      const next = current.map((category) => ({ ...category, tips: [...category.tips] }));

      parsedPlaybookBulkDraft.valid.forEach((entry) => {
        const normalizedName = normalizeCategoryName(entry.categoryName);
        let category = next.find((item) => normalizeCategoryName(item.name) === normalizedName);

        if (!category) {
          category = {
            id: createId('playbook-category'),
            name: entry.categoryName,
            tips: [],
          };
          next.push(category);
        }

        category.tips.push({
          id: createId('tip'),
          text: entry.text,
        });
      });

      return next;
    });

    setPlaybookBulkDraft('');
    setAddingPlaybookBulk(false);
  };

  const applyPlaybookBulkEdit = () => {
    if (!parsedPlaybookBulkDraft.valid.length && playbookBulkDraft.trim()) {
      return;
    }

    setPlaybookState((current) => {
      const next = current.map((category) => ({ ...category, tips: [] as PlaybookTip[] }));

      parsedPlaybookBulkDraft.valid.forEach((entry) => {
        const normalizedName = normalizeCategoryName(entry.categoryName);
        let category = next.find((item) => normalizeCategoryName(item.name) === normalizedName);

        if (!category) {
          category = {
            id: createId('playbook-category'),
            name: entry.categoryName,
            tips: [],
          };
          next.push(category);
        }

        category.tips.push({
          id: createId('tip'),
          text: entry.text,
        });
      });

      return next;
    });

    setEditingPlaybookBulk(false);
  };

  const exportBagCsv = () => {
    const header = ['Item', 'Category', 'For', 'Packed'];
    const rows = bagState.flatMap((category) =>
      category.items.map((item) => [
        item.name,
        category.name,
        labelForWhom(item.forWhom, motherName, partnerName),
        item.packed ? 'Yes' : 'No',
      ]),
    );
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    if (Platform.OS === 'web') {
      const web = globalThis as typeof globalThis & {
        Blob: new (parts?: unknown[], options?: { type?: string }) => { size: number };
        URL: {
          createObjectURL: (blob: { size: number }) => string;
          revokeObjectURL: (url: string) => void;
        };
        document: {
          createElement: (tagName: string) => { href: string; download: string; click: () => void };
        };
      };
      const blob = new web.Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = web.URL.createObjectURL(blob);
      const link = web.document.createElement('a');
      link.href = url;
      link.download = 'labor-bag.csv';
      link.click();
      web.URL.revokeObjectURL(url);
    }
  };

  const interventionsByStage = interventionsState.reduce<Record<string, EditableIntervention[]>>((acc, item) => {
    const stage = item.stage || 'General';
    if (!acc[stage]) {
      acc[stage] = [];
    }
    acc[stage].push(item);
    return acc;
  }, {});

  const orderedStages = stageOptions
    .filter((stage) => interventionsByStage[stage]?.length)
    .concat(Object.keys(interventionsByStage).filter((stage) => !stageOptions.includes(stage)));
  const nextStep = !interviewComplete
    ? {
        title: 'Finish the interview',
        body: `Capture the remaining preferences with ${motherName || 'the birthing parent'} so the rest of the plan has context.`,
        action: 'Go to Interview',
        section: 'interview' as AppSection,
      }
    : reviewedCount < totalInterventions
      ? {
          title: 'Review interventions',
          body: 'Confirm which common labor decisions need a clear preference before they come up live.',
          action: 'Go to Interventions',
          section: 'interventions' as AppSection,
        }
      : packedCount < totalBagItems
        ? {
            title: 'Finish the labor bag',
            body: 'Close the gap on what still needs to be packed so departure is simpler when labor starts.',
            action: 'Go to Labor Bag',
            section: 'bag' as AppSection,
          }
        : {
            title: 'Do a final review',
            body: 'The core prep is in place. Use this pass to check details, export the bag, and confirm readiness.',
            action: 'Open Playbook',
            section: 'playbook' as AppSection,
          };
  const selectedBagCount = bagSelectionIds.length;
  const selectedInterventionCount = interventionSelectionIds.length;
  const selectedPlaybookCount = playbookSelectionIds.length;
  const bagBulkActions: BulkAction[] = [
    {
      id: 'packed',
      label: 'Pack',
      onPress: () =>
        setBagState((current) =>
          current.map((category) => ({
            ...category,
            items: category.items.map((item) =>
              bagSelectionIds.includes(item.id) ? { ...item, packed: true } : item,
            ),
          })),
        ),
      disabled: selectedBagCount === 0,
    },
    {
      id: 'unpacked',
      label: 'Unpack',
      onPress: () =>
        setBagState((current) =>
          current.map((category) => ({
            ...category,
            items: category.items.map((item) =>
              bagSelectionIds.includes(item.id) ? { ...item, packed: false } : item,
            ),
          })),
        ),
      disabled: selectedBagCount === 0,
    },
    {
      id: 'delete',
      label: 'Delete',
      destructive: true,
      disabled: selectedBagCount === 0,
      onPress: () => {
        const previousBagState = bagState;
        showConfirmation({
          title: `Delete ${selectedBagCount} item${selectedBagCount === 1 ? '' : 's'}?`,
          body: 'This removes the selected bag items from their categories.',
          confirmLabel: 'Delete',
          destructive: true,
          onConfirm: () => {
            setBagState((current) =>
              current.map((category) => ({
                ...category,
                items: category.items.filter((item) => !bagSelectionIds.includes(item.id)),
              })),
            );
            exitSelection('bag');
            showSnackbar(`${selectedBagCount} bag item${selectedBagCount === 1 ? '' : 's'} deleted`, 'Undo', () => {
              setBagState(previousBagState);
            });
          },
        });
      },
    },
  ];
  const interventionBulkActions: BulkAction[] = [
    {
      id: 'review',
      label: 'Mark reviewed',
      onPress: () =>
        setInterventionsState((current) =>
          current.map((item) => (interventionSelectionIds.includes(item.id) ? { ...item, reviewed: true } : item)),
        ),
      disabled: selectedInterventionCount === 0,
    },
    {
      id: 'unreview',
      label: 'Clear review',
      onPress: () =>
        setInterventionsState((current) =>
          current.map((item) => (interventionSelectionIds.includes(item.id) ? { ...item, reviewed: false } : item)),
        ),
      disabled: selectedInterventionCount === 0,
    },
    {
      id: 'delete',
      label: 'Delete',
      destructive: true,
      disabled: selectedInterventionCount === 0,
      onPress: () => {
        const previousInterventions = interventionsState;
        showConfirmation({
          title: `Delete ${selectedInterventionCount} intervention${selectedInterventionCount === 1 ? '' : 's'}?`,
          body: 'This removes the selected interventions from the plan.',
          confirmLabel: 'Delete',
          destructive: true,
          onConfirm: () => {
            setInterventionsState((current) => current.filter((item) => !interventionSelectionIds.includes(item.id)));
            exitSelection('interventions');
            showSnackbar(
              `${selectedInterventionCount} intervention${selectedInterventionCount === 1 ? '' : 's'} deleted`,
              'Undo',
              () => {
                setInterventionsState(previousInterventions);
              },
            );
          },
        });
      },
    },
  ];
  const playbookBulkActions: BulkAction[] = [
    {
      id: 'delete',
      label: 'Delete',
      destructive: true,
      disabled: selectedPlaybookCount === 0,
      onPress: () => {
        const previousPlaybookState = playbookState;
        showConfirmation({
          title: `Delete ${selectedPlaybookCount} tip${selectedPlaybookCount === 1 ? '' : 's'}?`,
          body: 'This removes the selected playbook tips from their categories.',
          confirmLabel: 'Delete',
          destructive: true,
          onConfirm: () => {
            setPlaybookState((current) =>
              current.map((category) => ({
                ...category,
                tips: category.tips.filter((tip) => !playbookSelectionIds.includes(tip.id)),
              })),
            );
            exitSelection('playbook');
            showSnackbar(`${selectedPlaybookCount} tip${selectedPlaybookCount === 1 ? '' : 's'} deleted`, 'Undo', () => {
              setPlaybookState(previousPlaybookState);
            });
          },
        });
      },
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.scrollContent, anySelectionActive && styles.scrollContentSelectionActive]}
      >
        <View style={styles.backgroundOrbTop} />
        <View style={styles.backgroundOrbBottom} />

        <View style={[styles.topNav, isDesktop && styles.topNavDesktop]}>
          <Text style={styles.topNavBrand}>Labor Prep Together</Text>
          <View style={styles.topNavTabs}>
            {sections.map((section) => {
              const selected = section.key === activeSection;
              return (
                <Pressable
                  key={section.key}
                  onPress={() => setActiveSection(section.key)}
                  style={[styles.topNavTab, selected && styles.topNavTabActive]}
                >
                  <View style={styles.topNavTabContent}>
                    <Text style={[styles.topNavTabText, selected && styles.topNavTabTextActive]}>{section.label}</Text>
                    {section.key === 'interview' ? (
                      <CircularProgress
                        progress={answeredCount / Math.max(totalInterviewQuestions, 1)}
                        complete={interviewComplete}
                        compact
                        inverted={selected}
                        label={`Interview progress ${Math.round((answeredCount / Math.max(totalInterviewQuestions, 1)) * 100)} percent`}
                      />
                    ) : null}
                    {section.key === 'interventions' ? (
                      <CircularProgress
                        progress={reviewedCount / Math.max(totalInterventions, 1)}
                        complete={reviewedCount === totalInterventions && totalInterventions > 0}
                        compact
                        inverted={selected}
                        label={`Interventions progress ${Math.round((reviewedCount / Math.max(totalInterventions, 1)) * 100)} percent`}
                      />
                    ) : null}
                    {section.key === 'bag' ? (
                      <CircularProgress
                        progress={packedCount / Math.max(totalBagItems, 1)}
                        complete={packedCount === totalBagItems && totalBagItems > 0}
                        compact
                        inverted={selected}
                        label={`Labor bag progress ${Math.round((packedCount / Math.max(totalBagItems, 1)) * 100)} percent`}
                      />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {activeSection === 'overview' ? (
          <>
            <HeroShell>
              <View style={styles.reviewShell}>
                <Text style={styles.heroTitle}>
                  {firstName(partnerName)
                    ? `${firstName(partnerName)}, build the game plan before labor starts making the decisions for you.`
                    : 'Build the game plan before labor starts making the decisions for you.'}
                </Text>
                <Text style={styles.heroBody}>
                  This is where the husband or support partner checks the plan, closes gaps, and makes sure they are ready to show up calm, informed, and useful when labor begins.
                </Text>
                <View style={styles.nextStepCard}>
                  <Text style={styles.nextStepEyebrow}>Next Best Step</Text>
                  <Text style={styles.nextStepTitle}>{nextStep.title}</Text>
                  <Text style={styles.nextStepBody}>{nextStep.body}</Text>
                  <View style={styles.heroActions}>
                    <PrimaryButton label={nextStep.action} onPress={() => setActiveSection(nextStep.section)} />
                  </View>
                </View>
                <View style={[styles.reviewPriorityRow, isTablet && styles.reviewPriorityRowWide]}>
                  <View style={styles.prepScoreCard}>
                    <View style={styles.reviewMiniCard}>
                      <Text style={styles.reviewMiniLabel}>Prep progress</Text>
                      <Text style={styles.reviewMiniValue}>{`${Number.isFinite(prepScore) ? prepScore : 0}%`}</Text>
                      <Text style={styles.reviewMiniHint}>Interview, interventions, and bag readiness combined.</Text>
                    </View>
                  </View>
                  <View style={styles.dueDateCard}>
                    <View style={styles.reviewMiniCard}>
                      <Text style={styles.reviewMiniLabel}>Due date</Text>
                      <Text style={styles.reviewMiniValue}>{dueDate}</Text>
                      <Text style={styles.reviewMiniHint}>Keep this current so the plan stays anchored.</Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.heroGrid, isTablet && styles.heroGridWide]}>
                  <MetricCard label="Interview" value={`${answeredCount}/${totalInterviewQuestions}`}>
                    {interviewComplete ? 'Preferences captured and submitted.' : 'Finish capturing preferences and submit the interview.'}
                  </MetricCard>
                  <MetricCard label="Interventions" value={`${reviewedCount}/${totalInterventions}`}>
                    {reviewedCount === totalInterventions && totalInterventions > 0 ? 'Core intervention decisions have been reviewed.' : 'Use this to align on likely labor decisions.'}
                  </MetricCard>
                  <MetricCard label="Labor Bag" value={`${packedCount}/${totalBagItems}`}>
                    {packedCount === totalBagItems && totalBagItems > 0 ? 'The bag looks ready to go.' : 'Track what is packed and what still needs to be added.'}
                  </MetricCard>
                </View>
              </View>
            </HeroShell>
            <Section
              title="Exports & Shortcuts"
              subtitle="Use these actions when you want to leave the app with a clean, usable output."
            >
              <View style={styles.addActionRow}>
                <SecondaryButton label="Export Labor Bag CSV" onPress={exportBagCsv} compact />
                <SecondaryButton label="Open Playbook" onPress={() => setActiveSection('playbook')} compact />
              </View>
            </Section>
          </>
        ) : null}

        {activeSection === 'interview' ? (
          <Section
            title="Interview"
            subtitle={
              interviewComplete
                ? `${partnerName || 'Partner'}, the interview with ${motherName || 'the birthing parent'} is submitted. Review the summary or reopen it question by question.`
                : `${partnerName || 'Partner'}, work through this one question at a time with ${motherName || 'the birthing parent'}, then submit the full interview.`
            }
          >
            <View style={styles.readingColumn}>
            {interviewComplete ? (
              <>
                <View style={[styles.bannerCard, styles.successBanner]}>
                  <Text style={styles.bannerTitle}>Interview submitted</Text>
                  <Text style={styles.bannerText}>
                    The answers {partnerName || 'you'} captured from {motherName || 'the birthing parent'} now feed related intervention cards where applicable.
                  </Text>
                </View>
                <View style={styles.summaryActions}>
                  <SecondaryButton label="Redo Interview" onPress={startReviewingInterview} />
                  <PrimaryButton label="Go to Interventions" onPress={() => setActiveSection('interventions')} />
                </View>
                {setupQuestions.map((question, index) => {
                  const answer =
                    question.id === 'setup_partner'
                      ? partnerName
                      : question.id === 'setup_birthing_parent'
                        ? motherName
                        : dueDate;
                  return (
                    <EditableCard
                      key={question.id}
                      onEdit={() => startEditingSetupQuestion(index)}
                      showFooter={false}
                      style={styles.summaryRowCard}
                    >
                      <View style={styles.rowBetweenCompact}>
                        <View style={styles.flexOne}>
                          <Text style={styles.summaryQuestionText}>{question.label}</Text>
                          <Text style={styles.summaryAnswerPreview}>{answer || 'No answer saved.'}</Text>
                        </View>
                        <Pressable onPress={() => startEditingSetupQuestion(index)} style={styles.inlineEditButton}>
                          <Text style={styles.inlineEditButtonText}>⋯</Text>
                        </Pressable>
                      </View>
                    </EditableCard>
                  );
                })}
                {interviewData.map((question) => (
                  <EditableCard
                    key={question.id}
                    onEdit={() => startEditingQuestion(question.id)}
                    showFooter={false}
                    style={styles.summaryRowCard}
                  >
                    <View style={styles.rowBetweenCompact}>
                      <View style={styles.flexOne}>
                        <Text style={styles.summaryQuestionText}>{personalizeQuestionText(question.question, motherName)}</Text>
                        <Text style={styles.summaryAnswerPreview}>{birthAnswers[question.id] || 'No answer saved.'}</Text>
                      </View>
                      <Pressable onPress={() => startEditingQuestion(question.id)} style={styles.inlineEditButton}>
                        <Text style={styles.inlineEditButtonText}>⋯</Text>
                      </Pressable>
                    </View>
                  </EditableCard>
                ))}
              </>
            ) : (
              <>
                <View style={styles.progressCard}>
                  <Text style={styles.progressLabel}>
                    Question {currentQuestionIndex + 1} of {totalInterviewSteps}
                  </Text>
                  <ProgressBar progress={(currentQuestionIndex + 1) / Math.max(totalInterviewSteps, 1)} />
                </View>
                {currentSetupQuestion || currentQuestion ? (
                  <View style={styles.questionCard}>
                    {interviewNotice ? (
                      <View style={styles.noticeCard}>
                        <Text style={styles.noticeText}>{interviewNotice}</Text>
                      </View>
                    ) : null}
                    <Text style={styles.questionPrompt}>
                      {currentSetupQuestion ? currentSetupQuestion.label : personalizeQuestionText(currentQuestion!.question, motherName)}
                    </Text>
                    {currentQuestion?.description && (
                      <Text style={styles.descriptionText}>{currentQuestion.description}</Text>
                    )}
                    {currentQuestion?.type === 'single-choice' && currentQuestion.options ? (
                      <>
                        <View style={styles.chipRow}>
                          {currentQuestion.options.map((option) => {
                            const selected = currentAnswer === option;
                            return (
                              <Pressable
                                key={option}
                                onPress={() => setAnswer(currentQuestion.id, option)}
                                style={[styles.choiceChip, selected && styles.choiceChipSelected]}
                              >
                                <Text style={[styles.choiceChipText, selected && styles.choiceChipTextSelected]}>{option}</Text>
                              </Pressable>
                            );
                          })}
                        </View>
                        {currentAnswer && currentQuestion?.optionDescriptions?.[currentAnswer] && (
                          <View style={styles.optionDescriptionBox}>
                            <Text style={styles.optionDescriptionText}>
                              {currentQuestion.optionDescriptions[currentAnswer]}
                            </Text>
                          </View>
                        )}
                      </>
                    ) : null}
                    {currentSetupQuestion?.id === 'setup_due_date' ? (
                      <TextInput
                        value={currentAnswer}
                        onChangeText={(value) => setSetupAnswer(value)}
                        placeholder="YYYY-MM-DD (e.g., 2026-05-20)"
                        placeholderTextColor={colors.textTertiary}
                        style={[styles.textInput, styles.multilineInput]}
                      />
                    ) : (
                      <TextInput
                        value={currentAnswer}
                        onChangeText={(value) =>
                          currentSetupQuestion ? setSetupAnswer(value) : setAnswer(currentQuestion!.id, value)
                        }
                        placeholder={
                          currentSetupQuestion
                            ? currentSetupQuestion.placeholder
                            : currentQuestion?.placeholder
                              ? personalizePlaceholder(currentQuestion.placeholder, motherName)
                              : `Type ${motherName || 'their'} answer here`
                        }
                        placeholderTextColor={colors.textTertiary}
                        multiline
                        style={[styles.textInput, styles.multilineInput]}
                      />
                    )}
                    <View style={styles.heroActions}>
                      <SecondaryButton label="Back" onPress={previousQuestion} disabled={currentQuestionIndex === 0} />
                      {currentQuestionIndex < totalInterviewSteps - 1 ? (
                        <PrimaryButton label="Next question" onPress={nextQuestion} />
                      ) : (
                        <PrimaryButton
                          label="Submit interview"
                          onPress={submitInterview}
                        />
                      )}
                    </View>
                  </View>
                ) : null}
                <View style={styles.interviewFooter}>
                  <Text style={styles.interviewFooterText}>
                    Answered {answeredCount}/{totalInterviewQuestions}. Progress saves automatically.
                  </Text>
                </View>
              </>
            )}
            </View>
          </Section>
        ) : null}

        {activeSection === 'interventions' ? (
          <Section
            title="Interventions"
            subtitle="Use this section to clarify preferences around common labor decisions before they come up in the moment."
          >
            <View style={styles.progressCard}>
              <Text style={styles.progressLabel}>Reviewed {reviewedCount} of {totalInterventions}</Text>
              <ProgressBar progress={reviewedCount / Math.max(totalInterventions, 1)} />
            </View>
            <View style={styles.listColumn}>
            <SelectionHeader
              selecting={isSelectingInterventions}
              selectedCount={selectedInterventionCount}
              onSelect={() => enterSelection('interventions')}
              onCancel={() => exitSelection('interventions')}
              onSelectAll={() => setInterventionSelectionIds(interventionsState.map((item) => item.id))}
              onClear={() => setInterventionSelectionIds([])}
              allSelected={selectedInterventionCount > 0 && selectedInterventionCount === interventionsState.length}
            />
            <View style={styles.addActionRow}>
              <SecondaryButton label="Add Intervention" onPress={() => setAddingIntervention(true)} compact />
            </View>
              {orderedStages.map((stage) => (
                <View key={stage} style={styles.stageGroup}>
                  <Text style={styles.stageTitle}>{stage}</Text>
                  <Text style={styles.stageSubtitle}>Interventions most relevant to this stage of the labor flow.</Text>
                  <View style={[styles.interventionGrid, isTablet && styles.interventionGridWide]}>
                {interventionsByStage[stage].map((item) => {
                  const related = firstRelatedAnswer(item.id, birthAnswers);
                  return (
                  <SelectableCard
                    key={item.id}
                    selectionMode={isSelectingInterventions}
                    selected={interventionSelectionIds.includes(item.id)}
                    onSelect={() => setInterventionSelectionIds((current) => toggleSelectionId(current, item.id))}
                    onOpen={() => setEditingInterventionId(item.id)}
                    onEnterSelection={() => enterSelection('interventions', item.id)}
                    style={[
                      styles.interventionCard,
                      item.reviewed && styles.interventionCardReviewed,
                    ]}
                  >
                    <View style={styles.rowBetween}>
                      <Text style={styles.cardTitle}>{item.name}</Text>
                      <View style={styles.headerActions}>
                        {!isSelectingInterventions ? (
                          <Pressable
                            onPress={() =>
                              setInterventionsState((current) =>
                                current.map((entry) => (entry.id === item.id ? { ...entry, reviewed: !entry.reviewed } : entry)),
                              )
                            }
                            style={[styles.statusPillButton, item.reviewed && styles.statusPillButtonActive]}
                          >
                            <Text style={[styles.statusPill, item.reviewed && styles.statusPillActive]}>
                              {item.reviewed ? 'Reviewed' : 'Review'}
                            </Text>
                          </Pressable>
                        ) : null}
                        {!isSelectingInterventions ? (
                          <Pressable onPress={() => setEditingInterventionId(item.id)} style={styles.inlineEditButton}>
                            <Text style={styles.inlineEditButtonText}>⋯</Text>
                          </Pressable>
                        ) : null}
                      </View>
                    </View>
                    <Text style={styles.stagePill}>{item.stage}</Text>
                    <View style={styles.infoBlock}>
                      <Text style={styles.infoLabel}>Description</Text>
                      <Text style={styles.readOnlyBody}>{item.description || 'No description.'}</Text>
                    </View>
                    <View style={styles.infoBlock}>
                      <Text style={styles.infoLabel}>Preference</Text>
                      <Text style={styles.readOnlyBody}>{item.preference || 'No preference yet.'}</Text>
                    </View>
                    {related ? (
                      <View style={styles.relatedCard}>
                        <Text style={styles.relatedLabel}>Interview signal</Text>
                        <Text style={styles.relatedQuestion}>{related.question}</Text>
                        <Text style={styles.relatedAnswer}>{related.answer}</Text>
                      </View>
                    ) : null}
                  </SelectableCard>
                  );
                })}
                  </View>
                </View>
              ))}
            </View>
          </Section>
        ) : null}

        {activeSection === 'bag' ? (
          <Section
            title="Labor Bag"
            subtitle="Use this section to organize what needs to be packed, who it is for, and what is already ready to go."
          >
            <View style={styles.listColumn}>
              <View style={styles.progressCard}>
                <Text style={styles.progressLabel}>Packed {packedCount} of {totalBagItems}</Text>
                <ProgressBar progress={packedCount / Math.max(totalBagItems, 1)} />
              </View>
              <SelectionHeader
                selecting={isSelectingBag}
                selectedCount={selectedBagCount}
                onSelect={() => enterSelection('bag')}
                onCancel={() => exitSelection('bag')}
                onSelectAll={() => setBagSelectionIds(bagItemIds)}
                onClear={() => setBagSelectionIds([])}
                allSelected={selectedBagCount > 0 && selectedBagCount === bagItemIds.length}
              />
              <View style={styles.addActionRow}>
                <SecondaryButton label="Add Category" onPress={() => setAddingBagCategory(true)} compact />
                <SecondaryButton
                  label="Add Item"
                  onPress={() => {
                    setBagItemDraft({
                      name: '',
                      forWhom: 'shared',
                      categoryId: bagState[0]?.id ?? '',
                    });
                    setAddingBagItem(true);
                  }}
                  compact
                />
              </View>
              <Pressable onPress={() => setBagAdvancedOpen((current) => !current)} style={styles.advancedToggle}>
                <Text style={styles.advancedToggleText}>{bagAdvancedOpen ? 'Hide advanced' : 'Show advanced'}</Text>
              </Pressable>
              {bagAdvancedOpen ? (
                <View style={styles.advancedActionsRow}>
                  <SecondaryButton label="Bulk Add" onPress={() => setAddingBagBulk(true)} compact />
                  <SecondaryButton
                    label="Bulk Edit"
                    onPress={() => {
                      setBagBulkDraft(bagBulkTextFromState(bagState, motherName, partnerName));
                      setEditingBagBulk(true);
                    }}
                    compact
                  />
                  <SecondaryButton label="Export CSV" onPress={exportBagCsv} compact />
                </View>
              ) : null}
              {bagState.map((category) => (
                <View key={category.id} style={styles.bagCard}>
                {(() => {
                  const packedInCategory = category.items.filter((item) => item.packed).length;
                  const allPacked = category.items.length > 0 && packedInCategory === category.items.length;
                  return (
                    <>
                      <EditableCard
                        onEdit={() => setEditingBagCategoryId(category.id)}
                        showFooter={false}
                        style={styles.categoryShell}
                      >
                        <View style={styles.rowBetweenCompact}>
                          <Text style={styles.cardTitle}>{category.emoji} {category.name}</Text>
                          <View style={styles.headerActions}>
                            <Text style={styles.stateText}>{packedInCategory}/{category.items.length} packed</Text>
                            <Pressable onPress={() => setEditingBagCategoryId(category.id)} style={styles.inlineEditButton}>
                              <Text style={styles.inlineEditButtonText}>⋯</Text>
                            </Pressable>
                          </View>
                        </View>
                      </EditableCard>
                      {category.items.length ? (
                        <View style={styles.categorySecondaryRow}>
                          <Pressable
                            onPress={() =>
                              setBagState((current) =>
                                current.map((entry) =>
                                  entry.id === category.id
                                    ? {
                                        ...entry,
                                        items: entry.items.map((bagItem) => ({ ...bagItem, packed: !allPacked })),
                                      }
                                    : entry,
                                ),
                              )
                            }
                            style={styles.secondaryInlineAction}
                          >
                            <Text style={styles.secondaryInlineActionText}>{allPacked ? 'Uncheck all' : 'Check all'}</Text>
                          </Pressable>
                        </View>
                      ) : null}
                    </>
                  );
                })()}
                {category.items.length === 0 ? (
                  <View style={styles.emptyStateRow}>
                    <Text style={styles.emptyStateText}>No items in this category yet.</Text>
                  </View>
                ) : null}
                {category.items.map((item) => (
                  <SelectableCard
                    key={item.id}
                    selectionMode={isSelectingBag}
                    selected={bagSelectionIds.includes(item.id)}
                    onSelect={() => setBagSelectionIds((current) => toggleSelectionId(current, item.id))}
                    onOpen={() =>
                      setBagState((current) =>
                        current.map((entry) =>
                          entry.id === category.id
                            ? {
                                ...entry,
                                items: entry.items.map((bagItem) =>
                                  bagItem.id === item.id ? { ...bagItem, packed: !bagItem.packed } : bagItem,
                                ),
                              }
                            : entry,
                        ),
                      )
                    }
                    onEnterSelection={() => enterSelection('bag', item.id)}
                    style={styles.itemRowCard}
                  >
                    <View style={styles.itemEditorRow}>
                      <View style={[styles.checkbox, item.packed && styles.checkboxChecked]}>
                        {item.packed ? <Text style={styles.checkboxMark}>✓</Text> : null}
                      </View>
                      <View style={styles.flexOne}>
                        <Text style={styles.readOnlyBody}>{item.name}</Text>
                        <Text style={styles.stateText}>{labelForWhom(item.forWhom, motherName, partnerName)}</Text>
                      </View>
                      {!isSelectingBag ? (
                        <Pressable onPress={() => setEditingBagItemId(item.id)} style={styles.inlineEditButton}>
                          <Text style={styles.inlineEditButtonText}>⋯</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </SelectableCard>
                ))}
              </View>
              ))}
            </View>
          </Section>
        ) : null}

        {activeSection === 'playbook' ? (
          <Section
            title="Playbook"
            subtitle="Use this section to capture reminders, support cues, and practical notes to lean on during labor."
          >
            <View style={styles.listColumn}>
              <SelectionHeader
                selecting={isSelectingPlaybook}
                selectedCount={selectedPlaybookCount}
                onSelect={() => enterSelection('playbook')}
                onCancel={() => exitSelection('playbook')}
                onSelectAll={() => setPlaybookSelectionIds(playbookTipIds)}
                onClear={() => setPlaybookSelectionIds([])}
                allSelected={selectedPlaybookCount > 0 && selectedPlaybookCount === playbookTipIds.length}
              />
              <View style={styles.addActionRow}>
                <SecondaryButton label="Add Category" onPress={() => setAddingPlaybookCategory(true)} compact />
                <SecondaryButton
                  label="Add Tip"
                  onPress={() => {
                    setPlaybookTipDraft({ text: '', categoryId: playbookState[0]?.id ?? '' });
                    setAddingPlaybookTip(true);
                  }}
                  disabled={playbookState.length === 0}
                  compact
                />
              </View>
              <Pressable onPress={() => setPlaybookAdvancedOpen((current) => !current)} style={styles.advancedToggle}>
                <Text style={styles.advancedToggleText}>
                  {playbookAdvancedOpen ? 'Hide advanced' : 'Show advanced'}
                </Text>
              </Pressable>
              {playbookAdvancedOpen ? (
                <View style={styles.advancedActionsRow}>
                  <SecondaryButton label="Bulk Add" onPress={() => setAddingPlaybookBulk(true)} compact />
                  <SecondaryButton
                    label="Bulk Edit"
                    onPress={() => {
                      setPlaybookBulkDraft(playbookBulkTextFromState(playbookState));
                      setEditingPlaybookBulk(true);
                    }}
                    compact
                  />
                </View>
              ) : null}
            {playbookState.map((group) => (
              <View key={group.id} style={styles.tipCard}>
                <EditableCard
                  onEdit={() => setEditingPlaybookCategoryId(group.id)}
                  showFooter={false}
                  style={styles.categoryShell}
                >
                  <View style={styles.rowBetweenCompact}>
                    <Text style={styles.cardTitle}>{group.name}</Text>
                    <Pressable onPress={() => setEditingPlaybookCategoryId(group.id)} style={styles.inlineEditButton}>
                      <Text style={styles.inlineEditButtonText}>⋯</Text>
                    </Pressable>
                  </View>
                </EditableCard>
                {group.tips.length === 0 ? (
                  <View style={styles.emptyStateRow}>
                    <Text style={styles.emptyStateText}>No tips in this category yet.</Text>
                  </View>
                ) : null}
                {group.tips.map((tip) => (
                  <SelectableCard
                    key={tip.id}
                    selectionMode={isSelectingPlaybook}
                    selected={playbookSelectionIds.includes(tip.id)}
                    onSelect={() => setPlaybookSelectionIds((current) => toggleSelectionId(current, tip.id))}
                    onOpen={() => setEditingPlaybookTipId(tip.id)}
                    onEnterSelection={() => enterSelection('playbook', tip.id)}
                    style={styles.itemRowCard}
                  >
                    <View style={styles.rowBetweenCompact}>
                      <Text style={[styles.readOnlyBody, styles.flexOne]}>{tip.text}</Text>
                      {!isSelectingPlaybook ? (
                        <Pressable onPress={() => setEditingPlaybookTipId(tip.id)} style={styles.inlineEditButton}>
                          <Text style={styles.inlineEditButtonText}>⋯</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </SelectableCard>
                ))}
              </View>
            ))}
            </View>
          </Section>
        ) : null}

        <AppModal visible={Boolean(editingQuestion)} title="Edit answer" onClose={() => setEditingQuestionId(null)}>
          {editingQuestion ? (
            <>
              <Text style={styles.modalPrompt}>{personalizeQuestionText(editingQuestion.question, motherName)}</Text>
              
              {editingQuestion.type === 'single-choice' && editingQuestion.options ? (
                <View style={styles.chipRow}>
                  {editingQuestion.options.map((option) => {
                    const selected = questionDraft === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => setQuestionDraft(option)}
                        style={[styles.choiceChip, selected && styles.choiceChipSelected]}
                      >
                        <Text style={[styles.choiceChipText, selected && styles.choiceChipTextSelected]}>{option}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
              <TextInput
                value={questionDraft}
                onChangeText={setQuestionDraft}
                placeholder={
                  editingQuestion.placeholder
                    ? personalizePlaceholder(editingQuestion.placeholder, motherName)
                    : `Type ${motherName || 'their'} answer here`
                }
                placeholderTextColor={colors.textTertiary}
                multiline
                style={[styles.modalTextInput, styles.modalTextArea]}
              />
              <View style={styles.modalActions}>
                <View style={styles.modalActionSpacer} />
                <SecondaryButton label="Cancel" onPress={() => setEditingQuestionId(null)} />
                <PrimaryButton
                  label="Done"
                  onPress={() => {
                    setAnswer(editingQuestion.id, questionDraft);
                    setEditingQuestionId(null);
                  }}
                />
              </View>
            </>
          ) : null}
        </AppModal>

        <AppModal visible={addingIntervention} title="Add intervention" onClose={() => setAddingIntervention(false)}>
          <>
            <Text style={styles.modalLabel}>Name</Text>
            <TextInput
              value={newInterventionName}
              onChangeText={setNewInterventionName}
              placeholder="Intervention name"
              placeholderTextColor={colors.textTertiary}
              style={styles.modalTextInput}
            />
            <Text style={styles.modalLabel}>Description</Text>
            <TextInput
              value={newInterventionDescription}
              onChangeText={setNewInterventionDescription}
              placeholder="Short plain-language description"
              placeholderTextColor={colors.textTertiary}
              multiline
              style={[styles.modalTextInput, styles.modalTextArea]}
            />
            <Text style={styles.modalLabel}>Preference</Text>
            <TextInput
              value={newInterventionPreference}
              onChangeText={setNewInterventionPreference}
              placeholder="Default stance or preference"
              placeholderTextColor={colors.textTertiary}
              multiline
              style={[styles.modalTextInput, styles.modalTextArea]}
            />
            <Text style={styles.modalLabel}>Labor stage</Text>
            <StageSelect value={newInterventionStage} onChange={setNewInterventionStage} modal />
            <View style={styles.modalActions}>
              <View style={styles.modalActionSpacer} />
              <SecondaryButton label="Cancel" onPress={() => setAddingIntervention(false)} />
              <PrimaryButton label="Done" onPress={addIntervention} />
            </View>
          </>
        </AppModal>

        <AppModal visible={Boolean(editingIntervention)} title="Edit intervention" onClose={() => setEditingInterventionId(null)}>
          {editingIntervention ? (
            <>
              <Text style={styles.modalLabel}>Name</Text>
              <TextInput
                value={interventionDraft.name}
                onChangeText={(value) => setInterventionDraft((current) => ({ ...current, name: value }))}
                placeholder="Name"
                placeholderTextColor={colors.textTertiary}
                style={styles.modalTextInput}
              />
              <Text style={styles.modalLabel}>Description</Text>
              <TextInput
                value={interventionDraft.description}
                onChangeText={(value) => setInterventionDraft((current) => ({ ...current, description: value }))}
                placeholder="Description"
                placeholderTextColor={colors.textTertiary}
                multiline
                style={[styles.modalTextInput, styles.modalTextArea]}
              />
              <Text style={styles.modalLabel}>Preference</Text>
              <TextInput
                value={interventionDraft.preference}
                onChangeText={(value) => setInterventionDraft((current) => ({ ...current, preference: value }))}
                placeholder="Preference"
                placeholderTextColor={colors.textTertiary}
                multiline
                style={[styles.modalTextInput, styles.modalTextArea]}
              />
              <Text style={styles.modalLabel}>Labor stage</Text>
              <StageSelect
                value={interventionDraft.stage}
                onChange={(value) => setInterventionDraft((current) => ({ ...current, stage: value }))}
                modal
              />
              <View style={styles.modalActions}>
                <SecondaryButton
                  label="Delete"
                  onPress={() => {
                    setInterventionsState((current) => current.filter((entry) => entry.id !== editingIntervention.id));
                    setEditingInterventionId(null);
                  }}
                />
                <SecondaryButton label="Cancel" onPress={() => setEditingInterventionId(null)} />
                <PrimaryButton
                  label="Done"
                  onPress={() => {
                    setInterventionsState((current) =>
                      current.map((entry) =>
                        entry.id === editingIntervention.id
                          ? {
                              ...entry,
                              name: interventionDraft.name,
                              description: interventionDraft.description,
                              preference: interventionDraft.preference,
                              stage: interventionDraft.stage,
                            }
                          : entry,
                      ),
                    );
                    setEditingInterventionId(null);
                  }}
                />
              </View>
            </>
          ) : null}
        </AppModal>

        <AppModal visible={Boolean(editingBagCategory)} title="Edit bag category" onClose={() => setEditingBagCategoryId(null)}>
          {editingBagCategory ? (
            <>
              <Text style={styles.modalLabel}>Emoji</Text>
              <TextInput
                value={bagCategoryDraft.emoji}
                onChangeText={(value) => setBagCategoryDraft((current) => ({ ...current, emoji: value }))}
                placeholder="Emoji"
                placeholderTextColor={colors.textTertiary}
                style={styles.modalTextInput}
              />
              <Text style={styles.modalLabel}>Category name</Text>
              <TextInput
                value={bagCategoryDraft.name}
                onChangeText={(value) => setBagCategoryDraft((current) => ({ ...current, name: value }))}
                placeholder="Category name"
                placeholderTextColor={colors.textTertiary}
                style={styles.modalTextInput}
              />
              <View style={styles.modalActions}>
                <SecondaryButton
                  label="Delete"
                  onPress={() => {
                    setBagState((current) => current.filter((entry) => entry.id !== editingBagCategory.id));
                    setEditingBagCategoryId(null);
                  }}
                />
                <SecondaryButton label="Cancel" onPress={() => setEditingBagCategoryId(null)} />
                <PrimaryButton
                  label="Done"
                  onPress={() => {
                    setBagState((current) =>
                      current.map((entry) =>
                        entry.id === editingBagCategory.id
                          ? { ...entry, emoji: bagCategoryDraft.emoji, name: bagCategoryDraft.name }
                          : entry,
                      ),
                    );
                    setEditingBagCategoryId(null);
                  }}
                />
              </View>
            </>
          ) : null}
        </AppModal>

        <AppModal visible={addingBagCategory} title="Add bag category" onClose={() => setAddingBagCategory(false)}>
          <>
            <Text style={styles.modalLabel}>Emoji</Text>
            <TextInput
              value={newBagCategoryEmoji}
              onChangeText={setNewBagCategoryEmoji}
              placeholder="Emoji"
              placeholderTextColor={colors.textTertiary}
              style={styles.modalTextInput}
            />
            <Text style={styles.modalLabel}>Category name</Text>
            <TextInput
              value={newBagCategoryName}
              onChangeText={setNewBagCategoryName}
              placeholder="Category name"
              placeholderTextColor={colors.textTertiary}
              style={styles.modalTextInput}
            />
            <View style={styles.modalActions}>
              <View style={styles.modalActionSpacer} />
              <SecondaryButton label="Cancel" onPress={() => setAddingBagCategory(false)} />
              <PrimaryButton label="Done" onPress={addBagCategory} />
            </View>
          </>
        </AppModal>

        <AppModal visible={Boolean(editingBagItem)} title="Edit bag item" onClose={() => setEditingBagItemId(null)}>
          {editingBagItem ? (
            <>
              <Text style={styles.modalLabel}>Item name</Text>
              <TextInput
                value={bagItemDraft.name}
                onChangeText={(value) => setBagItemDraft((current) => ({ ...current, name: value }))}
                placeholder="Item"
                placeholderTextColor={colors.textTertiary}
                style={styles.modalTextInput}
              />
              <Text style={styles.modalLabel}>Who is this for?</Text>
              <View style={styles.chipRow}>
                {(['her', 'partner', 'baby', 'shared'] as BagForWhom[]).map((option) => {
                  const selected = bagItemDraft.forWhom === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setBagItemDraft((current) => ({ ...current, forWhom: option }))}
                      style={[styles.choiceChip, selected && styles.choiceChipSelected]}
                    >
                      <Text style={[styles.choiceChipText, selected && styles.choiceChipTextSelected]}>
                        {labelForWhom(option, motherName, partnerName)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={styles.modalLabel}>Category</Text>
              <CategorySelect
                value={bagItemDraft.categoryId}
                onChange={(value) => setBagItemDraft((current) => ({ ...current, categoryId: value }))}
                categories={bagState}
                modal
              />
              <View style={styles.modalActions}>
                <SecondaryButton
                  label="Delete"
                  onPress={() => {
                    setBagState((current) =>
                      current.map((entry) =>
                        entry.id === editingBagItem.categoryId
                          ? { ...entry, items: entry.items.filter((bagItem) => bagItem.id !== editingBagItem.id) }
                          : entry,
                      ),
                    );
                    setEditingBagItemId(null);
                  }}
                />
                <SecondaryButton label="Cancel" onPress={() => setEditingBagItemId(null)} />
                <PrimaryButton
                  label="Done"
                  onPress={() => {
                    setBagState((current) =>
                      current.map((entry) => {
                        if (entry.id === editingBagItem.categoryId && entry.id === bagItemDraft.categoryId) {
                          return {
                            ...entry,
                            items: entry.items.map((bagItem) =>
                              bagItem.id === editingBagItem.id
                                ? { ...bagItem, name: bagItemDraft.name, forWhom: bagItemDraft.forWhom }
                                : bagItem,
                            ),
                          };
                        }
                        if (entry.id === editingBagItem.categoryId) {
                          return {
                            ...entry,
                            items: entry.items.filter((bagItem) => bagItem.id !== editingBagItem.id),
                          };
                        }
                        if (entry.id === bagItemDraft.categoryId) {
                          return {
                            ...entry,
                            items: [
                              ...entry.items,
                              {
                                id: editingBagItem.id,
                                name: bagItemDraft.name,
                                forWhom: bagItemDraft.forWhom,
                                packed: editingBagItem.packed,
                              },
                            ],
                          };
                        }
                        return entry;
                      }),
                    );
                    setEditingBagItemId(null);
                  }}
                />
              </View>
            </>
          ) : null}
        </AppModal>

        <AppModal visible={addingBagItem} title="Add bag item" onClose={() => setAddingBagItem(false)}>
          <>
            <Text style={styles.modalLabel}>Item name</Text>
            <TextInput
              value={bagItemDraft.name}
              onChangeText={(value) => setBagItemDraft((current) => ({ ...current, name: value }))}
              placeholder="New item"
              placeholderTextColor={colors.textTertiary}
              style={styles.modalTextInput}
            />
            <Text style={styles.modalLabel}>Who is this for?</Text>
            <View style={styles.chipRow}>
              {(['her', 'partner', 'baby', 'shared'] as BagForWhom[]).map((option) => {
                const selected = bagItemDraft.forWhom === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => setBagItemDraft((current) => ({ ...current, forWhom: option }))}
                    style={[styles.choiceChip, selected && styles.choiceChipSelected]}
                  >
                    <Text style={[styles.choiceChipText, selected && styles.choiceChipTextSelected]}>
                      {labelForWhom(option, motherName, partnerName)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.modalLabel}>Category</Text>
            <CategorySelect
              value={bagItemDraft.categoryId}
              onChange={(value) => setBagItemDraft((current) => ({ ...current, categoryId: value }))}
              categories={bagState}
              modal
            />
            <View style={styles.modalActions}>
              <View style={styles.modalActionSpacer} />
              <SecondaryButton label="Cancel" onPress={() => setAddingBagItem(false)} />
              <PrimaryButton
                label="Done"
                onPress={() => {
                  if (!bagItemDraft.categoryId) {
                    return;
                  }
                  const value = bagItemDraft.name.trim();
                  if (!value) {
                    return;
                  }
                  setBagState((current) =>
                    current.map((entry) =>
                      entry.id === bagItemDraft.categoryId
                        ? {
                            ...entry,
                            items: [
                              ...entry.items,
                              {
                                id: createId('bag-item'),
                                name: value,
                                forWhom: bagItemDraft.forWhom,
                                packed: false,
                              },
                            ],
                          }
                        : entry,
                    ),
                  );
                  setAddingBagItem(false);
                }}
              />
            </View>
          </>
        </AppModal>

        <AppModal visible={addingBagBulk} title="Bulk add bag items" onClose={() => setAddingBagBulk(false)}>
          <>
            <Text style={styles.modalHelperText}>
              Paste one item per line using `item | category | for whom | packed`. The last two fields are optional.
            </Text>
            <Text style={styles.bulkExampleText}>Example: Phone charger | Tech | Dad | packed</Text>
            <TextInput
              value={bagBulkDraft}
              onChangeText={setBagBulkDraft}
              placeholder="Item | Category | For whom | Packed"
              placeholderTextColor={colors.textTertiary}
              multiline
              style={[styles.modalTextInput, styles.bulkTextArea]}
            />
            <View style={styles.bulkSummaryCard}>
              <Text style={styles.bulkSummaryText}>{parsedBagBulkDraft.valid.length} valid rows ready to add</Text>
              {parsedBagBulkDraft.invalid.length ? (
                <Text style={styles.bulkErrorText}>{parsedBagBulkDraft.invalid.length} rows could not be read</Text>
              ) : null}
            </View>
            <View style={styles.modalActions}>
              <View style={styles.modalActionSpacer} />
              <SecondaryButton label="Cancel" onPress={() => setAddingBagBulk(false)} />
              <PrimaryButton label="Apply" onPress={applyBagBulkAdd} disabled={!parsedBagBulkDraft.valid.length} />
            </View>
          </>
        </AppModal>

        <AppModal visible={editingBagBulk} title="Bulk edit bag items" onClose={() => setEditingBagBulk(false)}>
          <>
            <Text style={styles.modalHelperText}>
              Edit the full bag list below. Applying replaces the current bag items while keeping categories available.
            </Text>
            <Text style={styles.bulkExampleText}>Format: Item | Category | For whom | Packed</Text>
            <TextInput
              value={bagBulkDraft}
              onChangeText={setBagBulkDraft}
              placeholder="Item | Category | For whom | Packed"
              placeholderTextColor={colors.textTertiary}
              multiline
              style={[styles.modalTextInput, styles.bulkTextArea]}
            />
            <View style={styles.bulkSummaryCard}>
              <Text style={styles.bulkSummaryText}>{parsedBagBulkDraft.valid.length} valid rows in draft</Text>
              {parsedBagBulkDraft.invalid.length ? (
                <Text style={styles.bulkErrorText}>{parsedBagBulkDraft.invalid.length} rows could not be read</Text>
              ) : null}
            </View>
            <View style={styles.modalActions}>
              <View style={styles.modalActionSpacer} />
              <SecondaryButton label="Cancel" onPress={() => setEditingBagBulk(false)} />
              <PrimaryButton
                label="Apply"
                onPress={applyBagBulkEdit}
                disabled={Boolean(parsedBagBulkDraft.invalid.length)}
              />
            </View>
          </>
        </AppModal>

        <AppModal visible={Boolean(editingPlaybookCategory)} title="Edit playbook category" onClose={() => setEditingPlaybookCategoryId(null)}>
          {editingPlaybookCategory ? (
            <>
              <Text style={styles.modalLabel}>Category name</Text>
              <TextInput
                value={playbookCategoryDraft}
                onChangeText={setPlaybookCategoryDraft}
                placeholder="Category"
                placeholderTextColor={colors.textTertiary}
                style={styles.modalTextInput}
              />
              <View style={styles.modalActions}>
                <SecondaryButton
                  label="Delete"
                  onPress={() => {
                    setPlaybookState((current) => current.filter((entry) => entry.id !== editingPlaybookCategory.id));
                    setEditingPlaybookCategoryId(null);
                  }}
                />
                <SecondaryButton label="Cancel" onPress={() => setEditingPlaybookCategoryId(null)} />
                <PrimaryButton
                  label="Done"
                  onPress={() => {
                    setPlaybookState((current) =>
                      current.map((entry) =>
                        entry.id === editingPlaybookCategory.id ? { ...entry, name: playbookCategoryDraft } : entry,
                      ),
                    );
                    setEditingPlaybookCategoryId(null);
                  }}
                />
              </View>
            </>
          ) : null}
        </AppModal>

        <AppModal visible={addingPlaybookCategory} title="Add playbook category" onClose={() => setAddingPlaybookCategory(false)}>
          <>
            <Text style={styles.modalLabel}>Category name</Text>
            <TextInput
              value={newPlaybookCategory}
              onChangeText={setNewPlaybookCategory}
              placeholder="Category name"
              placeholderTextColor={colors.textTertiary}
              style={styles.modalTextInput}
            />
            <View style={styles.modalActions}>
              <View style={styles.modalActionSpacer} />
              <SecondaryButton label="Cancel" onPress={() => setAddingPlaybookCategory(false)} />
              <PrimaryButton label="Done" onPress={addPlaybookCategory} />
            </View>
          </>
        </AppModal>

        <AppModal visible={Boolean(editingPlaybookTip)} title="Edit playbook tip" onClose={() => setEditingPlaybookTipId(null)}>
          {editingPlaybookTip ? (
            <>
              <Text style={styles.modalLabel}>Tip</Text>
              <TextInput
                value={playbookTipDraft.text}
                onChangeText={(value) => setPlaybookTipDraft((current) => ({ ...current, text: value }))}
                placeholder="Tip"
                placeholderTextColor={colors.textTertiary}
                multiline
                style={[styles.modalTextInput, styles.modalTextArea]}
              />
              <Text style={styles.modalLabel}>Category</Text>
              <PlaybookCategorySelect
                value={playbookTipDraft.categoryId}
                onChange={(value) => setPlaybookTipDraft((current) => ({ ...current, categoryId: value }))}
                categories={playbookState}
                modal
              />
              <View style={styles.modalActions}>
                <SecondaryButton
                  label="Delete"
                  onPress={() => {
                    setPlaybookState((current) =>
                      current.map((entry) =>
                        entry.id === editingPlaybookTip.categoryId
                          ? { ...entry, tips: entry.tips.filter((tip) => tip.id !== editingPlaybookTip.id) }
                          : entry,
                      ),
                    );
                    setEditingPlaybookTipId(null);
                  }}
                />
                <SecondaryButton label="Cancel" onPress={() => setEditingPlaybookTipId(null)} />
                <PrimaryButton
                  label="Done"
                  onPress={() => {
                    setPlaybookState((current) =>
                      current.map((entry) => {
                        if (entry.id === editingPlaybookTip.categoryId && entry.id === playbookTipDraft.categoryId) {
                          return {
                            ...entry,
                            tips: entry.tips.map((tip) =>
                              tip.id === editingPlaybookTip.id ? { ...tip, text: playbookTipDraft.text } : tip,
                            ),
                          };
                        }
                        if (entry.id === editingPlaybookTip.categoryId) {
                          return {
                            ...entry,
                            tips: entry.tips.filter((tip) => tip.id !== editingPlaybookTip.id),
                          };
                        }
                        if (entry.id === playbookTipDraft.categoryId) {
                          return {
                            ...entry,
                            tips: [...entry.tips, { id: editingPlaybookTip.id, text: playbookTipDraft.text }],
                          };
                        }
                        return entry;
                      }),
                    );
                    setEditingPlaybookTipId(null);
                  }}
                />
              </View>
            </>
          ) : null}
        </AppModal>

        <AppModal visible={addingPlaybookTip} title="Add playbook tip" onClose={() => setAddingPlaybookTip(false)}>
          <>
            <Text style={styles.modalLabel}>Tip</Text>
            <TextInput
              value={playbookTipDraft.text}
              onChangeText={(value) => setPlaybookTipDraft((current) => ({ ...current, text: value }))}
              placeholder="New tip"
              placeholderTextColor={colors.textTertiary}
              multiline
              style={[styles.modalTextInput, styles.modalTextArea]}
            />
            <Text style={styles.modalLabel}>Category</Text>
            <PlaybookCategorySelect
              value={playbookTipDraft.categoryId}
              onChange={(value) => setPlaybookTipDraft((current) => ({ ...current, categoryId: value }))}
              categories={playbookState}
              modal
            />
            <View style={styles.modalActions}>
              <View style={styles.modalActionSpacer} />
              <SecondaryButton label="Cancel" onPress={() => setAddingPlaybookTip(false)} />
              <PrimaryButton
                label="Done"
                onPress={() => {
                  if (!playbookTipDraft.categoryId) {
                    return;
                  }
                  const value = playbookTipDraft.text.trim();
                  if (!value) {
                    return;
                  }
                  setPlaybookState((current) =>
                    current.map((entry) =>
                      entry.id === playbookTipDraft.categoryId
                        ? {
                            ...entry,
                            tips: [...entry.tips, { id: createId('tip'), text: value }],
                          }
                        : entry,
                    ),
                  );
                  setPlaybookTipDraft({ text: '', categoryId: '' });
                  setAddingPlaybookTip(false);
                }}
              />
            </View>
          </>
        </AppModal>

        <AppModal visible={addingPlaybookBulk} title="Bulk add playbook tips" onClose={() => setAddingPlaybookBulk(false)}>
          <>
            <Text style={styles.modalHelperText}>Paste one tip per line using `tip | category`.</Text>
            <Text style={styles.bulkExampleText}>Example: Charge both phones before heading out | Logistics</Text>
            <TextInput
              value={playbookBulkDraft}
              onChangeText={setPlaybookBulkDraft}
              placeholder="Tip | Category"
              placeholderTextColor={colors.textTertiary}
              multiline
              style={[styles.modalTextInput, styles.bulkTextArea]}
            />
            <View style={styles.bulkSummaryCard}>
              <Text style={styles.bulkSummaryText}>{parsedPlaybookBulkDraft.valid.length} valid rows ready to add</Text>
              {parsedPlaybookBulkDraft.invalid.length ? (
                <Text style={styles.bulkErrorText}>{parsedPlaybookBulkDraft.invalid.length} rows could not be read</Text>
              ) : null}
            </View>
            <View style={styles.modalActions}>
              <View style={styles.modalActionSpacer} />
              <SecondaryButton label="Cancel" onPress={() => setAddingPlaybookBulk(false)} />
              <PrimaryButton
                label="Apply"
                onPress={applyPlaybookBulkAdd}
                disabled={!parsedPlaybookBulkDraft.valid.length}
              />
            </View>
          </>
        </AppModal>

        <AppModal visible={editingPlaybookBulk} title="Bulk edit playbook tips" onClose={() => setEditingPlaybookBulk(false)}>
          <>
            <Text style={styles.modalHelperText}>
              Edit the full tip list below. Applying replaces the current tips while keeping categories available.
            </Text>
            <Text style={styles.bulkExampleText}>Format: Tip | Category</Text>
            <TextInput
              value={playbookBulkDraft}
              onChangeText={setPlaybookBulkDraft}
              placeholder="Tip | Category"
              placeholderTextColor={colors.textTertiary}
              multiline
              style={[styles.modalTextInput, styles.bulkTextArea]}
            />
            <View style={styles.bulkSummaryCard}>
              <Text style={styles.bulkSummaryText}>{parsedPlaybookBulkDraft.valid.length} valid rows in draft</Text>
              {parsedPlaybookBulkDraft.invalid.length ? (
                <Text style={styles.bulkErrorText}>{parsedPlaybookBulkDraft.invalid.length} rows could not be read</Text>
              ) : null}
            </View>
            <View style={styles.modalActions}>
              <View style={styles.modalActionSpacer} />
              <SecondaryButton label="Cancel" onPress={() => setEditingPlaybookBulk(false)} />
              <PrimaryButton
                label="Apply"
                onPress={applyPlaybookBulkEdit}
                disabled={Boolean(parsedPlaybookBulkDraft.invalid.length)}
              />
            </View>
          </>
        </AppModal>
        <AppModal
          visible={confirmationState.visible}
          title={confirmationState.title}
          onClose={() => setConfirmationState((current) => ({ ...current, visible: false }))}
        >
          <>
            <Text style={styles.modalHelperText}>{confirmationState.body}</Text>
            <View style={styles.modalActions}>
              <View style={styles.modalActionSpacer} />
              <SecondaryButton
                label="Cancel"
                onPress={() => setConfirmationState((current) => ({ ...current, visible: false }))}
              />
              <Pressable
                onPress={() => {
                  const action = confirmationState.onConfirm;
                  setConfirmationState((current) => ({ ...current, visible: false, onConfirm: null }));
                  action?.();
                }}
                style={[styles.dangerAction, styles.compactButton]}
              >
                <Text style={styles.dangerActionText}>{confirmationState.confirmLabel}</Text>
              </Pressable>
            </View>
          </>
        </AppModal>
      </ScrollView>
      {isSelectingBag ? <BulkActionBar title={`${selectedBagCount} selected`} actions={bagBulkActions} /> : null}
      {isSelectingInterventions ? (
        <BulkActionBar title={`${selectedInterventionCount} selected`} actions={interventionBulkActions} />
      ) : null}
      {isSelectingPlaybook ? (
        <BulkActionBar title={`${selectedPlaybookCount} selected`} actions={playbookBulkActions} />
      ) : null}
      {snackbarState.visible ? (
        <View style={[styles.snackbar, anySelectionActive && styles.snackbarRaised]}>
          <Text style={styles.snackbarText}>{snackbarState.message}</Text>
          {snackbarState.actionLabel && snackbarState.onAction ? (
            <Pressable
              onPress={() => {
                snackbarState.onAction?.();
                setSnackbarState((current) => ({ ...current, visible: false }));
              }}
              style={styles.snackbarAction}
            >
              <Text style={styles.snackbarActionText}>{snackbarState.actionLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function HeroShell({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.pageShell}>
      <View style={styles.heroCard}>{children}</View>
    </View>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      {children}
    </View>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  const safeProgress = Math.max(0, Math.min(1, progress || 0));

  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${safeProgress * 100}%` }]} />
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.profileField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor={colors.textTertiary}
        style={styles.textInput}
      />
    </View>
  );
}

function MetricCard({
  label,
  value,
  children,
  style,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
  style?: object;
}) {
  return (
    <View style={[styles.metricCard, style]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricHint}>{children}</Text>
    </View>
  );
}

function DashboardCard({
  title,
  progress,
  complete,
  onPress,
  compact = false,
  children,
}: {
  title: string;
  progress: number;
  complete: boolean;
  onPress?: () => void;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.timelineCard,
        compact && styles.dashboardCompactCard,
        pressed && styles.cardPressed,
      ]}
    >
      {compact ? (
        <View style={styles.dashboardCompactRow}>
          <View style={styles.flexOne}>
            <Text style={[styles.timelinePhase, styles.dashboardCompactTitle]}>{title}</Text>
            <Text style={[styles.timelineFocus, styles.dashboardCompactBody]}>{children}</Text>
          </View>
          <CircularProgress progress={progress} complete={complete} />
        </View>
      ) : (
        <>
          <View style={styles.dashboardCardHeader}>
            <Text style={styles.timelinePhase}>{title}</Text>
            <CircularProgress progress={progress} complete={complete} />
          </View>
          <Text style={styles.timelineFocus}>{children}</Text>
        </>
      )}
    </Pressable>
  );
}

function StageSelect({
  value,
  onChange,
  modal = false,
}: {
  value: string;
  onChange: (value: string) => void;
  modal?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.stageSelectWrap}>
      <Pressable
        onPress={() => setOpen((current) => !current)}
        style={[modal ? styles.modalSelectTrigger : styles.selectTrigger]}
      >
        <Text style={styles.selectTriggerText}>{value}</Text>
        <Text style={styles.selectChevron}>{open ? '▲' : '▼'}</Text>
      </Pressable>
      {open ? (
        <View style={[styles.selectMenu, modal && styles.modalSelectMenu]}>
          {stageOptions.map((option) => {
            const selected = value === option;
            return (
              <Pressable
                key={option}
                onPress={() => {
                  onChange(option);
                  setOpen(false);
                }}
                style={[styles.selectOption, selected && styles.selectOptionActive]}
              >
                <Text style={[styles.selectOptionText, selected && styles.selectOptionTextActive]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function CategorySelect({
  value,
  onChange,
  categories,
  modal = false,
}: {
  value: string;
  onChange: (value: string) => void;
  categories: EditableBagCategory[];
  modal?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selectedCategory = categories.find((category) => category.id === value);

  return (
    <View style={styles.stageSelectWrap}>
      <Pressable
        onPress={() => setOpen((current) => !current)}
        style={[modal ? styles.modalSelectTrigger : styles.selectTrigger]}
      >
        <Text style={styles.selectTriggerText}>
          {selectedCategory ? `${selectedCategory.emoji} ${selectedCategory.name}` : 'Select category'}
        </Text>
        <Text style={styles.selectChevron}>{open ? '▲' : '▼'}</Text>
      </Pressable>
      {open ? (
        <View style={[styles.selectMenu, modal && styles.modalSelectMenu]}>
          {categories.map((category) => {
            const selected = value === category.id;
            return (
              <Pressable
                key={category.id}
                onPress={() => {
                  onChange(category.id);
                  setOpen(false);
                }}
                style={[styles.selectOption, selected && styles.selectOptionActive]}
              >
                <Text style={[styles.selectOptionText, selected && styles.selectOptionTextActive]}>
                  {category.emoji} {category.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function PlaybookCategorySelect({
  value,
  onChange,
  categories,
  modal = false,
}: {
  value: string;
  onChange: (value: string) => void;
  categories: PlaybookCategory[];
  modal?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selectedCategory = categories.find((category) => category.id === value);

  return (
    <View style={styles.stageSelectWrap}>
      <Pressable
        onPress={() => setOpen((current) => !current)}
        style={[modal ? styles.modalSelectTrigger : styles.selectTrigger]}
      >
        <Text style={styles.selectTriggerText}>{selectedCategory ? selectedCategory.name : 'Select category'}</Text>
        <Text style={styles.selectChevron}>{open ? '▲' : '▼'}</Text>
      </Pressable>
      {open ? (
        <View style={[styles.selectMenu, modal && styles.modalSelectMenu]}>
          {categories.map((category) => {
            const selected = value === category.id;
            return (
              <Pressable
                key={category.id}
                onPress={() => {
                  onChange(category.id);
                  setOpen(false);
                }}
                style={[styles.selectOption, selected && styles.selectOptionActive]}
              >
                <Text style={[styles.selectOptionText, selected && styles.selectOptionTextActive]}>{category.name}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function AppModal({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <View style={styles.rowBetween}>
            <Text style={styles.modalTitle}>{title}</Text>
          </View>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
            {children}
          </ScrollView>
        </Pressable>
      </View>
    </Modal>
  );
}

function EditableCard({
  children,
  onEdit,
  showFooter = true,
  style,
}: {
  children: React.ReactNode;
  onEdit: () => void;
  showFooter?: boolean;
  style?: object;
}) {
  return (
    <View style={[styles.hoverCard, style]}>
      {children}
      {showFooter ? (
        <View style={styles.cardFooter}>
          <View style={styles.flexOne} />
          <Pressable onPress={onEdit} style={styles.inlineEditButton}>
            <Text style={styles.inlineEditButtonText}>⋯</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function CircularProgress({
  progress,
  complete,
  compact = false,
  inverted = false,
  label,
}: {
  progress: number;
  complete: boolean;
  compact?: boolean;
  inverted?: boolean;
  label?: string;
}) {
  const safeProgress = Math.max(0, Math.min(1, progress || 0));
  const progressDegrees = `${Math.round(safeProgress * 360)}deg`;
  const trackColor = inverted ? 'rgba(255,255,255,0.28)' : 'rgba(45, 110, 110, 0.12)';
  const innerColor = inverted ? colors.primary : colors.surfaceContainerLowest;
  const textColor = inverted ? colors.surfaceContainerLowest : colors.primary;
  const ringStyle =
    Platform.OS === 'web'
      ? ({
          backgroundImage: complete
            ? `conic-gradient(${colors.success} 0deg 360deg)`
            : `conic-gradient(${colors.success} 0deg ${progressDegrees}, ${trackColor} ${progressDegrees} 360deg)`,
        } as const)
      : ({
          backgroundColor: complete ? colors.success : colors.surfaceContainerHigh,
          borderColor: complete ? colors.success : colors.primary,
        } as const);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={label ?? `${Math.round(safeProgress * 100)} percent complete`}
      style={[styles.progressCircleOuter, compact && styles.progressCircleOuterCompact]}
    >
      <View style={[styles.progressCircleRing, compact && styles.progressCircleRingCompact, ringStyle]}>
        <View style={[styles.progressCircleInner, compact && styles.progressCircleInnerCompact, { backgroundColor: innerColor }]}>
          <Text style={[styles.progressCircleText, compact && styles.progressCircleTextCompact, { color: textColor }, complete && styles.progressCircleTextComplete]}>
            {complete ? '✓' : `${Math.round(safeProgress * 100)}`}
          </Text>
        </View>
      </View>
    </View>
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled = false,
  compact = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.primaryAction, compact && styles.compactButton, disabled && styles.buttonDisabled]}
    >
      <Text style={styles.primaryActionText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({
  label,
  onPress,
  disabled = false,
  compact = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.secondaryAction, compact && styles.compactButton, disabled && styles.buttonDisabled]}
    >
    <Text style={styles.secondaryActionText}>{label}</Text>
  </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 72,
  },
  scrollContentSelectionActive: {
    paddingBottom: 180,
  },
  backgroundOrbTop: {
    position: 'absolute',
    top: -60,
    right: -20,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#dfeee8',
  },
  backgroundOrbBottom: {
    position: 'absolute',
    bottom: 100,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#f2e4d7',
  },
  topNav: {
    maxWidth: 1240,
    width: '100%',
    alignSelf: 'center',
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 28,
    padding: spacing.lg,
  },
  topNavDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topNavBrand: {
    ...typography.titleLarge,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  topNavTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  topNavTab: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  topNavTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  topNavTabActive: {
    backgroundColor: colors.primary,
  },
  topNavTabText: {
    ...typography.labelLarge,
    color: colors.onSurface,
  },
  topNavTabTextActive: {
    color: colors.surfaceContainerLowest,
  },
  pageShell: {
    maxWidth: 1240,
    width: '100%',
    alignSelf: 'center',
    marginBottom: spacing.xxxl,
  },
  heroCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 32,
    padding: spacing.xxxl,
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  reviewShell: {
    width: '100%',
    maxWidth: 1040,
    alignSelf: 'center',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xl,
  },
  heroBadgeText: {
    ...typography.labelLarge,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroTitle: {
    ...typography.displayMedium,
    color: colors.onSurface,
    marginBottom: spacing.lg,
    maxWidth: 760,
  },
  heroBody: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
    maxWidth: 760,
  },
  nextStepCard: {
    backgroundColor: '#edf4f1',
    borderRadius: 24,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  reviewPriorityRow: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  reviewPriorityRowWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  prepScoreCard: {
    flex: 1,
  },
  dueDateCard: {
    flex: 1,
  },
  reviewMiniCard: {
    height: '100%',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 24,
    padding: spacing.md,
  },
  reviewMiniLabel: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  reviewMiniValue: {
    ...typography.displaySmall,
    color: colors.primary,
    marginBottom: 4,
  },
  reviewMiniHint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  metricCardFill: {
    height: '100%',
  },
  nextStepEyebrow: {
    ...typography.labelMedium,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  nextStepTitle: {
    ...typography.headlineSmall,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  nextStepBody: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  heroGrid: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  heroGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metricCard: {
    flex: 1,
    flexBasis: 280,
    backgroundColor: '#f6f7f3',
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#e2e8e2',
  },
  metricLabel: {
    ...typography.labelLarge,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  metricValue: {
    ...typography.headlineMedium,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  metricHint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  profileRow: {
    gap: spacing.lg,
  },
  profileRowWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  profileField: {
    flex: 1,
  },
  fieldLabel: {
    ...typography.labelLarge,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  section: {
    maxWidth: 1240,
    width: '100%',
    alignSelf: 'center',
    marginBottom: spacing.xxxl,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 32,
    padding: spacing.xxxl,
  },
  sectionTitle: {
    ...typography.headlineLarge,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    maxWidth: 760,
  },
  timelineGrid: {
    gap: spacing.lg,
  },
  timelineGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timelineCard: {
    flexBasis: 260,
    flexGrow: 1,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 24,
    padding: spacing.xl,
  },
  cardPressed: {
    opacity: 0.88,
  },
  timelinePhase: {
    ...typography.titleLarge,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  timelineFocus: {
    ...typography.bodyMedium,
    color: colors.onSurface,
  },
  dashboardCompactCard: {
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  dashboardCompactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dashboardCompactTitle: {
    ...typography.titleMedium,
    marginBottom: 2,
  },
  dashboardCompactBody: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  textInput: {
    ...typography.bodyLarge,
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  multilineInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  stackedInput: {
    marginTop: spacing.md,
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  summaryActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.xxxl,
  },
  rowBetweenCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  primaryAction: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  primaryActionText: {
    ...typography.labelLarge,
    color: colors.surfaceContainerLowest,
  },
  secondaryAction: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  secondaryActionText: {
    ...typography.labelLarge,
    color: colors.primary,
  },
  dangerAction: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  dangerActionText: {
    ...typography.labelLarge,
    color: colors.surfaceContainerLowest,
  },
  compactButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  progressCard: {
    marginBottom: spacing.lg,
  },
  readingColumn: {
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
  },
  listColumn: {
    width: '100%',
    maxWidth: 920,
    alignSelf: 'center',
  },
  progressLabel: {
    ...typography.titleSmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  progressTrack: {
    height: 12,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  questionCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 24,
    padding: spacing.xl,
  },
  noticeCard: {
    backgroundColor: colors.warningLight,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  noticeText: {
    ...typography.bodySmall,
    color: colors.warning,
  },
  questionPrompt: {
    ...typography.titleLarge,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  descriptionText: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  optionDescriptionBox: {
    backgroundColor: colors.surfaceContainerLow,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  optionDescriptionText: {
    ...typography.bodyMedium,
    color: colors.onSurface,
    lineHeight: 22,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  choiceChip: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  choiceChipSelected: {
    backgroundColor: colors.primary,
  },
  choiceChipText: {
    ...typography.labelLarge,
    color: colors.onSurface,
  },
  choiceChipTextSelected: {
    color: colors.surfaceContainerLowest,
  },
  interviewFooter: {
    marginTop: spacing.lg,
  },
  interviewFooterText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  bannerCard: {
    borderRadius: 24,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  successBanner: {
    backgroundColor: '#e8f5ed',
  },
  bannerTitle: {
    ...typography.titleLarge,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  bannerText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  summaryAnswerCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 24,
    padding: spacing.xl,
    marginTop: spacing.lg,
  },
  summaryAnswerText: {
    ...typography.bodyLarge,
    color: colors.onSurface,
  },
  summaryRowCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  summaryQuestionText: {
    ...typography.titleSmall,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  summaryAnswerPreview: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  infoBlock: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 18,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  infoLabel: {
    ...typography.labelMedium,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
  },
  stagePill: {
    ...typography.labelMedium,
    color: colors.primary,
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  addActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  advancedToggle: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  advancedToggleText: {
    ...typography.labelMedium,
    color: colors.primary,
  },
  advancedActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
    justifyContent: 'flex-end',
  },
  categorySecondaryRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  secondaryInlineAction: {
    paddingVertical: spacing.xs,
  },
  secondaryInlineActionText: {
    ...typography.labelMedium,
    color: colors.primary,
  },
  cardTitle: {
    ...typography.titleLarge,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  interventionGrid: {
    gap: spacing.lg,
  },
  interventionGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interventionCard: {
    flexBasis: 360,
    flexGrow: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 24,
    padding: spacing.xxl,
  },
  interventionCardReviewed: {
    backgroundColor: '#eef8f3',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  deleteText: {
    ...typography.labelLarge,
    color: colors.error,
  },
  relatedCard: {
    marginTop: spacing.md,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 20,
    padding: spacing.lg,
  },
  relatedLabel: {
    ...typography.labelMedium,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  relatedQuestion: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  relatedAnswer: {
    ...typography.bodyMedium,
    color: colors.onSurface,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusPillButton: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  statusPillButtonActive: {
    backgroundColor: '#e8f5ed',
    borderColor: colors.success,
  },
  statusPill: {
    ...typography.labelMedium,
    color: colors.primary,
  },
  statusPillActive: {
    color: colors.success,
  },
  bagCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 24,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  emojiInput: {
    maxWidth: 80,
  },
  itemEditorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 28,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkboxMark: {
    ...typography.labelMedium,
    color: colors.surfaceContainerLowest,
  },
  flexOne: {
    flex: 1,
  },
  tipCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 24,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  hoverCard: {
    position: 'relative',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.38)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 760,
    maxHeight: '88%',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 28,
    padding: spacing.xxl,
    ...shadows.lg,
  },
  modalTitle: {
    ...typography.headlineSmall,
    color: colors.onSurface,
  },
  modalScroll: {
    marginTop: spacing.md,
  },
  modalContent: {
    paddingBottom: spacing.lg,
  },
  modalPrompt: {
    ...typography.titleLarge,
    color: colors.onSurface,
    marginBottom: spacing.lg,
  },
  modalLabel: {
    ...typography.labelLarge,
    color: colors.onSurface,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  modalHelperText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  bulkExampleText: {
    ...typography.bodySmall,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  modalTextInput: {
    ...typography.bodyLarge,
    color: colors.onSurface,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#9cc9c0',
    borderRadius: 18,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  modalTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  bulkTextArea: {
    minHeight: 220,
    textAlignVertical: 'top',
  },
  bulkSummaryCard: {
    marginTop: spacing.md,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.xs,
  },
  bulkSummaryText: {
    ...typography.bodyMedium,
    color: colors.onSurface,
  },
  bulkErrorText: {
    ...typography.bodySmall,
    color: colors.warning,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  modalActionSpacer: {
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
  },
  inlineEditButton: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.full,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineEditButtonText: {
    fontSize: 20,
    lineHeight: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  inlineActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  snackbar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.textPrimary,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  snackbarRaised: {
    bottom: 132,
  },
  snackbarText: {
    ...typography.bodyMedium,
    color: colors.surfaceContainerLowest,
    flex: 1,
  },
  snackbarAction: {
    paddingVertical: spacing.xs,
  },
  snackbarActionText: {
    ...typography.labelLarge,
    color: colors.secondaryLight,
  },
  doneText: {
    ...typography.labelLarge,
    color: colors.primary,
  },
  readOnlyBody: {
    ...typography.bodyMedium,
    color: colors.onSurface,
  },
  stateText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  readOnlyCaption: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  fieldHelp: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  stageGroup: {
    marginBottom: spacing.xxl,
  },
  stageTitle: {
    ...typography.headlineSmall,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  stageSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  dashboardCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressCircleOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleOuterCompact: {
    alignSelf: 'center',
  },
  progressCircleRing: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  progressCircleRingCompact: {
    width: 22,
    height: 22,
    borderRadius: 11,
    padding: 2,
  },
  progressCircleInner: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleInnerCompact: {
    borderRadius: 10,
  },
  progressCircleText: {
    ...typography.labelSmall,
    color: colors.primary,
  },
  progressCircleTextCompact: {
    fontSize: 6,
    lineHeight: 7,
  },
  progressCircleTextComplete: {
    color: colors.success,
  },
  stageSelectWrap: {
    position: 'relative',
    zIndex: 20,
  },
  selectTrigger: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: '#9cc9c0',
    borderRadius: 18,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalSelectTrigger: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#9cc9c0',
    borderRadius: 18,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectTriggerText: {
    ...typography.bodyLarge,
    color: colors.onSurface,
  },
  selectChevron: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  selectMenu: {
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#cfe3de',
    overflow: 'hidden',
  },
  modalSelectMenu: {
    borderWidth: 2,
    borderColor: '#9cc9c0',
  },
  selectOption: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  selectOptionActive: {
    backgroundColor: colors.primary,
  },
  selectOptionText: {
    ...typography.bodyMedium,
    color: colors.onSurface,
  },
  selectOptionTextActive: {
    color: colors.surfaceContainerLowest,
  },
  categoryShell: {
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 20,
    padding: spacing.md,
  },
  itemRowCard: {
    backgroundColor: '#f7f8f5',
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginTop: 6,
  },
  emptyStateRow: {
    backgroundColor: '#f7f8f5',
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  emptyStateText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  inlineDeleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
});
