import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet } from "react-native";
import { COIN } from "../constants/gameConfig";

const Coin = ({ x, y, collected }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation de rotation continue
    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    rotateLoop.start();

    // Animation de collection
    if (collected) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.5,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }

    return () => rotateLoop.stop();
  }, [collected, rotateAnim, scaleAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (collected && scaleAnim._value === 0) return null;

  return (
    <Animated.View
      style={[
        styles.coin,
        {
          left: x,
          top: y,
          transform: [
            { scale: scaleAnim },
            { rotate },
          ],
          opacity: collected ? 0.5 : 1,
        },
      ]}
    >
      <View style={styles.coinOuter}>
        <View style={styles.coinInner}>
          <View style={styles.coinShine} />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  coin: {
    position: "absolute",
    width: COIN.WIDTH,
    height: COIN.HEIGHT,
    zIndex: 8,
  },
  coinOuter: {
    width: "100%",
    height: "100%",
    borderRadius: COIN.WIDTH / 2,
    backgroundColor: "#FFD700",
    borderWidth: 2,
    borderColor: "#FFA500",
    justifyContent: "center",
    alignItems: "center",
  },
  coinInner: {
    width: "70%",
    height: "70%",
    borderRadius: COIN.WIDTH * 0.35,
    backgroundColor: "#FFED4E",
    justifyContent: "center",
    alignItems: "center",
  },
  coinShine: {
    width: "40%",
    height: "40%",
    borderRadius: COIN.WIDTH * 0.2,
    backgroundColor: "#FFF8DC",
  },
});

export default Coin;
