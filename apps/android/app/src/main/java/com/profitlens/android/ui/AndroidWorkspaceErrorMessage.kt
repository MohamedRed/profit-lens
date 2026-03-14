package com.profitlens.android.ui

import com.google.firebase.FirebaseNetworkException
import com.google.firebase.auth.FirebaseAuthException
import com.google.firebase.functions.FirebaseFunctionsException

fun toUserFacingWorkspaceMessage(error: Throwable): String {
  return when (error) {
    is FirebaseFunctionsException -> mapFunctionsMessage(error)
    is FirebaseAuthException -> "Please sign in again to open your workspace."
    is FirebaseNetworkException -> "Check your connection and try again."
    else -> "We could not open your workspace right now. Please try again."
  }
}

private fun mapFunctionsMessage(error: FirebaseFunctionsException): String {
  return when (error.code) {
    FirebaseFunctionsException.Code.RESOURCE_EXHAUSTED ->
      "This account is already active on another device. Sign out there, then try again."
    FirebaseFunctionsException.Code.UNAUTHENTICATED ->
      "Please sign in again to open your workspace."
    FirebaseFunctionsException.Code.FAILED_PRECONDITION ->
      "Finish setting up this device, then try again."
    FirebaseFunctionsException.Code.UNAVAILABLE ->
      "The service is temporarily unavailable. Please try again."
    else -> "We could not open your workspace right now. Please try again."
  }
}
