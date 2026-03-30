/**
 * Crop Intelligence Engine
 * Computes the smart growth stage, health, and progress of an active crop.
 */

export function getCropIntelligence(crop) {
  if (!crop) return null;

  const now = new Date();
  const planted = new Date(crop.plantedDate);
  const expected = new Date(crop.expectedHarvestDate);

  // Time boundaries in milliseconds
  const totalDurationMs = expected.getTime() - planted.getTime();
  const passedMs = now.getTime() - planted.getTime();

  // If mathematically inverted (bad data), fail gracefully
  if (totalDurationMs <= 0) {
    return {
      stageKey: "stageUnknown",
      healthKey: "healthMonitor",
      progress: 0,
      daysRemaining: 0,
      isHarvested: crop.status === "harvested",
    };
  }

  // Calculate strict progress (0 to 100)
  let progress = (passedMs / totalDurationMs) * 100;
  if (progress < 0) progress = 0;

  let daysRemaining = Math.max(0, Math.ceil((expected.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  let daysPassed = Math.max(0, Math.floor(passedMs / (1000 * 60 * 60 * 24)));

  // 1. Intelligence Stage Engine (Percentage-Based)
  let stageKey = "stageUnknown";
  
  if (crop.status === "harvested") {
    stageKey = "statusHarvested";
    progress = 100;
  } else if (crop.status === "failed") {
    stageKey = "statusFailed";
    progress = progress > 100 ? 100 : progress; // Lock failed progress visually
  } else {
    // Active crop smart logic
    if (progress < 25) {
      stageKey = "stageSeedling";
    } else if (progress < 75) {
      stageKey = "stageVegetative";
    } else if (progress < 95) {
      stageKey = "stageMaturing";
    } else {
      stageKey = "stageHarvestReady";
    }
  }

  // 2. Intelligence Health Engine
  let healthKey = "healthHealthy";
  let healthColor = "text-emerald-500";
  let healthBg = "bg-emerald-50 dark:bg-emerald-500/10";
  let healthBorder = "border-emerald-200 dark:border-emerald-500/20";
  let healthEmoji = "🟢";

  if (crop.status === "failed") {
    healthKey = "healthAtRisk";
    healthColor = "text-red-500";
    healthBg = "bg-red-50 dark:bg-red-500/10";
    healthBorder = "border-red-200 dark:border-red-500/20";
    healthEmoji = "🔴";
  } else if (crop.status === "harvested") {
    healthKey = "healthCompleted";
    healthColor = "text-blue-500";
    healthBg = "bg-blue-50 dark:bg-blue-500/10";
    healthBorder = "border-blue-200 dark:border-blue-500/20";
    healthEmoji = "✅";
  } else {
    // Evaluating an Active Crop
    if (progress > 115) {
      // Very Late / Forgotten Crop
      healthKey = "healthAtRisk";
      healthColor = "text-red-500";
      healthBg = "bg-red-50 dark:bg-red-500/10";
      healthBorder = "border-red-200 dark:border-red-500/20";
      healthEmoji = "🔴";
    } else if (progress >= 100) {
      // Overdue for harvest
      healthKey = "healthMonitor";
      healthColor = "text-amber-500";
      healthBg = "bg-amber-50 dark:bg-amber-500/10";
      healthBorder = "border-amber-200 dark:border-amber-500/20";
      healthEmoji = "🟡";
    } else if (progress < 0) {
      // Planted in the future (planned)
      healthKey = "healthPlanned";
      healthColor = "text-slate-500";
      healthBg = "bg-slate-50 dark:bg-slate-500/10";
      healthBorder = "border-slate-200 dark:border-slate-500/20";
      healthEmoji = "⚪";
    } else {
      // Perfectly on schedule
      healthKey = "healthHealthy";
      healthColor = "text-emerald-500";
      healthBg = "bg-emerald-50 dark:bg-emerald-500/10";
      healthBorder = "border-emerald-200 dark:border-emerald-500/20";
      healthEmoji = "🟢";
    }
  }

  return {
    stageKey,
    healthKey,
    healthEmoji,
    healthColor,
    healthBg,
    healthBorder,
    progress: Math.min(progress, 100), // Cap strictly for UI bars
    rawProgress: progress,
    daysRemaining,
    daysPassed,
    isHarvested: crop.status === "harvested",
    isFailed: crop.status === "failed",
  };
}
