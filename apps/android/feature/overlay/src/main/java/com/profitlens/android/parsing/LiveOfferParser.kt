package com.profitlens.android.parsing

interface LiveOfferParser {
  val provider: String
  val packageName: String

  fun looksLikeOfferScreen(snapshot: NodeTextSnapshot): Boolean

  fun parse(snapshot: NodeTextSnapshot): LiveOfferDraft?
}
