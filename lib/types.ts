/**
 * Core TypeScript types for Labor Prep Together
 * Based on PRD Section 7 Data Model
 */

// User/App Settings
export interface AppSettings {
  id: 'app_settings'; // Single document
  partnerName: string;
  motherName: string;
  dueDate: string; // ISO 8601 date
  createdAt: string;
  updatedAt: string;
}

// Birth Plan Interview
export interface BirthPlanQuestion {
  id: string;
  question: string;
  type: 'text' | 'single-choice' | 'multi-choice';
  placeholder?: string;
  options?: string[];
}

export interface BirthPlanAnswer {
  questionId: string;
  answer: string | string[]; // Single answer or array for multi-choice
  answeredAt: string;
}

// Interventions
export interface Intervention {
  id: string;
  name: string;
  description: string;
  defaultPref: string;
}

export interface InterventionPref {
  interventionId: string;
  herPref: string; // Her specific preference, may differ from default
  reviewed: boolean;
  reviewedAt?: string;
}

// Labor Bag Checklist
export interface BagCategory {
  id: string;
  name: string;
  emoji: string;
  description?: string;
}

export interface BagItem {
  id: string;
  categoryId: string;
  name: string;
  packed: boolean;
  packedAt?: string;
  location?: string; // e.g., "car bag", "suitcase - green bag"
  forWhom: 'her' | 'partner' | 'baby' | 'shared';
  isCustom: boolean; // User-added item
}

// Food Preferences
export interface FoodPreference {
  id: string;
  category: 'like' | 'dislike';
  item: string;
  tags?: string[]; // e.g., "labor snack", "post-birth", "drinks"
  isCustom: boolean;
  addedAt: string;
}

// Affirmations
export interface Affirmation {
  id: string;
  text: string;
  isDefault: boolean;
  createdAt: string;
}

// Comfort Techniques
export interface ComfortTechnique {
  id: string;
  name: string;
  description: string;
  videoUrl?: string;
  practiced: boolean;
  practicedAt?: string;
  urgent?: boolean; // e.g., "Counter Pressure - PRACTICE NOW"
}

// BRAIN Decision Framework
export interface BRAINScenario {
  id: string;
  scenario: string;
  benefits: string;
  risks: string;
  alternatives: string;
  intuition: string;
  nothing: string;
  createdAt: string;
  updatedAt: string;
}

// Partner Tips
export interface PartnerTip {
  id: string;
  category: string;
  text: string;
  read: boolean;
  readAt?: string;
}

// Questions for Provider
export interface ProviderQuestion {
  id: string;
  question: string;
  answer?: string;
  answeredAt?: string;
  isCustom: boolean;
}

// Video Library
export interface Video {
  id: string;
  phase: string;
  title: string;
  url: string;
  watched: boolean;
  watchedAt?: string;
  priority?: 'high' | 'medium' | 'low';
}

// Music & Vibes Plan
export interface MusicStage {
  stage: string;
  description?: string;
  playlist?: {
    name: string;
    url: string;
  }[];
}

// App State Summary (for Review/Dashboard)
export interface AppStateSummary {
  birthPlanCompleted: number;
  birthPlanTotal: number;
  interventionsReviewed: number;
  interventionsTotal: number;
  bagItemsPacked: number;
  bagItemsTotal: number;
  affirmationsCount: number;
  preparationScore: number; // 0-100
}

// Database schema for SQLite tables
export interface DBSchema {
  app_settings: AppSettings;
  birth_plan_answers: BirthPlanAnswer;
  intervention_prefs: InterventionPref;
  bag_items: BagItem;
  food_preferences: FoodPreference;
  affirmations: Affirmation;
  comfort_techniques: ComfortTechnique;
  brain_scenarios: BRAINScenario;
  partner_tips: PartnerTip;
  provider_questions: ProviderQuestion;
  videos: Video;
}
