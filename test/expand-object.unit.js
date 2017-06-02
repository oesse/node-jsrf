import { expect } from 'chai'

import { expandObject } from '../src/expand-object'

describe('expandObject', () => {
  it('returns change set with line and column range and replacement code', () => {
    const sourceCode = 'const foo = { a: \'a\' }'
    const charRange = [12, 22]
    const diff = expandObject(sourceCode, charRange)

    expect(diff).to.have.property('line')
    expect(diff).to.have.property('column')
    expect(diff).to.have.property('code')
  })

  it('puts the property key and value of a single line object literal on its own line', () => {
    const sourceCode = 'const foo = { a: \'a\' }'
    const charRange = [12, 22]
    const diff = expandObject(sourceCode, charRange)

    expect(diff).to.have.property('line')
      .to.eql([1, 1])
    expect(diff).to.have.property('column')
      .to.eql([12, 22])
    expect(diff).to.have.property('code', '{\n  a: \'a\'\n}')
  })

  it('puts multiple properties each on a line of their own', () => {
    const sourceCode = 'const foo = { a: \'a\', b: \'b\' }'
    const charRange = [12, 22]
    const diff = expandObject(sourceCode, charRange)

    expect(diff).to.have.property('code', '{\n  a: \'a\',\n  b: \'b\'\n}')
  })

  it('expands closest enclosing object literal', () => {
    const sourceCode = 'const foo = { a: \'a\', b: \'b\' }'
    const charRange = [17, 17]
    const diff = expandObject(sourceCode, charRange)

    expect(diff).to.have.property('code', '{\n  a: \'a\',\n  b: \'b\'\n}')
  })
})
