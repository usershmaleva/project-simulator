import { MAX_SCORE } from "./state.js";

export function getOptionScore(option) {
  if (typeof option.score === "number") {
    return option.score;
  }
  return 0;
}

export function getDisplayScore(totalScore) {
  return totalScore;
}

export function getLevelByScore(score) {
  if (score >= 12) {
    return "high";
  }
  if (score >= 6) {
    return "medium";
  }
  return "low";
}

export function getSummaryByLevel(level) {
  if (level === "high") {
    return "Вы демонстрируете уверенное владение навыком и принимаете сильные решения в проектных ситуациях.";
  }
  if (level === "medium") {
    return "Вы принимаете в целом рабочие решения, но отдельные ситуации еще требуют более системного подхода.";
  }
  return "Базовые решения сформированы, но стоит усилить анализ последствий и качество управленческого выбора.";
}

export function getRecommendations(level, history) {
  const weakAnswers = history.filter((item) => item.score <= 0).length;

  if (level === "high") {
    return [
      "Продолжайте использовать структурный подход в сложных проектных ситуациях.",
      "Поддерживайте прозрачную аргументацию решений для команды.",
      "Передавайте эффективные практики принятия решений другим участникам."
    ];
  }

  if (level === "medium") {
    return [
      "Чаще проверяйте последствия решения для сроков, качества и команды.",
      "Усильте аргументацию выбора через явные критерии.",
      "Фиксируйте промежуточные выводы и договоренности после важных решений."
    ];
  }

  if (weakAnswers > 0) {
    return [
      "Начинайте с краткого анализа ситуации и альтернатив перед действием.",
      "Тренируйтесь заранее замечать риски и точки неопределенности.",
      "Старайтесь выбирать решения, которые не только снимают проблему сейчас, но и снижают будущие риски."
    ];
  }

  return [
    "Фиксируйте критерии выбора до принятия решения.",
    "Проверяйте последствия решения для сроков, качества и команды.",
    "После выбора действия делайте короткий ретро-анализ."
  ];
}

export function getFeedbackStatusText(score) {
  if (score === 4) return "Отличное решение";
  if (score === 2) return "Неплохое решение";
  if (score === 0) return "Спорное решение";
  return "Неэффективное решение";
}

export function getFeedbackStatusKey(score) {
  if (score === 4) return "success";
  if (score === 2) return "neutral";
  if (score === 0) return "warning";
  return "error";
}

export function formatScoreBadge(score) {
  return score > 0 ? `+${score}` : `${score}`;
}