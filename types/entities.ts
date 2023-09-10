import { AppData } from "@/components/AppView";
import { Database } from "./supabase";

export type App = Database["public"]["Tables"]["apps"]["Row"] & {
  files: AppData["files"];
};
