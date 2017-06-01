import { parseCallStack } from './parse'

export function extractVariable (sourceCode, charRange, varName) {
  const { stack, attachedAt } = parseCallStack(sourceCode, charRange)

  const exprLocation = stack[0].loc

  const varDeclaration = `const ${varName} = ${sourceCode.substring(stack[0].start, stack[0].end)}\n`
  const paddedVarDeclaration = varDeclaration + ' '.repeat(attachedAt.loc.start.column)

  return [
    {
      line: [exprLocation.start.line, exprLocation.end.line],
      column: [exprLocation.start.column, exprLocation.end.column],
      code: varName
    },
    {
      line: [attachedAt.loc.start.line, attachedAt.loc.start.line],
      column: [attachedAt.loc.start.column, attachedAt.loc.start.column],
      code: paddedVarDeclaration
    }
  ]
}
