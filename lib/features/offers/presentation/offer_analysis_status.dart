enum OfferAnalysisStatus {
  idle,
  extracting,
  verifyingRoute,
  calculatingProfit,
  completed,
  failed,
}

extension OfferAnalysisStatusX on OfferAnalysisStatus {
  bool get isAnalyzing =>
      this == OfferAnalysisStatus.extracting ||
      this == OfferAnalysisStatus.verifyingRoute ||
      this == OfferAnalysisStatus.calculatingProfit;
}
