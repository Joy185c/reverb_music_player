import { create } from 'zustand';
import { getSetting, setSetting } from '../database/repositories/SettingsRepository';

interface SettingsState {
  userName: string | null;
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  updateUserName: (name: string | null) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  userName: null,
  isLoading: true,

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const name = await getSetting('userName');
      set({ userName: name, isLoading: false });
    } catch (e) {
      console.error('Error loading settings:', e);
      set({ isLoading: false });
    }
  },

  updateUserName: async (name: string | null) => {
    try {
      await setSetting('userName', name);
      set({ userName: name });
    } catch (e) {
      console.error('Error updating user name:', e);
    }
  }
}));
