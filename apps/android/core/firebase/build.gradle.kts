plugins {
  id("com.android.library")
  id("org.jetbrains.kotlin.android")
  id("com.google.dagger.hilt.android")
  id("com.google.devtools.ksp")
}

fun readEnvOrDefault(name: String, fallback: String): String {
  return System.getenv(name)?.takeIf { it.isNotBlank() } ?: fallback
}

fun String.asBuildConfigLiteral(): String {
  return "\"${replace("\\", "\\\\").replace("\"", "\\\"")}\""
}

android {
  namespace = "com.profitlens.android.core.firebase"
  compileSdk = 35

  defaultConfig {
    minSdk = 29
  }

  sourceSets["main"].manifest.srcFile(rootProject.file("empty-android-manifest.xml"))

  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
  }

  kotlinOptions {
    jvmTarget = "17"
  }

  buildFeatures {
    buildConfig = true
  }

  defaultConfig {
    buildConfigField(
      "String",
      "FIREBASE_API_KEY",
      readEnvOrDefault("ANDROID_FIREBASE_API_KEY", "AIzaSyAuP4nShQ60Axflrnjvplsro5OD2YjYslM").asBuildConfigLiteral(),
    )
    buildConfigField(
      "String",
      "FIREBASE_APP_ID",
      readEnvOrDefault("ANDROID_FIREBASE_APP_ID", "1:117544150167:web:9a18d96b6b193da94f75d2").asBuildConfigLiteral(),
    )
    buildConfigField(
      "String",
      "FIREBASE_PROJECT_ID",
      readEnvOrDefault("ANDROID_FIREBASE_PROJECT_ID", "profit-lens-prod-2e417").asBuildConfigLiteral(),
    )
    buildConfigField(
      "String",
      "FIREBASE_STORAGE_BUCKET",
      readEnvOrDefault("ANDROID_FIREBASE_STORAGE_BUCKET", "profit-lens-prod-2e417.firebasestorage.app").asBuildConfigLiteral(),
    )
    buildConfigField(
      "String",
      "FIREBASE_MESSAGING_SENDER_ID",
      readEnvOrDefault("ANDROID_FIREBASE_MESSAGING_SENDER_ID", "117544150167").asBuildConfigLiteral(),
    )
  }
}

dependencies {
  val firebaseBom = platform("com.google.firebase:firebase-bom:33.6.0")
  api(firebaseBom)
  implementation("androidx.core:core-ktx:1.13.1")
  implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
  implementation("com.google.dagger:hilt-android:2.52")
  api("com.google.firebase:firebase-auth-ktx")
  api("com.google.firebase:firebase-firestore-ktx")
  api("com.google.firebase:firebase-functions-ktx")
  api("com.google.firebase:firebase-storage-ktx")
  api("com.google.firebase:firebase-remote-config-ktx")
  ksp("com.google.dagger:hilt-compiler:2.52")
}
