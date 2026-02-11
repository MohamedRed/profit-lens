// Custom Flutter bootstrap to reduce startup latency.
window.addEventListener("load", function () {
  var serviceWorkerVersion = "{{flutter_service_worker_version}}";

  _flutter.loader.load({
    serviceWorkerSettings: {
      serviceWorkerVersion: serviceWorkerVersion,
      timeoutMillis: 1000,
    },
    onEntrypointLoaded: function (engineInitializer) {
      engineInitializer.initializeEngine().then(function (appRunner) {
        appRunner.runApp();
      });
    },
  });
});
