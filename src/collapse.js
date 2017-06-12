import { parseCallStack, splitProperties, getExpressionRange } from './parse'
import { isListExpression, getElements, getDelimiters } from './lists'

export function collapse (sourceCode, charRange) {
  const { stack } = parseCallStack(sourceCode, charRange)

  const expression = stack.find(isListExpression)

  const [left, right] = getDelimiters(expression)
  const elements = splitProperties(getElements(expression), sourceCode).join(', ')
  let collapsedCode = `${left} ${elements} ${right}`

  const changeLocation = getExpressionRange(expression)
  if (expression.type === 'CallExpression') {
    // Arguments start right after callee identifier.
    const { line, column } = expression.callee.loc.end
    changeLocation.line[0] = line
    changeLocation.column[0] = column

    collapsedCode = `${left}${elements}${right}`
  }

  return {
    ...changeLocation,
    code: collapsedCode
  }
}
