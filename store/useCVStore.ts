import { create } from 'zustand';

interface CVState {
    resumeFile: File | null;
    setResumeFile: (file: File | null) => void;
}

export const useCVStore = create<CVState>((set) => ({
    resumeFile: null,
    setResumeFile: (file) => set({ resumeFile: file }),
}));