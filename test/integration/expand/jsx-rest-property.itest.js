// Given: a jsx element with spread property attribute
const C = (props) => <Forward {...props} />

// Do
expand([22, 22])

// Expect: the jsx tag to be expanded
const C = (props) => <Forward
  {...props}
/>
