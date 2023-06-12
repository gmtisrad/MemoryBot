import { create } from 'zustand';

interface IAppStore {
  cases: any[];
  setCases: (cases: any) => void;
}

export const useAppStore = () => {
  const appStore = create<IAppStore>((set) => ({
    cases: [],
    setCases: (cases: any) => set({ cases }),
  }));

  return appStore;
};
