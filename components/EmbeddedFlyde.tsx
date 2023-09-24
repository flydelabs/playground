"use client";

import "@flyde/flow-editor/src/index.scss";
import {
  DebuggerContextData,
  DebuggerContextProvider,
  DependenciesContextData,
  DependenciesContextProvider,
  Loader,
  type FlowEditorState,
  type FlydeFlowEditorProps,
} from "@flyde/flow-editor";
import { useCallback, useEffect, useMemo, useState } from "react";
import React from "react";
import dynamic from "next/dynamic";
import { defaultNode } from "@/lib/defaultNode";
import {
  FlydeFlow,
  ImportedNode,
  ResolvedDependencies,
  isBaseNode,
} from "@flyde/core";
import { safeParse } from "@/lib/safeParse";
import {
  HistoryPlayer,
  createHistoryPlayer,
} from "@/lib/executeApp/createHistoryPlayer";

export interface EmbeddedFlydeProps {
  flow: FlydeFlow;
  onChange: (flow: FlydeFlow) => void;
  localNodes: ResolvedDependencies;
  historyPlayer: HistoryPlayer;
}

const noop = () => {};

const initialPadding = [10, 10] as [number, number];

async function loadStdLib(): Promise<ResolvedDependencies> {
  return Object.values(await import("@flyde/stdlib/dist/all-browser"))
    .filter(isBaseNode)
    .reduce<ResolvedDependencies>((acc, node: any) => {
      acc[node.id] = node;
      return acc;
    }, {});
}

const DynamicFlowEditor = dynamic(
  () => import("@flyde/flow-editor").then((m) => m.FlowEditor),
  {
    loading: () => <p>Loading...</p>,
    ssr: false,
  }
);

const defaultState: FlowEditorState = {
  flow: {
    node: { ...defaultNode },
  },
  boardData: {
    viewPort: {
      pos: { x: 0, y: 0 },
      zoom: 1,
    },
    selected: [],
    lastMousePos: { x: 0, y: 0 },
  },
};

export interface EmbeddedFlydeFileWrapperProps {
  content: string;
  onFileChange: (content: string) => void;
  fileName: string;
  localNodes: ResolvedDependencies;
  historyPlayer: HistoryPlayer;
}

export function EmbeddedFlydeFileWrapper(props: EmbeddedFlydeFileWrapperProps) {
  const { content, onFileChange, localNodes, historyPlayer } = props;
  const [flow, setFlow] = useState<FlydeFlow>();

  const [error, setError] = useState<Error>();

  useEffect(() => {
    const parsed = safeParse<FlydeFlow>(content);
    if (parsed.type === "ok") {
      console.log("parsed.data", parsed.data.node);
      setFlow(parsed.data);
    } else {
      setError(parsed.error as any);
    }
  }, [content]);

  const onChange = useCallback(
    (flow: FlydeFlow) => {
      onFileChange(JSON.stringify(flow, null, 2));
    },
    [onFileChange]
  );

  if (flow) {
    return (
      <EmbeddedFlyde
        key={props.fileName}
        flow={flow}
        onChange={onChange}
        localNodes={localNodes}
        historyPlayer={historyPlayer}
      />
    );
  } else if (error) {
    return <p>Error parsing Flyde: {error?.message}</p>;
  } else {
    return <Loader />;
  }
}

export default function EmbeddedFlyde(props: EmbeddedFlydeProps) {
  const { flow, localNodes, onChange, historyPlayer } = props;
  const [state, setState] = useState<FlowEditorState>({
    ...defaultState,
    flow,
  });
  const [resolvedDependencies, setResolvedDependencies] =
    useState<ResolvedDependencies>({});

  useEffect(() => {
    loadStdLib().then((stdlib) => {
      setResolvedDependencies({ ...stdlib, ...localNodes });
    });
  }, [localNodes]);

  useEffect(() => {
    onChange(state.flow);
  }, [onChange, state.flow]);

  const flowEditorProps: FlydeFlowEditorProps = {
    state,
    onChangeEditorState: setState,
    hideTemplatingTips: true,
    initialPadding,
    onExtractInlineNode: noop as any,
  };

  const onRequestImportables: DependenciesContextData["onRequestImportables"] =
    useCallback(async () => {
      const stdLibNodes = Object.values(
        await import("@flyde/stdlib/dist/all-browser")
      ).filter(isBaseNode) as ImportedNode[];

      const bob = stdLibNodes.map((b) => ({
        node: { ...b, source: { path: "n/a", export: "n/a" } },
        module: "@flyde/stdlib",
      }));

      const localModules = Object.values(localNodes).map((node) => ({
        node: { ...node, source: { path: "n/a", export: "n/a" } },
        module: "local",
      }));

      return {
        importables: [...bob, ...localModules],
        errors: [],
      };
    }, [localNodes]);

  const depsContextValue = useMemo<DependenciesContextData>(() => {
    return {
      resolvedDependencies,
      onImportNode: noop as any,
      onRequestImportables,
    };
  }, [resolvedDependencies, onRequestImportables]);

  const debuggerContextValue = React.useMemo<DebuggerContextData>(
    () => ({
      onRequestHistory: historyPlayer.requestHistory,
    }),
    [historyPlayer.requestHistory]
  );

  if (Object.keys(resolvedDependencies).length === 0) {
    return <Loader />;
  }

  return (
    <DependenciesContextProvider value={depsContextValue}>
      <DebuggerContextProvider value={debuggerContextValue}>
        <DynamicFlowEditor {...flowEditorProps} />
      </DebuggerContextProvider>
    </DependenciesContextProvider>
  );
}
