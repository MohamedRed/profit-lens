package com.profitlens.android.providers

import com.profitlens.android.parsing.LiveOfferDraft
import com.profitlens.android.parsing.LiveOfferParser
import com.profitlens.android.parsing.NodeTextSnapshot
import com.profitlens.android.parsing.ParserTextUtils

class DeliverooLiveOfferParser(
  override val packageName: String,
) : LiveOfferParser {
  override val provider: String = "deliveroo"

  override fun looksLikeOfferScreen(snapshot: NodeTextSnapshot): Boolean {
    val combined = snapshot.texts.joinToString(" ").lowercase()
    return combined.contains("deliveroo") ||
      combined.contains("order") ||
      (combined.contains("accept") && combined.contains("€"))
  }

  override fun parse(snapshot: NodeTextSnapshot): LiveOfferDraft? {
    val payoutEuro = ParserTextUtils.parsePayoutEuro(snapshot.texts) ?: return null
    val (pickup, dropoff) = ParserTextUtils.pickAddressCandidates(snapshot.texts)
    return LiveOfferDraft(
      provider = provider,
      packageName = packageName,
      payoutEuro = payoutEuro,
      distanceKm = ParserTextUtils.parseDistanceKm(snapshot.texts),
      durationMinutes = ParserTextUtils.parseDurationMinutes(snapshot.texts),
      pickupName = pickup,
      pickupAddress = pickup,
      dropoffName = dropoff,
      dropoffAddress = dropoff,
      confidence = 0.58,
      parserVersion = "deliveroo_v1",
      screenVariant = "offer_card",
    )
  }
}
