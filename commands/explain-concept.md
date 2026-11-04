---
description: Turn one AIPub product topic (InfiniBand, Workspace, Job, PV/PVC, ClusterVolume, ...) into a two-layer interactive HTML explainer — layer 1 explains the concept with a single analogy, layer 2 shows where it lives in the AIPub UI with screen mock-ups and an animated cursor. Use when the user says "/explain-concept <topic>", "<주제> 개념 설명서 만들어 줘", "ELI5 로 정리해 줘".
---

# explain-concept

Builds a single HTML explainer page for one AIPub topic. Layer 1 is an explorable explanation of the concept; layer 2 opens a modal per section that replays how the concept appears in the AIPub UI.

Follow the `explain-concept` skill (`skills/explain-concept/SKILL.md`). It reads sources (Confluence policy, Figma, Kubernetes resources read-only, aipub-web code), copies the runtime from `skills/explain-concept/runtime/`, and uses `skills/explain-concept/examples/infiniband.html` as the reference shape.

## Usage

```
/explain-concept <topic>
```

Example: `/explain-concept InfiniBand`
