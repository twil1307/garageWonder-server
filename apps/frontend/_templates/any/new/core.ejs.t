---
to: src/<%= dir %>/<%= name %>/<%= h.changeCase.pascalCase(name) %>.tsx
---
<%
    Name = h.changeCase.pascalCase(name)
%>

export type <%= Name %>Props = {

}

const <%= Name %> = ({}: <%= Name %>Props) => {

    return ()
}

export default <%= Name %>




