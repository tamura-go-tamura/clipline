import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import {useAuth} from '@/contexts/AuthContext';
import {useShareExtension} from '@/hooks/useShareExtension';
import {ShareDataCard} from '@/components/share/ShareDataCard';
import {MemoListScreen} from '@/screens/MemoListScreen';
import {Colors, Spacing, FontSize, BorderRadius} from '@/constants/theme';
import {Config} from '@/constants/config';

export const HomeScreen: React.FC = () => {
  const {user, linkToken, loading, error, login, logout} = useAuth();
  const {
    sharedData,
    loading: shareLoading, // eslint-disable-line @typescript-eslint/no-unused-vars
    clearSharedData,
  } = useShareExtension();

  const [isMemoListVisible, setIsMemoListVisible] = React.useState(false);

  const handleLogin = async () => {
    try {
      await login();
      Alert.alert(
        'ログイン成功！',
        `ようこそ、${user?.name}さん！\n\nUser ID: ${user?.id}\nLink Token: ${
          linkToken ? '取得済み' : '未取得'
        }`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ログインに失敗しました';
      Alert.alert('エラー', message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert('ログアウト', 'ログアウトしました');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ログアウトに失敗しました';
      Alert.alert('エラー', message);
    }
  };

  const handleSendTestMessage = async () => {
    if (!user) {
      Alert.alert('エラー', 'ログインしてください');
      return;
    }

    try {
      console.log('=== Sending Test Message ===');
      const response = await fetch(`${Config.api.baseUrl}/api/line/send`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          userId: user.id,
          message: '🎉 ClipLineからのテストメッセージです！\n\nLINE Login & Messaging API連携成功！',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Send Error:', errorText);
        Alert.alert('エラー', `送信失敗: ${errorText}`);
        return;
      }

      const data = await response.json();
      console.log('Message sent:', data);
      Alert.alert('送信成功！', 'LINEアプリで確認してください 📱');
    } catch (err) {
      const message = err instanceof Error ? err.message : '送信に失敗しました';
      Alert.alert('エラー', message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.content}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>処理中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>ClipLine</Text>
          <Text style={styles.subtitle}>共有メモをLINEに集約</Text>

          {user ? (
            <View style={styles.userInfo}>
              <Text style={styles.userName}>👤 {user.name}</Text>
              <Text style={styles.userId}>ID: {user.id}</Text>
              {linkToken && (
                <Text style={styles.linkToken}>🔗 Link Token取得済み</Text>
              )}
            </View>
          ) : (
            <Text style={styles.small}>LINE SDK使用</Text>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>❌ {error.message}</Text>
            </View>
          )}

          {/* Share Extension Data */}
          {sharedData && (
            <ShareDataCard
              data={sharedData}
              userId={user?.id}
              onClear={clearSharedData}
            />
          )}

          <View style={styles.spacer} />

          {!user ? (
            <Button title="LINEでログイン" onPress={handleLogin} color={Colors.primary} />
          ) : (
            <View style={styles.buttonContainer}>
              <Button
                title="� メモ一覧を見る"
                onPress={() => setIsMemoListVisible(true)}
                color={Colors.primary}
              />
              <Button
                title="�📨 テストメッセージ送信"
                onPress={handleSendTestMessage}
                color={Colors.primary}
              />
              <Button
                title="ログアウト"
                onPress={handleLogout}
                color={Colors.textSecondary}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* メモ一覧モーダル */}
      <Modal
        visible={isMemoListVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsMemoListVisible(false)}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            onPress={() => setIsMemoListVisible(false)}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>✕ 閉じる</Text>
          </TouchableOpacity>
        </View>
        <MemoListScreen />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  small: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
  userInfo: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    width: '100%',
  },
  userName: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  userId: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  linkToken: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '600',
  },
  errorContainer: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.error + '20',
    borderRadius: BorderRadius.md,
    width: '100%',
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.error,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  spacer: {
    height: Spacing.md,
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  closeButtonText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
});
