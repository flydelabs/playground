import React from "react";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";
import { App } from "@/types/entities";
import { SimpleUser, simplifiedUser } from "@/lib/user";
import type { Metadata } from "next";
import EmbeddedFlyde from "../_components/EmbeddedFlyde";

export const dynamic = "force-dynamic";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: { appId: string };
}): Promise<Metadata> {
  // read route params
  const id = params.appId;

  const app = await getData(id);

  return {
    title: `${app.app.title} | Flyde Playground`,
    openGraph: {
      title: `${app.app.title} | Flyde Playground`,
    },
  };
}

async function getData(
  appId: string
): Promise<{ app: App; user?: SimpleUser }> {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const res = await supabase.from("apps").select("*").eq("id", appId).single();

  if (res.error) {
    throw res.error.message;
  }

  if (!res.data) {
    throw new Error("App not found");
  }

  return {
    app: res.data as App,
    user: user ? simplifiedUser(user) : undefined,
  };
}

export default async function Index({ params }: { params: { appId: string } }) {
  const { app, user } = await getData(params.appId);

  return (
    <div className="w-full flex flex-col items-center flex-1">
      <EmbeddedFlyde />
      {/* <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm text-foreground">
          <div />
          <div>
            {user ? (
              <div className="flex items-center gap-4">
                Hey, {user.username}!
                <LogoutButton />
              </div>
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
      </nav>
      <AppView app={app} user={user} /> */}
    </div>
  );
}
