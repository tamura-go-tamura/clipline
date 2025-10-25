//
//  ShareViewController.swift
//  ShareExtension
//
//  Created by yuta on 2025/10/25.
//

import UIKit
import Social
import MobileCoreServices
import UniformTypeIdentifiers

class ShareViewController: UIViewController {
  
    let appGroupId = "group.com.tamuy.clipline"
    let sharedDataKey = "ShareExtensionData"
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // 背景色設定
        view.backgroundColor = .systemBackground
        
        // ナビゲーションバー設定
        setupNavigationBar()
        
        // UIセットアップ
        setupUI()
        
        // 共有データを取得して表示
        loadSharedContent()
    }
    
    private func setupUI() {
        // プレビュー用のラベル
        let containerView = UIView()
        containerView.translatesAutoresizingMaskIntoConstraints = false
        containerView.backgroundColor = .systemGray6
        containerView.layer.cornerRadius = 12
        view.addSubview(containerView)
        
        let iconLabel = UILabel()
        iconLabel.translatesAutoresizingMaskIntoConstraints = false
        iconLabel.text = "📎"
        iconLabel.font = .systemFont(ofSize: 40)
        iconLabel.textAlignment = .center
        containerView.addSubview(iconLabel)
        
        let titleLabel = UILabel()
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        titleLabel.text = "共有内容"
        titleLabel.font = .systemFont(ofSize: 17, weight: .semibold)
        titleLabel.textAlignment = .center
        containerView.addSubview(titleLabel)
        
        let contentLabel = UILabel()
        contentLabel.tag = 100 // 後で参照するためのタグ
        contentLabel.translatesAutoresizingMaskIntoConstraints = false
        contentLabel.text = "読み込み中..."
        contentLabel.font = .systemFont(ofSize: 15)
        contentLabel.textColor = .secondaryLabel
        contentLabel.numberOfLines = 3
        contentLabel.textAlignment = .center
        containerView.addSubview(contentLabel)
        
        // 送信ボタン
        let sendButton = UIButton(type: .system)
        sendButton.translatesAutoresizingMaskIntoConstraints = false
        sendButton.setTitle("ClipLineに送信", for: .normal)
        sendButton.titleLabel?.font = .systemFont(ofSize: 17, weight: .semibold)
        sendButton.backgroundColor = UIColor(red: 0.024, green: 0.78, blue: 0.33, alpha: 1.0) // LINE Green
        sendButton.setTitleColor(.white, for: .normal)
        sendButton.layer.cornerRadius = 12
        sendButton.addTarget(self, action: #selector(sendButtonTapped), for: .touchUpInside)
        view.addSubview(sendButton)
        
        // レイアウト設定
        NSLayoutConstraint.activate([
            containerView.centerYAnchor.constraint(equalTo: view.centerYAnchor, constant: -60),
            containerView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            containerView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            
            iconLabel.topAnchor.constraint(equalTo: containerView.topAnchor, constant: 20),
            iconLabel.centerXAnchor.constraint(equalTo: containerView.centerXAnchor),
            
            titleLabel.topAnchor.constraint(equalTo: iconLabel.bottomAnchor, constant: 12),
            titleLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 16),
            titleLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -16),
            
            contentLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 8),
            contentLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 16),
            contentLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -16),
            contentLabel.bottomAnchor.constraint(equalTo: containerView.bottomAnchor, constant: -20),
            
            sendButton.topAnchor.constraint(equalTo: containerView.bottomAnchor, constant: 24),
            sendButton.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            sendButton.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            sendButton.heightAnchor.constraint(equalToConstant: 50),
        ])
    }
    
    private func setupNavigationBar() {
        title = "ClipLine"
        
        let cancelButton = UIBarButtonItem(
            barButtonSystemItem: .cancel,
            target: self,
            action: #selector(cancelTapped)
        )
        navigationItem.leftBarButtonItem = cancelButton
    }
    
    @objc private func cancelTapped() {
        extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
    }
    
    @objc private func sendButtonTapped() {
        print("📤 Send button tapped")
        handleSharedContent()
    }
    
    private func loadSharedContent() {
        print("📥 Loading shared content for preview")
        
        guard let inputItems = extensionContext?.inputItems as? [NSExtensionItem] else {
            print("⚠️ No input items")
            updatePreview(text: "共有できる内容が見つかりませんでした")
            return
        }
        
        for item in inputItems {
            guard let attachments = item.attachments else { continue }
            previewAttachments(attachments)
            return
        }
        
        print("⚠️ No attachments found")
        updatePreview(text: "共有できる内容が見つかりませんでした")
    }
    
    private func updatePreview(text: String) {
        if let label = view.viewWithTag(100) as? UILabel {
            label.text = text
        }
    }
    
    private func previewAttachments(_ attachments: [NSItemProvider]) {
        for attachment in attachments {
            // URLの処理
            if attachment.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                attachment.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { [weak self] (item, error) in
                    if let url = item as? URL {
                        DispatchQueue.main.async {
                            self?.updatePreview(text: url.absoluteString)
                        }
                    }
                }
                return
            }
            
            // テキストの処理
            if attachment.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
                attachment.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: nil) { [weak self] (item, error) in
                    if let text = item as? String {
                        DispatchQueue.main.async {
                            self?.updatePreview(text: text)
                        }
                    }
                }
                return
            }
        }
    }
    
    private func handleSharedContent() {
        print("📤 Handling shared content")
        
        guard let inputItems = extensionContext?.inputItems as? [NSExtensionItem] else {
            print("⚠️ No input items")
            completeRequest()
            return
        }
        
        for item in inputItems {
            guard let attachments = item.attachments else { continue }
            handleAttachments(attachments)
            return
        }
        
        print("⚠️ No attachments found")
        completeRequest()
    }
  
    private func handleAttachments(_ attachments: [NSItemProvider]) {
          print("📎 Handling \(attachments.count) attachments")
          
          // NSExtensionItemからメタデータを抽出
          let inputItem = extensionContext?.inputItems.first as? NSExtensionItem
          var metadata: [String: String] = [:]
          
          if let title = inputItem?.attributedContentText?.string {
              metadata["title"] = title
          }
          
          for attachment in attachments {
              // URLの処理
              if attachment.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                  print("🔗 Found URL attachment")
                  attachment.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { [weak self] (item, error) in
                      if let error = error {
                          print("❌ Error loading URL: \(error)")
                      }
                      if let url = item as? URL {
                          print("✅ Loaded URL: \(url.absoluteString)")
                          self?.saveSharedData(type: "url", value: url.absoluteString, metadata: metadata)
                      }
                      self?.completeRequest()
                  }
                  return
              }
              
              // テキストの処理
              if attachment.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
                  print("📝 Found text attachment")
                  attachment.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: nil) { [weak self] (item, error) in
                      if let error = error {
                          print("❌ Error loading text: \(error)")
                      }
                      if let text = item as? String {
                          print("✅ Loaded text: \(text)")
                          self?.saveSharedData(type: "text", value: text, metadata: metadata)
                      }
                      self?.completeRequest()
                  }
                  return
              }
          }
          
          // 何も処理できなかった場合
          print("⚠️ No compatible attachments found")
          completeRequest()
      }
      
      private func saveSharedData(type: String, value: String, metadata: [String: String] = [:]) {
          let sharedDefaults = UserDefaults(suiteName: appGroupId)
          
          var data: [String: Any] = [
              "type": type,
              "value": value,
              "timestamp": ISO8601DateFormatter().string(from: Date())
          ]
          
          // メタデータがあれば追加
          if !metadata.isEmpty {
              // メタデータをJSON文字列に変換
              if let metadataJson = try? JSONSerialization.data(withJSONObject: metadata),
                 let metadataString = String(data: metadataJson, encoding: .utf8) {
                  data["metadata"] = metadataString
              }
          }
          
          if let jsonData = try? JSONSerialization.data(withJSONObject: data),
             let jsonString = String(data: jsonData, encoding: .utf8) {
              sharedDefaults?.set(jsonString, forKey: sharedDataKey)
              sharedDefaults?.synchronize()
              print("✅ Saved shared data: \(type) - \(value)")
              if !metadata.isEmpty {
                  print("   Metadata: \(metadata)")
              }
          }
      }
      
      private func completeRequest() {
          print("🏁 Completing request")
          
          // Share Extensionを閉じる前に少し待機してアニメーションを表示
          DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
              // 成功メッセージを表示してから閉じる
              self?.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
          }
      }
      
      private func showSuccessMessage() {
          // 送信ボタンを成功状態に変更
          if let button = view.subviews.compactMap({ $0 as? UIButton }).first {
              button.setTitle("✓ 送信しました", for: .normal)
              button.isEnabled = false
              button.backgroundColor = UIColor.systemGreen
          }
          
          // プレビューテキストを更新
          updatePreview(text: "ClipLineアプリを開いて確認してください")
      }

}
