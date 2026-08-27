'use client'

import { useEffect, useState } from 'react'
import { menuService, MenuNode } from '@/core/menu-service'

interface MenuItemProps {
  menu: MenuNode
  level?: number
}

function MenuItem({ menu, level = 0 }: MenuItemProps) {
  const hasChildren = menu.children && menu.children.length > 0

  return (
    <li className="menu-item">
      <a 
        href={menu.action || '#'} 
        className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 ${level > 0 ? 'ml-' + (level * 4) : ''}`}
      >
        {menu.icon && <span>{menu.icon}</span>}
        <span>{menu.name}</span>
      </a>
      
      {hasChildren && (
        <ul className="menu-submenu mt-1 space-y-1">
          {menu.children!.map(child => (
            <MenuItem key={child.id} menu={child} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}

export default function Sidebar() {
  const [menus, setMenus] = useState<MenuNode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMenus() {
      try {
        const menuTree = await menuService.buildMenuTree()
        setMenus(menuTree)
      } catch (error) {
        console.error('Error loading menus:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMenus()
  }, [])

  if (loading) {
    return <div className="w-64 bg-gray-800 text-white p-4">Loading...</div>
  }

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
      <nav>
        <h2 className="text-xl font-bold mb-4">OdooJS</h2>
        <ul className="space-y-2">
          {menus.map(menu => (
            <MenuItem key={menu.id} menu={menu} />
          ))}
        </ul>
      </nav>
    </aside>
  )
}
