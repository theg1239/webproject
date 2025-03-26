// Store for score
export const state = {
  value: 0,
  maxRow: 0,
  listeners: [] as Array<() => void>,
  
  increment: (points = 1) => {
    state.value += points;
    state.notifyListeners();
  },
  
  updateMaxRow: (row: number) => {
    if (row > state.maxRow) {
      state.maxRow = row;
      state.increment();
    }
  },
  
  reset: () => {
    state.value = 0;
    state.maxRow = 0;
    state.notifyListeners();
  },
  
  // Subscribe to score changes
  subscribe: (listener: () => void) => {
    state.listeners.push(listener);
    return () => {
      state.listeners = state.listeners.filter(l => l !== listener);
    };
  },
  
  // Notify all listeners of score changes
  notifyListeners: () => {
    state.listeners.forEach(listener => listener());
  }
}; 