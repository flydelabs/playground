import * as ts from "typescript";

// Define the transformer function
function importToGlobalTransformer<
  T extends ts.Node
>(): ts.TransformerFactory<T> {
  return (context) => {
    const visit: ts.Visitor = (node) => {
      if (ts.isImportDeclaration(node)) {
        const moduleName = node.moduleSpecifier.getText().slice(1, -1); // Remove quotes
        const importSpecifiers = node.importClause
          ?.namedBindings as ts.NamedImports;

        if (importSpecifiers) {
          const declarations = importSpecifiers.elements.map((el) => {
            const name = el.name.getText();
            return ts.createVariableDeclaration(
              name,
              undefined,
              ts.createPropertyAccess(
                ts.createPropertyAccess(
                  ts.createIdentifier("window"),
                  ts.createIdentifier("__modules")
                ),
                ts.createLiteral(moduleName)
              )
            );
          });

          return ts.createVariableStatement(
            undefined,
            ts.createVariableDeclarationList(declarations, ts.NodeFlags.Const)
          );
        }
      }
      return ts.visitEachChild(node, visit, context);
    };
    return (node) => ts.visitNode(node, visit);
  };
}

// Sample TypeScript code with imports
const code = `import { loadFlow } from '@flyde/runtime';`;

// Transpile TypeScript code to JavaScript
const { outputText } = ts.transpileModule(code, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
  transformers: { before: [importToGlobalTransformer()] },
});

console.log(outputText);
