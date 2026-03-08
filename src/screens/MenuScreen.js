import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  ScrollView,
  StatusBar,
} from "react-native";
import { LEVELS, BIRD_COLORS } from "../constants/gameConfig";
import { loadGameData, saveSelectedBird } from "../utils/storage";

const BirdPreview = ({ color, size = 44 }) => {
  const c = BIRD_COLORS.find((b) => b.id === color) || BIRD_COLORS[0];
  return (
    <View style={{ width: size, height: size * 0.73, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          width: size * 0.86,
          height: size * 0.64,
          borderRadius: size * 0.32,
          backgroundColor: c.primary,
          top: size * 0.05,
          left: size * 0.05,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: size * 0.27,
          height: size * 0.27,
          borderRadius: size * 0.14,
          backgroundColor: "white",
          top: size * 0.1,
          right: size * 0.14,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: size * 0.14,
            height: size * 0.14,
            borderRadius: size * 0.07,
            backgroundColor: "#111",
          }}
        />
      </View>
    </View>
  );
};

const MenuScreen = ({ navigation }) => {
  const [gameData, setGameData] = useState(null);
  const [selectedBird, setSelectedBird] = useState("yellow");
  const [activeTab, setActiveTab] = useState("levels"); // levels | birds | stats

  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

  const handleSelectBird = useCallback(async (birdId) => {
    setSelectedBird(birdId);
    await saveSelectedBird(birdId);
  }, []);

  const handlePlayLevel = useCallback(
    (level) => {
      if (!gameData) return;
      const isUnlocked =
        level.id === 1 || (gameData.bestScores[level.id - 1] || 0) >= LEVELS[level.id - 2].scoreToAdvance;
      if (!isUnlocked) return;

      navigation.navigate("Game", {
        levelId: level.id,
        selectedBird,
        bestScores: gameData.bestScores,
      });
    },
    [gameData, selectedBird, navigation]
  );

  const birdFloat = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 8],
  });

  const isUnlocked = (level) => {
    if (!gameData) return level.id === 1;
    if (level.id === 1) return true;
    return (gameData.bestScores[level.id - 1] || 0) >= LEVELS[level.id - 2].scoreToAdvance;
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Stars */}
      {[...Array(30)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.star,
            {
              top: (i * 97) % 900,
              left: (i * 137) % 400,
              opacity: 0.15 + (i % 4) * 0.1,
              width: i % 5 === 0 ? 3 : 2,
              height: i % 5 === 0 ? 3 : 2,
            },
          ]}
        />
      ))}

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <Animated.View style={{ transform: [{ translateY: birdFloat }] }}>
            <BirdPreview color={selectedBird} size={64} />
          </Animated.View>
          <Text style={styles.title}>FLAPPY</Text>
          <Text style={styles.titleSub}>NOVA</Text>
        </View>

        {/* Stats row */}
        {gameData && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{gameData.gamesPlayed}</Text>
              <Text style={styles.statLabel}>GAMES</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{gameData.totalScore}</Text>
              <Text style={styles.statLabel}>TOTAL PTS</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>LV{gameData.bestLevel}</Text>
              <Text style={styles.statLabel}>REACHED</Text>
            </View>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabs}>
          {["levels", "birds", "stats"].map((tab) => (
            <TouchableWithoutFeedback key={tab} onPress={() => setActiveTab(tab)}>
              <View style={[styles.tab, activeTab === tab && styles.tabActive]}>
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === "levels" ? "LEVELS" : tab === "birds" ? "BIRDS" : "RECORDS"}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          ))}
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          {activeTab === "levels" && (
            <View style={styles.levelsGrid}>
              {LEVELS.map((level) => {
                const unlocked = isUnlocked(level);
                const best = gameData?.bestScores[level.id] || 0;
                const progress = level.scoreToAdvance === Infinity ? 1 : Math.min(best / level.scoreToAdvance, 1);

                return (
                  <TouchableWithoutFeedback
                    key={level.id}
                    onPress={() => handlePlayLevel(level)}
                  >
                    <View
                      style={[
                        styles.levelCard,
                        { borderColor: unlocked ? level.color : "#333" },
                        !unlocked && styles.levelCardLocked,
                      ]}
                    >
                      <Text style={styles.levelEmoji}>{unlocked ? level.emoji : "🔒"}</Text>
                      <Text style={[styles.levelName, { color: unlocked ? level.color : "#444" }]}>
                        {level.name}
                      </Text>
                      <Text style={styles.levelSub}>{level.subtitle}</Text>

                      {unlocked && (
                        <>
                          <View style={styles.progressBar}>
                            <View
                              style={[
                                styles.progressFill,
                                {
                                  width: `${progress * 100}%`,
                                  backgroundColor: level.color,
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.progressText}>
                            {best} / {level.scoreToAdvance === Infinity ? "∞" : level.scoreToAdvance}
                          </Text>
                        </>
                      )}

                      {!unlocked && (
                        <Text style={styles.unlockHint}>
                          Score {LEVELS[level.id - 2]?.scoreToAdvance} on Lv{level.id - 1}
                        </Text>
                      )}

                      {unlocked && (
                        <View style={[styles.playBtn, { backgroundColor: level.color }]}>
                          <Text style={styles.playBtnText}>PLAY ▶</Text>
                        </View>
                      )}
                    </View>
                  </TouchableWithoutFeedback>
                );
              })}
            </View>
          )}

          {activeTab === "birds" && (
            <View style={styles.birdsGrid}>
              {BIRD_COLORS.map((bird) => (
                <TouchableWithoutFeedback key={bird.id} onPress={() => handleSelectBird(bird.id)}>
                  <View
                    style={[
                      styles.birdCard,
                      selectedBird === bird.id && {
                        borderColor: bird.primary,
                        backgroundColor: bird.primary + "15",
                      },
                    ]}
                  >
                    <BirdPreview color={bird.id} size={52} />
                    <Text style={[styles.birdName, { color: bird.primary }]}>{bird.name}</Text>
                    {selectedBird === bird.id && (
                      <Text style={[styles.selectedBadge, { color: bird.primary }]}>✓ SELECTED</Text>
                    )}
                  </View>
                </TouchableWithoutFeedback>
              ))}
            </View>
          )}

          {activeTab === "stats" && (
            <View style={styles.recordsContainer}>
              {LEVELS.map((level) => {
                const best = gameData?.bestScores[level.id] || 0;
                const unlocked = isUnlocked(level);
                return (
                  <View key={level.id} style={[styles.recordRow, { borderLeftColor: level.color }]}>
                    <Text style={styles.recordEmoji}>{level.emoji}</Text>
                    <View style={styles.recordInfo}>
                      <Text style={[styles.recordName, { color: unlocked ? level.color : "#444" }]}>
                        {level.name}
                      </Text>
                      <Text style={styles.recordTarget}>
                        Target: {level.scoreToAdvance === Infinity ? "∞" : level.scoreToAdvance}
                      </Text>
                    </View>
                    <Text style={[styles.recordScore, { color: unlocked ? "#fff" : "#333" }]}>
                      {best > 0 ? best : unlocked ? "0" : "🔒"}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050510",
  },
  star: {
    position: "absolute",
    borderRadius: 2,
    backgroundColor: "white",
  },
  content: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: 8,
    marginTop: 12,
  },
  titleSub: {
    color: "#4ade80",
    fontSize: 16,
    letterSpacing: 12,
    marginTop: -4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  statLabel: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 2,
  },
  tabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#0a0a1a",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "#1a1a2e",
  },
  tabText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  tabTextActive: {
    color: "#fff",
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  levelsGrid: {
    gap: 12,
  },
  levelCard: {
    backgroundColor: "#0a0a1a",
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
  },
  levelCardLocked: {
    backgroundColor: "#070710",
  },
  levelEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  levelName: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 3,
    marginBottom: 4,
  },
  levelSub: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 14,
  },
  progressBar: {
    width: "80%",
    height: 4,
    backgroundColor: "#1a1a2e",
    borderRadius: 2,
    marginBottom: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 14,
  },
  unlockHint: {
    color: "rgba(255,255,255,0.2)",
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 6,
  },
  playBtn: {
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  playBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 2,
  },
  birdsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  birdCard: {
    width: 130,
    backgroundColor: "#0a0a1a",
    borderWidth: 1,
    borderColor: "#1a1a2e",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  birdName: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
  selectedBadge: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  recordsContainer: {
    gap: 10,
  },
  recordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0a0a1a",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    gap: 12,
  },
  recordEmoji: {
    fontSize: 24,
  },
  recordInfo: {
    flex: 1,
  },
  recordName: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 2,
  },
  recordTarget: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 2,
  },
  recordScore: {
    fontSize: 22,
    fontWeight: "900",
  },
});

export default MenuScreen;
