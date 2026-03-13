package com.profitlens.android.ui

data class WorkspaceLaunchState(
  val startUrl: String?,
  val loading: Boolean,
  val message: String?,
  val sessionKey: String?,
  val ownerUid: String?,
) {
  companion object {
    fun idle(): WorkspaceLaunchState = WorkspaceLaunchState(
      startUrl = null,
      loading = false,
      message = null,
      sessionKey = null,
      ownerUid = null,
    )
  }
}
