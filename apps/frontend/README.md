##Coding Convention

###React
[Following this rule from Airbnb](https://github.com/airbnb/javascript/tree/master/react)
1. Line spliting between state and function/return
Eg: 
`const Component = () => {`
`   const [count, setCount] = useState(0)`
`   `
`   const eventHandler = () => {}`
` `
`   return ... }`

2. Naming event handler used by Component by `on(ComponentName)(Event)ed`
Eg:  `const onActionButtonClicked = (event) => {}`

###SCSS
[Following this rule from Airbnb](https://github.com/airbnb/css/blob/master/README.md)