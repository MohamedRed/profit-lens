package com.profitlens.android.app

import android.app.Application

class ProfitLensApplication : Application() {
  lateinit var container: AppContainer
    private set

  override fun onCreate() {
    super.onCreate()
    container = AppContainer(this)
  }
}
