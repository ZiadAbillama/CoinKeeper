// Jenkins Configuration as Code (JCasC) groovy script
// This configures Jenkins security, credentials, and general settings

import jenkins.model.Jenkins
import hudson.security.HudsonPrivateSecurityRealm
import hudson.security.AuthorizationStrategy
import com.cloudbees.plugins.credentials.CredentialsProvider
import com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl
import org.jenkinsci.plugins.plaincredentials.impl.StringCredentialsImpl
import hudson.util.Secret

def instance = Jenkins.getInstance()

// Configure Jenkins URL
instance.setRootUrl("http://your-jenkins-url:8080/")

// Configure Executors
instance.setNumExecutors(4)
instance.setQuietStartPeriod(0)

// Save configuration
instance.save()

println "Jenkins configuration completed"
