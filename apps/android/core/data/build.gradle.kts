plugins {
  id("com.android.library")
  id("org.jetbrains.kotlin.android")
  id("org.jetbrains.kotlin.plugin.serialization")
  id("com.google.dagger.hilt.android")
  id("com.google.devtools.ksp")
}

android {
  namespace = "com.profitlens.android.core.data"
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
}

dependencies {
  implementation(project(":core:firebase"))
  implementation("androidx.core:core-ktx:1.13.1")
  implementation("androidx.datastore:datastore-preferences:1.1.1")
  implementation("androidx.room:room-runtime:2.6.1")
  implementation("androidx.room:room-ktx:2.6.1")
  implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
  implementation("org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.8.1")
  implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")
  implementation("com.google.dagger:hilt-android:2.52")
  implementation("com.google.android.gms:play-services-location:21.3.0")
  ksp("androidx.room:room-compiler:2.6.1")
  ksp("com.google.dagger:hilt-compiler:2.52")
}
