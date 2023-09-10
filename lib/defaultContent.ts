import { AppFileType } from "@/components/AppView";
import { visualNode } from "@flyde/core";
import { defaultNode } from "./defaultNode";

export function getDefaultContent(fileName: string, type: AppFileType) {
  switch (type) {
    case AppFileType.VISUAL_FLOW:
      return JSON.stringify({ node: { ...defaultNode, id: fileName } });
    case AppFileType.CODE_FLOW:
      return `// TODO - code node here`;
    case AppFileType.CODE:
      return `// TODO - code here`;
    case AppFileType.ENTRY_POINT: {
      throw new Error("Entry point should not be created here");
    }
  }
}
