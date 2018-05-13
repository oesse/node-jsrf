import { parseCallStack } from './parse'
import { isListExpression, getElements, getDelimiters, getListLocation } from './lists'

function paddedCommaList (offset, separator, list) {
  const padding = ' '.repeat(offset)
  const padded = e => `${padding}${e}`
  const separated = e => `${e}${separator}`
  const last = list[list.length - 1]
  return [...list.slice(0, -1).map(e => padded(separated(e))), padded(last)]
}

function expandElements (expression, sourceCode) {
  const [leftDelim, rightDelim, separator] = getDelimiters(expression)
  const keys = getElements(expression, sourceCode)
  return [leftDelim, ...paddedCommaList(2, separator, keys), rightDelim]
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

  const idx = stack.findIndex(isListExpression)
  const expandableExpression = stack[idx]

  const columnOffset = getColumnOffset(stack, idx) || attachedAt.loc.start.column

  const elements = expandElements(expandableExpression, sourceCode)
  const padding = ' '.repeat(columnOffset)
  const code = [elements[0], ...elements.slice(1).map(e => `${padding}${e}`)].join('\n')

  const changeLocation = getListLocation(expandableExpression)

  return {
    ...changeLocation,
    code
  }
}
