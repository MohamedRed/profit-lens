package com.profitlens.android.parsing

class LiveOfferParserRegistry(private val parsers: List<LiveOfferParser>) {
  fun find(packageName: String): LiveOfferParser? {
    return parsers.firstOrNull { it.packageName == packageName }
  }
}
