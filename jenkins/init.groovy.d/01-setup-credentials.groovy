// Initialize Jenkins credentials
import jenkins.model.Jenkins
import com.cloudbees.plugins.credentials.CredentialsProvider
import com.cloudbees.plugins.credentials.domains.Domain
import com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl
import org.jenkinsci.plugins.plaincredentials.impl.StringCredentialsImpl
import hudson.util.Secret

def jenkins = Jenkins.getInstance()
def credentialsStore = jenkins.getExtensionList('com.cloudbees.plugins.credentials.SystemCredentialsProvider')[0].getStore()
def domain = Domain.global()

// Example: Add Docker Registry credentials
// Modify these values or add more credentials as needed

def addCredential(credentialId, username, password, description) {
    def existingCred = credentialsStore.getCredentials(domain).find { it.id == credentialId }
    
    if (existingCred) {
        println("Credential ${credentialId} already exists, skipping...")
        return
    }
    
    def cred = new UsernamePasswordCredentialsImpl(
        CredentialsScope.GLOBAL,
        credentialId,
        description,
        username,
        password
    )
    
    credentialsStore.addCredentials(domain, cred)
    println("Added credential: ${credentialId}")
}

def addStringCredential(credentialId, secret, description) {
    def existingCred = credentialsStore.getCredentials(domain).find { it.id == credentialId }
    
    if (existingCred) {
        println("Credential ${credentialId} already exists, skipping...")
        return
    }
    
    def cred = new StringCredentialsImpl(
        CredentialsScope.GLOBAL,
        credentialId,
        description,
        Secret.fromString(secret)
    )
    
    credentialsStore.addCredentials(domain, cred)
    println("Added string credential: ${credentialId}")
}

// Add sample credentials - replace with your actual values
addCredential("docker-credentials", "your-docker-username", "your-docker-password", "Docker Registry Credentials")
addStringCredential("docker-registry-url", "docker.io/your-registry", "Docker Registry URL")
addStringCredential("github-token", "your-github-token", "GitHub Personal Access Token")

jenkins.save()
println("Credentials initialization completed")
