const byId = (id) => document.getElementById(id);

/**
 * Возвращает обязательный DOM-элемент.
 * Если элемент не найден — бросает ошибку с понятным текстом.
 */
function requireElement(id) {
  const element = byId(id);
  if (!element) {
    throw new Error(`Не найден обязательный элемент #${id}`);
  }
  return element;
}

const REGIONS = [
  "США",
  "Австралия",
  "Аргентина",
  "Великобритания",
  "Германия",
  "Греция",
  "Гонконг",
  "Индия",
  "Мексика",
  "Новая Зеландия",
  "Норвегия",
  "Сингапур",
  "Тайвань",
  "Турция",
  "Украина",
  "Швеция",
  "Южная Корея",
  "Япония",
];

const STEP_KEYS = Object.freeze({
  PARAMS: "params",
  DOWNLOAD: "step2",
  INSTALL: "step3",
  ADD_KEY: "step4",
  VERIFY: "step5",
  DONE_NO_VPN: "doneNoVpn",
  DONE: "done",
});

const state = {
  region: REGIONS[0],
  vpnNeeded: true,
  vpnTermsAccepted: false,
};

// Поставьте свой реальный ssconf.
const SS_CONFIG_URL = "ssconf://obeshbarmak.kz/vanya/e537633a-afe9-43ef-98af-660a1d25f444";

function renderRegionOption(region) {
  const selected = state.region === region ? "selected" : "";
  return `<option value="${region}" ${selected}>${region}</option>`;
}

const steps = {
  [STEP_KEYS.PARAMS]: {
    progress: 8,
    pill: "Инструкция для Xbox ключей",
    nextLabel: "Далее",
    render: () => `
      <div class="h1">Ваш регион ключа? (Указан в письме от Яндекс, в скобках справа от ключа)</div>

      <div class="label">Регион</div>
      <select class="select" id="region">
        ${REGIONS.map(renderRegionOption).join("")}
      </select>

      <div class="label">Вам нужен VPN?</div>
      <div class="segment" role="tablist" aria-label="vpn">
        <button class="seg-btn ${state.vpnNeeded ? "active" : ""}" id="vpnYes" type="button">Да</button>
        <button class="seg-btn ${!state.vpnNeeded ? "active" : ""}" id="vpnNo" type="button">Нет</button>
      </div>

      ${
        state.vpnNeeded
          ? `
            <div class="checkboxRow">
              <div class="label">Условия использования VPN (нажмите для ознакомления)</div>
              <button class="termsLink" id="openTerms" type="button">Ознакомиться с условиями</button>

              <label class="check" for="acceptTerms">
                <input type="checkbox" id="acceptTerms" ${state.vpnTermsAccepted ? "checked" : ""}/>
                <span>Я согласен с условиями</span>
              </label>
            </div>
          `
          : ""
      }

      <div class="beta">БЕТА ВЕРСИЯ</div>
    `,
    onMount: () => {
      requireElement("region").addEventListener("change", (event) => {
        state.region = event.target.value;
      });

      requireElement("vpnYes").addEventListener("click", () => {
        state.vpnNeeded = true;
        render();
      });

      requireElement("vpnNo").addEventListener("click", () => {
        state.vpnNeeded = false;
        state.vpnTermsAccepted = false;
        render();
      });

      if (state.vpnNeeded) {
        requireElement("openTerms").addEventListener("click", () => openModal("termsModal"));

        requireElement("acceptTerms").addEventListener("change", (event) => {
          state.vpnTermsAccepted = event.target.checked;
          syncNextButtonState();
        });
      }

      syncNextButtonState();
    },
    next: () => (state.vpnNeeded ? STEP_KEYS.DOWNLOAD : STEP_KEYS.DONE_NO_VPN),
  },

  [STEP_KEYS.DOWNLOAD]: {
    progress: 28,
    pill: "Шаг 2. Скачиваем VPN",
    nextLabel: "Продолжить",
    render: () => `
      <div class="h1">Скачиваем Дядя Ваня VPN на ваше устройство по ссылке ниже</div>
      <div class="p">Ссылка: <span class="textStrong">vanyavpn.as/app</span></div>
      <div class="p">Выбираем из списка ваше устройство и устанавливаем.</div>
      <div class="imgwrap"><img class="img" src="assets/step2.png" alt="Шаг 2"/></div>
    `,
    next: STEP_KEYS.INSTALL,
  },

  [STEP_KEYS.INSTALL]: {
    progress: 50,
    pill: "Шаг 3. Устанавливаем VPN",
    nextLabel: "Продолжить",
    render: () => `
      <div class="h1">Устанавливаем приложение и заходим в него, вы увидите следующий экран:</div>
      <div class="imgwrap"><img class="img" src="assets/step3.png" alt="Шаг 3"/></div>
    `,
    next: STEP_KEYS.ADD_KEY,
  },

  [STEP_KEYS.ADD_KEY]: {
    progress: 70,
    pill: "Шаг 4. Добавляем VPN",
    nextLabel: "Продолжить",
    render: () => `
      <div class="h1">Скопируйте ключ ниже, далее нажмите «Добавить ключ Дяди Вани» и вставьте ключ.</div>
      <div class="p textStrong keyValue">${SS_CONFIG_URL}</div>

      <div class="hr"></div>

      <div class="p copyHint">Можно нажать «Открыть ссылку», если устройство поддерживает ssconf.</div>
      <div class="actionsRow">
        <button class="btn" id="copy" type="button">Скопировать</button>
        <button class="btn" id="open" type="button">Открыть ссылку</button>
      </div>

      <div class="imgwrap"><img class="img" src="assets/step4.png" alt="Шаг 4"/></div>
    `,
    onMount: () => {
      requireElement("copy").addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(SS_CONFIG_URL);
          const copyButton = requireElement("copy");
          copyButton.textContent = "Скопировано";
          setTimeout(() => {
            copyButton.textContent = "Скопировать";
          }, 1100);
        } catch (error) {
          const copyButton = requireElement("copy");
          copyButton.textContent = "Ошибка";
          setTimeout(() => {
            copyButton.textContent = "Скопировать";
          }, 1100);
        }
      });

      requireElement("open").addEventListener("click", () => {
        window.location.href = SS_CONFIG_URL;
      });
    },
    next: STEP_KEYS.VERIFY,
  },

  [STEP_KEYS.VERIFY]: {
    progress: 88,
    pill: "Шаг 5. Проверяем VPN",
    nextLabel: "Продолжить",
    render: () => `
      <div class="h1">После успешного добавления появится вот такое изображение</div>
      <div class="imgwrap"><img class="img" src="assets/step5.png" alt="Шаг 5"/></div>
    `,
    next: STEP_KEYS.DONE,
  },

  [STEP_KEYS.DONE_NO_VPN]: {
    progress: 100,
    pill: "Готово",
    nextLabel: "В начало",
    render: () => `
      <div class="h1">VPN не нужен</div>
      <div class="p">Регион ключа: <span class="textStrong">${state.region}</span></div>
      <div class="hr"></div>
      <div class="p">Дальше можно добавить экран активации без VPN.</div>
    `,
    next: STEP_KEYS.PARAMS,
  },

  [STEP_KEYS.DONE]: {
    progress: 100,
    pill: "Готово",
    nextLabel: "В начало",
    render: () => `
      <div class="h1">VPN готов</div>
      <div class="p">Регион ключа: <span class="textStrong">${state.region}</span></div>
      <div class="hr"></div>
      <div class="p">Следующий шаг — экран активации ключа (Step 6).</div>
    `,
    next: STEP_KEYS.PARAMS,
  },
};

let currentStepKey = STEP_KEYS.PARAMS;

function getStep(stepKey) {
  const step = steps[stepKey];
  if (!step) {
    throw new Error(`Неизвестный шаг: ${stepKey}`);
  }
  return step;
}

function setModalVisibility(modalId, isVisible) {
  const modal = requireElement(modalId);
  modal.classList.toggle("show", isVisible);
  modal.setAttribute("aria-hidden", String(!isVisible));
}

function openModal(modalId) {
  setModalVisibility(modalId, true);
}

function closeModal(modalId) {
  setModalVisibility(modalId, false);
}

function bindModalCloseOnBackdrop(modalId) {
  const modal = requireElement(modalId);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal(modalId);
    }
  });
}

function syncNextButtonState() {
  const nextButton = requireElement("next");

  if (currentStepKey === STEP_KEYS.PARAMS) {
    nextButton.disabled = state.vpnNeeded ? !state.vpnTermsAccepted : false;
    return;
  }

  nextButton.disabled = false;
}

function bindGlobalUi() {
  requireElement("helpBtn").addEventListener("click", () => openModal("helpModal"));
  requireElement("helpClose").addEventListener("click", () => closeModal("helpModal"));
  requireElement("termsClose").addEventListener("click", () => closeModal("termsModal"));

  bindModalCloseOnBackdrop("helpModal");
  bindModalCloseOnBackdrop("termsModal");
}

function resolveNextStepKey(step) {
  return typeof step.next === "function" ? step.next() : step.next;
}

function render() {
  const step = getStep(currentStepKey);

  requireElement("bar").style.width = `${step.progress}%`;
  requireElement("pill").textContent = step.pill;

  const content = requireElement("content");
  content.classList.remove("fade");
  content.innerHTML = step.render();
  void content.offsetWidth;
  content.classList.add("fade");

  const nextButton = requireElement("next");
  nextButton.textContent = step.nextLabel || "Продолжить";
  nextButton.onclick = () => {
    currentStepKey = resolveNextStepKey(step);
    render();
  };

  if (typeof step.onMount === "function") {
    step.onMount();
  }

  syncNextButtonState();
}

bindGlobalUi();
render();
