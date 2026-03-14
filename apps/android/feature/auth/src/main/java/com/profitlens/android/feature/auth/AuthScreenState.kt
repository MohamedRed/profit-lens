package com.profitlens.android.feature.auth

data class AuthScreenState(
  val email: String = "",
  val password: String = "",
  val submitting: Boolean = false,
  val message: String? = null,
)
