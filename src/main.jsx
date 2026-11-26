import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);


/* Resolve transparent surfaces against their nearest painted ancestor so text
   remains readable in both the charcoal theme and legacy light components. */
function installSurfaceContrast(root) {
  const parse = value => {
    const match = value.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)/);
    return match ? match.slice(1,4).map(Number).concat(match[4] === undefined ? 1 : Number(match[4])) : null;
  };
  const blend = (color, base) => color ? base.map((channel,i) => color[i]*color[3]+channel*(1-color[3])) : base;
  const luminance = rgb => rgb.map(v => v/255).map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
  let frame = 0;
  function refresh() {
    frame = 0;
    const walk = (element, parent) => {
      if (!(element instanceof HTMLElement) || ['SCRIPT','STYLE','LINK','IMG','VIDEO','CANVAS'].includes(element.tagName)) return;
      const style = getComputedStyle(element);
      let surface = blend(parse(style.backgroundColor),parent);
      if (style.backgroundImage.includes('gradient(')) {
        const stops = (style.backgroundImage.match(/rgba?\([^)]*\)/g)||[]).map(parse).filter(Boolean);
        if (stops.length && !style.backgroundImage.includes('url(')) {
          surface = stops.map(stop=>blend(stop,surface)).reduce((sum,stop)=>sum.map((v,i)=>v+stop[i]),[0,0,0]).map(v=>v/stops.length);
        }
      }
      const light = luminance(surface) > .22;
      if (light) { if (element.dataset.portalLight !== 'true') element.dataset.portalLight = 'true'; }
      else if (element.hasAttribute('data-portal-light')) element.removeAttribute('data-portal-light');
      for (const child of element.children) walk(child,surface);
    };
    walk(root,[13,13,13]);
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(refresh); };
  new MutationObserver(schedule).observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','hidden','open']});
  window.addEventListener('resize',schedule,{passive:true});
  root.addEventListener('pointerover',schedule,{passive:true});
  root.addEventListener('pointerout',schedule,{passive:true});
  schedule();
}
installSurfaceContrast(document.getElementById('root'));
