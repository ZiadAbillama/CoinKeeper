// Configure Jenkins Pipeline settings
import jenkins.model.Jenkins
import org.jenkinsci.plugins.workflow.flow.FlowDurabilityHint
import org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition

def jenkins = Jenkins.getInstance()

// Get or create pipeline configuration
def globalConfig = jenkins.getExtensionList(org.jenkinsci.plugins.workflow.flow.GlobalDefaultFlowDurabilityLevel)[0]

if (globalConfig) {
    // Set default durability to PERFORMANCE_OPTIMIZED
    globalConfig.setDurabilityHint(FlowDurabilityHint.PERFORMANCE_OPTIMIZED)
    println("Pipeline durability set to PERFORMANCE_OPTIMIZED")
} else {
    println("Pipeline configuration not found")
}

jenkins.save()
println("Pipeline configuration completed")
