import Image from "next/image";
import { Nunito } from "next/font/google";
import { GetServerSideProps, InferGetServerSidePropsType } from "next/types";
import { PlaygroundApp } from "@/types/entities";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { AppFileType } from "@/components/AppView";
import Link from "next/link";
import { AppCard } from "@/components/AppCard";
// import EmbeddedFlyde from "./EmbeddedFlyde";

export const getServerSideProps: GetServerSideProps<{
  apps: PlaygroundApp[];
}> = async (context) => {
  const supabase = createPagesServerClient<Database>(context);

  const res = await supabase
    .from("apps")
    .select("*")
    .order("last_updated_date", {
      ascending: false,
    })
    .limit(10);

  if (res.error) {
    throw res.error.message;
  }

  if (!res.data) {
    throw new Error("App not found");
  }

  return {
    props: {
      apps: res.data as PlaygroundApp[],
    },
  };
};

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export default function Home({
  apps,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <main className="flex min-h-screen flex-col nunito text-center my-10">
      <h1 className="text-2xl font-bold">Flyde Playground</h1>
      <h2 className="text-xl font-semibold">Latest apps</h2>

      <div className="flex flex-row flex-wrap card-container max-w-8xl mx-auto justify-center">
        {apps.map((app) => (
          <AppCard app={app} key={app.id} />
        ))}
        {apps.map((app) => (
          <AppCard app={app} key={app.id} />
        ))}
      </div>
    </main>
  );
}
