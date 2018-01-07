export default function applyChangeset(sourceCode, changeSet) {
  const lines = sourceCode.split('\n')
  const { line, column, code } = changeSet

  const colStart = column[0]
  const colEnd = column[1]

  const lineStart = line[0] - 1
  const lineEnd = line[1] - 1

  const changeLineStart = lines[lineStart]
  const changeLineEnd = lines[lineEnd]
  const newLine = changeLineStart.substring(0, colStart) + code + changeLineEnd.substring(colEnd)

  return [
    ...lines.slice(0, lineStart),
    newLine,
    ...lines.slice(lineEnd + 1)
  ].join('\n')
}
