function e(e,r,n,a){Object.defineProperty(e,r,{get:n,set:a,enumerable:!0,configurable:!0})}var r=("undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{}).parcelRequire94c2,n=r.register;n("6A81U",function(n,a){Object.defineProperty(n.exports,"__esModule",{value:!0,configurable:!0}),e(n.exports,"default",function(){return x});var t=r("kxTYF");r("8v0nu");var o=r("24OcA"),i=r("9HGsN"),s=r("azOzW"),l=r("6wyQ8"),c=r("jmuMf"),u=r("hM3y1"),d=r("fkOSu"),f=r("jjaFJ"),g=r("dwR5r"),p=r("cXAPy"),m=r("aA7HY"),h=r("5AmRD");function x(){let{data:e,isSuccess:r}=(0,f.useQuery)({queryKey:["species"],queryFn:(0,p.getJsonFn)("/api/species/index.json")});return/*#__PURE__*/(0,t.jsxs)(i.Box,{w:"100%",children:[/*#__PURE__*/(0,t.jsx)(m.PanelHeader,{suptitle:"Explore",heading:/*#__PURE__*/(0,t.jsxs)(t.Fragment,{children:["Species"," ",r&&/*#__PURE__*/(0,t.jsx)(o.Badge,{bg:"base.400a",color:"surface.500",px:2,borderRadius:"sm",children:e?.length.toString().padStart(2,"0")})]}),borderBottom:"1px",borderBottomColor:"base.100a"}),/*#__PURE__*/(0,t.jsx)(c.List,{display:"flex",flexDirection:"column",gap:4,pt:4,children:r?e?.map(e=>/*#__PURE__*/t.jsx(c.ListItem,{children:/*#__PURE__*/t.jsxs(g.default,{to:`/species/${e.id}`,display:"flex",gap:4,alignItems:"center",color:"inherit",_hover:{textDecor:"none",bg:"primary.100"},transition:"background 320ms",borderRadius:"md",children:[/*#__PURE__*/t.jsx(l.Image,{src:h.buildImgUrl(e.image),alt:"Species",borderRadius:"md",width:16}),/*#__PURE__*/t.jsxs(i.Box,{children:[/*#__PURE__*/t.jsx(s.Heading,{as:"p",size:"sm",children:e.name}),/*#__PURE__*/t.jsx(d.Text,{as:"p",color:"base.400",children:e.region})]})]})},e.id)):[1,2,3].map(e=>/*#__PURE__*/(0,t.jsx)(c.ListItem,{children:/*#__PURE__*/(0,t.jsx)(u.Skeleton,{height:16,bg:"base.200"})},e))})]})}}),n("24OcA",function(n,a){e(n.exports,"Badge",function(){return u});var t=r("kxTYF"),o=r("2Lb3q"),i=r("i6Woj"),s=r("5EE1N"),l=r("iJDuM"),c=r("3lBLT");let u=(0,s.forwardRef)(function(e,r){let n=(0,l.useStyleConfig)("Badge",e),{className:a,...s}=(0,o.omitThemingProps)(e);return/* @__PURE__ */(0,t.jsx)(c.chakra.span,{ref:r,className:(0,i.cx)("chakra-badge",e.className),...s,__css:{display:"inline-block",whiteSpace:"nowrap",verticalAlign:"middle",...n}})});u.displayName="Badge"}),n("6wyQ8",function(n,a){e(n.exports,"Image",function(){return u});var t=r("kxTYF"),o=r("57bvD"),i=r("hzooT"),s=r("2KdlO"),l=r("5EE1N"),c=r("3lBLT");let u=(0,l.forwardRef)(function(e,r){let{fallbackSrc:n,fallback:a,src:l,srcSet:u,align:d,fit:f,loading:g,ignoreFallback:p,crossOrigin:m,fallbackStrategy:h="beforeLoadOrError",referrerPolicy:x,...b}=e,k=void 0!==n||void 0!==a,v=null!=g||p||!k,y=(0,s.useImage)({...e,crossOrigin:m,ignoreFallback:v}),j=(0,s.shouldShowFallbackImage)(y,h),S={ref:r,objectFit:f,objectPosition:d,...v?b:(0,o.omit)(b,["onError","onLoad"])};return j?a||/* @__PURE__ */(0,t.jsx)(c.chakra.img,{as:i.NativeImage,className:"chakra-image__placeholder",src:n,...S}):/* @__PURE__ */(0,t.jsx)(c.chakra.img,{as:i.NativeImage,src:l,srcSet:u,crossOrigin:m,loading:g,referrerPolicy:x,className:"chakra-image",...S})});u.displayName="Image"}),n("hzooT",function(n,a){e(n.exports,"NativeImage",function(){return o});var t=r("kxTYF");let o=(0,r("5EE1N").forwardRef)(function(e,r){let{htmlWidth:n,htmlHeight:a,alt:o,...i}=e;return/* @__PURE__ */(0,t.jsx)("img",{width:n,height:a,ref:r,alt:o,...i})});o.displayName="NativeImage"}),n("2KdlO",function(n,a){e(n.exports,"useImage",function(){return i}),e(n.exports,"shouldShowFallbackImage",function(){return s});var t=r("6AWBz"),o=r("8v0nu");function i(e){let{loading:r,src:n,srcSet:a,onLoad:i,onError:s,crossOrigin:l,sizes:c,ignoreFallback:u}=e,[d,f]=(0,o.useState)("pending");(0,o.useEffect)(()=>{f(n?"loading":"pending")},[n]);let g=(0,o.useRef)(),p=(0,o.useCallback)(()=>{if(!n)return;m();let e=new Image;e.src=n,l&&(e.crossOrigin=l),a&&(e.srcset=a),c&&(e.sizes=c),r&&(e.loading=r),e.onload=e=>{m(),f("loaded"),i?.(e)},e.onerror=e=>{m(),f("failed"),s?.(e)},g.current=e},[n,l,a,c,i,s,r]),m=()=>{g.current&&(g.current.onload=null,g.current.onerror=null,g.current=null)};return(0,t.useSafeLayoutEffect)(()=>{if(!u)return"loading"===d&&p(),()=>{m()}},[d,p,u]),u?"loaded":d}let s=(e,r)=>"loaded"!==e&&"beforeLoadOrError"===r||"failed"===e&&"onError"===r}),n("hM3y1",function(n,a){e(n.exports,"Skeleton",function(){return v});var t=r("kxTYF"),o=r("8623R"),i=r("6hEiq"),s=r("2Lb3q"),l=r("i6Woj"),c=r("6iKRa"),u=r("872S0"),d=r("hhupk"),f=r("3lBLT"),g=r("5EE1N"),p=r("iJDuM");let m=(0,f.chakra)("div",{baseStyle:{boxShadow:"none",backgroundClip:"padding-box",cursor:"default",color:"transparent",pointerEvents:"none",userSelect:"none","&::before, &::after, *":{visibility:"hidden"}}}),h=(0,i.cssVar)("skeleton-start-color"),x=(0,i.cssVar)("skeleton-end-color"),b=(0,c.keyframes)({from:{opacity:0},to:{opacity:1}}),k=(0,c.keyframes)({from:{borderColor:h.reference,background:h.reference},to:{borderColor:x.reference,background:x.reference}}),v=(0,g.forwardRef)((e,r)=>{let n={...e,fadeDuration:"number"==typeof e.fadeDuration?e.fadeDuration:.4,speed:"number"==typeof e.speed?e.speed:.8},a=(0,p.useStyleConfig)("Skeleton",n),i=(0,u.useIsFirstRender)(),{startColor:c="",endColor:g="",isLoaded:v,fadeDuration:y,speed:j,className:S,fitContent:w,animation:N,...E}=(0,s.omitThemingProps)(n),[F,I]=(0,d.useToken)("colors",[c,g]),R=(0,o.usePrevious)(v),T=(0,l.cx)("chakra-skeleton",S),O={...F&&{[h.variable]:F},...I&&{[x.variable]:I}};if(v){let e=i||R?"none":`${b} ${y}s`;return/* @__PURE__ */(0,t.jsx)(f.chakra.div,{ref:r,className:T,__css:{animation:e},...E})}return/* @__PURE__ */(0,t.jsx)(m,{ref:r,className:T,...E,__css:{width:w?"fit-content":void 0,...a,...O,_dark:{...a._dark,...O},animation:N||`${j}s linear infinite alternate ${k}`}})});v.displayName="Skeleton"}),n("8623R",function(n,a){e(n.exports,"usePrevious",function(){return o});var t=r("8v0nu");function o(e){let r=(0,t.useRef)();return(0,t.useEffect)(()=>{r.current=e},[e]),r.current}}),n("872S0",function(n,a){e(n.exports,"useIsFirstRender",function(){return o});var t=r("8v0nu");function o(){let e=(0,t.useRef)(!0);return(0,t.useEffect)(()=>{e.current=!1},[]),e.current}}),n("aA7HY",function(n,a){e(n.exports,"PanelHeader",function(){return l});var t=r("kxTYF");r("8v0nu");var o=r("6Azda"),i=r("azOzW"),s=r("fkOSu");function l(e){let{suptitle:r,subtitle:n,heading:a,...l}=e;return/*#__PURE__*/(0,t.jsxs)(o.Flex,{as:"header",direction:"column",gap:2,mx:-4,px:4,pb:4,w:"100%",...l,children:[r&&/*#__PURE__*/(0,t.jsx)(s.Text,{as:"p",color:"base.400",children:r}),/*#__PURE__*/(0,t.jsx)(o.Flex,{gap:2,children:/*#__PURE__*/(0,t.jsx)(i.Heading,{size:"md",children:a})}),n&&/*#__PURE__*/(0,t.jsx)(s.Text,{as:"p",color:"base.400",mt:-2,children:n})]})}}),n("5AmRD",function(r,n){e(r.exports,"buildImgUrl",function(){return a});function a(e){return e.startsWith("http")?e:`https://developmentseed.org/gfts${e}`}});
//# sourceMappingURL=home.f7a7e961.js.map