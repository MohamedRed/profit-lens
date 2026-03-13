package com.profitlens.android.ui

import android.webkit.CookieManager
import android.webkit.WebStorage
import android.webkit.WebView
import android.content.Context

fun clearWorkspaceWebSession(context: Context) {
  CookieManager.getInstance().removeAllCookies(null)
  CookieManager.getInstance().flush()
  WebStorage.getInstance().deleteAllData()
  WebView(context).apply {
    clearCache(true)
    clearHistory()
    destroy()
  }
}
