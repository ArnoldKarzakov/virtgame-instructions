const $ = (id) => document.getElementById(id);

const state = {
  region: "Турция",
  vpnNeeded: true,
  hasXboxApp: true,
};

// Тестовый ssconf (поставь свой реальный)
const SS_CONF = "ssconf://obeshbarmak.kz/vanya/e537633a-afe9-43ef-98af-660a1d25f444";

const steps = [
  {
    key: "params",
    progress: 5,
    pill: "Инструкция для Xbox ключей",
    render: () => `
      <div class="h1">Укажите параметры ключа, инструкция подстроится под вас.</div>

      <div class="label">Ваш регион ключа</div>
      <select class="select" id="region">
        ${["Шенген","Россия","Турция","ОАЭ","Армения","Грузия","Таиланд","Сербия","Италия","Весь мир"]
          .map(r => `<option value="${r}" ${state.region===r?"selected":""}>${r}</option>`).join("")}
      </select>

      <div class="label">Вам нужен VPN?</div>
      <div class="segment" role="tablist" aria-label="vpn">
        <button class="seg-btn ${state.vpnNeeded?"active":""}" id="vpnYes">Да</button>
        <button class="seg-btn ${!state.vpnNeeded?"active":""}" id="vpnNo">Нет</button>
      </div>

      <div class="label">У вас есть приложение Xbox App?</div>
      <div class="segment" role="tablist" aria-label="xboxapp">
        <button class="seg-btn ${state.hasXboxApp?"active":""}" id="appYes">Да</button>
        <button class="seg-btn ${!state.hasXboxApp?"active":""}" id="appNo">Нет</button>
      </div>
    `,
    onMount: () => {
      $("region").onchange = (e) => state.region = e.target.value;

      $("vpnYes").onclick = () => { state.vpnNeeded = true; render(); };
      $("vpnNo").onclick  = () => { state.vpnNeeded = false; render(); };

      $("appYes").onclick = () => { state.hasXboxApp = true; render(); };
      $("appNo").onclick  = () => { state.hasXboxApp = false; render(); };
    },
    next: () => state.vpnNeeded ? "step2" : "doneNoVpn"
  },

  {
    key: "step2",
    progress: 20,
    pill: "Шаг 2. Скачиваем VPN",
    render: () => `
      <div class="h1">Скачиваем Дядя Ваня VPN на ваше устройство по ссылке ниже</div>
      <div class="p">Ссылка: <span style="font-weight:900;">vanyavpn.as/app</span></div>
      <div class="p">Выбираем из списка ваше устройство и устанавливаем.</div>
      <div class="imgwrap"><img class="img" src="assets/step2.png" alt="Step 2"/></div>
    `,
    next: () => "step3"
  },

  {
    key: "step3",
    progress: 40,
    pill: "Шаг 3. Устанавливаем VPN",
    render: () => `
      <div class="h1">Устанавливаем приложение и заходим в него, вы увидите следующий экран:</div>
      <div class="imgwrap"><img class="img" src="assets/step3.png" alt="Step 3"/></div>
    `,
    next: () => "step4"
  },

  {
    key: "step4",
    progress: 60,
    pill: "Шаг 4. Добавляем VPN",
    render: () => `
      <div class="h1">Скопируйте ключ ниже, далее нажмите «Добавить ключ Дяди Вани» и вставьте ключ.</div>
      <div class="code" id="ssconf">${SS_CONF}</div>
      <div class="row">
        <button class="small" id="copy">Скопировать</button>
        <button class="small" id="open">Открыть ссылку</button>
      </div>
      <div class="imgwrap"><img class="img" src="assets/step4.png" alt="Step 4"/></div>
    `,
    onMount: () => {
      $("copy").onclick = async () => {
        try {
          await navigator.clipboard.writeText(SS_CONF);
          $("copy").textContent = "Скопировано";
          setTimeout(()=>$("copy").textContent="Скопировать", 1100);
        } catch {}
      };
      $("open").onclick = () => {
        // если iOS/Android поддерживает ssconf, откроется сразу приложение
        window.location.href = SS_CONF;
      };
    },
    next: () => "step5"
  },

  {
    key: "step5",
    progress: 80,
    pill: "Шаг 5. Проверяем VPN",
    render: () => `
      <div class="h1">После успешного добавления появится вот такое изображение</div>
      <div class="imgwrap"><img class="img" src="assets/step5.png" alt="Step 5"/></div>
    `,
    next: () => "done"
  },

  {
    key: "doneNoVpn",
    progress: 100,
    pill: "Готово",
    render: () => `
      <div class="h1">VPN не нужен</div>
      <div class="p">Регион ключа: <span style="font-weight:900;">${state.region}</span></div>
      <div class="p">Xbox App: <span style="font-weight:900;">${state.hasXboxApp ? "Есть" : "Нет"}</span></div>
      <div class="hr"></div>
      <div class="p">Дальше я могу показать вам инструкцию активации без VPN (следующим экраном), когда ты добавишь контент.</div>
    `,
    next: () => "params"
  },

  {
    key: "done",
    progress: 100,
    pill: "Готово",
    render: () => `
      <div class="h1">VPN готов ✅</div>
      <div class="p">Регион ключа: <span style="font-weight:900;">${state.region}</span></div>
      <div class="p">Xbox App: <span style="font-weight:900;">${state.hasXboxApp ? "Есть" : "Нет"}</span></div>
      <div class="hr"></div>
      <div class="p">Следующий шаг — экран активации ключа в Microsoft Store / Xbox App (добавим как Step 6).</div>
    `,
    next: () => "params"
  },
];

let currentKey = "params";

function getStep(key){ return steps.find(s => s.key === key); }

function render(){
  const s = getStep(currentKey);
  $("bar").style.width = `${s.progress}%`;
  $("pill").textContent = s.pill;

  const content = $("content");
  content.classList.remove("fade");
  content.innerHTML = s.render();
  void content.offsetWidth;
  content.classList.add("fade");

  if (s.onMount) s.onMount();

  const nextBtn = $("next");
  nextBtn.textContent = (s.key === "step4") ? "Продолжить" : "Продолжить";
  nextBtn.onclick = () => {
    const nextKey = (typeof s.next === "function") ? s.next() : s.next;
    currentKey = nextKey;
    render();
  };
}

render();
