import { expect } from 'chai'
import { parse } from '../src/parse'

describe('parse', () => {
  it('returns an abstract syntax tree from valid source code', () => {
    const code = 'function foo() { return 123 }'
    const ast = parse(code)
    expect(ast.type).to.eql('Program')
  })

  it('parses ES7 async/await syntax', () => {
    const code = 'async function foo() { return await bar() }'
    const ast = parse(code)
    expect(ast.type).to.eql('Program')
  })

  it('parses the stage-2 object spread operator', () => {
    const code = 'const foo = { ...bar, x: \'x\' }'
    const ast = parse(code)
    expect(ast.type).to.eql('Program')
  })

  it('parses the react jsx syntax', () => {
    const code = 'const foo = <Bar {...props} />'
    const ast = parse(code)
    expect(ast.type).to.eql('Program')
  })
})
