var e,t,a,r,o,l,n,i,s,p,d,m,u,y;t={},a={},null==(r=(e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{}).parcelRequire94c2)&&((r=function(e){if(e in t)return t[e].exports;if(e in a){var r=a[e];delete a[e];var o={id:e,exports:{}};return t[e]=o,r.call(o.exports,o,o.exports),o.exports}var l=Error("Cannot find module '"+e+"'");throw l.code="MODULE_NOT_FOUND",l}).register=function(e,t){a[e]=t},e.parcelRequire94c2=r),r.register,importScripts("./healpix-arrow-species.worker.8292d7e3.js"),o=r("l0pnG"),l=r("4mUW0"),n=r("dP91r"),i=r("jCTqJ"),s=r("XuxEK"),p=r("jluw9"),d=r("dVIi5"),m=r("46mnb"),u=r("dg4yb"),y=r("5pFYW"),(0,o.expose)(async(e,t)=>{let a;let r=await (d&&d.__esModule?d.default:d).ParquetReader.openUrl(e),w=r.getCursor(),f=Number(r.getRowCount());console.time(`compute (${f}) polygons`);let x=[],c=new Uint32Array(f+1);c[0]=0;let F=(0,i.makeBuilder)({type:new l.DateMillisecond}),g=new Float32Array(f),h=new Uint8Array(4*f),k=[],T=[],M=[],D=(0,i.makeBuilder)({type:new l.DateMillisecond}),b=[],A={prevTime:null,minMaxForTime:[0,0],startIndex:0};for(;a=await w.next();){let e=w.cursorIndex-1,r=Number(a.time)/1e6;if(0===e)A={prevTime:r,minMaxForTime:[a.states,a.states],startIndex:0};else if(A.prevTime!==r){let{minMaxForTime:t,startIndex:o}=A;for(let a=o;a<e;a++){let e=(0,m.getPDFColor)(g[a],t);h.set(e,4*a)}A={prevTime:r,minMaxForTime:[a.states,a.states],startIndex:e}}else A.minMaxForTime=[Math.min(A.minMaxForTime[0],a.states),Math.max(A.minMaxForTime[1],a.states)];let o=(0,y.healpixId2PolygonCoordinates)(a.cell_ids,t);if(c[e+1]=c[e]+o.length,Array.prototype.push.apply(x,o.flat()),F.append(r),g[e]=a.states,null!==a.temperature&&null!==a.pressure){let e=(0,y.healpixId2CenterPoint)(a.cell_ids,t);Array.prototype.push.apply(k,e.flat()),T.push(a.temperature),M.push(a.pressure),D.append(r),b.push(a.states)}}let v=(0,u.makeArrowPolygon)(x,c),P=F.finish().flush(),I=(0,s.makeData)({type:new l.Float32,data:g}),_=(0,s.makeData)({type:new l.Uint8,data:h}),C=(0,s.makeData)({type:new l.FixedSizeList(4,new n.Field("rgba",_.type,!1)),child:_}),U=(0,u.makeStruct)([["date",P],["geometry",v],["value",I],["color",C]]),S=(0,s.makeData)({type:new l.Float32,data:new Float32Array(k)}),E=(0,s.makeData)({type:new l.FixedSizeList(2,new n.Field("xy",S.type,!1)),child:S}),R=D.finish().flush(),q=(0,s.makeData)({type:new l.Float64,data:new Float64Array(T)}),N=(0,s.makeData)({type:new l.Float64,data:new Float64Array(M)}),j=(0,s.makeData)({type:new l.Float32,data:new Float32Array(b)}),L=(0,u.makeStruct)([["date",R],["geometry",E],["value",j],["pressure",N],["temperature",q]]),[O,z]=(0,p.worker).preparePostMessage(U),[B,H]=(0,p.worker).preparePostMessage(L);return console.timeEnd(`compute (${f}) polygons`),(0,o.Transfer)({data:O,mostProbData:B},[...z,...H])});
//# sourceMappingURL=healpix-arrow-individual.worker.b0b29bc3.js.map
