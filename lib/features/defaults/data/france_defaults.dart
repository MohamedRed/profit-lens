import '../../vehicles/domain/fuel_type.dart';

class DefaultSource {
  final String label;
  final String url;
  final String lastChecked;

  const DefaultSource({
    required this.label,
    required this.url,
    required this.lastChecked,
  });
}

class FranceDefaults {
  static const double socialContributionRateServices = 0.212;
  static const String socialContributionRateDate = '2026-01-01';

  static const double electricityPricePerKwh = 0.1940;
  static const String electricityPriceDate = '2026-02-01';

  static const Map<FuelType, double> fuelPricePerLiter = {
    FuelType.e10: 1.6940,
    FuelType.sp95: 1.7436,
    FuelType.sp98: 1.7958,
    FuelType.gazole: 1.6737,
    FuelType.e85: 0.7690,
    FuelType.gplc: 0.9733,
  };
  static const String fuelPriceDate = '2026-01-22';

  static const List<DefaultSource> sources = [
    DefaultSource(
      label: 'Auto-entrepreneur social contribution rates',
      url: 'https://entreprendre.service-public.fr/vosdroits/F37353',
      lastChecked: '2026-01-23',
    ),
    DefaultSource(
      label: 'Tarif Bleu residential electricity price (base option 6 kVA)',
      url: 'https://www.cre.fr/actualites/grille-tarifaire-des-tarifs-reglementes-bleus-residentiels-applicables-au-1er-fevrier-2026/',
      lastChecked: '2026-01-23',
    ),
    DefaultSource(
      label: 'Daily fuel price dataset (France)',
      url: 'https://donnees.roulez-eco.fr/opendata/jour',
      lastChecked: '2026-01-23',
    ),
  ];
}
