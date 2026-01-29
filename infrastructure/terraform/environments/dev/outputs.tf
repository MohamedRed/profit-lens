output "runner_instance_name" {
  description = "Runner VM instance name."
  value       = module.github_runner_vm.instance_name
}

output "runner_instance_self_link" {
  description = "Runner VM instance self link."
  value       = module.github_runner_vm.instance_self_link
}

output "runner_internal_ip" {
  description = "Runner VM internal IP."
  value       = module.github_runner_vm.internal_ip
}

output "runner_pat_secret_id" {
  description = "Secret Manager ID for the GitHub runner PAT."
  value       = google_secret_manager_secret.github_actions_runner_pat.secret_id
}
