// Given: an object literal with mutliple key/value pairs
const foo = { bar: 'bar', baz: 'baz' }

// Do
expand([12, 12])

// Expect: each key to be on a single line
const foo = {
  bar: 'bar',
  baz: 'baz'
}
