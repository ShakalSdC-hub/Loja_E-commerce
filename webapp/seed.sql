-- Inserir configurações padrão
INSERT OR IGNORE INTO config (key, value) VALUES 
  ('store_name', 'Distribuidora de Barbearia'),
  ('store_description', 'Produtos e roupas femininas para barbearias'),
  ('whatsapp_number', '5511999999999'),
  ('whatsapp_message', 'Olá! Gostaria de fazer um pedido.'),
  ('store_address', 'Rua das Flores, 123 - Centro'),
  ('store_phone', '(11) 9999-9999'),
  ('store_email', 'contato@distribuidorabarbearia.com'),
  ('store_hours', 'Seg-Sex: 9h-18h | Sáb: 9h-13h'),
  ('currency_symbol', 'R$'),
  ('currency_code', 'BRL'),
  ('theme_primary', '#8B4513'),
  ('theme_secondary', '#D2691E'),
  ('theme_accent', '#CD853F'),
  ('admin_username', 'admin'),
  ('admin_password_hash', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); -- password: password

-- Inserir categorias padrão
INSERT OR IGNORE INTO categories (name, description, sort_order) VALUES 
  ('Roupas Femininas', 'Camisetas, calças, vestidos e mais para o público feminino', 1),
  ('Acessórios', 'Bolsas, cintos, lenços e complementos', 2),
  ('Produtos de Barbearia', 'Produtos específicos para barbearias', 3),
  ('Beleza e Estética', 'Produtos de cuidados pessoais e beleza', 4),
  ('Promoções', 'Produtos em oferta e promoções especiais', 5);

-- Inserir produtos de exemplo
INSERT OR IGNORE INTO products (name, description, price, category_id, stock_quantity, featured) VALUES 
  ('Camiseta Feminina Básica', 'Camiseta confortável em algodão, ideal para o dia a dia', 29.90, 1, 50, 1),
  ('Calça Jeans Feminina', 'Calça jeans com corte moderno e confortável', 89.90, 1, 30, 1),
  ('Vestido Social', 'Vestido elegante para ocasiões especiais', 149.90, 1, 20, 0),
  ('Bolsa Transversal', 'Bolsa prática e espaçosa para o dia a dia', 79.90, 2, 25, 1),
  ('Cinto de Couro', 'Cinto em couro legítimo, duração garantida', 59.90, 2, 40, 0),
  ('Lenço de Seda', 'Lenço elegante para compor o visual', 39.90, 2, 35, 0),
  ('Shampoo Profissional', 'Shampoo de alta qualidade para barbearias', 34.90, 3, 100, 1),
  ('Creme de Barbear', 'Creme especial para barbear suave', 24.90, 3, 80, 0),
  ('Óleo para Barba', 'Óleo hidratante para cuidar da barba', 49.90, 3, 60, 0),
  ('Creme Hidratante', 'Creme corporal hidratante, ideal para todos os tipos de pele', 19.90, 4, 70, 0),
  ('Perfume Feminino', 'Fragrância suave e duradoura', 129.90, 4, 45, 1);

-- Inserir variações de exemplo
INSERT OR IGNORE INTO product_variations (product_id, name, value, price_adjustment, stock_quantity) VALUES 
  (1, 'Tamanho', 'P', 0, 15),
  (1, 'Tamanho', 'M', 0, 20),
  (1, 'Tamanho', 'G', 0, 10),
  (1, 'Tamanho', 'GG', 5.00, 5),
  (2, 'Tamanho', '36', 0, 8),
  (2, 'Tamanho', '38', 0, 10),
  (2, 'Tamanho', '40', 0, 7),
  (2, 'Tamanho', '42', 0, 5),
  (4, 'Cor', 'Preta', 0, 10),
  (4, 'Cor', 'Marrom', 0, 8),
  (4, 'Cor', 'Bege', 0, 7);