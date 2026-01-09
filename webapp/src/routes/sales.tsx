import { Hono } from 'hono'

const sales = new Hono<{ Bindings: Bindings }>()

// Página inicial - catálogo de produtos
sales.get('/home', async (c) => {
  const { env } = c
  
  // Buscar configurações da loja
  const storeName = await env.KV.get('store_name') || 'Distribuidora de Barbearia'
  const storeDescription = await env.KV.get('store_description') || 'Produtos e roupas femininas para barbearias'
  const whatsappNumber = await env.KV.get('whatsapp_number') || '5511999999999'
  const themePrimary = await env.KV.get('theme_primary') || '#8B4513'
  
  // Buscar categorias ativas
  const categories = await env.DB.prepare(`
    SELECT * FROM categories 
    WHERE active = 1 
    ORDER BY sort_order, name
  `).all()
  
  // Buscar produtos em destaque
  const featuredProducts = await env.DB.prepare(`
    SELECT p.*, c.name as category_name 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.active = 1 AND p.featured = 1
    ORDER BY p.sort_order, p.name
  `).all()
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${storeName}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            :root {
                --primary-color: ${themePrimary};
            }
            .primary-bg { background-color: var(--primary-color); }
            .primary-text { color: var(--primary-color); }
            .product-card {
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .product-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            }
            .whatsapp-btn {
                background-color: #25D366;
                color: white;
                transition: background-color 0.2s;
            }
            .whatsapp-btn:hover {
                background-color: #128C7E;
            }
            .cart-badge {
                position: absolute;
                top: -8px;
                right: -8px;
                background-color: #ef4444;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
            }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <header class="primary-bg text-white shadow-lg">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold">${storeName}</h1>
                        <p class="text-sm opacity-90">${storeDescription}</p>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button onclick="showCart()" class="relative p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors">
                            <i class="fas fa-shopping-cart text-xl"></i>
                            <span id="cartBadge" class="cart-badge hidden">0</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <!-- Categorias -->
        <section class="bg-white shadow-sm">
            <div class="container mx-auto px-4 py-6">
                <div class="flex overflow-x-auto space-x-4 pb-2">
                    <button onclick="filterByCategory('all')" class="category-btn px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors whitespace-nowrap">
                        <i class="fas fa-th mr-2"></i>Todos
                    </button>
                    ${categories.results.map(cat => `
                        <button onclick="filterByCategory(${cat.id})" class="category-btn px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors whitespace-nowrap">
                            <i class="fas ${cat.image_url || 'fa-tag'} mr-2"></i>${cat.name}
                        </button>
                    `).join('')}
                </div>
            </div>
        </section>

        <!-- Produtos em Destaque -->
        <section class="container mx-auto px-4 py-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
                <i class="fas fa-star text-yellow-500 mr-2"></i>Produtos em Destaque
            </h2>
            
            <div id="productsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                ${featuredProducts.results.map(product => `
                    <div class="product-card bg-white rounded-lg shadow-md overflow-hidden" data-category="${product.category_id}">
                        <div class="aspect-square bg-gray-200 flex items-center justify-center">
                            ${product.image_url ? 
                                `<img src="${product.image_url}" alt="${product.name}" class="w-full h-full object-cover">` :
                                `<i class="fas fa-image text-gray-400 text-4xl"></i>`
                            }
                        </div>
                        <div class="p-4">
                            <h3 class="font-semibold text-lg text-gray-800 mb-2">${product.name}</h3>
                            <p class="text-gray-600 text-sm mb-3 line-clamp-2">${product.description || 'Sem descrição'}</p>
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-2xl font-bold primary-text">R$ ${product.price.toFixed(2)}</span>
                                <span class="text-sm text-gray-500">${product.stock_quantity > 0 ? `Disponível: ${product.stock_quantity}` : 'Indisponível'}</span>
                            </div>
                            <button 
                                onclick="addToCart(${product.id}, '${product.name}', ${product.price}, '${product.image_url || ''}')" 
                                class="w-full primary-bg text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:bg-gray-300 disabled:cursor-not-allowed"
                                ${product.stock_quantity > 0 ? '' : 'disabled'}
                            >
                                <i class="fas fa-cart-plus mr-2"></i>Adicionar ao Carrinho
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>

            ${featuredProducts.results.length === 0 ? `
                <div class="text-center py-12">
                    <i class="fas fa-box-open text-gray-300 text-6xl mb-4"></i>
                    <h3 class="text-xl text-gray-600">Nenhum produto em destaque no momento</h3>
                    <p class="text-gray-500">Volte em breve para conferir nossas novidades!</p>
                </div>
            ` : ''}
        </section>

        <!-- Footer -->
        <footer class="bg-gray-800 text-white py-8 mt-12">
            <div class="container mx-auto px-4 text-center">
                <p class="mb-2">${storeName} - Todos os direitos reservados</p>
                <p class="text-sm text-gray-400">Para compras, clique em "Finalizar Compra" que você será direcionado ao nosso WhatsApp</p>
            </div>
        </footer>

        <!-- Modal do Carrinho -->
        <div id="cartModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg max-w-md w-full max-h-96 overflow-hidden">
                    <div class="flex items-center justify-between p-4 border-b">
                        <h3 class="text-lg font-semibold">
                            <i class="fas fa-shopping-cart mr-2"></i>Carrinho de Compras
                        </h3>
                        <button onclick="hideCart()" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div id="cartItems" class="p-4 overflow-y-auto max-h-64">
                        <!-- Itens do carrinho serão inseridos aqui -->
                    </div>
                    <div class="p-4 border-t">
                        <div class="flex justify-between items-center mb-4">
                            <span class="font-semibold">Total:</span>
                            <span id="cartTotal" class="text-xl font-bold primary-text">R$ 0,00</span>
                        </div>
                        <button onclick="checkout()" class="w-full whatsapp-btn py-3 px-4 rounded-lg font-semibold">
                            <i class="fab fa-whatsapp mr-2"></i>Finalizar Compra via WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            let currentCategory = 'all';

            // Atualizar badge do carrinho
            function updateCartBadge() {
                const badge = document.getElementById('cartBadge');
                const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                
                if (totalItems > 0) {
                    badge.textContent = totalItems;
                    badge.classList.remove('hidden');
                } else {
                    badge.classList.add('hidden');
                }
            }

            // Adicionar ao carrinho
            function addToCart(id, name, price, image) {
                const existingItem = cart.find(item => item.id === id);
                
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({ id, name, price, image, quantity: 1 });
                }
                
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartBadge();
                showNotification('Produto adicionado ao carrinho!', 'success');
            }

            // Mostrar carrinho
            function showCart() {
                updateCartDisplay();
                document.getElementById('cartModal').classList.remove('hidden');
            }

            // Esconder carrinho
            function hideCart() {
                document.getElementById('cartModal').classList.add('hidden');
            }

            // Atualizar display do carrinho
            function updateCartDisplay() {
                const cartItems = document.getElementById('cartItems');
                const cartTotal = document.getElementById('cartTotal');
                
                if (cart.length === 0) {
                    cartItems.innerHTML = '<div class="text-center py-8"><i class="fas fa-shopping-cart text-gray-300 text-4xl mb-4"></i><p class="text-gray-500">Seu carrinho está vazio</p></div>';
                    cartTotal.textContent = 'R$ 0,00';
                    return;
                }

                let total = 0;
                cartItems.innerHTML = cart.map(item => {
                    const subtotal = item.price * item.quantity;
                    total += subtotal;
                    
                    return '<div class="flex items-center justify-between mb-4 pb-4 border-b">' +
                        '<div class="flex items-center">' +
                            (item.image ? '<img src="' + item.image + '" alt="' + item.name + '" class="w-12 h-12 object-cover rounded mr-3">' : '<i class="fas fa-image text-gray-400 w-12 h-12 flex items-center justify-center bg-gray-100 rounded mr-3"></i>') +
                            '<div>' +
                                '<h4 class="font-medium">' + item.name + '</h4>' +
                                '<p class="text-sm text-gray-600">R$ ' + item.price.toFixed(2) + '</p>' +
                            '</div>' +
                        '</div>' +
                        '<div class="flex items-center space-x-2">' +
                            '<button onclick="updateQuantity(' + item.id + ', -1)" class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300">' +
                                '<i class="fas fa-minus text-xs"></i>' +
                            '</button>' +
                            '<span class="w-8 text-center">' + item.quantity + '</span>' +
                            '<button onclick="updateQuantity(' + item.id + ', 1)" class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300">' +
                                '<i class="fas fa-plus text-xs"></i>' +
                            '</button>' +
                            '<button onclick="removeFromCart(' + item.id + ')" class="ml-2 text-red-500 hover:text-red-700">' +
                                '<i class="fas fa-trash"></i>' +
                            '</button>' +
                        '</div>' +
                    '</div>';
                }).join('');
                
                cartTotal.textContent = 'R$ ' + total.toFixed(2);
            }

            // Atualizar quantidade
            function updateQuantity(id, change) {
                const item = cart.find(item => item.id === id);
                if (item) {
                    item.quantity += change;
                    if (item.quantity <= 0) {
                        removeFromCart(id);
                    } else {
                        localStorage.setItem('cart', JSON.stringify(cart));
                        updateCartDisplay();
                        updateCartBadge();
                    }
                }
            }

            // Remover do carrinho
            function removeFromCart(id) {
                cart = cart.filter(item => item.id !== id);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartDisplay();
                updateCartBadge();
            }

            // Finalizar compra
            function checkout() {
                if (cart.length === 0) {
                    showNotification('Seu carrinho está vazio!', 'error');
                    return;
                }

                const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const itemsText = cart.map(item => '\n• ' + item.name + ' - R$ ' + item.price.toFixed(2) + ' x ' + item.quantity + ' = R$ ' + (item.price * item.quantity).toFixed(2)).join('');
                
                const message = 'Olá! Gostaria de fazer um pedido:\n\n📋 ITENS DO PEDIDO:' + itemsText + '\n\n💰 TOTAL: R$ ' + total.toFixed(2) + '\n\nPor favor, confirme a disponibilidade e me informe as formas de pagamento. Obrigado!';

                const whatsappUrl = 'https://wa.me/' + '${whatsappNumber}' + '?text=' + encodeURIComponent(message);
                
                window.open(whatsappUrl, '_blank');
                
                // Limpar carrinho após envio
                setTimeout(() => {
                    if (confirm('Pedido enviado! Deseja limpar o carrinho?')) {
                        cart = [];
                        localStorage.setItem('cart', JSON.stringify(cart));
                        updateCartBadge();
                        hideCart();
                    }
                }, 1000);
            }

            // Notificação
            function showNotification(message, type = 'info') {
                const notification = document.createElement('div');
                notification.className = 'fixed top-4 right-4 p-4 rounded-lg text-white z-50 ' + (type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500');
                notification.innerHTML = '<div class="flex items-center"><i class="fas ' + (type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle') + ' mr-2"></i><span>' + message + '</span><button onclick="this.parentElement.parentElement.remove()" class="ml-4"><i class="fas fa-times"></i></button></div>';
                
                document.body.appendChild(notification);
                setTimeout(() => notification.remove(), 3000);
            }

            // Inicialização
            updateCartBadge();
        </script>
    </body>
    </html>
  `)
})

export { sales as salesRoutes }