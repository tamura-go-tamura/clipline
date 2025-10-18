import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {LINE_CHANNEL_ID, SERVER_URL} from '@env';
import LineLogin from '@xmartlabs/react-native-line';

type User = {
  id: string;
  name: string;
  picture: string;
};

function App(): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(null);

  useEffect(() => {
    LineLogin.setup({ channelId: LINE_CHANNEL_ID });
  }, []);

  const onLogin = async () => {
    try {
      console.log('=== LINE Login Starting ===');
      
      const result = await LineLogin.login({
        onlyWebLogin: false,
      });

      console.log('=== LINE Login Success ===');
      console.log('Access Token:', result.accessToken.accessToken.substring(0, 20) + '...');

      const response = await fetch(`${SERVER_URL}/api/auth/line/sdk-callback`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          accessToken: result.accessToken.accessToken,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server Error:', errorText);
        Alert.alert('エラー', `サーバーエラー: ${errorText}`);
        return;
      }

      const data = await response.json();
      console.log('=== Server Response ===');
      console.log('User:', data.user);
      console.log('Link Token:', data.linkToken);

      setUser(data.user);
      setLinkToken(data.linkToken);

      Alert.alert(
        'ログイン成功！',
        `ようこそ、${data.user.name}さん！\n\nUser ID: ${data.user.id}\nLink Token: ${
          data.linkToken ? '取得済み' : '未取得'
        }`,
      );
    } catch (e: any) {
      console.error('LINE Login Error:', e);
      if (e.code === 'CANCEL') {
        console.log('User cancelled login');
      } else {
        Alert.alert('エラー', e?.message ?? 'Unknown error');
      }
    }
  };

  const onLogout = async () => {
    try {
      await LineLogin.logout();
      setUser(null);
      setLinkToken(null);
      Alert.alert('ログアウト', 'ログアウトしました');
    } catch (e) {
      console.error('Logout Error:', e);
    }
  };

  const onSendTestMessage = async () => {
    if (!user) {
      Alert.alert('エラー', 'ログインしてください');
      return;
    }

    try {
      console.log('=== Sending Test Message ===');
      const response = await fetch(`${SERVER_URL}/api/line/send`, {
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
    } catch (e: any) {
      console.error('Send Message Error:', e);
      Alert.alert('エラー', e?.message ?? 'Unknown error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
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

        <View style={styles.spacer} />

        {!user ? (
          <Button title="LINEでログイン" onPress={onLogin} />
        ) : (
          <View style={styles.buttonContainer}>
            <Button
              title="📨 テストメッセージ送信"
              onPress={onSendTestMessage}
              color="#06C755"
            />
            <Button
              title="ログアウト"
              onPress={onLogout}
              color="#999"
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {fontSize: 28, fontWeight: '700'},
  subtitle: {fontSize: 16, color: '#666', marginTop: 8},
  small: {fontSize: 12, color: '#999', marginTop: 8},
  userInfo: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    width: '100%',
  },
  userName: {fontSize: 18, fontWeight: '600', marginBottom: 4},
  userId: {fontSize: 12, color: '#666', marginBottom: 4},
  linkToken: {fontSize: 12, color: '#06C755', fontWeight: '600'},
  spacer: {height: 16},
  buttonContainer: {width: '100%', gap: 12},
});

export default App;
