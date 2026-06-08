import { create } from 'zustand';

const useTaskStore = create((set) => ({
  tasks: [],
  // Fungsi untuk sinkronisasi dengan database backend nantinya [cite: 27, 44]
  setTasks: (newTasks) => set({ tasks: newTasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
}));

export default useTaskStore;