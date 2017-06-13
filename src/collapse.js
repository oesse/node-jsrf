import { parseCallStack } from './parse'
import { isListExpression, getElements, getDelimiters, getListLocation } from './lists'

export function collapse (sourceCode, charRange) {
  const { stack } = parseCallStack(sourceCode, charRange)

  const expression = stack.find(isListExpression)

  const [left, right] = getDelimiters(expression)
  const elements = getElements(expression, sourceCode).join(', ')
  let collapsedCode = `${left} ${elements} ${right}`

  const changeLocation = getListLocation(expression)

  if (expression.type === 'CallExpression') {
    collapsedCode = `${left}${elements}${right}`
  }

  return {
    ...changeLocation,
    code: collapsedCode
  }
}
