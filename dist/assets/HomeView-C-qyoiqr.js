import{a as o}from"./axios-B4uVmeYG.js";import{d as _,r,c,a as s,n as x,t as d,b as v,o as u}from"./index-BrlUu8Kl.js";const w={class:"bg-white"},b={class:"relative isolate px-6 pt-14 lg:px-8"},k={class:"mx-auto max-w-2xl py-32 sm:py-48 lg:py-56"},S={class:"text-center"},C=s("h1",{class:"text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"},"Local Upload",-1),L={key:0,class:"mt-10"},A={class:"w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700"},B={class:"mt-6 text-lg leading-8 text-gray-600"},U=_({__name:"HomeView",setup(D){const a=r(0),l=r(0),p=()=>new Promise(e=>{const t=document.createElement("input");t.setAttribute("type","file"),t.setAttribute("webkitdirectory","webkitdirectory"),t.setAttribute("multiple","multiple"),t.addEventListener("change",async i=>{const n=i.target,f=(n==null?void 0:n.files)||[],h=Array.from(f);n.value="",e(h)}),t.click()}),g=async e=>(await o.post("/api/presigned-upload",{keypath:e.webkitRelativePath})).data.data.url,m=async(e,t)=>(await o.put(e,t,{maxContentLength:1/0,maxBodyLength:1/0})).data,y=async()=>{let e=await p();e=e.filter(t=>!t.name.endsWith(".DS_Store")),a.value=e.length;for(let t=0;t<e.length;t++){console.log("files[i].name",e[t].name);const i=await g(e[t]);await m(i,e[t]),l.value=t+1}};return(e,t)=>(u(),c("div",w,[s("div",b,[s("div",k,[s("div",S,[C,s("div",{class:"mt-10 flex items-center justify-center gap-x-6"},[s("div",{class:"rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20 cursor-pointer w-fit",onClick:y}," Select File Directory ")]),a.value>0?(u(),c("div",L,[s("div",A,[s("div",{class:"bg-blue-600 h-2.5 rounded-full",style:x({width:`${l.value/a.value*100}%`})},null,4)]),s("p",B,d(l.value)+" of "+d(a.value),1)])):v("",!0)])])])]))}});export{U as default};
