import { Hono } from 'hono'

const api = new Hono<{ Bindings: Bindings }>()

// API para buscar produtos
api.get('/products', async (c) => {
  const { env } = c
  const { category, featured, search, limit = 50 } = c.req.query()
  
  let query = `
    SELECT p.*, c.name as category_name 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.active = 1
  `
  
  const params: any[] = []
  
  if (category && category !== 'all') {
    query += ' AND p.category_id = ?'
    params.push(category)
  }
  
  if (featured === 'true') {
    query += ' AND p.featured = 1'
  }
  
  if (search) {
    query += ' AND (p.name LIKE ? OR p.description LIKE ?)'
    params.push('%' + search + '%', '%' + search + '%')
  }
  
  query += ' ORDER BY p.sort_order, p.name'
  
  if (limit) {
    query += ' LIMIT ?'
    params.push(parseInt(limit))
  }
  
  const products = await env.DB.prepare(query).bind(...params).all()
  
  return c.json({
    success: true,
    data: products.results,
    count: products.results.length
  })
})

// API para criar/atualizar produto
api.post('/products', async (c) => {
  const { env } = c
  const product = await c.req.json()
  
  if (product.id) {
    // Atualizar produto existente
    await env.DB.prepare(`
      UPDATE products 
      SET name = ?, description = ?, price = ?, category_id = ?, 
          stock_quantity = ?, featured = ?, active = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      product.name,
      product.description || '',
      product.price,
      product.category_id,
      product.stock_quantity || 0,
      product.featured ? 1 : 0,
      product.active ? 1 : 0,
      product.sort_order || 0,
      product.id
    ).run()
    
    return c.json({
      success: true,
      message: 'Produto atualizado com sucesso',
      id: product.id
    })
  } else {
    // Criar novo produto
    const result = await env.DB.prepare(`
      INSERT INTO products (name, description, price, category_id, stock_quantity, featured, active, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      product.name,
      product.description || '',
      product.price,
      product.category_id,
      product.stock_quantity || 0,
      product.featured ? 1 : 0,
      product.active ? 1 : 0,
      product.sort_order || 0
    ).run()
    
    return c.json({
      success: true,
      message: 'Produto criado com sucesso',
      id: result.meta.last_row_id
    })
  }
})

// API para deletar produto
api.delete('/products/:id', async (c) => {
  const { env } = c
  const id = c.req.param('id')
  
  // Soft delete - apenas marcar como inativo
  await env.DB.prepare(`
    UPDATE products SET active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(id).run()
  
  return c.json({
    success: true,
    message: 'Produto removido com sucesso'
  })
})

// API para upload de imagem
api.post('/upload', async (c) => {
  const { env } = c
  const body = await c.req.parseBody()
  const file = body.file as File
  
  if (!file) {
    return c.json({
      success: false,
      message: 'Nenhum arquivo enviado'
    }, 400)
  }
  
  // Validar tipo de arquivo
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return c.json({
      success: false,
      message: 'Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WebP.'
    }, 400)
  }
  
  // Validar tamanho (máximo 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return c.json({
      success: false,
      message: 'Arquivo muito grande. Máximo 5MB.'
    }, 400)
  }
  
  // Gerar nome único para o arquivo
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(7)
  const extension = file.name.split('.').pop()
  const fileName = 'products/' + timestamp + '-' + randomString + '.' + extension;
  
  // Fazer upload para R2
  await env.R2.put(fileName, file.stream(), {
    httpMetadata: {
      contentType: file.type
    }
  })
  
  // Gerar URL pública (assumindo que o bucket está configurado para acesso público)
  const publicUrl = 'https://' + env.R2.bucketName + '.' + c.req.header('host') + '/' + fileName;
  
  return c.json({
    success: true,
    message: 'Imagem enviada com sucesso',
    url: publicUrl,
    fileName
  })
})

// API para atualizar imagem do produto
api.post('/products/:id/image', async (c) => {
  const { env } = c
  const id = c.req.param('id')
  const { image_url } = await c.req.json()
  
  await env.DB.prepare(`
    UPDATE products SET image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(image_url, id).run()
  
  return c.json({
    success: true,
    message: 'Imagem do produto atualizada com sucesso'
  })
})

// API para buscar categorias
api.get('/categories', async (c) => {
  const { env } = c
  
  const categories = await env.DB.prepare(`
    SELECT * FROM categories 
    WHERE active = 1 
    ORDER BY sort_order, name
  `).all()
  
  return c.json({
    success: true,
    data: categories.results,
    count: categories.results.length
  })
})

// API para criar/atualizar categoria
api.post('/categories', async (c) => {
  const { env } = c
  const category = await c.req.json()
  
  if (category.id) {
    // Atualizar categoria existente
    await env.DB.prepare(`
      UPDATE categories 
      SET name = ?, description = ?, image_url = ?, sort_order = ?, active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      category.name,
      category.description || '',
      category.image_url || '',
      category.sort_order || 0,
      category.active ? 1 : 0,
      category.id
    ).run()
    
    return c.json({
      success: true,
      message: 'Categoria atualizada com sucesso',
      id: category.id
    })
  } else {
    // Criar nova categoria
    const result = await env.DB.prepare(`
      INSERT INTO categories (name, description, image_url, sort_order, active)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      category.name,
      category.description || '',
      category.image_url || '',
      category.sort_order || 0,
      category.active ? 1 : 0
    ).run()
    
    return c.json({
      success: true,
      message: 'Categoria criada com sucesso',
      id: result.meta.last_row_id
    })
  }
})

// API para deletar categoria
api.delete('/categories/:id', async (c) => {
  const { env } = c
  const id = c.req.param('id')
  
  // Soft delete - apenas marcar como inativo
  await env.DB.prepare(`
    UPDATE categories SET active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(id).run()
  
  return c.json({
    success: true,
    message: 'Categoria removida com sucesso'
  })
})

// API para buscar configurações
api.get('/config', async (c) => {
  const { env } = c
  
  const configKeys = [
    'store_name', 'store_description', 'whatsapp_number', 'whatsapp_message',
    'store_address', 'store_phone', 'store_email', 'store_hours',
    'currency_symbol', 'currency_code', 'theme_primary', 'theme_secondary', 'theme_accent'
  ]
  
  const config: Record<string, string> = {}
  
  for (const key of configKeys) {
    config[key] = await env.KV.get(key) || ''
  }
  
  return c.json({
    success: true,
    data: config
  })
})

// API para atualizar configurações
api.post('/config', async (c) => {
  const { env } = c
  const config = await c.req.json()
  
  // Atualizar cada configuração no KV
  for (const [key, value] of Object.entries(config)) {
    await env.KV.put(key, value as string)
  }
  
  return c.json({
    success: true,
    message: 'Configurações atualizadas com sucesso'
  })
})

// API para buscar variações de produto
api.get('/products/:id/variations', async (c) => {
  const { env } = c
  const productId = c.req.param('id')
  
  const variations = await env.DB.prepare(`
    SELECT * FROM product_variations 
    WHERE product_id = ? AND active = 1
    ORDER BY name, value
  `).bind(productId).all()
  
  return c.json({
    success: true,
    data: variations.results,
    count: variations.results.length
  })
})

// API para criar/atualizar variação
api.post('/products/:id/variations', async (c) => {
  const { env } = c
  const productId = c.req.param('id')
  const variation = await c.req.json()
  
  if (variation.id) {
    // Atualizar variação existente
    await env.DB.prepare(`
      UPDATE product_variations 
      SET name = ?, value = ?, price_adjustment = ?, stock_quantity = ?, active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND product_id = ?
    `).bind(
      variation.name,
      variation.value,
      variation.price_adjustment || 0,
      variation.stock_quantity || 0,
      variation.active ? 1 : 0,
      variation.id,
      productId
    ).run()
    
    return c.json({
      success: true,
      message: 'Variação atualizada com sucesso'
    })
  } else {
    // Criar nova variação
    await env.DB.prepare(`
      INSERT INTO product_variations (product_id, name, value, price_adjustment, stock_quantity, active)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      productId,
      variation.name,
      variation.value,
      variation.price_adjustment || 0,
      variation.stock_quantity || 0,
      variation.active ? 1 : 0
    ).run()
    
    return c.json({
      success: true,
      message: 'Variação criada com sucesso'
    })
  }
})

export const apiRoutes = api