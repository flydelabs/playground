import { AppData, AppFileType } from "@/components/AppView";
import ts from "typescript";
import { importToGlobalTransformer } from "./tsTransformer";

import { simplifiedExecute } from "@flyde/core";

import * as stdlib from "@flyde/stdlib/dist/all-browser";
import { exportToGlobalTransformer } from "./exportsTransformer";

function ensureFakeModulesOnWindow(app: AppData) {
  const windowAny = window as any;

  const fakeRuntime = {
    loadFlow: (path: string) => {
      console.log(
        path,
        app.files.map((f) => f.name + f.type)
      );
      const maybeFile = app.files.find(
        (file) => file.name + "." + file.type === path
      );

      if (!maybeFile) {
        throw new Error(`Flow not found: ${path}`);
      }

      const flow = JSON.parse(maybeFile.content);
      console.info("Loaded flow:", flow);

      return (inputs: any, params: any = {}) => {
        const { onOutputs, ...otherParams } = params;

        let destroy;
        const promise: any = new Promise(async (res, rej) => {
          // const _debugger =
          //   otherParams._debugger ||
          //   (await createDebugger(debuggerUrl, fullFlowPath));

          // debugLogger("Using debugger %o", _debugger);
          console.log("NODE", flow.node);
          destroy = await simplifiedExecute(
            flow.node,
            stdlib as any,
            inputs ?? {},
            onOutputs,
            {
              // _debugger: _debugger,
              onCompleted: (data) => {
                void (async function () {
                  // if (_debugger && _debugger.destroy) {
                  //   await _debugger.destroy();
                  // }
                  res(data);
                })();
              },
              onBubbleError: (err) => {
                console.error("Error in flow", err);
                rej(err);
              },
              ...otherParams,
            }
          );
        }) as any;
        return { result: promise, destroy };
      };
    },
  };

  windowAny.__modules = {
    ["@flyde/runtime"]: fakeRuntime,
  };
}

export function transpileFile(fileName: string, content: string) {
  const transpileOutput = ts.transpileModule(content, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    transformers: {
      before: [
        exportToGlobalTransformer(fileName),
        importToGlobalTransformer(),
      ],
    },
  });

  return transpileOutput.outputText.replace(/export\s*{\s*};\s*/g, "");
}

export function executeApp(app: AppData) {
  ensureFakeModulesOnWindow(app);

  const entry = app.files.find((file) => file.type === AppFileType.ENTRY_POINT);

  if (!entry) {
    throw new Error("No entry point found");
  }

  const codeNode = app.files.find(
    (file) => file.type === AppFileType.CODE_FLOW
  );

  if (codeNode) {
    const t = transpileFile(
      codeNode.name + "." + codeNode.type,
      codeNode.content
    );
    console.info("CODE: Code to run:");
    console.info(t);
    console.info("CODE: End code to run");
  }

  const transpileOutput = transpileFile(
    entry.name + "." + entry.type,
    entry.content
  );

  const codeToRun = `(async function executeApp() {
    ${transpileOutput}
  })()`;

  console.info("Code to run:", codeToRun);

  eval(codeToRun);
}
