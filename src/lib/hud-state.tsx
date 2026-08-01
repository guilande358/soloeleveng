import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type GamerMode = "friendly" | "pro";

export type GamerProfile = {
  name: string;
  title: string;
  bio: string;
  accent: string;
};

const DEFAULT_PROFILE: GamerProfile = {
  name: "AlvaGamer",
  title: "Ranqueada Solo",
  bio: "Apenas um gamer apaixonado por desafios e evolução.",
  accent: "var(--neon)",
};

type HudState = {
  activeCardId: string | null;
  mode: GamerMode;
  profile: GamerProfile;
  selectCard: (id: string) => void;
  clearCard: () => void;
  setMode: (m: GamerMode) => void;
  updateProfile: (patch: Partial<GamerProfile>) => void;
};

const HudContext = createContext<HudState | null>(null);
const KEY = "seev.hud";

type Persisted = { activeCardId: string | null; mode: GamerMode; profile: GamerProfile };

export function HudProvider({ children }: { children: ReactNode }) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [mode, setModeState] = useState<GamerMode>("friendly");
  const [profile, setProfile] = useState<GamerProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Partial<Persisted>;
      if (parsed.activeCardId !== undefined) setActiveCardId(parsed.activeCardId);
      if (parsed.mode === "friendly" || parsed.mode === "pro") setModeState(parsed.mode);
      if (parsed.profile) setProfile({ ...DEFAULT_PROFILE, ...parsed.profile });
    } catch {
      /* ignore malformed state */
    }
  }, []);

  const persist = useCallback((next: Persisted) => {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  const selectCard = useCallback(
    (id: string) => {
      setActiveCardId(id);
      persist({ activeCardId: id, mode, profile });
    },
    [mode, persist, profile],
  );

  const clearCard = useCallback(() => {
    setActiveCardId(null);
    persist({ activeCardId: null, mode, profile });
  }, [mode, persist, profile]);

  const setMode = useCallback(
    (m: GamerMode) => {
      setModeState(m);
      persist({ activeCardId, mode: m, profile });
    },
    [activeCardId, persist, profile],
  );

  const updateProfile = useCallback(
    (patch: Partial<GamerProfile>) => {
      const next = { ...profile, ...patch };
      setProfile(next);
      persist({ activeCardId, mode, profile: next });
    },
    [activeCardId, mode, persist, profile],
  );

  const value = useMemo(
    () => ({ activeCardId, mode, profile, selectCard, clearCard, setMode, updateProfile }),
    [activeCardId, mode, profile, selectCard, clearCard, setMode, updateProfile],
  );

  return <HudContext.Provider value={value}>{children}</HudContext.Provider>;
}

export function useHud() {
  const ctx = useContext(HudContext);
  if (!ctx) throw new Error("useHud must be used inside HudProvider");
  return ctx;
}
