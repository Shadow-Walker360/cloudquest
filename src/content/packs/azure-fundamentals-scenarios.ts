import type { ContentPack, Scenario, SourceReference } from '../../domain/content.ts'
import { azureObjectives } from './azure-objectives.ts'

/**
 * Original scenario-style challenges for Azure fundamentals. STATUS: DRAFT.
 *
 * Written from general knowledge of the topic and NOT yet reviewed against current Microsoft
 * documentation. Do not mark `reviewed` until a person has checked every claim in the context,
 * options, rationales and explanation against the sources, and recorded reviewers and a date.
 * The scenarios are fictional and are not official exam items.
 */

const PACK_ID = 'azure-fundamentals-scenarios'

/** Source references for the given objectives, without duplicates. */
function sourcesFor(objectiveIds: string[]): SourceReference[] {
  const refs = azureObjectives
    .filter((objective) => objectiveIds.includes(objective.id))
    .flatMap((objective) => objective.sourceRefs)
  return refs.filter((ref, i) => refs.findIndex((other) => other.url === ref.url) === i)
}

const datacenterOutage: Scenario = {
  id: 'azure-datacenter-outage',
  packId: PACK_ID,
  version: '0.1.0',
  title: 'The bakery site that went dark',
  summary:
    'A single-datacenter outage takes an online ordering site offline. Choose the fix that matches the failure.',
  difficulty: 'intro',
  estimatedMinutes: 4,
  objectiveIds: ['az900.cloud-concepts', 'az900.architecture-services'],
  format: 'scenario',
  context:
    'Crumb & Co., a regional bakery chain, takes online orders through a website that runs on a single virtual machine in one Azure region. Last month a power failure at the datacenter hosting that machine took the site offline for four hours, and the team lost a full morning of orders. The rest of the Azure region kept running normally.',
  task: 'Which change would best keep the ordering site online if a single datacenter in the region failed again?',
  constraints: [
    'Customer data must stay in the current Azure region for now.',
    'The team is small and wants the smallest change that would have kept the site online during that outage.',
  ],
  interactionType: 'single-choice',
  options: [
    {
      id: 'a',
      label: 'Run copies of the site in two or more Availability Zones in the same region',
    },
    {
      id: 'b',
      label: 'Move the virtual machine to a larger size with more CPU and memory',
      feedbackTag: 'scale-up-vs-availability',
    },
    {
      id: 'c',
      label: 'Move the whole site to a different Azure region',
      feedbackTag: 'region-vs-zone',
    },
    {
      id: 'd',
      label: 'Take a daily backup of the virtual machine',
      feedbackTag: 'backup-vs-availability',
    },
  ],
  hints: [
    {
      order: 1,
      text: 'Look at what actually failed: one datacenter lost power while the rest of the region kept running.',
    },
    {
      order: 2,
      text: 'You need something that is already running somewhere else when a datacenter goes down. Which options add a second, separate location, and which only change the one you already have?',
    },
    {
      order: 3,
      text: 'Within a single region, Azure offers physically separate locations with independent power, cooling and networking. Which option takes advantage of that?',
    },
  ],
  evaluator: { id: 'single-choice-exact', correctOptionId: 'a' },
  explanation:
    'A single datacenter failure is an availability problem. Availability Zones are physically separate locations inside one Azure region, each with independent power, cooling and networking. Running copies of the site in more than one zone lets it keep serving customers when one zone is lost, and the data never leaves the region.',
  optionRationales: {
    a: 'Copies in separate zones keep running when one zone fails, and everything stays inside the region.',
    b: 'A larger machine can handle more work, but it is still one machine in one datacenter. If that datacenter loses power, the bigger machine goes offline too. Making a machine bigger improves capacity, not availability.',
    c: 'A second region would survive a regional disaster, but this outage hit one datacenter, and the constraint says data must stay in the current region. It is a bigger change than the problem needs.',
    d: 'Backups let you restore data after a failure, but restoring takes time and the site stays down in the meantime. Backups protect against data loss; they do not keep a service running.',
  },
  misconceptionTags: ['scale-up-vs-availability', 'region-vs-zone', 'backup-vs-availability'],
  transferScenarioId: 'azure-sale-day-slowdown',
  sourceRefs: sourcesFor(['az900.cloud-concepts', 'az900.architecture-services']),
  status: 'draft',
}

const saleDaySlowdown: Scenario = {
  id: 'azure-sale-day-slowdown',
  packId: PACK_ID,
  version: '0.1.0',
  title: 'The ticket site that slows on sale days',
  summary:
    'Heavy but short-lived traffic slows a ticketing site. Nothing has failed, so match the fix to the pattern of demand.',
  difficulty: 'intro',
  estimatedMinutes: 4,
  objectiveIds: ['az900.cloud-concepts'],
  format: 'scenario',
  context:
    'Harbor Lights Theatre sells tickets through a website hosted on Azure. On most days traffic is light and the site runs well. When a popular show goes on sale, traffic jumps to many times the normal level for a few hours: pages slow to a crawl and some purchases time out. The site never goes offline; it just cannot keep up. Nothing has failed. Demand has simply changed.',
  task: 'Which approach best fits this pattern of demand?',
  constraints: [
    'Big sales happen a few times a month; the rest of the time the site is quiet.',
    'The theatre does not want to pay all month for capacity it only needs for a few hours.',
  ],
  interactionType: 'single-choice',
  options: [
    {
      id: 'a',
      label: 'Run copies of the site in more than one Availability Zone',
      feedbackTag: 'availability-vs-scaling',
    },
    {
      id: 'b',
      label: 'Buy a much larger virtual machine and keep it running all month',
      feedbackTag: 'scale-up-vs-elasticity',
    },
    {
      id: 'c',
      label:
        'Add more instances of the site automatically when traffic rises, and remove them when it falls',
    },
    {
      id: 'd',
      label: 'Take a nightly backup of the site and its data',
      feedbackTag: 'backup-vs-scaling',
    },
  ],
  hints: [
    {
      order: 1,
      text: 'Is anything broken here, or is the site simply being asked to do much more work than usual for a short time?',
    },
    {
      order: 2,
      text: 'Look at the second constraint. Which options let capacity follow demand instead of staying fixed?',
    },
    {
      order: 3,
      text: 'Think about adding more machines of the same kind versus replacing one machine with a bigger one.',
    },
  ],
  evaluator: { id: 'single-choice-exact', correctOptionId: 'c' },
  explanation:
    'This is a scalability and elasticity problem, not a failure. Scaling out adds instances when demand rises and scaling in removes them when it falls, so the theatre pays for the extra capacity only while it is needed. In Azure this can be automated with autoscale rules.',
  optionRationales: {
    a: 'Spreading across zones protects against a datacenter failure. Nothing failed here: the site is overloaded, and zones alone do not make capacity follow demand.',
    b: 'A bigger machine can handle more load, but you would pay for it all month to cover a few hours of peak, which breaks the cost constraint. Scaling up also has an upper limit, and resizing can interrupt the service.',
    c: 'Adding instances as traffic rises and removing them afterwards matches capacity to demand, so cost follows usage.',
    d: 'Backups protect data after a loss. They do nothing for a site that is slow under heavy load.',
  },
  misconceptionTags: ['availability-vs-scaling', 'scale-up-vs-elasticity', 'backup-vs-scaling'],
  sourceRefs: sourcesFor(['az900.cloud-concepts']),
  status: 'draft',
}

export const azureFundamentalsScenariosPack: ContentPack = {
  id: PACK_ID,
  version: '0.1.0',
  provider: 'azure',
  title: 'Azure fundamentals scenarios (draft)',
  goalLabel: 'Unofficial AZ-900 preparation',
  objectiveSetVersion: 'unverified',
  status: 'draft',
  authors: ['CloudQuest project'],
  reviewers: [],
  objectives: azureObjectives,
  misconceptionLabels: {
    'scale-up-vs-availability': 'A bigger machine is not a more available one',
    'region-vs-zone': 'Mixing up a region and an Availability Zone',
    'backup-vs-availability': 'Backups are not the same as staying online',
    'availability-vs-scaling': 'Mixing up availability and scaling',
    'scale-up-vs-elasticity': 'Paying for peak capacity all the time',
    'backup-vs-scaling': 'Backups do not add capacity',
  },
  scenarios: [datacenterOutage, saleDaySlowdown],
}
