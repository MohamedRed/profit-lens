package com.profitlens.android.overlay

data class LiveOverlayState(
  val status: OverlayChipStatus,
  val title: String,
  val detail: String,
)

enum class OverlayChipStatus {
  PROCESSING,
  PROFITABLE,
  NOT_PROFITABLE,
  UNKNOWN,
}
