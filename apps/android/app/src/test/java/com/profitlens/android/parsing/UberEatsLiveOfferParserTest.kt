package com.profitlens.android.parsing

import com.profitlens.android.providers.UberEatsLiveOfferParser
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class UberEatsLiveOfferParserTest {
  @Test
  fun parsesBasicOfferCard() {
    val parser = UberEatsLiveOfferParser("com.ubercab.eats")
    val snapshot = NodeTextSnapshot(
      packageName = "com.ubercab.eats",
      texts = listOf(
        "Uber Eats",
        "€9.50",
        "3.2 km",
        "18 min",
        "Alpha Burger",
        "89 Rue Beta, Paris",
        "Accept",
      ),
      capturedAtMs = 1L,
    )

    assertTrue(parser.looksLikeOfferScreen(snapshot))
    val draft = parser.parse(snapshot)
    assertNotNull(draft)
    assertEquals(9.5, draft?.payoutEuro ?: 0.0, 0.001)
    assertEquals(3.2, draft?.distanceKm ?: 0.0, 0.001)
  }
}
