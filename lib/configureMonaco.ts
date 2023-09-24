import flydeCoreBundledDts from "!raw-loader!../types/@flyde-core.d.ts";
import flydeRuntimeBundledDts from "!raw-loader!../types/@flyde-runtime.d.ts";

export function configureMonaco(
  monaco: typeof import("monaco-editor/esm/vs/editor/editor.api")
) {
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    flydeCoreBundledDts,
    "types/@flyde-core.d.ts"
  );

  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    flydeRuntimeBundledDts,
    "types/@flyde-runtime.d.ts"
  );

  const opts =
    monaco.languages.typescript.typescriptDefaults.getCompilerOptions();

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    ...opts,
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    module: monaco.languages.typescript.ModuleKind.ESNext,
  });
}
