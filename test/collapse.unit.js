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

    it('works with jsx', () => {
      const sourceCode = 'function component() {\n  const foo = {\n    a: \'a\'\n  }\nreturn <div />\n}'
      const charRange = [45, 45]
      const diff = collapse(sourceCode, charRange)

      expect(diff).to.have.property('code', '{ a: \'a\' }')
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

    it('puts multiple elements on a single line', () => {
      const sourceCode = 'const foo = [\n  a,\n  b\n]'
      const charRange = [12, 12]
      const diff = collapse(sourceCode, charRange)

      expect(diff.line).to.eql([1, 4])
      expect(diff.column).to.eql([12, 1])
      expect(diff.code).to.eql('[ a, b ]')
    })
  })

  context('a function argument list', () => {
    it('puts a single argument on the same line as the parens', () => {
      const sourceCode = 'foo(\n  a\n)'
      const charRange = [3, 3]
      const diff = collapse(sourceCode, charRange)

      expect(diff.line).to.eql([1, 3])
      expect(diff.column).to.eql([3, 1])
      expect(diff.code).to.eql('(a)')
    })

    it('puts multiple arguments on a single line', () => {
      const sourceCode = 'foo(\n  a,\n  b\n)'
      const charRange = [3, 3]
      const diff = collapse(sourceCode, charRange)

      expect(diff.line).to.eql([1, 4])
      expect(diff.column).to.eql([3, 1])
      expect(diff.code).to.eql('(a, b)')
    })
  })
})
