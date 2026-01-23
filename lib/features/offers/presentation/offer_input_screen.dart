import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/utils/number_parsing.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../features/defaults/data/france_defaults.dart';
import '../../../features/offers/data/gemini_offer_ingestion_service.dart';
import '../../../features/offers/domain/offer.dart';
import '../../../features/profitability/domain/profitability_engine.dart';
import '../../../features/profitability/domain/profitability_input.dart';
import '../../../features/vehicles/domain/energy_type.dart';
import '../../../features/vehicles/domain/fuel_type.dart';
import '../../../features/vehicles/domain/vehicle_profile.dart';
import '../../../features/vehicles/domain/vehicle_type.dart';
import '../../../l10n/app_localizations.dart';
import 'offer_result_screen.dart';
import 'sections/costs_section.dart';
import 'sections/offer_details_section.dart';
import 'sections/vehicle_section.dart';

class OfferInputScreen extends StatefulWidget {
  const OfferInputScreen({super.key});

  @override
  State<OfferInputScreen> createState() => _OfferInputScreenState();
}

class _OfferInputScreenState extends State<OfferInputScreen> {
  final _formKey = GlobalKey<FormState>();
  final _payoutController = TextEditingController();
  final _distanceController = TextEditingController();
  final _consumptionController = TextEditingController();
  final _energyPriceController = TextEditingController();
  final _maintenanceController = TextEditingController();
  final _depreciationController = TextEditingController();
  final _socialRateController = TextEditingController();
  final _engine = ProfitabilityEngine();
  final _imagePicker = ImagePicker();
  final _ingestionService = GeminiOfferIngestionService();

  VehicleType _vehicleType = VehicleType.bike;
  EnergyType _energyType = EnergyType.none;
  FuelType? _fuelType = FuelType.e10;
  bool _useFranceDefaults = true;

  @override
  void initState() {
    super.initState();
    _applyFranceDefaults();
  }

  @override
  void dispose() {
    _payoutController.dispose();
    _distanceController.dispose();
    _consumptionController.dispose();
    _energyPriceController.dispose();
    _maintenanceController.dispose();
    _depreciationController.dispose();
    _socialRateController.dispose();
    super.dispose();
  }

  void _applyFranceDefaults() {
    if (!_useFranceDefaults) {
      return;
    }
    _socialRateController.text =
        (FranceDefaults.socialContributionRateServices * 100)
            .toStringAsFixed(1);
    _applyEnergyPriceDefaults();
    if (_energyType == EnergyType.none) {
      _consumptionController.text = '0';
    }
  }

  void _applyEnergyPriceDefaults() {
    if (!_useFranceDefaults) {
      return;
    }
    switch (_energyType) {
      case EnergyType.none:
        _energyPriceController.text = '0';
        break;
      case EnergyType.electric:
        _energyPriceController.text =
            FranceDefaults.electricityPricePerKwh.toStringAsFixed(4);
        break;
      case EnergyType.fuel:
        final fuelType = _fuelType ?? FuelType.e10;
        final price = FranceDefaults.fuelPricePerLiter[fuelType] ?? 0;
        _energyPriceController.text = price.toStringAsFixed(4);
        break;
    }
  }

  Future<void> _importScreenshot() async {
    final l10n = AppLocalizations.of(context)!;
    final image = await _imagePicker.pickImage(source: ImageSource.gallery);
    if (image == null) {
      return;
    }
    try {
      final result = await _ingestionService.extractFromImage(image);
      if (result.offer != null) {
        _payoutController.text = result.offer!.payoutEuro.toStringAsFixed(2);
        _distanceController.text = result.offer!.distanceKm.toStringAsFixed(1);
      }
    } catch (_) {
      if (!mounted) return;
      await showDialog<void>(
        context: context,
        builder: (context) => AlertDialog(
          title: Text(l10n.missingConfigTitle),
          content: Text(l10n.missingGeminiConfigMessage),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(l10n.okButton),
            ),
          ],
        ),
      );
    }
  }

  void _analyze() {
    if (!(_formKey.currentState?.validate() ?? false)) {
      return;
    }
    final payout = NumberParsing.parseDouble(_payoutController.text);
    final distance = NumberParsing.parseDouble(_distanceController.text);
    final consumption = NumberParsing.parseDouble(_consumptionController.text);
    final energyPrice = NumberParsing.parseDouble(_energyPriceController.text);
    final maintenance =
        NumberParsing.parseDouble(_maintenanceController.text) ?? 0;
    final depreciation =
        NumberParsing.parseDouble(_depreciationController.text) ?? 0;
    final socialRatePercent =
        NumberParsing.parseDouble(_socialRateController.text);

    if (payout == null ||
        distance == null ||
        consumption == null ||
        energyPrice == null ||
        socialRatePercent == null) {
      return;
    }

    final offer = Offer(payoutEuro: payout, distanceKm: distance);
    final vehicle = VehicleProfile(
      type: _vehicleType,
      energyType: _energyType,
      fuelType: _fuelType,
      energyConsumptionPer100Km: consumption,
      maintenancePerKm: maintenance,
      depreciationPerKm: depreciation,
    );
    final costs = CostSettings(
      energyPricePerUnit: energyPrice,
      socialContributionRate: socialRatePercent / 100,
    );
    final input = ProfitabilityInput(
      offer: offer,
      vehicle: vehicle,
      costs: costs,
    );
    final breakdown = _engine.evaluate(input);

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => OfferResultScreen(
          offer: offer,
          breakdown: breakdown,
        ),
      ),
    );
  }

  String _consumptionSuffix() {
    switch (_energyType) {
      case EnergyType.electric:
        return 'kWh/100 km';
      case EnergyType.fuel:
        return 'L/100 km';
      case EnergyType.none:
        return '';
    }
  }

  String _energyPriceSuffix() {
    switch (_energyType) {
      case EnergyType.electric:
        return 'EUR/kWh';
      case EnergyType.fuel:
        return 'EUR/L';
      case EnergyType.none:
        return 'EUR';
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.appTitle)),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              OfferDetailsSection(
                payoutController: _payoutController,
                distanceController: _distanceController,
              ),
              const SizedBox(height: 12),
              VehicleSection(
                vehicleType: _vehicleType,
                energyType: _energyType,
                fuelType: _fuelType,
                onVehicleTypeChanged: (value) {
                  setState(() {
                    _vehicleType = value;
                  });
                },
                onEnergyTypeChanged: (value) {
                  setState(() {
                    _energyType = value;
                    if (_energyType != EnergyType.fuel) {
                      _fuelType = null;
                    } else {
                      _fuelType ??= FuelType.e10;
                    }
                    _applyEnergyPriceDefaults();
                    if (_energyType == EnergyType.none) {
                      _consumptionController.text = '0';
                    }
                  });
                },
                onFuelTypeChanged: (value) {
                  setState(() {
                    _fuelType = value;
                    _applyEnergyPriceDefaults();
                  });
                },
                consumptionController: _consumptionController,
                energyPriceController: _energyPriceController,
                maintenanceController: _maintenanceController,
                depreciationController: _depreciationController,
                consumptionSuffix: _consumptionSuffix(),
                energyPriceSuffix: _energyPriceSuffix(),
              ),
              const SizedBox(height: 12),
              CostsSection(
                socialRateController: _socialRateController,
                useFranceDefaults: _useFranceDefaults,
                onDefaultsChanged: (value) {
                  setState(() {
                    _useFranceDefaults = value;
                    _applyFranceDefaults();
                  });
                },
              ),
              const SizedBox(height: 16),
              PrimaryButton(
                label: l10n.importScreenshotButton,
                onPressed: _importScreenshot,
              ),
              const SizedBox(height: 12),
              PrimaryButton(
                label: l10n.analyzeButton,
                onPressed: _analyze,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
