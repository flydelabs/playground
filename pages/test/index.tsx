import EmbeddedFlyde from "@/components/EmbeddedFlyde";
import { defaultNode } from "@/lib/defaultNode";
import { noop } from "@flyde/core";
import { useMemo } from "react";

export default function Page({}) {
  const obj = useMemo(() => ({}), []);
  return (
    <div className="w-screen h-screen">
      <EmbeddedFlyde
        flow={{ node: defaultNode }}
        onChange={noop}
        historyPlayer={{} as any}
        localNodes={obj}
      />
    </div>
  );
}
