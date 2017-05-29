import { expandObject } from '../src'
import { expect } from 'chai'

describe('expandObject', () => {
  it('returns change set with each key-value pair on a single line', () => {
    const sourceCode = 'const foo = { a: \'a\' }'
    const charRange = [12, 22]
    const diff = expandObject(sourceCode, charRange)

    expect(diff).to.eql({ line: [1, 1], column: [12, 22], code: '{\n  a: \'a\'\n}' })
  })
})
