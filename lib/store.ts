/**
 * Zustand Store for Global State Management
 * Handles app state and dispatches database queries
 */

import { create } from 'zustand';
import type {
  AppSettings,
  BirthPlanAnswer,
  InterventionPref,
  BagItem,
  FoodPreference,
  Affirmation,
  BRAINScenario,
  AppStateSummary,
} from './types';
import * as db from './db';

function answersArrayToRecord(answers: BirthPlanAnswer[]): Record<string, string> {
  return answers.reduce<Record<string, string>>((acc, answer) => {
    acc[answer.questionId] = Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer;
    return acc;
  }, {});
}

function interventionPrefsArrayToRecord(prefs: InterventionPref[]): Record<string, InterventionPref> {
  return prefs.reduce<Record<string, InterventionPref>>((acc, pref) => {
    acc[pref.interventionId] = pref;
    return acc;
  }, {});
}

interface AppState {
  // App Settings
  appSettings: AppSettings | null;
  loadSettings: () => Promise<void>;
  updateSettings: (partner: string, mother: string, dueDate: string) => Promise<void>;

  // Birth Plan
  birthPlanAnswers: Record<string, string>;
  loadBirthPlan: () => Promise<void>;
  saveBirthPlanAnswer: (questionId: string, answer: string) => Promise<void>;

  // Interventions
  interventionPrefs: Record<string, InterventionPref>;
  loadInterventions: () => Promise<void>;
  saveInterventionPref: (id: string, pref: string, reviewed?: boolean) => Promise<void>;

  // Bag Items
  bagItems: BagItem[];
  loadBagItems: () => Promise<void>;
  toggleBagItem: (itemId: string, packed: boolean) => Promise<void>;
  addCustomBagItem: (categoryId: string, name: string, forWhom: 'her' | 'partner' | 'baby' | 'shared') => Promise<void>;

  // Food Preferences
  foodPreferences: FoodPreference[];
  loadFoodPreferences: () => Promise<void>;
  addFoodPreference: (category: 'like' | 'dislike', item: string, tags?: string[]) => Promise<void>;
  removeFoodPreference: (id: string) => Promise<void>;

  // Affirmations
  affirmations: Affirmation[];
  loadAffirmations: () => Promise<void>;
  addAffirmation: (text: string) => Promise<void>;
  removeAffirmation: (id: string) => Promise<void>;

  // BRAIN Scenarios
  brainScenarios: BRAINScenario[];
  loadBrainScenarios: () => Promise<void>;
  saveBrainScenario: (scenario: BRAINScenario) => Promise<void>;

  // App State Summary (for review/dashboard)
  appStateSummary: AppStateSummary | null;
  calculateProgress: () => Promise<void>;

  // Utility
  clearAllData: () => Promise<void>;
  initialized: boolean;
  setInitialized: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  appSettings: null,
  birthPlanAnswers: {},
  interventionPrefs: {},
  bagItems: [],
  foodPreferences: [],
  affirmations: [],
  brainScenarios: [],
  appStateSummary: null,
  initialized: false,

  setInitialized: (value) => set({ initialized: value }),

  // ============ App Settings ============

  loadSettings: async () => {
    try {
      const settings = await db.getAppSettings();
      set({ appSettings: settings });
    } catch (error) {
      console.error('Failed to load app settings:', error);
    }
  },

  updateSettings: async (partner: string, mother: string, dueDate: string) => {
    try {
      await db.updateAppSettings(partner, mother, dueDate);
      await get().loadSettings();
    } catch (error) {
      console.error('Failed to update app settings:', error);
    }
  },

  // ============ Birth Plan ============

  loadBirthPlan: async () => {
    try {
      const answers = await db.getBirthPlanAnswers();
      set({ birthPlanAnswers: answersArrayToRecord(answers) });
    } catch (error) {
      console.error('Failed to load birth plan:', error);
    }
  },

  saveBirthPlanAnswer: async (questionId: string, answer: string) => {
    try {
      await db.saveBirthPlanAnswer(questionId, answer);
      set((state) => ({
        birthPlanAnswers: {
          ...state.birthPlanAnswers,
          [questionId]: answer,
        },
      }));
      await get().calculateProgress();
    } catch (error) {
      console.error('Failed to save birth plan answer:', error);
    }
  },

  // ============ Interventions ============

  loadInterventions: async () => {
    try {
      const prefs = await db.getInterventionPrefs();
      set({ interventionPrefs: interventionPrefsArrayToRecord(prefs) });
    } catch (error) {
      console.error('Failed to load interventions:', error);
    }
  },

  saveInterventionPref: async (id: string, pref: string, reviewed = false) => {
    try {
      await db.saveInterventionPref(id, pref, reviewed);
      await get().loadInterventions();
      await get().calculateProgress();
    } catch (error) {
      console.error('Failed to save intervention pref:', error);
    }
  },

  // ============ Bag Items ============

  loadBagItems: async () => {
    try {
      const items = await db.getBagItems();
      set({ bagItems: items });
    } catch (error) {
      console.error('Failed to load bag items:', error);
    }
  },

  toggleBagItem: async (itemId: string, packed: boolean) => {
    try {
      await db.toggleBagItemPacked(itemId, packed);
      const updatedItems = get().bagItems.map((item) =>
        item.id === itemId ? { ...item, packed, packedAt: new Date().toISOString() } : item
      );
      set({ bagItems: updatedItems });
      await get().calculateProgress();
    } catch (error) {
      console.error('Failed to toggle bag item:', error);
    }
  },

  addCustomBagItem: async (categoryId: string, name: string, forWhom) => {
    try {
      const id = await db.addCustomBagItem(categoryId, name, forWhom);
      const newItem: BagItem = {
        id,
        categoryId,
        name,
        packed: false,
        forWhom,
        isCustom: true,
      };
      set((state) => ({
        bagItems: [...state.bagItems, newItem],
      }));
    } catch (error) {
      console.error('Failed to add custom bag item:', error);
    }
  },

  // ============ Food Preferences ============

  loadFoodPreferences: async () => {
    try {
      const prefs = await db.getFoodPreferences();
      set({ foodPreferences: prefs });
    } catch (error) {
      console.error('Failed to load food preferences:', error);
    }
  },

  addFoodPreference: async (category, item, tags) => {
    try {
      await db.addFoodPreference(category, item, tags);
      await get().loadFoodPreferences();
    } catch (error) {
      console.error('Failed to add food preference:', error);
    }
  },

  removeFoodPreference: async (id: string) => {
    try {
      await db.deleteFoodPreference(id);
      set((state) => ({
        foodPreferences: state.foodPreferences.filter((p) => p.id !== id),
      }));
    } catch (error) {
      console.error('Failed to remove food preference:', error);
    }
  },

  // ============ Affirmations ============

  loadAffirmations: async () => {
    try {
      const aff = await db.getAffirmations();
      set({ affirmations: aff });
    } catch (error) {
      console.error('Failed to load affirmations:', error);
    }
  },

  addAffirmation: async (text: string) => {
    try {
      await db.addAffirmation(text);
      await get().loadAffirmations();
    } catch (error) {
      console.error('Failed to add affirmation:', error);
    }
  },

  removeAffirmation: async (id: string) => {
    try {
      await db.deleteAffirmation(id);
      set((state) => ({
        affirmations: state.affirmations.filter((a) => a.id !== id),
      }));
    } catch (error) {
      console.error('Failed to remove affirmation:', error);
    }
  },

  // ============ BRAIN Scenarios ============

  loadBrainScenarios: async () => {
    try {
      const scenarios = await db.getBRAINScenarios();
      set({ brainScenarios: scenarios });
    } catch (error) {
      console.error('Failed to load BRAIN scenarios:', error);
    }
  },

  saveBrainScenario: async (scenario: BRAINScenario) => {
    try {
      await db.saveBRAINScenario(scenario);
      await get().loadBrainScenarios();
    } catch (error) {
      console.error('Failed to save BRAIN scenario:', error);
    }
  },

  // ============ App State Summary ============

  calculateProgress: async () => {
    try {
      const summary = await db.calculateAppStateSummary();

      set({
        appStateSummary: summary,
      });
    } catch (error) {
      console.error('Failed to calculate progress:', error);
    }
  },

  // ============ Utility ============

  clearAllData: async () => {
    try {
      await db.clearAllData();
      set({
        appSettings: null,
        birthPlanAnswers: {},
        interventionPrefs: {},
        bagItems: [],
        foodPreferences: [],
        affirmations: [],
        brainScenarios: [],
        appStateSummary: null,
      });
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  },
}));

// ============ Hook for initializing store on app startup ============

export async function initializeAppStore() {
  const store = useAppStore;

  try {
    await store.getState().loadSettings();
    await store.getState().loadBirthPlan();
    await store.getState().loadInterventions();
    await store.getState().loadBagItems();
    await store.getState().loadFoodPreferences();
    await store.getState().loadAffirmations();
    await store.getState().loadBrainScenarios();
    await store.getState().calculateProgress();

    store.getState().setInitialized(true);
    console.log('App store initialized');
  } catch (error) {
    console.error('Failed to initialize app store:', error);
  }
}
