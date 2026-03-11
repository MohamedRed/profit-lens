package com.profitlens.android.parsing

import com.profitlens.android.providers.DeliverooLiveOfferParser
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class DeliverooLiveOfferParserTest {
  @Test
  fun parsesBasicOfferCard() {
    val parser = DeliverooLiveOfferParser("com.deliveroo.orderapp")
    val snapshot = NodeTextSnapshot(
      packageName = "com.deliveroo.orderapp",
      texts = listOf(
        "Deliveroo",
        "Accept order",
        "€7.20",
        "2.6 km",
        "16 min",
        "Cafe Delta",
        "1 Rue Gamma, Paris",
      ),
      capturedAtMs = 1L,
    )

    assertTrue(parser.looksLikeOfferScreen(snapshot))
    val draft = parser.parse(snapshot)
    assertNotNull(draft)
    assertEquals(7.2, draft?.payoutEuro ?: 0.0, 0.001)
    assertEquals(2.6, draft?.distanceKm ?: 0.0, 0.001)
  }
}
