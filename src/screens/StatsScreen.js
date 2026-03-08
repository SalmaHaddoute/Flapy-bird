import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { getDetailedStats, resetGameData, initializeDatabase } from '../utils/storageV3';
import audioServiceV3 from '../services/audioServiceV3';

const { width, height } = Dimensions.get('window');

const StatsScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const detailedStats = await getDetailedStats();
      setStats(detailedStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      await resetGameData();
      audioServiceV3.playVoiceOver('game_over');
      loadStats();
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement des statistiques...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Erreur de chargement des statistiques</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadStats}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { globalStats, topScores, recentGames, popularPowerUps, levelProgression } = stats;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.title}>📊 Statistiques</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetButton}>🔄 Réinitialiser</Text>
          </TouchableOpacity>
        </View>

        {/* Statistiques Globales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Statistiques Globales</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{globalStats?.total_score || 0}</Text>
              <Text style={styles.statLabel}>Score Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{globalStats?.total_coins || 0}</Text>
              <Text style={styles.statLabel}>Pièces Totales</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{globalStats?.games_played || 0}</Text>
              <Text style={styles.statLabel}>Parties Jouées</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{globalStats?.best_level || 1}</Text>
              <Text style={styles.statLabel}>Meilleur Niveau</Text>
            </View>
          </View>
        </View>

        {/* Meilleurs Scores par Niveau */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Meilleurs Scores par Niveau</Text>
          {topScores?.map((score, index) => (
            <View key={score.level_id} style={styles.scoreRow}>
              <View style={styles.levelInfo}>
                <Text style={styles.levelText}>Niveau {score.level_id}</Text>
                <Text style={styles.birdText}>🐦 {score.bird_color}</Text>
              </View>
              <View style={styles.scoreInfo}>
                <Text style={styles.scoreValue}>{score.best_score}</Text>
                <Text style={styles.coinsValue}>💰 {score.best_coins}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Parties Récentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🕐 Parties Récentes</Text>
          {recentGames?.map((game, index) => (
            <View key={index} style={styles.recentGameRow}>
              <View style={styles.gameInfo}>
                <Text style={styles.gameLevel}>Niveau {game.level_id}</Text>
                <Text style={styles.gameTime}>
                  {new Date(game.timestamp).toLocaleDateString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
              <View style={styles.gameScores}>
                <Text style={styles.gameScore}>{game.score}</Text>
                <Text style={styles.gameCoins}>💰 {game.coins}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Power-ups Populaires */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Power-ups Collectés</Text>
          {popularPowerUps?.map((powerup, index) => (
            <View key={powerup.powerup_type} style={styles.powerupRow}>
              <Text style={styles.powerupType}>
                {powerup.powerup_type === 'shield' && '🛡️ Bouclier'}
                {powerup.powerup_type === 'slow' && '⏱️ Ralenti'}
                {powerup.powerup_type === 'magnet' && '🧲 Aimant'}
              </Text>
              <Text style={styles.powerupCount}>{powerup.count} fois</Text>
            </View>
          ))}
        </View>

        {/* Progression par Niveau */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Progression par Niveau</Text>
          {levelProgression?.map((progress, index) => (
            <View key={progress.level_id} style={styles.progressionRow}>
              <View style={styles.progressionInfo}>
                <Text style={styles.progressionLevel}>Niveau {progress.level_id}</Text>
                <Text style={styles.progressionGames}>{progress.games_played} parties</Text>
              </View>
              <View style={styles.progressionStats}>
                <Text style={styles.progressionAvg}>Avg: {Math.round(progress.avg_score)}</Text>
                <Text style={styles.progressionMax}>Max: {progress.max_score}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    fontSize: 16,
    color: '#1a5490',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a5490',
  },
  resetButton: {
    fontSize: 14,
    color: '#d32f2f',
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a5490',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a5490',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  levelInfo: {
    flex: 1,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  birdText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  scoreInfo: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a5490',
  },
  coinsValue: {
    fontSize: 14,
    color: '#f39c12',
    marginTop: 2,
  },
  recentGameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  gameInfo: {
    flex: 1,
  },
  gameLevel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  gameTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  gameScores: {
    alignItems: 'flex-end',
  },
  gameScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a5490',
  },
  gameCoins: {
    fontSize: 12,
    color: '#f39c12',
    marginTop: 2,
  },
  powerupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  powerupType: {
    fontSize: 16,
    color: '#333',
  },
  powerupCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a5490',
  },
  progressionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  progressionInfo: {
    flex: 1,
  },
  progressionLevel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressionGames: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  progressionStats: {
    alignItems: 'flex-end',
  },
  progressionAvg: {
    fontSize: 14,
    color: '#666',
  },
  progressionMax: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a5490',
  },
  loadingText: {
    fontSize: 18,
    color: '#1a5490',
    textAlign: 'center',
    marginTop: 100,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginTop: 100,
  },
  retryButton: {
    backgroundColor: '#1a5490',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 20,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StatsScreen;
