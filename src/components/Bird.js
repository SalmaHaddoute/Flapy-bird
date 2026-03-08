import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet } from "react-native";
import { BIRD, BIRD_COLORS } from "../constants/gameConfig";

const BirdSVG = ({ color, wingUp }) => {
  const c = BIRD_COLORS.find((b) => b.id === color) || BIRD_COLORS[0];
  return (
    <View style={styles.birdContainer}>
      {/* Body */}
      <View style={[styles.body, { backgroundColor: c.primary }]} />
      {/* Wing */}
      <View
        style={[
          styles.wing,
          {
            backgroundColor: c.secondary,
            top: wingUp ? 6 : 14,
          },
        ]}
      />
      {/* Eye */}
      <View style={styles.eyeOuter}>
        <View style={styles.eyeInner} />
      </View>
      {/* Beak */}
      <View style={[styles.beak, { borderLeftColor: "#FF8C00" }]} />
    </View>
  );
};

const Bird = ({ y, rotation, color, isAlive }) => {
  const wingAnim = useRef(new Animated.Value(0)).current;
  const wingRef = useRef(null);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wingAnim, { toValue: 1, duration: 180, useNativeDriver: false }),
        Animated.timing(wingAnim, { toValue: 0, duration: 180, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const wingUp = wingAnim._value > 0.5;

  return (
    <View
      style={[
        styles.birdWrapper,
        {
          top: y,
          left: BIRD.X,
          transform: [{ rotate: `${rotation}deg` }],
          opacity: isAlive ? 1 : 0.5,
        },
      ]}
    >
      <BirdSVG color={color} wingUp={wingUp} />
    </View>
  );
};

const styles = StyleSheet.create({
  birdWrapper: {
    position: "absolute",
    width: BIRD.WIDTH,
    height: BIRD.HEIGHT,
    zIndex: 10,
  },
  birdContainer: {
    width: BIRD.WIDTH,
    height: BIRD.HEIGHT,
    position: "relative",
  },
  body: {
    position: "absolute",
    width: 38,
    height: 28,
    borderRadius: 14,
    top: 2,
    left: 2,
  },
  wing: {
    position: "absolute",
    width: 22,
    height: 12,
    borderRadius: 6,
    left: 6,
    backgroundColor: "#FF8C00",
  },
  eyeOuter: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "white",
    top: 5,
    right: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  eyeInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#111",
  },
  beak: {
    position: "absolute",
    top: 12,
    right: 0,
    width: 0,
    height: 0,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftWidth: 10,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#FF8C00",
  },
});

export default Bird;
