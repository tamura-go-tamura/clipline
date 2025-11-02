import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {Colors, Spacing, FontSize, BorderRadius} from '@/constants/theme';
import type {Memo} from '@/types/models';

interface MemoItemProps {
  memo: Memo;
  onPress?: (memo: Memo) => void;
}

// 相対時間を計算する関数
const getRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'たった今';
  if (diffMins < 60) return `${diffMins}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays === 1) return '昨日';
  if (diffDays < 7) return `${diffDays}日前`;
  
  // 7日以上前は日付表示
  const month = past.getMonth() + 1;
  const day = past.getDate();
  return `${month}月${day}日`;
};

export const MemoItem: React.FC<MemoItemProps> = ({memo, onPress}) => {
  // 表示する内容を決定
  const content = memo.type === 'url' 
    ? memo.url 
    : (memo.text || '');

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress?.(memo)}
      activeOpacity={0.7}
    >
      {/* メモカード（LINE風吹き出し） */}
      <View style={styles.bubble}>
        {/* タイトルがあれば表示（URLのメタデータなど） */}
        {memo.metadata?.title && (
          <Text style={styles.metaTitle} numberOfLines={2}>
            {memo.metadata.title}
          </Text>
        )}
        
        {/* メインコンテンツ */}
        <Text style={styles.content}>
          {content}
        </Text>
        
        {/* 説明文（URLのメタデータなど） */}
        {memo.metadata?.description && (
          <Text style={styles.description} numberOfLines={2}>
            {memo.metadata.description}
          </Text>
        )}
        
        {/* ユーザーコメント */}
        {memo.userComment && (
          <Text style={styles.comment}>
            {memo.userComment}
          </Text>
        )}
      </View>
      
      {/* タイムスタンプ */}
      <Text style={styles.timestamp}>
        {getRelativeTime(memo.createdAt)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'flex-start',
  },
  bubble: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    maxWidth: '85%',
    borderWidth: 1,
    borderColor: Colors.border,
    // LINE風の影
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  metaTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  content: {
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 22,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    lineHeight: 18,
  },
  comment: {
    fontSize: FontSize.sm,
    color: Colors.text,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 4,
    marginLeft: Spacing.sm,
  },
});
