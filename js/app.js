import { getScenarioBySkill, loadScenarios, skillCatalog } from "./data.js";
import {
  renderFinalSummary,
  renderSimulation,
  renderSkillIntro,
  renderSkillSelection
} from "./render.js";
import { resetSimulationState, state } from "./state.js";

init();

async function init() {
  try {
    state.scenariosBySkill = await loadScenarios();
    state.skills = skillCatalog
      .map((item) => item.title)
      .filter((skill) => Array.isArray(state.scenariosBySkill[skill]));

    renderSkillSelection(startSkill);
  } catch (error) {
    const root = document.getElementById("screen-root");
    root.innerHTML = `<article class="card"><h2>Error</h2><p>${error.message}</p></article>`;
  }
}

function startSkill(skill) {
  state.selectedSkill = skill;
  state.currentScenario = getScenarioBySkill(state.scenariosBySkill, skill);
  state.currentStepIndex = 0;
  state.totalScore = 0;
  state.answersHistory = [];
  state.selectedAnswer = null;
  state.isStepAnswered = false;
  renderSkillIntro(startSimulation, toSkillSelection);
}

function startSimulation() {
  renderSimulation({
    onBack: toSkillSelection,
    onNextStep: nextStep,
    onComplete: showFinalSummary
  });
}

function nextStep() {
  state.currentStepIndex += 1;
  state.selectedAnswer = null;
  state.isStepAnswered = false;
  startSimulation();
}

function showFinalSummary() {
  renderFinalSummary(retrySkill, toSkillSelection);
}

function retrySkill() {
  state.currentStepIndex = 0;
  state.totalScore = 0;
  state.answersHistory = [];
  state.selectedAnswer = null;
  state.isStepAnswered = false;
  renderSkillIntro(startSimulation, toSkillSelection);
}

function toSkillSelection() {
  state.selectedSkill = "";
  resetSimulationState();
  renderSkillSelection(startSkill);
}
