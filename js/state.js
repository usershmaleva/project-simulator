export const MAX_SCORE = 16;

export const state = {
  scenariosBySkill: {},
  selectedSkill: "",
  currentScenario: null,
  currentStepIndex: 0,
  totalScore: 0,
  answersHistory: [],
  selectedAnswer: null,
  isStepAnswered: false,
  skills: []
};

export function resetSimulationState() {
  state.currentScenario = null;
  state.currentStepIndex = 0;
  state.totalScore = 0;
  state.answersHistory = [];
  state.selectedAnswer = null;
  state.isStepAnswered = false;
}
