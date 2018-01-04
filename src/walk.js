import * as walk from 'acorn/dist/walk'

export default (ast, visitor) => {
  const found = {}
  walk.ancestor(
    ast,
    visitor,
    {
      ...walk.base,
      SpreadProperty: (node, st, c) => c(node.argument, st, 'Expression'),
      JSXAttribute: (node, st, c) => node.argument && c(node.argument.value, st, 'Expression'),
      JSXExpressionContainer: (node, st, c) => c(node.expression, st, 'Expression'),
      JSXEmptyExpression: () => {},
      JSXElement: (node, st, c) => {
        for (const attribute of node.openingElement.attributes) {
          c(attribute, st, 'JSXAttribute') 
        }
        for (const child of node.children) { 
          if (child.type !== 'JSXText') { c(child, st, 'Expression') }
        }
      },
    },
    found
  )
  return found.ancestors
}
