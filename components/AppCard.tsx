import { PlaygroundApp } from "@/types/entities";
import { AppFileType } from "./AppView";
import Link from "next/link";

export function AppCard({ app }: { app: PlaygroundApp }) {
  const updated = new Date(app.last_updated_date).toLocaleString();

  const visualFilesCount = app.files.filter(
    (file) => file.type === AppFileType.VISUAL_FLOW
  ).length;

  return (
    <Link href={`/apps/${app.id}`}>
      <div className="flex flex-col justify-center w-96 py-5 bg-white rounded-xl shadow-lg m-4 hover:bg-gray-100 cursor-pointer">
        <h1 className="text-l font-bold">{app.title}</h1>
        <div className="text-sm text-slate-500">By {app.creator_name}</div>
        <div className="text-sm text-slate-500">
          <div>Visual flows: {visualFilesCount}</div>
          <div>Modified {updated}</div>
          <p></p>
        </div>
      </div>
    </Link>
  );
}
