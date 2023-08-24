"use client";

import React from "react";
import CodeEditor from "./CodeEditor";
import SaveIcon from "./Icons/SaveIcon";
import DownloadIcon from "./Icons/DownloadIcon";
import ForkIcon from "./Icons/ForkIcon";
import ShareIcon from "./Icons/ShareIcon";
import Tabs, { fileEquals } from "./Tabs";
import {
  User,
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";

import { Database, Json } from "../../types/supabase";
import { App } from "../../types/entities";
import { revalidatePath } from "next/cache";
import { useRouter, usePathname } from "next/navigation";

import { isClient } from "@/lib/isClient";
import { SimpleUser } from "@/lib/user";
import LoginButton from "@/components/LoginButton";
import Head from "next/head";
import NewFileButton from "./NewFileButton";
import { on } from "events";
import EmbeddedFlyde from "./EmbeddedFlyde";

export interface AppFile {
  name: string;
  suffix: "flyde" | "flyde.ts";
  content: string;
}

export interface AppData {
  title: string;
  files: AppFile[];
}

export interface AppViewProps {
  app: App;
  user?: SimpleUser;
}

export default function AppView(props: AppViewProps) {
  const { app, user } = props;

  const [savedAppData, setSavedAppData] = React.useState<AppData>(app);

  const [appData, setAppData] = React.useState<AppData>(app);

  const supabase = createClientComponentClient<Database>();

  const [activeFile, setActiveFile] = React.useState<AppFile>(appData.files[0]);
  const [editedFileTab, setEditedFileTab] = React.useState<AppFile>();

  const router = useRouter();
  const path = usePathname();

  const unsavedFiles = React.useMemo(() => {
    const unsavedFiles = new Set<AppFile>();

    appData.files.forEach((file) => {
      const savedFile = savedAppData.files.find(
        (f) => f.name === file.name && f.suffix === file.suffix
      );
      if (
        !savedFile ||
        savedFile.content !== file.content ||
        savedFile.name !== file.name
      ) {
        unsavedFiles.add(file);
      }
    });

    return unsavedFiles;
  }, [appData, savedAppData]);

  async function downloadZip() {
    const { default: JSZip } = await import("jszip");
    const { default: saveAs } = await import("file-saver");
    const zip = new JSZip();
    for (const file of appData.files) {
      zip.file(file.name, file.content);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "FlydeApp.zip");
  }

  async function fork() {
    const newApp = await supabase
      .from("apps")
      .insert({
        files: savedAppData.files as any,
        title: "Forked from " + savedAppData.title,
      })
      .select();

    if (newApp.data && newApp.data.length === 1) {
      router.push(`/${newApp.data[0].id}`);
    } else {
      throw new Error("Fork app did not return a new app id");
    }
  }

  async function save() {
    await supabase
      .from("apps")
      .update({
        files: appData.files as any,
        title: appData.title,
      })
      .eq("id", props.app.id);

    setSavedAppData(appData);
  }

  function generateShareUrl() {
    const text = `🚀 Just built something awesome with @FlydeDev's visual programming playground!\n\nCheck it out and start creating your own!`;
    const url = isClient() ? `${location.href}` : "in server, no url";
    const hashtags = [`Flyde`, `VisualProgramming`];

    return `https://twitter.com/share?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(
      hashtags.join(",")
    )}`;
  }

  function changeActiveFileContent(content: string) {
    setAppData((prev) => ({
      ...prev,
      files: prev.files.map((file) =>
        fileEquals(file, activeFile) ? { ...file, content } : file
      ),
    }));
  }

  function onDeleteFile(file: AppFile) {
    setAppData((prev) => ({
      ...prev,
      files: prev.files.filter((f) => !fileEquals(f, file)),
    }));
    setActiveFile(appData.files[0]);
  }

  function onRenameFile(file: AppFile, newName: string) {
    setAppData((prev) => ({
      ...prev,
      files: prev.files.map((f) =>
        fileEquals(f, file) ? { ...f, name: newName } : f
      ),
    }));
    setEditedFileTab(undefined);
  }

  function onCreateFile(suffix: AppFile["suffix"]) {
    let i = 1;
    let name = `Flow${i}`;
    while (
      appData.files.some((file) => file.name === name && file.suffix === suffix)
    ) {
      i++;
      name = `Flow${i}`;
    }

    const newFile: AppFile = {
      name,
      suffix,
      content: "",
    };

    setAppData((prev) => ({
      ...prev,
      files: [...prev.files, newFile],
    }));
    setActiveFile(newFile);
  }

  return (
    <React.Fragment>
      <header className="w-full flex flex-col justify-center h-16 border-b-foreground/10 border-b bg-gray-200">
        <div className="w-full  flex flex-row justify-between p-3 text-foreground px-16">
          <input
            value={appData.title}
            onChange={(e) =>
              setAppData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="App's title goes here"
            className="bg-transparent text-foreground .hover:border-b-foreground hover:border-b transition-color duration-50 w-full mr-3 "
          />
          <div className="flex flex-row gap-4 items-center">
            <a href={generateShareUrl()} target="_blank">
              <ShareIcon />
            </a>
            <button onClick={downloadZip}>
              <DownloadIcon />
            </button>
            <button onClick={fork} disabled={!user}>
              <ForkIcon />
            </button>
            <button onClick={save} disabled={!user}>
              <SaveIcon />
            </button>
            {user ? <span>@{user.username}</span> : <LoginButton path={path} />}
          </div>
        </div>
      </header>
      <main className="w-full h-full flex flex-row flex-1">
        <div className="flex flex-col w-full border-r border-r-foreground/10 flex-1">
          <header className="w-full border-b border-b-foreground/10 flex flex-row items-center">
            <Tabs
              files={appData.files}
              unsavedFiles={unsavedFiles}
              activeFile={activeFile}
              onDeleteFile={onDeleteFile}
              onChangeActiveFile={(newActiveFile) =>
                setActiveFile(newActiveFile)
              }
              onRenameFile={onRenameFile}
              onSetEditedFile={(file) => setEditedFileTab(file)}
              editedFile={editedFileTab}
            />
            <NewFileButton onCreateFile={onCreateFile} />
          </header>
          <div className="h-full">
            <CodeEditor
              value={activeFile.content}
              onChange={changeActiveFileContent}
            />
          </div>
        </div>
        <div className="flex flex-col w-full  flex-1">
          <header className="w-full  border-b border-b-foreground/10 flex flex-row items-center justify-between">
            Tabs
          </header>
          <div className="h-full">
            <EmbeddedFlyde />
          </div>
        </div>
      </main>
      <Head>
        <title>{savedAppData.title} | Flyde Playground</title>
        <meta
          property="og:title"
          content={`${savedAppData.title} | Flyde Playground`}
          key="title"
        />
      </Head>
    </React.Fragment>
  );
}