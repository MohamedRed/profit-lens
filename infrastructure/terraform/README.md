# Terraform Infrastructure

Infrastructure-as-code for Profit Lens (GCP). This directory currently provisions a
self-hosted GitHub Actions runner VM similar to the Ordering Intelligence setup.

## Structure

- `modules/` – reusable Terraform modules.
- `environments/` – environment-specific configs (start with `dev`).

## Quick Start (dev)

1. Install Terraform >= 1.7 and authenticate with GCP.
2. Copy the example tfvars:
   - `cp infrastructure/terraform/environments/dev/terraform.tfvars.example infrastructure/terraform/environments/dev/terraform.tfvars`
3. Edit `terraform.tfvars` with your project settings.
4. Create the GitHub PAT secret value (once):
   - `echo -n "<github-pat>" | gcloud secrets versions add github-actions-runner-pat --project "$PROJECT_ID" --data-file=-`
5. Provision:
   - `cd infrastructure/terraform/environments/dev && terraform init && terraform apply`

## Notes

- The runner VM uses Cloud NAT for outbound access to GitHub.
- The PAT needs `repo` + `admin:repo_hook` scopes to register runners.
