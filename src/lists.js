import { getExpressionLocation } from './parse'

const objectLikeEntity = {
  delimiters: ['{', '}'],
  getElementProperty: node => node.properties
}
const arrayLikeEntity = {
  delimiters: ['[', ']'],
  getElementProperty: node => node.elements
}

const listEntities = {
  ObjectExpression: objectLikeEntity,
  ObjectPattern: objectLikeEntity,
  ArrayExpression: arrayLikeEntity,
  ArrayPattern: arrayLikeEntity,
  CallExpression: {
    delimiters: ['(', ')'],
    getElementProperty: node => node.arguments,
    getLocation (expr) {
      // Arguments start right after callee identifier.
      const location = getExpressionLocation(expr)
      const { line, column } = expr.callee.loc.end
      location.line[0] = line
      location.column[0] = column
      return location
    }
  },
  ArrowFunctionExpression: {
    delimiters: ['(', ')'],
    getElementProperty: node => node.params,
    getLocation (expr) {
      // Arguments start after parens
      const location = getExpressionLocation(expr.params[0])
      const firstArgument = expr.params[0].loc.start.column
      const lastArgument = expr.params[expr.params.length - 1].loc.end.column
      // remove argument list left paren
      const startColumn = firstArgument - 1
      const endColumn = lastArgument + 1
      return { ...location, column: [startColumn, endColumn] }
    }
  },
  ImportDeclaration: {
    delimiters: ['{', '}'],
    getElementProperty: node => node.specifiers,
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
    getElementProperty: node => node.specifiers,
    getLocation (expr) {
      const location = getExpressionLocation(expr)
      // dirty hack #2: assume 'export {...list} from module'
      // 'export' + space = 7 characters
      location.column[0] += 7
      // space + 'from' + space = 6 characters
      location.column[1] = expr.source.loc.start.column - 6
      return location
    }
  },
  JSXElement: {
    delimiters: ['', '/>'],
    getElementProperty: node => node.openingElement.attributes,
    getLocation (expr) {
      const attributes = expr.openingElement.attributes
      const location = getExpressionLocation(attributes[0])
      const { line, column } = expr.loc.end
      location.line[1] = line
      location.column[1] = column - 2 // strip self closing tag '/>'
      return location
    }
  },
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
  const { getElementProperty: get } = listEntities[expression.type]
  return get(expression)
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
