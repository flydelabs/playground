import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import LogoutButton from "../components/LogoutButton";
import SupabaseLogo from "../components/SupabaseLogo";
import NextJsLogo from "../components/NextJsLogo";
import LoginButton from "../components/LoginButton";

export const dynamic = "force-dynamic";

export default async function Index() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log({ user });

  return (
    <div className="w-full flex flex-col items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm text-foreground">
          <div />
          <div>
            {user ? (
              <div className="flex items-center gap-4">
                Hey, {user.user_metadata?.name}
                <LogoutButton />
              </div>
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
      </nav>

      <p className="animate-in text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center my-12">
        Welcome to Flyde's Playground
      </p>
    </div>
  );
}
