import * as acorn from 'acorn'
import acornObjectSpreadPlugin from 'acorn-object-rest-spread/inject'
import acornEs7Plugin from 'acorn-es7-plugin'
import acornJsxPlugin from 'acorn-jsx/inject'

import walk from './walk'

const flow = fns => data => fns.reduce((v, fn) => fn(v), data)

const parser = flow([
  acornObjectSpreadPlugin,
  acornEs7Plugin,
  acornJsxPlugin
])(acorn)

export function parse (sourceCode) {
  const ast = parser.parse(sourceCode, {
    locations: true,
    sourceType: 'module',
    plugins: {
      objectRestSpread: true,
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

  return walk(ast, visitor).reverse()
}

export function getExpressionLocation (expr) {
  return {
    line: [expr.loc.start.line, expr.loc.end.line],
    column: [expr.loc.start.column, expr.loc.end.column]
  }
}
