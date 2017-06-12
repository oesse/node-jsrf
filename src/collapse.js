import { parseCallStack, splitProperties } from './parse'
import { isListExpression, getElements, getDelimiters } from './lists'

export function collapse (sourceCode, charRange) {
  const { stack } = parseCallStack(sourceCode, charRange)

  const expression = stack.find(isListExpression)

  const [left, right] = getDelimiters(expression)
  const collapsedCode = `${left} ${splitProperties(getElements(expression), sourceCode).join(', ')} ${right}`

  return {
    line: [expression.loc.start.line, expression.loc.end.line],
    column: [expression.loc.start.column, expression.loc.end.column],
    code: collapsedCode
  }
}
