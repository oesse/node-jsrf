import { expect } from 'chai'

import { expand } from '../src/expand'

describe('expand', () => {
  context('an object literal', () => {
    it('returns change set with line and column range and replacement code', () => {
      const sourceCode = 'const foo = { a: \'a\' }'
      const charRange = [12, 22]
      const diff = expand(sourceCode, charRange)

      expect(diff).to.have.property('line')
      expect(diff).to.have.property('column')
      expect(diff).to.have.property('code')
    })

    it('puts the property key and value of a single line object literal on its own line', () => {
      const sourceCode = 'const foo = { a: \'a\' }'
      const charRange = [12, 22]
      const diff = expand(sourceCode, charRange)

      expect(diff).to.have.property('line')
        .to.eql([1, 1])
      expect(diff).to.have.property('column')
        .to.eql([12, 22])
      expect(diff).to.have.property('code', '{\n  a: \'a\'\n}')
    })

    it('puts multiple properties each on a line of their own', () => {
      const sourceCode = 'const foo = { a: \'a\', b: \'b\' }'
      const charRange = [12, 22]
      const diff = expand(sourceCode, charRange)

      expect(diff).to.have.property('code', '{\n  a: \'a\',\n  b: \'b\'\n}')
    })

    it('expands closest enclosing object literal', () => {
      const sourceCode = 'const foo = { a: \'a\', b: \'b\' }'
      const charRange = [17, 17]
      const diff = expand(sourceCode, charRange)

      expect(diff).to.have.property('code', '{\n  a: \'a\',\n  b: \'b\'\n}')
    })
  })

  context('an array literal', () => {
    it('puts single array element on a line of its own', () => {
      const sourceCode = 'const foo = [ a ]'
      const charRange = [12, 12]
      const diff = expand(sourceCode, charRange)

      expect(diff.line).to.eql([1, 1])
      expect(diff.column).to.eql([12, 17])
      expect(diff.code).to.eql('[\n  a\n]')
    })
  })
})