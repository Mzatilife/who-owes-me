import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from './types';
import { getSeedState } from './seed';

const STORAGE_KEY = '@who_owes_me_state_v1';

export async function loadState(): Promise<AppState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed.settings && parsed.settings.biometricEnabled === undefined) {
        parsed.settings.biometricEnabled = false;
      }
      if (parsed.onboardingComplete === undefined) {
        const hasLegacyPreviewData = parsed.debts.some((debt) => debt.id.startsWith('seed-'));
        if (hasLegacyPreviewData) {
          const cleanState = getSeedState();
          await saveState(cleanState);
          return cleanState;
        }
        parsed.onboardingComplete = Boolean(parsed.settings?.userName?.trim());
        await saveState(parsed);
      }
      return parsed;
    }
    const seed = getSeedState();
    await saveState(seed);
    return seed;
  } catch (e) {
    console.error('Failed to load state:', e);
    return getSeedState();
  }
}

export async function saveState(state: AppState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

export async function clearState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear state:', e);
  }
}

export async function resetToSeed(): Promise<AppState> {
  const seed = getSeedState();
  await saveState(seed);
  return seed;
}
