package com.profitlens.android.ui

import android.content.Context
import android.content.Intent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun PermissionCard(
  title: String,
  granted: Boolean,
  context: Context,
  intent: Intent,
) {
  Card {
    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
      Text(text = title, style = MaterialTheme.typography.titleMedium)
      Text(text = if (granted) "Granted" else "Required")
      if (!granted) {
        Button(onClick = { context.startActivity(intent) }) {
          Text("Open settings")
        }
      }
    }
  }
}
