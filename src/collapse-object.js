import { parseCallStack } from './parse'

function splitProperties (properties, sourceCode) {
  return properties.map(property => sourceCode.slice(property.start, property.end))
}

export function collapseObject (sourceCode, charRange) {
  const { stack } = parseCallStack(sourceCode, charRange)
  const [objectExpression] = stack

  const collapsedCode = `{ ${splitProperties(objectExpression.properties, sourceCode).join(', ')} }`

  return {
    line: [objectExpression.loc.start.line, objectExpression.loc.end.line],
    column: [objectExpression.loc.start.column, objectExpression.loc.end.column],
    code: collapsedCode
  }
}
