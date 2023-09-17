"use client";

import React, { useCallback, useEffect, useLayoutEffect } from "react";
import CodeEditor from "./CodeEditor";
import SaveIcon from "./Icons/SaveIcon";
import DownloadIcon from "./Icons/DownloadIcon";
import ForkIcon from "./Icons/ForkIcon";
import ShareIcon from "./Icons/ShareIcon";
import Tabs, { fileEquals } from "./Tabs";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { Database } from "../types/supabase";
import { App } from "../types/entities";
import { useRouter, usePathname } from "next/navigation";

import { isClient } from "@/lib/isClient";
import { SimpleUser } from "@/lib/user";
import LoginButton from "@/components/LoginButton";
import Head from "next/head";
import NewFileButton from "./NewFileButton";
import { EmbeddedFlydeFileWrapper } from "./EmbeddedFlyde";

import { defaultNode } from "../lib/defaultNode";
import { getDefaultContent } from "@/lib/defaultContent";
import { executeApp } from "@/lib/executeApp/executeApp";
import { Ok, safeParse } from "@/lib/safeParse";
import {
  DebuggerEvent,
  FlydeFlow,
  Node,
  ResolvedDependencies,
} from "@flyde/core";
import { transpileCodeNodes } from "@/lib/transpileCodeFlow";
import { createHistoryPlayer } from "@/lib/executeApp/createHistoryPlayer";
import { createRuntimePlayer, useLocalStorage } from "@flyde/flow-editor";
import { createRuntimeClientDebugger } from "@/lib/executeApp/createRuntimePlayerDebugger";
import { useCustomConsole } from "@/lib/useLocalConsole";
import { Resizable } from "react-resizable";
import { EventsViewer } from "./EventsViewer";

export enum AppFileType {
  VISUAL_FLOW = "flyde",
  CODE_FLOW = "flyde.ts",
  CODE = "ts",
  ENTRY_POINT = "main.ts",
}

export interface AppFile {
  name: string;
  type: AppFileType;
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

const resizeHandle = <div className="resize-handle" />;

function getFileToShow(app: App): AppFile {
  const firstVisualFile = app.files.find(
    (file) => file.type === AppFileType.VISUAL_FLOW
  );
  return firstVisualFile ?? app.files[0];
}

export default function AppView(props: AppViewProps) {
  const { app, user } = props;

  const [savedAppData, setSavedAppData] = React.useState<AppData>(app);

  const [draftAppData, setDraftAppData] = React.useState<AppData>(app);

  const supabase = createClientComponentClient<Database>();

  const [activeFile, setActiveFile] = React.useState<AppFile>(
    getFileToShow(app)
  );
  const [editedFileTab, setEditedFileTab] = React.useState<AppFile>();

  const [localNodes, setLocalNodes] = React.useState<Record<string, Node>>({});

  const router = useRouter();
  const path = usePathname();

  const historyPlayer = React.useMemo(() => createHistoryPlayer(), []);

  const runtimePlayer = React.useMemo(() => {
    const player = createRuntimePlayer();
    // player.start();
    return player;
  }, []);

  const [events, setEvents] = React.useState<DebuggerEvent[]>([]);

  useLayoutEffect(() => {
    runtimePlayer.start();
  }, [runtimePlayer]);

  const _debugger = React.useMemo(() => {
    return createRuntimeClientDebugger(runtimePlayer, historyPlayer);
  }, []);

  useEffect(() => {
    _debugger.onBatchedEvents((events) => {
      setEvents((prev) => [...prev, ...events]);
    });
  }, [_debugger]);

  const [outputWidth, setOutputWidth] = useLocalStorage("outputWidth", 500);

  const unsavedFiles = React.useMemo(() => {
    const unsavedFiles = new Set<AppFile>();

    draftAppData.files.forEach((file) => {
      const savedFile = savedAppData.files.find(
        (f) => f.name === file.name && f.type === file.type
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
  }, [draftAppData, savedAppData]);

  async function downloadZip() {
    const { default: JSZip } = await import("jszip");
    const { default: saveAs } = await import("file-saver");
    const zip = new JSZip();
    for (const file of draftAppData.files) {
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
        files: draftAppData.files as any,
        title: draftAppData.title,
      })
      .eq("id", props.app.id);

    setSavedAppData(draftAppData);
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

  const changeActiveFileContent = useCallback(
    (content: string) => {
      setDraftAppData((prev) => ({
        ...prev,
        files: prev.files.map((file) =>
          fileEquals(file, activeFile) ? { ...file, content } : file
        ),
      }));
    },
    [activeFile]
  );

  function onDeleteFile(file: AppFile) {
    if (draftAppData.files.length === 1) {
      alert("You can't delete the last file!");
      return;
    }

    const newFiles = draftAppData.files.filter((f) => !fileEquals(f, file));
    setDraftAppData((prev) => ({
      ...prev,
      files: newFiles,
    }));
    setActiveFile(newFiles[0]);
  }

  function onRenameFile(file: AppFile, newName: string) {
    setDraftAppData((prev) => ({
      ...prev,
      files: prev.files.map((f) => {
        if (fileEquals(f, file)) {
          if (f.type === AppFileType.VISUAL_FLOW) {
            const parsed = safeParse<FlydeFlow>(f.content);
            if (parsed.type === "ok") {
              parsed.data.node.id = newName;
              return {
                ...f,
                name: newName,
                content: JSON.stringify(parsed.data, null, 2),
              };
            } else {
              return f;
            }
          }

          return { ...f, name: newName };
        } else {
          return f;
        }
      }),
    }));
    setEditedFileTab(undefined);
  }

  function onCreateFile(type: AppFile["type"]) {
    let i = 1;
    let name = `Flow${i}`;
    while (
      draftAppData.files.some(
        (file) => file.name === name && file.type === type
      )
    ) {
      i++;
      name = `Flow${i}`;
    }

    const newFile: AppFile = {
      name,
      type,
      content: getDefaultContent(name, type),
    };

    setDraftAppData((prev) => ({
      ...prev,
      files: [...prev.files, newFile],
    }));
    setActiveFile(newFile);
  }

  useEffect(() => {
    const visualNodes = draftAppData.files
      .filter((f) => f.type === AppFileType.VISUAL_FLOW)
      .map((f) => safeParse<FlydeFlow>(f.content))
      .filter((m): m is Ok<FlydeFlow> => m.type === "ok")
      .map((m) => m.data.node);

    const codeFlows = draftAppData.files
      .filter((f) => f.type === AppFileType.CODE_FLOW)
      .flatMap((f) => transpileCodeNodes(f));

    const deps = [...visualNodes, ...codeFlows].reduce<Record<string, Node>>(
      (acc, node) => ({ ...acc, [node.id]: node }),
      {}
    );

    setLocalNodes(deps);
  }, [activeFile]);

  return (
    <React.Fragment>
      <header className="w-full flex flex-col justify-center h-16 border-b-foreground/10 border-b bg-gray-200">
        <div className="w-full  flex flex-row justify-between p-3 text-foreground px-16">
          <input
            value={draftAppData.title}
            onChange={(e) =>
              setDraftAppData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="App's title goes here"
            className="bg-transparent text-foreground .hover:border-b-foreground hover:border-b transition-color duration-50 mr-3 "
          />
          <div>
            <button
              className="py-2 px-4 rounded-md no-underline bg-green-400 hover:bg-green-600"
              onClick={() =>
                executeApp(draftAppData, localNodes as any, _debugger)
              }
            >
              Run
            </button>
          </div>
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
            {user ? (
              <span>@{user.username}</span>
            ) : (
              <LoginButton path={path ?? ""} />
            )}
          </div>
        </div>
      </header>
      <main className="w-full h-full flex flex-row flex-1">
        <div className="flex flex-col w-full border-r border-r-foreground/10 flex-1">
          <header className="w-full border-b border-b-foreground/10 flex flex-row items-center">
            <Tabs
              files={draftAppData.files}
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
            {activeFile.type === AppFileType.VISUAL_FLOW ? (
              <EmbeddedFlydeFileWrapper
                localNodes={localNodes as ResolvedDependencies}
                key={activeFile.name}
                fileName={activeFile.name}
                content={activeFile.content}
                onFileChange={changeActiveFileContent}
                historyPlayer={historyPlayer}
              />
            ) : (
              <CodeEditor
                value={activeFile.content}
                onChange={changeActiveFileContent}
              />
            )}
          </div>
        </div>

        <Resizable
          height={0}
          width={outputWidth}
          onResize={(_m, { size: { width } }) => setOutputWidth(width)}
          axis="x"
          resizeHandles={["w"]}
          minConstraints={[100, 0]}
          maxConstraints={[2000, 0]}
          handle={resizeHandle}
        >
          <div
            className="flex flex-col flex-grow-0 flex-shrink-0"
            style={{ flexBasis: outputWidth }}
          >
            <header className="w-full border-b-foreground/10 flex flex-row items-center justify-between py-3 px-4 border-b">
              Events <button onClick={() => setEvents([])}>Clear</button>
            </header>
            <div className="flex h-full  bg-slate-800 text-slate-100  overflow-auto max-h-full">
              <div className="w-full h-full">
                <div className="h-full overflow-y-auto">
                  <EventsViewer events={events} />
                </div>
              </div>
            </div>
          </div>
        </Resizable>
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
