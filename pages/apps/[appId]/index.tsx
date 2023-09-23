import AppView from "@/components/AppView";
import { FlydeHeader } from "@/components/FlydeHeader";
import LoginButton from "@/components/LoginButton";
import LogoutButton from "@/components/LogoutButton";
import { SimpleUser, simplifiedUser } from "@/lib/user";
import { PlaygroundApp } from "@/types/entities";
import { Database } from "@/types/supabase";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";

export const getServerSideProps: GetServerSideProps<{
  app: PlaygroundApp;
  user: SimpleUser | null;
  baseDomain: string;
}> = async (context) => {
  const supabase = createPagesServerClient<Database>(context);

  const appId = context.params?.appId as string;

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

  const baseDomain = `https://${context.req.headers.host ?? "play.flyde.dev"}`;

  return {
    props: {
      app: res.data as PlaygroundApp,
      user: user ? simplifiedUser(user) : null,
      baseDomain,
    },
  };
};

export default function Page({
  app,
  user,
  baseDomain,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  return <AppView app={app} user={user} baseDomain={baseDomain} />;
}
