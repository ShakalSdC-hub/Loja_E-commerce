import { Hono } from 'hono'

const admin = new Hono<{ Bindings: Bindings }>()

// Middleware de autenticação simples
admin.use('/dashboard/*', async (c, next) => {
  const token = c.req.cookie('admin_token')
  
  if (!token) {
    return c.redirect('/admin/login')
  }
  
  try {
    // Verificar token simples (em produção, usar JWT)
    const adminData = JSON.parse(atob(token))
    if (adminData.exp < Date.now()) {
      throw new Error('Token expirado')
    }
    c.set('admin', adminData)
    await next()
  } catch (error) {
    return c.redirect('/admin/login')
  }
})

// Página de login
admin.get('/login', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login - Painel Administrativo</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            .login-container {
                background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
            }
            .login-card {
                backdrop-filter: blur(10px);
                background: rgba(255, 255, 255, 0.95);
            }
        </style>
    </head>
    <body class="login-container min-h-screen flex items-center justify-center">
        <div class="login-card p-8 rounded-lg shadow-xl w-full max-w-md">
            <div class="text-center mb-8">
                <i class="fas fa-lock text-4xl text-gray-700 mb-4"></i>
                <h1 class="text-2xl font-bold text-gray-800">Painel Administrativo</h1>
                <p class="text-gray-600">Entre com suas credenciais</p>
            </div>
            
            <form id="loginForm" class="space-y-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Usuário</label>
                    <div class="relative">
                        <span class="absolute left-3 top-3 text-gray-400">
                            <i class="fas fa-user"></i>
                        </span>
                        <input 
                            type="text" 
                            name="username" 
                            required
                            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="Digite seu usuário"
                        >
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                    <div class="relative">
                        <span class="absolute left-3 top-3 text-gray-400">
                            <i class="fas fa-key"></i>
                        </span>
                        <input 
                            type="password" 
                            name="password" 
                            required
                            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="Digite sua senha"
                        >
                    </div>
                </div>
                
                <button 
                    type="submit" 
                    class="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-2 px-4 rounded-lg hover:from-amber-700 hover:to-orange-700 transition-colors font-medium"
                >
                    <i class="fas fa-sign-in-alt mr-2"></i>Entrar
                </button>
            </form>
            
            <div id="errorMessage" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg hidden">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                <span id="errorText"></span>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            document.getElementById('loginForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(e.target);
                const data = {
                    username: formData.get('username'),
                    password: formData.get('password')
                };
                
                try {
                    const response = await axios.post('/admin/api/login', data);
                    
                    if (response.data.success) {
                        // Salvar token no cookie
                        document.cookie = 'admin_token=' + response.data.token + '; path=/; max-age=86400';
                        // Redirecionar para dashboard
                        window.location.href = '/admin/dashboard';
                    }
                } catch (error) {
                    const errorMessage = document.getElementById('errorMessage');
                    const errorText = document.getElementById('errorText');
                    
                    errorText.textContent = error.response?.data?.message || 'Erro ao fazer login';
                    errorMessage.classList.remove('hidden');
                }
            });
        </script>
    </body>
    </html>
  `)
})

// Dashboard administrativo
admin.get('/dashboard', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Painel Administrativo - Distribuidora Barbearia</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            .sidebar {
                background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
            }
            .content-area {
                min-height: calc(100vh - 4rem);
            }
            .card {
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            }
            .btn-primary {
                background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
                color: white;
            }
            .btn-primary:hover {
                background: linear-gradient(135deg, #7A3C10 0%, #C15A0D 100%);
            }
        </style>
    </head>
    <body class="bg-gray-100">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b">
            <div class="container mx-auto px-4 py-3">
                <div class="flex items-center justify-between">
                    <h1 class="text-xl font-bold text-gray-800">
                        <i class="fas fa-tachometer-alt mr-2"></i>Painel Administrativo
                    </h1>
                    <div class="flex items-center space-x-4">
                        <span class="text-gray-600">Olá, Administrador</span>
                        <button onclick="logout()" class="text-red-600 hover:text-red-800">
                            <i class="fas fa-sign-out-alt mr-1"></i>Sair
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <div class="flex">
            <!-- Sidebar -->
            <aside class="sidebar w-64 text-white">
                <nav class="p-4">
                    <ul class="space-y-2">
                        <li>
                            <a href="#" onclick="showSection('dashboard')" class="flex items-center p-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors">
                                <i class="fas fa-chart-line mr-3"></i>
                                <span>Dashboard</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" onclick="showSection('products')" class="flex items-center p-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors">
                                <i class="fas fa-box mr-3"></i>
                                <span>Produtos</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" onclick="showSection('categories')" class="flex items-center p-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors">
                                <i class="fas fa-tags mr-3"></i>
                                <span>Categorias</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" onclick="showSection('config')" class="flex items-center p-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors">
                                <i class="fas fa-cog mr-3"></i>
                                <span>Configurações</span>
                            </a>
                        </li>
                        <li>
                            <a href="/" target="_blank" class="flex items-center p-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors">
                                <i class="fas fa-eye mr-3"></i>
                                <span>Ver Loja</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </aside>

            <!-- Content Area -->
            <main class="flex-1 p-6 content-area">
                <!-- Dashboard Section -->
                <div id="dashboardSection" class="section">
                    <h2 class="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>
                    
                    <!-- Cards de Estatísticas -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div class="card bg-white p-6 rounded-lg shadow-md">
                            <div class="flex items-center">
                                <div class="p-3 rounded-full bg-blue-100 text-blue-600">
                                    <i class="fas fa-box text-xl"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600">Total Produtos</p>
                                    <p id="totalProducts" class="text-2xl font-bold text-gray-900">-</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card bg-white p-6 rounded-lg shadow-md">
                            <div class="flex items-center">
                                <div class="p-3 rounded-full bg-green-100 text-green-600">
                                    <i class="fas fa-tags text-xl"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600">Total Categorias</p>
                                    <p id="totalCategories" class="text-2xl font-bold text-gray-900">-</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card bg-white p-6 rounded-lg shadow-md">
                            <div class="flex items-center">
                                <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
                                    <i class="fas fa-star text-xl"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600">Produtos em Destaque</p>
                                    <p id="featuredProducts" class="text-2xl font-bold text-gray-900">-</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card bg-white p-6 rounded-lg shadow-md">
                            <div class="flex items-center">
                                <div class="p-3 rounded-full bg-purple-100 text-purple-600">
                                    <i class="fas fa-eye text-xl"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600">Visitas Hoje</p>
                                    <p class="text-2xl font-bold text-gray-900">-</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Produtos Recentes -->
                    <div class="bg-white rounded-lg shadow-md">
                        <div class="p-4 border-b">
                            <h3 class="text-lg font-semibold text-gray-800">
                                <i class="fas fa-clock mr-2"></i>Produtos Recentes
                            </h3>
                        </div>
                        <div id="recentProducts" class="p-4">
                            <!-- Produtos recentes serão carregados aqui -->
                        </div>
                    </div>
                </div>

                <!-- Products Section -->
                <div id="productsSection" class="section hidden">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">Gerenciar Produtos</h2>
                        <button onclick="showProductModal()" class="btn-primary px-4 py-2 rounded-lg hover:opacity-90 transition-colors">
                            <i class="fas fa-plus mr-2"></i>Novo Produto
                        </button>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow-md overflow-hidden">
                        <div class="p-4 border-b">
                            <div class="flex space-x-4">
                                <input 
                                    type="text" 
                                    placeholder="Buscar produtos..." 
                                    class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    onkeyup="searchProducts(this.value)"
                                >
                                <select onchange="filterByCategory(this.value)" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500">
                                    <option value="">Todas as Categorias</option>
                                </select>
                            </div>
                        </div>
                        <div id="productsList" class="p-4">
                            <!-- Lista de produtos será carregada aqui -->
                        </div>
                    </div>
                </div>

                <!-- Categories Section -->
                <div id="categoriesSection" class="section hidden">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">Gerenciar Categorias</h2>
                        <button onclick="showCategoryModal()" class="btn-primary px-4 py-2 rounded-lg hover:opacity-90 transition-colors">
                            <i class="fas fa-plus mr-2"></i>Nova Categoria
                        </button>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow-md">
                        <div id="categoriesList" class="p-4">
                            <!-- Lista de categorias será carregada aqui -->
                        </div>
                    </div>
                </div>

                <!-- Config Section -->
                <div id="configSection" class="section hidden">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">Configurações da Loja</h2>
                    
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <form id="configForm" class="space-y-6">
                            <!-- Configurações serão carregadas aqui -->
                        </form>
                    </div>
                </div>
            </main>
        </div>

        <!-- Product Modal -->
        <div id="productModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg max-w-4xl w-full max-h-96 overflow-y-auto">
                    <div class="flex items-center justify-between p-4 border-b">
                        <h3 class="text-lg font-semibold">
                            <i class="fas fa-box mr-2"></i>
                            <span id="productModalTitle">Novo Produto</span>
                        </h3>
                        <button onclick="hideProductModal()" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="productForm" class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nome do Produto *</label>
                                <input type="text" name="name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
                                <select name="category_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500">
                                    <option value="">Selecione uma categoria</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Preço (R$) *</label>
                                <input type="number" name="price" step="0.01" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Estoque *</label>
                                <input type="number" name="stock_quantity" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500">
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                                <textarea name="description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"></textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Imagem do Produto</label>
                                <input type="file" name="image" accept="image/*" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500">
                                <div id="imagePreview" class="mt-2 hidden">
                                    <img src="" alt="Preview" class="w-32 h-32 object-cover rounded">
                                </div>
                            </div>
                            <div class="space-y-4">
                                <div class="flex items-center">
                                    <input type="checkbox" name="featured" id="featured" class="mr-2">
                                    <label for="featured" class="text-sm font-medium text-gray-700">Produto em Destaque</label>
                                </div>
                                <div class="flex items-center">
                                    <input type="checkbox" name="active" id="active" checked class="mr-2">
                                    <label for="active" class="text-sm font-medium text-gray-700">Ativo</label>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Ordem</label>
                                    <input type="number" name="sort_order" value="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500">
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-end space-x-4 mt-6">
                            <button type="button" onclick="hideProductModal()" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
                            <button type="submit" class="btn-primary px-6 py-2 rounded-lg hover:opacity-90">Salvar Produto</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Category Modal -->
        <div id="categoryModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg max-w-md w-full">
                    <div class="flex items-center justify-between p-4 border-b">
                        <h3 class="text-lg font-semibold">
                            <i class="fas fa-tags mr-2"></i>
                            <span id="categoryModalTitle">Nova Categoria</span>
                        </h3>
                        <button onclick="hideCategoryModal()" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="categoryForm" class="p-6">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nome da Categoria *</label>
                                <input type="text" name="name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                                <textarea name="description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"></textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Ícone (Font Awesome)</label>
                                <input type="text" name="image_url" placeholder="fa-tag" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Ordem</label>
                                <input type="number" name="sort_order" value="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500">
                            </div>
                            <div class="flex items-center">
                                <input type="checkbox" name="active" id="categoryActive" checked class="mr-2">
                                <label for="categoryActive" class="text-sm font-medium text-gray-700">Ativa</label>
                            </div>
                        </div>
                        <div class="flex justify-end space-x-4 mt-6">
                            <button type="button" onclick="hideCategoryModal()" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
                            <button type="submit" class="btn-primary px-6 py-2 rounded-lg hover:opacity-90">Salvar Categoria</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            // Variáveis globais
            let currentProductId = null;
            let currentCategoryId = null;
            let categories = [];

            // Carregar dados iniciais
            document.addEventListener('DOMContentLoaded', () => {
                loadDashboard();
                loadProducts();
                loadCategories();
                loadConfig();
                setupEventListeners();
            });

            // Configurar listeners de eventos
            function setupEventListeners() {
                // Formulário de produto
                document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
                document.getElementById('categoryForm').addEventListener('submit', handleCategorySubmit);
                document.getElementById('configForm').addEventListener('submit', handleConfigSubmit);
                
                // Preview de imagem
                document.querySelector('input[name="image"]').addEventListener('change', handleImagePreview);
            }

            // Alternar entre seções
            function showSection(sectionName) {
                // Esconder todas as seções
                document.querySelectorAll('.section').forEach(section => {
                    section.classList.add('hidden');
                });
                
                // Mostrar seção selecionada
                document.getElementById(sectionName + 'Section').classList.remove('hidden');
                
                // Atualizar navegação ativa
                document.querySelectorAll('aside a').forEach(link => {
                    link.classList.remove('bg-white', 'bg-opacity-20');
                });
                event.target.classList.add('bg-white', 'bg-opacity-20');
            }

            // Dashboard
            async function loadDashboard() {
                try {
                    const [productsRes, categoriesRes] = await Promise.all([
                        axios.get('/api/products'),
                        axios.get('/api/categories')
                    ]);
                    
                    const products = productsRes.data.data;
                    const categories = categoriesRes.data.data;
                    
                    // Atualizar estatísticas
                    document.getElementById('totalProducts').textContent = products.length;
                    document.getElementById('totalCategories').textContent = categories.length;
                    document.getElementById('featuredProducts').textContent = products.filter(p => p.featured).length;
                    
                    // Mostrar produtos recentes
                    displayRecentProducts(products.slice(0, 5));
                    
                } catch (error) {
                    console.error('Erro ao carregar dashboard:', error);
                }
            }

            function displayRecentProducts(products) {
                const recentProducts = document.getElementById('recentProducts');
                
                if (products.length === 0) {
                    recentProducts.innerHTML = '<div class="text-center py-8 text-gray-500">Nenhum produto cadastrado</div>';
                    return;
                }
                
                recentProducts.innerHTML = products.map(product => {
                    const imageTag = product.image_url ? 
                        '<img src="' + product.image_url + '" alt="' + product.name + '" class="w-10 h-10 object-cover rounded mr-3">' : 
                        '<i class="fas fa-image text-gray-400 w-10 h-10 flex items-center justify-center bg-gray-100 rounded mr-3"></i>';
                    
                    return '<div class="flex items-center justify-between p-3 border-b hover:bg-gray-50">' +
                        '<div class="flex items-center">' +
                            imageTag +
                            '<div>' +
                                '<h4 class="font-medium">' + product.name + '</h4>' +
                                '<p class="text-sm text-gray-600">R$ ' + product.price.toFixed(2) + '</p>' +
                            '</div>' +
                        '</div>' +
                        '<div class="flex items-center space-x-2">' +
                            (product.featured ? '<span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Destaque</span>' : '') +
                            (product.active ? '<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Ativo</span>' : '<span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Inativo</span>') +
                        '</div>' +
                    '</div>';
                }).join('');
            }

            // Produtos
            async function loadProducts(search = '', category = '') {
                try {
                    const params = {};
                    if (search) params.search = search;
                    if (category) params.category = category;
                    
                    const response = await axios.get('/api/products', { params });
                    displayProducts(response.data.data);
                } catch (error) {
                    console.error('Erro ao carregar produtos:', error);
                }
            }

            function displayProducts(products) {
                const productsList = document.getElementById('productsList');
                
                if (products.length === 0) {
                    productsList.innerHTML = '<div class="text-center py-8 text-gray-500">Nenhum produto encontrado</div>';
                    return;
                }
                
                productsList.innerHTML = products.map(product => {
                    const imageTag = product.image_url ? 
                        '<img src="' + product.image_url + '" alt="' + product.name + '" class="w-12 h-12 object-cover rounded mr-3">' : 
                        '<i class="fas fa-image text-gray-400 w-12 h-12 flex items-center justify-center bg-gray-100 rounded mr-3"></i>';
                    
                    return '<div class="flex items-center justify-between p-4 border-b hover:bg-gray-50">' +
                        '<div class="flex items-center">' +
                            imageTag +
                            '<div>' +
                                '<h3 class="font-medium">' + product.name + '</h3>' +
                                '<p class="text-sm text-gray-600">R$ ' + product.price.toFixed(2) + ' | Estoque: ' + product.stock_quantity + ' | Categoria: ' + product.category_name + '</p>' +
                            '</div>' +
                        '</div>' +
                        '<div class="flex items-center space-x-2">' +
                            '<button onclick="editProduct(' + product.id + ')" class="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50">' +
                                '<i class="fas fa-edit"></i>' +
                            '</button>' +
                            '<button onclick="deleteProduct(' + product.id + ')" class="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50">' +
                                '<i class="fas fa-trash"></i>' +
                            '</button>' +
                        '</div>' +
                    '</div>';
                }).join('');
            }

            function searchProducts(query) {
                loadProducts(query);
            }

            function filterByCategory(categoryId) {
                loadProducts('', categoryId);
            }

            // Modal de Produto
            function showProductModal(productId = null) {
                currentProductId = productId;
                const modal = document.getElementById('productModal');
                const title = document.getElementById('productModalTitle');
                const form = document.getElementById('productForm');
                
                title.textContent = productId ? 'Editar Produto' : 'Novo Produto';
                form.reset();
                
                if (productId) {
                    loadProductData(productId);
                }
                
                loadCategoriesSelect();
                modal.classList.remove('hidden');
            }

            function hideProductModal() {
                document.getElementById('productModal').classList.add('hidden');
                currentProductId = null;
            }

            async function loadProductData(productId) {
                try {
                    // Carregar dados do produto
                    const response = await axios.get('/api/products', { params: { id: productId } });
                    const product = response.data.data.find(p => p.id == productId);
                    
                    if (product) {
                        const form = document.getElementById('productForm');
                        form.name.value = product.name;
                        form.description.value = product.description || '';
                        form.price.value = product.price;
                        form.stock_quantity.value = product.stock_quantity;
                        form.category_id.value = product.category_id;
                        form.sort_order.value = product.sort_order;
                        form.featured.checked = product.featured;
                        form.active.checked = product.active;
                        
                        if (product.image_url) {
                            document.getElementById('imagePreview').querySelector('img').src = product.image_url;
                            document.getElementById('imagePreview').classList.remove('hidden');
                        }
                    }
                } catch (error) {
                    console.error('Erro ao carregar produto:', error);
                }
            }

            async function loadCategoriesSelect() {
                try {
                    const response = await axios.get('/api/categories');
                    categories = response.data.data;
                    
                    const select = document.querySelector('select[name="category_id"]');
                    select.innerHTML = '<option value="">Selecione uma categoria</option>' +
                        categories.map(cat => '<option value="' + cat.id + '">' + cat.name + '</option>').join('');
                    
                    // Também atualizar o filtro de categoria
                    const filterSelect = document.querySelector('select[onchange="filterByCategory(this.value)"]');
                    filterSelect.innerHTML = '<option value="">Todas as Categorias</option>' +
                        categories.map(cat => '<option value="' + cat.id + '">' + cat.name + '</option>').join('');
                        
                } catch (error) {
                    console.error('Erro ao carregar categorias:', error);
                }
            }

            function handleImagePreview(event) {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const preview = document.getElementById('imagePreview');
                        preview.querySelector('img').src = e.target.result;
                        preview.classList.remove('hidden');
                    };
                    reader.readAsDataURL(file);
                }
            }

            async function handleProductSubmit(event) {
                event.preventDefault();
                
                const formData = new FormData(event.target);
                const imageFile = formData.get('image');
                
                let imageUrl = '';
                
                // Fazer upload da imagem se houver
                if (imageFile && imageFile.size > 0) {
                    const imageFormData = new FormData();
                    imageFormData.append('file', imageFile);
                    
                    try {
                        const uploadResponse = await axios.post('/api/upload', imageFormData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                        });
                        imageUrl = uploadResponse.data.url;
                    } catch (error) {
                        alert('Erro ao fazer upload da imagem: ' + error.response?.data?.message);
                        return;
                    }
                }
                
                const productData = {
                    id: currentProductId,
                    name: formData.get('name'),
                    description: formData.get('description'),
                    price: parseFloat(formData.get('price')),
                    category_id: parseInt(formData.get('category_id')),
                    stock_quantity: parseInt(formData.get('stock_quantity')),
                    featured: formData.get('featured') === 'on',
                    active: formData.get('active') === 'on',
                    sort_order: parseInt(formData.get('sort_order'))
                };
                
                try {
                    const response = await axios.post('/api/products', productData);
                    
                    // Atualizar imagem se foi feito upload
                    if (imageUrl && response.data.id) {
                        await axios.post('/api/products/' + response.data.id + '/image', { image_url: imageUrl });
                    }
                    
                    alert(response.data.message);
                    hideProductModal();
                    loadProducts();
                    loadDashboard();
                    
                } catch (error) {
                    alert('Erro ao salvar produto: ' + error.response?.data?.message);
                }
            }

            async function editProduct(productId) {
                showProductModal(productId);
            }

            async function deleteProduct(productId) {
                if (confirm('Tem certeza que deseja excluir este produto?')) {
                    try {
                        const response = await axios.delete('/api/products/' + productId);
                        alert(response.data.message);
                        loadProducts();
                        loadDashboard();
                    } catch (error) {
                        alert('Erro ao excluir produto: ' + error.response?.data?.message);
                    }
                }
            }

            // Categorias
            function showCategoryModal(categoryId = null) {
                currentCategoryId = categoryId;
                const modal = document.getElementById('categoryModal');
                const title = document.getElementById('categoryModalTitle');
                const form = document.getElementById('categoryForm');
                
                title.textContent = categoryId ? 'Editar Categoria' : 'Nova Categoria';
                form.reset();
                
                if (categoryId) {
                    loadCategoryData(categoryId);
                }
                
                modal.classList.remove('hidden');
            }

            function hideCategoryModal() {
                document.getElementById('categoryModal').classList.add('hidden');
                currentCategoryId = null;
            }

            async function loadCategoryData(categoryId) {
                try {
                    const response = await axios.get('/api/categories');
                    const category = response.data.data.find(c => c.id == categoryId);
                    
                    if (category) {
                        const form = document.getElementById('categoryForm');
                        form.name.value = category.name;
                        form.description.value = category.description || '';
                        form.image_url.value = category.image_url || '';
                        form.sort_order.value = category.sort_order;
                        form.active.checked = category.active;
                    }
                } catch (error) {
                    console.error('Erro ao carregar categoria:', error);
                }
            }

            async function handleCategorySubmit(event) {
                event.preventDefault();
                
                const formData = new FormData(event.target);
                const categoryData = {
                    id: currentCategoryId,
                    name: formData.get('name'),
                    description: formData.get('description'),
                    image_url: formData.get('image_url'),
                    sort_order: parseInt(formData.get('sort_order')),
                    active: formData.get('active') === 'on'
                };
                
                try {
                    const response = await axios.post('/api/categories', categoryData);
                    alert(response.data.message);
                    hideCategoryModal();
                    loadCategories();
                    loadCategoriesSelect();
                    
                } catch (error) {
                    alert('Erro ao salvar categoria: ' + error.response?.data?.message);
                }
            }

            async function loadCategories() {
                try {
                    const response = await axios.get('/api/categories');
                    displayCategories(response.data.data);
                } catch (error) {
                    console.error('Erro ao carregar categorias:', error);
                }
            }

            function displayCategories(categories) {
                const categoriesList = document.getElementById('categoriesList');
                
                categoriesList.innerHTML = categories.map(category => {
                    const imageTag = category.image_url ? 
                        '<i class="fas ' + category.image_url + ' text-gray-600 mr-3"></i>' : 
                        '<i class="fas fa-tag text-gray-600 mr-3"></i>';
                    
                    return '<div class="flex items-center justify-between p-4 border-b hover:bg-gray-50">' +
                        '<div class="flex items-center">' +
                            imageTag +
                            '<div>' +
                                '<h3 class="font-medium">' + category.name + '</h3>' +
                                '<p class="text-sm text-gray-600">' + (category.description || 'Sem descrição') + '</p>' +
                            '</div>' +
                        '</div>' +
                        '<div class="flex items-center space-x-2">' +
                            '<button onclick="editCategory(' + category.id + ')" class="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50">' +
                                '<i class="fas fa-edit"></i>' +
                            '</button>' +
                            '<button onclick="deleteCategory(' + category.id + ')" class="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50">' +
                                '<i class="fas fa-trash"></i>' +
                            '</button>' +
                        '</div>' +
                    '</div>';
                }).join('');
            }

            async function editCategory(categoryId) {
                showCategoryModal(categoryId);
            }

            async function deleteCategory(categoryId) {
                if (confirm('Tem certeza que deseja excluir esta categoria?')) {
                    try {
                        const response = await axios.delete('/api/categories/' + categoryId);
                        alert(response.data.message);
                        loadCategories();
                        loadCategoriesSelect();
                    } catch (error) {
                        alert('Erro ao excluir categoria: ' + error.response?.data?.message);
                    }
                }
            }

            // Configurações
            async function loadConfig() {
                try {
                    const response = await axios.get('/api/config');
                    displayConfig(response.data.data);
                } catch (error) {
                    console.error('Erro ao carregar configurações:', error);
                }
            }

            function displayConfig(config) {
                const configForm = document.getElementById('configForm');
                
                configForm.innerHTML = Object.entries(config).map(([key, value]) => {
                    return '<div>' +
                        '<label class="block text-sm font-medium text-gray-700 mb-2">' + formatConfigKey(key) + '</label>' +
                        '<input type="text" name="' + key + '" value="' + value + '" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent">' +
                    '</div>';
                }).join('') + 
                '<div class="pt-4">' +
                    '<button type="submit" class="btn-primary px-6 py-2 rounded-lg hover:opacity-90">' +
                        '<i class="fas fa-save mr-2"></i>Salvar Configurações' +
                    '</button>' +
                '</div>';
            }

            function formatConfigKey(key) {
                return key.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
            }

            async function handleConfigSubmit(event) {
                event.preventDefault();
                
                const formData = new FormData(event.target);
                const configData = {};
                
                for (let [key, value] of formData.entries()) {
                    configData[key] = value;
                }
                
                try {
                    const response = await axios.post('/api/config', configData);
                    alert(response.data.message);
                } catch (error) {
                    alert('Erro ao salvar configurações: ' + error.response?.data?.message);
                }
            }

            // Sair
            function logout() {
                document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                window.location.href = '/admin/login';
            }

            // Inicializar com a seção dashboard
            showSection('dashboard');
        </script>
    </body>
    </html>
  `)
})

// API de login
admin.post('/api/login', async (c) => {
  const { env } = c
  const { username, password } = await c.req.json()
  
  // Verificar credenciais fixas do arquivo de configuração
  const adminUser = await env.DB.prepare(`
    SELECT * FROM admins WHERE username = ? AND password_hash = ?
  `).bind(username, password).first()
  
  if (!adminUser) {
    return c.json({
      success: false,
      message: 'Credenciais inválidas'
    }, 401)
  }
  
  // Gerar token simples (em produção, usar JWT)
  const token = btoa(JSON.stringify({
    id: adminUser.id,
    username: adminUser.username,
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 horas
  }))
  
  return c.json({
    success: true,
    token,
    message: 'Login realizado com sucesso'
  })
})

export const adminRoutes = admin