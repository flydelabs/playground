import { AppData, AppFileType } from "@/components/AppView";

import {
  ResolvedDependencies,
  simplifiedExecute,
  Debugger,
  isBaseNode,
} from "@flyde/core";

import * as stdlib from "@flyde/stdlib/dist/all-browser";
import { transpileFile } from "../transpileFile/transpileFile";

function ensureFakeModulesOnWindow(
  app: AppData,
  deps: ResolvedDependencies,
  _debugger: Debugger
) {
  const windowAny = window as any;

  const fakeRuntime = {
    loadFlow: (path: string) => {
      const maybeFile = app.files.find(
        (file) => file.name + "." + file.type === path
      );

      if (!maybeFile) {
        throw new Error(`Flow not found: ${path}`);
      }

      const flow = JSON.parse(maybeFile.content);

      return (inputs: any, params: any = {}) => {
        const { onOutputs, ...otherParams } = params;

        let destroy;
        const promise: any = new Promise(async (res, rej) => {
          // const _debugger =
          //   otherParams._debugger ||
          //   (await createDebugger(debuggerUrl, fullFlowPath));

          // debugLogger("Using debugger %o", _debugger);
          const fixedStdlib = Object.entries(stdlib).reduce(
            (acc, [key, val]) => {
              if (isBaseNode(val)) {
                acc[val.id] = val;
                return acc;
              } else {
                return acc;
              }
            },
            {} as any
          );
          destroy = await simplifiedExecute(
            flow.node,
            { ...fixedStdlib, ...deps } as any,
            inputs ?? {},
            onOutputs,
            {
              _debugger,
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

export function executeApp(
  app: AppData,
  deps: ResolvedDependencies,
  _debugger: Debugger
) {
  ensureFakeModulesOnWindow(app, deps, _debugger);

  const entry = app.files.find((file) => file.type === AppFileType.ENTRY_POINT);

  if (!entry) {
    throw new Error("No entry point found");
  }

  const transpileOutput = transpileFile(
    entry.name + "." + entry.type,
    entry.content
  );

  const codeToRun = `async () => {
    ${transpileOutput}
  }`;

  eval(codeToRun)();
}
