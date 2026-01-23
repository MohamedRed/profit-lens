import 'dart:convert';
import 'dart:io';

import 'fixtures/offer_image_base64.dart';

Future<void> main() async {
  final uri = Uri.parse(
    'https://europe-west1-profit-lens-prod-2e417.cloudfunctions.net/'
    'extractOfferFromImage',
  );

  final payload = jsonEncode({
    'data': {
      'imageBase64': offerImageBase64,
      'mimeType': 'image/jpeg',
    },
  });

  final client = HttpClient();
  try {
    final request = await client.postUrl(uri);
    request.headers.set(HttpHeaders.contentTypeHeader, 'application/json');
    request.add(utf8.encode(payload));

    final response = await request.close();
    final body = await utf8.decoder.bind(response).join();

    if (response.statusCode != 200) {
      stderr.writeln('Callable failed with status ${response.statusCode}.');
      stderr.writeln(body);
      exitCode = 1;
      return;
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
      return;
    }

    stdout.writeln('Callable OK: ${jsonEncode(result)}');
  } finally {
    client.close(force: true);
  }
}
