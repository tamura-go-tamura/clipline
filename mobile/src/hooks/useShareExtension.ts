import {useState, useEffect, useCallback} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import ShareExtension from '@/services/share/ShareExtension';
import type {ShareData} from '@/types/models';

interface UseShareExtensionReturn {
  sharedData: ShareData | null;
  loading: boolean;
  error: Error | null;
  checkForSharedData: () => Promise<void>;
  clearSharedData: () => Promise<void>;
}

export const useShareExtension = (): UseShareExtensionReturn => {
  const [sharedData, setSharedData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const checkForSharedData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('=== Checking for shared data ===');
      const data = await ShareExtension.getSharedData();
      
      if (data) {
        console.log('=== Shared data found ===', data);
        setSharedData(data);
      } else {
        console.log('=== No shared data ===');
        setSharedData(null);
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to get shared data');
      console.error('Share Extension Error:', errorObj.message);
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSharedData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('=== Clearing shared data ===');
      await ShareExtension.clearSharedData();
      setSharedData(null);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to clear shared data');
      console.error('Clear Shared Data Error:', errorObj.message);
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, []);

  // アプリがフォアグラウンドに戻った時にチェック
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('=== App became active, checking for shared data ===');
        checkForSharedData();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // 初回チェック
    checkForSharedData();

    return () => {
      subscription.remove();
    };
  }, [checkForSharedData]);

  return {
    sharedData,
    loading,
    error,
    checkForSharedData,
    clearSharedData,
  };
};
