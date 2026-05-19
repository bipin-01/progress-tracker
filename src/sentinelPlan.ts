export type SentinelWorkspace = "overview" | "live" | "engines" | "reports" | "knowledge";

export type SentinelEngine = {
  id: string;
  title: string;
  role: string;
  problem: string;
  operatingRule: string;
  latency: string;
  confidence: number;
  chain: Array<{
    label: string;
    instruction: string;
    output: string;
  }>;
  guardrails: string[];
  mentorNote: string;
};

export const sentinelWorkspaces: Array<{ id: SentinelWorkspace; label: string; metric: string; detail: string }> = [
  {
    id: "overview",
    label: "Overview",
    metric: "500",
    detail: "shift alerts modeled",
  },
  {
    id: "live",
    label: "Live SOC",
    metric: "30s",
    detail: "triage target",
  },
  {
    id: "engines",
    label: "Engines",
    metric: "5",
    detail: "prompt-chain specialists",
  },
  {
    id: "reports",
    label: "Reports",
    metric: "5m",
    detail: "review-ready incident report",
  },
  {
    id: "knowledge",
    label: "Knowledge",
    metric: "loop",
    detail: "closed incidents become context",
  },
];

export const sentinelOperatingMetrics = [
  {
    label: "raw alert volume",
    value: "500",
    detail: "typical shift intake before reasoning or suppression",
  },
  {
    label: "noise candidate",
    value: "490",
    detail: "false positives, known benign behavior, and low-fidelity rules",
  },
  {
    label: "investigate",
    value: "9",
    detail: "real but lower-priority alerts needing evidence and notes",
  },
  {
    label: "critical miss",
    value: "1",
    detail: "the breach hidden inside uniform queue pressure",
  },
];

export const sentinelFailureModes = [
  {
    title: "Alert fatigue",
    root: "Everything looks identical after hour six.",
    fix: "Normalize, score, and suppress noise with logged reasons so attention returns to the few alerts that matter.",
  },
  {
    title: "Context gap",
    root: "An alert says IP, host, rule, and timestamp, but not what those mean inside this organization.",
    fix: "Attach asset criticality, history, previous incidents, and environment-specific knowledge before the analyst starts.",
  },
  {
    title: "Knowledge silos",
    root: "The analyst who understood the network left, and the tribal memory left with them.",
    fix: "Turn every closed incident into reusable institutional memory for future triage and investigation.",
  },
  {
    title: "Report burden",
    root: "Analysts spend too much time making the ticket readable instead of making the environment safer.",
    fix: "Generate executive, technical, IOC, containment, and lesson-learned sections from validated notes.",
  },
  {
    title: "Escalation anxiety",
    root: "Junior analysts hesitate because being wrong has social cost.",
    fix: "Use a binary decision framework that separates evidence, risk, authority, and delay cost.",
  },
];

export const sentinelArchitectureLayers = [
  {
    layer: "SIEM and log sources",
    responsibility: "Collect raw alerts, EDR signals, firewall logs, identity events, cloud audit trails, and endpoint telemetry.",
    failureRisk: "Data exists, but it arrives in different shapes and without a consistent analyst decision frame.",
  },
  {
    layer: "Ingestion layer",
    responsibility: "Normalize CEF, LEEF, JSON, Syslog, and vendor-specific payloads into structured security fields.",
    failureRisk: "Missing fields must stay visible as UNKNOWN instead of being guessed by the AI.",
  },
  {
    layer: "SENTINEL core",
    responsibility: "Run triage, investigation, correlation, reporting, and escalation prompt chains with auditable outputs.",
    failureRisk: "The system must recommend and explain, never silently decide or take destructive action.",
  },
  {
    layer: "Analyst dashboard",
    responsibility: "Surface the right next action for L1, L2, L3, managers, hunters, and incident commanders.",
    failureRisk: "Too much information becomes another SIEM. The dashboard must reduce cognitive load.",
  },
  {
    layer: "Human decision",
    responsibility: "Analyst validates evidence, approves actions, escalates incidents, and owns final judgment.",
    failureRisk: "Removing the human breaks trust, auditability, and operational safety.",
  },
];

export const sentinelEngines: SentinelEngine[] = [
  {
    id: "triage",
    title: "Engine 1: Triage",
    role: "Noise reduction and severity scoring",
    problem: "Alert fatigue turns 500 alerts into one flat queue where the breach looks no different from a scanner false positive.",
    operatingRule: "Normalize first, enrich second, score last. Never score from raw vendor text alone.",
    latency: "< 3 sec",
    confidence: 91,
    chain: [
      {
        label: "Normalize",
        instruction: "Convert raw SIEM alert text into source IP, destination IP, port, protocol, timestamp, affected asset, rule name, and raw sample. Missing fields are UNKNOWN.",
        output: "A stable alert object that can be compared across vendors.",
      },
      {
        label: "Enrich",
        instruction: "Classify source as internal or external, asset as critical or standard, recurrence over 24h, and rule false-positive history.",
        output: "Short context tags that explain why this alert matters here.",
      },
      {
        label: "Score",
        instruction: "Return severity, confidence, and one-sentence reason as JSON only.",
        output: "Noise auto-close candidate or investigation handoff packet.",
      },
    ],
    guardrails: [
      "No auto-close without a logged reason.",
      "No severity upgrade without evidence.",
      "UNKNOWN fields lower confidence instead of being hallucinated.",
    ],
    mentorNote: "A great triage engine is boring in the best way: predictable, auditable, and ruthless about missing context.",
  },
  {
    id: "investigation",
    title: "Engine 2: Investigation",
    role: "Senior analyst brief before the ticket opens",
    problem: "Junior analysts start from a blank page and lose time deciding what evidence even matters.",
    operatingRule: "Give hypotheses, evidence, MITRE mapping, blast radius, and a five-minute action. No vague advice.",
    latency: "< 10 sec",
    confidence: 88,
    chain: [
      {
        label: "Hypothesize",
        instruction: "List the top three explanations ranked by probability, including benign and malicious possibilities.",
        output: "A decision tree the analyst can validate instead of inventing under pressure.",
      },
      {
        label: "Evidence",
        instruction: "Name exact logs, fields, artifacts, and values that confirm or deny each hypothesis.",
        output: "A concrete evidence checklist for SIEM, EDR, IAM, network, and endpoint pivots.",
      },
      {
        label: "Action",
        instruction: "Map to ATT&CK, name blast radius, and select one action to perform in the next five minutes.",
        output: "Investigation brief with urgency and scope.",
      },
    ],
    guardrails: [
      "Evidence beats suspicion.",
      "Blast radius must name assets, identities, and systems at risk.",
      "The next action must be executable by the analyst receiving the ticket.",
    ],
    mentorNote: "The best analysts do not ask 'what is this alert?' They ask 'what would prove me wrong fastest?'",
  },
  {
    id: "correlation",
    title: "Engine 3: Correlation",
    role: "Find the breach hiding between alerts",
    problem: "A single alert rarely tells the story. The story appears across assets, identities, time, and repeated low-signal events.",
    operatingRule: "Every 15 minutes, group active alerts by asset and search for attack-chain movement, not isolated severity.",
    latency: "15m batch",
    confidence: 84,
    chain: [
      {
        label: "Group",
        instruction: "Cluster recent alerts by asset, identity, source, destination, tactic, and time distance.",
        output: "A timeline that reveals sequences instead of a flat queue.",
      },
      {
        label: "Pattern",
        instruction: "Look for recon to exploit, credential abuse, lateral movement, staging, and exfiltration indicators.",
        output: "Coordinated activity candidates with narrative order.",
      },
      {
        label: "Forecast",
        instruction: "Explain what happened first, what happened next, and what is likely to happen next. Output CLEAR if no pattern exists.",
        output: "Hunter narrative for the analyst and SOC lead.",
      },
    ],
    guardrails: [
      "CLEAR is acceptable and valuable.",
      "Narratives must cite the alert sequence they came from.",
      "Do not convert coincidence into a campaign without temporal or asset linkage.",
    ],
    mentorNote: "The breach is usually not the loudest alert. It is the quiet relationship between three mediocre ones.",
  },
  {
    id: "report",
    title: "Engine 4: Report",
    role: "Incident report generation",
    problem: "SOC work is slowed by the need to translate messy notes into executive and technical artifacts.",
    operatingRule: "Generate a draft from validated notes, then require analyst review before export.",
    latency: "< 30 sec",
    confidence: 93,
    chain: [
      {
        label: "Separate audiences",
        instruction: "Write an executive summary with zero jargon and a technical timeline with exact timestamps.",
        output: "Two layers: leadership clarity and analyst-grade evidence.",
      },
      {
        label: "Extract artifacts",
        instruction: "Format IOCs, containment actions, root cause, recommendations, and lessons learned.",
        output: "Report sections that are ready for review, not final authority.",
      },
      {
        label: "Harden language",
        instruction: "Recommendations start with verbs. Lessons learned must be honest, specific, and not PR language.",
        output: "A report that drives action instead of decoration.",
      },
    ],
    guardrails: [
      "No invented timestamps.",
      "No paraphrased IOC values.",
      "No final report without analyst approval.",
    ],
    mentorNote: "A report is not paperwork. It is how the organization remembers pain accurately enough to avoid repeating it.",
  },
  {
    id: "escalation",
    title: "Engine 5: Escalation",
    role: "Decision support for junior analysts",
    problem: "Escalation quality is inconsistent because analysts balance fear, uncertainty, authority, and risk in their heads.",
    operatingRule: "Answer five binary questions, then return ESCALATE NOW, INVESTIGATE FIRST, or CLOSE FALSE POSITIVE.",
    latency: "< 5 sec",
    confidence: 89,
    chain: [
      {
        label: "Evidence",
        instruction: "Does evidence clearly point to malicious activity? Answer yes or no with one sentence.",
        output: "A clean separation between suspicion and proof.",
      },
      {
        label: "Risk",
        instruction: "Is damage continuing, and would a 30-minute delay meaningfully increase risk?",
        output: "A time-pressure assessment that senior analysts can trust.",
      },
      {
        label: "Authority",
        instruction: "Does this require access or authority the analyst lacks, and have self-service steps been exhausted?",
        output: "A direct escalation recommendation and reason.",
      },
    ],
    guardrails: [
      "Escalation advice is a recommendation, not an automatic page.",
      "Every yes or no needs one sentence of evidence.",
      "When risk is active and authority is missing, escalate immediately.",
    ],
    mentorNote: "Escalation is not about ego. It is about time, blast radius, and who has the keys to stop the bleeding.",
  },
];

export const sentinelLiveAlerts = [
  {
    id: "A-1048",
    severity: "Critical",
    title: "Encoded PowerShell after browser download",
    asset: "FIN-WKS-014",
    source: "chrome.exe -> powershell.exe -> rundll32.exe",
    reason: "Rare parent-child process chain on finance workstation with missing decoded command.",
    engine: "triage",
  },
  {
    id: "A-1052",
    severity: "High",
    title: "Impossible travel followed by mailbox export",
    asset: "M365: cfo@company.test",
    source: "Identity + cloud audit",
    reason: "Login geography anomaly followed by privileged mailbox action within nine minutes.",
    engine: "correlation",
  },
  {
    id: "A-1058",
    severity: "Medium",
    title: "Repeated VPN failure from known employee device",
    asset: "VPN-GW-02",
    source: "vpn-auth",
    reason: "User error likely, but pattern is retained for credential spraying correlation.",
    engine: "triage",
  },
  {
    id: "A-1061",
    severity: "Noise",
    title: "Scheduled vulnerability scanner port sweep",
    asset: "SCAN-01",
    source: "internal scanner",
    reason: "Matches approved scanner window and known service account.",
    engine: "triage",
  },
];

export const sentinelImpactMetrics = [
  {
    label: "triage time",
    before: "8-12m",
    after: "< 30s",
  },
  {
    label: "junior effectiveness",
    before: "~40%",
    after: "~75%",
  },
  {
    label: "critical miss rate",
    before: "~20%",
    after: "< 5%",
  },
  {
    label: "report time",
    before: "45m",
    after: "< 5m",
  },
  {
    label: "escalation noise",
    before: "high",
    after: "-60%",
  },
];

export const sentinelRubric: Array<{ label: string; current: number; target: number; focus: string }> = [
  { label: "Visual hierarchy", current: 5, target: 9, focus: "Severity must be scannable in under one second." },
  { label: "Typography", current: 4, target: 9, focus: "Log data stays monospace; command language stays readable." },
  { label: "Motion and feedback", current: 3, target: 9, focus: "Every async action needs loading, result, and review state." },
  { label: "Information density", current: 4, target: 9, focus: "L1 sees next action; L2/L3 sees evidence depth." },
  { label: "Color system", current: 5, target: 9, focus: "Critical, high, medium, low, and noise must be instantly distinct." },
  { label: "Empty states", current: 2, target: 9, focus: "No alerts is a success state, not a blank screen." },
  { label: "Edge cases", current: 3, target: 9, focus: "Handle 0 alerts and 10,000 alerts with the same calm structure." },
  { label: "Consistency", current: 5, target: 9, focus: "Same action means same visual pattern across all engines." },
];

export const sentinelBuildPhases = [
  {
    phase: "Phase 1",
    title: "Static SOC simulator",
    scope: "Design the analyst dashboard, engine cards, triage schema, incident report template, and escalation framework.",
  },
  {
    phase: "Phase 2",
    title: "Prompt-chain execution",
    scope: "Connect LLM calls with structured JSON outputs, validation, retry rules, and audit logs.",
  },
  {
    phase: "Phase 3",
    title: "Telemetry integration",
    scope: "Ingest sample SIEM, EDR, identity, firewall, and cloud logs through a normalized alert contract.",
  },
  {
    phase: "Phase 4",
    title: "Knowledge memory",
    scope: "Feed closed incidents, suppressions, and analyst decisions back into environment-specific context.",
  },
  {
    phase: "Phase 5",
    title: "SOC-ready review",
    scope: "Add evaluation harnesses, red-team prompts, analyst approval states, and exportable capstone artifacts.",
  },
];

export const sentinelKnowledgeLoops = [
  {
    signal: "Closed incident",
    memory: "Timeline, root cause, IOCs, containment, recommendations, and final analyst decision.",
  },
  {
    signal: "False positive",
    memory: "Why it was benign, which asset or schedule made it safe, and what would make it suspicious next time.",
  },
  {
    signal: "Escalation decision",
    memory: "Which binary answers drove the recommendation and whether the escalation was accepted.",
  },
  {
    signal: "Suppression rule",
    memory: "Owner, expiry, evidence, and rollback criteria so noise reduction does not become blindness.",
  },
];
