import { extractVariableFromRange } from './'

export default function () {
  let data = ''
  process.stdin.setEncoding('utf-8')

  process.stdin.on('readable', function () {
    let chunk = process.stdin.read()
    while (chunk) {
      data += chunk
      chunk = process.stdin.read()
    }
  })

  process.stdin.on('end', function () {
    const [,, start, end, varName] = process.argv
    const diffs = extractVariableFromRange(data, [start, end], varName)
    console.log(JSON.stringify(diffs))
  })
}
