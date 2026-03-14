package com.profitlens.android.core.firebase

import android.content.Context
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.functions.FirebaseFunctions
import com.google.firebase.functions.ktx.functions
import com.google.firebase.ktx.Firebase
import com.google.firebase.remoteconfig.FirebaseRemoteConfig
import com.google.firebase.remoteconfig.ktx.remoteConfig
import com.google.firebase.storage.FirebaseStorage
import com.google.firebase.storage.ktx.storage
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object FirebaseModule {
  @Provides
  @Singleton
  fun provideFirebaseReady(@ApplicationContext context: Context): Boolean {
    return FirebaseBootstrap(context).ensureInitialized()
  }

  @Provides
  @Singleton
  fun provideFirebaseAuth(firebaseReady: Boolean): FirebaseAuth? {
    return if (firebaseReady) Firebase.auth else null
  }

  @Provides
  @Singleton
  fun provideFirestore(firebaseReady: Boolean): FirebaseFirestore? {
    return if (firebaseReady) Firebase.firestore else null
  }

  @Provides
  @Singleton
  fun provideFunctions(firebaseReady: Boolean): FirebaseFunctions? {
    return if (firebaseReady) Firebase.functions(FirebaseConfig.FUNCTIONS_REGION) else null
  }

  @Provides
  @Singleton
  fun provideStorage(firebaseReady: Boolean): FirebaseStorage? {
    return if (firebaseReady) Firebase.storage else null
  }

  @Provides
  @Singleton
  fun provideRemoteConfig(firebaseReady: Boolean): FirebaseRemoteConfig? {
    return if (firebaseReady) Firebase.remoteConfig else null
  }
}
