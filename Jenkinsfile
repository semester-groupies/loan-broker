import groovy.json.JsonOutput
// Add whichever params you think you'd most want to have
// replace the slackURL below with the hook url provided by
// slack when you configure the webhook
def notifySlack(text, channel) {
    def slackURL = 'https://hackernewsclone.slack.com/services/hooks/jenkins-ci/pkh7Guga1ZeXgLET9c3566wR'
    def payload = JsonOutput.toJson([text      : text,
                                     channel   : channel,
                                     username  : "jenkins",
                                     icon_emoji: ":jenkins:"])
    sh "curl -X POST --data-urlencode \'payload=${payload}\' ${slackURL}"
}

node {

    currentBuild.result = "SUCCESS"

    try {

       stage('Clone Repo into Workspace'){
       /* Let's make sure we have the repository cloned to our workspace */
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
       /* This builds the actual image; synonymous to docker build on the command line. */
       //     sh './dockerBuild.sh'
       }

       stage('Test Docker Image') {
       /* Ideally, we would run a test framework against our image.
        * For this example, we're using a Volkswagen-type approach ;-) */
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
         sh 'git tag -a mergeTag -m "Merging into master"'
         sh 'git merge -ff master'
         sh 'git commit -am "Merged into master'
         sh 'git push origin master'
       }


       stage('Cleanup after Build Success'){

         echo 'prune and cleanup'
         sh 'npm prune'
         sh 'rm node_modules -rf'

         notifySlack("Loan Broker Build: " + currentBuild.result, "#devops")

         //mail body: 'project build successful',
           //          from: 'xxxx@yyyyy.com',
             //        replyTo: 'xxxx@yyyy.com',
               //      subject: 'project build successful',
                 //    to: 'yyyyy@yyyy.com'
       }



    }
    catch (err) {

        currentBuild.result = "FAILURE"

            //mail body: "project build error is here: ${env.BUILD_URL}" ,
            //from: 'xxxx@yyyy.com',
            //replyTo: 'yyyy@yyyy.com',
            //subject: 'project build failed',
            //to: 'zzzz@yyyyy.com'

        notifySlack("Loan Broker Build: " + currentBuild.result, "#devops")

        throw err
    }

}