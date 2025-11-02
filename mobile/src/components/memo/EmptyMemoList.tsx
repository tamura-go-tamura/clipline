import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {Colors, Spacing, FontSize} from '@/constants/theme';

export const EmptyMemoList: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📝</Text>
      <Text style={styles.title}>メモがまだありません</Text>
      <Text style={styles.description}>
        Safariの共有ボタンから{'\n'}
        ClipLineにメモを追加できます
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
