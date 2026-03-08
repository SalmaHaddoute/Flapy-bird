import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import Bird from "../components/Bird";
import Pipe from "../components/Pipe";
import Coin from "../components/Coin";
import PowerUp from "../components/PowerUp";
import { useGameEngine } from "../hooks/useGameEngine";
import { SCREEN, GROUND, LEVELS, POWERUP } from "../constants/gameConfig";
import { saveScore, loadGameData, saveSelectedBird, savePowerUpCollected, initializeDatabase } from "../utils/storageV2";
import audioServiceV3 from "../services/audioServiceV3";

const { width, height } = Dimensions.get("window");

const GameScreen = ({ route, navigation }) => {
  const { levelId, selectedBird, bestScores } = route.params;
  const level = LEVELS.find((l) => l.id === levelId) || LEVELS[0];

  const [gameState, setGameState] = useState("countdown"); // countdown | playing | dead
  const [countdown, setCountdown] = useState(3);
  const [currentScore, setCurrentScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [finalCoins, setFinalCoins] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [levelUp, setLevelUp] = useState(false);

  const scoreAnim = useRef(new Animated.Value(1)).current;
  const deathAnim = useRef(new Animated.Value(0)).current;
  const countdownAnim = useRef(new Animated.Value(1)).current;

  const handleScoreUpdate = useCallback((score) => {
    setCurrentScore(score);
    // Son de score
    audioServiceV3.playScore();
    Animated.sequence([
      Animated.timing(scoreAnim, { toValue: 1.4, duration: 80, useNativeDriver: true }),
      Animated.timing(scoreAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleGameOver = useCallback(
    async (score, coins) => {
      setFinalScore(score);
      setFinalCoins(coins);
      setGameState("dead");

      // Son de game over
      audioServiceV3.playGameOver();
      audioServiceV3.playVoiceOver('game_over');

      const prevBest = bestScores[levelId] || 0;
      if (score > prevBest) {
        setNewBest(true);
        // Voix off pour meilleur score
        audioServiceV3.playVoiceOver('best_score');
      }

      await saveScore(levelId, score, coins);

      if (score >= level.scoreToAdvance && levelId < LEVELS.length) {
        setLevelUp(true);
        // Voix off pour niveau débloqué
        audioServiceV3.playVoiceOver('level_unlocked');
      }

      Animated.timing(deathAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    },
    [levelId, level, bestScores]
  );

  const { birdY, birdRotation, pipes, score, isAlive, particles, coins, activePowerUp, powerUpTimer, flap, startGame } =
    useGameEngine(level, handleGameOver, handleScoreUpdate);

  useEffect(() => {
    // Initialiser la base de données SQLite
    initializeDatabase();
    
    loadGameData().then((data) => {
      setGameData(data);
      setSelectedBird(data.selectedBird || "yellow");
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    // Initialiser le service audio
    audioServiceV3.initialize();
    
    // Démarrer la musique de fond
    if (gameState === "countdown") {
      audioServiceV3.playBackgroundMusic(levelId);
    }
    
    if (gameState === "countdown") {
      let c = 3;
      setCountdown(c);
      const interval = setInterval(() => {
        c -= 1;
        if (c <= 0) {
          clearInterval(interval);
          setGameState("playing");
          startGame();
        } else {
          setCountdown(c);
          // Son de countdown
          audioServiceV3.playCountdown();
          Animated.sequence([
            Animated.timing(countdownAnim, { toValue: 1.8, duration: 200, useNativeDriver: true }),
            Animated.timing(countdownAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          ]).start();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState, levelId]);

  const handleTap = useCallback(() => {
    if (gameState === "playing") {
      flap();
      // Son de battement d'ailes
      audioServiceV3.playFlap();
    }
  }, [gameState, flap]);

  useEffect(() => {
    // Nettoyer l'audio quand on quitte l'écran
    return () => {
      audioServiceV3.stopBackgroundMusic();
    };
  }, []);

  const handleRestart = useCallback(() => {
    deathAnim.setValue(0);
    setNewBest(false);
    setLevelUp(false);
    setCurrentScore(0);
    setFinalCoins(0);
    setGameState("countdown");
    setCountdown(3);
  }, []);

  const handleNextLevel = useCallback(() => {
    navigation.replace("Game", {
      levelId: levelId + 1,
      selectedBird,
      bestScores,
    });
  }, [levelId, selectedBird, bestScores, navigation]);

  const handleMenu = useCallback(() => {
    navigation.navigate("Menu");
  }, [navigation]);

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={[styles.container, { backgroundColor: level.skyColor }]}>
        <StatusBar hidden />

        {/* Stars background */}
        {[...Array(20)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                top: Math.sin(i * 137.5) * SCREEN.HEIGHT * 0.6 + 100,
                left: (i * 73) % SCREEN.WIDTH,
                opacity: 0.3 + (i % 5) * 0.1,
                width: i % 3 === 0 ? 3 : 2,
                height: i % 3 === 0 ? 3 : 2,
              },
            ]}
          />
        ))}

        {/* Pipes */}
        {pipes.map((pipe) => (
          <Pipe key={pipe.id} pipe={pipe} levelColor={level.color} />
        ))}

        {/* Coins */}
        {pipes.map((pipe) => 
          pipe.coin && !pipe.coin.collected ? (
            <Coin
              key={pipe.coin.id}
              x={pipe.coin.x}
              y={pipe.coin.y}
              collected={pipe.coin.collected}
            />
          ) : null
        )}

        {/* Power-ups */}
        {pipes.map((pipe) => 
          pipe.powerUp && !pipe.powerUp.collected ? (
            <PowerUp
              key={pipe.powerUp.id}
              x={pipe.powerUp.x}
              y={pipe.powerUp.y}
              type={pipe.powerUp.type}
              collected={pipe.powerUp.collected}
            />
          ) : null
        )}

        {/* Bird */}
        <Bird
          y={birdY}
          rotation={birdRotation}
          color={selectedBird}
          isAlive={isAlive}
        />

        {/* Particles */}
        {particles.map((p) => (
          <View
            key={p.id}
            style={[
              styles.particle,
              {
                left: p.x,
                top: p.y,
                backgroundColor: level.color,
              },
            ]}
          />
        ))}

        {/* Ground */}
        <View style={[styles.ground, { backgroundColor: level.groundColor }]}>
          <View style={styles.groundLine} />
        </View>

        {/* Score HUD */}
        {gameState === "playing" && (
          <>
            <Animated.Text
              style={[styles.scoreText, { transform: [{ scale: scoreAnim }], color: level.color }]}
            >
              {currentScore}
            </Animated.Text>
            <View style={styles.coinHud}>
              <Text style={styles.coinIcon}>🪙</Text>
              <Text style={[styles.coinText, { color: level.color }]}>{coins}</Text>
            </View>
            {activePowerUp && (
              <View style={[styles.powerUpHud, { backgroundColor: POWERUP.TYPES[activePowerUp.toUpperCase()].color }]}>
                <Text style={styles.powerUpIcon}>{POWERUP.TYPES[activePowerUp.toUpperCase()].icon}</Text>
                <Text style={styles.powerUpTimer}>{Math.ceil(powerUpTimer / 1000)}s</Text>
              </View>
            )}
          </>
        )}

        {/* Level Badge */}
        <View style={[styles.levelBadge, { borderColor: level.color }]}>
          <Text style={[styles.levelBadgeText, { color: level.color }]}>
            {level.emoji} {level.name}
          </Text>
        </View>

        {/* Best Score */}
        <View style={styles.bestBadge}>
          <Text style={styles.bestText}>BEST {bestScores[levelId] || 0}</Text>
        </View>

        {/* Countdown */}
        {gameState === "countdown" && (
          <View style={styles.overlay}>
            <Text style={[styles.levelTitle, { color: level.color }]}>{level.name}</Text>
            <Text style={styles.levelSubtitle}>{level.subtitle}</Text>
            <Animated.Text
              style={[
                styles.countdownText,
                { color: level.color, transform: [{ scale: countdownAnim }] },
              ]}
            >
              {countdown}
            </Animated.Text>
            <Text style={styles.tapHint}>TAP TO FLY</Text>
          </View>
        )}

        {/* Death Screen */}
        {gameState === "dead" && (
          <Animated.View style={[styles.deathOverlay, { opacity: deathAnim }]}>
            <View style={[styles.deathCard, { borderColor: level.color }]}>
              <Text style={styles.gameOverText}>GAME OVER</Text>

              {levelUp && (
                <View style={[styles.levelUpBanner, { backgroundColor: level.color + "22", borderColor: level.color }]}>
                  <Text style={[styles.levelUpText, { color: level.color }]}>
                    🎉 LEVEL UP UNLOCKED!
                  </Text>
                </View>
              )}

              <View style={styles.scoreRow}>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreLabel}>SCORE</Text>
                  <Text style={[styles.scoreValue, { color: level.color }]}>{finalScore}</Text>
                </View>
                <View style={styles.scoreDivider} />
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreLabel}>BEST</Text>
                  <Text style={[styles.scoreValue, { color: newBest ? "#FFD700" : "#fff" }]}>
                    {Math.max(finalScore, bestScores[levelId] || 0)}
                    {newBest ? " ★" : ""}
                  </Text>
                </View>
              </View>

              {/* Coins collected */}
              <View style={styles.coinRow}>
                <Text style={styles.coinIcon}>🪙</Text>
                <Text style={[styles.coinValue, { color: level.color }]}>{finalCoins} coins collected!</Text>
              </View>

              <Text style={styles.targetText}>
                Target: {level.scoreToAdvance === Infinity ? "∞" : level.scoreToAdvance} to advance
              </Text>

              <View style={styles.deathButtons}>
                <TouchableWithoutFeedback onPress={handleRestart}>
                  <View style={[styles.btn, styles.btnPrimary, { backgroundColor: level.color }]}>
                    <Text style={styles.btnText}>▶ RETRY</Text>
                  </View>
                </TouchableWithoutFeedback>

                {levelUp && levelId < LEVELS.length && (
                  <TouchableWithoutFeedback onPress={handleNextLevel}>
                    <View style={[styles.btn, styles.btnSecondary, { borderColor: level.color }]}>
                      <Text style={[styles.btnText, { color: level.color }]}>NEXT LVL ▸</Text>
                    </View>
                  </TouchableWithoutFeedback>
                )}

                <TouchableWithoutFeedback onPress={handleMenu}>
                  <View style={styles.btnMenu}>
                    <Text style={styles.btnMenuText}>≡ MENU</Text>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </View>
          </Animated.View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  star: {
    position: "absolute",
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  ground: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: GROUND.HEIGHT,
    zIndex: 5,
  },
  groundLine: {
    height: 3,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginTop: 4,
  },
  particle: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    zIndex: 15,
  },
  scoreText: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    width: "100%",
    textAlign: "center",
    fontSize: 52,
    fontWeight: "900",
    zIndex: 20,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  levelBadge: {
    position: "absolute",
    top: 50,
    left: 16,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 20,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  bestBadge: {
    position: "absolute",
    top: 50,
    right: 16,
    zIndex: 20,
  },
  bestText: {
    color: "rgba(30,58,138,0.6)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.3)",
    zIndex: 30,
  },
  levelTitle: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 4,
    marginBottom: 4,
  },
  levelSubtitle: {
    color: "rgba(30,58,138,0.6)",
    fontSize: 14,
    marginBottom: 40,
    letterSpacing: 2,
  },
  countdownText: {
    fontSize: 96,
    fontWeight: "900",
    marginBottom: 24,
  },
  tapHint: {
    color: "rgba(30,58,138,0.6)",
    fontSize: 12,
    letterSpacing: 3,
  },
  deathOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.4)",
    zIndex: 30,
  },
  deathCard: {
    width: 300,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 28,
    alignItems: "center",
  },
  gameOverText: {
    color: "#1E3A8A",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 4,
    marginBottom: 20,
  },
  levelUpBanner: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
  },
  levelUpText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  scoreBox: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  scoreDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(30,58,138,0.15)",
  },
  scoreLabel: {
    color: "rgba(30,58,138,0.4)",
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: "900",
  },
  targetText: {
    color: "rgba(30,58,138,0.4)",
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 24,
  },
  deathButtons: {
    width: "100%",
    gap: 10,
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnPrimary: {},
  btnSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  btnMenu: {
    paddingVertical: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 2,
  },
  btnMenuText: {
    color: "rgba(30,58,138,0.4)",
    fontSize: 13,
    letterSpacing: 2,
  },
  coinHud: {
    position: "absolute",
    top: 120,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    zIndex: 20,
  },
  coinIcon: {
    fontSize: 20,
  },
  coinText: {
    fontSize: 18,
    fontWeight: "800",
  },
  powerUpHud: {
    position: "absolute",
    top: 160,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 20,
  },
  powerUpIcon: {
    fontSize: 16,
    fontWeight: "bold",
  },
  powerUpTimer: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  coinRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  coinValue: {
    fontSize: 18,
    fontWeight: "800",
  },
});

export default GameScreen;
