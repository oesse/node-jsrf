import { getExpressionLocation } from './parse'

const objectLikeEntity = {
  delimiters: ['{', '}'],
  elementProperty: 'properties'
}
const arrayLikeEntity = {
  delimiters: ['[', ']'],
  elementProperty: 'elements'
}

const listEntities = {
  ObjectExpression: objectLikeEntity,
  ObjectPattern: objectLikeEntity,
  ArrayExpression: arrayLikeEntity,
  ArrayPattern: arrayLikeEntity,
  CallExpression: {
    delimiters: ['(', ')'],
    elementProperty: 'arguments',
    getLocation (expr) {
      // Arguments start right after callee identifier.
      const location = getExpressionLocation(expr)
      const { line, column } = expr.callee.loc.end
      location.line[0] = line
      location.column[0] = column
      return location
    }
  },
  ImportDeclaration: {
    delimiters: ['{', '}'],
    elementProperty: 'specifiers',
    getLocation (expr) {
      const location = getExpressionLocation(expr)
      const specifiers = expr.specifiers
      if (specifiers[0].type === 'ImportDefaultSpecifier') {
        // import default, { named, imports }
        const loc = specifiers[0].loc
        const importLength = loc.end.column - loc.start.column
        // ',' + space = 2 characters
        location.column[0] += importLength + 2
      }
      // dirty hack: assume 'import {...list} from module'
      // 'import' + space = 7 characters
      location.column[0] += 7
      // space + 'from' + space = 6 characters
      location.column[1] = expr.source.loc.start.column - 6
      return location
    }
  },
  ExportNamedDeclaration: {
    delimiters: ['{', '}'],
    elementProperty: 'specifiers',
    getLocation (expr) {
      const location = getExpressionLocation(expr)
      // dirty hack #2: assume 'export {...list} from module'
      // 'export' + space = 7 characters
      location.column[0] += 7
      // space + 'from' + space = 6 characters
      location.column[1] = expr.source.loc.start.column - 6
      return location
    }
  }
}

export function isListExpression (node) {
  return typeof listEntities[node.type] !== 'undefined'
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
  const { elementProperty } = listEntities[expression.type]
  return expression[elementProperty]
}

export function getDelimiters (expression) {
  const { delimiters } = listEntities[expression.type]
  return delimiters
}

export function getListLocation (expression) {
  const { getLocation } = listEntities[expression.type]
  if (getLocation) {
    return getLocation(expression)
  }

  return getExpressionLocation(expression)
}
