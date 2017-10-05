#!groovy
import groovy.json.JsonOutput
import groovy.json.JsonSlurper

def notifySlack(text, channel) {
    def slackURL = 'https://hackernewsclone.slack.com/services/hooks/jenkins-ci/pkh7Guga1ZeXgLET9c3566wR'
    def payload = JsonOutput.toJson([text      : text,
                                     channel   : channel,
                                     username  : "jenkins",
                                     icon_emoji: ":jenkins:"])
    sh "curl -X POST --data-urlencode \'payload=${payload}\' ${slackURL}"
}

node {
    tokens = "${env.JOB_NAME}".tokenize('/')
    org = tokens[tokens.size()-3]
    repo = tokens[tokens.size()-2]
    branch = tokens[tokens.size()-1]

    // pull request or feature branch
    if  (env.BRANCH_NAME != 'master') {
        checkout()
        build()
        //test()
        merge()
    } // master branch / production
    else {
        checkout()
        build()
        //test()
        //dockerDeploy()
        //production()
    }
}

def isPRMergeBuild() {
    return (env.BRANCH_NAME ==~ /^PR-\d+$/)
}

def checkout () {
    stage ('Checkout code') {
        print env.BRANCH_NAME
        context="continuous-integration/jenkins/"
        // context += isPRMergeBuild()?"branch/checkout":"pr-merge/checkout"
        // newer versions of Jenkins do not seem to support setting custom statuses before running the checkout scm step ...
        // setBuildStatus ("${context}", 'Checking out...', 'PENDING')

        checkout changelog: true, poll: true,
        scm: [$class: 'GitSCM',
        branches: [[name: 'origin/ready/**']],
        doGenerateSubmoduleConfigurations: false, extensions: [[$class: 'PreBuildMerge',
        options: [fastForwardMode: 'FF_ONLY', mergeRemote: 'origin',
        mergeStrategy: "DEFAULT",
        mergeTarget: 'master']], [$class: 'CleanBeforeCheckout']], submoduleCfg: [],
        userRemoteConfigs: [[credentialsId: 'git-credentials', name: 'origin',
        url: 'https://github.com/semester-groupies/loan-broker.git']]]

        setBuildStatus ("${context}", 'Checking out completed', 'SUCCESS')
    }
}

def build () {
    stage ('Build') {
        env.NODE_ENV = "test"
        sh 'node -v'
        sh 'npm prune'
        sh 'npm install'
    }
}


def unitTest() {
    stage 'Unit tests'
    mvn 'test -B -Dmaven.javadoc.skip=true -Dcheckstyle.skip=true'
    step([$class: 'JUnitResultArchiver', testResults: '**/target/surefire-reports/TEST-*.xml'])
    if (currentBuild.result == "UNSTABLE") {
        sh "exit 1"
    }
}

def merge() {
    stage ('Merging with master branch') {
        print env.BRANCH_NAME

        //withCredentials([usernamePassword(credentialsId: 'git-credentials', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
        //    sh("git tag -a tag_$BUILD_ID -m 'Jenkins'")
        //    sh('git push https://${GIT_USERNAME}:${GIT_PASSWORD}@https://github.com/semester-groupies/loan-broker.git --tags')
        //}

        sshagent (credentials: ['jenkins-ssh']) {
            sh 'git fetch'
            sh 'git branch -a'
            sh 'git checkout master'
            sh 'git merge --ff-only -v ' + env.BRANCH_NAME
            sh 'git commit -m "Merged into master"'
            sh("git tag -a tag_$BUILD_ID -m 'Jenkins'")
            sh('git push git@github.com:semester-groupies/loan-broker.git --tags')
        }

        //sh 'git push origin master'
    }
}

def preProduction() {
    herokuApp = "${env.HEROKU_PREPRODUCTION}"
    deployToStage("preproduction", herokuApp)
}

def manualPromotion() {
  stage 'Manual Promotion'
    // we need a first milestone step so that all jobs entering this stage are tracked an can be aborted if needed
    milestone 1
    // time out manual approval after ten minutes
    timeout(time: 10, unit: 'MINUTES') {
        input message: "Does Pre-Production look good?"
    }
    // this will kill any job which is still in the input step
    milestone 2
}

def production() {
    herokuApp = "${env.HEROKU_PRODUCTION}"
    deployToStage("production", herokuApp)
    step([$class: 'ArtifactArchiver', artifacts: '**/target/*.jar', fingerprint: true])
}

def deployToStage(stageName, herokuApp) {
    stage name: "Deploy to ${stageName}", concurrency: 1
    id = createDeployment(getBranch(), "${stageName}", "Deploying branch to ${stageName}")
    echo "Deployment ID for ${stageName}: ${id}"
    if (id != null) {
        setDeploymentStatus(id, "pending", "https://${herokuApp}.herokuapp.com/", "Pending deployment to ${stageName}");
        herokuDeploy "${herokuApp}"
        setDeploymentStatus(id, "success", "https://${herokuApp}.herokuapp.com/", "Successfully deployed to ${stageName}");
    }
}

def herokuDeploy (herokuApp) {
    withCredentials([[$class: 'StringBinding', credentialsId: 'HEROKU_API_KEY', variable: 'HEROKU_API_KEY']]) {
        mvn "heroku:deploy -DskipTests=true -Dmaven.javadoc.skip=true -B -V -D heroku.appName=${herokuApp}"
    }
}

def mvn(args) {
    // point to settings.xml with cached .m2 directory and proceed in case of test failures
    sh "${tool 'Maven 3.x'}/bin/mvn -s settings.xml ${args} -Dmaven.test.failure.ignore"
}

def shareM2(file) {
    // Set up a shared Maven repo so we don't need to download all dependencies on every build.
    writeFile file: 'settings.xml',
    text: "<settings><localRepository>${file}</localRepository></settings>"
}

def getRepoSlug() {
    tokens = "${env.JOB_NAME}".tokenize('/')
    org = tokens[tokens.size()-3]
    repo = tokens[tokens.size()-2]
    return "${org}/${repo}"
}

def getBranch() {
    tokens = "${env.JOB_NAME}".tokenize('/')
    branch = tokens[tokens.size()-1]
    return "${branch}"
}

def createDeployment(ref, environment, description) {
    withCredentials([[$class: 'StringBinding', credentialsId: 'GITHUB_TOKEN', variable: 'GITHUB_TOKEN']]) {
        def payload = JsonOutput.toJson(["ref": "${ref}", "description": "${description}", "environment": "${environment}", "required_contexts": []])
        def apiUrl = "https://octodemo.com/api/v3/repos/${getRepoSlug()}/deployments"
        def response = sh(returnStdout: true, script: "curl -s -H \"Authorization: Token ${env.GITHUB_TOKEN}\" -H \"Accept: application/json\" -H \"Content-type: application/json\" -X POST -d '${payload}' ${apiUrl}").trim()
        def jsonSlurper = new JsonSlurper()
        def data = jsonSlurper.parseText("${response}")
        return data.id
    }
}

void setDeploymentStatus(deploymentId, state, targetUrl, description) {
    withCredentials([[$class: 'StringBinding', credentialsId: 'GITHUB_TOKEN', variable: 'GITHUB_TOKEN']]) {
        def payload = JsonOutput.toJson(["state": "${state}", "target_url": "${targetUrl}", "description": "${description}"])
        def apiUrl = "https://octodemo.com/api/v3/repos/${getRepoSlug()}/deployments/${deploymentId}/statuses"
        def response = sh(returnStdout: true, script: "curl -s -H \"Authorization: Token ${env.GITHUB_TOKEN}\" -H \"Accept: application/json\" -H \"Content-type: application/json\" -X POST -d '${payload}' ${apiUrl}").trim()
    }
}

void setBuildStatus(context, message, state) {
// partially hard coded URL because of https://issues.jenkins-ci.org/browse/JENKINS-36961, adjust to your own GitHub instance
    step([
      $class: "GitHubCommitStatusSetter",
      contextSource: [$class: "ManuallyEnteredCommitContextSource", context: context],
      errorHandlers: [[$class: "ChangingBuildStatusErrorHandler", result: "UNSTABLE"]],
      reposSource: [$class: "ManuallyEnteredRepositorySource", url: "https://github.com/${getRepoSlug()}"],
      statusResultSource: [ $class: "ConditionalStatusResultSource", results: [[$class: "AnyBuildResult", message: message, state: state]] ]
  ]);
}

//node {

//    currentBuild.result = "SUCCESS"

//    try {

//       stage('Clone Repo into Workspace'){
//          checkout scm
//       }

//       stage('Test'){
//         env.NODE_ENV = "test"
//         sh 'node -v'
//         sh 'npm prune'
//         sh 'npm install'
//         sh 'npm test'
//       }

//       stage('Build Docker Image'){
       //     sh './dockerBuild.sh'
//       }

//       stage('Test Docker Image') {
//          print getBranch()
//          sh 'echo "Tests passed"'
//       }

//       stage('Push Docker Image to DockerHub') {
               /* Finally, we'll push the image with two tags:
                * First, the incremental build number from Jenkins
                * Second, the 'latest' tag.
                * Pushing multiple tags is cheap, as all the layers are reused. */
         //docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
         //   app.push("${env.BUILD_NUMBER}")
         //   app.push("latest")
         //}
       //stage('Deploy'){

       //  echo 'Push to Repo'
       //  sh './dockerPushToRepo.sh'

       //  echo 'ssh to web server and tell it to pull new image'
       //  sh 'ssh deploy@xxxxx.xxxxx.com running/xxxxxxx/dockerRun.sh'

       //}
//       }

  //     stage('Push to Origin/Master') {
//         sh 'git config --global user.email "jenkins@jenkins.com"'
//         sh 'git config --global user.name "jenkins"'
//         sh 'git remote -v'
//         sh 'git fetch origin'
//         sh 'git checkout master'
         //sh 'git tag -a mergeTag -m "Merging into master"'
//         sh 'git merge --ff-only -v ' + getBranch()
//         sh 'git commit -m "Merged into master"'
//         sh 'git push origin master'
//       }


//       stage('Cleanup after Build Success'){
//         echo 'prune and cleanup'
//         sh 'npm prune'
//         sh 'rm node_modules -rf'

//         notifySlack(JOB_NAME + " - " + BUILD_DISPLAY_NAME + " " + currentBuild.result + " after " + currentBuild.duration + "ms", "#devops")
//       }

//    }

//    catch (err) {
//        currentBuild.result = "FAILURE"
//        notifySlack(JOB_NAME + " - " + BUILD_DISPLAY_NAME + " " + currentBuild.result + " after " + currentBuild.duration + "ms\n" + err, "#devops")

//        throw err
//    }

//}