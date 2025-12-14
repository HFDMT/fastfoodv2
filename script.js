// Инициализация переменных
let cart = [];
let currentSlide = 0;
let supplierSlide = 0;

// Данные продуктов
const products = [
    { id: 1, name: "Бургер", price: 256, category: "burgers", image: "product1.png" },
    { id: 2, name: "Ролл", price: 156, category: "snacks", image: "product2.png" },
    { id: 3, name: "Картошка", price: 161, category: "snacks", image: "product3.png" },
    { id: 4, name: "Курочка", price: 206, category: "snacks", image: "product4.png" },
    { id: 5, name: "Милкшейк", price: 106, category: "drinks", image: "product5.png" },
    { id: 6, name: "Чизкейк", price: 102, category: "desserts", image: "product6.png" },
    { id: 7, name: "Наггетсы", price: 207, category: "snacks", image: "product7.png" },
    { id: 8, name: "Люксовый Бургер", price: 556, category: "burgers", image: "product8.png" },
    { id: 9, name: "Соус", price: 56, category: "snacks", image: "product9.png" },
    { id: 10, name: "Игрушка", price: 356, category: "snacks", image: "product10.png" },
    { id: 11, name: "Носочки", price: 560, category: "snacks", image: "product11.png" }
];

// DOM элементы
const burgerMenuBtn = document.getElementById('burgerMenu');
const mobileMenu = document.getElementById('mobileMenu');
const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const feedbackModal = document.getElementById('feedbackModal');
const closeModals = document.querySelectorAll('.close-modal');
const categoryBtns = document.querySelectorAll('.category-btn');
const productsGrid = document.querySelector('.products-grid');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.querySelector('.cart-count');
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const supplierSlides = document.querySelectorAll('.suppliers-slide');
const supplierDots = document.querySelectorAll('.supplier-dot');

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    initSuppliersSlider();
    renderProducts('all');
    loadCartFromStorage();
    updateCartUI();
});

// Бургер меню
burgerMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
});

// Закрытие мобильного меню при клике на ссылку
document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });
});

// Модальное окно корзины
cartBtn.addEventListener('click', () => {
    cartModal.classList.add('active');
});


// Закрытие модальных окон
closeModals.forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    });
});

// Закрытие при клике вне окна
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Фильтрация по категориям
categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Удаляем активный класс у всех кнопок
        categoryBtns.forEach(b => b.classList.remove('active'));
        // Добавляем активный класс текущей кнопке
        btn.classList.add('active');
        // Рендерим продукты выбранной категории
        renderProducts(btn.dataset.category);
    });
});

// Рендеринг продуктов
function renderProducts(category) {
    productsGrid.innerHTML = '';
    
    const filteredProducts = category === 'all' 
        ? products 
        : products.filter(product => product.category === category);
    
    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image"><img src="./images/${product.image}" alt="${product.image}"></div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">${product.price} ₽</div>
                <button class="add-to-cart" data-id="${product.id}">
                    В корзину
                </button>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
    
    // Добавляем обработчики событий для кнопок "В корзину"
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.dataset.id);
            addToCart(productId);
        });
    });
}

// Функции корзины
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCartToStorage();
    updateCartUI();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartUI();
}

function updateQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = quantity;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCartToStorage();
            updateCartUI();
        }
    }
}

function updateCartUI() {
    // Обновляем счетчик в корзине
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Обновляем содержимое модального окна корзины
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Корзина пуста</p>';
        cartTotal.textContent = '0 ₽';
        return;
    }
    
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div>
                <h4>${item.name}</h4>
                <p>${item.price} ₽ × ${item.quantity}</p>
            </div>
            <div>
                <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                <button class="remove-btn" data-id="${item.id}">×</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = `${total} ₽`;
    
    // Добавляем обработчики событий для кнопок в корзине
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.dataset.id);
            const action = e.target.dataset.action;
            const item = cart.find(item => item.id === productId);
            
            if (action === 'increase') {
                updateQuantity(productId, item.quantity + 1);
            } else if (action === 'decrease') {
                updateQuantity(productId, item.quantity - 1);
            }
        });
    });
    
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.dataset.id);
            removeFromCart(productId);
        });
    });
}

// Локальное хранилище
function saveCartToStorage() {
    localStorage.setItem('bistroest_cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('bistroest_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Карусель
function initCarousel() {
    setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        updateCarousel();
    }, 5000);
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            updateCarousel();
        });
    });
}

function updateCarousel() {
    const track = document.querySelector('.carousel-track');
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
    
    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
    });
}

// Слайдер поставщиков
function initSuppliersSlider() {
    setInterval(() => {
        supplierSlide = (supplierSlide + 1) % supplierSlides.length;
        updateSuppliersSlider();
    }, 7000);
    
    supplierDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            supplierSlide = index;
            updateSuppliersSlider();
        });
    });
}

function updateSuppliersSlider() {
    const track = document.querySelector('.slider-track');
    track.style.transform = `translateX(-${supplierSlide * 100}%)`;
    
    supplierDots.forEach((dot, index) => {
        dot.classList.toggle('active', index === supplierSlide);
    });
    
    supplierSlides.forEach((slide, index) => {
        slide.classList.toggle('active', index === supplierSlide);
    });
}

// Оформление заказа
document.querySelector('.order-btn')?.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Корзина пуста!');
        return;
    }
    
    alert('Заказ оформлен! С вами свяжутся для подтверждения.');
    cart = [];
    saveCartToStorage();
    updateCartUI();
    cartModal.classList.remove('active');
});