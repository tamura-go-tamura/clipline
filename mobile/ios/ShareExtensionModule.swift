//
//  ShareExtensionModule.swift
//  mobile
//
//  Created by yuta on 2025/10/25.
//

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
