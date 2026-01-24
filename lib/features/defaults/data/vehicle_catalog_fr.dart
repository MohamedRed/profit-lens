import '../../vehicles/domain/vehicle_type.dart';

class VehicleCatalogFr {
  static List<String> brandsForType(VehicleType type) {
    final catalog = _catalog[type];
    if (catalog == null) return const [];
    return catalog.keys.toList(growable: false);
  }

  static List<String> modelsFor({
    required VehicleType type,
    required String brand,
  }) {
    final catalog = _catalog[type];
    if (catalog == null) return const [];
    final normalizedBrand = brand.trim().toLowerCase();
    for (final entry in catalog.entries) {
      if (entry.key.toLowerCase() == normalizedBrand) {
        return entry.value;
      }
    }
    return const [];
  }

  static const Map<VehicleType, Map<String, List<String>>> _catalog = {
    VehicleType.bike: {
      'Decathlon': ['Triban', 'Riverside', 'Rockrider'],
      'Giant': ['Escape', 'Talon', 'Defy'],
      'Trek': ['FX', 'Domane', 'Marlin'],
      'Specialized': ['Sirrus', 'Allez', 'Rockhopper'],
    },
    VehicleType.ebike: {
      'Decathlon': ['Elops', 'Riverside E', 'Rockrider E'],
      'Moustache': ['Samedi 28', 'Samedi 27', 'Lundi'],
      'Cowboy': ['C3', 'C4', 'Cross'],
      'VanMoof': ['S3', 'X3', 'S5'],
    },
    VehicleType.scooter: {
      'Peugeot': ['Django', 'Kisbee', 'Tweet'],
      'Yamaha': ['NMAX', 'XMAX', 'TMAX'],
      'Honda': ['PCX', 'Forza', 'SH'],
      'Piaggio': ['Liberty', 'Beverly', 'Zip'],
      'SYM': ['Jet', 'Symphony', 'Fiddle'],
      'Kymco': ['Agility', 'Like', 'Xciting'],
    },
    VehicleType.car: {
      'Renault': ['Clio', 'Megane', 'Captur'],
      'Peugeot': ['208', '2008', '308'],
      'Citroen': ['C3', 'C4', 'C5 Aircross'],
      'Dacia': ['Sandero', 'Duster', 'Spring'],
      'Volkswagen': ['Polo', 'Golf', 'Tiguan'],
      'Toyota': ['Yaris', 'Corolla', 'C-HR'],
      'Tesla': ['Model 3', 'Model Y', 'Model S'],
      'BMW': ['1 Series', '3 Series', 'X1'],
      'Mercedes-Benz': ['A-Class', 'C-Class', 'GLA'],
    },
  };
}
