(()=>{'use strict';
const $=s=>document.querySelector(s);const $$=s=>Array.from(document.querySelectorAll(s));
const base='assets/images/research/';
const forward={
 convection:{label:'Convection',img:'forward-convection.webp',rows:{'PINN':[.8514,.8989],'PINNsFormer':[.4527,.5217],'PINNMamba':[.0188,.0201],'TransSSM':[.000939,.001990]}},
 reaction:{label:'Reaction',img:'forward-reaction.webp',rows:{'PINN':[.9803,.9785],'PINNsFormer':[.0146,.0296],'PINNMamba':[.0094,.0217],'TransSSM':[.001140,.002130]}},
 wave:{label:'Wave',img:'forward-wave.webp',rows:{'PINN':[.4101,.4141],'PINNsFormer':[.3559,.3632],'PINNMamba':[.0197,.0199],'TransSSM':[.001260,.002250]}}
};
const inverse={
 wave:{label:'Wave',img:'inverse-wave.webp',rows:{'CABiSSM':[.02091,.02726,.002846,.976],'DeepONet':[.05467,.06937,.003514,.811],'FNOEnc':[.05128,.06562,.003816,.833]}},
 kdv:{label:'KdV',img:'inverse-kdv.webp',rows:{'CABiSSM':[.02396,.03203,.003381,.980],'DeepONet':[.08454,.10710,.005896,.743],'FNOEnc':[.08355,.10600,.006164,.747]}},
 sine:{label:'Sine-Gordon',img:'inverse-sine.webp',rows:{'CABiSSM':[.008344,.01131,.002719,.997],'DeepONet':[.05718,.09093,.003300,.803],'FNOEnc':[.05849,.09175,.004583,.800]}}
};
const fv=['rMAE','rRMSE'],iv=['MAE','relL2','gradMAE','varRatio'];
const st={forward:'convection',inverse:'wave'};
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const format=v=>v<.001?v.toFixed(6):v<.01?v.toFixed(6):v<.1?v.toFixed(5):v.toFixed(4);
function render(kind){
 const isF=kind==='forward',data=isF?forward:inverse, key=st[kind],v=data[key];
 const select=$(isF?'#forward-error':'#inverse-error'), metric=select.value;
 const index=(isF?fv:iv).indexOf(metric), primary=isF?'TransSSM':'CABiSSM';
 const values=Object.entries(v.rows).map(([name,arr])=>({name,value:arr[index]}));
 const max=Math.max(...values.map(x=>x.value));
 const area=$(isF?'#forward-chart':'#inverse-chart');
 area.innerHTML=values.map(({name,value})=>`<div class="exp-row ${name===primary?'is-highlight':''}"><span class="exp-model">${escape(name)}</span><div class="exp-track" title="${escape(name)} ${format(value)}"><div class="exp-bar" style="width:${(100*value/max).toFixed(4)}%"></div></div><output class="exp-val">${format(value)}</output></div>`).join('');
 const higher=metric==='varRatio';
 $(isF?'#forward-context':'#inverse-context').textContent=(isF?'101 × 101 space–time evaluation grid · ':'Full validation · ')+v.label+' · '+(higher?'closer to 1 is better':'lower is better')+'. Bars are linear; exact values appear alongside them.';
 $(isF?'#forward-table':'#inverse-table').innerHTML=`<table aria-label="${escape(v.label)} benchmark values"><thead><tr><th scope="col">Method</th><th scope="col">${escape(metric)}</th></tr></thead><tbody>${values.map(x=>`<tr><td>${escape(x.name)}</td><td class="${x.name===primary?'primary-value':''}">${format(x.value)}</td></tr>`).join('')}</tbody></table>`;
 const img=$(isF?'#forward-figure':'#inverse-figure'); img.src=base+v.img;img.alt=v.label+(isF?' PDE field: ground truth, prediction and error':' coefficient reconstruction: measured versus recovered');
 $(isF?'#forward-caption':'#inverse-caption').textContent=v.label+(isF?' · ground truth, prediction and absolute error':' · sparse observations and reconstructed coefficient');
 $$('[data-'+kind+']').forEach(b=>{let active=b.dataset[kind]===key;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
}
for(let kind of ['forward','inverse']){
  $$('[data-'+kind+']').forEach(b=>b.addEventListener('click',()=>{st[kind]=b.dataset[kind];render(kind)}));
  $(kind==='forward'?'#forward-error':'#inverse-error').addEventListener('change',()=>render(kind));
  render(kind);
}
})();