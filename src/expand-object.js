import { parseCallStack, splitProperties } from './parse'

export function expandObject (sourceCode, charRange) {
  const { stack, attachedAt } = parseCallStack(sourceCode, charRange)

  const objectExpression = stack.find(node => node.type === 'ObjectExpression')

  const columnOffset = attachedAt.loc.start.column
  const paddSpace = ' '.repeat(columnOffset)
  const keys = splitProperties(
    objectExpression.properties,
    sourceCode
  ).map(p => paddSpace + '  ' + p)
  const separatedKeys = [...keys.slice(0, -1).map(k => k + ','), keys[keys.length - 1]]

  const expandedObject = ['{', ...separatedKeys, paddSpace + '}'].join('\n')

  return {
    line: [objectExpression.loc.start.line, objectExpression.loc.end.line],
    column: [objectExpression.loc.start.column, objectExpression.loc.end.column],
    code: expandedObject
  }
}
