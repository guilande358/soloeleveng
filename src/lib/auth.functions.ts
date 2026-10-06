import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const signUpInput = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(40),
});

const signInInput = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

/** Register a new gamer and create the default profile + wallet. */
export const signUp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => signUpInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: authData, error: signUpError } = await supabaseAdmin.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { name: data.name } },
    });

    if (signUpError) throw new Error(signUpError.message);
    if (!authData.user) throw new Error("User creation failed");

    const userId = authData.user.id;

    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: userId,
      name: data.name,
      title: "Ranqueada Solo",
      bio: "Apenas um gamer apaixonado por desafios e evolução.",
      accent: "var(--neon)",
      mode: "friendly",
    });

    if (profileError) {
      console.error("Profile creation failed", profileError);
      throw new Error("Profile creation failed");
    }

    const { error: walletError } = await supabaseAdmin.from("wallets").insert({
      user_id: userId,
      balance: 0,
      coffee_count: 0,
      pending: 0,
    });

    if (walletError) {
      console.error("Wallet creation failed", walletError);
    }

    const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
      user_id: userId,
      role: "user",
    });

    if (roleError) {
      console.error("Role creation failed", roleError);
    }

    return { ok: true, userId };
  });

/** Sign in with email and password. */
export const signIn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => signInInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: authData, error } = await supabaseAdmin.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw new Error(error.message);
    if (!authData.session) throw new Error("No session returned");

    return {
      ok: true,
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      expiresAt: authData.session.expires_at,
    };
  });

/** Sign out the current user. */
export const signOut = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.signOut(context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Send a password reset email. */
export const resetPassword = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ email: z.string().email() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${process.env["VITE_APP_URL"] ?? "http://localhost:8080"}/auth?reset=1`,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Get the current session user and profile. */
export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: existing, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (existing) return { userId: context.userId, profile: existing };

    // First sign-in (e.g. Google): create the default profile + wallet.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const meta = (context.claims as { user_metadata?: Record<string, unknown>; email?: string })
      ?.user_metadata;
    const email = (context.claims as { email?: string })?.email ?? "";
    const name =
      String(meta?.["full_name"] ?? meta?.["name"] ?? email.split("@")[0] ?? "Gamer").slice(0, 40) ||
      "Gamer";

    const { data: profile, error: insErr } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: context.userId,
          name,
          title: "Ranqueada Solo",
          bio: "Apenas um gamer apaixonado por desafios e evolução.",
          accent: "var(--neon)",
          mode: "friendly",
        },
        { onConflict: "id" },
      )
      .select("*")
      .single();
    if (insErr) throw new Error(insErr.message);

    await supabaseAdmin
      .from("wallets")
      .upsert(
        { user_id: context.userId, balance: 0, coffee_count: 0, pending: 0 },
        { onConflict: "user_id", ignoreDuplicates: true },
      );

    return { userId: context.userId, profile };
  });
