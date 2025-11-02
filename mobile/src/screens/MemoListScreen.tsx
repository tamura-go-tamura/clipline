import React, {useState, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {Colors, Spacing, FontSize} from '@/constants/theme';
import type {Memo} from '@/types/models';
import {MemoItem} from '@/components/memo/MemoItem';
import {EmptyMemoList} from '@/components/memo/EmptyMemoList';
import {useMemoStorage} from '@/hooks/useMemoStorage';

export const MemoListScreen: React.FC = () => {
  const {memos, addMemo} = useMemoStorage();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const handleMemoPress = (memo: Memo) => {
    console.log('Memo pressed:', memo.id);
    // TODO: メモ詳細モーダルを表示
  };

  const handleSendMemo = async () => {
    if (!inputText.trim()) {
      return;
    }

    try {
      await addMemo(inputText.trim());
      setInputText('');
      
      // 新しいメモを送信したら最下部にスクロール
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
    } catch {
      Alert.alert('エラー', 'メモの追加に失敗しました');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* ヘッダー */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>メモ帳</Text>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{memos.length}</Text>
            </View>
          </View>
        </View>

        {/* メモリスト */}
        {memos.length === 0 ? (
          <EmptyMemoList />
        ) : (
          <FlatList
            ref={flatListRef}
            data={memos}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <MemoItem memo={item} onPress={handleMemoPress} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              // コンテンツサイズが変わったら最下部にスクロール
              flatListRef.current?.scrollToEnd({animated: false});
            }}
          />
        )}

        {/* 入力エリア（固定） */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="メモを入力..."
            placeholderTextColor={Colors.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMemo}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>送信</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  headerBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  headerBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textInverse,
  },
  listContent: {
    paddingVertical: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 36,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.textTertiary,
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textInverse,
  },
});
