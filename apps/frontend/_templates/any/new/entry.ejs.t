---
to: src/<%= dir %>/<%= name %>/index.ts
---
<%
    Name = h.changeCase.pascalCase(name)
%>
export { default } from "./<%= Name %>.tsx"




