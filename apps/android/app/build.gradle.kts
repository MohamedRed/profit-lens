plugins {
  id("com.android.application")
  id("org.jetbrains.kotlin.android")
  id("com.google.devtools.ksp")
  id("org.jetbrains.kotlin.plugin.serialization")
  id("com.google.dagger.hilt.android")
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

  implementation(project(":core:designsystem"))
  implementation(project(":core:ui"))
  implementation(project(":core:firebase"))
  implementation(project(":core:data"))
  implementation(project(":feature:auth"))
  implementation(project(":feature:onboarding"))
  implementation(project(":feature:offer"))
  implementation(project(":feature:history"))
  implementation(project(":feature:settings"))
  implementation(project(":feature:help"))
  implementation(project(":feature:billing"))
  implementation(project(":feature:overlay"))

  implementation("androidx.core:core-ktx:1.13.1")
  implementation("androidx.activity:activity-compose:1.9.2")
  implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.6")
  implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.6")
  implementation("androidx.compose.material3:material3")
  implementation("androidx.compose.ui:ui")
  implementation("androidx.compose.ui:ui-tooling-preview")
  implementation("androidx.navigation:navigation-compose:2.8.2")
  implementation("androidx.hilt:hilt-navigation-compose:1.2.0")
  implementation("com.google.dagger:hilt-android:2.52")
  ksp("com.google.dagger:hilt-compiler:2.52")

  debugImplementation("androidx.compose.ui:ui-tooling")
  debugImplementation("androidx.compose.ui:ui-test-manifest")

  testImplementation("junit:junit:4.13.2")

  androidTestImplementation("androidx.test.ext:junit:1.2.1")
  androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
  androidTestImplementation("androidx.compose.ui:ui-test-junit4")
}
