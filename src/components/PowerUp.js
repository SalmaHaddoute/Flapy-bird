import React, { useEffect, useRef } from "react";
import { Animated, View, Text, StyleSheet } from "react-native";
import { POWERUP } from "../constants/gameConfig";

const PowerUp = ({ x, y, type, collected }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation de pulsation continue
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // Animation de collection
    if (collected) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }

    return () => pulseLoop.stop();
  }, [collected, pulseAnim, scaleAnim]);

  const powerUpConfig = POWERUP.TYPES[type.toUpperCase()] || POWERUP.TYPES.SHIELD;

  if (collected && scaleAnim._value === 0) return null;

  return (
    <Animated.View
      style={[
        styles.powerUp,
        {
          left: x,
          top: y,
          backgroundColor: powerUpConfig.color,
          transform: [
            { scale: Animated.multiply(scaleAnim, pulseAnim) },
          ],
          opacity: collected ? 0.5 : 1,
        },
      ]}
    >
      <Text style={styles.powerUpIcon}>
        {powerUpConfig.icon}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  powerUp: {
    position: "absolute",
    width: POWERUP.WIDTH,
    height: POWERUP.HEIGHT,
    borderRadius: POWERUP.WIDTH / 2,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 9,
  },
  powerUpIcon: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default PowerUp;
