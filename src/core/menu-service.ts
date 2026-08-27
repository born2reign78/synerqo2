import prisma from './prisma'

export interface MenuNode {
  id: string
  name: string
  children?: MenuNode[]
  action?: string | null
  icon?: string | null
  sequence: number
}

export class MenuService {
  /**
   * Build hierarchical menu structure from database
   */
  async buildMenuTree(): Promise<MenuNode[]> {
    const menus = await prisma.menu.findMany({
      where: { active: true },
      include: {
        module: {
          select: {
            name: true,
            installed: true
          }
        }
      },
      orderBy: {
        sequence: 'asc'
      }
    })

    // Filter only menus from installed modules
    const installedMenus = menus.filter(menu => menu.module.installed)

    const menuMap = new Map<string, MenuNode>()

    // First pass: create all menu nodes
    for (const menu of installedMenus) {
      menuMap.set(menu.id, {
        id: menu.id,
        name: menu.name,
        children: [],
        action: menu.action,
        icon: menu.icon,
        sequence: menu.sequence
      })
    }

    const rootMenus: MenuNode[] = []

    // Second pass: build hierarchy
    for (const menu of installedMenus) {
      const node = menuMap.get(menu.id)!
      
      if (menu.parentId) {
        const parent = menuMap.get(menu.parentId)
        if (parent) {
          parent.children!.push(node)
        } else {
          // Parent not found, treat as root
          rootMenus.push(node)
        }
      } else {
        rootMenus.push(node)
      }
    }

    // Sort root menus by sequence
    rootMenus.sort((a, b) => a.sequence - b.sequence)

    // Recursively sort children
    const sortChildren = (node: MenuNode) => {
      if (node.children && node.children.length > 0) {
        node.children.sort((a, b) => a.sequence - b.sequence)
        node.children.forEach(sortChildren)
      }
    }

    rootMenus.forEach(sortChildren)

    return rootMenus
  }

  /**
   * Get flat list of all menus
   */
  async getAllMenus(): Promise<typeof prisma.menu.$extends> {
    return prisma.menu.findMany({
      include: {
        module: {
          select: {
            name: true,
            installed: true
          }
        },
        parent: true
      },
      orderBy: [
        { parentId: 'asc' },
        { sequence: 'asc' }
      ]
    })
  }

  /**
   * Get menus for a specific module
   */
  async getModuleMenus(moduleName: string) {
    return prisma.menu.findMany({
      where: {
        module: {
          name: moduleName
        }
      },
      orderBy: {
        sequence: 'asc'
      }
    })
  }
}

export const menuService = new MenuService()
