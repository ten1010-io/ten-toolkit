---
description: Turn one AIPub product topic (InfiniBand, Workspace, Job, PV/PVC, ClusterVolume, ...) into a two-layer interactive HTML explainer — layer 1 explains the concept with a single analogy, layer 2 shows where it lives in the AIPub UI with screen mock-ups and an animated cursor. Use when the user says "/explain-concept <topic>", "<주제> 개념 설명서 만들어 줘", "ELI5 로 정리해 줘".
---

# explain-concept

Builds a single HTML explainer page for one AIPub topic. Layer 1 is an explorable explanation of the concept; layer 2 opens a modal per section that replays how the concept appears in the AIPub UI.

Follow the `explain-concept` skill (`skills/explain-concept/SKILL.md`). It reads sources (Confluence policy, Figma, Kubernetes resources read-only, aipub-web code), copies the runtime from `skills/explain-concept/runtime/`, and uses `skills/explain-concept/examples/infiniband.html` as the reference shape.

## Usage

```
/explain-concept <topic>
<links to policy pages, Figma, Jira, Slack — optional but recommended>
```

Example:

```
/explain-concept WorkloadGroup

정책서:
https://<site>.atlassian.net/wiki/spaces/<space>/pages/<id>/...
Figma:
https://www.figma.com/design/<file>/...
```

Links make the explainer accurate. Without them the skill searches Confluence and Figma by topic name and reports which documents it picked.
