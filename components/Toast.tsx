import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { ThemeColors } from '@/lib/theme';

interface ToastProps {
  message: string;
  visible: boolean;
  colors: ThemeColors;
  onHide: () => void;
}

export function Toast({ message, visible, colors, onHide }: ToastProps) {
  const [opacity] = useState(new Animated.Value(0));
  const [slideY] = useState(new Animated.Value(-30));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(slideY, { toValue: 0, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(slideY, { toValue: -30, duration: 300, useNativeDriver: true }),
        ]).start(() => onHide());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.text,
          opacity,
          transform: [{ translateY: slideY }],
        },
      ]}
    >
      <Text style={[styles.text, { color: colors.bg }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  text: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
});
