import * as walk from 'acorn/dist/walk'
import * as acorn from 'acorn'
import acornEs7Plugin from 'acorn-es7-plugin'

acornEs7Plugin(acorn)

function nodeStackOfExpression (ast, start, end) {
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

  const visitor = makeVisitor(['Expression'], start, end)

  const found = {}
  walk.ancestor(ast, visitor, walk.base, found)

  found.ancestors.reverse()
  return found.ancestors
}

export function parse (sourceCode) {
  const ast = acorn.parse(sourceCode, {
    locations: true,
    sourceType: 'module',
    plugins: { asyncawait: true },
    ecmaVersion: 8
  })
  return ast
}

export function extractVariableFromRange (sourceCode, charRange, varName) {
  const [start, end] = charRange
  const stack = nodeStackOfExpression(parse(sourceCode), start, end)
  const enclIdx = stack.findIndex(node => !!node.body)
  const attachedAt = stack[enclIdx].body.find(node => node === stack[enclIdx - 1])

  const exprLocation = stack[0].loc

  const varDeclaration = `const ${varName} = ${sourceCode.substring(stack[0].start, stack[0].end)}\n`
  const paddedVarDeclaration = varDeclaration + ' '.repeat(attachedAt.loc.start.column)

  return [
    {
      line: [exprLocation.start.line, exprLocation.end.line],
      column: [exprLocation.start.column, exprLocation.end.column],
      code: varName
    },
    {
      line: [attachedAt.loc.start.line, attachedAt.loc.start.line],
      column: [attachedAt.loc.start.column, attachedAt.loc.start.column],
      code: paddedVarDeclaration
    }
  ]
}
