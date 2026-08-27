import { Module, Menu, View, ModelDefinition } from '@prisma/client'
import prisma from './prisma'

export interface ModuleManifest {
  name: string
  version: string
  description?: string
  author?: string
  dependencies?: string[]
  autoInstall?: boolean
  menus?: MenuManifest[]
  views?: ViewManifest[]
  models?: ModelManifest[]
  data?: Record<string, any>[]
}

export interface MenuManifest {
  name: string
  parentId?: string
  sequence?: number
  action?: string
  icon?: string
}

export interface ViewManifest {
  name: string
  type: 'form' | 'tree' | 'kanban' | 'search' | string
  model: string
  priority?: number
  inheritId?: string
  arch: string
}

export interface ModelManifest {
  name: string
  table: string
  fields: Record<string, any>
  relations?: Record<string, any>
  constraints?: Record<string, any>
}

export class ModuleService {
  /**
   * Discover all modules from the modules directory
   */
  async discoverModules(): Promise<ModuleManifest[]> {
    const fs = await import('fs')
    const path = await import('path')
    
    const modulesDir = path.join(process.cwd(), 'src', 'modules')
    const manifests: ModuleManifest[] = []
    
    if (!fs.existsSync(modulesDir)) {
      return manifests
    }
    
    const entries = fs.readdirSync(modulesDir, { withFileTypes: true })
    
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const manifestPath = path.join(modulesDir, entry.name, 'manifest.ts')
        
        if (fs.existsSync(manifestPath)) {
          try {
            const manifest = require(manifestPath).default as ModuleManifest
            manifests.push(manifest)
          } catch (error) {
            console.error(`Error loading module ${entry.name}:`, error)
          }
        }
      }
    }
    
    return manifests
  }

  /**
   * Install a module
   */
  async installModule(moduleName: string): Promise<boolean> {
    const fs = await import('fs')
    const path = await import('path')
    
    const manifestPath = path.join(process.cwd(), 'src', 'modules', moduleName, 'manifest.ts')
    
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`Module ${moduleName} not found`)
    }
    
    const manifest = require(manifestPath).default as ModuleManifest
    
    // Check dependencies
    if (manifest.dependencies && manifest.dependencies.length > 0) {
      const installedModules = await prisma.module.findMany({
        where: { installed: true }
      })
      
      const installedNames = installedModules.map(m => m.name)
      const missingDeps = manifest.dependencies.filter(dep => !installedNames.includes(dep))
      
      if (missingDeps.length > 0) {
        throw new Error(`Missing dependencies: ${missingDeps.join(', ')}`)
      }
    }
    
    // Create transaction for module installation
    return prisma.$transaction(async (tx) => {
      // Create or update module record
      const module = await tx.module.upsert({
        where: { name: moduleName },
        update: { 
          installed: true,
          version: manifest.version,
          description: manifest.description,
          author: manifest.author,
          dependencies: manifest.dependencies || []
        },
        create: {
          name: moduleName,
          version: manifest.version,
          description: manifest.description,
          author: manifest.author,
          installed: true,
          autoInstall: manifest.autoInstall || false,
          dependencies: manifest.dependencies || []
        }
      })
      
      // Create menus
      if (manifest.menus && manifest.menus.length > 0) {
        for (const menuData of manifest.menus) {
          await tx.menu.create({
            data: {
              name: menuData.name,
              moduleId: module.id,
              sequence: menuData.sequence || 10,
              action: menuData.action,
              icon: menuData.icon,
              parentId: menuData.parentId || null
            }
          })
        }
      }
      
      // Create views
      if (manifest.views && manifest.views.length > 0) {
        for (const viewData of manifest.views) {
          await tx.view.create({
            data: {
              name: viewData.name,
              type: viewData.type,
              model: viewData.model,
              priority: viewData.priority || 16,
              inheritId: viewData.inheritId,
              arch: viewData.arch,
              moduleId: module.id
            }
          })
        }
      }
      
      // Create model definitions
      if (manifest.models && manifest.models.length > 0) {
        for (const modelData of manifest.models) {
          await tx.modelDefinition.create({
            data: {
              name: modelData.name,
              table: modelData.table,
              fields: modelData.fields,
              relations: modelData.relations || {},
              constraints: modelData.constraints || {},
              moduleId: module.id
            }
          })
        }
      }
      
      // Insert initial data if specified
      if (manifest.data && manifest.data.length > 0) {
        for (const rowData of manifest.data) {
          // This is a simplified approach - in reality you'd need dynamic model handling
          console.log('Inserting data:', rowData)
        }
      }
      
      return true
    })
  }

  /**
   * Uninstall a module
   */
  async uninstallModule(moduleName: string): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
      const module = await tx.module.findUnique({
        where: { name: moduleName }
      })
      
      if (!module) {
        throw new Error(`Module ${moduleName} not found`)
      }
      
      // Check if other modules depend on this one
      const dependents = await tx.module.findFirst({
        where: {
          dependencies: { has: moduleName },
          installed: true
        }
      })
      
      if (dependents) {
        throw new Error(`Cannot uninstall: module ${dependents.name} depends on ${moduleName}`)
      }
      
      // Delete related records (cascading should handle this, but being explicit)
      await tx.view.deleteMany({ where: { moduleId: module.id } })
      await tx.menu.deleteMany({ where: { moduleId: module.id } })
      await tx.modelDefinition.deleteMany({ where: { moduleId: module.id } })
      
      // Mark module as uninstalled
      await tx.module.update({
        where: { id: module.id },
        data: { installed: false }
      })
      
      return true
    })
  }

  /**
   * Get all installed modules
   */
  async getInstalledModules(): Promise<Module[]> {
    return prisma.module.findMany({
      where: { installed: true },
      include: {
        menus: true,
        views: true,
        models: true
      }
    })
  }

  /**
   * Get available modules (not installed)
   */
  async getAvailableModules(): Promise<ModuleManifest[]> {
    const discovered = await this.discoverModules()
    const installed = await this.getInstalledModules()
    const installedNames = new Set(installed.map(m => m.name))
    
    return discovered.filter(m => !installedNames.has(m.name))
  }

  /**
   * Auto-install modules marked for auto-installation
   */
  async autoInstallModules(): Promise<void> {
    const discovered = await this.discoverModules()
    
    for (const manifest of discovered) {
      if (manifest.autoInstall) {
        const existing = await prisma.module.findUnique({
          where: { name: manifest.name }
        })
        
        if (!existing || !existing.installed) {
          try {
            await this.installModule(manifest.name)
            console.log(`Auto-installed module: ${manifest.name}`)
          } catch (error) {
            console.error(`Failed to auto-install ${manifest.name}:`, error)
          }
        }
      }
    }
  }
}

export const moduleService = new ModuleService()
