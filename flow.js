const flow = [
  { id:"country", title:"Страна поездки", options:[
    {label:"Шенген", value:"schengen"},
    {label:"Россия", value:"ru"},
    {label:"Турция", value:"tr"},
    {label:"ОАЭ", value:"uae"},
  ]},
  { id:"already", title:"Вы уже в стране поездки?", options:[
    {label:"Нет", value:"no"},
    {label:"Да, уже там", value:"yes"},
  ]},
  { id:"type", title:"Тип покрытия", options:[
    {label:"Спокойный отдых", value:"calm"},
    {label:"Активный отдых", value:"active"},
    {label:"Опасные виды спорта", value:"risk"},
  ]},
  { id:"done", title:"Готово", options:[] }
];

let step = 0;
let selected = null;
const state = {};

const titleEl = document.getElementById("title");
const optsEl = document.getElementById("options");
const nextBtn = document.getElementById("next");
const bar = document.getElementById("bar");

function render(){
  const s = flow[step];
  titleEl.textContent = s.title;
  optsEl.innerHTML = "";
  selected = null;
  nextBtn.disabled = (s.options.length>0);

  bar.style.width = `${Math.round((step/(flow.length-1))*100)}%`;

  if(s.id==="done"){
    const pre = document.createElement("div");
    pre.className="opt";
    pre.style.justifyContent="flex-start";
    pre.innerHTML = `<div>
      <div style="font-weight:700;margin-bottom:6px;">Ваша персональная инструкция</div>
      <div style="opacity:.8;font-size:15px;line-height:1.4">
        Страна: ${state.country || "-"}<br/>
        Уже там: ${state.already || "-"}<br/>
        Тип: ${state.type || "-"}
      </div>
    </div>`;
    optsEl.appendChild(pre);
    nextBtn.textContent = "Скопировать";
    nextBtn.disabled = false;
    nextBtn.onclick = async () => {
      const text = `Инструкция:\nСтрана: ${state.country}\nУже там: ${state.already}\nТип: ${state.type}`;
      await navigator.clipboard.writeText(text);
      nextBtn.textContent = "Скопировано";
      setTimeout(()=>nextBtn.textContent="Скопировать",1200);
    };
    return;
  }

  nextBtn.textContent = "Продолжить";
  nextBtn.onclick = () => {
    state[s.id] = selected;
    step++;
    render();
  };

  s.options.forEach(o=>{
    const b = document.createElement("button");
    b.className="opt";
    b.innerHTML = `<span>${o.label}</span><span class="dot"></span>`;
    b.onclick = () => {
      [...optsEl.children].forEach(x=>x.classList.remove("selected"));
      b.classList.add("selected");
      selected = o.value;
      nextBtn.disabled = false;
    };
    optsEl.appendChild(b);
  });
}

render();
