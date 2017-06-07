import { parseCallStack, splitProperties } from './parse'

function isExpandable (node) {
  return node.type === 'ObjectExpression' ||
    node.type === 'ArrayExpression' ||
    node.type === 'CallExpression'
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
  if (expression.type === 'ArrayExpression') {
    return expression.elements
  }
  return expression.arguments
}

function expandElements (expression, sourceCode) {
  const delimiters = {
    ObjectExpression: ['{', '}'],
    ArrayExpression: ['[', ']'],
    CallExpression: ['(', ')']
  }
  const [leftDelim, rightDelim] = delimiters[expression.type]
  const keys = splitProperties(getElements(expression), sourceCode)
  return [leftDelim, ...paddedCommaList(2, keys), rightDelim]
}

function getColumnOffset (stack, idx) {
  // if list starts on a line of its own, it has its own indentation level
  const line = stack[idx].loc.start.line
  const attachedIdx = stack.slice(idx).findIndex(node => node.loc.start.line < line) + idx - 1

  if (attachedIdx < 0) {
    return null
  }

  const location = stack[attachedIdx].loc
  // first line means indentation of root node
  if (location.start.line === 1) {
    return null
  }

  return location.start.column
}

export function expand (sourceCode, charRange) {
  const { stack, attachedAt } = parseCallStack(sourceCode, charRange)

  const idx = stack.findIndex(isExpandable)
  const expandableExpression = stack[idx]

  const columnOffset = getColumnOffset(stack, idx) || attachedAt.loc.start.column

  const elements = expandElements(expandableExpression, sourceCode)
  const padding = ' '.repeat(columnOffset)
  const code = [elements[0], ...elements.slice(1).map(e => `${padding}${e}`)].join('\n')

  const changeLocation = expressionRange(expandableExpression)

  if (expandableExpression.type === 'CallExpression') {
    // Arguments start right after callee identifier.
    const { line, column } = expandableExpression.callee.loc.end
    changeLocation.line[0] = line
    changeLocation.column[0] = column
  }

  return {
    ...changeLocation,
    code
  }
}
