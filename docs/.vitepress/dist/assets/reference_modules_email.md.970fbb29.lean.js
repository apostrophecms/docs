import{_ as i,K as a,o as d,c,O as t,w as s,k as e,a as o,$ as p}from"./chunks/framework.9fa1e75e.js";const x=JSON.parse('{"title":"@apostrophecms/email","description":"","frontmatter":{"extends":"@apostrophecms/module"},"headers":[],"relativePath":"reference/modules/email.md","filePath":"reference/modules/email.md","lastUpdated":1690289066000}'),m={name:"reference/modules/email.md"},h=e("h1",{id:"apostrophecms-email",tabindex:"-1"},[e("code",null,"@apostrophecms/email"),o(),e("a",{class:"header-anchor",href:"#apostrophecms-email","aria-label":'Permalink to "`@apostrophecms/email`"'},"​")],-1),u=p("",5),A=e("p",null,"module.exports = { options: { nodemailer: mailjetTransport({ /// Mailjet configuration... }) } };",-1),C=e("div",{class:"language-"},[e("button",{title:"Copy Code",class:"copy"}),e("span",{class:"lang"}),e("pre",{class:"shiki material-theme-palenight"},[e("code",null,[e("span",{class:"line"},[e("span",{style:{color:"#A6ACCD"}},"<template v-slot:caption>")]),o(`
`),e("span",{class:"line"},[e("span",{style:{color:"#A6ACCD"}},"  modules/@apostrophecms/email/index.js")]),o(`
`),e("span",{class:"line"},[e("span",{style:{color:"#A6ACCD"}},"</template>")]),o(`
`),e("span",{class:"line"},[e("span",{style:{color:"#A6ACCD"}},"</AposCodeBlock>")]),o(`
`),e("span",{class:"line"},[e("span",{style:{color:"#A6ACCD"}})]),o(`
`),e("span",{class:"line"},[e("span",{style:{color:"#A6ACCD"}},"If needed, you may assign the *fully* created transport directly to `self.transport` and omit the `nodemailer` option.")]),o(`
`),e("span",{class:"line"},[e("span",{style:{color:"#A6ACCD"}})]),o(`
`),e("span",{class:"line"},[e("span",{style:{color:"#A6ACCD"}},"<AposCodeBlock>")]),o(`
`),e("span",{class:"line"},[e("span",{style:{color:"#A6ACCD"}},"```javascript")]),o(`
`),e("span",{class:"line"},[e("span",{style:{color:"#A6ACCD"}},"const nodemailer = require('nodemailer');")]),o(`
`),e("span",{class:"line"},[e("span",{style:{color:"#A6ACCD"}},"const mailjetTransport = require('nodemailer-mailjet-transport');")]),o(`
`),e("span",{class:"line"},[e("span",{style:{color:"#A6ACCD"}})]),o(`
`),e("span",{class:"line"},[e("span",{style:{color:"#A6ACCD"}},"module.exports = {")]),o(`
`),e("span",{class:"line"},[e("span",{style:{color:"#A6ACCD"}},"  init(self) {")]),o(`
`),e("span",{class:"line"},[e("span",{style:{color:"#A6ACCD"}},"    self.transport = nodemailer.createTransport(mailjetTransport({")]),o(`
`),e("span",{class:"line"},[e("span",{style:{color:"#A6ACCD"}},"      // Mailjet configuration...")]),o(`
`),e("span",{class:"line"},[e("span",{style:{color:"#A6ACCD"}},"    }), {")]),o(`
`),e("span",{class:"line"},[e("span",{style:{color:"#A6ACCD"}},"      // A full set of message defaults...")]),o(`
`),e("span",{class:"line"},[e("span",{style:{color:"#A6ACCD"}},"    })")]),o(`
`),e("span",{class:"line"},[e("span",{style:{color:"#A6ACCD"}},"  }")]),o(`
`),e("span",{class:"line"},[e("span",{style:{color:"#A6ACCD"}},"};")])])])],-1),f=e("h2",{id:"related-documentation",tabindex:"-1"},[o("Related documentation "),e("a",{class:"header-anchor",href:"#related-documentation","aria-label":'Permalink to "Related documentation"'},"​")],-1),_=e("ul",null,[e("li",null,[e("a",{href:"/guide/sending-email.html"},"Guide to sending email from your Apostrophe project")]),e("li",null,[e("a",{href:"/reference/modules/module.html#email-req-templatename-data-options"},[o("The "),e("code",null,"self.email()"),o(" method in every module")])])],-1);function y(l,g,D,T,b,j){const n=a("AposRefExtends"),r=a("AposCodeBlock");return d(),c("div",null,[h,t(n,{module:l.$frontmatter.extends},null,8,["module"]),u,t(r,null,{caption:s(()=>[o(" modules/@apostrophecms/email/index.js ")]),default:s(()=>[o(" ```javascript const mailjetTransport = require('nodemailer-mailjet-transport'); "),A,C,o()]),_:1}),f,_])}const q=i(m,[["render",y]]);export{x as __pageData,q as default};
