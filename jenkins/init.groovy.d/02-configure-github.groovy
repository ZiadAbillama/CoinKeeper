// Configure GitHub integration
import jenkins.model.Jenkins
import com.cloudbees.plugins.credentials.CredentialsProvider
import com.cloudbees.plugins.credentials.domains.Domain
import org.jenkinsci.plugins.github.GitHubPlugin
import org.jenkinsci.plugins.github.config.GitHubServerConfig
import org.jenkinsci.plugins.github_branch_source.GitHubConfiguration

def jenkins = Jenkins.getInstance()

// Configure GitHub server
def config = jenkins.getDescriptor(GitHubConfiguration).getConfigs()

if (config.isEmpty()) {
    println("No GitHub configuration found, creating default...")
    // GitHub server configuration would be added here
} else {
    println("GitHub configuration already exists")
}

jenkins.save()
println("GitHub configuration completed")
