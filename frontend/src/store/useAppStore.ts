import { create } from "zustand";

interface AppState {
  selectedSceneToken: string | null;
  selectedSampleToken: string | null;

  selectScene: (token: string) => void;
  selectSample: (token: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedSceneToken: null,
  selectedSampleToken: null,

  selectScene: (token) =>
    set({ selectedSceneToken: token, selectedSampleToken: null }),

  selectSample: (token) => set({ selectedSampleToken: token }),
}));
