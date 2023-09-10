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
import { use, useCallback, useEffect, useMemo, useState } from "react";
import React from "react";
import dynamic from "next/dynamic";
import { defaultNode } from "@/lib/defaultNode";
import {
  BaseNode,
  FlydeFlow,
  ImportedNode,
  Node,
  ResolvedDependencies,
  VisualNode,
  isBaseNode,
} from "@flyde/core";
import type { AppFile } from "./AppView";

export interface EmbeddedFlydeProps {
  flow: FlydeFlow;
  onChange: (flow: FlydeFlow) => void;
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
}

export type Maybe<T> =
  | { type: "ok"; data: T }
  | { type: "error"; error: Error };

function safeParse(content: string): Maybe<FlydeFlow> {
  try {
    return { type: "ok", data: JSON.parse(content) };
  } catch (e) {
    return {
      type: "error",
      error: e as Error,
    };
  }
}

export function EmbeddedFlydeFileWrapper(props: EmbeddedFlydeFileWrapperProps) {
  const { content, onFileChange } = props;
  const [flow, setFlow] = useState<FlydeFlow>();

  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    console.log("changed content!");
    const parsed = safeParse(content);
    if (parsed.type === "ok") {
      console.log("parsed.data", parsed.data.node);
      setFlow(parsed.data);
    } else {
      setError(parsed.error);
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
      <EmbeddedFlyde key={props.fileName} flow={flow} onChange={onChange} />
    );
  } else if (error) {
    return <p>Error parsing Flyde: {error?.message}</p>;
  } else {
    return <Loader />;
  }
}

export default function EmbeddedFlyde(props: EmbeddedFlydeProps) {
  const [state, setState] = useState<FlowEditorState>({
    ...defaultState,
    flow: props.flow,
  });
  const [resolvedDependencies, setResolvedDependencies] =
    useState<ResolvedDependencies>({});

  useEffect(() => {
    loadStdLib().then((std) => {
      setResolvedDependencies(std);
    });
  }, []);

  useEffect(() => {
    props.onChange(state.flow);
  }, [state.flow]);

  const flowEditorProps: FlydeFlowEditorProps = {
    state,
    onChangeEditorState: setState,
    hideTemplatingTips: true,
    initialPadding,
    onExtractInlineNode: noop as any,
    disableScrolling: true,
  };

  const onRequestImportables: DependenciesContextData["onRequestImportables"] =
    useCallback(async () => {
      const nodes = Object.values(
        await import("@flyde/stdlib/dist/all-browser")
      ).filter(isBaseNode) as ImportedNode[];
      return {
        importables: nodes.map((b) => ({
          node: { ...b, source: { path: "n/a", export: "n/a" } },
          module: "@flyde/stdlib",
        })),
        errors: [],
      };
    }, []);

  const depsContextValue = useMemo<DependenciesContextData>(() => {
    return {
      resolvedDependencies,
      onImportNode: noop as any,
      onRequestImportables,
    };
  }, [resolvedDependencies]);

  const debuggerContextValue = React.useMemo<DebuggerContextData>(
    () => ({
      onRequestHistory: () => Promise.resolve({ lastSamples: [], total: 0 }),
      // debuggerClient: ,
    }),
    []
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
