// stores/useTableCacheStore.js
import { create } from "zustand";

export const useTableCacheStore = create((set, get) => ({
    cache: {},

    getCached: (key) => get().cache[key] ?? null,

    setCached: (key, data) => {
        set((state) => ({
            cache: { ...state.cache, [key]: data },
        }));
    },

    clearCache: (prefix) => {
        set((state) => {
            if (!prefix) return { cache: {} };
            const filtered = Object.fromEntries(
                Object.entries(state.cache).filter(
                    ([k]) => !k.startsWith(prefix),
                ),
            );
            return { cache: filtered };
        });
    },
}));
