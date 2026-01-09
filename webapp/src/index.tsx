import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { logger } from 'hono/logger'

// Importar rotas
import { salesRoutes } from './routes/sales'
import { adminRoutes } from './routes/admin'
import { apiRoutes } from './routes/api'

export type Bindings = {
  DB: D1Database
  KV: KVNamespace
  R2: R2Bucket
}

const app = new Hono<{ Bindings: Bindings }>()

// Middleware
app.use('*', logger())
app.use('/api/*', cors())

// Servir arquivos estáticos
app.use('/static/*', serveStatic({ root: './public' }))

// Rotas principais
app.route('/api', apiRoutes)
app.route('/admin', adminRoutes)
app.route('/', salesRoutes)

// Rota raiz - página de vendas
app.get('/', (c) => {
  return c.redirect('/home')
})

export default app