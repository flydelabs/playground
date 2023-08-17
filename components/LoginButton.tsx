"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function LoginButton() {
  async function login() {
    const supabase = createClientComponentClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  }

  return (
    <button
      onClick={login}
      className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
    >
      Login with GitHub
    </button>
  );
}
