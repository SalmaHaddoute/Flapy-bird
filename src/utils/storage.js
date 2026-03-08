import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  BEST_SCORES: "flappy_best_scores",
  TOTAL_SCORE: "flappy_total_score",
  BEST_LEVEL: "flappy_best_level",
  SELECTED_BIRD: "flappy_selected_bird",
  GAMES_PLAYED: "flappy_games_played",
};

export const saveScore = async (level, score) => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.BEST_SCORES);
    const best = raw ? JSON.parse(raw) : {};
    if (!best[level] || score > best[level]) {
      best[level] = score;
      await AsyncStorage.setItem(KEYS.BEST_SCORES, JSON.stringify(best));
    }

    const totalRaw = await AsyncStorage.getItem(KEYS.TOTAL_SCORE);
    const total = totalRaw ? parseInt(totalRaw) : 0;
    await AsyncStorage.setItem(KEYS.TOTAL_SCORE, String(total + score));

    const gamesRaw = await AsyncStorage.getItem(KEYS.GAMES_PLAYED);
    const games = gamesRaw ? parseInt(gamesRaw) : 0;
    await AsyncStorage.setItem(KEYS.GAMES_PLAYED, String(games + 1));

    const bestLevelRaw = await AsyncStorage.getItem(KEYS.BEST_LEVEL);
    const bestLevel = bestLevelRaw ? parseInt(bestLevelRaw) : 1;
    if (level > bestLevel) {
      await AsyncStorage.setItem(KEYS.BEST_LEVEL, String(level));
    }

    return best[level];
  } catch (e) {
    console.error(e);
  }
};

export const loadGameData = async () => {
  try {
    const [bestScoresRaw, totalRaw, bestLevelRaw, birdRaw, gamesRaw] = await Promise.all([
      AsyncStorage.getItem(KEYS.BEST_SCORES),
      AsyncStorage.getItem(KEYS.TOTAL_SCORE),
      AsyncStorage.getItem(KEYS.BEST_LEVEL),
      AsyncStorage.getItem(KEYS.SELECTED_BIRD),
      AsyncStorage.getItem(KEYS.GAMES_PLAYED),
    ]);
    return {
      bestScores: bestScoresRaw ? JSON.parse(bestScoresRaw) : {},
      totalScore: totalRaw ? parseInt(totalRaw) : 0,
      bestLevel: bestLevelRaw ? parseInt(bestLevelRaw) : 1,
      selectedBird: birdRaw || "yellow",
      gamesPlayed: gamesRaw ? parseInt(gamesRaw) : 0,
    };
  } catch (e) {
    return { bestScores: {}, totalScore: 0, bestLevel: 1, selectedBird: "yellow", gamesPlayed: 0 };
  }
};

export const saveSelectedBird = async (birdId) => {
  try {
    await AsyncStorage.setItem(KEYS.SELECTED_BIRD, birdId);
  } catch (e) {}
};
