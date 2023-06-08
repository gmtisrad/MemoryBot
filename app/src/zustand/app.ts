import { create } from 'zustand';

interface IAppStore {}

const useAppStore = create<IAppStore>((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}));
