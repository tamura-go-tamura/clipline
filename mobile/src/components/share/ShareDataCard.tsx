import React from 'react';
import {StyleSheet, View, Text, Button, Alert} from 'react-native';
import {Colors, Spacing, FontSize, BorderRadius} from '@/constants/theme';
import type {ShareData} from '@/types/models';
import {Config} from '@/constants/config';

interface ShareDataCardProps {
  data: ShareData;
  userId?: string;
  onClear: () => void;
}

export const ShareDataCard: React.FC<ShareDataCardProps> = ({
  data,
  userId,
  onClear,
}) => {
  const handleSendToLine = async () => {
    if (!userId) {
      Alert.alert('エラー', 'LINEにログインしてください');
      return;
    }

    try {
      // ShareDataから表示用のメッセージを生成
      let message = '';
      
      if (data.type === 'url' && data.url) {
        message = `📎 共有されたURL:\n${data.url}`;
        
        // メタデータがあれば追加
        if (data.metadata?.title) {
          message = `📎 ${data.metadata.title}\n${data.url}`;
        }
        if (data.metadata?.description) {
          message += `\n\n${data.metadata.description}`;
        }
      } else if (data.type === 'text' && data.text) {
        message = `📝 共有されたテキスト:\n${data.text}`;
      }
      
      // ユーザーコメントがあれば追加
      if (data.userComment) {
        message += `\n\n💬 コメント: ${data.userComment}`;
      }

      console.log('=== Sending shared data to LINE ===');
      const response = await fetch(`${Config.api.baseUrl}/api/line/send`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          userId,
          message,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Send Error:', errorText);
        Alert.alert('エラー', `送信失敗: ${errorText}`);
        return;
      }

      await response.json();
      Alert.alert(
        '送信成功！',
        'LINEアプリで確認してください 📱',
        [
          {
            text: 'OK',
            onPress: onClear,
          },
        ],
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : '送信に失敗しました';
      Alert.alert('エラー', message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {data.type === 'url' ? '📎 共有されたURL' : '📝 共有されたテキスト'}
        </Text>
      </View>
      
      <View style={styles.content}>
        {data.metadata?.title && (
          <Text style={styles.metaTitle}>{data.metadata.title}</Text>
        )}
        <Text style={styles.value} numberOfLines={3}>
          {data.type === 'url' ? data.url : data.text}
        </Text>
        {data.metadata?.description && (
          <Text style={styles.description} numberOfLines={2}>
            {data.metadata.description}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        <View style={styles.button}>
          <Button
            title="LINEに送信"
            onPress={handleSendToLine}
            color={Colors.primary}
          />
        </View>
        <View style={styles.button}>
          <Button
            title="クリア"
            onPress={onClear}
            color={Colors.textSecondary}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginVertical: Spacing.md,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textInverse,
  },
  content: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
  },
  metaTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: FontSize.sm,
    color: Colors.text,
    lineHeight: 20,
  },
  description: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  button: {
    flex: 1,
  },
});
