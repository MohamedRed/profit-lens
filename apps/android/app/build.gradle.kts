plugins {
  id("com.android.application")
  id("org.jetbrains.kotlin.android")
  id("com.google.devtools.ksp")
}

fun readEnvOrDefault(name: String, fallback: String): String {
  return System.getenv(name)?.takeIf { it.isNotBlank() } ?: fallback
}

fun String.asBuildConfigLiteral(): String {
  return "\"${replace("\\", "\\\\").replace("\"", "\\\"")}\""
}

android {
  namespace = "com.profitlens.android"
  compileSdk = 35

  signingConfigs {
    create("release") {
      val storePath = System.getenv("ANDROID_UPLOAD_STORE_FILE")?.takeIf { it.isNotBlank() }
      if (storePath != null) {
        storeFile = file(storePath)
        storePassword = System.getenv("ANDROID_UPLOAD_STORE_PASSWORD")
        keyAlias = System.getenv("ANDROID_UPLOAD_KEY_ALIAS")
        keyPassword = System.getenv("ANDROID_UPLOAD_KEY_PASSWORD")
      }
    }
  }

  defaultConfig {
    applicationId = "com.profitlens.android"
    minSdk = 29
    targetSdk = 35
    versionCode = 1
    versionName = "0.1.0"
    testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

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
      "FIREBASE_AUTH_DOMAIN",
      readEnvOrDefault("ANDROID_FIREBASE_AUTH_DOMAIN", "profit-lens-prod-2e417.firebaseapp.com").asBuildConfigLiteral(),
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
    buildConfigField("String", "FUNCTIONS_REGION", "\"europe-west1\"")
    buildConfigField("String", "UBER_EATS_PACKAGE", "\"com.ubercab.eats\"")
    buildConfigField("String", "DELIVEROO_PACKAGE", "\"com.deliveroo.orderapp\"")
  }

  buildTypes {
    release {
      isMinifyEnabled = false
      signingConfig = signingConfigs.getByName("release")
      proguardFiles(
        getDefaultProguardFile("proguard-android-optimize.txt"),
        "proguard-rules.pro",
      )
    }
  }

  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
  }

  kotlinOptions {
    jvmTarget = "17"
  }

  buildFeatures {
    compose = true
    buildConfig = true
  }

  composeOptions {
    kotlinCompilerExtensionVersion = "1.5.14"
  }

  packaging {
    resources {
      excludes += "/META-INF/{AL2.0,LGPL2.1}"
    }
  }

  testOptions {
    unitTests.isIncludeAndroidResources = true
  }
}

dependencies {
  val composeBom = platform("androidx.compose:compose-bom:2024.10.01")
  val firebaseBom = platform("com.google.firebase:firebase-bom:33.6.0")

  implementation(composeBom)
  androidTestImplementation(composeBom)
  implementation(firebaseBom)

  implementation("androidx.core:core-ktx:1.13.1")
  implementation("androidx.activity:activity-compose:1.9.2")
  implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.6")
  implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.6")
  implementation("androidx.work:work-runtime-ktx:2.9.1")
  implementation("androidx.room:room-runtime:2.6.1")
  implementation("androidx.room:room-ktx:2.6.1")
  ksp("androidx.room:room-compiler:2.6.1")
  implementation("androidx.compose.material3:material3")
  implementation("androidx.compose.ui:ui")
  implementation("androidx.compose.ui:ui-tooling-preview")
  implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
  implementation("org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.8.1")
  implementation("com.google.android.gms:play-services-location:21.3.0")
  implementation("com.google.firebase:firebase-auth-ktx")
  implementation("com.google.firebase:firebase-functions-ktx")

  debugImplementation("androidx.compose.ui:ui-tooling")
  debugImplementation("androidx.compose.ui:ui-test-manifest")

  testImplementation("junit:junit:4.13.2")

  androidTestImplementation("androidx.test.ext:junit:1.2.1")
  androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
  androidTestImplementation("androidx.compose.ui:ui-test-junit4")
}
