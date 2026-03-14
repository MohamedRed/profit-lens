package com.profitlens.android.parsing

object ParserTextUtils {
  private val currencyRegex = Regex("""(?:€\s*|EUR\s*)(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*€""", RegexOption.IGNORE_CASE)
  private val distanceRegex = Regex("""(\d+(?:[.,]\d+)?)\s*km""", RegexOption.IGNORE_CASE)
  private val durationRegex = Regex("""(\d+(?:[.,]\d+)?)\s*(?:min|mins|minutes)""", RegexOption.IGNORE_CASE)

  fun parsePayoutEuro(texts: List<String>): Double? {
    return texts
      .mapNotNull { text ->
        currencyRegex.find(text)?.groupValues
          ?.drop(1)
          ?.firstOrNull { it.isNotBlank() }
          ?.replace(",", ".")
          ?.toDoubleOrNull()
      }
      .maxOrNull()
  }

  fun parseDistanceKm(texts: List<String>): Double? {
    return texts
      .mapNotNull { text ->
        distanceRegex.find(text)?.groupValues?.getOrNull(1)?.replace(",", ".")?.toDoubleOrNull()
      }
      .maxOrNull()
  }

  fun parseDurationMinutes(texts: List<String>): Double? {
    return texts
      .mapNotNull { text ->
        durationRegex.find(text)?.groupValues?.getOrNull(1)?.replace(",", ".")?.toDoubleOrNull()
      }
      .maxOrNull()
  }

  fun pickAddressCandidates(texts: List<String>): Pair<String?, String?> {
    val candidates = texts
      .map(String::trim)
      .filter { candidate ->
        candidate.length in 6..80 &&
          !candidate.contains("€") &&
          !candidate.contains("km", ignoreCase = true) &&
          !candidate.contains("min", ignoreCase = true)
      }
      .distinct()
    return candidates.getOrNull(0) to candidates.getOrNull(1)
  }
}
