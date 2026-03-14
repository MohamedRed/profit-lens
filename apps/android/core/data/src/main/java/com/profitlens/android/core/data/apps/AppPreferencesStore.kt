package com.profitlens.android.core.data.apps

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.appPreferences by preferencesDataStore(name = "profit_lens_app_preferences")

@Singleton
class AppPreferencesStore @Inject constructor(
  @ApplicationContext private val context: Context,
) {
  val selectedMainTab: Flow<String> = context.appPreferences.data.map { prefs ->
    prefs[SELECTED_MAIN_TAB] ?: "offer"
  }

  suspend fun saveSelectedMainTab(route: String) {
    context.appPreferences.edit { prefs ->
      prefs[SELECTED_MAIN_TAB] = route
    }
  }

  private companion object {
    val SELECTED_MAIN_TAB = stringPreferencesKey("selected_main_tab")
  }
}
