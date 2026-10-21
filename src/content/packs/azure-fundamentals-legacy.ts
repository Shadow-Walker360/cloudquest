import type { ContentPack, Scenario, ScenarioOption } from '../../domain/content.ts'
import { azureObjectives } from './azure-objectives.ts'

/**
 * Legacy CloudReady practice questions, ported unchanged into the typed pack
 * format. STATUS: DRAFT. Nobody has reviewed these against the current
 * official objectives; objective wording below is a domain label, not a quote.
 * Questions are original study prompts, not official exam items.
 */

const PACK_ID = 'azure-fundamentals-legacy'

interface KnowledgeCheckInput {
  id: string
  title: string
  objectiveId: string
  task: string
  options: ScenarioOption[]
  correctOptionId: string
  explanation: string
}

function knowledgeCheck(input: KnowledgeCheckInput): Scenario {
  const objective = azureObjectives.find((o) => o.id === input.objectiveId)
  return {
    id: input.id,
    packId: PACK_ID,
    version: '0.1.0',
    title: input.title,
    summary: input.task,
    difficulty: 'intro',
    estimatedMinutes: 1,
    objectiveIds: [input.objectiveId],
    format: 'knowledge-check',
    context: '',
    task: input.task,
    constraints: [],
    interactionType: 'single-choice',
    options: input.options,
    hints: [],
    evaluator: { id: 'single-choice-exact', correctOptionId: input.correctOptionId },
    explanation: input.explanation,
    misconceptionTags: [],
    sourceRefs: objective?.sourceRefs ?? [],
    status: 'draft',
  }
}

export const azureFundamentalsLegacyPack: ContentPack = {
  id: PACK_ID,
  version: '0.1.0',
  provider: 'azure',
  title: 'Azure fundamentals (legacy practice set)',
  goalLabel: 'Unofficial AZ-900 preparation',
  objectiveSetVersion: 'unverified',
  status: 'draft',
  authors: ['CloudReady legacy content'],
  reviewers: [],
  objectives: azureObjectives,
  scenarios: [
    knowledgeCheck({
      id: 'legacy-q1',
      title: 'Scalability versus availability',
      objectiveId: 'az900.cloud-concepts',
      task: 'Which cloud benefit describes the ability to quickly increase or decrease resources to match demand?',
      options: [
        { id: 'a', label: 'High availability' },
        { id: 'b', label: 'Scalability' },
        { id: 'c', label: 'Disaster recovery' },
        { id: 'd', label: 'Governance' },
      ],
      correctOptionId: 'b',
      explanation:
        'Scalability is the ability to adjust capacity to changing workload needs. High availability focuses on keeping services accessible.',
    }),
    knowledgeCheck({
      id: 'legacy-q2',
      title: 'Hybrid cloud model',
      objectiveId: 'az900.cloud-concepts',
      task: 'Which cloud model combines on-premises infrastructure with public cloud services?',
      options: [
        { id: 'a', label: 'Public cloud' },
        { id: 'b', label: 'Private cloud' },
        { id: 'c', label: 'Hybrid cloud' },
        { id: 'd', label: 'Community cloud' },
      ],
      correctOptionId: 'c',
      explanation:
        'A hybrid cloud combines private/on-premises environments with public cloud services, allowing data and applications to operate across them.',
    }),
    knowledgeCheck({
      id: 'legacy-q3',
      title: 'Consumption-based pricing',
      objectiveId: 'az900.cloud-concepts',
      task: 'In a consumption-based cloud model, which cost approach is most typical?',
      options: [
        { id: 'a', label: 'Pay a fixed amount for all future capacity' },
        { id: 'b', label: 'Pay only for resources consumed' },
        { id: 'c', label: 'Buy all hardware before deployment' },
        { id: 'd', label: 'Pay only when a service is unavailable' },
      ],
      correctOptionId: 'b',
      explanation:
        'Consumption-based pricing charges for the cloud resources you use, helping shift spending from upfront capital expenditure toward operating expenditure.',
    }),
    knowledgeCheck({
      id: 'legacy-q4',
      title: 'Azure regions',
      objectiveId: 'az900.architecture-services',
      task: 'What is an Azure region?',
      options: [
        { id: 'a', label: 'A single physical server' },
        { id: 'b', label: 'A geographic area containing one or more datacenters' },
        { id: 'c', label: 'A user permission group' },
        { id: 'd', label: 'A billing profile' },
      ],
      correctOptionId: 'b',
      explanation:
        'An Azure region is a geographic area containing one or more datacenters connected through a dedicated, low-latency network.',
    }),
    knowledgeCheck({
      id: 'legacy-q5',
      title: 'Availability zones',
      objectiveId: 'az900.architecture-services',
      task: 'What do availability zones provide within a supported Azure region?',
      options: [
        { id: 'a', label: 'Separate billing accounts' },
        {
          id: 'b',
          label:
            'Physically separate datacenter locations with independent power, cooling, and networking',
        },
        { id: 'c', label: 'Automatic access permissions' },
        { id: 'd', label: 'A replacement for every backup' },
      ],
      correctOptionId: 'b',
      explanation:
        'Availability zones are physically separate locations within a region, designed to improve resiliency against datacenter-level failures.',
    }),
    knowledgeCheck({
      id: 'legacy-q6',
      title: 'Hosting web apps without managing servers',
      objectiveId: 'az900.architecture-services',
      task: 'Which Azure service is primarily used to host and manage web applications without managing the underlying servers?',
      options: [
        { id: 'a', label: 'Azure App Service' },
        { id: 'b', label: 'Azure Policy' },
        { id: 'c', label: 'Microsoft Entra ID' },
        { id: 'd', label: 'Azure Cost Management' },
      ],
      correctOptionId: 'a',
      explanation:
        'Azure App Service is a platform-as-a-service offering for hosting web apps and APIs while Azure manages much of the underlying infrastructure.',
    }),
    knowledgeCheck({
      id: 'legacy-q7',
      title: 'Enforcing organizational standards',
      objectiveId: 'az900.management-governance',
      task: 'Which Azure service helps enforce organizational standards and assess resource compliance?',
      options: [
        { id: 'a', label: 'Azure Monitor' },
        { id: 'b', label: 'Azure Policy' },
        { id: 'c', label: 'Azure Virtual Network' },
        { id: 'd', label: 'Azure DNS' },
      ],
      correctOptionId: 'b',
      explanation:
        'Azure Policy can audit, enforce, and assess resource configurations against organizational rules.',
    }),
    knowledgeCheck({
      id: 'legacy-q8',
      title: 'Role-based access control',
      objectiveId: 'az900.management-governance',
      task: 'What is the primary purpose of role-based access control (RBAC) in Azure?',
      options: [
        { id: 'a', label: 'Estimate monthly costs' },
        { id: 'b', label: 'Assign access permissions to users, groups, and applications' },
        { id: 'c', label: 'Deploy virtual machines automatically' },
        { id: 'd', label: 'Replicate data between regions' },
      ],
      correctOptionId: 'b',
      explanation:
        'Azure RBAC controls who can perform which actions on Azure resources, based on assigned roles and scope.',
    }),
    knowledgeCheck({
      id: 'legacy-q9',
      title: 'Estimating costs before deployment',
      objectiveId: 'az900.management-governance',
      task: 'Which tool helps estimate the cost of Azure products before deployment?',
      options: [
        { id: 'a', label: 'Azure Pricing calculator' },
        { id: 'b', label: 'Azure Service Health' },
        { id: 'c', label: 'Azure Advisor' },
        { id: 'd', label: 'Azure Resource Manager locks' },
      ],
      correctOptionId: 'a',
      explanation:
        'The Azure Pricing calculator estimates costs for Azure products and configurations before you deploy.',
    }),
  ],
}
