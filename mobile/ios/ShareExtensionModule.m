//
//  ShareExtensionModule.m
//  mobile
//
//  Created by yuta on 2025/10/25.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ShareExtensionModule, NSObject)

RCT_EXTERN_METHOD(getSharedData:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(clearSharedData:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

@end
