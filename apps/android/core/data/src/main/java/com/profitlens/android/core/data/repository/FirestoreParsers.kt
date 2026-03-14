package com.profitlens.android.core.data.repository

import com.google.firebase.Timestamp
import java.util.Date

internal fun asDate(value: Any?): Date? {
  return when (value) {
    is Timestamp -> value.toDate()
    is Date -> value
    is String -> value.takeIf { it.isNotBlank() }?.let {
      kotlin.runCatching { Date(java.time.Instant.parse(it).toEpochMilli()) }.getOrNull()
    }
    else -> null
  }
}

internal fun asString(value: Any?): String? {
  return (value as? String)?.trim()?.takeIf { it.isNotEmpty() }
}

internal fun asDouble(value: Any?): Double? {
  return when (value) {
    is Number -> value.toDouble()
    is String -> value.toDoubleOrNull()
    else -> null
  }
}

internal fun asInt(value: Any?): Int? {
  return when (value) {
    is Number -> value.toInt()
    is String -> value.toIntOrNull()
    else -> null
  }
}
