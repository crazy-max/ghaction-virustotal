target "_common" {
  args = {
    BUILDKIT_CONTEXT_KEEP_GIT_DIR = 1
  }
}

group "default" {
  targets = ["build"]
}

group "pre-checkin" {
  targets = ["vendor", "format", "build"]
}

group "validate" {
  targets = ["lint", "build-validate", "vendor-validate"]
}

target "build" {
  dockerfile = "dev.Dockerfile"
  target = "build-update"
  output = ["."]
}

target "build-validate" {
  inherits = ["_common"]
  dockerfile = "dev.Dockerfile"
  target = "build-validate"
  output = ["type=cacheonly"]
}

target "format" {
  dockerfile = "dev.Dockerfile"
  target = "format-update"
  output = ["."]
}

target "lint" {
  dockerfile = "dev.Dockerfile"
  target = "lint"
  output = ["type=cacheonly"]
}

target "vendor" {
  dockerfile = "dev.Dockerfile"
  target = "vendor-update"
  output = ["."]
}

target "vendor-validate" {
  inherits = ["_common"]
  dockerfile = "dev.Dockerfile"
  target = "vendor-validate"
  output = ["type=cacheonly"]
}

variable "GITHUB_REPOSITORY" {
  default = "crazy-max/ghaction-virustotal"
}

target "test" {
  dockerfile = "dev.Dockerfile"
  args = {
    GITHUB_REPOSITORY = GITHUB_REPOSITORY
  }
  target = "test-coverage"
  output = ["./coverage"]
  secret = [
    "id=GITHUB_TOKEN,env=GITHUB_TOKEN",
    "id=VT_API_KEY,env=VT_API_KEY",
    "id=VT_MONITOR_API_KEY,env=VT_MONITOR_API_KEY"
  ]
}

target "test-local" {
  inherits = ["test"]
  secret = [
    "id=GITHUB_TOKEN,src=.dev/.ghtoken",
    "id=VT_API_KEY,src=.dev/.vtapikey",
    "id=VT_MONITOR_API_KEY,src=.dev/.vtmonitorapikey"
  ]
}
