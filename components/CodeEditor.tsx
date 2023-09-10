"use client";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

import useSize from "@react-hook/size";
import { useRef } from "react";

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CodeEditor(props: CodeEditorProps) {
  const target = useRef(null);
  const [height] = useSize(target);
  return (
    <div ref={target}>
      <CodeMirror
        value={props.value}
        height={`${height}px`}
        extensions={[javascript({ typescript: true })]}
        onChange={props.onChange}
      />
    </div>
  );
}
