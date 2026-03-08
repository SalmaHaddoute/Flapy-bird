import React from "react";
import { View, StyleSheet } from "react-native";
import { PIPE, SCREEN, GROUND } from "../constants/gameConfig";

const PipeCap = ({ style }) => <View style={[styles.cap, style]} />;

const Pipe = ({ pipe, levelColor }) => {
  const capColor = levelColor || "#4ade80";

  return (
    <>
      {/* Top Pipe */}
      <View
        style={[
          styles.pipe,
          {
            left: pipe.x,
            top: 0,
            height: pipe.topHeight,
            borderColor: capColor,
          },
        ]}
      >
        {/* Cap at bottom of top pipe */}
        <View
          style={[
            styles.cap,
            {
              bottom: -10,
              backgroundColor: capColor,
              borderColor: darken(capColor),
            },
          ]}
        />
      </View>

      {/* Bottom Pipe */}
      <View
        style={[
          styles.pipe,
          {
            left: pipe.x,
            top: pipe.bottomY,
            bottom: GROUND.HEIGHT,
            borderColor: capColor,
          },
        ]}
      >
        {/* Cap at top of bottom pipe */}
        <View
          style={[
            styles.cap,
            {
              top: -10,
              backgroundColor: capColor,
              borderColor: darken(capColor),
            },
          ]}
        />
      </View>
    </>
  );
};

const darken = (hex) => {
  // Simple darkening for border
  return hex + "99";
};

const styles = StyleSheet.create({
  pipe: {
    position: "absolute",
    width: PIPE.WIDTH,
    backgroundColor: "#1a1a2e",
    borderWidth: 2,
    borderRadius: 4,
    overflow: "visible",
  },
  cap: {
    position: "absolute",
    width: PIPE.WIDTH + 12,
    height: 22,
    left: -8,
    borderRadius: 4,
    borderWidth: 2,
    zIndex: 2,
  },
});

export default Pipe;
