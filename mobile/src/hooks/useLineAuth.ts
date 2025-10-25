import {useState} from 'react';
import LineLogin from '@xmartlabs/react-native-line';
import {Config} from '@/constants/config';
import type {User, LineAuthResponse} from '@/types/models';

interface UseLineAuthReturn {
  user: User | null;
  linkToken: string | null;
  loading: boolean;
  error: Error | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useLineAuth = (): UseLineAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const login = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('=== LINE Login Starting ===');

      const result = await LineLogin.login({
        onlyWebLogin: false,
      });

      console.log('=== LINE Login Success ===');
      console.log('Access Token:', result.accessToken.accessToken.substring(0, 20) + '...');

      const response = await fetch(`${Config.api.baseUrl}/api/auth/line/sdk-callback`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          accessToken: result.accessToken.accessToken,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server Error:', errorText);
        throw new Error(`サーバーエラー: ${errorText}`);
      }

      const data: LineAuthResponse = await response.json();
      console.log('=== Server Response ===');
      console.log('User:', data.user);
      console.log('Link Token:', data.linkToken);

      setUser(data.user);
      setLinkToken(data.linkToken);

    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('ログインに失敗しました');
      console.error('Login Error:', errorObj.message);
      setError(errorObj);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      await LineLogin.logout();
      
      setUser(null);
      setLinkToken(null);

      console.log('=== Logout Success ===');
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('ログアウトに失敗しました');
      console.error('Logout Error:', errorObj.message);
      setError(errorObj);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    linkToken,
    loading,
    error,
    login,
    logout,
  };
};
