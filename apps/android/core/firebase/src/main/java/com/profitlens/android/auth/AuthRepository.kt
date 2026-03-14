package com.profitlens.android.auth

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.ktx.Firebase
import com.profitlens.android.core.data.model.AuthUser
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

@Singleton
class AuthRepository @Inject constructor(
  private val firebaseReady: Boolean,
) {
  private val auth: FirebaseAuth? = if (firebaseReady) Firebase.auth else null

  fun watchUser(): Flow<AuthUser?> = callbackFlow {
    val currentAuth = auth
    if (currentAuth == null) {
      trySend(null)
      awaitClose { }
      return@callbackFlow
    }
    val listener = FirebaseAuth.AuthStateListener { firebaseAuth ->
      val user = firebaseAuth.currentUser
      trySend(user?.let { AuthUser(uid = it.uid, email = it.email) })
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

  suspend fun register(email: String, password: String) {
    val currentAuth = auth ?: error("Firebase is not configured.")
    currentAuth.createUserWithEmailAndPassword(email, password).await()
  }

  suspend fun signOut() {
    auth?.signOut()
  }
}
