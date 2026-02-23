import { create } from 'zustand';

interface AppState {
    isLaunchpadOpen: boolean;
    toggleLaunchpad: () => void;
    setLaunchpadOpen: (isOpen: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
    isLaunchpadOpen: false,
    toggleLaunchpad: () => set((state) => ({ isLaunchpadOpen: !state.isLaunchpadOpen })),
    setLaunchpadOpen: (isOpen) => set({ isLaunchpadOpen: isOpen }),
}));
