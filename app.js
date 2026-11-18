const T=[
  {n:"Potato",c:"badge",cn:"Бейдж",i:"🥔",img:"",u:"Potato Obby в лобби + 950 шлепков",p:"350",d:"420 DPS",a:"Прокачивается до Fries; нужна для Cult.",l:["Ур.1: 350 | Урон 25 | КД 1.0s","Ур.5: 4,500 | Урон 210 | КД 0.5s"]},
  {n:"Cult",c:"badge",cn:"Бейдж",i:"🧙‍♂️",img:"",u:"Встать в группу башен Potato Fries",p:"600",d:"7,140 DPS",a:"Усиливает урон за соседних Cult.",l:["Ур.1: 600 | Урон 40 | КД 1.2s","Ур.5: 8,000 | Урон 500+ | КД 0.7s"]},
  {n:"Confusion",c:"badge",cn:"Бейдж",i:"😵‍💫",img:"",u:"Удар по 1 мобу: Snow, STOP, Plague, Boogie",p:"1,500",d:"929 DPS",a:"Разворачивает врагов назад по тропинке.",l:["Ур.1: 1,500 | Урон 125 | КД 2.0s","Ур.5: 12,500 | Урон 650 | КД 0.7s"]},
  {n:"Orbit",c:"badge",cn:"Бейдж",i:"🪐",img:"",u:"Пройти Orbit Maze на Rocky Island",p:"4,300",d:"8,200 DPS",a:"Выстрел каждые 0.02 сек на макс. уровне.",l:["Ур.1: 4,300 | Урон 35 | КД 0.2s","Ур.5: 135,000 | Урон 164 | КД 0.02s"]},
  {n:"Bind",c:"badge",cn:"Бейдж",i:"⛓️",img:"",u:"Пройти лабиринт Bind Maze",p:"2,200",d:"1,150 DPS",a:"Обездвиживает врагов цепями.",l:["Ур.1: 2,200 | Урон 90 | КД 1.8s","Ур.5: 24,000 | Урон 460 | КД 0.4s"]},
  {n:"Knockoff",c:"badge",cn:"Бейдж",i:"🎭",img:"",u:"5 цветных кодов + лабиринт + 5,555 звезд",p:"1,000",d:"4,500 DPS",a:"Отбрасывает мобов и бьет по области.",l:["Ур.1: 1,000 | Урон 110 | КД 1.5s","Ур.5: 45,000 | Урон 1,800 | КД 0.4s"]},
  {n:"Bob",c:"badge",cn:"Бейдж",i:"👤",img:"",u:"Шанс 1 к 30,000 от макс. Replica",p:"100,000",d:"15,000+ DPS",a:"Поглощает врагов и сносит боссов.",l:["Ур.1: 100,000 | Урон 2,500","Ур.5: 250,000 | Урон 9,000"]},
  {n:"Moai",c:"badge",cn:"Бейдж",i:"🗿",img:"",u:"Двоичный код и азбука Морзе",p:"5,000",d:"6,800 DPS",a:"Оглушает ударной волной.",l:["Ур.1: 5,000 | Урон 400","Ур.5: 65,000 | Урон 5,400"]},
  {n:"Replica",c:"shop",cn:"Магазин",i:"👥",img:"",u:"Магазин (8,500 звезд)",p:"1,200",d:"1,800 DPS",a:"Призывает клонов навстречу врагам.",l:["Ур.1: 1,200 | Урон 80","Ур.5: 18,000 | Урон 600"]},
  {n:"STOP",c:"bunker",cn:"Бункер",i:"🛑",img:"",u:"Бункер (Bunker Shop)",p:"1,800",d:"950 DPS",a:"Замораживает время вокруг себя.",l:["Ур.1: 1,800 | Урон 70","Ур.5: 21,000 | Урон 475"]},
  {n:"Psycho",c:"map",cn:"Карта Limbo",i:"🔮",img:"",u:"Победа на карте Limbo",p:"3,500",d:"5,400 DPS",a:"Бросает врагов назад телекинезом.",l:["Ур.1: 3,500 | Урон 320","Ур.5: 52,000 | Урон 2,700"]}
];
const B=[
  {n:"1. Potato (Очень легко)",s:["Найди картошку за порталами в лобби.","Пройди Potato Obby.","Купи башню за 950 шлепков."]},
  {n:"2. Cult (Легко)",s:["Поставь несколько Potato в одну точку.","Прокачай до уровня Fries и встань в центр."]},
  {n:"3. Confusion (Средне)",s:["Возьми Snow, STOP, Plague и Boogie.","Поставь рядом на Desert и ударь босса одновременно."]},
  {n:"4. Orbit и Bind (Средне)",s:["На Rocky Island зайди в лабиринты в конце пути.","Дойди до финишных перчаток."]},
  {n:"5. Knockoff (Сложно)",s:["Собери 5 цветных кодов на Desert, Garden, Rocky Island, Future и Void.","Введи по порядку цветов в лабиринте на Rocky Island и купи за 5,555 звезд."]},
  {n:"6. Bob (Очень сложно)",s:["Купи Replica за 8,500 звезд и прокачай до 5 уровня.","Жди спавна Боба (шанс 1 к 30,000)."]},
  {n:"7. Moai (Экстрим)",s:["Пройди лабиринт на Rocky Island, переведи двоичный код и азбуку Морзе."]}
];
const M=[
  {n:"Desert",d:"Легкая",r:"Coil + Звезды",i:"🏜️",img:"",o:"Стартовая карта. Удобна для фарма Confusion на боссе."},
  {n:"Garden",d:"Легкая",r:"Retro + Звезды",i:"🌻",img:"",o:"Удобные повороты для башен по области."},
  {n:"Rocky Island",d:"Средняя",r:"Elude + Лабиринты",i:"🏝️",img:"",o:"Входы к Orbit, Bind, Knockoff и Moai."},
  {n:"Future",d:"Сложная",r:"Stun + Звезды",i:"🤖",img:"",o:"Быстрые враги. Отлично для фарма с Replica."},
  {n:"Void",d:"Очень сложная",r:"Nightmare + Звезды",i:"🌌",img:"",o:"Требует высокого DPS."},
  {n:"Limbo",d:"Экстрим",r:"Psycho",i:"👁️",img:"",o:"Самая сложная карта в игре."}
];
let f="all";
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x)e.textContent=x;return e;};
function go(id,b){document.querySelectorAll(".sec").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));document.getElementById(id).classList.add("active");b.classList.add("active");}
function setF(x,b){f=x;document.querySelectorAll(".fb").forEach(e=>e.classList.remove("active"));b.classList.add("active");drawT();}
function card(it,tg,sb,ft,fn){const c=el("div","card");if(fn)c.onclick=fn;const im=el("div","img");if(it.img){const p=el("img");p.src=it.img;im.appendChild(p);}else im.textContent=it.i;im.appendChild(el("span","tag",tg));const bd=el("div","body");bd.append(el("div","title",it.n),el("div","desc",sb),el("div","st",ft));c.append(im,bd);return c;}
function drawT(){const q=document.getElementById("qT").value.toLowerCase(),g=document.getElementById("gT");g.innerHTML="";T.filter(t=>(f==="all"||t.c===f)&&t.n.toLowerCase().includes(q)).forEach(t=>g.appendChild(card(t,t.cn,t.a,"Цена: "+t.p+" | "+t.d,()=>{const m=document.getElementById("mC");m.innerHTML="";m.append(el("h3","",t.i+" "+t.n),el("p","desc","Получение: "+t.u),el("p","desc",t.a));t.l.forEach(r=>m.appendChild(el("div","lvl-row",r)));document.getElementById("mod").classList.add("open");})));}
B.forEach(b=>{const d=el("div","b-item"),o=el("ol");b.s.forEach(s=>o.appendChild(el("li","",s)));d.append(el("h3","",b.n),o);document.getElementById("gB").appendChild(d);});
M.forEach(m=>document.getElementById("gM").appendChild(card(m,m.d,m.o,"Награда: "+m.r)));
drawT();
