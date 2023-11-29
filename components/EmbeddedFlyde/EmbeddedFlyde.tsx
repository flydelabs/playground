import { defaultNode } from "@/lib/defaultNode";
import { HistoryPlayer } from "@/lib/executeApp/createHistoryPlayer";
import {
  FlydeFlow,
  ResolvedDependencies,
  isBaseNode,
  ImportedNode,
} from "@flyde/core";
import {
  FlowEditorState,
  DependenciesContextData,
  DebuggerContextData,
  DependenciesContextProvider,
  DebuggerContextProvider,
} from "@flyde/flow-editor";
import dynamic from "next/dynamic";
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { FullPageLoader } from "../FullPageLoader";

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
    loading: () => <FullPageLoader />,
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

export function EmbeddedFlyde(props: EmbeddedFlydeProps) {
  const { flow, localNodes, onChange, historyPlayer } = props;
  const [state, setState] = useState<FlowEditorState>({
    ...defaultState,
    flow,
  });

  const { flow: stateFlow } = state;
  const [resolvedDependencies, setResolvedDependencies] =
    useState<ResolvedDependencies>({});

  useEffect(() => {
    loadStdLib().then((stdlib) => {
      setResolvedDependencies({ ...stdlib, ...localNodes });
    });
  }, [localNodes]);

  useEffect(() => {
    onChange(stateFlow);
  }, [onChange, stateFlow]);

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
    return <FullPageLoader />;
  }

  return (
    <DependenciesContextProvider value={depsContextValue}>
      <DebuggerContextProvider value={debuggerContextValue}>
        <CanvasPositioningWaitHack>
          <DynamicFlowEditor
            state={state}
            onChangeEditorState={setState}
            hideTemplatingTips={true}
            initialPadding={initialPadding}
            onExtractInlineNode={noop as any}
          />
        </CanvasPositioningWaitHack>
      </DebuggerContextProvider>
    </DependenciesContextProvider>
  );
}

// there's a fraction of a second where the nodes are not positioned correctly in the canvas. TODO - fix this mega hack
function CanvasPositioningWaitHack(props: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  return (
    <div className={`canvas-positioning-hack ${isReady ? "ready" : ""}`}>
      {props.children}
    </div>
  );
}
