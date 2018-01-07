import { expect } from 'chai'

import applyChangeset from '../src/apply-changeset'

describe('applyChangeset', () => {
  context('with single line source code', () => {
    it('returns the source code with the change applied', () => {
      const sourceCode = 'const [foo] = bar'
      const diff = { line: [1, 1], column: [6, 11], code: 'baz' }

      const newCode = applyChangeset(sourceCode, diff)
      expect(newCode).to.equal('const baz = bar')
    }) 
  })

  context('with single line change in multiline source code', () => {
    it('returns the source code with the change applied', () => {
      const sourceCode = 
        '<Foo>\n' +
        '  <Bar />\n' +
        '</Foo>'
      const diff = { line: [2, 2], column: [3, 6], code: 'Boing' }

      const newCode = applyChangeset(sourceCode, diff)

      const expectedCode = 
        '<Foo>\n' +
        '  <Boing />\n' +
        '</Foo>'
      expect(newCode).to.equal(expectedCode)
    }) 

  })

  context('with multiline change', () => {
    it('should return the source code with the change applied', () => {
      const sourceCode = 
        '<Foo>\n' +
        '  <Bar>\n' +
        '    <Baz />\n' +
        '  </Bar>\n' +
        '</Foo>'
      const diff = { line: [2, 4], column: [3, 7], code: 'Boing /' }

      const newCode = applyChangeset(sourceCode, diff)

      const expectedCode = 
        '<Foo>\n' +
        '  <Boing />\n' +
        '</Foo>'
      expect(newCode).to.equal(expectedCode)
    }) 
  })
})
