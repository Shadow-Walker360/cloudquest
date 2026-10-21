import type { ContentPack } from '../domain/content.ts'
import { azureFundamentalsLegacyPack } from './packs/azure-fundamentals-legacy.ts'

/** Every pack the app knows about. Integrity of each is enforced by tests. */
export const contentPacks: readonly ContentPack[] = [azureFundamentalsLegacyPack]
