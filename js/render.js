import { skillCatalog, skillDescriptions } from "./data.js";
import { MAX_SCORE, state } from "./state.js";
import {
  formatScoreBadge,
  getDisplayScore,
  getFeedbackStatusKey,
  getFeedbackStatusText,
  getLevelByScore,
  getOptionScore,
  getRecommendations,
  getSummaryByLevel
} from "./utils.js";

const root = document.getElementById("screen-root");

export function renderSkillSelection(onStartSkill) {
  const view = useTemplate("skill-template");
  const list = view.querySelector("#skill-list");

  skillCatalog.forEach(({ title, icon }) => {
    if (!state.skills.includes(title)) {
      return;
    }

    const btn = document.createElement("button");
    btn.className = "skill-card";
    btn.innerHTML = `<img src="assets/icons/${icon}.svg" class="skill-icon" alt="" aria-hidden="true"><p class="skill-title">${title}</p>`;
    btn.addEventListener("click", () => onStartSkill(title));
    list.appendChild(btn);
  });

  mount(view);
}

export function renderSkillIntro(onStartSimulation, onBackToSkills) {
  const skill = state.selectedSkill;
  const skillMeta = skillCatalog.find((item) => item.title === skill);
  const skillIcon = skillMeta ? skillMeta.icon : "target";
  const stepsCount = Array.isArray(state.currentScenario?.steps) ? state.currentScenario.steps.length : 4;
  const decisionsCount = Array.isArray(state.currentScenario?.steps)
    ? state.currentScenario.steps.filter((step) => step.type === "choice").length
    : 4;
  const description =
    skillDescriptions[skill] ||
    "Вы пройдете короткую симуляцию по управлению проектными ситуациями.";

  const intro = document.createElement("section");
  intro.className = "intro-screen";
  intro.innerHTML = `
    <button id="back-to-skills-btn" class="btn intro-back-btn">← Назад</button>
    <p class="intro-eyebrow">Навык</p>
    <h2 class="intro-title">
      <img src="assets/icons/${skillIcon}.svg" class="intro-skill-icon" alt="" aria-hidden="true">
      ${skill}
    </h2>

    <article class="card intro-card">
      <section class="intro-section">
        <h3>О навыке</h3>
        <p>${description}</p>
      </section>

      <section class="intro-section">
        <h3>Что вас ждет?</h3>
        <p>Принятие решений в проектных ситуациях с последующей обратной связью.</p>
      </section>

      <section class="intro-section">
        <h3>Параметры</h3>
        <p>Шаги: ${stepsCount}</p>
        <p>Решения: ${decisionsCount}</p>
        <p>Время: ~5 мин</p>
      </section>
    </article>

    <button id="begin-simulation-btn" class="btn intro-start-btn">Начать симуляцию</button>
  `;
  intro
    .querySelector("#begin-simulation-btn")
    .addEventListener("click", onStartSimulation);
  intro.querySelector("#back-to-skills-btn").addEventListener("click", () => {
    state.selectedSkill = "";
    state.currentScenario = null;
    onBackToSkills();
  });

  mount(intro);
}

export function renderSimulation(actions) {
  const { onBack, onNextStep, onComplete } = actions;

  if (!state.currentScenario || !Array.isArray(state.currentScenario.steps)) {
    root.innerHTML =
      '<article class="card"><h2>Нет данных</h2><p>Для выбранного навыка не найден сценарий.</p></article>';
    return;
  }

  if (state.currentStepIndex >= state.currentScenario.steps.length) {
    onComplete();
    return;
  }

  const step = state.currentScenario.steps[state.currentStepIndex];
  if (!step) {
    onComplete();
    return;
  }

  const view = useTemplate("simulation-template");
  const simulationCard = view.querySelector(".simulation-card");
  view.querySelector("#scenario-description").textContent = step.text;

  const totalSteps = state.currentScenario.steps.length;
  const currentStepNumber = state.currentStepIndex + 1;
  const progressPercent = Math.round((currentStepNumber / totalSteps) * 100);
  const scoreDisplay = `${getDisplayScore(state.totalScore)} / ${MAX_SCORE}`;
  const skillMeta = skillCatalog.find((item) => item.title === state.selectedSkill);
  const skillIcon = skillMeta ? skillMeta.icon : "target";
  const isBeforeChoice = step.type === "choice" && !state.isStepAnswered;
  simulationCard.classList.toggle("simulation-before", isBeforeChoice);

  const stepHeader = document.createElement("div");
  stepHeader.className = "step-header";
  stepHeader.innerHTML = `
    <div class="step-header-top">
      <button class="btn step-back-btn">← Назад</button>
    </div>
    <div class="step-skill-block">
      <p class="step-eyebrow">Навык</p>
      <h2 class="step-skill-title">
        <img src="assets/icons/${skillIcon}.svg" class="step-skill-icon" alt="" aria-hidden="true">
        ${state.selectedSkill}
      </h2>
    </div>
    <div class="step-progress-meta">Шаг ${currentStepNumber} из ${totalSteps} • ${scoreDisplay}</div>
    <div class="step-progress-track" role="progressbar" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
      <div class="step-progress-fill" style="width:${progressPercent}%"></div>
    </div>
  `;

  stepHeader.querySelector(".step-back-btn").addEventListener("click", () => {
    state.selectedSkill = "";
    state.currentScenario = null;
    state.currentStepIndex = 0;
    state.totalScore = 0;
    state.answersHistory = [];
    state.selectedAnswer = null;
    state.isStepAnswered = false;
    onBack();
  });

  view.querySelector("#step-header-slot").appendChild(stepHeader);

  const beforeAnswerBlock = view.querySelector("#before-answer-block");
  const afterAnswerBlock = view.querySelector("#after-answer-block");
  const answersWrap = view.querySelector("#answers");

  if (step.type === "info") {
    answersWrap.innerHTML = "";

    const nextBtn = document.createElement("button");
    nextBtn.className = "btn btn-primary";
    nextBtn.textContent = "Далее";
    nextBtn.addEventListener("click", onNextStep);
    answersWrap.appendChild(nextBtn);

    afterAnswerBlock.hidden = true;
    mount(view);
    return;
  }

  if (step.type === "choice") {
    if (!state.isStepAnswered) {
      beforeAnswerBlock.hidden = false;
      afterAnswerBlock.hidden = true;
      answersWrap.innerHTML = "";

      step.options.forEach((option) => {
        const btn = document.createElement("button");
        const isSelected = state.selectedAnswer && state.selectedAnswer.text === option.text;
        btn.className = `btn btn-answer${isSelected ? " is-selected" : ""}`;
        btn.textContent = option.text;

        btn.addEventListener("click", () => {
          state.selectedAnswer = {
            text: option.text,
            feedback: option.feedback,
            score: getOptionScore(option)
          };
          renderSimulation(actions);
        });

        answersWrap.appendChild(btn);
      });

      const submitBtn = document.createElement("button");
      submitBtn.className = "btn btn-primary before-submit-btn";
      submitBtn.textContent = "Ответить";
      submitBtn.disabled = !state.selectedAnswer;
      submitBtn.addEventListener("click", () => {
        if (!state.selectedAnswer || state.isStepAnswered) {
          return;
        }

        state.totalScore += state.selectedAnswer.score;
        state.isStepAnswered = true;
        state.answersHistory.push({
          stepId: step.id,
          stepText: step.text,
          selectedText: state.selectedAnswer.text,
          feedback: state.selectedAnswer.feedback,
          score: state.selectedAnswer.score
        });

        renderSimulation(actions);
      });

      answersWrap.appendChild(submitBtn);
      mount(view);
      return;
    }

    beforeAnswerBlock.hidden = true;
    afterAnswerBlock.hidden = false;

    const selectedAnswerContainer = view.querySelector("#selected-answer");
    const feedbackStatus = view.querySelector("#feedback-status");
    const feedbackText = view.querySelector("#feedback-text");
    const feedbackScoreBadge = view.querySelector("#feedback-score-badge");

    selectedAnswerContainer.innerHTML = `
      <div class="answer-option selected">
        ✓ ${state.selectedAnswer.text}
      </div>
    `;

    const statusText = getFeedbackStatusText(state.selectedAnswer.score);
    const statusKey = getFeedbackStatusKey(state.selectedAnswer.score);

    feedbackStatus.textContent = statusText;
    feedbackStatus.className = `feedback-status ${statusKey}`;

    feedbackText.textContent = state.selectedAnswer.feedback;

    feedbackScoreBadge.textContent = formatScoreBadge(state.selectedAnswer.score);
    feedbackScoreBadge.className = `score-badge ${statusKey}`;

    const nextStepBtn = document.createElement("button");
    nextStepBtn.className = "btn btn-primary after-next-btn";
    nextStepBtn.textContent = "Следующий шаг →";
    nextStepBtn.addEventListener("click", onNextStep);

    afterAnswerBlock.appendChild(nextStepBtn);
  }

  mount(view);
}

export function renderFinalSummary(onRetry, onToSkills) {
  const view = useTemplate("summary-template");
  const score = getDisplayScore(state.totalScore);
  const level = getLevelByScore(score);
  const list = view.querySelector("#summary-list");
  list.innerHTML = "";

  view.querySelector("#summary-skill").textContent = state.selectedSkill;
  view.querySelector("#summary-score-main").textContent = score;
  view.querySelector("#summary-score-total").textContent = `/${MAX_SCORE}`;
  view.querySelector("#summary-level").textContent = getLevelLabel(level);
  view.querySelector("#summary-description").textContent = getSummaryByLevel(level);

  getRecommendations(level, state.answersHistory).forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    list.appendChild(item);
  });

  const retryBtn = view.querySelector("#restart-btn");
  retryBtn.addEventListener("click", onRetry);

  const toSkillsBtn = view.querySelector("#summary-to-skills-btn");
  toSkillsBtn.addEventListener("click", onToSkills);

  mount(view);
}

function getLevelLabel(level) {
  if (level === "high") {
    return "Высокий уровень";
  }
  if (level === "medium") {
    return "Средний уровень";
  }
  return "Базовый уровень";
}

export function useTemplate(templateId) {
  return document.getElementById(templateId).content.cloneNode(true);
}

export function mount(content) {
  root.innerHTML = "";
  root.appendChild(content);
}
