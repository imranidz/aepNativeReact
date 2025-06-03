package com.AEPSampleAppNewArchEnabled

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.adobe.marketing.mobile.MobileCore

class AppIdModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "AppIdModule"

    @ReactMethod
    fun configureWithAppId(appId: String, promise: Promise) {
        try {
            MobileCore.configureWithAppID(appId)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
} 