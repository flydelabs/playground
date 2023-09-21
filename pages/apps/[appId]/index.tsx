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

  return {
    props: {
      app: res.data as PlaygroundApp,
      user: user ? simplifiedUser(user) : null,
    },
  };
};

export default function Page({
  app,
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  return (
    <div className="w-full h-full flex flex-col items-center flex-1">
      <AppView app={app} user={user} />
    </div>
  );
}
