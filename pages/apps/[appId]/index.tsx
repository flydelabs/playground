import AppView from "@/components/AppView";
import { SimpleUser, simplifiedUser } from "@/lib/user";
import { PlaygroundApp } from "@/types/entities";
import { Database } from "@/types/supabase";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";

export const getServerSideProps: GetServerSideProps<{
  app: PlaygroundApp | null;
  user: SimpleUser | null;
  baseDomain: string;
}> = async (context) => {
  const supabase = createPagesServerClient<Database>(context);

  const appId = context.params?.appId as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const res = await supabase
      .from("apps")
      .select("*")
      .eq("id", appId)
      .single();

    if (res.error) {
      throw res.error.message;
    }

    if (!res.data) {
      throw new Error("App not found");
    }

    const baseDomain = `https://${
      context.req.headers.host ?? "play.flyde.dev"
    }`;

    return {
      props: {
        app: res.data as PlaygroundApp,
        user: user ? simplifiedUser(user) : null,
        baseDomain,
      },
    };
  } catch (e) {
    return {
      props: {
        app: null,
        user: user ? simplifiedUser(user) : null,
        baseDomain: `https://${context.req.headers.host ?? "play.flyde.dev"}`,
      },
    };
  }
};

export default function Page({
  app,
  user,
  baseDomain,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  if (app) {
    return <AppView app={app} user={user} baseDomain={baseDomain} />;
  } else {
    return (
      <div className="flex flex-col nunito text-center my-10">
        <h1 className="text-2xl font-bold">Flyde Playground</h1>
        <p className="text-lg">App not found</p>
        <Link href={`/`}>View all apps</Link>
      </div>
    );
  }
}
