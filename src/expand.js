import { parseCallStack, splitProperties } from './parse'

function isExpandable (node) {
  return node.type === 'ObjectExpression' || node.type === 'ArrayExpression'
}

function expressionRange (expr) {
  return {
    line: [expr.loc.start.line, expr.loc.end.line],
    column: [expr.loc.start.column, expr.loc.end.column]
  }
}

function paddedCommaList (offset, list) {
  const padding = ' '.repeat(offset)
  const padded = e => `${padding}${e}`
  const commad = e => `${e},`
  const last = list[list.length - 1]
  return [...list.slice(0, -1).map(e => padded(commad(e))), padded(last)]
}

function getElements (expression) {
  if (expression.type === 'ObjectExpression') {
    return expression.properties
  }
  return expression.elements
}

function expandElements (expression, sourcecode) {
  const delimiters = {
    ObjectExpression: ['{', '}'],
    ArrayExpression: ['[', ']']
  }
  const [leftDelim, rightDelim] = delimiters[expression.type]
  const keys = splitProperties(getElements(expression), sourcecode)
  return [leftDelim, ...paddedCommaList(2, keys), rightDelim]
}

export function expand (sourceCode, charRange) {
  const { stack, attachedAt } = parseCallStack(sourceCode, charRange)

  const columnOffset = attachedAt.loc.start.column
  const expandableExpression = stack.find(isExpandable)

  const elements = expandElements(expandableExpression, sourceCode)
  const padding = ' '.repeat(columnOffset)
  const code = [elements[0], ...elements.slice(1).map(e => `${padding}${e}`)].join('\n')

  return {
    ...expressionRange(expandableExpression),
    code
  }
}
