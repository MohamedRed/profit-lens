import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';
import '../../../auth/domain/auth_user.dart';
import '../../../profile/domain/user_profile.dart';
import '../../../vehicles/domain/vehicle_profile.dart';
import '../../../vehicles/presentation/vehicle_form_screen.dart';

class SettingsVehicleCard extends StatelessWidget {
  final AuthUser user;
  final UserProfile profile;
  final List<VehicleProfile> vehicles;

  const SettingsVehicleCard({
    super.key,
    required this.user,
    required this.profile,
    required this.vehicles,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Card(
      child: Column(
        children: [
          ListTile(
            title: Text(l10n.vehiclesSectionTitle),
            trailing: IconButton(
              icon: const Icon(Icons.add),
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) =>
                        VehicleFormScreen(user: user, profile: profile),
                  ),
                );
              },
            ),
          ),
          if (vehicles.isEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Text(l10n.noVehiclesMessage),
            )
          else
            ...vehicles.map(
              (vehicle) => ListTile(
                title: Text(vehicle.name),
                subtitle: Text(vehicle.type.name),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (context) => VehicleFormScreen(
                        user: user,
                        profile: profile,
                        vehicle: vehicle,
                      ),
                    ),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}
