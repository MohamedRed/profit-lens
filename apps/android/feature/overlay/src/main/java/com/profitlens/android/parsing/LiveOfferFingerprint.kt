package com.profitlens.android.parsing

fun buildLiveOfferFingerprint(draft: LiveOfferDraft): String {
  return listOf(
    draft.provider,
    draft.payoutEuro.toString(),
    draft.distanceKm?.toString().orEmpty(),
    draft.pickupAddress.orEmpty(),
    draft.dropoffAddress.orEmpty(),
  ).joinToString("|")
}
