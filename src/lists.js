import { getExpressionLocation } from './parse'

export function isListExpression (node) {
  return node.type === 'ObjectExpression' ||
    node.type === 'ArrayExpression' ||
    node.type === 'CallExpression' ||
    node.type === 'ImportDeclaration'
}

function isNamedImport (importNode) {
  return importNode.type !== 'ImportDefaultSpecifier'
}

export function getElements (expression, sourceCode) {
  return getElementProperty(expression)
    .filter(isNamedImport)
    .map(property => sourceCode.slice(property.start, property.end))
}

export function getElementProperty (expression) {
  if (expression.type === 'ObjectExpression') {
    return expression.properties
  }
  if (expression.type === 'ArrayExpression') {
    return expression.elements
  }
  if (expression.type === 'ImportDeclaration') {
    return expression.specifiers
  }
  // CallExpression
  return expression.arguments
}

export function getDelimiters (expression) {
  const delimiters = {
    ObjectExpression: ['{', '}'],
    ArrayExpression: ['[', ']'],
    CallExpression: ['(', ')'],
    ImportDeclaration: ['{', '}']
  }
  return delimiters[expression.type]
}

export function getListLocation (expression) {
  const changeLocation = getExpressionLocation(expression)

  if (expression.type === 'CallExpression') {
    // Arguments start right after callee identifier.
    const { line, column } = expression.callee.loc.end
    changeLocation.line[0] = line
    changeLocation.column[0] = column
  } else if (expression.type === 'ImportDeclaration') {
    const specifiers = expression.specifiers
    if (specifiers[0].type === 'ImportDefaultSpecifier') {
      // import default, { named, imports }
      const loc = specifiers[0].loc
      const importLength = loc.end.column - loc.start.column
      // ',' + space = 2 characters
      changeLocation.column[0] += importLength + 2
    }
    // dirty hack: assume 'import {...list} from module'
    // 'import' + space = 7 characters
    changeLocation.column[0] += 7
    // space + 'from' + space = 6 characters
    changeLocation.column[1] = expression.source.loc.start.column - 6
  }

  return changeLocation
}
