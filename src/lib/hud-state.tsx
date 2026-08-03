import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@/integrations/supabase/client";
import { getMe } from "@/lib/auth.functions";

export type GamerMode = "friendly" | "pro";

export type GamerProfile = {
  name: string;
  title: string;
  bio: string;
  accent: string;
  avatar_url?: string | null;
  banner_url?: string | null;
};

const DEFAULT_PROFILE: GamerProfile = {
  name: "AlvaGamer",
  title: "Ranqueada Solo",
  bio: "Apenas um gamer apaixonado por desafios e evolução.",
  accent: "var(--neon)",
};

const DEFAULT_LOCAL_PROFILE: GamerProfile & { mode: GamerMode; activeCardId: string | null } = {
  ...DEFAULT_PROFILE,
  mode: "friendly",
  activeCardId: null,
};

type HudState = {
  userId: string | null;
  activeCardId: string | null;
  mode: GamerMode;
  profile: GamerProfile;
  loading: boolean;
  selectCard: (id: string) => void;
  clearCard: () => void;
  setMode: (m: GamerMode) => void;
  updateProfile: (patch: Partial<GamerProfile>) => Promise<void>;
};

const HudContext = createContext<HudState | null>(null);
const KEY = "seev.hud";

type Persisted = { activeCardId: string | null; mode: GamerMode; profile: GamerProfile };

export function HudProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [mode, setModeState] = useState<GamerMode>("friendly");
  const [profile, setProfile] = useState<GamerProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  // Load local fallback immediately on mount.
  useEffect(() => {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      setLoading(false);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Partial<Persisted>;
      if (parsed.activeCardId !== undefined) setActiveCardId(parsed.activeCardId);
      if (parsed.mode === "friendly" || parsed.mode === "pro") setModeState(parsed.mode);
      if (parsed.profile) setProfile({ ...DEFAULT_PROFILE, ...parsed.profile });
    } catch {
      /* ignore malformed state */
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync with Supabase auth state.
  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!mounted) return;

      if (user) {
        setUserId(user.id);
        try {
          const me = await getMe();
          if (mounted) {
            setProfile({
              name: me.profile.name,
              title: me.profile.title,
              bio: me.profile.bio,
              accent: me.profile.accent,
              avatar_url: me.profile.avatar_url,
              banner_url: me.profile.banner_url,
            });
            if (me.profile.mode === "friendly" || me.profile.mode === "pro") {
              setModeState(me.profile.mode);
            }
            if (me.profile.active_card_id) {
              setActiveCardId(me.profile.active_card_id);
            }
          }
        } catch (err) {
          console.error("Failed to load profile", err);
        }
      } else {
        setUserId(null);
      }
      if (mounted) setLoading(false);
    }

    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUserId(session.user.id);
        setLoading(true);
        getMe()
          .then((me) => {
            if (!mounted) return;
            setProfile({
              name: me.profile.name,
              title: me.profile.title,
              bio: me.profile.bio,
              accent: me.profile.accent,
              avatar_url: me.profile.avatar_url,
              banner_url: me.profile.banner_url,
            });
            if (me.profile.mode === "friendly" || me.profile.mode === "pro") {
              setModeState(me.profile.mode);
            }
            if (me.profile.active_card_id) {
              setActiveCardId(me.profile.active_card_id);
            }
          })
          .catch((err) => console.error("Failed to load profile after sign in", err))
          .finally(() => mounted && setLoading(false));
      } else if (event === "SIGNED_OUT") {
        setUserId(null);
        setProfile(DEFAULT_PROFILE);
        setModeState("friendly");
        setActiveCardId(null);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const persistLocal = useCallback((next: Persisted) => {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  const selectCard = useCallback(
    (id: string) => {
      setActiveCardId(id);
      persistLocal({ activeCardId: id, mode, profile });
      if (userId) {
        supabase.from("profiles").update({ active_card_id: id }).eq("id", userId).then(({ error }) => {
          if (error) console.error("Failed to persist active card", error);
        });
      }
    },
    [mode, persistLocal, profile, userId],
  );

  const clearCard = useCallback(() => {
    setActiveCardId(null);
    persistLocal({ activeCardId: null, mode, profile });
    if (userId) {
      supabase.from("profiles").update({ active_card_id: null }).eq("id", userId).then(({ error }) => {
        if (error) console.error("Failed to clear active card", error);
      });
    }
  }, [mode, persistLocal, profile, userId]);

  const setMode = useCallback(
    (m: GamerMode) => {
      setModeState(m);
      persistLocal({ activeCardId, mode: m, profile });
      if (userId) {
        supabase.from("profiles").update({ mode: m }).eq("id", userId).then(({ error }) => {
          if (error) console.error("Failed to persist mode", error);
        });
      }
    },
    [activeCardId, persistLocal, profile, userId],
  );

  const updateProfile = useCallback(
    async (patch: Partial<GamerProfile>) => {
      const next = { ...profile, ...patch };
      setProfile(next);
      persistLocal({ activeCardId, mode, profile: next });

      if (userId) {
        const { error } = await supabase
          .from("profiles")
          .update({
            name: next.name,
            title: next.title,
            bio: next.bio,
            accent: next.accent,
            avatar_url: next.avatar_url ?? null,
            banner_url: next.banner_url ?? null,
          })
          .eq("id", userId);
        if (error) throw error;
      }
    },
    [activeCardId, mode, persistLocal, profile, userId],
  );

  const value = useMemo(
    () => ({
      userId,
      activeCardId,
      mode,
      profile,
      loading,
      selectCard,
      clearCard,
      setMode,
      updateProfile,
    }),
    [userId, activeCardId, mode, profile, loading, selectCard, clearCard, setMode, updateProfile],
  );

  return <HudContext.Provider value={value}>{children}</HudContext.Provider>;
}

export function useHud() {
  const ctx = useContext(HudContext);
  if (!ctx) throw new Error("useHud must be used inside HudProvider");
  return ctx;
}
