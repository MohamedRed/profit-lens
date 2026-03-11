package com.profitlens.android.app

import android.content.Context
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.profitlens.android.BuildConfig

class FirebaseBootstrap(private val context: Context) {
  fun ensureInitialized(): Boolean {
    if (FirebaseApp.getApps(context).isNotEmpty()) {
      return true
    }
    if (!isConfigured()) {
      return false
    }
    FirebaseApp.initializeApp(
      context,
      FirebaseOptions.Builder()
        .setApiKey(BuildConfig.FIREBASE_API_KEY)
        .setApplicationId(BuildConfig.FIREBASE_APP_ID)
        .setProjectId(BuildConfig.FIREBASE_PROJECT_ID)
        .setStorageBucket(BuildConfig.FIREBASE_STORAGE_BUCKET)
        .setGcmSenderId(BuildConfig.FIREBASE_MESSAGING_SENDER_ID)
        .build(),
    )
    return true
  }

  fun isConfigured(): Boolean {
    return listOf(
      BuildConfig.FIREBASE_API_KEY,
      BuildConfig.FIREBASE_APP_ID,
      BuildConfig.FIREBASE_PROJECT_ID,
      BuildConfig.FIREBASE_STORAGE_BUCKET,
      BuildConfig.FIREBASE_MESSAGING_SENDER_ID,
    ).all { it.isNotBlank() }
  }
}
