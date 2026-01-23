const $ = (id) => document.getElementById(id);

const REGIONS = [
  "США","Австралия","Аргентина","Великобритания","Германия","Греция","Гонконг",
  "Индия","Мексика","Новая Зеландия","Норвегия","Сингапур","Тайвань","Турция",
  "Украина","Швеция","Южная Корея","Япония"
];

const state = {
  region: REGIONS[0],
  vpnNeeded: true,
  vpnTermsAccepted: false,
};

const SS_CONF = "ssconf://obeshbarmak.kz/vanya/e537633a-afe9-43ef-98af-660a1d25f444";

const steps = [
  {
    key: "params",
    progress: 8,
    pill: "Инструкция для Xbox ключей",
    nextLabel: "Далее",
    render: () => `
      <div class="h1">Ваш регион ключа? (Указан в письме от Яндекс, в скобках справа от ключа)</div>

      <div class="label">Регион ⌄</div>
      <select class="select" id="region">
        ${REGIONS.map(r => `<option value="${r}" ${state.region===r?"selected":""}>${r}</option>`).join("")}
      </select>

      <div class="label">Вам нужен VPN?</div>
      <div class="segment" role="tablist" aria-label="vpn">
        <button class="seg-btn ${state.vpnNeeded?"active":""}" id="vpnYes">Да</button>
        <button class="seg-btn ${!state.vpnNeeded?"active":""}" id="vpnNo">Нет</button>
      </div>

      ${state.vpnNeeded ? `
        <div class="checkboxRow">
          <div class="label">Условия использования VPN (нажмите для ознакомления)</div>
          <button class="termsLink" id="openTerms">Ознакомиться с условиями</button>

          <label class="check">
            <input type="checkbox" id="acceptTerms" ${state.vpnTermsAccepted ? "checked":""}/>
            <span>Я согласен, с условиями</span>
          </label>
        </div>
      ` : ``}

      <div class="beta">БЕТА ВЕРСИЯ</div>
    `,
    onMount: () => {
      $("region").onchange = (e) => state.region = e.target.value;

      $("vpnYes").onclick = () => {
        state.vpnNeeded = true;
        render();
      };
      $("vpnNo").onclick  = () => {
        state.vpnNeeded = false;
        state.vpnTermsAccepted = false;
        render();
      };

      if (state.vpnNeeded) {
        $("openTerms").onclick = () => openModal("termsModal");
        $("acceptTerms").onchange = (e) => {
          state.vpnTermsAccepted = e.target.checked;
          syncNextDisabled();
        };
      }
      syncNextDisabled();
    },
    next: () => (state.vpnNeeded ? "step2" : "doneNoVpn")
  },

  {
    key: "step2",
    progress: 28,
    pill: "Шаг 2. Скачиваем VPN",
    nextLabel: "Продолжить",
    render: () => `
      <div class="h1">Скачиваем Дядя Ваня VPN на ваше устройство по ссылке ниже</div>
      <div class="p">Ссылка: <span style="font-weight:950;">vanyavpn.as/app</span></div>
      <div class="p">Выбираем из списка ваше устройство и устанавливаем.</div>
      <div class="imgwrap"><img class="img" src="assets/step2.png" alt="Step 2"/></div>
    `,
    next: () => "step3"
  },

  {
    key: "step3",
    progress: 50,
    pill: "Шаг 3. Устанавливаем VPN",
    nextLabel: "Продолжить",
    render: () => `
      <div class="h1">Устанавливаем приложение и заходим в него, вы увидите следующий экран:</div>
      <div class="imgwrap"><img class="img" src="assets/step3.png" alt="Step 3"/></div>
    `,
    next: () => "step4"
  },

  {
    key: "step4",
    progress: 70,
    pill: "Шаг 4. Добавляем VPN",
    nextLabel: "Продолжить",
    render: () => `
      <div class="h1">Скопируйте ключ ниже, далее нажмите «Добавить ключ Дяди Вани» и вставьте ключ.</div>
      <div class="p" style="font-weight:900;margin-bottom:10px;">${SS_CONF}</div>

      <div class="hr"></div>

      <div class="p" style="margin-bottom:10px;">Нажмите «Открыть ссылку», если устройство поддерживает ssconf — откроется приложение.</div>
      <div style="display:flex;gap:10px;">
        <button class="btn" id="copy">Скопировать</button>
        <button class="btn" id="open">Открыть ссылку</button>
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
      $("open").onclick = () => { window.location.href = SS_CONF; };
    },
    next: () => "step5"
  },

  {
    key: "step5",
    progress: 88,
    pill: "Шаг 5. Проверяем VPN",
    nextLabel: "Продолжить",
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
    nextLabel: "В начало",
    render: () => `
      <div class="h1">VPN не нужен</div>
      <div class="p">Регион ключа: <span style="font-weight:950;">${state.region}</span></div>
      <div class="hr"></div>
      <div class="p">Следующий экран: инструкция активации без VPN (добавим позже).</div>
    `,
    next: () => "params"
  },

  {
    key: "done",
    progress: 100,
    pill: "Готово",
    nextLabel: "В начало",
    render: () => `
      <div class="h1">VPN готов</div>
      <div class="p">Регион ключа: <span style="font-weight:950;">${state.region}</span></div>
      <div class="hr"></div>
      <div class="p">Следующий экран: активация ключа (Step 6) — добавим позже.</div>
    `,
    next: () => "params"
  },
];

let currentKey = "params";

function getStep(key){ return steps.find(s => s.key === key); }

function openModal(id){
  const m = $(id);
  m.classList.add("show");
  m.setAttribute("aria-hidden", "false");
}
function closeModal(id){
  const m = $(id);
  m.classList.remove("show");
  m.setAttribute("aria-hidden", "true");
}

function syncNextDisabled(){
  const s = getStep(currentKey);
  const nextBtn = $("next");

  if (s.key === "params") {
    if (state.vpnNeeded) {
      nextBtn.disabled = !state.vpnTermsAccepted;
    } else {
      nextBtn.disabled = false;
    }
  } else {
    nextBtn.disabled = false;
  }
}

function render(){
  const s = getStep(currentKey);

  $("bar").style.width = `${s.progress}%`;
  $("pill").textContent = s.pill;

  const content = $("content");
  content.classList.remove("fade");
  content.innerHTML = s.render();
  void content.offsetWidth;
  content.classList.add("fade");

  const nextBtn = $("next");
  nextBtn.textContent = s.nextLabel || "Продолжить";
  nextBtn.onclick = () => {
    const nextKey = (typeof s.next === "function") ? s.next() : s.next;
    currentKey = nextKey;
    render();
  };

  if (s.onMount) s.onMount();

  // help button works on every screen
  $("helpBtn").onclick = () => openModal("helpModal");

  // modal close wiring (once is enough but safe here)
  $("helpClose").onclick = () => closeModal("helpModal");
  $("termsClose").onclick = () => closeModal("termsModal");

  // close modals on background click
  $("helpModal").onclick = (e) => { if (e.target.id === "helpModal") closeModal("helpModal"); };
  $("termsModal").onclick = (e) => { if (e.target.id === "termsModal") closeModal("termsModal"); };

  syncNextDisabled();
}

render();
