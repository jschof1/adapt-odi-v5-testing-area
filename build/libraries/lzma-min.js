//! © 2015 Nathan Rugg <nmrugg@gmail.com> | MIT
"undefined"==typeof Worker||"undefined"!=typeof location&&"file:"===location.protocol?"undefined"!=typeof global&&"undefined"!=typeof require?this.LZMAFactory=function(n){return require(n||"./lzma_worker.js").LZMA}:"undefined"!=typeof window&&window.document?!function(){function n(n){var e;return r(n),e={compress:function(n,r,t,i){o.LZMA_WORKER?o.LZMA_WORKER.compress(n,r,t,i):setTimeout(function(){e.compress(n,r,t,i)},50)},decompress:function(n,r,t){o.LZMA_WORKER?o.LZMA_WORKER.decompress(n,r,t):setTimeout(function(){e.decompress(n,r,t)},50)},worker:function(){return null}}}var o,e=this,r=function(o){var r=document.createElement("script");r.type="text/javascript",r.src=o,r.onload=function(){e.LZMAFactory=n},document.getElementsByTagName("head")[0].appendChild(r)};"undefined"!=typeof window?o=window:global&&(o=global),e.LZMA=n}():console.error("Can't load the worker. Sorry."):this.LZMAFactory=function(n){var o=1,e=2,r=3,t={},i=new Worker(n||"./lzma_worker-min.js");return i.onmessage=function(n){n.data.action===r?t[n.data.cbn]&&"function"==typeof t[n.data.cbn].on_progress&&t[n.data.cbn].on_progress(n.data.result):t[n.data.cbn]&&"function"==typeof t[n.data.cbn].on_finish&&(t[n.data.cbn].on_finish(n.data.result,n.data.error),delete t[n.data.cbn])},i.onerror=function(n){var o=Error(n.message+" ("+n.filename+":"+n.lineno+")");for(var e in t)t[e].on_finish(null,o);console.error("Uncaught error in lzma_worker",o)},function(){function n(n,o,e,r,a){var c;do c=Math.floor(1e7*Math.random());while(void 0!==t[c]);t[c]={on_finish:r,on_progress:a},i.postMessage({action:n,cbn:c,data:o,mode:e})}return{compress:function(e,r,t,i){n(o,e,r,t,i)},decompress:function(o,r,t){n(e,o,!1,r,t)},worker:function(){return i}}}()};
