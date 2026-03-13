package com.profitlens.android.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun SignInScreen(
  firebaseReady: Boolean,
  loading: Boolean,
  message: String?,
  onSignIn: (String, String) -> Unit,
) {
  var email by remember { mutableStateOf("") }
  var password by remember { mutableStateOf("") }
  Column(
    modifier = Modifier
      .fillMaxSize()
      .padding(24.dp),
    verticalArrangement = Arrangement.spacedBy(16.dp),
  ) {
    Text(text = "Profit Lens Android", style = MaterialTheme.typography.headlineMedium)
    Text(text = "Sign in to open the workspace and enable the live courier overlay.")
    if (!firebaseReady) {
      Text(text = "This build is missing Firebase setup.", color = MaterialTheme.colorScheme.error)
    }
    OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Email") }, modifier = Modifier.fillMaxWidth())
    OutlinedTextField(value = password, onValueChange = { password = it }, label = { Text("Password") }, modifier = Modifier.fillMaxWidth())
    Button(
      onClick = { onSignIn(email.trim(), password) },
      enabled = firebaseReady && !loading && email.isNotBlank() && password.isNotBlank(),
    ) {
      Text(if (loading) "Signing in..." else "Sign in")
    }
    if (!message.isNullOrBlank()) {
      Text(text = message)
    }
  }
}
