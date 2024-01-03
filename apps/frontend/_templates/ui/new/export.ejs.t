---
inject: true
to: src/core/ui/index.ts
skip_if: ui/<%= name %>
append: true
---
export { default as <%= Name %> } from "./<%= name %>";