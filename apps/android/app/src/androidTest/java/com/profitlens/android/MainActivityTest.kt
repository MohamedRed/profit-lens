package com.profitlens.android

import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.assertExists
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.profitlens.android.ui.MainActivity
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class MainActivityTest {
  @get:Rule
  val composeRule = createAndroidComposeRule<MainActivity>()

  @Test
  fun showsSignInTitle() {
    composeRule.onNodeWithText("Profit Lens Android").assertExists()
  }
}
