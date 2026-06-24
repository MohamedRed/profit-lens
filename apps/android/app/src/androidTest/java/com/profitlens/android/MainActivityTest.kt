package com.profitlens.android

import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onAllNodesWithText
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.profitlens.android.ui.MainActivity
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class MainActivityTest {
  @get:Rule
  val composeRule = createAndroidComposeRule<MainActivity>()

  @Test
  fun launchesRootComposeSurface() {
    val showsAuth = composeRule.onAllNodesWithText("Welcome back").fetchSemanticsNodes().isNotEmpty()
    val showsFirebaseSetup = composeRule.onAllNodesWithText("Android setup is incomplete").fetchSemanticsNodes().isNotEmpty()

    assertTrue(showsAuth || showsFirebaseSetup)
  }
}
