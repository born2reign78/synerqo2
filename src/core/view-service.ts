import prisma from './prisma'

export interface ViewDefinition {
  id: string
  name: string
  type: string
  model: string
  priority: number
  arch: any // Parsed architecture
}

export class ViewService {
  /**
   * Get views for a specific model
   */
  async getViewsForModel(modelName: string, viewType?: string): Promise<ViewDefinition[]> {
    const where: any = {
      model: modelName,
      active: true,
      module: {
        installed: true
      }
    }

    if (viewType) {
      where.type = viewType
    }

    const views = await prisma.view.findMany({
      where,
      orderBy: {
        priority: 'asc'
      }
    })

    return views.map(view => ({
      id: view.id,
      name: view.name,
      type: view.type,
      model: view.model,
      priority: view.priority,
      arch: typeof view.arch === 'string' ? JSON.parse(view.arch) : view.arch
    }))
  }

  /**
   * Get the primary view for a model and type
   */
  async getPrimaryView(modelName: string, viewType: string): Promise<ViewDefinition | null> {
    const view = await prisma.view.findFirst({
      where: {
        model: modelName,
        type: viewType,
        active: true,
        inheritId: null,
        module: {
          installed: true
        }
      },
      orderBy: {
        priority: 'asc'
      }
    })

    if (!view) {
      return null
    }

    return {
      id: view.id,
      name: view.name,
      type: view.type,
      model: view.model,
      priority: view.priority,
      arch: typeof view.arch === 'string' ? JSON.parse(view.arch) : view.arch
    }
  }

  /**
   * Get all views for installed modules
   */
  async getAllViews(): Promise<ViewDefinition[]> {
    const views = await prisma.view.findMany({
      where: {
        active: true,
        module: {
          installed: true
        }
      },
      include: {
        module: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        { model: 'asc' },
        { type: 'asc' },
        { priority: 'asc' }
      ]
    })

    return views.map(view => ({
      id: view.id,
      name: view.name,
      type: view.type,
      model: view.model,
      priority: view.priority,
      arch: typeof view.arch === 'string' ? JSON.parse(view.arch) : view.arch
    }))
  }

  /**
   * Render a view with its inherited views
   */
  async renderView(viewId: string): Promise<any> {
    const baseView = await prisma.view.findUnique({
      where: { id: viewId }
    })

    if (!baseView) {
      throw new Error(`View ${viewId} not found`)
    }

    let arch = typeof baseView.arch === 'string' ? JSON.parse(baseView.arch) : baseView.arch

    // If this view inherits from another, merge architectures
    if (baseView.inheritId) {
      const parentView = await prisma.view.findUnique({
        where: { id: baseView.inheritId }
      })

      if (parentView) {
        const parentArch = typeof parentView.arch === 'string' 
          ? JSON.parse(parentView.arch) 
          : parentView.arch
        
        // Simple merge strategy - in real implementation you'd need XPath-like merging
        arch = { ...parentArch, ...arch }
      }
    }

    return arch
  }
}

export const viewService = new ViewService()
