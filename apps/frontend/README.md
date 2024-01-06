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
3. Naming folder component connected by dashes '-'
Eg: default-layout, section-list
4. How to use hygen
- Cd to apps/frontend
- npx hygen any new --dir dirName --name componentName
Eg: npx hygen nay new --dir layouts --name default-layout

###SCSS
[Following this rule from Airbnb](https://github.com/airbnb/css/blob/master/README.md)