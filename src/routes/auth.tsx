import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Pawtoons" }] }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [debug, setDebug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) navigate({ to: "/dashboard" });
  }, [session, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setDebug(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        const { data: sessionData } = await supabase.auth.getSession();
        setDebug(`Signup success. Session exists: ${sessionData.session ? "yes" : "no"}`);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const { data: sessionData } = await supabase.auth.getSession();
        setDebug(`Signin success. Session exists: ${sessionData.session ? "yes" : "no"}`);
      }
    } catch (e: any) {
      setErr(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    setErr(null);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/dashboard` });
    if (r.error) setErr(r.error.message ?? "Google sign-in failed");
  }

  return (
    <div className="min-h-screen grid place-items-center bg-background px-4 sm:px-5 py-8 sm:py-10" style={{ background: "var(--gradient-warm)" }}>
      <div className="w-full max-w-md rounded-2xl sm:rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-[var(--shadow-soft)]">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <div className="size-9 rounded-full bg-[var(--gradient-primary)] grid place-items-center text-primary-foreground">🐾</div>
          <span className="font-display text-xl">Pawtoons<span className="text-primary">.</span></span>
        </Link>
        <h1 className="font-display text-2xl sm:text-3xl mb-1">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mb-5 sm:mb-6">{mode === "signin" ? "Sign in to access your pet portraits." : "Save your pets, generations, and orders in one place."}</p>

        <button
          type="button"
          onClick={google}
          className="w-full mb-4 rounded-full border border-border bg-background py-2.5 sm:py-3 text-xs sm:text-sm font-medium hover:bg-secondary transition flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.07H2.18a11 11 0 0 0 0 9.87l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
          {mode === "signup" && (
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full rounded-xl border border-input bg-background px-3 sm:px-4 py-2.5 sm:py-3 text-sm" />
          )}
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border border-input bg-background px-3 sm:px-4 py-2.5 sm:py-3 text-sm" />
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border border-input bg-background px-3 sm:px-4 py-2.5 sm:py-3 text-sm" />
          {err && <div className="text-xs sm:text-sm text-destructive">{err}</div>}
          {debug && <div className="text-xs sm:text-sm text-green-700">{debug}</div>}
          <div className="text-xs text-muted-foreground">Debug: session {session ? "active" : "none"}</div>
          <button disabled={loading} className="w-full rounded-full px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-60" style={{ background: "var(--gradient-primary)" }}>
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-4 sm:mt-5 text-xs sm:text-sm text-muted-foreground hover:text-foreground w-full text-center">
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
