import { ResolvedDependencies } from "@flyde/core";

export async function loadStdLib(): Promise<ResolvedDependencies> {
  return Object.values(await import("@flyde/stdlib/dist/all-browser"))
    .filter(isBaseNode)
    .reduce<ResolvedDependencies>((acc, node: any) => {
      acc[node.id] = node;
      return acc;
    }, {});
}
