package com.profitlens.android.auth

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.ktx.Firebase
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

data class ProfitLensAuthUser(
  val uid: String,
  val email: String?,
)

class AuthRepository(private val firebaseReady: Boolean) {
  private val auth: FirebaseAuth? = if (firebaseReady) Firebase.auth else null

  fun watchUser(): Flow<ProfitLensAuthUser?> = callbackFlow {
    val currentAuth = auth
    if (currentAuth == null) {
      trySend(null)
      awaitClose { }
      return@callbackFlow
    }
    val listener = FirebaseAuth.AuthStateListener { firebaseAuth ->
      val user = firebaseAuth.currentUser
      trySend(user?.let { ProfitLensAuthUser(uid = it.uid, email = it.email) })
    }
    currentAuth.addAuthStateListener(listener)
    awaitClose {
      currentAuth.removeAuthStateListener(listener)
    }
  }

  suspend fun signIn(email: String, password: String) {
    val currentAuth = auth ?: error("Firebase is not configured.")
    currentAuth.signInWithEmailAndPassword(email, password).await()
  }

  suspend fun signOut() {
    auth?.signOut()
  }
}
