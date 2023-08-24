"use client";

import "@flyde/flow-editor/src/index.scss";
import {
  FlowEditor,
  FlowEditorState,
  FlydeFlowEditorProps,
} from "@flyde/flow-editor";
import { useState } from "react";
import React from "react";

export interface EmbeddedFlydeProps {}

const noop = () => {};

const initialPadding = [10, 10] as [number, number];

console.log("version", React.version);

export default function EmbeddedFlyde(props: EmbeddedFlydeProps) {
  const [state, setState] = useState<FlowEditorState>({
    flow: {
      node: {
        id: "root",
        connections: [],
        instances: [],
        inputs: {},
        outputs: {},
        inputsPosition: {},
        outputsPosition: {},
      },
    },
    boardData: {
      viewPort: {
        pos: { x: 0, y: 0 },
        zoom: 1,
      },
      selected: [],
      lastMousePos: { x: 0, y: 0 },
    },
  });
  const flowEditorProps: FlydeFlowEditorProps = {
    state,
    onChangeEditorState: setState,
    hideTemplatingTips: true,
    initialPadding,
    onExtractInlineNode: noop as any,
    disableScrolling: true,
  };

  return <FlowEditor {...flowEditorProps} />;
}
