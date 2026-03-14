package com.profitlens.android.feature.billing

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.profitlens.android.auth.AuthRepository
import com.profitlens.android.core.data.model.billingPlans
import com.profitlens.android.core.data.repository.BillingRepository
import com.profitlens.android.core.firebase.FirebaseConfig
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class BillingUiState(
  val loading: Boolean = true,
  val message: String? = null,
  val currentPlanId: String = "free",
  val remainingOffers: String = "—",
  val subscriptionsSummary: String = "No managed subscription",
)

@HiltViewModel
class BillingViewModel @Inject constructor(
  authRepository: AuthRepository,
  private val billingRepository: BillingRepository,
) : ViewModel() {
  private val message = MutableStateFlow<String?>(null)
  private val subscriptionsSummary = MutableStateFlow("No managed subscription")
  private val authUser = authRepository.watchUser().stateIn(
    viewModelScope,
    SharingStarted.WhileSubscribed(5_000),
    null,
  )
  private val entitlement = authUser.flatMapLatest { user ->
    user?.let { billingRepository.watchEntitlement(it.uid) } ?: flowOf(null)
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
  private val usage = combine(authUser, entitlement) { user, currentEntitlement ->
    user?.uid to currentEntitlement?.periodKey
  }.flatMapLatest { (uid, periodKey) ->
    if (uid == null || periodKey == null) {
      flowOf(null)
    } else {
      billingRepository.watchUsage(uid, periodKey)
    }
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)

  val uiState: StateFlow<BillingUiState> = combine(
    authUser,
    entitlement,
    usage,
    message,
    subscriptionsSummary,
  ) { user, currentEntitlement, currentUsage, feedback, managedSummary ->
    if (user == null) {
      return@combine BillingUiState(loading = false)
    }
    val remainingOffers = when {
      currentEntitlement?.offerLimit == null -> "Unlimited"
      currentUsage == null -> "—"
      else -> (currentEntitlement.offerLimit - currentUsage.offerCount).coerceAtLeast(0).toString()
    }
    BillingUiState(
      loading = false,
      message = feedback,
      currentPlanId = currentEntitlement?.planId ?: "free",
      remainingOffers = remainingOffers,
      subscriptionsSummary = managedSummary,
    )
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), BillingUiState())

  fun createCheckout(planId: String, onUrlReady: (String) -> Unit) {
    viewModelScope.launch {
      runCatching {
        billingRepository.createAndroidCheckoutSession(planId, billingReturnUrl())
      }.onSuccess(onUrlReady).onFailure {
        message.value = "Billing is unavailable right now. Please try again in a moment."
      }
    }
  }

  fun openPortal(onUrlReady: (String) -> Unit) {
    viewModelScope.launch {
      runCatching {
        val managed = billingRepository.getManagedState()
        subscriptionsSummary.value = if (managed.managedSubscriptions.isEmpty()) {
          "No managed subscription"
        } else {
          "${managed.managedSubscriptions.size} active subscription(s)"
        }
        billingRepository.createAndroidPortalSession(billingReturnUrl())
      }.onSuccess(onUrlReady).onFailure {
        message.value = "Billing is unavailable right now. Please try again in a moment."
      }
    }
  }

  fun availablePlans() = billingPlans

  fun applyReturnStatus(status: String?) {
    message.value = when (status) {
      "success" -> "Subscription updated."
      "cancel" -> "Billing flow canceled."
      "portal" -> "Returned from billing."
      else -> null
    }
  }

  private fun billingReturnUrl(): String {
    return FirebaseConfig.WEB_APP_ORIGIN + FirebaseConfig.ANDROID_BILLING_PATH
  }
}
