---
inject: true
to: src/<%= dir %>/index.ts
skip_if: <%= dir %>/<%= name %>
append: true
---
<%
    Name = h.changeCase.pascalCase(name)
%>
export { default as <%= Name %> } from "./<%= name %>";