pluginManagement {
  repositories {
    google()
    mavenCentral()
    gradlePluginPortal()
  }
}

dependencyResolutionManagement {
  repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
  repositories {
    google()
    mavenCentral()
  }
}

rootProject.name = "profit-lens-android"
include(":app")
include(":core:designsystem")
include(":core:ui")
include(":core:firebase")
include(":core:data")
include(":feature:auth")
include(":feature:onboarding")
include(":feature:offer")
include(":feature:history")
include(":feature:settings")
include(":feature:help")
include(":feature:billing")
include(":feature:overlay")
