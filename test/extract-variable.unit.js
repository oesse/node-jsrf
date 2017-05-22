import { extractVariableFromRange } from '../src'
import { expect } from 'chai'

describe('extractVariableFromRange', () => {
  context('with range inside function parameter', () => {
    const sourceCode = 'doImportantStuff(1, a + b)'
    const charRange = [20, 25]

    it('returns change sets defining const variable with expression from range', () => {
      const [ diff1, diff2 ] = extractVariableFromRange(sourceCode, charRange, 'varName')

      expect(diff1).to.eql({ line: [1, 1], column: [20, 25], code: 'varName' })
      expect(diff2).to.eql({ line: [1, 1], column: [0, 0], code: 'const varName = a + b\n' })
    })
  })

  context('with expression inside function', () => {
    const sourceCode = 'function hello () {\n  doImportantStuff(1, a + b)\n}'
    const charRange = [42, 47]

    it('puts variable declaration just before usage', () => {
      const [ diff1, diff2 ] = extractVariableFromRange(sourceCode, charRange, 'varName')

      expect(diff1).to.eql({
        line: [2, 2],
        column: [22, 27],
        code: 'varName'
      })
      expect(diff2).to.eql({ line: [2, 2], column: [2, 2], code: 'const varName = a + b\n  ' })
    })
  })

  context('with expression inside async function', () => {
    const sourceCode = 'async function hello () {\n  await doImportantStuff(1, a + b)\n}'
    const charRange = [54, 59]

    it('puts variable declaration just before usage', () => {
      const [ diff1, diff2 ] = extractVariableFromRange(sourceCode, charRange, 'varName')

      expect(diff1).to.eql({
        line: [2, 2],
        column: [28, 33],
        code: 'varName'
      })
      expect(diff2).to.eql({ line: [2, 2], column: [2, 2], code: 'const varName = a + b\n  ' })
    })
  })
})
