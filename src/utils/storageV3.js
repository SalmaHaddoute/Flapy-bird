import AsyncStorage from "@react-native-async-storage/async-storage";

// Revenir à AsyncStorage qui fonctionne toujours
const KEYS = {
  BEST_SCORES: "skybird_best_scores",
  TOTAL_SCORE: "skybird_total_score",
  BEST_LEVEL: "skybird_best_level",
  SELECTED_BIRD: "skybird_selected_bird",
  GAMES_PLAYED: "skybird_games_played",
  TOTAL_COINS: "skybird_total_coins",
};

export const saveScore = async (level, score, coins = 0, birdColor = 'yellow') => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.BEST_SCORES);
    const best = raw ? JSON.parse(raw) : {};
    if (!best[level] || score > best[level]) {
      best[level] = score;
      await AsyncStorage.setItem(KEYS.BEST_SCORES, JSON.stringify(best));
    }

    // Mettre à jour le score total
    const totalScore = await AsyncStorage.getItem(KEYS.TOTAL_SCORE);
    const currentTotal = totalScore ? parseInt(totalScore) : 0;
    await AsyncStorage.setItem(KEYS.TOTAL_SCORE, String(currentTotal + score));

    // Mettre à jour les pièces totales
    const totalCoins = await AsyncStorage.getItem(KEYS.TOTAL_COINS);
    const currentCoins = totalCoins ? parseInt(totalCoins) : 0;
    await AsyncStorage.setItem(KEYS.TOTAL_COINS, String(currentCoins + coins));

    // Mettre à jour le nombre de parties jouées
    const gamesPlayed = await AsyncStorage.getItem(KEYS.GAMES_PLAYED);
    const currentGames = gamesPlayed ? parseInt(gamesPlayed) : 0;
    await AsyncStorage.setItem(KEYS.GAMES_PLAYED, String(currentGames + 1));

    // Mettre à jour le meilleur niveau
    const bestLevel = await AsyncStorage.getItem(KEYS.BEST_LEVEL);
    const currentBestLevel = bestLevel ? parseInt(bestLevel) : 1;
    if (level > currentBestLevel) {
      await AsyncStorage.setItem(KEYS.BEST_LEVEL, String(level));
    }

    console.log(`💾 Score saved: Level ${level}, Score ${score}, Coins ${coins}`);
    return true;
  } catch (error) {
    console.error('Error saving score:', error);
    return false;
  }
};

export const loadGameData = async () => {
  try {
    const bestScoresRaw = await AsyncStorage.getItem(KEYS.BEST_SCORES);
    const bestScores = bestScoresRaw ? JSON.parse(bestScoresRaw) : {};

    const totalScore = await AsyncStorage.getItem(KEYS.TOTAL_SCORE);
    const totalCoins = await AsyncStorage.getItem(KEYS.TOTAL_COINS);
    const gamesPlayed = await AsyncStorage.getItem(KEYS.GAMES_PLAYED);
    const bestLevel = await AsyncStorage.getItem(KEYS.BEST_LEVEL);
    const selectedBird = await AsyncStorage.getItem(KEYS.SELECTED_BIRD);

    const gameData = {
      bestScores,
      totalScore: totalScore ? parseInt(totalScore) : 0,
      totalCoins: totalCoins ? parseInt(totalCoins) : 0,
      gamesPlayed: gamesPlayed ? parseInt(gamesPlayed) : 0,
      bestLevel: bestLevel ? parseInt(bestLevel) : 1,
      selectedBird: selectedBird || 'yellow',
      unlockedLevels: [1] // Tous les niveaux débloqués par défaut pour le moment
    };

    console.log('📊 Game data loaded from AsyncStorage');
    return gameData;
  } catch (error) {
    console.error('Error loading game data:', error);
    return {
      bestScores: {},
      totalScore: 0,
      totalCoins: 0,
      gamesPlayed: 0,
      bestLevel: 1,
      selectedBird: 'yellow',
      unlockedLevels: [1]
    };
  }
};

export const saveSelectedBird = async (birdColor) => {
  try {
    await AsyncStorage.setItem(KEYS.SELECTED_BIRD, birdColor);
    console.log(`🐦 Selected bird saved: ${birdColor}`);
    return true;
  } catch (error) {
    console.error('Error saving selected bird:', error);
    return false;
  }
};

export const savePowerUpCollected = async (powerUpType, levelId, gameScore) => {
  try {
    // Pour l'instant, juste logger le power-up collecté
    console.log(`⚡ Power-up collected: ${powerUpType} at level ${levelId} with score ${gameScore}`);
    return true;
  } catch (error) {
    console.error('Error saving power-up:', error);
    return false;
  }
};

export const resetGameData = async () => {
  try {
    await AsyncStorage.multiRemove([
      KEYS.BEST_SCORES,
      KEYS.TOTAL_SCORE,
      KEYS.BEST_LEVEL,
      KEYS.SELECTED_BIRD,
      KEYS.GAMES_PLAYED,
      KEYS.TOTAL_COINS
    ]);
    console.log('🗄️ Game data reset successfully');
    return true;
  } catch (error) {
    console.error('Error resetting game data:', error);
    return false;
  }
};

export const initializeDatabase = async () => {
  try {
    // AsyncStorage n'a pas besoin d'initialisation
    console.log('📊 AsyncStorage ready');
    return true;
  } catch (error) {
    console.error('Error initializing storage:', error);
    return false;
  }
};
