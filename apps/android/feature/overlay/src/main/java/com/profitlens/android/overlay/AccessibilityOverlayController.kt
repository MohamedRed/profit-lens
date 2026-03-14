package com.profitlens.android.overlay

import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.view.Gravity
import android.view.WindowManager
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.unit.dp
import com.profitlens.android.ui.MainActivity

class AccessibilityOverlayController(
  private val context: Context,
) {
  private val windowManager = context.getSystemService(WindowManager::class.java)
  private var overlayView: ComposeView? = null

  fun render(state: LiveOverlayState) {
    val view = overlayView ?: createView().also { created ->
      windowManager.addView(created, createLayoutParams())
      overlayView = created
    }
    view.setContent {
      OverlayChip(
        state = state,
        onClick = {
          val intent = Intent(context, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
          }
          context.startActivity(intent)
        },
      )
    }
  }

  fun hide() {
    overlayView?.let(windowManager::removeViewImmediate)
    overlayView = null
  }

  private fun createView(): ComposeView {
    return ComposeView(context)
  }

  private fun createLayoutParams(): WindowManager.LayoutParams {
    return WindowManager.LayoutParams(
      WindowManager.LayoutParams.MATCH_PARENT,
      WindowManager.LayoutParams.WRAP_CONTENT,
      WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
      WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
      PixelFormat.TRANSLUCENT,
    ).apply {
      gravity = Gravity.TOP
      y = 48
    }
  }
}

@Composable
private fun OverlayChip(
  state: LiveOverlayState,
  onClick: () -> Unit,
) {
  MaterialTheme {
    Column(
      modifier = Modifier
        .padding(horizontal = 16.dp, vertical = 12.dp)
        .fillMaxWidth()
        .background(colorFor(state.status), RoundedCornerShape(18.dp))
        .clickable(onClick = onClick)
        .padding(horizontal = 16.dp, vertical = 14.dp),
    ) {
      Text(text = state.title, color = Color.White, style = MaterialTheme.typography.titleMedium)
      Text(text = state.detail, color = Color.White.copy(alpha = 0.9f), style = MaterialTheme.typography.bodyMedium)
    }
  }
}

private fun colorFor(status: OverlayChipStatus): Color {
  return when (status) {
    OverlayChipStatus.PROCESSING -> Color(0xFF0F172A)
    OverlayChipStatus.PROFITABLE -> Color(0xFF166534)
    OverlayChipStatus.NOT_PROFITABLE -> Color(0xFF991B1B)
    OverlayChipStatus.UNKNOWN -> Color(0xFF92400E)
  }
}
