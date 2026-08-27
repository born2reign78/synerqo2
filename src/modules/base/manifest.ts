import { ModuleManifest } from '../core/module-service'

const manifest: ModuleManifest = {
  name: 'base',
  version: '1.0.0',
  description: 'Base module - Core system functionality',
  author: 'System',
  autoInstall: true,
  dependencies: [],
  menus: [
    {
      name: 'Settings',
      sequence: 100,
      icon: '⚙️'
    }
  ],
  models: [
    {
      name: 'ResPartner',
      table: 'res_partner',
      fields: {
        id: { type: 'String', id: true },
        name: { type: 'String', required: true },
        email: { type: 'String?', unique: true },
        phone: { type: 'String?' },
        isCompany: { type: 'Boolean', default: false },
        parentId: { type: 'String?' },
        createdAt: { type: 'DateTime', default: 'now' },
        updatedAt: { type: 'DateTime', default: 'now' }
      },
      relations: {
        parent: { model: 'ResPartner', field: 'parentId', relation: 'ResPartner_children' },
        children: { model: 'ResPartner', field: 'parentId', relation: 'ResPartner_parent' }
      }
    }
  ],
  data: []
}

export default manifest
