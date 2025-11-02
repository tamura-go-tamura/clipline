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

class ShareViewController: UIViewController, UITextViewDelegate {
  
    let appGroupId = "group.com.tamuy.clipline"
    let sharedDataKey = "ShareExtensionData"
    
    // プレビュー用のUI要素
    private var thumbnailImageView: UIImageView!
    private var titleLabel: UILabel!
    private var descriptionLabel: UILabel!
    private var urlLabel: UILabel!
    private var loadingIndicator: UIActivityIndicatorView!
    private var commentTextField: UITextView!  // コメント入力フィールド
    
    // 共有データを一時保存
    private var sharedURL: URL?
    private var sharedText: String?
    private var pageTitle: String?
    private var pageDescription: String?
    private var thumbnailURL: String?
    private var userComment: String?  // ユーザーコメント
    
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
        // メインコンテナ
        let containerView = UIView()
        containerView.translatesAutoresizingMaskIntoConstraints = false
        containerView.backgroundColor = .systemBackground
        containerView.layer.cornerRadius = 16
        containerView.layer.shadowColor = UIColor.black.cgColor
        containerView.layer.shadowOffset = CGSize(width: 0, height: 2)
        containerView.layer.shadowOpacity = 0.1
        containerView.layer.shadowRadius = 8
        view.addSubview(containerView)
        
        // サムネイル画像
        thumbnailImageView = UIImageView()
        thumbnailImageView.translatesAutoresizingMaskIntoConstraints = false
        thumbnailImageView.contentMode = .scaleAspectFill
        thumbnailImageView.clipsToBounds = true
        thumbnailImageView.layer.cornerRadius = 12
        thumbnailImageView.backgroundColor = .systemGray5
        thumbnailImageView.isHidden = true
        containerView.addSubview(thumbnailImageView)
        
        // ローディングインジケーター
        loadingIndicator = UIActivityIndicatorView(style: .medium)
        loadingIndicator.translatesAutoresizingMaskIntoConstraints = false
        loadingIndicator.hidesWhenStopped = true
        containerView.addSubview(loadingIndicator)
        
        // タイトルラベル
        titleLabel = UILabel()
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        titleLabel.font = .systemFont(ofSize: 18, weight: .bold)
        titleLabel.textColor = .label
        titleLabel.numberOfLines = 2
        titleLabel.text = "読み込み中..."
        containerView.addSubview(titleLabel)
        
        // 説明文ラベル
        descriptionLabel = UILabel()
        descriptionLabel.translatesAutoresizingMaskIntoConstraints = false
        descriptionLabel.font = .systemFont(ofSize: 14)
        descriptionLabel.textColor = .secondaryLabel
        descriptionLabel.numberOfLines = 3
        descriptionLabel.isHidden = true
        containerView.addSubview(descriptionLabel)
        
        // URLラベル
        urlLabel = UILabel()
        urlLabel.translatesAutoresizingMaskIntoConstraints = false
        urlLabel.font = .systemFont(ofSize: 12)
        urlLabel.textColor = .tertiaryLabel
        urlLabel.numberOfLines = 1
        urlLabel.lineBreakMode = .byTruncatingMiddle
        urlLabel.isHidden = true
        containerView.addSubview(urlLabel)
        
        // コメント入力フィールド
        commentTextField = UITextView()
        commentTextField.translatesAutoresizingMaskIntoConstraints = false
        commentTextField.font = .systemFont(ofSize: 15)
        commentTextField.textColor = .label
        commentTextField.backgroundColor = .systemGray6
        commentTextField.layer.cornerRadius = 8
        commentTextField.textContainerInset = UIEdgeInsets(top: 12, left: 12, bottom: 12, right: 12)
        commentTextField.isScrollEnabled = false
        commentTextField.delegate = self
        commentTextField.text = "メモを追加..."
        commentTextField.textColor = .placeholderText
        view.addSubview(commentTextField)
        
        // 送信ボタン
        let sendButton = UIButton(type: .system)
        sendButton.translatesAutoresizingMaskIntoConstraints = false
        sendButton.setTitle("保存", for: .normal)
        sendButton.titleLabel?.font = .systemFont(ofSize: 17, weight: .semibold)
        sendButton.backgroundColor = UIColor(red: 0.024, green: 0.78, blue: 0.33, alpha: 1.0)
        sendButton.setTitleColor(.white, for: .normal)
        sendButton.layer.cornerRadius = 12
        sendButton.addTarget(self, action: #selector(sendButtonTapped), for: .touchUpInside)
        view.addSubview(sendButton)
        
        // レイアウト設定
        NSLayoutConstraint.activate([
            containerView.centerYAnchor.constraint(equalTo: view.centerYAnchor, constant: -40),
            containerView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            containerView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            
            thumbnailImageView.topAnchor.constraint(equalTo: containerView.topAnchor, constant: 16),
            thumbnailImageView.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 16),
            thumbnailImageView.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -16),
            thumbnailImageView.heightAnchor.constraint(equalToConstant: 180),
            
            loadingIndicator.centerXAnchor.constraint(equalTo: thumbnailImageView.centerXAnchor),
            loadingIndicator.centerYAnchor.constraint(equalTo: thumbnailImageView.centerYAnchor),
            
            titleLabel.topAnchor.constraint(equalTo: thumbnailImageView.bottomAnchor, constant: 16),
            titleLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 16),
            titleLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -16),
            
            descriptionLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 8),
            descriptionLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 16),
            descriptionLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -16),
            
            urlLabel.topAnchor.constraint(equalTo: descriptionLabel.bottomAnchor, constant: 12),
            urlLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 16),
            urlLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -16),
            urlLabel.bottomAnchor.constraint(equalTo: containerView.bottomAnchor, constant: -16),
            
            commentTextField.topAnchor.constraint(equalTo: containerView.bottomAnchor, constant: 16),
            commentTextField.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            commentTextField.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            commentTextField.heightAnchor.constraint(greaterThanOrEqualToConstant: 60),
            
            sendButton.topAnchor.constraint(equalTo: commentTextField.bottomAnchor, constant: 16),
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
        loadingIndicator.startAnimating()
        
        guard let inputItems = extensionContext?.inputItems as? [NSExtensionItem] else {
            print("⚠️ No input items")
            updatePreview(title: "エラー", description: "共有できる内容が見つかりませんでした")
            return
        }
        
        for item in inputItems {
            guard let attachments = item.attachments else { continue }
            previewAttachments(attachments)
            return
        }
        
        print("⚠️ No attachments found")
        updatePreview(title: "エラー", description: "共有できる内容が見つかりませんでした")
    }
    
    private func updatePreview(title: String, description: String? = nil, url: String? = nil, thumbnailURL: String? = nil) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            self.titleLabel.text = title
            
            if let description = description {
                self.descriptionLabel.text = description
                self.descriptionLabel.isHidden = false
            } else {
                self.descriptionLabel.isHidden = true
            }
            
            if let url = url {
                self.urlLabel.text = "🔗 \(url)"
                self.urlLabel.isHidden = false
            } else {
                self.urlLabel.isHidden = true
            }
            
            // サムネイル画像の読み込み
            if let thumbnailURLString = thumbnailURL,
               let imageURL = URL(string: thumbnailURLString) {
                self.loadThumbnailImage(from: imageURL)
            } else {
                self.loadingIndicator.stopAnimating()
                self.thumbnailImageView.isHidden = true
            }
        }
    }
    
    private func loadThumbnailImage(from url: URL) {
        URLSession.shared.dataTask(with: url) { [weak self] data, response, error in
            guard let self = self,
                  let data = data,
                  error == nil,
                  let image = UIImage(data: data) else {
                DispatchQueue.main.async {
                    self?.loadingIndicator.stopAnimating()
                    self?.thumbnailImageView.isHidden = true
                }
                return
            }
            
            DispatchQueue.main.async {
                self.loadingIndicator.stopAnimating()
                self.thumbnailImageView.image = image
                self.thumbnailImageView.isHidden = false
            }
        }.resume()
    }
    
    private func previewAttachments(_ attachments: [NSItemProvider]) {
        for attachment in attachments {
            // URLの処理
            if attachment.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                attachment.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { [weak self] (item, error) in
                    if let url = item as? URL {
                        self?.sharedURL = url
                        self?.fetchMetadata(for: url)
                    }
                }
                return
            }
            
            // テキストの処理
            if attachment.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
                attachment.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: nil) { [weak self] (item, error) in
                    if let text = item as? String {
                        self?.sharedText = text
                        DispatchQueue.main.async {
                            self?.updatePreview(
                                title: "テキスト",
                                description: text
                            )
                        }
                    }
                }
                return
            }
        }
    }
    
    private func fetchMetadata(for url: URL) {
        print("🔍 Fetching metadata for: \(url.absoluteString)")
        
        // URLSessionでHTMLを取得してOpen Graphメタデータを解析
        URLSession.shared.dataTask(with: url) { [weak self] data, response, error in
            guard let self = self,
                  let data = data,
                  let html = String(data: data, encoding: .utf8) else {
                // メタデータ取得失敗時はURLのみ表示
                DispatchQueue.main.async {
                    self?.updatePreview(
                        title: url.host ?? "Webページ",
                        description: nil,
                        url: url.absoluteString
                    )
                }
                return
            }
            
            // メタデータを抽出
            let title = self.extractMetaTag(from: html, property: "og:title") ??
                       self.extractTitle(from: html) ??
                       url.host ?? "Webページ"
            
            let description = self.extractMetaTag(from: html, property: "og:description") ??
                            self.extractMetaTag(from: html, name: "description")
            
            let imageURL = self.extractMetaTag(from: html, property: "og:image")
            
            // 保存用にメタデータを保持
            self.pageTitle = title
            self.pageDescription = description
            self.thumbnailURL = imageURL
            
            // プレビュー更新
            self.updatePreview(
                title: title,
                description: description,
                url: url.absoluteString,
                thumbnailURL: imageURL
            )
            
            print("✅ Metadata extracted - Title: \(title)")
            if let desc = description {
                print("   Description: \(desc)")
            }
            if let img = imageURL {
                print("   Image: \(img)")
            }
        }.resume()
    }
    
    // Open Graphタグを抽出
    private func extractMetaTag(from html: String, property: String) -> String? {
        let pattern = "<meta[^>]*property=[\"']\(property)[\"'][^>]*content=[\"']([^\"']*)[\"'][^>]*>"
        return extractPattern(pattern, from: html)
    }
    
    // name属性のメタタグを抽出
    private func extractMetaTag(from html: String, name: String) -> String? {
        let pattern = "<meta[^>]*name=[\"']\(name)[\"'][^>]*content=[\"']([^\"']*)[\"'][^>]*>"
        return extractPattern(pattern, from: html)
    }
    
    // titleタグを抽出
    private func extractTitle(from html: String) -> String? {
        let pattern = "<title>([^<]*)</title>"
        return extractPattern(pattern, from: html)
    }
    
    // 正規表現でパターンマッチング
    private func extractPattern(_ pattern: String, from text: String) -> String? {
        guard let regex = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive) else {
            return nil
        }
        
        let nsString = text as NSString
        let results = regex.matches(in: text, range: NSRange(location: 0, length: nsString.length))
        
        if let match = results.first, match.numberOfRanges > 1 {
            let range = match.range(at: 1)
            return nsString.substring(with: range)
                .trimmingCharacters(in: .whitespacesAndNewlines)
        }
        
        return nil
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
          
          // メタデータをマージ（fetchMetadata で取得したデータを優先）
          var mergedMetadata = metadata
          if let pageTitle = self.pageTitle {
              mergedMetadata["title"] = pageTitle
          }
          if let pageDescription = self.pageDescription {
              mergedMetadata["description"] = pageDescription
          }
          if let thumbnailURL = self.thumbnailURL {
              mergedMetadata["thumbnailUrl"] = thumbnailURL
          }
          
          var data: [String: Any] = [
              "type": type,
              "value": value,
              "timestamp": ISO8601DateFormatter().string(from: Date())
          ]
          
          // ユーザーコメントがあれば追加
          if let comment = self.userComment, !comment.isEmpty {
              data["userComment"] = comment
          }
          
          // メタデータがあれば追加
          if !mergedMetadata.isEmpty {
              // メタデータをJSON文字列に変換
              if let metadataJson = try? JSONSerialization.data(withJSONObject: mergedMetadata),
                 let metadataString = String(data: metadataJson, encoding: .utf8) {
                  data["metadata"] = metadataString
              }
          }
          
          if let jsonData = try? JSONSerialization.data(withJSONObject: data),
             let jsonString = String(data: jsonData, encoding: .utf8) {
              sharedDefaults?.set(jsonString, forKey: sharedDataKey)
              sharedDefaults?.synchronize()
              print("✅ Saved shared data: \(type) - \(value)")
              if let comment = self.userComment {
                  print("   User Comment: \(comment)")
              }
              if !mergedMetadata.isEmpty {
                  print("   Metadata: \(mergedMetadata)")
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
          DispatchQueue.main.async { [weak self] in
              self?.titleLabel.text = "✓ ClipLineに送信しました"
              self?.descriptionLabel.text = "アプリを開いて確認してください"
              self?.descriptionLabel.isHidden = false
          }
      }
      
      // MARK: - UITextViewDelegate
      
      func textViewDidBeginEditing(_ textView: UITextView) {
          if textView.textColor == .placeholderText {
              textView.text = ""
              textView.textColor = .label
          }
      }
      
      func textViewDidEndEditing(_ textView: UITextView) {
          if textView.text.isEmpty {
              textView.text = "メモを追加..."
              textView.textColor = .placeholderText
          } else {
              userComment = textView.text
          }
      }
      
      func textViewDidChange(_ textView: UITextView) {
          if textView.textColor != .placeholderText {
              userComment = textView.text
          }
      }

}
