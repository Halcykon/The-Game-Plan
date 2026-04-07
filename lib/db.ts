/**
 * In-Memory Database Implementation
 * Temporary: Replace with expo-sqlite when environment is fixed
 */

import type {
  AppSettings,
  BirthPlanAnswer,
  InterventionPref,
  BagItem,
  FoodPreference,
  Affirmation,
  PartnerTip,
  ProviderQuestion,
  Video,
  BRAINScenario,
  ComfortTechnique,
} from './types';

// In-memory store
const store = {
  appSettings: {} as Record<string, AppSettings>,
  birthPlanAnswers: {} as Record<string, BirthPlanAnswer>,
  interventionPrefs: {} as Record<string, InterventionPref>,
  bagItems: {} as Record<string, BagItem>,
  foodPreferences: {} as Record<string, FoodPreference>,
  affirmations: {} as Record<string, Affirmation>,
  partnerTips: [] as PartnerTip[],
  providerQuestions: [] as ProviderQuestion[],
  videos: [] as Video[],
  brainScenarios: [] as BRAINScenario[],
  comfortTechniques: [] as ComfortTechnique[],
};

export async function initDB() {
  console.log('✅ In-memory database initialized');
}

export async function getAppSettings(): Promise<AppSettings | null> {
  const settings = Object.values(store.appSettings)[0];
  return settings || null;
}

export async function saveAppSettings(settings: Partial<AppSettings>): Promise<void> {
  const existing = store.appSettings['main'];
  const now = new Date().toISOString();
  store.appSettings['main'] = {
    id: 'app_settings',
    partnerName: settings.partnerName ?? existing?.partnerName ?? '',
    motherName: settings.motherName ?? existing?.motherName ?? '',
    dueDate: settings.dueDate ?? existing?.dueDate ?? '',
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export async function updateAppSettings(
  partnerName: string,
  motherName: string,
  dueDate: string,
): Promise<void> {
  await saveAppSettings({ partnerName, motherName, dueDate });
}

export async function getBirthPlanAnswers(): Promise<BirthPlanAnswer[]> {
  return Object.values(store.birthPlanAnswers);
}

export async function saveBirthPlanAnswer(questionId: string, answer: string): Promise<void> {
  store.birthPlanAnswers[questionId] = {
    questionId,
    answer,
    answeredAt: new Date().toISOString(),
  };
}

export async function getInterventionPrefs(): Promise<InterventionPref[]> {
  return Object.values(store.interventionPrefs);
}

export async function setInterventionPref(
  interventionId: string,
  herPref: string,
  reviewed = true,
): Promise<void> {
  store.interventionPrefs[interventionId] = {
    interventionId,
    herPref,
    reviewed,
    reviewedAt: new Date().toISOString(),
  };
}

export async function saveInterventionPref(
  interventionId: string,
  herPref: string,
  reviewed = true,
): Promise<void> {
  await setInterventionPref(interventionId, herPref, reviewed);
}

export async function getBagItems(): Promise<BagItem[]> {
  return Object.values(store.bagItems);
}

export async function toggleBagItem(itemId: string): Promise<void> {
  if (store.bagItems[itemId]) {
    store.bagItems[itemId].packed = !store.bagItems[itemId].packed;
    store.bagItems[itemId].packedAt = new Date().toISOString();
  }
}

export async function toggleBagItemPacked(itemId: string, packed?: boolean): Promise<void> {
  if (typeof packed === 'boolean') {
    if (store.bagItems[itemId]) {
      store.bagItems[itemId].packed = packed;
      store.bagItems[itemId].packedAt = new Date().toISOString();
    }
    return;
  }

  await toggleBagItem(itemId);
}

export async function addCustomBagItem(
  categoryId: string,
  name: string,
  forWhom: 'her' | 'partner' | 'baby' | 'shared'
): Promise<string> {
  const id = `custom-${Date.now()}`;
  store.bagItems[id] = {
    id,
    categoryId,
    name,
    packed: false,
    forWhom,
    isCustom: true,
  };
  return id;
}

export async function getFoodPreferences(): Promise<FoodPreference[]> {
  return Object.values(store.foodPreferences);
}

export async function addFoodPreference(
  category: 'like' | 'dislike',
  item: string,
  tags?: string[]
): Promise<string> {
  const id = `food-${Date.now()}`;
  store.foodPreferences[id] = {
    id,
    category,
    item,
    tags,
    isCustom: true,
    addedAt: new Date().toISOString(),
  };
  return id;
}

export async function removeFoodPreference(id: string): Promise<void> {
  delete store.foodPreferences[id];
}

export async function deleteFoodPreference(id: string): Promise<void> {
  await removeFoodPreference(id);
}

export async function getAffirmations(): Promise<Affirmation[]> {
  return Object.values(store.affirmations);
}

export async function addAffirmation(text: string): Promise<string> {
  const id = `affirm-${Date.now()}`;
  store.affirmations[id] = {
    id,
    text,
    isDefault: false,
    createdAt: new Date().toISOString(),
  };
  return id;
}

export async function removeAffirmation(id: string): Promise<void> {
  delete store.affirmations[id];
}

export async function deleteAffirmation(id: string): Promise<void> {
  await removeAffirmation(id);
}

export async function getBRAINScenarios(): Promise<BRAINScenario[]> {
  return store.brainScenarios;
}

export async function saveBRAINScenario(scenario: BRAINScenario): Promise<void> {
  const idx = store.brainScenarios.findIndex((entry) => entry.id === scenario.id);
  if (idx >= 0) {
    store.brainScenarios[idx] = scenario;
    return;
  }
  store.brainScenarios.push(scenario);
}

export async function calculateAppStateSummary() {
  const answers = Object.values(store.birthPlanAnswers).length;
  const prefs = Object.values(store.interventionPrefs).length;
  const packed = Object.values(store.bagItems).filter((item) => item.packed).length;
  const total = Object.values(store.bagItems).length;
  const affirmationsCount = Object.values(store.affirmations).length;

  const birthScore = answers > 0 ? Math.min(100, answers * 12) : 0;
  const interventionScore = prefs > 0 ? Math.min(100, prefs * 9) : 0;
  const bagScore = total > 0 ? (packed / total) * 100 : 0;

  const prepScore = Math.round(birthScore * 0.3 + bagScore * 0.4 + interventionScore * 0.3);

  return {
    birthPlanCompleted: answers,
    birthPlanTotal: 9,
    interventionsReviewed: prefs,
    interventionsTotal: 11,
    bagItemsPacked: packed,
    bagItemsTotal: total,
    affirmationsCount,
    preparationScore: prepScore,
    bagPacked: packed,
    bagTotal: total,
  };
}

export async function clearAllData(): Promise<void> {
  store.appSettings = {};
  store.birthPlanAnswers = {};
  store.interventionPrefs = {};
  store.bagItems = {};
  store.foodPreferences = {};
  store.affirmations = {};
  store.brainScenarios = [];
  store.comfortTechniques = [];
}
