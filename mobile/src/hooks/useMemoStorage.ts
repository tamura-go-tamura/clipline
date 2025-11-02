import {useState, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {Memo} from '@/types/models';

const MEMOS_STORAGE_KEY = '@clipline_memos';

interface UseMemoStorageReturn {
  memos: Memo[];
  loading: boolean;
  error: Error | null;
  addMemo: (text: string) => Promise<void>;
  updateMemo: (id: string, updates: Partial<Memo>) => Promise<void>;
  deleteMemo: (id: string) => Promise<void>;
  clearAllMemos: () => Promise<void>;
  refreshMemos: () => Promise<void>;
}

export const useMemoStorage = (): UseMemoStorageReturn => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // メモを読み込む
  const loadMemos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const storedMemos = await AsyncStorage.getItem(MEMOS_STORAGE_KEY);
      if (storedMemos) {
        const parsed = JSON.parse(storedMemos) as Memo[];
        // 古い順にソート（チャット形式用）
        const sorted = parsed.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMemos(sorted);
      } else {
        setMemos([]);
      }
    } catch (err) {
      console.error('Failed to load memos:', err);
      setError(err instanceof Error ? err : new Error('メモの読み込みに失敗しました'));
    } finally {
      setLoading(false);
    }
  }, []);

  // 初回読み込み
  useEffect(() => {
    loadMemos();
  }, [loadMemos]);

  // メモを保存（内部用）
  const saveMemos = async (newMemos: Memo[]) => {
    await AsyncStorage.setItem(MEMOS_STORAGE_KEY, JSON.stringify(newMemos));
  };

  // メモを追加
  const addMemo = useCallback(async (text: string) => {
    try {
      const now = new Date().toISOString();
      const newMemo: Memo = {
        id: `memo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'text',
        text: text,
        createdAt: now,
        updatedAt: now,
      };

      // 末尾に追加（古い順なので）
      const updatedMemos = [...memos, newMemo];
      await saveMemos(updatedMemos);
      setMemos(updatedMemos);
      
      console.log('✅ Memo added:', newMemo.id);
    } catch (err) {
      console.error('Failed to add memo:', err);
      throw err instanceof Error ? err : new Error('メモの追加に失敗しました');
    }
  }, [memos]);

  // メモを更新
  const updateMemo = useCallback(async (id: string, updates: Partial<Memo>) => {
    try {
      const updatedMemos = memos.map(memo =>
        memo.id === id
          ? {...memo, ...updates, updatedAt: new Date().toISOString()}
          : memo
      );
      
      await saveMemos(updatedMemos);
      setMemos(updatedMemos);
      
      console.log('✅ Memo updated:', id);
    } catch (err) {
      console.error('Failed to update memo:', err);
      throw err instanceof Error ? err : new Error('メモの更新に失敗しました');
    }
  }, [memos]);

  // メモを削除
  const deleteMemo = useCallback(async (id: string) => {
    try {
      const updatedMemos = memos.filter(memo => memo.id !== id);
      await saveMemos(updatedMemos);
      setMemos(updatedMemos);
      
      console.log('✅ Memo deleted:', id);
    } catch (err) {
      console.error('Failed to delete memo:', err);
      throw err instanceof Error ? err : new Error('メモの削除に失敗しました');
    }
  }, [memos]);

  // すべてのメモを削除
  const clearAllMemos = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(MEMOS_STORAGE_KEY);
      setMemos([]);
      
      console.log('✅ All memos cleared');
    } catch (err) {
      console.error('Failed to clear memos:', err);
      throw err instanceof Error ? err : new Error('メモのクリアに失敗しました');
    }
  }, []);

  // メモを再読み込み
  const refreshMemos = useCallback(async () => {
    await loadMemos();
  }, [loadMemos]);

  return {
    memos,
    loading,
    error,
    addMemo,
    updateMemo,
    deleteMemo,
    clearAllMemos,
    refreshMemos,
  };
};
