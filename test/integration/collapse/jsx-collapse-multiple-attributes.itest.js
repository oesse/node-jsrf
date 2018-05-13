// Given: a jsx tag with multiple attributes on a single line
<Tag
  a="a"
  b="b"
/>

// Do
collapse([1, 1])

// Expect: the attributes to be on a single line separated by spaces
<Tag a="a" b="b" />
