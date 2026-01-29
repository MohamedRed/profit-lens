variable "project_id" {
  description = "GCP project ID for the environment."
  type        = string
}

variable "region" {
  description = "Primary GCP region."
  type        = string
  default     = "us-central1"
}

variable "environment_name" {
  description = "Identifier for the deployment environment (e.g., dev)."
  type        = string
  default     = "dev"
}

variable "network_name" {
  description = "VPC name for the runner network."
  type        = string
  default     = "profit-lens-dev"
}

variable "subnet_cidr_range" {
  description = "CIDR range for the runner subnet."
  type        = string
  default     = "10.60.0.0/24"
}

variable "runner_repo" {
  description = "GitHub repo in org/name format."
  type        = string
  default     = "MohamedRed/profit-lens"
}

variable "runner_zone" {
  description = "GCP zone for the runner VM (defaults to region-b)."
  type        = string
  default     = ""
}

variable "runner_machine_type" {
  description = "Machine type for the runner VM."
  type        = string
  default     = "e2-standard-4"
}

variable "runner_version" {
  description = "GitHub Actions runner version."
  type        = string
  default     = "2.316.1"
}

variable "runner_extra_labels" {
  description = "Additional runner labels to register."
  type        = list(string)
  default     = []
}
