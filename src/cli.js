import { extractVariable, expandObject, collapseObject } from './'

function readFromStdin () {
  let data = ''
  process.stdin.setEncoding('utf-8')

  return new Promise((resolve, reject) => {
    process.stdin.on('readable', function () {
      let chunk = process.stdin.read()
      while (chunk) {
        data += chunk
        chunk = process.stdin.read()
      }
    })

    process.stdin.on('end', function () {
      resolve(data)
    })
  })
}

export default async function () {
  const [mode, start, end, ...rest] = process.argv.slice(2)

  if (mode === 'extract-variable') {
    const [varName] = rest
    const sourceCode = await readFromStdin()

    const diffs = extractVariable(sourceCode, [start, end], varName)
    console.log(JSON.stringify(diffs))
    return
  }

  if (mode === 'expand-object') {
    const sourceCode = await readFromStdin()

    const diff = expandObject(sourceCode, [start, end])
    console.log(JSON.stringify([diff]))
    return
  }

  if (mode === 'collapse-object') {
    const sourceCode = await readFromStdin()

    const diff = collapseObject(sourceCode, [start, end])
    console.log(JSON.stringify([diff]))
    return
  }

  console.log('Error: Invalid mode')
}
