package com.profitlens.android.ui

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.unit.dp

@Composable
fun WorkspaceWebView(
  workspace: WorkspaceLaunchState,
  onRetry: () -> Unit,
  onWorkspaceSignedOut: () -> Unit,
) {
  val context = LocalContext.current
  var webView by remember { mutableStateOf<WebView?>(null) }
  var pageProgress by remember { mutableIntStateOf(if (workspace.loading) 0 else 100) }
  var canGoBack by remember { mutableStateOf(false) }
  val originHost = remember { Uri.parse(com.profitlens.android.BuildConfig.WEB_APP_URL).host }

  LaunchedEffect(workspace.loading) {
    if (workspace.loading) {
      pageProgress = 0
    }
  }

  DisposableEffect(workspace.sessionKey) {
    onDispose {
      webView?.stopLoading()
    }
  }

  BackHandler(enabled = canGoBack) {
    webView?.goBack()
  }

  when {
    workspace.loading -> {
      WorkspaceLoadingState("Preparing secure workspace...")
    }
    workspace.startUrl == null -> {
      WorkspaceMessageState(
        title = "Workspace unavailable",
        message = workspace.message ?: "We could not open the workspace right now.",
        actionLabel = "Try again",
        onAction = onRetry,
      )
    }
    else -> {
      Box(modifier = Modifier.fillMaxSize()) {
        AndroidView(
          modifier = Modifier.fillMaxSize(),
          factory = { viewContext ->
            createWorkspaceWebView(
              context = viewContext,
              originHost = originHost,
              onPageProgress = { pageProgress = it },
              onCanGoBackChanged = { canGoBack = it },
              onWorkspaceSignedOut = onWorkspaceSignedOut,
            ).also {
              webView = it
              it.tag = workspace.sessionKey
              it.loadUrl(workspace.startUrl)
            }
          },
          update = { currentWebView ->
            webView = currentWebView
            if (currentWebView.tag != workspace.sessionKey) {
              currentWebView.tag = workspace.sessionKey
              currentWebView.loadUrl(workspace.startUrl)
            }
          },
        )
        if (pageProgress in 0..99) {
          Box(
            modifier = Modifier
              .fillMaxSize()
              .padding(24.dp),
            contentAlignment = Alignment.TopCenter,
          ) {
            CircularProgressIndicator()
          }
        }
      }
    }
  }
}

@SuppressLint("SetJavaScriptEnabled")
private fun createWorkspaceWebView(
  context: android.content.Context,
  originHost: String?,
  onPageProgress: (Int) -> Unit,
  onCanGoBackChanged: (Boolean) -> Unit,
  onWorkspaceSignedOut: () -> Unit,
): WebView {
  return WebView(context).apply {
    settings.javaScriptEnabled = true
    settings.domStorageEnabled = true
    settings.loadsImagesAutomatically = true
    settings.setSupportZoom(false)
    settings.mediaPlaybackRequiresUserGesture = true
    settings.userAgentString = "${settings.userAgentString} ProfitLensAndroidWebView/0.1"
    addJavascriptInterface(WorkspaceWebBridge(onWorkspaceSignedOut), "ProfitLensAndroidBridge")
    webChromeClient = object : WebChromeClient() {
      override fun onProgressChanged(view: WebView?, newProgress: Int) {
        onPageProgress(newProgress)
      }
    }
    webViewClient = object : WebViewClient() {
      override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
        val target = request?.url ?: return false
        val targetHost = target.host
        val shouldHandleInternally = targetHost != null && targetHost == originHost
        if (shouldHandleInternally) {
          return false
        }
        context.startActivity(Intent(Intent.ACTION_VIEW, target))
        return true
      }

      override fun onPageFinished(view: WebView?, url: String?) {
        super.onPageFinished(view, url)
        onPageProgress(100)
        onCanGoBackChanged(view?.canGoBack() == true)
      }
    }
  }
}

private class WorkspaceWebBridge(
  private val onWorkspaceSignedOut: () -> Unit,
) {
  private val mainHandler = Handler(Looper.getMainLooper())

  @JavascriptInterface
  fun onAuthStateChanged(state: String) {
    if (state == "signed_out") {
      mainHandler.post(onWorkspaceSignedOut)
    }
  }
}

@Composable
private fun WorkspaceLoadingState(message: String) {
  Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(16.dp)) {
      CircularProgressIndicator()
      Text(text = message, style = MaterialTheme.typography.bodyLarge)
    }
  }
}

@Composable
private fun WorkspaceMessageState(
  title: String,
  message: String,
  actionLabel: String,
  onAction: () -> Unit,
) {
  Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
    Card(modifier = Modifier.padding(24.dp)) {
      Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text(text = title, style = MaterialTheme.typography.titleLarge)
        Text(text = message)
        Button(onClick = onAction) {
          Text(actionLabel)
        }
      }
    }
  }
}
