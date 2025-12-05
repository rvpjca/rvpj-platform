"use client";

import { useEffect, useState } from "react";
import { Animated, StyleSheet, View } from "react-bits";

const CURSOR_SIZE = 32;
const INTERACTIVE_SELECTOR = "a, button, [role='button'], input, textarea, select, [data-cursor='interactive']";

const styles = StyleSheet.create({
  wrapper: {
    position: "fixed",
    width: CURSOR_SIZE,
    height: CURSOR_SIZE,
    borderRadius: CURSOR_SIZE / 2,
    borderWidth: 2,
    borderColor: "rgba(0, 90, 104, 0.9)",
    zIndex: 9999,
    pointerEvents: "none",
    shadowColor: "#045867",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    backgroundColor: "transparent",
  },
  innerDot: {
    position: "absolute",
    width: CURSOR_SIZE / 4,
    height: CURSOR_SIZE / 4,
    borderRadius: CURSOR_SIZE / 4,
    backgroundColor: "rgba(0, 90, 104, 0.35)",
    left: (CURSOR_SIZE - CURSOR_SIZE / 4) / 2,
    top: (CURSOR_SIZE - CURSOR_SIZE / 4) / 2,
  },
});

export function TargetCursor() {
  const [enabled, setEnabled] = useState(false);
  const [position] = useState(() => new Animated.ValueXY({ x: -CURSOR_SIZE, y: -CURSOR_SIZE }));
  const [scale] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(pointer: fine)");
    const update = () => setEnabled(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    const move = (event: MouseEvent) => {
      Animated.spring(position, {
        toValue: {
          x: event.clientX - CURSOR_SIZE / 2,
          y: event.clientY - CURSOR_SIZE / 2,
        },
        tension: 200,
        friction: 24,
        useNativeDriver: false,
      }).start();

      const element = (event.target as HTMLElement | null)?.closest(INTERACTIVE_SELECTOR);
      const targetScale = element ? 1.35 : 1;

      Animated.spring(scale, {
        toValue: targetScale,
        tension: 180,
        friction: 16,
        useNativeDriver: false,
      }).start();
    };

    const hide = () => {
      Animated.spring(scale, {
        toValue: 0,
        tension: 180,
        friction: 16,
        useNativeDriver: false,
      }).start();
    };

    const show = () => {
      Animated.spring(scale, {
        toValue: 1,
        tension: 200,
        friction: 18,
        useNativeDriver: false,
      }).start();
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", hide);
    window.addEventListener("mouseenter", show);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", hide);
      window.removeEventListener("mouseenter", show);
    };
  }, [enabled, position, scale]);

  if (!enabled) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrapper,
        {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { scale },
          ],
          opacity: scale,
        },
      ]}
    >
      <View style={styles.innerDot} pointerEvents="none" />
    </Animated.View>
  );
}


