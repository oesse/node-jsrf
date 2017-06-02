import { parseCallStack, splitProperties } from './parse'

export function collapseObject (sourceCode, charRange) {
  const { stack } = parseCallStack(sourceCode, charRange)

  const objectExpression = stack.find(node => node.type === 'ObjectExpression')

  const collapsedCode = `{ ${splitProperties(objectExpression.properties, sourceCode).join(', ')} }`

  return {
    line: [objectExpression.loc.start.line, objectExpression.loc.end.line],
    column: [objectExpression.loc.start.column, objectExpression.loc.end.column],
    code: collapsedCode
  }
}
