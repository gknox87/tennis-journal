import{c as u}from"./index-F8I1pYO_.js";import{d as g}from"./format-DgGuYR5c.js";import{t as a}from"./startOfDay-DB61a6dQ.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=u("Award",[["path",{d:"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",key:"1yiouv"}],["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}]]);function y(e,s){const n=a(e),o=a(s),r=l(n,o),t=Math.abs(g(n,o));n.setDate(n.getDate()-r*t);const i=+(l(n,o)===-r),c=r*(t-i);return c===0?0:c}function l(e,s){const n=e.getFullYear()-s.getFullYear()||e.getMonth()-s.getMonth()||e.getDate()-s.getDate()||e.getHours()-s.getHours()||e.getMinutes()-s.getMinutes()||e.getSeconds()-s.getSeconds()||e.getMilliseconds()-s.getMilliseconds();return n<0?-1:n>0?1:n}export{p as A,y as d};
