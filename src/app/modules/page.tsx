'use client'

import { useEffect, useState } from 'react'
import { moduleService, ModuleManifest } from '@/core/module-service'

interface ModuleInfo extends ModuleManifest {
  installed?: boolean
  id?: string
}

export default function ModulesPage() {
  const [availableModules, setAvailableModules] = useState<ModuleInfo[]>([])
  const [installedModules, setInstalledModules] = useState<ModuleInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadModules()
  }, [])

  async function loadModules() {
    try {
      const [available, installed] = await Promise.all([
        moduleService.getAvailableModules(),
        moduleService.getInstalledModules()
      ])
      
      setAvailableModules(available as ModuleInfo[])
      setInstalledModules(installed as ModuleInfo[])
    } catch (error) {
      console.error('Error loading modules:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleInstall(moduleName: string) {
    try {
      await moduleService.installModule(moduleName)
      loadModules()
      alert(`Module ${moduleName} installed successfully!`)
    } catch (error: any) {
      alert(`Failed to install: ${error.message}`)
    }
  }

  async function handleUninstall(moduleName: string) {
    try {
      await moduleService.uninstallModule(moduleName)
      loadModules()
      alert(`Module ${moduleName} uninstalled successfully!`)
    } catch (error: any) {
      alert(`Failed to uninstall: ${error.message}`)
    }
  }

  if (loading) {
    return <div className="p-4">Loading modules...</div>
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Module Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Installed Modules */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4 text-green-700">
            Installed Modules ({installedModules.length})
          </h2>
          <div className="space-y-3">
            {installedModules.map(module => (
              <div key={module.id} className="border rounded p-3 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{module.name}</h3>
                    <p className="text-sm text-gray-600">{module.description}</p>
                    <p className="text-xs text-gray-500">v{module.version}</p>
                    {module.dependencies && module.dependencies.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Dependencies: {module.dependencies.join(', ')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleUninstall(module.name)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    disabled={module.name === 'base'}
                  >
                    Uninstall
                  </button>
                </div>
              </div>
            ))}
            {installedModules.length === 0 && (
              <p className="text-gray-500 text-center py-4">No modules installed</p>
            )}
          </div>
        </div>

        {/* Available Modules */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">
            Available Modules ({availableModules.length})
          </h2>
          <div className="space-y-3">
            {availableModules.map(module => (
              <div key={module.name} className="border rounded p-3 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{module.name}</h3>
                    <p className="text-sm text-gray-600">{module.description}</p>
                    <p className="text-xs text-gray-500">v{module.version}</p>
                    {module.dependencies && module.dependencies.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Dependencies: {module.dependencies.join(', ')}
                      </p>
                    )}
                    {module.autoInstall && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                        Auto-install
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleInstall(module.name)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Install
                  </button>
                </div>
              </div>
            ))}
            {availableModules.length === 0 && (
              <p className="text-gray-500 text-center py-4">No available modules</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
        <h3 className="font-semibold text-blue-900 mb-2">How to add modules:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>Create a new folder in <code className="bg-white px-1 rounded">src/modules/your-module-name</code></li>
          <li>Add a <code className="bg-white px-1 rounded">manifest.ts</code> file with module definition</li>
          <li>Define menus, views, models, and initial data in the manifest</li>
          <li>Click "Install" to activate the module</li>
        </ol>
      </div>
    </div>
  )
}
