# ClipLine モバイルアプリ開発ガイドライン

最終更新: 2025-10-25

## 目次
1. [ディレクトリ構造](#ディレクトリ構造)
2. [コーディング規約](#コーディング規約)
3. [命名規則](#命名規則)
4. [コンポーネント設計](#コンポーネント設計)
5. [状態管理](#状態管理)
6. [ファイル配置ルール](#ファイル配置ルール)
7. [Import順序](#import順序)

---

## ディレクトリ構造

```
mobile/
├── src/
│   ├── components/          # 再利用可能なUIコンポーネント
│   │   ├── common/         # 汎用コンポーネント（Button, Input等）
│   │   ├── share/          # シェア機能関連
│   │   └── line/           # LINE連携関連
│   │
│   ├── screens/            # 画面コンポーネント
│   │   ├── HomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── ShareScreen.tsx
│   │   └── SettingsScreen.tsx
│   │
│   ├── navigation/         # ナビゲーション設定
│   │   ├── AppNavigator.tsx
│   │   └── types.ts
│   │
│   ├── hooks/              # カスタムフック
│   │   ├── useLineAuth.ts
│   │   ├── useShare.ts
│   │   └── useStorage.ts
│   │
│   ├── services/           # 外部API/サービス連携
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   └── share.ts
│   │   ├── line/
│   │   │   ├── auth.ts
│   │   │   └── messaging.ts
│   │   └── storage/
│   │       └── secureStorage.ts
│   │
│   ├── utils/              # ユーティリティ関数
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   └── helpers.ts
│   │
│   ├── constants/          # 定数定義
│   │   ├── config.ts
│   │   ├── colors.ts
│   │   └── messages.ts
│   │
│   ├── types/              # TypeScript型定義
│   │   ├── models.ts       # データモデル
│   │   ├── api.ts          # API型定義
│   │   └── navigation.ts   # ナビゲーション型
│   │
│   ├── contexts/           # React Context
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   └── assets/             # 静的リソース
│       ├── images/
│       ├── fonts/
│       └── icons/
│
├── ios/                    # iOSネイティブコード
│   ├── ShareExtension/    # Share Extension
│   │   ├── Info.plist
│   │   ├── ShareViewController.swift
│   │   └── ShareExtension.entitlements
│   └── mobile/
│       └── AppDelegate.swift
│
├── android/                # Androidネイティブコード
│   └── app/
│       └── src/
│           └── main/
│               ├── java/
│               └── AndroidManifest.xml
│
├── __tests__/              # テストファイル
│   ├── components/
│   ├── hooks/
│   └── utils/
│
├── App.tsx                 # アプリケーションエントリーポイント
├── index.js                # React Nativeエントリーポイント
└── package.json
```

---

## コーディング規約

### 基本原則
- **TypeScript優先**: すべての新規コードはTypeScriptで記述
- **関数型プログラミング**: 可能な限り純粋関数を使用
- **小さなコンポーネント**: 1ファイル200行以内を目標
- **単一責任の原則**: 1つのファイル/関数は1つの役割のみ

### TypeScript
```typescript
// ✅ Good: 明示的な型定義
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = async (id: string): Promise<User> => {
  // ...
};

// ❌ Bad: any型の使用
const getUser = async (id: any): Promise<any> => {
  // ...
};
```

### React Hooks
```typescript
// ✅ Good: カスタムフックに分離
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  
  const login = async () => {
    // ...
  };
  
  return { user, loading, login };
};

// ❌ Bad: コンポーネント内にロジック詰め込み
const LoginScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  // 大量のロジック...
};
```

---

## 命名規則

### ファイル名
- **コンポーネント**: PascalCase + `.tsx`
  - `LoginScreen.tsx`, `Button.tsx`
- **フック**: camelCase + `.ts`
  - `useAuth.ts`, `useShare.ts`
- **ユーティリティ**: camelCase + `.ts`
  - `validators.ts`, `formatters.ts`
- **定数**: camelCase + `.ts`
  - `config.ts`, `colors.ts`

### 変数・関数名
```typescript
// ✅ Good: 明確で説明的な名前
const isUserLoggedIn = true;
const handleLoginButtonPress = () => {};
const getUserProfile = async (userId: string) => {};

// ❌ Bad: 略語や曖昧な名前
const isLogged = true;
const onClick = () => {};
const get = async (id: string) => {};
```

### コンポーネント名
```typescript
// ✅ Good: 名詞形、役割が明確
const LoginButton = () => {};
const UserProfile = () => {};
const ShareDialog = () => {};

// ❌ Bad: 動詞形、役割不明
const Login = () => {};
const Display = () => {};
const Handle = () => {};
```

---

## コンポーネント設計

### コンポーネント分類

#### 1. Presentational Components (表示専用)
```typescript
// src/components/common/Button.tsx
interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, styles[variant]]}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};
```

#### 2. Container Components (ロジック含む)
```typescript
// src/screens/LoginScreen.tsx
export const LoginScreen: React.FC = () => {
  const { user, loading, login } = useAuth();
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      await login();
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('エラー', 'ログインに失敗しました');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Button
        title="LINEでログイン"
        onPress={handleLogin}
        disabled={loading}
      />
    </SafeAreaView>
  );
};
```

### Props設計
```typescript
// ✅ Good: インターフェースで明示的に定義
interface ShareItemProps {
  url: string;
  title: string;
  description?: string;
  onShare: (url: string) => void;
  onCancel?: () => void;
}

// ❌ Bad: 型定義なし
const ShareItem = (props) => {
  // ...
};
```

---

## 状態管理

### ローカル状態 (useState)
```typescript
// シンプルなUI状態はuseStateで管理
const [isVisible, setIsVisible] = useState(false);
const [inputText, setInputText] = useState('');
```

### グローバル状態 (Context API)
```typescript
// src/contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  
  const login = async (token: string) => {
    // ログイン処理
  };
  
  const logout = async () => {
    // ログアウト処理
  };
  
  return (
    <AuthContext.Provider value={{user, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
};
```

### カスタムフック
```typescript
// src/hooks/useAuth.ts
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## ファイル配置ルール

### 1. 画面（Screen）
- `src/screens/` 配下に配置
- 1画面 = 1ファイル
- ナビゲーションスタックの単位

### 2. 再利用可能なコンポーネント
- `src/components/` 配下に配置
- 機能ごとにサブディレクトリで分類
- 複数画面で使用される可能性があるもの

### 3. ビジネスロジック
- `src/services/` 配下に配置
- API通信、データ変換など
- UIに依存しないロジック

### 4. カスタムフック
- `src/hooks/` 配下に配置
- ロジックの再利用
- 状態管理とロジックの分離

---

## Import順序

```typescript
// 1. React関連
import React, {useState, useEffect} from 'react';

// 2. React Native関連
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

// 3. サードパーティライブラリ
import {useNavigation} from '@react-navigation/native';
import LineLogin from '@xmartlabs/react-native-line';

// 4. プロジェクト内の絶対パス（@/から始まる）
import {Button} from '@/components/common/Button';
import {useAuth} from '@/hooks/useAuth';
import {API_URL} from '@/constants/config';

// 5. 相対パス
import {LoginForm} from './components/LoginForm';
import {styles} from './styles';

// 6. 型定義
import type {User} from '@/types/models';
```

---

## スタイリング

### StyleSheet使用
```typescript
// ✅ Good: StyleSheetで定義
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
});

// ❌ Bad: インラインスタイル
<View style={{flex: 1, padding: 16}} />
```

### 色・サイズの定数化
```typescript
// src/constants/colors.ts
export const Colors = {
  primary: '#06C755',      // LINE Green
  secondary: '#00B900',
  background: '#FFFFFF',
  text: '#000000',
  textSecondary: '#666666',
  error: '#FF0000',
  border: '#E0E0E0',
};

// src/constants/spacing.ts
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
```

---

## エラーハンドリング

### Try-Catch
```typescript
// ✅ Good: 適切なエラーハンドリング
const fetchUserData = async (userId: string): Promise<User | null> => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to fetch user:', error.message);
    }
    Alert.alert('エラー', 'ユーザー情報の取得に失敗しました');
    return null;
  }
};
```

---

## テスト

### ファイル配置
```
__tests__/
├── components/
│   └── Button.test.tsx
├── hooks/
│   └── useAuth.test.ts
└── utils/
    └── validators.test.ts
```

### テストの書き方
```typescript
// __tests__/components/Button.test.tsx
import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {Button} from '@/components/common/Button';

describe('Button', () => {
  it('正しくレンダリングされる', () => {
    const {getByText} = render(
      <Button title="テスト" onPress={() => {}} />
    );
    expect(getByText('テスト')).toBeTruthy();
  });

  it('押下時にonPressが呼ばれる', () => {
    const onPress = jest.fn();
    const {getByText} = render(
      <Button title="テスト" onPress={onPress} />
    );
    
    fireEvent.press(getByText('テスト'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

---

## Git運用

### ブランチ戦略
- `main`: 本番環境
- `develop`: 開発環境
- `feature/*`: 機能開発
- `bugfix/*`: バグ修正
- `hotfix/*`: 緊急修正

### コミットメッセージ
```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント修正
style: コードフォーマット
refactor: リファクタリング
test: テスト追加・修正
chore: ビルド・設定変更

例:
feat: Share Extension追加
fix: LINE認証エラー修正
docs: 開発ガイドライン追加
```

---

## パフォーマンス最適化

### メモ化
```typescript
// ✅ Good: useMemo/useCallbackでメモ化
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

const handlePress = useCallback(() => {
  // 処理
}, [dependency]);
```

### リスト最適化
```typescript
// ✅ Good: FlatListでkeyExtractor指定
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({item}) => <Item data={item} />}
  windowSize={5}
  maxToRenderPerBatch={10}
/>
```

---

## セキュリティ

### 環境変数
```typescript
// ✅ Good: .envファイルで管理
// .env
LINE_CHANNEL_ID=1234567890
SERVER_URL=https://api.clipline.app

// 使用
import {LINE_CHANNEL_ID} from '@env';
```

### 機密情報の保存
```typescript
// ✅ Good: react-native-keychainで暗号化保存
import * as Keychain from 'react-native-keychain';

await Keychain.setGenericPassword('user', token);
const credentials = await Keychain.getGenericPassword();
```

---

## まとめ

このガイドラインに従うことで：
- 📁 明確なファイル構成
- 🔧 保守しやすいコード
- 🚀 スケーラブルなアーキテクチャ
- 👥 チーム開発の効率化

を実現します。
