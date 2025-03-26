import { create } from "zustand";
import { generateRows } from "../utilities/generateRows";
import type { Row } from "../types";

interface StoreState {
  rows: Row[];
  addRows: () => void;
  resetMap: () => void;
}

const useStore = create<StoreState>((set) => ({
  rows: generateRows(20),
  addRows: () => {
    const newRows = generateRows(20);
    set((state) => ({ rows: [...state.rows, ...newRows] }));
  },
  resetMap: () => {
    set({ rows: generateRows(20) });
  },
}));

export default useStore;