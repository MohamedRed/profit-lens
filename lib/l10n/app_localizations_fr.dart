// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for French (`fr`).
class AppLocalizationsFr extends AppLocalizations {
  AppLocalizationsFr([String locale = 'fr']) : super(locale);

  @override
  String get appTitle => 'Liive Profit';

  @override
  String get offerDetailsSection => 'Détails de l\'offre';

  @override
  String get manualEntrySubtitle => 'Ou saisissez les détails manuellement.';

  @override
  String get manualEntryButton => 'Saisir manuellement';

  @override
  String get editOfferDetailsButton => 'Modifier les détails';

  @override
  String get resetOfferButton => 'Réinitialiser l’offre';

  @override
  String get analysisProgressTitle => 'Analyse de l\'offre';

  @override
  String get analysisStepExtracting => 'Extraction des détails de l\'offre';

  @override
  String get analysisStepVerifyRoute => 'Vérification de l\'itinéraire';

  @override
  String get analysisStepProfitability => 'Calcul de la rentabilité';

  @override
  String get analysisFailedTitle => 'Analyse incomplète';

  @override
  String get analysisFailedBody =>
      'Nous n\'avons pas pu terminer l\'analyse. Modifiez les détails et réessayez.';

  @override
  String get analysisFailedScreenshotBody =>
      'Impossible de lire cette capture. Importez une capture d’offre valide.';

  @override
  String get analysisFailedQuotaBody =>
      'L’analyse par capture est temporairement indisponible. Saisissez les détails manuellement puis réessayez plus tard.';

  @override
  String get addOptionalDetailsButton => 'Ajouter des détails optionnels';

  @override
  String get hideOptionalDetailsButton => 'Masquer les détails optionnels';

  @override
  String get offerAmountLabel => 'Gain (EUR)';

  @override
  String get distanceKmLabel => 'Distance (km)';

  @override
  String get vehicleSection => 'Véhicule';

  @override
  String get vehicleDetailsSectionTitle => 'Détails du véhicule';

  @override
  String get vehicleEnergySectionTitle => 'Énergie & consommation';

  @override
  String get vehicleCostsSectionTitle => 'Entretien & dépréciation';

  @override
  String get vehicleTypeLabel => 'Type de véhicule';

  @override
  String get energyTypeLabel => 'Type d\'énergie';

  @override
  String get fuelTypeLabel => 'Type de carburant';

  @override
  String get vehicleTypeBike => 'Vélo';

  @override
  String get vehicleTypeEBike => 'Vélo électrique';

  @override
  String get vehicleTypeScooter => 'Scooter';

  @override
  String get vehicleTypeCar => 'Voiture';

  @override
  String get energyTypeNone => 'Aucune';

  @override
  String get energyTypeElectric => 'Électrique';

  @override
  String get energyTypeFuel => 'Carburant';

  @override
  String get fuelTypeE10 => 'E10';

  @override
  String get fuelTypeSP95 => 'SP95';

  @override
  String get fuelTypeSP98 => 'SP98';

  @override
  String get fuelTypeGazole => 'Diesel';

  @override
  String get fuelTypeE85 => 'E85';

  @override
  String get fuelTypeGPLc => 'GPL';

  @override
  String get energyPriceLabel => 'Prix de l\'énergie par unité';

  @override
  String get consumptionLabel => 'Consommation pour 100 km';

  @override
  String get maintenanceLabel => 'Entretien par km';

  @override
  String get depreciationLabel => 'Dépréciation par km';

  @override
  String get costsSection => 'Taxes et cotisations';

  @override
  String get socialRateLabel => 'Taux de cotisations auto‑entrepreneur';

  @override
  String get liberatoryTaxLabel => 'Prélèvement libératoire';

  @override
  String get liberatoryTaxHint =>
      'Appliquer un taux forfaitaire d’impôt sur le chiffre d’affaires.';

  @override
  String get useFranceDefaultsLabel => 'Utiliser les valeurs France';

  @override
  String get sourcesSection => 'Sources des valeurs';

  @override
  String get sourceLastCheckedLabel => 'Dernière vérification';

  @override
  String get sourceOpenButton => 'Ouvrir la source';

  @override
  String get sourceOpenError => 'Impossible d\'ouvrir le lien.';

  @override
  String get importScreenshotButton => 'Importer une capture';

  @override
  String get importSourceTitle => 'Choisir une source';

  @override
  String get importSourceGallery => 'Photothèque';

  @override
  String get importSourceCamera => 'Prendre une photo';

  @override
  String get importedScreenshotTitle => 'Capture importée';

  @override
  String get analyzeButton => 'Analyser la rentabilité';

  @override
  String get profitabilityOverviewTitle => 'Aperçu de la rentabilité';

  @override
  String get offerDecisionAccept => 'Accepter';

  @override
  String get offerDecisionDecline => 'Refuser';

  @override
  String offerDecisionAbove(Object amount) {
    return '$amount au-dessus de votre objectif';
  }

  @override
  String offerDecisionBelow(Object amount) {
    return '$amount en dessous de votre objectif';
  }

  @override
  String get profitabilityTargetTitle => 'Objectif de rentabilité';

  @override
  String get minProfitabilityLabel => 'Profit minimum par km';

  @override
  String get minProfitabilityHint => 'Valeur suggérée : 2,00 €/km';

  @override
  String get viewProfitabilityDetailsButton => 'Voir les détails';

  @override
  String get resultTitle => 'Rentabilité';

  @override
  String get grossRevenueLabel => 'Revenu brut';

  @override
  String get totalCostsLabel => 'Coûts totaux';

  @override
  String get netProfitLabel => 'Profit net';

  @override
  String get energyCostLabel => 'Coût d\'énergie';

  @override
  String get maintenanceCostLabel => 'Entretien';

  @override
  String get depreciationCostLabel => 'Dépréciation';

  @override
  String get socialContributionLabel => 'Cotisations sociales';

  @override
  String get missingConfigTitle => 'Configuration requise';

  @override
  String get missingGeminiConfigMessage =>
      'Pour activer l\'extraction depuis une capture, configurez Firebase et déployez la fonction Cloud extractOfferFromImage avec le secret GEMINI_API_KEY.';

  @override
  String get missingDataTitle => 'Informations manquantes';

  @override
  String get missingDataDescription =>
      'Pour calculer la rentabilité, complétez :';

  @override
  String get okButton => 'OK';

  @override
  String get stripeReturnTitle => 'Retour depuis Stripe';

  @override
  String get stripeReturnBody =>
      'Mise à jour de votre abonnement. Cela peut prendre quelques secondes.';

  @override
  String get signInTitle => 'Connexion';

  @override
  String get signInSubtitle =>
      'Analysez vos offres de livraison plus vite et gardez chaque euro.';

  @override
  String get registerTitle => 'Créer un compte';

  @override
  String get emailLabel => 'Email';

  @override
  String get passwordLabel => 'Mot de passe';

  @override
  String get confirmPasswordLabel => 'Confirmer le mot de passe';

  @override
  String get signInButton => 'Se connecter';

  @override
  String get createAccountButton => 'Créer un compte';

  @override
  String get registerButton => 'S’inscrire';

  @override
  String get loadingLabel => 'Chargement…';

  @override
  String get nextButtonLabel => 'Suivant';

  @override
  String get backButtonLabel => 'Retour';

  @override
  String get requiredFieldError => 'Champ obligatoire.';

  @override
  String get passwordLengthError =>
      'Le mot de passe doit contenir au moins 8 caractères.';

  @override
  String get passwordMismatchError => 'Les mots de passe ne correspondent pas.';

  @override
  String get signInFailedMessage =>
      'Impossible de se connecter. Vérifiez votre email et mot de passe puis réessayez.';

  @override
  String get registerFailedMessage =>
      'Impossible de créer votre compte pour le moment. Réessayez.';

  @override
  String get offerActionFailedMessage =>
      'Impossible d’effectuer cette action pour le moment. Réessayez.';

  @override
  String get offerLocationPermissionRequired =>
      'L’autorisation de localisation est requise pour analyser une offre.';

  @override
  String get offerLocationUnavailable =>
      'Impossible de lire votre position actuelle. Vérifiez le GPS puis réessayez.';

  @override
  String get offerLocationTimeout =>
      'La localisation prend trop de temps. Réessayez dans une zone dégagée.';

  @override
  String get offerLocationUnsupported =>
      'Cet appareil ne prend pas en charge la localisation pour l’analyse des offres.';

  @override
  String get billingActionFailedMessage =>
      'Impossible de mettre à jour l’abonnement pour le moment. Réessayez.';

  @override
  String get deviceActionFailedMessage =>
      'Impossible de mettre à jour l’appareil pour le moment. Réessayez.';

  @override
  String get vehicleActionFailedMessage =>
      'Impossible de mettre à jour le véhicule pour le moment. Réessayez.';

  @override
  String get languageSaveFailedMessage =>
      'Impossible de mettre à jour la langue pour le moment. Réessayez.';

  @override
  String get genericActionFailedMessage =>
      'Une erreur est survenue. Réessayez.';

  @override
  String get errorSessionExpired => 'Votre session a expiré. Reconnectez-vous.';

  @override
  String get errorPlanUnavailable =>
      'Aucun forfait payant n’est disponible pour le moment. Réessayez plus tard.';

  @override
  String get errorInvalidEmail => 'Saisissez une adresse email valide.';

  @override
  String get errorInvalidCredentials => 'Email ou mot de passe incorrect.';

  @override
  String get errorEmailAlreadyInUse =>
      'Cet email est déjà utilisé par un autre compte.';

  @override
  String get errorWeakPassword =>
      'Mot de passe trop faible. Utilisez au moins 8 caractères.';

  @override
  String get errorTooManyRequests =>
      'Trop de tentatives. Patientez un instant puis réessayez.';

  @override
  String get errorNetworkUnavailable =>
      'Problème de réseau. Vérifiez la connexion puis réessayez.';

  @override
  String get errorPermissionDenied =>
      'Vous n’avez pas l’autorisation pour cette action sur ce compte.';

  @override
  String get deviceNotRegisteredMessage =>
      'Cet appareil n’est pas encore enregistré sur votre compte. Rechargez puis réessayez.';

  @override
  String get offerTabLabel => 'Offre';

  @override
  String get historyTabLabel => 'Historique';

  @override
  String get settingsTabLabel => 'Paramètres';

  @override
  String get noVehiclesMessage =>
      'Ajoutez un véhicule pour commencer l’analyse.';

  @override
  String get analysisDateLabel => 'Date d’analyse';

  @override
  String get historyViewListLabel => 'Liste';

  @override
  String get historyViewChartsLabel => 'Graphiques';

  @override
  String get historyChartTitle => 'Évolution du profit';

  @override
  String get historyChartProfitLabel => 'Profit';

  @override
  String get profitThresholdLabel => 'Seuil de rentabilité';

  @override
  String get historyChartEmptyMessage =>
      'Ajoutez au moins 2 offres pour voir le graphique.';

  @override
  String get historyChartHintMessage =>
      'Utilisez ce graphique pour comparer les profits au-dessus/au-dessous du seuil de rentabilité.';

  @override
  String get latestProfitLabel => 'Dernier profit';

  @override
  String historySummaryTodayMore(Object amount) {
    return 'Les offres d’aujourd’hui sont plus rentables que les précédentes de $amount.';
  }

  @override
  String historySummaryTodayLess(Object amount) {
    return 'Les offres d’aujourd’hui sont moins rentables que les précédentes de $amount.';
  }

  @override
  String get updateAvailableTitle => 'Une mise à jour est disponible.';

  @override
  String get updateAvailableCta => 'Recharger';

  @override
  String get historySummaryTodayEqual =>
      'Les offres d’aujourd’hui sont à peu près aussi rentables que les précédentes.';

  @override
  String get historySummaryNoToday => 'Aucune offre aujourd’hui.';

  @override
  String get historySummaryNotEnoughHistory =>
      'Historique insuffisant pour comparer aujourd’hui.';

  @override
  String historySummaryAverageProfit(Object amount) {
    return 'Profit moyen : $amount';
  }

  @override
  String get extractionFailedMessage =>
      'Impossible d’extraire les détails de l’offre.';

  @override
  String get captureScreenshotButton => 'Prendre une capture';

  @override
  String get mapsAutocompleteUnavailableMessage =>
      'L’autocomplétion d’adresse est indisponible. Vérifiez la clé Google Maps API et la configuration de Places UI Kit.';

  @override
  String get useSelectedPlaceButton => 'Utiliser le lieu sélectionné';

  @override
  String get analyzeOfferButton => 'Analyser l’offre';

  @override
  String get vehicleSelectLabel => 'Choisir un véhicule';

  @override
  String get durationMinutesLabel => 'Temps estimé (minutes)';

  @override
  String get pickupNameLabel => 'Nom du retrait';

  @override
  String get pickupAddressLabel => 'Adresse de retrait';

  @override
  String get pickupAddressPlaceholder => 'Saisir l’adresse de retrait';

  @override
  String get dropoffNameLabel => 'Nom du destinataire';

  @override
  String get dropoffAddressLabel => 'Adresse de livraison';

  @override
  String get dropoffAddressPlaceholder => 'Saisir l’adresse de livraison';

  @override
  String get pickupAddressMissingHint =>
      'Cette capture ne fournit que le nom du restaurant et l’adresse du client. L’adresse de retrait peut rester vide.';

  @override
  String get verifiedDistanceLabel => 'Distance vérifiée';

  @override
  String get verifiedDurationLabel => 'Temps vérifié';

  @override
  String get distanceUnitKm => 'km';

  @override
  String get durationUnitMinutes => 'min';

  @override
  String get routeVerificationMissingMessage =>
      'Sélectionnez le retrait et la livraison via l’autocomplétion pour vérifier l’itinéraire.';

  @override
  String get routeVerificationFailedMessage =>
      'Impossible de vérifier la distance. Réessayez.';

  @override
  String get offerSaveFailedMessage => 'Impossible d’enregistrer l’offre.';

  @override
  String get historyDetailTitle => 'Détails de l’offre';

  @override
  String get incomeTaxLabel => 'Impôt sur le revenu';

  @override
  String get monthlyCostsSectionTitle => 'Coûts mensuels';

  @override
  String get fixedCostsLabel => 'Répartition des coûts fixes';

  @override
  String get profileSectionTitle => 'Profil entreprise';

  @override
  String get languageSectionTitle => 'Langue';

  @override
  String get installAppTitle => 'Installer l\'application';

  @override
  String get installAppSubtitle => 'Ajouter Liive Profit à l\'écran d\'accueil';

  @override
  String get installAppCta => 'Installer';

  @override
  String get installAppRequiredTitle => 'Installation requise';

  @override
  String get installAppRequiredBody =>
      'Pour continuer, installez Liive Profit puis ouvrez-le depuis votre écran d’accueil. Le guide d’installation s’ouvre automatiquement.';

  @override
  String get installAppRequiredNativeBody =>
      'Pour continuer, installez Liive Profit puis ouvrez-le depuis votre écran d’accueil. Appuyez sur Installer pour ouvrir l’invite du navigateur.';

  @override
  String get installAppLoadFailed =>
      'Impossible de charger la fenêtre d’installation.';

  @override
  String get installAppPromptUnavailable =>
      'L’invite d’installation n’est pas encore prête. Patientez un instant puis réessayez.';

  @override
  String get installAppPromptFailed => 'Échec de l’installation.';

  @override
  String get installAppPromptWaiting =>
      'Préparation de l’invite d’installation. Laissez cette page ouverte un instant.';

  @override
  String get languageFrench => 'Français';

  @override
  String get languageEnglish => 'Anglais';

  @override
  String get languageArabic => 'Arabe';

  @override
  String get vehiclesSectionTitle => 'Véhicules';

  @override
  String get signOutButton => 'Se déconnecter';

  @override
  String get profileSetupTitle => 'Complétez votre profil';

  @override
  String get activityLabel => 'Activité';

  @override
  String get activityDelivery => 'Livraison';

  @override
  String get activityServices => 'Services';

  @override
  String get activitySales => 'Ventes';

  @override
  String get incomeTaxRateLabel => 'Taux d’impôt sur le revenu';

  @override
  String get incomeTaxEstimatedHint => 'Valeur estimée par défaut, modifiable.';

  @override
  String get monthlyFixedCostsLabel => 'Coûts fixes mensuels';

  @override
  String get fixedCostAllocationLabel => 'Répartir les coûts fixes par';

  @override
  String get monthlyHoursLabel => 'Heures mensuelles travaillées';

  @override
  String get monthlyDistanceLabel => 'Distance mensuelle (km)';

  @override
  String get monthlyDeliveriesLabel => 'Livraisons mensuelles';

  @override
  String get fixedCostPerHourLabel => 'Par heure';

  @override
  String get fixedCostPerKmLabel => 'Par km';

  @override
  String get fixedCostPerDeliveryLabel => 'Par livraison';

  @override
  String get monthlyHoursRequiredError =>
      'Les heures mensuelles sont requises pour ce mode.';

  @override
  String get monthlyDistanceRequiredError =>
      'La distance mensuelle est requise pour ce mode.';

  @override
  String get monthlyDeliveriesRequiredError =>
      'Les livraisons mensuelles sont requises pour ce mode.';

  @override
  String get saveProfileButton => 'Enregistrer le profil';

  @override
  String get profileSaveFailedMessage => 'Impossible d’enregistrer le profil.';

  @override
  String get profileEditTitle => 'Modifier le profil';

  @override
  String get editProfileButton => 'Modifier le profil';

  @override
  String get addVehicleTitle => 'Ajouter un véhicule';

  @override
  String get editVehicleTitle => 'Modifier le véhicule';

  @override
  String get editVehicleButton => 'Modifier le véhicule';

  @override
  String get saveVehicleButton => 'Enregistrer le véhicule';

  @override
  String get deleteVehicleAction => 'Supprimer le véhicule';

  @override
  String get deleteVehicleTitle => 'Supprimer le véhicule ?';

  @override
  String get deleteVehicleMessage =>
      'Cela supprimera le véhicule et ses paramètres enregistrés. Vous pourrez l’ajouter de nouveau plus tard.';

  @override
  String get deleteVehicleCancel => 'Annuler';

  @override
  String get deleteVehicleConfirm => 'Supprimer';

  @override
  String get vehicleSaveFailedMessage =>
      'Impossible d’enregistrer le véhicule.';

  @override
  String get vehicleDeleteFailedMessage =>
      'Impossible de supprimer le véhicule.';

  @override
  String get vehicleBrandLabel => 'Marque';

  @override
  String get vehicleModelLabel => 'Modèle';

  @override
  String get vehicleLicensePlateLabel => 'Plaque d\'immatriculation';

  @override
  String get vehicleLicensePlateHint => 'AA-123-AA';

  @override
  String get vehicleLicensePlateInvalid =>
      'Entrez une plaque française valide.';

  @override
  String get vehicleLicensePlateDuplicate =>
      'Une voiture avec cette plaque existe déjà.';

  @override
  String get vehicleRegistrationYearLabel => 'Année d\'immatriculation';

  @override
  String get vehicleRegistrationYearHint => 'AAAA';

  @override
  String get vehicleRegistrationYearInvalid => 'Entrez une année valide.';

  @override
  String get useVehiclePresetsLabel => 'Utiliser les valeurs véhicule';

  @override
  String get plateLookupButtonLabel => 'Rechercher';

  @override
  String get plateLookupAppliedMessage => 'Données du véhicule appliquées.';

  @override
  String get plateLookupNotFoundMessage =>
      'Aucun véhicule trouvé pour cette plaque.';

  @override
  String get plateLookupFailedMessage =>
      'Impossible de récupérer les données de la plaque.';

  @override
  String get modelLookupAppliedMessage => 'Consommation appliquée.';

  @override
  String get modelLookupNotFoundMessage =>
      'Aucun modèle trouvé pour cette marque/modèle.';

  @override
  String get modelLookupFailedMessage =>
      'Impossible de récupérer les données du modèle.';

  @override
  String get noHistoryMessage => 'Aucune offre enregistrée.';

  @override
  String get profitabilityFailedMessage =>
      'Impossible de calculer la rentabilité. Vérifiez votre profil.';

  @override
  String get offersRemainingTitle => 'Offres restantes';

  @override
  String offersRemainingValue(Object remaining) {
    return '$remaining offres restantes ce mois-ci';
  }

  @override
  String get offersRemainingUnlimited => 'Offres illimitées';

  @override
  String get subscriptionStatusLabel => 'Statut de l\'abonnement';

  @override
  String get subscriptionStatusFree => 'Gratuit';

  @override
  String get subscriptionStatusActive => 'Actif';

  @override
  String get subscriptionStatusPastDue => 'Paiement en retard';

  @override
  String get subscriptionStatusCanceled => 'Résilié';

  @override
  String get subscriptionStatusTrialing => 'Essai';

  @override
  String get subscriptionStatusIncomplete => 'Incomplet';

  @override
  String get subscriptionStatusUnpaid => 'Impayé';

  @override
  String get subscriptionStatusUnknown => 'Inconnu';

  @override
  String subscriptionStatusCanceling(Object date) {
    return 'Se termine le $date';
  }

  @override
  String get upgradePlanButton => 'Passer à un forfait supérieur';

  @override
  String get managePlanButton => 'Gérer l’abonnement';

  @override
  String get billingBackToSettings => 'Retour aux réglages';

  @override
  String get billingManageTitle => 'Gérer l’abonnement';

  @override
  String get billingManageSubtitle =>
      'Changez de forfait, planifiez ou annulez une résiliation.';

  @override
  String get billingPlanSelectionLabel => 'Forfait';

  @override
  String get billingApplyPlanButton => 'Appliquer le changement';

  @override
  String get billingPlanMissingError => 'Sélectionnez d’abord un forfait.';

  @override
  String get billingPlanChangeSuccess => 'Forfait mis à jour.';

  @override
  String get billingCancellationTitle => 'Résiliation';

  @override
  String get billingCancellationSubtitle =>
      'Choisissez de renouveler automatiquement ou d’arrêter à la fin de la période en cours.';

  @override
  String get billingCancelAtPeriodEndButton => 'Résilier en fin de période';

  @override
  String get billingResumeSubscriptionButton => 'Reprendre l’abonnement';

  @override
  String get billingCancelSuccess =>
      'L’abonnement sera résilié en fin de période.';

  @override
  String get billingResumeSuccess =>
      'Renouvellement réactivé. L’abonnement reste actif.';

  @override
  String billingPeriodEndsOn(Object date) {
    return 'La période se termine le $date';
  }

  @override
  String get billingSuggestionsTitle => 'Forfaits suggérés';

  @override
  String get billingSuggestionsEmpty =>
      'Aucune autre suggestion pour le moment.';

  @override
  String get billingStripePortalTitle => 'Facturation Stripe';

  @override
  String get billingStripePortalSubtitle =>
      'Ouvrez Stripe pour gérer les factures, moyens de paiement et détails de facturation.';

  @override
  String get billingStripePortalButton => 'Ouvrir la facturation Stripe';

  @override
  String get offerLimitReachedMessage =>
      'Vous avez atteint votre limite mensuelle. Passez à un forfait supérieur pour continuer.';

  @override
  String get subscriptionPlansTitle => 'Choisir un forfait';

  @override
  String get subscriptionPlansSubtitle =>
      'Sélectionnez le plafond mensuel adapté à vos livraisons.';

  @override
  String planPricePerMonth(Object price) {
    return '$price / mois';
  }

  @override
  String planOffersPerMonth(Object count) {
    return '$count offres par mois';
  }

  @override
  String get planUnlimitedLabel => 'Offres illimitées';

  @override
  String get planChooseButton => 'Choisir ce forfait';

  @override
  String get subscriptionFreeTitle => 'Forfait gratuit';

  @override
  String get subscriptionFreeSubtitle => '10 offres par mois';

  @override
  String get subscriptionActiveTitle => 'Abonnement actif';

  @override
  String get subscriptionActiveSubtitle =>
      'Gérez votre facturation et votre forfait.';

  @override
  String subscriptionActivePlan(Object price) {
    return 'Forfait actuel : $price';
  }

  @override
  String get devicesSectionTitle => 'Appareils';

  @override
  String get devicesSectionSubtitle => 'Gérez l’appareil lié à votre forfait';

  @override
  String get deviceManagementTitle => 'Accès appareil';

  @override
  String get deviceManagementSubtitle =>
      'Un seul appareil peut être actif à la fois.';

  @override
  String get deviceRevokeAction => 'Révoquer';

  @override
  String get deviceLimitTitle => 'Limite d’appareils atteinte';

  @override
  String get deviceLimitSubtitle =>
      'Votre forfait autorise 1 appareil actif. Remplacez-en un pour continuer.';

  @override
  String get deviceUnknownLabel => 'Appareil inconnu';

  @override
  String get deviceCurrentLabel => 'Actuel';

  @override
  String get deviceReplaceAction => 'Remplacer';

  @override
  String get deviceLastSeenPrefix => 'Dernière utilisation';

  @override
  String get deviceRegisterFailedTitle => 'Impossible d’enregistrer l’appareil';

  @override
  String get retryButtonLabel => 'Réessayer';

  @override
  String get helpTabLabel => 'Aide';

  @override
  String get helpIntroTitle => 'Obtenir de l’aide rapidement';

  @override
  String get helpIntroBody =>
      'Signalez des bugs ou des problèmes avec des captures et une description écrite. Notre équipe les analysera et vous tiendra informé.';

  @override
  String get helpFormTitle => 'Soumettre un ticket';

  @override
  String get helpDescriptionLabel => 'Décrivez le problème';

  @override
  String get helpDescriptionHint =>
      'Étapes, résultat attendu et ce qui s’est passé.';

  @override
  String get helpDescriptionRequired => 'Ajoutez une courte description.';

  @override
  String get helpAudioTitle => 'Note vocale';

  @override
  String get helpAudioSubtitle =>
      'Enregistrez une note vocale et nous la transcrirons dans votre description.';

  @override
  String get helpAudioRecordButton => 'Enregistrer une note vocale';

  @override
  String get helpAudioStopButton => 'Arrêter l’enregistrement';

  @override
  String get helpAudioRecordingLabel => 'Enregistrement…';

  @override
  String get helpAudioProcessingLabel => 'Enregistrement de la note vocale…';

  @override
  String get helpAudioReadyLabel => 'Note vocale prête';

  @override
  String helpAudioReadyWithDuration(Object duration) {
    return 'Note vocale prête ($duration)';
  }

  @override
  String get helpAudioDeleteButton => 'Supprimer';

  @override
  String get helpAudioNotSupported =>
      'L’enregistrement vocal n’est pas disponible sur cet appareil.';

  @override
  String get helpAudioPermissionDenied =>
      'L’accès au micro est requis pour enregistrer une note vocale.';

  @override
  String get helpAudioFailed =>
      'Impossible d’enregistrer la note vocale. Réessayez.';

  @override
  String get helpAudioTranscribingLabel => 'Transcription de la note vocale…';

  @override
  String get helpAudioTranscriptionFailed =>
      'Impossible de transcrire la note vocale.';

  @override
  String get helpAttachmentTitle => 'Captures d’écran';

  @override
  String get helpAttachmentSubtitle =>
      'Ajoutez des captures pour accélérer le diagnostic.';

  @override
  String get helpAttachmentGalleryButton => 'Galerie';

  @override
  String get helpAttachmentLimitReached => 'Limite de captures atteinte.';

  @override
  String helpAttachmentLimitTrimmed(Object count) {
    return 'Ajouté $count captures. Supprimez-en une pour en ajouter.';
  }

  @override
  String get removeAttachmentTooltip => 'Supprimer la pièce jointe';

  @override
  String get helpAttachmentProcessingFailed =>
      'Impossible de préparer la capture. Réessayez.';

  @override
  String get helpSubmittingLabel => 'Envoi…';

  @override
  String get helpSubmitButton => 'Envoyer le ticket';

  @override
  String get helpTicketSubmitted =>
      'Ticket envoyé. Nous vous tiendrons informé.';

  @override
  String get helpSubmissionFailed =>
      'Impossible d’envoyer le ticket. Réessayez.';

  @override
  String get helpSubmissionTimeout =>
      'Le délai d’envoi est dépassé. Vérifiez votre connexion et réessayez.';

  @override
  String get helpSubmissionUploadTimeout =>
      'Le téléversement des captures a pris trop de temps. Essayez avec moins de captures ou plus petites.';

  @override
  String get helpViewTicketsButton => 'Voir les tickets';

  @override
  String get helpTicketsTitle => 'Tickets';

  @override
  String get helpRecentTicketsTitle => 'Tickets récents';

  @override
  String get helpNoTicketsMessage => 'Aucun ticket pour le moment.';

  @override
  String get helpTicketsLoadFailed =>
      'Impossible de charger les tickets pour l’instant.';

  @override
  String get helpStatusOpen => 'Ouvert';

  @override
  String get helpStatusTriaging => 'Analyse';

  @override
  String get helpStatusInProgress => 'En cours';

  @override
  String get helpStatusAwaitingResponse => 'En attente de vous';

  @override
  String get helpStatusResolved => 'Résolu';

  @override
  String get helpStatusClosed => 'Clos';

  @override
  String get helpStatusUpdatedLabel => 'Statut mis à jour';

  @override
  String get helpDelivererStatusReceivedLabel => 'Reçu';

  @override
  String get helpDelivererStatusAnalyzingLabel => 'Analyse';

  @override
  String get helpDelivererStatusNeedsInfoLabel => 'Info requise';

  @override
  String get helpDelivererStatusFixReadyLabel => 'Correctif prêt';

  @override
  String get helpDelivererStatusResolvedLabel => 'Résolu';

  @override
  String get helpDelivererStatusReceivedMessage => 'Ticket reçu.';

  @override
  String get helpDelivererStatusAnalyzingMessage => 'Analyse en cours.';

  @override
  String get helpDelivererStatusNeedsInfoMessage =>
      'Nous avons besoin d’informations supplémentaires.';

  @override
  String get helpDelivererStatusFixReadyMessage =>
      'Une correction est prête et en validation.';

  @override
  String get helpDelivererStatusResolvedMessage => 'Le ticket est résolu.';

  @override
  String get helpTicketDetailTitle => 'Détails du ticket';

  @override
  String get helpTicketProgressTitle => 'Progression';

  @override
  String get helpTicketTimelineTitle => 'Historique des statuts';

  @override
  String get helpTicketTimelineEmpty =>
      'Aucun historique de statut pour l’instant.';

  @override
  String get helpTicketTimelineAtLabel => 'Le';

  @override
  String get helpTicketDescriptionTitle => 'Description';

  @override
  String get helpTicketDescriptionEmpty => 'Aucune description fournie.';

  @override
  String get helpTicketAudioHeadline => 'Note vocale';

  @override
  String get helpTicketGeneratedTitleGeneric => 'Demande d’assistance';

  @override
  String get helpTicketAttachmentsTitle => 'Pièces jointes';

  @override
  String get helpTicketNotFound => 'Ce ticket n’existe plus.';

  @override
  String get helpAttachmentsScreenshotsTitle => 'Captures d’écran';

  @override
  String get helpAttachmentsAudioTitle => 'Notes vocales';

  @override
  String get helpNoAttachmentsMessage => 'Aucune pièce jointe.';

  @override
  String get helpAudioAttachmentLabel => 'Note vocale';

  @override
  String get helpAudioPlayTooltip => 'Lire la note vocale';

  @override
  String get helpAudioOpenFailed => 'Impossible d’ouvrir la note vocale.';

  @override
  String get helpAiTriageTitle => 'Analyse du ticket';

  @override
  String get helpAiSummaryLabel => 'Résumé';

  @override
  String get helpAiNextStepsLabel => 'Prochaines étapes';
}
