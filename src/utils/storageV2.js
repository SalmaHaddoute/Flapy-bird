import databaseService from '../services/databaseService';

// Interface compatible avec l'ancien storage.js mais utilisant SQLite
export const saveScore = async (level, score, coins = 0, birdColor = 'yellow') => {
  try {
    return await databaseService.saveScore(level, score, coins, birdColor);
  } catch (error) {
    console.error('Error saving score to SQLite:', error);
    return false;
  }
};

export const loadGameData = async () => {
  try {
    return await databaseService.loadGameData();
  } catch (error) {
    console.error('Error loading game data from SQLite:', error);
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
    return await databaseService.saveSelectedBird(birdColor);
  } catch (error) {
    console.error('Error saving selected bird to SQLite:', error);
    return false;
  }
};

export const savePowerUpCollected = async (powerUpType, levelId, gameScore) => {
  try {
    return await databaseService.savePowerUpCollected(powerUpType, levelId, gameScore);
  } catch (error) {
    console.error('Error saving power-up to SQLite:', error);
    return false;
  }
};

export const getDetailedStats = async () => {
  try {
    return await databaseService.getDetailedStats();
  } catch (error) {
    console.error('Error getting detailed stats from SQLite:', error);
    return null;
  }
};

export const resetGameData = async () => {
  try {
    return await databaseService.resetDatabase();
  } catch (error) {
    console.error('Error resetting game data in SQLite:', error);
    return false;
  }
};

export const initializeDatabase = async () => {
  try {
    return await databaseService.initialize();
  } catch (error) {
    console.error('Error initializing SQLite database:', error);
    return false;
  }
};
