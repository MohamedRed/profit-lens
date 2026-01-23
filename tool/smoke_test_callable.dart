import 'dart:convert';
import 'dart:io';

import 'fixtures/offer_image_base64.dart';
import 'fixtures/offer_image_base64_second.dart';

Future<void> main() async {
  final uri = Uri.parse(
    'https://europe-west1-profit-lens-prod-2e417.cloudfunctions.net/'
    'extractOfferFromImage',
  );

  final cases = <({String label, String base64})>[
    (label: 'offer-image-1', base64: offerImageBase64),
    (label: 'offer-image-2', base64: offerImageBase64Second),
  ];

  final client = HttpClient();
  try {
    for (final testCase in cases) {
      final result = await _callExtractOffer(
        client: client,
        uri: uri,
        imageBase64: testCase.base64,
      );
      stdout.writeln('${testCase.label} OK: ${jsonEncode(result)}');
    }
  } finally {
    client.close(force: true);
  }
}

Future<Map<String, dynamic>> _callExtractOffer({
  required HttpClient client,
  required Uri uri,
  required String imageBase64,
}) async {
  final payload = jsonEncode({
    'data': {
      'imageBase64': imageBase64,
      'mimeType': 'image/jpeg',
    },
  });

  final request = await client.postUrl(uri);
  request.headers.set(HttpHeaders.contentTypeHeader, 'application/json');
  request.add(utf8.encode(payload));

  final response = await request.close();
  final body = await utf8.decoder.bind(response).join();

  if (response.statusCode != 200) {
    stderr.writeln('Callable failed with status ${response.statusCode}.');
    stderr.writeln(body);
    exitCode = 1;
    throw StateError('Callable failed.');
  }

  final decoded = jsonDecode(body) as Map<String, dynamic>;
  final result = (decoded['result'] ?? decoded['data'] ?? decoded)
      as Map<String, dynamic>;
  final offer = result['offer'] as Map<String, dynamic>?;

  if (offer == null ||
      offer['payoutEuro'] is! num ||
      offer['distanceKm'] is! num) {
    stderr.writeln('Callable returned unexpected payload.');
    stderr.writeln(body);
    exitCode = 1;
    throw StateError('Callable payload invalid.');
  }

  return result;
}
