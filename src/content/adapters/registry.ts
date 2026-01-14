import { BaseAdapter } from './base'
import { PTSiteAdapter } from './pt-site'
import { GenericAdapter } from './generic'
import type { SiteAdapter, AdapterConfig } from '@shared/types'

class AdapterRegistry {
  private adapters: BaseAdapter[] = []
  private genericAdapters: Map<string, GenericAdapter> = new Map()

  constructor() {
    this.registerBuiltInAdapters()
    this.loadUserAdapters()
  }

  private registerBuiltInAdapters() {
    this.adapters.push(new PTSiteAdapter())
  }

  private async loadUserAdapters() {
    try {
      const result = await chrome.storage.local.get('checkin')
      const checkInData = result.checkin

      if (checkInData?.sites) {
        checkInData.sites.forEach((siteConfig: any) => {
          if (siteConfig.enabled && siteConfig.adapterType === 'generic' && siteConfig.adapterConfig) {
            const adapter = new GenericAdapter(siteConfig.adapterConfig as AdapterConfig)
            adapter.name = siteConfig.name
            this.genericAdapters.set(siteConfig.url, adapter)
          }
        })
      }
    } catch (error) {
      console.error('Failed to load user adapters:', error)
    }
  }

  async reloadUserAdapters() {
    this.genericAdapters.clear()
    await this.loadUserAdapters()
  }

  match(url: string): SiteAdapter | null {
    for (const adapter of this.adapters) {
      if (adapter.match(url)) {
        return adapter
      }
    }

    for (const [siteUrl, adapter] of this.genericAdapters) {
      if (adapter.match(url)) {
        return adapter
      }
    }

    return null
  }

  getAllAdapters(): SiteAdapter[] {
    return [...this.adapters, ...Array.from(this.genericAdapters.values())]
  }
}

export const adapterRegistry = new AdapterRegistry()
export default adapterRegistry
