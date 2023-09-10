import AppView from "@/components/AppView";
import LoginButton from "@/components/LoginButton";
import LogoutButton from "@/components/LogoutButton";
import { SimpleUser, simplifiedUser } from "@/lib/user";
import { App } from "@/types/entities";
import { Database } from "@/types/supabase";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";

export const getServerSideProps: GetServerSideProps<{
  app: App;
  user: SimpleUser | undefined;
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
      app: res.data as App,
      user: user ? simplifiedUser(user) : undefined,
    },
  };
};

export default function Page({
  app,
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  return (
    <div className="w-full flex flex-col items-center flex-1">
      {/* <EmbeddedFlyde /> */}
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
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
      <AppView app={app} user={user} />
    </div>
  );
}
