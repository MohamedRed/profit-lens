package com.profitlens.android.ui

import android.net.Uri
import com.profitlens.android.BuildConfig

private const val workspacePath = "/next/app/offer"
private const val customTokenHashKey = "pl_firebase_token"

fun buildWorkspaceStartUrl(customToken: String): String {
  val baseUrl = BuildConfig.WEB_APP_URL.trimEnd('/')
  val encodedToken = Uri.encode(customToken)
  return "$baseUrl$workspacePath#$customTokenHashKey=$encodedToken"
}
