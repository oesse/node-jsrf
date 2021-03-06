import { expect } from 'chai'

import { expand } from '../src/expand'

describe('expand', () => {
  it('returns change set with line and column range and replacement code', () => {
    const sourceCode = 'const foo = { a: \'a\' }'
    const charRange = [12, 22]
    const diff = expand(sourceCode, charRange)

    expect(diff).to.have.property('line')
    expect(diff).to.have.property('column')
    expect(diff).to.have.property('code')
  })

  context('an object literal', () => {
    it('puts the property key and value of a single line object literal on its own line', () => {
      const sourceCode = 'const foo = { a: \'a\' }'
      const charRange = [12, 22]
      const diff = expand(sourceCode, charRange)

      expect(diff.line).to.eql([1, 1])
      expect(diff.column).to.eql([12, 22])
      expect(diff.code).to.eql('{\n  a: \'a\'\n}')
    })

    it('puts multiple properties each on a line of their own', () => {
      const sourceCode = 'const foo = { a: \'a\', b: \'b\' }'
      const charRange = [12, 22]
      const diff = expand(sourceCode, charRange)

      expect(diff.code).to.eql('{\n  a: \'a\',\n  b: \'b\'\n}')
    })

    it('expands closest enclosing object literal', () => {
      const sourceCode = 'const foo = { a: \'a\', b: \'b\' }'
      const charRange = [17, 17]
      const diff = expand(sourceCode, charRange)

      expect(diff.code).to.eql('{\n  a: \'a\',\n  b: \'b\'\n}')
    })

    it('indents expansion correctly when literal starts on its own line', () => {
      const sourceCode = 'foo(\n  { a: \'a\' }\n)'
      const charRange = [8, 8]
      const diff = expand(sourceCode, charRange)

      expect(diff.line).to.eql([2, 2])
      expect(diff.column).to.eql([2, 12])
      expect(diff.code).to.eql('{\n    a: \'a\'\n  }')
    })

    it('expands literal containing object spread operator', () => {
      const sourceCode = 'foo({ ...bar, a: \'a\' })'
      const charRange = [4, 4]
      const diff = expand(sourceCode, charRange)

      expect(diff.line).to.eql([1, 1])
      expect(diff.column).to.eql([4, 22])
      expect(diff.code).to.eql('{\n  ...bar,\n  a: \'a\'\n}')
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

    it('puts multiple array elements each on a line of their own', () => {
      const sourceCode = 'const foo = [ a, b ]'
      const charRange = [12, 12]
      const diff = expand(sourceCode, charRange)

      expect(diff.line).to.eql([1, 1])
      expect(diff.column).to.eql([12, 20])
      expect(diff.code).to.eql('[\n  a,\n  b\n]')
    })

    it('respects the indentation of the enclosing entity', () => {
      const sourceCode = 'foo({\n  a: [1, 2, 3]\n})'
      const charRange = [12, 12]
      const diff = expand(sourceCode, charRange)

      expect(diff.line).to.eql([2, 2])
      expect(diff.column).to.eql([5, 14])
      expect(diff.code).to.eql('[\n    1,\n    2,\n    3\n  ]')
    })
  })

  context('a function argument list', () => {
    it('puts single argument on a line of its own', () => {
      const sourceCode = 'const foo = bar(baz)'
      const charRange = [15, 15]
      const diff = expand(sourceCode, charRange)

      expect(diff.line).to.eql([1, 1])
      expect(diff.column).to.eql([15, 20])
      expect(diff.code).to.eql('(\n  baz\n)')
    })

    it('puts multiple arguments each on a line of their own', () => {
      const sourceCode = 'const foo = bar(a, b)'
      const charRange = [15, 15]
      const diff = expand(sourceCode, charRange)

      expect(diff.line).to.eql([1, 1])
      expect(diff.column).to.eql([15, 21])
      expect(diff.code).to.eql('(\n  a,\n  b\n)')
    })

    it('expands arguments of arrow function', () => {
      const sourceCode = 'callMeLater((foo, bar) => foo + bar)'
      const charRange = [12, 12]
      const diff = expand(sourceCode, charRange)

      expect(diff.line).to.eql([1, 1])
      expect(diff.column).to.eql([12, 22])
      expect(diff.code).to.eql('(\n  foo,\n  bar\n)')
    })
  })

  context('an import statement', () => {
    it('puts import on a line of its own', () => {
      const sourceCode = 'import { foo } from \'module\''
      const charRange = [7, 7]
      const diff = expand(sourceCode, charRange)

      expect(diff.line).to.eql([1, 1])
      expect(diff.column).to.eql([7, 14])
      expect(diff.code).to.eql('{\n  foo\n}')
    })

    it.skip('leaves default import as it is', () => {
      // TODO: This is a failure case which needs an error handling concept.
      const sourceCode = 'import def from \'module\''
      const charRange = [7, 7]
      const diff = expand(sourceCode, charRange)

      // returning a noop changeset is not a great way to do it
      expect(diff.line).to.eql([1, 1])
      expect(diff.column).to.eql([0, 0])
      expect(diff.code).to.eql('')
    })

    it('only expands named exports', () => {
      const sourceCode = 'import def, { foo } from \'module\''
      const charRange = [12, 12]
      const diff = expand(sourceCode, charRange)

      expect(diff.line).to.eql([1, 1])
      expect(diff.column).to.eql([12, 19])
      expect(diff.code).to.eql('{\n  foo\n}')
    })
  })

  context('an passthrough export', () => {
    it('puts export on a line of its own', () => {
      const sourceCode = 'export { foo } from \'module\''
      const charRange = [7, 7]
      const diff = expand(sourceCode, charRange)

      expect(diff.line).to.eql([1, 1])
      expect(diff.column).to.eql([7, 14])
      expect(diff.code).to.eql('{\n  foo\n}')
    })
  })

  context('a destructuring assignment', () => {
    it('puts property name on a line of its own', () => {
      const sourceCode = 'const { foo } = bar'
      const charRange = [6, 6]
      const diff = expand(sourceCode, charRange)

      expect(diff.line).to.eql([1, 1])
      expect(diff.column).to.eql([6, 13])
      expect(diff.code).to.eql('{\n  foo\n}')
    })

    it('puts array element name on a line of its own', () => {
      const sourceCode = 'const [foo] = bar'
      const charRange = [6, 6]
      const diff = expand(sourceCode, charRange)

      expect(diff.line).to.eql([1, 1])
      expect(diff.column).to.eql([6, 11])
      expect(diff.code).to.eql('[\n  foo\n]')
    })
  })

  context('a jsx tag with attributes', () => {
    context('which is self closing', () => {
      it('puts each attribute on a line of its own', () => {
        const sourceCode = '<Component foo="bar" />'
        const charRange = [6, 6]
        const diff = expand(sourceCode, charRange)

        expect(diff.code).to.eql('\n  foo="bar"\n/>')
        expect(diff.line).to.eql([1, 1])
        expect(diff.column).to.eql([10, 23])
      })
    })

    context('which has a closing tag', () => {
      it('puts each attribute on a line of its own', () => {
        const sourceCode = '<Component foo="bar"><Child /></Component>'
        const charRange = [6, 6]
        const diff = expand(sourceCode, charRange)

        expect(diff.line).to.eql([1, 1])
        expect(diff.column).to.eql([10, 21])
        expect(diff.code).to.eql('\n  foo="bar"\n>')
      })
    })
  })
})
