import { getExpressionRange } from './parse'

export function isListExpression (node) {
  return node.type === 'ObjectExpression' ||
    node.type === 'ArrayExpression' ||
    node.type === 'CallExpression'
}

export function getElements (expression, sourceCode) {
  return getElementProperty(expression)
    .map(property => sourceCode.slice(property.start, property.end))
}

export function getElementProperty (expression) {
  if (expression.type === 'ObjectExpression') {
    return expression.properties
  }
  if (expression.type === 'ArrayExpression') {
    return expression.elements
  }
  return expression.arguments
}

export function getDelimiters (expression) {
  const delimiters = {
    ObjectExpression: ['{', '}'],
    ArrayExpression: ['[', ']'],
    CallExpression: ['(', ')']
  }
  return delimiters[expression.type]
}

export function getListRange (expression) {
  const changeLocation = getExpressionRange(expression)

  if (expression.type === 'CallExpression') {
    // Arguments start right after callee identifier.
    const { line, column } = expression.callee.loc.end
    changeLocation.line[0] = line
    changeLocation.column[0] = column
  }

  return changeLocation
}
