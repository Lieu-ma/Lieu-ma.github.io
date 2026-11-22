(()=>{'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
if(!$('#sim-factual'))return;
const N=128, frames=61, stepsPerFrame=5, dt=.002, PI=Math.PI;
let choice='d', factual=[], counter=[];
function fft(re,im,inverse=false){
 const n=re.length;for(let i=1,j=0;i<n;i++){let bit=n>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]];}}
 for(let len=2;len<=n;len<<=1){const a=(inverse?2:-2)*PI/len,cr=Math.cos(a),ci=Math.sin(a);for(let i=0;i<n;i+=len){let wr=1,wi=0;for(let j=0;j<len/2;j++){const p=i+j,q=p+len/2,vr=wr*re[q]-wi*im[q],vi=wr*im[q]+wi*re[q],ur=re[p],ui=im[p];re[p]=ur+vr;im[p]=ui+vi;re[q]=ur-vr;im[q]=ui-vi;const rr=wr*cr-wi*ci;wi=wr*ci+wi*cr;wr=rr;}}}
 if(inverse)for(let i=0;i<n;i++){re[i]/=n;im[i]/=n;}
}
function initial(){return Float64Array.from({length:N},(_,j)=>{const x=j/N;return .42+.20*Math.sin(2*PI*x)+.075*Math.sin(4*PI*x+.7)});}
// Numerical ETDRK1 integration of the advection–diffusion–reaction equation.
function simulatePath(D,v,lambda){
 let u=initial();let history=[Float32Array.from(u)];const er=new Float64Array(N),ei=new Float64Array(N),pr=new Float64Array(N),pi=new Float64Array(N);
 for(let k=0;k<N;k++){
  const kk=k<=N/2?k:k-N,omega=2*PI*kk,ar=-D*omega*omega,ai=(k===N/2?0:-v*omega),x=ar*dt,y=ai*dt;
  const e=Math.exp(x);er[k]=e*Math.cos(y);ei[k]=e*Math.sin(y);
  if(Math.hypot(x,y)<1e-5){pr[k]=1+x/2+(x*x-y*y)/6;pi[k]=y/2+x*y/3;}
  else{const a=er[k]-1,b=ei[k],den=x*x+y*y;pr[k]=(a*x+b*y)/den;pi[k]=(b*x-a*y)/den;}
 }
 for(let f=1;f<frames;f++){
  for(let step=0;step<stepsPerFrame;step++){
   const xr=Float64Array.from(u),xi=new Float64Array(N),nr=new Float64Array(N),ni=new Float64Array(N);
   for(let i=0;i<N;i++)nr[i]=lambda*u[i]*(1-u[i]);
   fft(xr,xi);fft(nr,ni);
   for(let k=0;k<N;k++){
    const a=er[k]*xr[k]-ei[k]*xi[k],b=er[k]*xi[k]+ei[k]*xr[k];
    const c=pr[k]*nr[k]-pi[k]*ni[k],d=pr[k]*ni[k]+pi[k]*nr[k];
    xr[k]=a+dt*c;xi[k]=b+dt*d;
   }
   fft(xr,xi,true);u=xr;
  }
  history.push(Float32Array.from(u));
 }
 return history;
}
const rgbStops=[[16,33,64],[35,91,128],[23,157,164],[140,202,136],[248,212,111]];
function color(x){let z=Math.max(0,Math.min(1,x))*4,i=Math.min(3,Math.floor(z)),a=z-i,l=rgbStops[i],r=rgbStops[i+1];return [0,1,2].map(k=>Math.round(l[k]+(r[k]-l[k])*a));}
function paint(canvas,path){
 const c=canvas.getContext('2d');const off=document.createElement('canvas');off.width=N;off.height=frames;const ctx=off.getContext('2d');const id=ctx.createImageData(N,frames);
 for(let t=0;t<frames;t++)for(let j=0;j<N;j++){
  const index=(t*N+j)*4;const [r,g,b]=color(path[t][j]);id.data[index]=r;id.data[index+1]=g;id.data[index+2]=b;id.data[index+3]=255;
 }
 ctx.putImageData(id,0,0);c.clearRect(0,0,canvas.width,canvas.height);c.imageSmoothingEnabled=true;c.drawImage(off,0,0,canvas.width,canvas.height);
}
const names={d:'do(D = 0)',v:'do(v = 0)',l:'do(λ = 0)',dv:'do(D = 0, v = 0)',dl:'do(D = 0, λ = 0)',vl:'do(v = 0, λ = 0)'};
function recompute(){
 const D=+$('#sim-d').value,v=+$('#sim-v').value,l=+$('#sim-l').value;
 $('#sim-d-value').textContent=D.toFixed(3);$('#sim-v-value').textContent=v.toFixed(2);$('#sim-l-value').textContent=l.toFixed(2);
 factual=simulatePath(D,v,l);counter=simulatePath(choice.includes('d')?0:D,choice.includes('v')?0:v,choice.includes('l')?0:l);
 $('#sim-cf-label').textContent='Changed conditions · '+names[choice].replace('do(','').replace(')','');
 paint($('#sim-factual'),factual);paint($('#sim-counter'),counter);
}
$$('#sim-d,#sim-v,#sim-l').forEach(input=>input.addEventListener('input',recompute));
$$('[data-cf]').forEach(btn=>btn.addEventListener('click',()=>{
 choice=btn.dataset.cf;
 $$('[data-cf]').forEach(el=>{const selected=el===btn;el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',String(selected));});
 recompute();
}));
$('#sim-reset').addEventListener('click',()=>{
 $('#sim-d').value=.04;$('#sim-v').value=.6;$('#sim-l').value=1.2;choice='d';
 $$('[data-cf]').forEach(el=>{const selected=el.dataset.cf==='d';el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',String(selected));});
 recompute();
});
recompute();
})();