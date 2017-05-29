import { expandObject } from '../src'
import { expect } from 'chai'

describe('expandObject', () => {
  it('returns change set with line and column range and replacement code', () => {
    const sourceCode = 'const foo = { a: \'a\' }'
    const charRange = [12, 22]
    const diff = expandObject(sourceCode, charRange)

    expect(diff).to.have.property('line')
    expect(diff).to.have.property('column')
    expect(diff).to.have.property('code')
  })

  describe('change set', () => {
    it('defines the range (lines, columns) of the object to be expanded', () => {
      const sourceCode = 'const foo = { a: \'a\' }'
      const charRange = [12, 22]
      const diff = expandObject(sourceCode, charRange)

      expect(diff).to.have.property('line')
        .to.eql([1, 1])
      expect(diff).to.have.property('column')
        .to.eql([12, 22])
    })

    it('has object property on a single line', () => {
      const sourceCode = 'const foo = { a: \'a\' }'
      const charRange = [12, 22]
      const diff = expandObject(sourceCode, charRange)

      expect(diff).to.have.property('code', '{\n  a: \'a\'\n}')
    })

    it('puts multiple properties each on a line of their own', () => {
      const sourceCode = 'const foo = { a: \'a\', b: \'b\' }'
      const charRange = [12, 22]
      const diff = expandObject(sourceCode, charRange)

      expect(diff).to.have.property('code', '{\n  a: \'a\',\n  b: \'b\'\n}')
    })
  })
})
