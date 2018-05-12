// Given: an already expanded jsx tag
<Tag
  {...props}
/>

// Do
expand([10, 10])

// Expect: the jsx tag to stay expanded
<Tag
  {...props}
/>
