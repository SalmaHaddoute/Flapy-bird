import * as SQLite from 'expo-sqlite';

class DatabaseService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Ouvrir ou créer la base de données
      this.db = await SQLite.openDatabaseAsync('skybird_adventure.db');
      
      // Créer les tables
      await this.createTables();
      
      this.isInitialized = true;
      console.log('🗄️ Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
    }
  }

  async createTables() {
    try {
      // Table des scores
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS scores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          level_id INTEGER NOT NULL,
          score INTEGER NOT NULL,
          coins INTEGER DEFAULT 0,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          bird_color TEXT DEFAULT 'yellow'
        );
      `);

      // Table des meilleurs scores par niveau
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS best_scores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          level_id INTEGER UNIQUE NOT NULL,
          best_score INTEGER NOT NULL,
          best_coins INTEGER DEFAULT 0,
          achieved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          bird_color TEXT DEFAULT 'yellow'
        );
      `);

      // Table des statistiques globales
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS game_stats (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          total_score INTEGER DEFAULT 0,
          total_coins INTEGER DEFAULT 0,
          games_played INTEGER DEFAULT 0,
          best_level INTEGER DEFAULT 1,
          current_bird TEXT DEFAULT 'yellow',
          last_played DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Table des niveaux débloqués
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS unlocked_levels (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          level_id INTEGER UNIQUE NOT NULL,
          unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          unlocked_with_score INTEGER
        );
      `);

      // Table des power-ups collectés
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS powerups_collected (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          powerup_type TEXT NOT NULL,
          level_id INTEGER NOT NULL,
          collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          game_score INTEGER
        );
      `);

      // Insérer les statistiques initiales si elles n'existent pas
      await this.db.execAsync(`
        INSERT OR IGNORE INTO game_stats (id, total_score, total_coins, games_played, best_level, current_bird)
        VALUES (1, 0, 0, 0, 1, 'yellow');
      `);

      // Insérer les niveaux débloqués initiaux
      await this.db.execAsync(`
        INSERT OR IGNORE INTO unlocked_levels (level_id, unlocked_at, unlocked_with_score)
        VALUES (1, CURRENT_TIMESTAMP, 0);
      `);

      console.log('🗄️ Tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
    }
  }

  // Sauvegarder un score
  async saveScore(levelId, score, coins = 0, birdColor = 'yellow') {
    try {
      if (!this.db) await this.initialize();

      // Insérer le score dans l'historique
      await this.db.runAsync(
        `INSERT INTO scores (level_id, score, coins, bird_color) VALUES (?, ?, ?, ?)`,
        [levelId, score, coins, birdColor]
      );

      // Mettre à jour le meilleur score si nécessaire
      const existingBest = await this.db.getFirstAsync(
        `SELECT best_score FROM best_scores WHERE level_id = ?`,
        [levelId]
      );

      if (!existingBest || score > existingBest.best_score) {
        await this.db.runAsync(
          `INSERT OR REPLACE INTO best_scores (level_id, best_score, best_coins, bird_color) VALUES (?, ?, ?, ?)`,
          [levelId, score, coins, birdColor]
        );
      }

      // Mettre à jour les statistiques globales
      await this.updateGameStats(score, coins);

      // Débloquer le niveau suivant si le score est suffisant
      await this.checkAndUnlockNextLevel(levelId, score);

      console.log(`💾 Score saved: Level ${levelId}, Score ${score}, Coins ${coins}`);
      return true;
    } catch (error) {
      console.error('Error saving score:', error);
      return false;
    }
  }

  // Mettre à jour les statistiques globales
  async updateGameStats(score, coins) {
    try {
      await this.db.runAsync(`
        UPDATE game_stats 
        SET total_score = total_score + ?,
            total_coins = total_coins + ?,
            games_played = games_played + 1,
            last_played = CURRENT_TIMESTAMP
        WHERE id = 1
      `, [score, coins]);
    } catch (error) {
      console.error('Error updating game stats:', error);
    }
  }

  // Vérifier et débloquer le niveau suivant
  async checkAndUnlockNextLevel(currentLevelId, score) {
    try {
      // Scores requis pour chaque niveau (à définir selon votre logique)
      const requiredScores = {
        1: 5,  // Niveau 2 débloqué avec 5 points au niveau 1
        2: 10, // Niveau 3 débloqué avec 10 points au niveau 2
        3: 15, // Niveau 4 débloqué avec 15 points au niveau 3
        4: 20, // Niveau 5 débloqué avec 20 points au niveau 4
      };

      const nextLevelId = currentLevelId + 1;
      const requiredScore = requiredScores[currentLevelId];

      if (requiredScore && score >= requiredScore) {
        // Vérifier si le niveau est déjà débloqué
        const isUnlocked = await this.db.getFirstAsync(
          `SELECT level_id FROM unlocked_levels WHERE level_id = ?`,
          [nextLevelId]
        );

        if (!isUnlocked) {
          await this.db.runAsync(
            `INSERT INTO unlocked_levels (level_id, unlocked_with_score) VALUES (?, ?)`,
            [nextLevelId, score]
          );

          // Mettre à jour le meilleur niveau atteint
          await this.db.runAsync(
            `UPDATE game_stats SET best_level = ? WHERE id = 1`,
            [nextLevelId]
          );

          console.log(`🎉 Level ${nextLevelId} unlocked with score ${score}!`);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking level unlock:', error);
      return false;
    }
  }

  // Charger les données du jeu
  async loadGameData() {
    try {
      if (!this.db) await this.initialize();

      // Charger les meilleurs scores
      const bestScores = await this.db.getAllAsync(`SELECT level_id, best_score, best_coins, bird_color FROM best_scores ORDER BY level_id`);
      const scoresMap = {};
      bestScores.forEach(row => {
        scoresMap[row.level_id] = row.best_score;
      });

      // Charger les statistiques globales
      const stats = await this.db.getFirstAsync(`SELECT * FROM game_stats WHERE id = 1`);

      // Charger les niveaux débloqués
      const unlockedLevels = await this.db.getAllAsync(`SELECT level_id FROM unlocked_levels ORDER BY level_id`);
      const unlockedLevelsArray = unlockedLevels.map(row => row.level_id);

      // Charger l'oiseau sélectionné
      const selectedBird = stats?.current_bird || 'yellow';

      const gameData = {
        bestScores: scoresMap,
        totalScore: stats?.total_score || 0,
        totalCoins: stats?.total_coins || 0,
        gamesPlayed: stats?.games_played || 0,
        bestLevel: stats?.best_level || 1,
        selectedBird,
        unlockedLevels: unlockedLevelsArray
      };

      console.log('📊 Game data loaded from SQLite');
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
  }

  // Sauvegarder l'oiseau sélectionné
  async saveSelectedBird(birdColor) {
    try {
      if (!this.db) await this.initialize();

      await this.db.runAsync(
        `UPDATE game_stats SET current_bird = ? WHERE id = 1`,
        [birdColor]
      );

      console.log(`🐦 Selected bird saved: ${birdColor}`);
      return true;
    } catch (error) {
      console.error('Error saving selected bird:', error);
      return false;
    }
  }

  // Enregistrer un power-up collecté
  async savePowerUpCollected(powerUpType, levelId, gameScore) {
    try {
      if (!this.db) await this.initialize();

      await this.db.runAsync(
        `INSERT INTO powerups_collected (powerup_type, level_id, game_score) VALUES (?, ?, ?)`,
        [powerUpType, levelId, gameScore]
      );

      console.log(`⚡ Power-up collected: ${powerUpType} at level ${levelId}`);
      return true;
    } catch (error) {
      console.error('Error saving power-up:', error);
      return false;
    }
  }

  // Obtenir les statistiques détaillées
  async getDetailedStats() {
    try {
      if (!this.db) await this.initialize();

      // Statistiques globales
      const stats = await this.db.getFirstAsync(`SELECT * FROM game_stats WHERE id = 1`);

      // Top scores par niveau
      const topScores = await this.db.getAllAsync(`
        SELECT level_id, best_score, best_coins, bird_color, achieved_at 
        FROM best_scores 
        ORDER BY level_id
      `);

      // Historique récent
      const recentGames = await this.db.getAllAsync(`
        SELECT level_id, score, coins, bird_color, timestamp 
        FROM scores 
        ORDER BY timestamp DESC 
        LIMIT 10
      `);

      // Power-ups les plus collectés
      const popularPowerUps = await this.db.getAllAsync(`
        SELECT powerup_type, COUNT(*) as count 
        FROM powerups_collected 
        GROUP BY powerup_type 
        ORDER BY count DESC
      `);

      // Progression par niveau
      const levelProgression = await this.db.getAllAsync(`
        SELECT level_id, COUNT(*) as games_played, AVG(score) as avg_score, MAX(score) as max_score
        FROM scores
        GROUP BY level_id
        ORDER BY level_id
      `);

      return {
        globalStats: stats,
        topScores,
        recentGames,
        popularPowerUps,
        levelProgression
      };
    } catch (error) {
      console.error('Error getting detailed stats:', error);
      return null;
    }
  }

  // Vider la base de données (pour réinitialiser)
  async resetDatabase() {
    try {
      if (!this.db) await this.initialize();

      await this.db.execAsync(`
        DELETE FROM scores;
        DELETE FROM best_scores;
        DELETE FROM game_stats;
        DELETE FROM unlocked_levels;
        DELETE FROM powerups_collected;
        
        INSERT INTO game_stats (id, total_score, total_coins, games_played, best_level, current_bird)
        VALUES (1, 0, 0, 0, 1, 'yellow');
        
        INSERT INTO unlocked_levels (level_id, unlocked_at, unlocked_with_score)
        VALUES (1, CURRENT_TIMESTAMP, 0);
      `);

      console.log('🗄️ Database reset successfully');
      return true;
    } catch (error) {
      console.error('Error resetting database:', error);
      return false;
    }
  }

  // Fermer la base de données
  async close() {
    try {
      if (this.db) {
        await this.db.closeAsync();
        this.db = null;
        this.isInitialized = false;
        console.log('🗄️ Database closed');
      }
    } catch (error) {
      console.error('Error closing database:', error);
    }
  }
}

// Singleton
const databaseService = new DatabaseService();

export default databaseService;
