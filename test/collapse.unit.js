import { expect } from 'chai'

import { collapse } from '../src/collapse'

describe('collapse', () => {
  it('returns change set with line and column range and replacement code', () => {
    const sourceCode = 'const foo = {\n  a: \'a\'\n}'
    const charRange = [12, 12]
    const diff = collapse(sourceCode, charRange)

    expect(diff)
      .to.have.property('line')
      .which.is.an('Array')
      .that.has.length(2)
    expect(diff)
      .to.have.property('column')
      .which.is.an('Array')
      .that.has.length(2)
    expect(diff)
      .to.have.property('code')
      .which.is.a('String')
  })

  context('an object literal', () => {
    it('puts the object literal on a single line', () => {
      const sourceCode = 'const foo = {\n  a: \'a\'\n}'
      const charRange = [12, 12]
      const diff = collapse(sourceCode, charRange)

      expect(diff.line).to.eql([1, 3])
      expect(diff.column).to.eql([12, 1])
      expect(diff.code).to.eql('{ a: \'a\' }')
    })

    it('puts multiple properties on a single line', () => {
      const sourceCode = 'const foo = {\n a: \'a\',\n b: \'b\'\n}'
      const charRange = [12, 12]
      const diff = collapse(sourceCode, charRange)

      expect(diff).to.have.property('code', '{ a: \'a\', b: \'b\' }')
    })

    it('collapses closest enclosing object literal', () => {
      const sourceCode = 'const foo = {\n  a: \'a\',\n  b: \'b\'\n}'
      const charRange = [22, 22]
      const diff = collapse(sourceCode, charRange)

      expect(diff).to.have.property('code', '{ a: \'a\', b: \'b\' }')
    })
  })

  context('an array literal', () => {
    it('puts the array literal on a single line', () => {
      const sourceCode = 'const foo = [\n  a\n]'
      const charRange = [12, 12]
      const diff = collapse(sourceCode, charRange)

      expect(diff.line).to.eql([1, 3])
      expect(diff.column).to.eql([12, 1])
      expect(diff.code).to.eql('[ a ]')
    })
  })
})
