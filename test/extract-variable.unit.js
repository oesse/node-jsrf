import { expect } from 'chai'

import { extractVariable } from '../src/extract-variable'

describe('extractVariable', () => {
  it('returns two changes each with line and column range and replacement code', () => {
    const sourceCode = 'doImportantStuff(1, a + b)'
    const charRange = [20, 25]
    const changes = extractVariable(sourceCode, charRange)

    expect(changes).to.have.length(2)
    changes.forEach(change => {
      expect(change).to.have.property('line')
      expect(change).to.have.property('column')
      expect(change).to.have.property('code')
    })
  })

  it('extracts expression into const variable', () => {
    const sourceCode = 'doImportantStuff(1, a + b)'
    const charRange = [20, 25]

    const [ diff1, diff2 ] = extractVariable(sourceCode, charRange, 'varName')

    expect(diff1).to.eql({ line: [1, 1], column: [20, 25], code: 'varName' })
    expect(diff2).to.eql({ line: [1, 1], column: [0, 0], code: 'const varName = a + b\n' })
  })

  it('defines extracted variable in nearest enclosing scope', () => {
    const sourceCode = 'function hello () {\n  doImportantStuff(1, a + b)\n}'
    const charRange = [42, 47]

    const [ diff1, diff2 ] = extractVariable(sourceCode, charRange, 'varName')

    expect(diff1).to.eql({
      line: [2, 2],
      column: [22, 27],
      code: 'varName'
    })
    expect(diff2).to.eql({ line: [2, 2], column: [2, 2], code: 'const varName = a + b\n  ' })
  })

  it('works inside async functions', () => {
    const sourceCode = 'async function hello () {\n  await doImportantStuff(1, a + b)\n}'
    const charRange = [54, 59]

    const [ diff1, diff2 ] = extractVariable(sourceCode, charRange, 'varName')

    expect(diff1).to.eql({
      line: [2, 2],
      column: [28, 33],
      code: 'varName'
    })
    expect(diff2).to.eql({ line: [2, 2], column: [2, 2], code: 'const varName = a + b\n  ' })
  })
})
