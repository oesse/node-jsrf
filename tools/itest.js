import fs from 'fs'
import { expect } from 'chai'

import { expand } from '../src'
import applyChangeset from '../src/apply-changeset'

function loadIntegrationTest (path) {
  const spec = fs.readFileSync(path, { encoding: 'utf-8' })
  const lines = spec.split('\n')

  const givenStart = lines.findIndex(line => /^\/\/ Given/.test(line))
  const hasOnly = /Given only/.test(lines[givenStart])
  const hasSkip = /Given skip/.test(lines[givenStart])
  const doStart = lines.findIndex(line => /^\/\/ Do/.test(line))
  const expectStart = lines.findIndex(line => /^\/\/ Expect/.test(line))

  const description = lines[givenStart].match(/(Given.*$)/)[1]
  const expectation = lines[expectStart].match(/(Expect.*$)/)[1]

  const sourceCode = lines.slice(givenStart + 1, doStart).join('\n')
  const command = lines.slice(doStart + 1, expectStart).join('\n')
  const expectedCode = lines.slice(expectStart + 1).join('\n')

  return {
    description,
    expectation,
    sourceCode,
    command,
    expectedCode,
    hasOnly,
    hasSkip
  }
}

function evaluateInContext (command, testContext) {
  // eslint-disable-next-line no-eval
  return (function () { return eval(command) }.call(testContext))
}

function runCommand (command, sourceCode) {
  const testContext = {
    expand: (...args) => expand(sourceCode, ...args)
  }

  const changeSet = evaluateInContext(`this.${command}`, testContext)
  return applyChangeset(sourceCode, changeSet)
}

function runTestCase (sourceCode, command, expectedCode) {
  const resultCode = runCommand(command, sourceCode)
  expect(resultCode).to.equal(expectedCode)
}

function registerTestCase (path) {
  const {
    sourceCode,
    command,
    expectedCode,
    description,
    expectation,
    hasOnly,
    hasSkip
  } = loadIntegrationTest(path)

  const testCaseIt = hasOnly ? it.only : hasSkip ? it.skip : it

  context(description, () => {
    testCaseIt(expectation, () => {
      runTestCase(sourceCode, command, expectedCode)
    })
  })
}

function collectFiles (basepath, pattern) {
  const filenames = fs.readdirSync(basepath)
  const result = []
  filenames.forEach(filename => {
    const currentPath = `${basepath}/${filename}`
    const stat = fs.lstatSync(currentPath)

    if (stat.isDirectory()) {
      result.splice(-1, 0, ...collectFiles(currentPath, pattern))
    } else if (stat.isFile() && pattern.test(currentPath)) {
      result.push(currentPath)
    }
  })
  return result
}

function registerTestSuite (suiteName, basePath) {
  describe(suiteName, () => {
    collectFiles(basePath, /\.itest\.js$/)
      .forEach(registerTestCase)
  })
}

describe('integration tests', () => {
  registerTestSuite('expand', 'test/integration/expand')
})
