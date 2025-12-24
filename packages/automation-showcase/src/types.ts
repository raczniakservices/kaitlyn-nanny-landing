export type AutomationWorkflowId =
    | 'lead_welcome'
    | 'permit_watch'
    | 'friction_audit';

export type AutomationRunStatus = 'success' | 'failed';
export type AutomationStepStatus = 'success' | 'failed' | 'skipped';
export type AutomationArtifactType = 'json' | 'html' | 'text';

export type AutomationArtifact = {
    name: string;
    type: AutomationArtifactType;
    relPath: string; // relative to runDir
    summary?: string;
};

export type AutomationStep = {
    id: string;
    name: string;
    startedAt: string;
    finishedAt: string;
    status: AutomationStepStatus;
    summary: string;
    data?: Record<string, unknown>;
};

export type AutomationRun = {
    id: string;
    workflowId: AutomationWorkflowId;
    title: string;
    dryRun: boolean;
    startedAt: string;
    finishedAt: string;
    status: AutomationRunStatus;
    steps: AutomationStep[];
    artifacts: AutomationArtifact[];
    stats?: Record<string, number>;
};

export type WorkflowDefinition = {
    id: AutomationWorkflowId;
    title: string;
    tagline: string;
};

export type RunAutomationParams = {
    workflowId: AutomationWorkflowId;
    dryRun?: boolean;
    outDir: string; // absolute or repo-relative
    inputs?: Record<string, unknown>;
};

export type RunAutomationResult = {
    run: AutomationRun;
    runDir: string;
};






