import { ModuleManifest } from '../../core/module-service'

const manifest: ModuleManifest = {
  name: 'sales',
  version: '1.0.0',
  description: 'Sales Management Module',
  author: 'System',
  autoInstall: false,
  dependencies: ['base'],
  menus: [
    {
      name: 'Sales',
      sequence: 20,
      icon: '💰'
    },
    {
      name: 'Quotations',
      parentId: 'Sales',
      sequence: 10,
      action: '/sales/quotations'
    },
    {
      name: 'Orders',
      parentId: 'Sales',
      sequence: 20,
      action: '/sales/orders'
    },
    {
      name: 'Products',
      parentId: 'Sales',
      sequence: 30,
      action: '/sales/products'
    }
  ],
  views: [
    {
      name: 'Sale Order Form',
      type: 'form',
      model: 'SaleOrder',
      priority: 16,
      arch: JSON.stringify({
        form: {
          sheet: {
            fields: ['partner_id', 'date_order', 'order_line'],
            buttons: ['confirm', 'cancel']
          }
        }
      })
    },
    {
      name: 'Sale Order Tree',
      type: 'tree',
      model: 'SaleOrder',
      priority: 16,
      arch: JSON.stringify({
        tree: {
          fields: ['name', 'partner_id', 'date_order', 'amount_total', 'state']
        }
      })
    }
  ],
  models: [
    {
      name: 'SaleOrder',
      table: 'sale_order',
      fields: {
        id: { type: 'String', id: true },
        name: { type: 'String', required: true, unique: true },
        partnerId: { type: 'String', required: true },
        dateOrder: { type: 'DateTime', default: 'now' },
        amountTotal: { type: 'Float', default: 0 },
        state: { type: 'String', default: 'draft' }, // draft, confirmed, done, cancel
        createdAt: { type: 'DateTime', default: 'now' },
        updatedAt: { type: 'DateTime', default: 'now' }
      },
      relations: {
        partner: { model: 'ResPartner', field: 'partnerId' }
      }
    },
    {
      name: 'SaleOrderLine',
      table: 'sale_order_line',
      fields: {
        id: { type: 'String', id: true },
        orderId: { type: 'String', required: true },
        productId: { type: 'String', required: true },
        quantity: { type: 'Float', default: 1 },
        priceUnit: { type: 'Float', default: 0 },
        discount: { type: 'Float', default: 0 },
        priceSubtotal: { type: 'Float', default: 0 }
      },
      relations: {
        order: { model: 'SaleOrder', field: 'orderId' },
        product: { model: 'ProductProduct', field: 'productId' }
      }
    },
    {
      name: 'ProductProduct',
      table: 'product_product',
      fields: {
        id: { type: 'String', id: true },
        name: { type: 'String', required: true },
        defaultCode: { type: 'String?', unique: true },
        listPrice: { type: 'Float', default: 0 },
        standardPrice: { type: 'Float', default: 0 },
        type: { type: 'String', default: 'product' }, // product, service, consupable
        active: { type: 'Boolean', default: true }
      }
    }
  ],
  data: [
    {
      model: 'ProductProduct',
      records: [
        { name: 'Service', defaultCode: 'SERV001', listPrice: 0, type: 'service' },
        { name: 'Product', defaultCode: 'PROD001', listPrice: 100, type: 'product' }
      ]
    }
  ]
}

export default manifest
