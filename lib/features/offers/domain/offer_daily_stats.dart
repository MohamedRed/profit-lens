class OfferDailyStats {
  final DateTime dayStart;
  final int count;
  final double netProfitSum;

  const OfferDailyStats({
    required this.dayStart,
    required this.count,
    required this.netProfitSum,
  });

  double get averageProfit => count == 0 ? 0 : netProfitSum / count;
}
