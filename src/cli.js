import { extractVariableFromRange, expandObject } from './'

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
  const argv = process.argv.slice(2)
  const [mode, start, end] = argv

  if (mode === 'extract-variable') {
    const varName = argv[3]
    const sourceCode = await readFromStdin()

    const diffs = extractVariableFromRange(sourceCode, [start, end], varName)
    console.log(JSON.stringify(diffs))
    return
  }

  if (mode === 'expand-object') {
    const sourceCode = await readFromStdin()

    const diff = expandObject(sourceCode, [start, end])
    console.log(JSON.stringify([diff]))
    return
  }

  console.log('Error: Invalid mode')
}
