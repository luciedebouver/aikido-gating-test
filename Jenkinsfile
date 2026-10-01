// Aikido LOCAL SCANNER track: code is scanned on the Jenkins node, only results go to Aikido.
pipeline {
  agent any

  parameters {
    choice(name: 'GATING_MODE', choices: ['release', 'pr'],
           description: 'release = whole repo on main | pr = only issues NEW vs main')
    choice(name: 'FEATURE_BRANCH', choices: ['demo/add-vuln', 'demo/clean-change'],
           description: 'Branch scanned in pr mode')
    choice(name: 'FAIL_ON', choices: ['none', 'critical', 'high', 'medium', 'low'],
           description: 'Lowest severity that fails the build. none = report only (no gate)')
    string(name: 'SCAN_TYPES', defaultValue: '',
           description: 'Empty = all. Space-separated subset of: code dependencies iac secrets')
    string(name: 'EXCLUDE', defaultValue: '',
           description: 'Space-separated paths to skip, e.g. infra')
    booleanParam(name: 'SLA_MODE', defaultValue: false,
           description: 'Release mode only: fail only on issues past their fix SLA')
    booleanParam(name: 'INCLUDE_DEV_DEPS', defaultValue: false, description: 'Also scan devDependencies')
    booleanParam(name: 'NO_SNIPPETS', defaultValue: false, description: 'Send no code snippets to Aikido')
    booleanParam(name: 'SECRETS_FULL_HISTORY', defaultValue: false, description: 'Scan full git history for secrets')
    booleanParam(name: 'SCAN_IMAGE', defaultValue: true, description: 'Build and scan the container image')
  }

  environment {
    AIKIDO_API_KEY   = credentials('aikido-local-scanner-api-key')
    AIKIDO_IMAGE_KEY = credentials('aikido-image-scanner-api-key')
    REPO_NAME        = 'aikido-gating-test'
    SCANNER          = 'aikidosecurity/local-scanner'
    IMAGE            = 'aikido-gating-test:latest'
  }

  stages {
    stage('Prepare') {
      steps {
        script {
          env.SCAN_BRANCH = 'main'
          if (params.GATING_MODE == 'pr') {
            if (params.FAIL_ON == 'none') { error('pr mode needs a FAIL_ON severity') }
            sh "git fetch origin '+refs/heads/*:refs/remotes/origin/*'"
            sh "git checkout -B ${params.FEATURE_BRANCH} origin/${params.FEATURE_BRANCH}"
            env.SCAN_BRANCH = params.FEATURE_BRANCH
            env.BASE_COMMIT = sh(script: 'git rev-parse origin/main', returnStdout: true).trim()
            env.HEAD_COMMIT = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
          }
        }
      }
    }

    stage('Aikido code scan') {
      steps {
        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
          script {
            def f = "--repositoryname ${env.REPO_NAME} --branchname ${env.SCAN_BRANCH}"
            if (params.FAIL_ON != 'none') {
              f += " --fail-on ${params.FAIL_ON} --gating-result-output aikido-gating.json"
            }
            if (params.GATING_MODE == 'pr') {
              f += " --gating-mode pr --base-commit-id ${env.BASE_COMMIT} --head-commit-id ${env.HEAD_COMMIT}"
            }
            if (params.SCAN_TYPES?.trim())  { f += " --scan-types ${params.SCAN_TYPES.trim()}" }
            params.EXCLUDE.tokenize().each  { f += " --exclude ${it}" }
            if (params.SLA_MODE)             { f += ' --sla-mode' }
            if (params.INCLUDE_DEV_DEPS)     { f += ' --include-dev-deps' }
            if (params.NO_SNIPPETS)          { f += ' --no-snippets' }
            if (params.SECRETS_FULL_HISTORY) { f += ' --secrets-scanning-full-git-history' }

            // \$ keeps the key out of Groovy string interpolation (and out of the log)
            sh """docker run --rm --volumes-from jenkins -w "\$WORKSPACE" ${env.SCANNER} \\
                    scan "\$WORKSPACE" --apikey "\$AIKIDO_API_KEY" ${f}"""
          }
        }
      }
    }

    stage('Aikido image scan') {
      when { expression { params.SCAN_IMAGE } }
      steps {
        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
          script {
            def f = params.FAIL_ON != 'none' ? "--fail-on ${params.FAIL_ON}" : ''
            sh "docker build -t ${env.IMAGE} ."
            sh """docker run --rm -v /var/run/docker.sock:/var/run/docker.sock ${env.SCANNER} \\
                    image-scan ${env.IMAGE} --apikey "\$AIKIDO_IMAGE_KEY" ${f}"""
          }
        }
      }
    }
  }

  post {
    always { archiveArtifacts artifacts: 'aikido-gating.json', allowEmptyArchive: true }
  }
}
