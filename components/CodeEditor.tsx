"use client";

import useSize from "@react-hook/size";
import { useCallback, useEffect, useRef } from "react";
import { Editor, useMonaco } from "@monaco-editor/react";

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CodeEditor({ onChange, value }: CodeEditorProps) {
  const target = useRef(null);
  const [height] = useSize(target);

  const _onChange = useCallback((value: string | undefined) => {
    onChange(value ?? "");
  }, []);

  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      // console.log({ flydeCoreBundledDts, flydeRuntimeBundledDts });

      (window as any).monaco = monaco;
    }
  }, [monaco]);

  return (
    // <div ref={target}>
    //   {/* <CodeMirror
    //     value={props.value}
    //     height={`${height}px`}
    //     extensions={[javascript({ typescript: true })]}
    //     onChange={props.onChange}
    //   /> */}
    <Editor
      // height="90vh"
      className="pt-2"
      defaultLanguage="typescript"
      defaultValue={value}
      onChange={_onChange}
      options={{ minimap: { enabled: false } }}
      // onValidate={handleEditorValidation}
    />
    // </div>
  );
}
