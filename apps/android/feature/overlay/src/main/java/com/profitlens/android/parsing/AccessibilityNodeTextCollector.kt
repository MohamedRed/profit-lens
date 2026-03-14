package com.profitlens.android.parsing

import android.view.accessibility.AccessibilityNodeInfo

object AccessibilityNodeTextCollector {
  fun collect(root: AccessibilityNodeInfo?, packageName: String): NodeTextSnapshot? {
    if (root == null) {
      return null
    }
    val texts = linkedSetOf<String>()
    walk(root, texts, 0)
    if (texts.isEmpty()) {
      return null
    }
    return NodeTextSnapshot(
      packageName = packageName,
      texts = texts.toList(),
      capturedAtMs = System.currentTimeMillis(),
    )
  }

  private fun walk(node: AccessibilityNodeInfo, sink: MutableSet<String>, depth: Int) {
    if (depth > 8 || sink.size >= 128) {
      return
    }
    node.text?.toString()?.trim()?.takeIf { it.isNotBlank() }?.let(sink::add)
    node.contentDescription?.toString()?.trim()?.takeIf { it.isNotBlank() }?.let(sink::add)
    repeat(node.childCount) { index ->
      walk(node.getChild(index) ?: return@repeat, sink, depth + 1)
    }
  }
}
