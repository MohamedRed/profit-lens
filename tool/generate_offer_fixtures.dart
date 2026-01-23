import 'dart:convert';
import 'dart:io';

class _FixtureSpec {
  const _FixtureSpec({
    required this.sourcePath,
    required this.outputPath,
    required this.constName,
  });

  final String sourcePath;
  final String outputPath;
  final String constName;
}

const _fixtures = <_FixtureSpec>[
  _FixtureSpec(
    sourcePath: 'tool/fixtures/source_images/IMG-20260122-WA0020.JPG',
    outputPath: 'tool/fixtures/offer_image_base64.dart',
    constName: 'offerImageBase64',
  ),
  _FixtureSpec(
    sourcePath: 'tool/fixtures/source_images/IMG-20260122-WA0021.JPG',
    outputPath: 'tool/fixtures/offer_image_base64_second.dart',
    constName: 'offerImageBase64Second',
  ),
];

Future<void> main() async {
  const wrap = 4000;
  for (final fixture in _fixtures) {
    final sourceFile = File(fixture.sourcePath);
    if (!await sourceFile.exists()) {
      stderr.writeln('Missing source image: ${fixture.sourcePath}');
      exitCode = 1;
      return;
    }

    final bytes = await sourceFile.readAsBytes();
    final encoded = base64Encode(bytes);
    final buffer = StringBuffer()
      ..writeln('const String ${fixture.constName} =')
      ..write("    '");

    for (var i = 0; i < encoded.length; i += wrap) {
      final chunk = encoded.substring(
        i,
        i + wrap < encoded.length ? i + wrap : encoded.length,
      );
      buffer.write(chunk);
      if (i + wrap < encoded.length) {
        buffer
          ..writeln("'")
          ..write("    '");
      }
    }

    buffer.writeln("';");

    await File(fixture.outputPath).writeAsString(
      buffer.toString(),
      encoding: utf8,
    );
  }

  stdout.writeln('Fixtures regenerated.');
}
