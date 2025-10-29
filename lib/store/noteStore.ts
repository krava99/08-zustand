import { NoteTag } from "@/types/note";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Note {
  title: string;
  content: string;
  tag: NoteTag;
}

const initialDraft: Note = {
  title: "",
  content: "",
  tag: "Todo",
};

interface NoteStore {
  draft: Note;
  setDraft: (note: Note) => void;
  clearDraft: () => void;
}

export const useNoteStore = create<NoteStore>()(
  persist(
    (set) => ({
      draft: initialDraft,
      setDraft: (note: Note) => set({ draft: note }),
      clearDraft: () => set({ draft: initialDraft }),
    }),
    {
      name: "note-store",
    }
  )
);
