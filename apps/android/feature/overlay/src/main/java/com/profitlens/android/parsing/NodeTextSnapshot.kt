package com.profitlens.android.parsing

data class NodeTextSnapshot(
  val packageName: String,
  val texts: List<String>,
  val capturedAtMs: Long,
)
