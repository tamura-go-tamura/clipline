# Share Extension実装ガイド

このドキュメントでは、iOS Share ExtensionをReact Nativeアプリに追加する手順を説明します。

## 概要

Share Extensionを使用すると、SafariなどのブラウザからURLやテキストを共有して、ClipLineアプリで直接受け取ることができます。

## 実装手順

### 1. Xcodeでプロジェクトを開く

```bash
cd /Users/yuta/Downloads/ClipLine/mobile/ios
open mobile.xcworkspace
```

### 2. Share Extension Targetの追加

1. Xcodeで`File` → `New` → `Target...`を選択
2. `iOS` → `Application Extension` → `Share Extension`を選択
3. 以下の設定を入力:
   - **Product Name**: `ShareExtension`
   - **Language**: `Swift`
   - **Project**: `mobile`
   - **Embed in Application**: `mobile`
4. `Finish`をクリック
5. `Activate "ShareExtension" scheme?`と聞かれたら`Cancel`を選択

### 3. Bundle Identifierの設定

1. XcodeでShareExtension targetを選択
2. `General` → `Identity` → `Bundle Identifier`を以下に変更:
   ```
   com.tamuy.clipline.ShareExtension
   ```

### 4. Deployment Targetの設定

1. ShareExtension targetで`General` → `Deployment Info` → `Minimum Deployments`を`15.1`に設定
2. メインアプリ(mobile target)のDeployment Targetと一致させる

### 5. App Groupの設定

#### メインアプリ(mobile target)の設定:

1. mobile targetを選択
2. `Signing & Capabilities`タブを開く
3. `+ Capability`をクリック → `App Groups`を選択
4. `+`ボタンで新しいApp Groupを追加:
   ```
   group.com.tamuy.clipline
   ```
5. チェックボックスにチェックを入れる

#### ShareExtension targetの設定:

1. ShareExtension targetを選択
2. `Signing & Capabilities`タブを開く
3. `+ Capability`をクリック → `App Groups`を選択
4. 同じApp Groupを選択:
   ```
   group.com.tamuy.clipline
   ```
5. チェックボックスにチェックを入れる

### 6. Info.plistの設定

ShareExtension/Info.plistを開き、`NSExtension`セクションを以下のように編集:

```xml
<key>NSExtension</key>
<dict>
    <key>NSExtensionAttributes</key>
    <dict>
        <key>NSExtensionActivationRule</key>
        <dict>
            <key>NSExtensionActivationSupportsWebURLWithMaxCount</key>
            <integer>1</integer>
            <key>NSExtensionActivationSupportsText</key>
            <true/>
        </dict>
    </dict>
    <key>NSExtensionMainStoryboard</key>
    <string>MainInterface</string>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.share-services</string>
</dict>
```

これにより、以下の共有をサポート:
- URLの共有(最大1件)
- テキストの共有

### 7. ShareViewController.swiftの実装

`ShareExtension/ShareViewController.swift`を以下の内容に置き換え:

```swift
import UIKit
import Social
import MobileCoreServices
import UniformTypeIdentifiers

class ShareViewController: SLComposeServiceViewController {
    
    let appGroupId = "group.com.tamuy.clipline"
    let sharedDataKey = "ShareExtensionData"
    
    override func isContentValid() -> Bool {
        return true
    }
    
    override func didSelectPost() {
        if let content = extensionContext?.inputItems.first as? NSExtensionItem {
            if let attachments = content.attachments {
                handleAttachments(attachments)
            }
        }
    }
    
    private func handleAttachments(_ attachments: [NSItemProvider]) {
        for attachment in attachments {
            // URLの処理
            if attachment.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                attachment.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { [weak self] (item, error) in
                    if let url = item as? URL {
                        self?.saveSharedData(type: "url", value: url.absoluteString)
                    }
                    self?.completeRequest()
                }
                return
            }
            
            // テキストの処理
            if attachment.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
                attachment.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: nil) { [weak self] (item, error) in
                    if let text = item as? String {
                        self?.saveSharedData(type: "text", value: text)
                    }
                    self?.completeRequest()
                }
                return
            }
        }
        
        // 何も処理できなかった場合
        completeRequest()
    }
    
    private func saveSharedData(type: String, value: String) {
        let sharedDefaults = UserDefaults(suiteName: appGroupId)
        let data: [String: String] = [
            "type": type,
            "value": value,
            "timestamp": ISO8601DateFormatter().string(from: Date())
        ]
        
        if let jsonData = try? JSONSerialization.data(withJSONObject: data),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            sharedDefaults?.set(jsonString, forKey: sharedDataKey)
            sharedDefaults?.synchronize()
            print("✅ Saved shared data: \(type) - \(value)")
        }
    }
    
    private func completeRequest() {
        // メインアプリを開く
        let urlString = "clipline://share"
        if let url = URL(string: urlString) {
            var responder: UIResponder? = self
            while responder != nil {
                if let application = responder as? UIApplication {
                    application.open(url, options: [:], completionHandler: nil)
                    break
                }
                responder = responder?.next
            }
        }
        
        // Share Extensionを閉じる
        self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
    }
    
    override func configurationItems() -> [Any]! {
        return []
    }
}
```

### 8. Native Moduleの実装

`ios/mobile/ShareExtensionModule.swift`を作成:

```swift
import Foundation
import React

@objc(ShareExtensionModule)
class ShareExtensionModule: NSObject {
  
  let appGroupId = "group.com.tamuy.clipline"
  let sharedDataKey = "ShareExtensionData"
  
  @objc
  func getSharedData(_ resolve: @escaping RCTPromiseResolveBlock,
                     reject: @escaping RCTPromiseRejectBlock) {
    let sharedDefaults = UserDefaults(suiteName: appGroupId)
    
    if let jsonString = sharedDefaults?.string(forKey: sharedDataKey),
       let jsonData = jsonString.data(using: .utf8),
       let data = try? JSONSerialization.jsonObject(with: jsonData) as? [String: String] {
      resolve(data)
    } else {
      resolve(nil)
    }
  }
  
  @objc
  func clearSharedData(_ resolve: @escaping RCTPromiseResolveBlock,
                       reject: @escaping RCTPromiseRejectBlock) {
    let sharedDefaults = UserDefaults(suiteName: appGroupId)
    sharedDefaults?.removeObject(forKey: sharedDataKey)
    sharedDefaults?.synchronize()
    resolve(nil)
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
```

`ios/mobile/ShareExtensionModule.m`を作成:

```objc
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ShareExtensionModule, NSObject)

RCT_EXTERN_METHOD(getSharedData:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(clearSharedData:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

@end
```

### 9. Bridging Headerの設定(必要な場合)

もしプロジェクトにSwiftファイルを初めて追加する場合、Xcodeが自動的にBridging Headerを作成するか尋ねます。`Create Bridging Header`を選択してください。

### 10. メインアプリのInfo.plistにURL Schemeを追加

`ios/mobile/Info.plist`に以下を追加(既に`clipline`スキームがある場合はスキップ):

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>com.tamuy.clipline</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>clipline</string>
        </array>
    </dict>
</array>
```

### 11. AppDelegate.swiftにURL処理を追加

既存の`AppDelegate.swift`に、Share ExtensionからのURL起動を処理するコードを追加:

```swift
// URL Scheme handling
func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
  if url.scheme == "clipline" && url.host == "share" {
    // Share Extensionからの起動
    NotificationCenter.default.post(name: NSNotification.Name("ShareExtensionOpened"), object: nil)
    return true
  }
  
  // LINE SDKのURL処理
  return LineSDKLogin.sharedInstance.application(app, open: url)
}
```

## 使い方

1. Safariで任意のWebページを開く
2. 共有ボタン(⬆️)をタップ
3. アクションシートから`ClipLine`を選択
4. 自動的にClipLineアプリが開き、共有されたURLを受け取る

## データフロー

```
Safari
  ↓ (共有ボタン)
Share Extension
  ↓ (UserDefaults App Group)
ClipLine App
  ↓ (処理)
LINEに送信
```

## トラブルシューティング

### Share Extensionが表示されない
- Bundle Identifierが正しく設定されているか確認
- Info.plistの`NSExtensionActivationRule`が正しいか確認
- App Groupが両方のターゲットで有効になっているか確認

### データが取得できない
- App Group IDが両方で一致しているか確認
- UserDefaultsのsuite nameが正しいか確認

### ビルドエラー
- CocoaPodsを再インストール: `cd ios && pod install`
- Xcodeのクリーンビルド: `Product` → `Clean Build Folder`

## 次のステップ

Share Extension実装後:
1. `src/hooks/useShareExtension.ts`を作成してReact側の処理を実装
2. 共有されたURLをLINEに送信する機能を追加
3. 共有履歴の保存機能を実装
