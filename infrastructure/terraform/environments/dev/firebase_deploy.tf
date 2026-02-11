module "firebase_deploy_sa" {
  source       = "../../modules/service_account"
  project_id   = var.project_id
  account_id   = "github-actions-firebase-deploy"
  display_name = "GitHub Actions Firebase Deploy"
  description  = "Deploy Firebase Functions from GitHub Actions."
  project_roles = [
    "roles/firebase.admin",
    "roles/cloudfunctions.admin",
    "roles/iam.serviceAccountUser",
    "roles/run.admin",
    "roles/cloudbuild.builds.editor",
    "roles/artifactregistry.admin",
  ]
}
