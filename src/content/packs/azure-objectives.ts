import type { Objective, SourceReference } from '../../domain/content.ts'

/**
 * Objectives shared by every Azure pack, so the same objective id means the same thing
 * everywhere progress is aggregated. Descriptions are domain labels, NOT official wording,
 * and the source links have not been re-verified against Microsoft Learn.
 */

const studyGuide: SourceReference = {
  title: 'Microsoft Learn: AZ-900 study guide',
  url: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-900',
}

export const azureObjectives: Objective[] = [
  {
    id: 'az900.cloud-concepts',
    title: 'Cloud concepts',
    description:
      'Legacy CloudReady domain grouping. Official skills-measured wording not yet verified.',
    sourceRefs: [
      studyGuide,
      {
        title: 'Microsoft Learn: Describe cloud concepts',
        url: 'https://learn.microsoft.com/en-us/training/paths/az-900-describe-cloud-concepts/',
      },
    ],
  },
  {
    id: 'az900.architecture-services',
    title: 'Azure architecture and services',
    description:
      'Legacy CloudReady domain grouping. Official skills-measured wording not yet verified.',
    sourceRefs: [
      studyGuide,
      {
        title: 'Microsoft Learn: Describe Azure architecture and services',
        url: 'https://learn.microsoft.com/en-us/training/paths/az-900-describe-azure-architecture-services/',
      },
    ],
  },
  {
    id: 'az900.management-governance',
    title: 'Azure management and governance',
    description:
      'Legacy CloudReady domain grouping. Official skills-measured wording not yet verified.',
    sourceRefs: [
      studyGuide,
      {
        title: 'Microsoft Learn: Describe Azure management and governance',
        url: 'https://learn.microsoft.com/en-us/training/paths/az-900-describe-azure-management-governance/',
      },
    ],
  },
]
