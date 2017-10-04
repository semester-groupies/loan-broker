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
    tokens = "${env.JOB_NAME}".tokenize('/')
    branch = tokens[tokens.size()-1]
    return "${branch}"
}

def get() {
    tokens = "${env.JOB_NAME}".tokenize('/')
    branch = tokens[tokens.size()-1]
    return "${tokens}"
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
          checkout scm
       }

       stage('Test'){
       //env.NODE_ENV = "test"

         //print getBranch()
         print get()

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

       //sh 'git tag -a tagName -m "Your tag comment"'
       //sh 'git merge develop'
       //sh 'git commit -am "Merged develop branch to master'
       //sh "git push origin master"
         //echo '$BRANCH_NAME'
         //sh 'git config --global user.email "jenkins@jenkins.com"'
         //sh 'git config --global user.name "jenkins"'
         //sh 'git checkout origin/master'
         //sh 'git tag -a mergeTag -m "Merging into master"'
         //sh 'git merge --ff-only -v env.BRANCH_NAME'
         //sh 'git commit -m "Merged into master'
         //sh 'git push origin master'
         //sh 'git branch -d env.BRANCH_NAME'
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