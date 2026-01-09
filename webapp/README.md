# Distribuidora de Barbearia - Página de Vendas

Uma aplicação web completa para distribuidora de produtos para barbearias com foco em roupas e produtos femininos. A página permite que o proprietário gerencie produtos e preços através de um painel administrativo, enquanto os clientes podem navegar pelo catálogo e finalizar compras via WhatsApp.

## 🚀 Tecnologias Utilizadas

- **Backend**: Hono Framework com TypeScript
- **Banco de Dados**: Cloudflare D1 (SQLite)
- **Armazenamento**: Cloudflare KV e R2
- **Deploy**: Cloudflare Pages
- **Frontend**: Tailwind CSS, Font Awesome

## 📋 Funcionalidades

### Para os Clientes:
- ✅ Catálogo de produtos com categorias
- ✅ Carrinho de compras interativo
- ✅ Filtros por categoria
- ✅ Produtos em destaque
- ✅ Redirecionamento automático para WhatsApp
- ✅ Design responsivo e moderno

### Para o Administrador:
- ✅ Painel administrativo completo
- ✅ Gerenciamento de produtos (CRUD)
- ✅ Gerenciamento de categorias
- ✅ Upload de imagens para produtos
- ✅ Sistema de autenticação simples
- ✅ Dashboard com estatísticas
- ✅ Configurações personalizáveis da loja

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- Conta Cloudflare (para deploy em produção)

### Instalação Local

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd distribuidora-barbearia
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o banco de dados local:
```bash
npm run db:migrate:local
npm run db:seed
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev:sandbox
```

5. Acesse a aplicação:
- Página principal: http://localhost:3000/home
- Painel administrativo: http://localhost:3000/admin/dashboard

## 🔐 Acesso ao Painel Administrativo

**Usuário padrão**: admin  
**Senha padrão**: password

> ⚠️ **Importante**: Altere as credenciais padrão após o primeiro acesso!

## 📁 Estrutura do Projeto

```
webapp/
├── src/
│   ├── index.tsx          # Arquivo principal da aplicação
│   ├── routes/
│   │   ├── sales.tsx      # Rotas da página de vendas
│   │   ├── admin.tsx      # Rotas do painel administrativo
│   │   └── api.tsx        # Rotas da API REST
├── migrations/            # Migrações do banco de dados
├── public/               # Arquivos estáticos
├── wrangler.jsonc        # Configuração do Cloudflare
└── package.json         # Dependências e scripts
```

## 🚀 Deploy para Produção

### Configuração do Cloudflare

1. **Configure suas credenciais Cloudflare**:
```bash
npm run setup:cloudflare
```

2. **Crie os recursos necessários**:
```bash
# Criar banco de dados D1
npx wrangler d1 create distribuidora-barbearia-prod

# Criar KV namespace
npx wrangler kv:namespace create distribuidora-barbearia-kv
npx wrangler kv:namespace create distribuidora-barbearia-kv --preview

# Criar R2 bucket
npx wrangler r2 bucket create distribuidora-barbearia-bucket
```

3. **Atualize o arquivo `wrangler.jsonc`** com os IDs gerados

4. **Aplique as migrações**:
```bash
npx wrangler d1 migrations apply distribuidora-barbearia-prod
```

5. **Deploy para produção**:
```bash
npm run deploy:prod
```

## ⚙️ Configurações Personalizáveis

Através do painel administrativo, você pode configurar:

- **Nome da loja**
- **Descrição da loja**
- **Número do WhatsApp** (para onde os pedidos serão enviados)
- **Mensagem padrão do WhatsApp**
- **Informações de contato** (endereço, telefone, email)
- **Horário de funcionamento**
- **Cores do tema** (primária, secundária, acento)

## 🛍️ Como Funciona o Processo de Compra

1. **Cliente navega** pelo catálogo de produtos
2. **Adiciona produtos** ao carrinho
3. **Visualiza o carrinho** clicando no ícone do carrinho
4. **Clica em "Finalizar Compra"** para enviar para WhatsApp
5. **É redirecionado** para o WhatsApp com uma mensagem pré-formatada contendo:
   - Lista dos produtos
   - Quantidades
   - Valor total
   - Mensagem personalizada

## 📸 Upload de Imagens

O sistema suporta upload de imagens para produtos com as seguintes características:
- Formatos aceitos: JPG, PNG, GIF, WebP
- Tamanho máximo: 5MB
- As imagens são armazenadas no Cloudflare R2

## 🔄 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev:sandbox          # Iniciar servidor local
npm run build               # Build para produção

# Banco de dados
npm run db:migrate:local     # Aplicar migrações localmente
npm run db:migrate:prod    # Aplicar migrações em produção
npm run db:seed            # Inserir dados iniciais
npm run db:reset           # Resetar banco de dados local

# Deploy
npm run deploy             # Deploy para Cloudflare Pages
```

## 🛡️ Segurança

- Autenticação simples baseada em token
- Validação de entrada de dados
- Sanitização de SQL queries
- Upload de arquivos validado (tipo e tamanho)

## 📝 Notas Importantes

- **Sem processamento de pagamento**: Todos os pedidos são direcionados para WhatsApp
- **Banco de dados local**: Usa SQLite localmente via Cloudflare D1
- **Armazenamento de imagens**: Usa Cloudflare R2 para armazenamento de imagens
- **Configuração de ambiente**: Use variáveis de ambiente para configurações sensíveis

## 🐛 Solução de Problemas

### Erro de conexão com banco de dados
- Verifique se as migrações foram aplicadas: `npm run db:migrate:local`
- Confirme que o arquivo `wrangler.jsonc` está configurado corretamente

### Imagens não carregando
- Verifique se o bucket R2 foi criado corretamente
- Confirme as permissões de acesso ao bucket

### Erro ao fazer login no admin
- Verifique se o banco de dados foi populado com dados iniciais: `npm run db:seed`
- As credenciais padrão são: admin/password

## 📞 Suporte

Para dúvidas e suporte, entre em contato através do WhatsApp configurado na aplicação.

---

**Desenvolvido com ❤️ para distribuidoras de barbearia**