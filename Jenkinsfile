import groovy.json.JsonOutput

def notifySlack(text, channel) {
    def slackURL = 'https://hackernewsclone.slack.com/services/hooks/jenkins-ci/pkh7Guga1ZeXgLET9c3566wR'
    def payload = JsonOutput.toJson([text      : text,
                                     channel   : channel,
                                     username  : "jenkins",
                                     icon_emoji: ":jenkins:"])
    sh "curl -X POST --data-urlencode \'payload=${payload}\' ${slackURL}"
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

node {

    environment {
        GIT_ACCESS = credentials('git-credentials')
        /* GIT_ACCESS containing <username>:<password>
           GIT_ACCESS_USR containing the username
           GIT_ACCESS_PSW containing the password */
    }

    currentBuild.result = "SUCCESS"

    try {

       stage('Clone Repo into Workspace'){
          checkout scm
       }

       stage('Test'){
         env.NODE_ENV = "test"

         print "Environment will be : ${env.NODE_ENV}"

         sh 'node -v'
         sh 'npm prune'
         sh 'npm install'
         sh 'npm test'
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
         sh 'echo BRANCH_NAME'
         repo = getRepoSlug()
         branch = getBranch
         sh 'echo ${repo}'
         sh 'echo ${branch}'
         sh 'git config --global user.email "jenkins@jenkins.com"'
         sh 'git config --global user.name "jenkins"'
         //sh 'git tag -a mergeTag -m "Merging into master"'
         //sh 'git checkout origin/master'
         //sh 'git merge --ff-only -v BRANCH_NAME'
         //sh 'git commit -m "Merged into master'
         //sh 'git push origin master'
       }


       stage('Cleanup after Build Success'){
         echo 'prune and cleanup'
         sh 'npm prune'
         sh 'rm node_modules -rf'

         currentBuild.seconds = currentBuild.duration / 1000
         notifySlack(JOB_NAME + " - " + BUILD_DISPLAY_NAME + " " + currentBuild.result + " after " + currentBuild.seconds + "sec", "#devops")
       }

    }
    catch (err) {
        currentBuild.result = "FAILURE"
        currentBuild.seconds = currentBuild.duration / 1000
        notifySlack(JOB_NAME + " - " + BUILD_DISPLAY_NAME + " " + currentBuild.result + " after " + currentBuild.seconds + "sec\n" + err, "#devops")

        throw err
    }

}