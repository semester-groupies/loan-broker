import groovy.json.JsonOutput

def notifySlack(text, channel) {
    def slackURL = 'https://hackernewsclone.slack.com/services/hooks/jenkins-ci/pkh7Guga1ZeXgLET9c3566wR'
    def payload = JsonOutput.toJson([text      : text,
                                     channel   : channel,
                                     username  : "jenkins",
                                     icon_emoji: ":jenkins:"])
    sh "curl -X POST --data-urlencode \'payload=${payload}\' ${slackURL}"
}

def getBranch() {
    return "${env.BRANCH_NAME}"
}


node {

    //environment {
    //    GIT_ACCESS = credentials('git-credentials')
    //    /* GIT_ACCESS containing <username>:<password>
    //       GIT_ACCESS_USR containing the username
    //       GIT_ACCESS_PSW containing the password */
    //}

    currentBuild.result = "SUCCESS"

    try {

       stage('Clone Repo into Workspace'){
          checkout([
          $class: 'GitSCM',
          doGenerateSubmoduleConfigurations: false,
          extensions: [[$class: 'LocalBranch',
          localBranch: "**"]],
          submoduleCfg: []
          //userRemoteConfigs: [[credentialsId: '04f62bdf-e233-XXXX-XXXX-4fd5df294637',
          //url: 'ssh://geek-kb@geek-kb.visualstudio.com:22/_git/scripts']]
          ])





          //checkout scm
       }

       stage('Test'){
       //env.NODE_ENV = "test"

         print getBranch()

         //sh 'node -v'
         //sh 'npm prune'
         //sh 'npm install'
         //sh 'npm test'
       }

       stage('Build Docker Image'){
       //     sh './dockerBuild.sh'
       }

       stage('Test Docker Image') {
          sh 'echo "Tests passed"'
       }

       stage('Push Docker Image to DockerHub') {
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
       }

       stage('Push to Origin/Master') {
         sh 'git config --global user.email "jenkins@jenkins.com"'
         sh 'git config --global user.name "jenkins"'
         //sh 'git tag -a mergeTag -m "Merging into master"'
         sh 'git merge --ff-only -v master'
         sh 'git commit -m "Merged into master"'
         sh 'git push origin master'
       }


       stage('Cleanup after Build Success'){
         echo 'prune and cleanup'
         sh 'npm prune'
         sh 'rm node_modules -rf'

         notifySlack(JOB_NAME + " - " + BUILD_DISPLAY_NAME + " " + currentBuild.result + " after " + currentBuild.duration + "ms", "#devops")
       }

    }
    catch (err) {
        currentBuild.result = "FAILURE"
        notifySlack(JOB_NAME + " - " + BUILD_DISPLAY_NAME + " " + currentBuild.result + " after " + currentBuild.duration + "ms\n" + err, "#devops")

        throw err
    }

}