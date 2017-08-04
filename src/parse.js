import * as walk from 'acorn/dist/walk'
import * as acorn from 'acorn-object-spread'
import acornEs7Plugin from 'acorn-es7-plugin'
import acornJsxPlugin from 'acorn-jsx/inject'

acornEs7Plugin(acorn)
acornJsxPlugin(acorn)

export function parse (sourceCode) {
  const ast = acorn.parse(sourceCode, {
    locations: true,
    sourceType: 'module',
    plugins: {
      objectSpread: true,
      asyncawait: true,
      jsx: true
    },
    ecmaVersion: 8
  })
  return ast
}

export function parseCallStack (sourceCode, charRange) {
  const [start, end] = charRange
  const ast = parse(sourceCode)
  const stack = getNodeStack(ast, start, end)
  const enclIdx = stack.findIndex(node => node.type !== 'ArrowFunctionExpression' && !!node.body)
  const attachedAt = stack[enclIdx].body.find(node => node === stack[enclIdx - 1])
  return { stack, attachedAt }
}

function getNodeStack (ast, start, end) {
  const makeVisitor = (nodeTypes, start, end) => {
    let found = false

    const visitor = {}
    for (const type of nodeTypes) {
      visitor[type] = (node, state, ancestors) => {
        if (!found && node.start <= start && node.end >= end) {
          found = true
          state.node = node
          state.ancestors = [...ancestors]
        }
      }
    }
    return visitor
  }

  const typesToVisit = [
    'Expression',
    'ImportDeclaration',
    'ExportNamedDeclaration',
    'ObjectPattern',
    'ArrayPattern'
  ]
  const visitor = makeVisitor(typesToVisit, start, end)

  const found = {}
  walk.ancestor(
    ast,
    visitor,
    { ...walk.base, SpreadProperty: (node, st, c) => c(node.argument, st, 'Expression') },
    found
  )

  found.ancestors.reverse()
  return found.ancestors
}

export function getExpressionLocation (expr) {
  return {
    line: [expr.loc.start.line, expr.loc.end.line],
    column: [expr.loc.start.column, expr.loc.end.column]
  }
}
