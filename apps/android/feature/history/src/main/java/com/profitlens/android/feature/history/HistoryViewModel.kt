package com.profitlens.android.feature.history

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.profitlens.android.auth.AuthRepository
import com.profitlens.android.core.data.model.HistoryUiCache
import com.profitlens.android.core.data.repository.OffersRepository
import com.profitlens.android.core.data.repository.SessionStateRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class HistoryUiState(
  val loading: Boolean = true,
  val selectedMode: String = "list",
  val offers: List<com.profitlens.android.core.data.model.OfferRecord> = emptyList(),
  val stats: List<com.profitlens.android.core.data.model.OfferStatsDay> = emptyList(),
  val selectedOffer: com.profitlens.android.core.data.model.OfferRecord? = null,
)

const val historyRoute = "history"
const val historyDetailRoutePattern = "history/detail/{offerId}"

fun historyDetailRoute(offerId: String): String = "history/detail/$offerId"

@HiltViewModel
class HistoryViewModel @Inject constructor(
  authRepository: AuthRepository,
  offersRepository: OffersRepository,
  private val sessionStateRepository: SessionStateRepository,
  savedStateHandle: SavedStateHandle,
) : ViewModel() {
  private val selectedMode = MutableStateFlow("list")
  private val selectedOfferId = MutableStateFlow(savedStateHandle.get<String>("offerId"))
  private val authUser = authRepository.watchUser().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
  private val offers = authUser.flatMapLatest { user ->
    user?.let { offersRepository.watchOffers(it.uid, 120) } ?: flowOf(emptyList())
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
  private val stats = authUser.flatMapLatest { user ->
    user?.let { offersRepository.watchOfferStats(it.uid) } ?: flowOf(emptyList())
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

  val uiState = combine(selectedMode, offers, stats, selectedOfferId) { mode, offerItems, statItems, offerId ->
    HistoryUiState(
      loading = false,
      selectedMode = mode,
      offers = offerItems,
      stats = statItems,
      selectedOffer = offerItems.firstOrNull { it.id == offerId },
    )
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), HistoryUiState())

  init {
    viewModelScope.launch {
      authUser.collect { user ->
        val uid = user?.uid ?: return@collect
        val cached = sessionStateRepository.read<HistoryUiCache>("history-ui:$uid")
        if (cached != null) {
          selectedMode.value = cached.selectedMode
        }
      }
    }
  }

  fun setMode(mode: String) {
    selectedMode.value = mode
    val uid = authUser.value?.uid ?: return
    viewModelScope.launch {
      sessionStateRepository.save(
        key = "history-ui:$uid",
        userId = uid,
        payload = HistoryUiCache(selectedMode = mode, scrollOffset = 0),
      )
    }
  }
}
