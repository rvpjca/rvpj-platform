import StyleSheet from "react-native-web/dist/cjs/exports/StyleSheet/index.js";

type ResolveResult = {
  className?: string;
  style?: Record<string, unknown>;
};

const StyleRegistry = {
  resolve(style?: unknown): ResolveResult {
    try {
      if (StyleSheet && typeof StyleSheet.flatten === "function") {
        return {
          className: "",
          style: StyleSheet.flatten(style ?? {}) ?? {},
        };
      }
      return {
        className: "",
        style: (style as Record<string, unknown>) ?? {},
      };
    } catch (error) {
      console.warn("StyleRegistry shim failed to resolve style", error);
      return { className: "", style: {} };
    }
  },
};

export default StyleRegistry;



