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
import { useGameEngine } from "../hooks/useGameEngine";
import { SCREEN, GROUND, LEVELS } from "../constants/gameConfig";
import { saveScore } from "../utils/storage";

const { width, height } = Dimensions.get("window");

const GameScreen = ({ route, navigation }) => {
  const { levelId, selectedBird, bestScores } = route.params;
  const level = LEVELS.find((l) => l.id === levelId) || LEVELS[0];

  const [gameState, setGameState] = useState("countdown"); // countdown | playing | dead
  const [countdown, setCountdown] = useState(3);
  const [currentScore, setCurrentScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [levelUp, setLevelUp] = useState(false);

  const scoreAnim = useRef(new Animated.Value(1)).current;
  const deathAnim = useRef(new Animated.Value(0)).current;
  const countdownAnim = useRef(new Animated.Value(1)).current;

  const handleScoreUpdate = useCallback((score) => {
    setCurrentScore(score);
    Animated.sequence([
      Animated.timing(scoreAnim, { toValue: 1.4, duration: 80, useNativeDriver: true }),
      Animated.timing(scoreAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleGameOver = useCallback(
    async (score) => {
      setFinalScore(score);
      setGameState("dead");

      const prevBest = bestScores[levelId] || 0;
      if (score > prevBest) setNewBest(true);

      await saveScore(levelId, score);

      if (score >= level.scoreToAdvance && levelId < LEVELS.length) {
        setLevelUp(true);
      }

      Animated.timing(deathAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    },
    [levelId, level, bestScores]
  );

  const { birdY, birdRotation, pipes, score, isAlive, particles, flap, startGame } =
    useGameEngine(level, handleGameOver, handleScoreUpdate);

  useEffect(() => {
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
          Animated.sequence([
            Animated.timing(countdownAnim, { toValue: 1.8, duration: 200, useNativeDriver: true }),
            Animated.timing(countdownAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          ]).start();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  const handleTap = useCallback(() => {
    if (gameState === "playing") flap();
  }, [gameState, flap]);

  const handleRestart = useCallback(() => {
    deathAnim.setValue(0);
    setNewBest(false);
    setLevelUp(false);
    setCurrentScore(0);
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
          <Animated.Text
            style={[styles.scoreText, { transform: [{ scale: scoreAnim }], color: level.color }]}
          >
            {currentScore}
          </Animated.Text>
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
    backgroundColor: "white",
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
    backgroundColor: "rgba(255,255,255,0.1)",
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
    textShadowColor: "rgba(0,0,0,0.5)",
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
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 30,
  },
  levelTitle: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 4,
    marginBottom: 4,
  },
  levelSubtitle: {
    color: "rgba(255,255,255,0.6)",
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
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    letterSpacing: 3,
  },
  deathOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    zIndex: 30,
  },
  deathCard: {
    width: 300,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: "#0a0a1a",
    padding: 28,
    alignItems: "center",
  },
  gameOverText: {
    color: "#fff",
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
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  scoreLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: "900",
  },
  targetText: {
    color: "rgba(255,255,255,0.3)",
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
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
    letterSpacing: 2,
  },
});

export default GameScreen;
