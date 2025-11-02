import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {Colors, Spacing, FontSize, BorderRadius} from '@/constants/theme';

interface CreateMemoModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
}

export const CreateMemoModal: React.FC<CreateMemoModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [text, setText] = useState('');

  const handleSave = () => {
    if (!text.trim()) {
      Alert.alert('エラー', 'メモを入力してください');
      return;
    }

    onSave(text.trim());

    // リセット
    setText('');
    onClose();
  };

  const handleCancel = () => {
    setText('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>キャンセル</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>新規メモ</Text>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, styles.saveButton]}>
              保存
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* メモ入力 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>メモ</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="メモを入力してください..."
              placeholderTextColor={Colors.textTertiary}
              value={text}
              onChangeText={setText}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
              autoFocus
            />
          </View>

          {/* ヒント */}
          <View style={styles.hint}>
            <Text style={styles.hintText}>
              💡 チャット形式でメモを残せます{'\n'}
              思いついたことを気軽に書き留めましょう
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    padding: Spacing.xs,
    minWidth: 70,
  },
  headerButtonText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  saveButton: {
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'right',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  textArea: {
    minHeight: 200,
    paddingTop: Spacing.md,
  },
  hint: {
    backgroundColor: Colors.primary + '10',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  hintText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
