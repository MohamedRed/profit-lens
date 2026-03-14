package com.profitlens.android.feature.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.profitlens.android.auth.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

@HiltViewModel
class AuthViewModel @Inject constructor(
  private val authRepository: AuthRepository,
) : ViewModel() {
  private val _loginState = MutableStateFlow(AuthScreenState())
  private val _registerState = MutableStateFlow(AuthScreenState())

  val loginState: StateFlow<AuthScreenState> = _loginState.asStateFlow()
  val registerState: StateFlow<AuthScreenState> = _registerState.asStateFlow()

  fun updateLoginEmail(value: String) = _loginState.update { it.copy(email = value) }
  fun updateLoginPassword(value: String) = _loginState.update { it.copy(password = value) }
  fun updateRegisterEmail(value: String) = _registerState.update { it.copy(email = value) }
  fun updateRegisterPassword(value: String) = _registerState.update { it.copy(password = value) }

  fun signIn() {
    submit(_loginState, loginState.value) { email, password ->
      authRepository.signIn(email, password)
    }
  }

  fun register() {
    submit(_registerState, registerState.value) { email, password ->
      authRepository.register(email, password)
    }
  }

  private fun submit(
    sink: MutableStateFlow<AuthScreenState>,
    current: AuthScreenState,
    block: suspend (String, String) -> Unit,
  ) {
    if (current.email.isBlank() || current.password.isBlank()) {
      sink.update { it.copy(message = "Enter your email and password.") }
      return
    }
    sink.update { it.copy(submitting = true, message = null) }
    viewModelScope.launch {
      runCatching { block(current.email.trim(), current.password) }
        .onSuccess {
          sink.update { it.copy(submitting = false, message = null) }
        }
        .onFailure {
          sink.update {
            it.copy(
              submitting = false,
              message = it.message ?: "We could not complete this action.",
            )
          }
        }
    }
  }
}
