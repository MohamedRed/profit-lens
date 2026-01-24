import 'package:flutter/material.dart';

import '../../../features/defaults/data/france_defaults.dart';
import '../../../features/defaults/data/vehicle_presets_fr.dart';
import '../../../features/defaults/presentation/preset_sources_section.dart';

class ProfileSetupSourcesSection extends StatelessWidget {
  const ProfileSetupSourcesSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        PresetSourcesSection(sources: FranceDefaults.sources),
        const SizedBox(height: 12),
        PresetSourcesSection(sources: VehiclePresetsFr.sources),
      ],
    );
  }
}
