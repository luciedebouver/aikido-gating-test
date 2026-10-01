pipeline {
  agent any
  environment {
    AIKIDO_API_KEY = credentials('aikido-local-scanner-api-key')
  }
  stages {
    stage('Aikido scan') {
      steps {
        sh '''docker run --rm --volumes-from jenkins -w "$WORKSPACE" aikidosecurity/local-scanner \
          scan "$WORKSPACE" --apikey "$AIKIDO_API_KEY" \
          --repositoryname aikido-gating-test --branchname main \
          --fail-on critical --gating-result-output aikido-gating.json'''
      }
    }
  }
  post {
    always {
      archiveArtifacts artifacts: 'aikido-gating.json', allowEmptyArchive: true
    }
  }
}
