package com.profitlens.android.core.data.local

import android.content.ContentResolver
import android.content.Context
import androidx.room.Room
import com.profitlens.android.data.ProfitLensDatabase
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DataModule {
  @Provides
  @Singleton
  fun provideDatabase(@ApplicationContext context: Context): ProfitLensDatabase {
    return Room.databaseBuilder(context, ProfitLensDatabase::class.java, "profit_lens_android.db")
      .fallbackToDestructiveMigration()
      .build()
  }

  @Provides
  fun provideLiveOfferSessionDao(database: ProfitLensDatabase) = database.liveOfferSessionDao()

  @Provides
  fun provideUiStateCacheDao(database: ProfitLensDatabase) = database.uiStateCacheDao()

  @Provides
  @Singleton
  fun provideContentResolver(@ApplicationContext context: Context): ContentResolver = context.contentResolver
}
