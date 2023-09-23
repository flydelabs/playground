import { PlaygroundApp } from "@/types/entities";
import { AppFileType } from "./AppView";
import Link from "next/link";
import { TimeAgo } from "./TimeAgo";

export function AppCard({ app }: { app: PlaygroundApp }) {
  const updated = new Date(app.last_updated_date);

  return (
    <Link href={`/apps/${app.id}`} className="!no-underline">
      <div className="flex flex-col justify-between w-96 h-36 py-5 px-10 border-slate-200 border bg-white rounded-xl shadow-lg m-4 hover:bg-gray-100 cursor-pointer">
        <h1 className="text-l font-bold">{app.title}</h1>

        <div className="flex-row justify-center flex gap-2">
          <div className="text-sm text-slate-500">
            By{" "}
            <Link href={`/users/${app.creator_id}`}>@{app.creator_name}</Link>
          </div>
          <span> · </span>
          <div className="text-sm text-slate-500">
            <div>
              Modified <TimeAgo date={updated} /> ago
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
