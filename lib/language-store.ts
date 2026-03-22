import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RegionId, LangCode } from "./region-types";
import { REGIONS } from "./regions";

interface LanguageState {
  lang: LangCode;
  region: RegionId;
  setLang: (lang: LangCode) => void;
  setRegion: (region: RegionId) => void;
  /** Get languages valid for current region */
  availableLangs: () => LangCode[];
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      lang: "en",
      region: "gaza",
      setLang: (lang) => set({ lang }),
      setRegion: (region) => {
        const config = REGIONS[region];
        const currentLang = get().lang;
        const valid = config.languages.includes(currentLang);
        set({
          region,
          lang: valid ? currentLang : config.languages[0],
        });
      },
      availableLangs: () => REGIONS[get().region].languages,
    }),
    { name: "aidlink-language" }
  )
);
