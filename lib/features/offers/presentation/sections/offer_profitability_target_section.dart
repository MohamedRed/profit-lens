import 'package:flutter/material.dart';

import '../../../../core/utils/number_parsing.dart';
import '../../../../core/widgets/section_card.dart';
import '../../../../l10n/app_localizations.dart';

class OfferProfitabilityTargetSection extends StatefulWidget {
  final double minProfitabilityEuro;
  final ValueChanged<double> onSaved;

  const OfferProfitabilityTargetSection({
    super.key,
    required this.minProfitabilityEuro,
    required this.onSaved,
  });

  @override
  State<OfferProfitabilityTargetSection> createState() =>
      _OfferProfitabilityTargetSectionState();
}

class _OfferProfitabilityTargetSectionState
    extends State<OfferProfitabilityTargetSection> {
  late final TextEditingController _controller;
  late final FocusNode _focusNode;
  double _lastSaved = 0;

  @override
  void initState() {
    super.initState();
    _lastSaved = widget.minProfitabilityEuro;
    _controller = TextEditingController(
      text: widget.minProfitabilityEuro.toStringAsFixed(2),
    );
    _focusNode = FocusNode();
    _focusNode.addListener(_handleFocusChange);
  }

  @override
  void didUpdateWidget(OfferProfitabilityTargetSection oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!_focusNode.hasFocus &&
        widget.minProfitabilityEuro != _lastSaved) {
      _lastSaved = widget.minProfitabilityEuro;
      _controller.text = widget.minProfitabilityEuro.toStringAsFixed(2);
    }
  }

  @override
  void dispose() {
    _focusNode.removeListener(_handleFocusChange);
    _focusNode.dispose();
    _controller.dispose();
    super.dispose();
  }

  void _handleFocusChange() {
    if (_focusNode.hasFocus) {
      return;
    }
    _saveIfValid();
  }

  void _saveIfValid() {
    final parsed = NumberParsing.parseDouble(_controller.text);
    if (parsed == null || parsed <= 0) {
      return;
    }
    if (parsed == _lastSaved) {
      return;
    }
    _lastSaved = parsed;
    widget.onSaved(parsed);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return SectionCard(
      title: l10n.profitabilityTargetTitle,
      children: [
        TextFormField(
          controller: _controller,
          focusNode: _focusNode,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: InputDecoration(
            labelText: l10n.minProfitabilityLabel,
            suffixText: '€',
            helperText: l10n.minProfitabilityHint,
          ),
          onFieldSubmitted: (_) => _saveIfValid(),
        ),
      ],
    );
  }
}
