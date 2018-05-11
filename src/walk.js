import * as walk from 'acorn/dist/walk'

const JsxContinuations = {
  JSXAttribute: (node, st, c) => node.argument && c(node.argument.value, st, 'Expression'),
  JSXExpressionContainer: (node, st, c) => c(node.expression, st, 'Expression'),
  JSXEmptyExpression: () => {},
  JSXSpreadAttribute: (node, st, c) => c(node.argument, st, 'Expression'),
  JSXElement: (node, st, c) => {
    for (const attribute of node.openingElement.attributes) {
      c(attribute, st, attribute.type)
    }
    for (const child of node.children) {
      if (child.type !== 'JSXText') { c(child, st, 'Expression') }
    }
  }
}

export default (ast, visitor) => {
  const walkingState = {}
  walk.ancestor(
    ast,
    visitor,
    {
      ...walk.base,
      ...JsxContinuations,
      SpreadProperty: (node, st, c) => c(node.argument, st, 'Expression')
    },
    walkingState
  )
  return walkingState.ancestors
}
