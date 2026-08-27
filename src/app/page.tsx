import Sidebar from './components/Sidebar'

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-100">
        <h1 className="text-4xl font-bold mb-6">Welcome to OdooJS</h1>
        <p className="text-lg text-gray-700 mb-4">
          A modular, extensible ERP system built with Next.js and Prisma.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">📦 Module System</h2>
            <p className="text-gray-600">
              Install and uninstall modules dynamically. Each module can add menus, views, models, and data.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">🎯 Dynamic Menus</h2>
            <p className="text-gray-600">
              Menus are automatically discovered and built from installed modules with hierarchical support.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">👁️ View System</h2>
            <p className="text-gray-600">
              Define form, tree, kanban, and search views for your models with inheritance support.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">🗄️ Model Definitions</h2>
            <p className="text-gray-600">
              Declare your data models in module manifests with fields, relations, and constraints.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">⚡ Auto-Installation</h2>
            <p className="text-gray-600">
              Modules can be marked for auto-installation on system startup.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">🔗 Dependencies</h2>
            <p className="text-gray-600">
              Define module dependencies that are automatically checked before installation.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <a 
            href="/modules" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Manage Modules →
          </a>
        </div>
      </main>
    </div>
  );
}
