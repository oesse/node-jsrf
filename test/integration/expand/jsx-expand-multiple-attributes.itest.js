// Given: a jsx tag with multiple attributes on a single line
<Tag a="a" b="b" />

// Do
expand([1, 1])

// Expect: the attributes to be separated by newlines
<Tag
  a="a"
  b="b"
/>
