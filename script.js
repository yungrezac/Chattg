// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;

// Основные элементы DOM
const chatsPage = document.getElementById('chats-page');
const profilePage = document.getElementById('profile-page');
const chatsNav = document.getElementById('chats-nav');
const profileNav = document.getElementById('profile-nav');
const chatsList = document.getElementById('chats-list');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const userUsername = document.getElementById('user-username');
const shareChatBtn = document.getElementById('share-chat-btn');
const joinChatBtn = document.getElementById('join-chat-btn');
const qrModal = document.getElementById('qr-modal');
const scannerModal = document.getElementById('scanner-modal');
const qrCodeContainer = document.getElementById('qr-code-container');
const scannerContainer = document.getElementById('scanner-container');

// Инициализация приложения
function initApp() {
    // Настройка WebApp
    tg.expand();
    tg.enableClosingConfirmation();
    tg.BackButton.hide();
    
    // Загрузка данных пользователя
    loadUserData();
    
    // Загрузка чатов
    loadChats();
    
    // Настройка навигации
    setupNavigation();
    
    // Настройка кнопок профиля
    setupProfileButtons();
}

// Загрузка данных пользователя
function loadUserData() {
    const user = tg.initDataUnsafe.user;
    if (user) {
        userName.textContent = `${user.first_name} ${user.last_name || ''}`.trim();
        userUsername.textContent = `@${user.username}`;
        
        if (user.photo_url) {
            userAvatar.src = user.photo_url;
        } else {
            userAvatar.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
        }
    }
}

// Загрузка чатов (заглушка)
function loadChats() {
    // В реальном приложении здесь будет запрос к вашему бэкенду
    const mockChats = [
        { id: 1, title: "Общий чат", lastMessage: "Привет! Как дела?", unread: 2 },
        { id: 2, title: "Рабочая группа", lastMessage: "Завтра встреча в 10:00", unread: 0 },
        { id: 3, title: "Друзья", lastMessage: "Кто сегодня свободен?", unread: 5 }
    ];
    
    chatsList.innerHTML = '';
    
    mockChats.forEach(chat => {
        const chatElement = document.createElement('div');
        chatElement.className = 'chat-item';
        chatElement.innerHTML = `
            <h3>${chat.title}</h3>
            <p>${chat.lastMessage}</p>
            ${chat.unread > 0 ? `<span class="unread-badge">${chat.unread}</span>` : ''}
        `;
        chatElement.addEventListener('click', () => openChat(chat.id));
        chatsList.appendChild(chatElement);
    });
}

// Открытие чата
function openChat(chatId) {
    // В реальном приложении здесь будет открытие чата
    tg.showAlert(`Открыт чат с ID: ${chatId}`);
}

// Настройка навигации
function setupNavigation() {
    chatsNav.addEventListener('click', () => {
        chatsPage.classList.add('active');
        profilePage.classList.remove('active');
        chatsNav.classList.add('active');
        profileNav.classList.remove('active');
    });
    
    profileNav.addEventListener('click', () => {
        profilePage.classList.add('active');
        chatsPage.classList.remove('active');
        profileNav.classList.add('active');
        chatsNav.classList.remove('active');
    });
}

// Настройка кнопок профиля
function setupProfileButtons() {
    // Кнопка "Поделиться чатом"
    shareChatBtn.addEventListener('click', () => {
        generateQRCode();
        qrModal.style.display = 'flex';
    });
    
    // Кнопка "Подключиться к чату"
    joinChatBtn.addEventListener('click', () => {
        openQRScanner();
        scannerModal.style.display = 'flex';
    });
    
    // Закрытие модальных окон
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            qrModal.style.display = 'none';
            scannerModal.style.display = 'none';
            stopQRScanner();
        });
    });
}

// Генерация QR-кода
function generateQRCode() {
    const user = tg.initDataUnsafe.user;
    if (!user) return;
    
    // В реальном приложении здесь будет уникальная ссылка для подключения к вашему чату
    const chatInviteLink = `https://t.me/${user.username}?start=chat_${user.id}`;
    
    qrCodeContainer.innerHTML = '';
    QRCode.toCanvas(qrCodeContainer, chatInviteLink, { width: 200 }, (error) => {
        if (error) console.error('QR generation error:', error);
    });
}

// Открытие сканера QR
function openQRScanner() {
    scannerContainer.innerHTML = '<p>Инициализация сканера...</p>';
    
    // В реальном приложении здесь будет использование Telegram WebApp API для сканирования QR
    // Это примерная реализация, так как прямой доступ к камере требует разрешений
    
    setTimeout(() => {
        // Эмуляция сканирования QR для демонстрации
        scannerContainer.innerHTML = `
            <video id="scanner-video" autoplay playsinline></video>
            <canvas id="scanner-canvas" style="display:none;"></canvas>
        `;
        
        // В реальном приложении здесь будет код для работы с камерой
        // Например, с использованием библиотеки Instascan или аналогичной
        
        // Эмуляция сканирования через 3 секунды
        setTimeout(() => {
            handleScannedQR('https://t.me/demo_user?start=chat_12345');
        }, 3000);
    }, 1000);
}

// Обработка отсканированного QR
function handleScannedQR(data) {
    stopQRScanner();
    scannerModal.style.display = 'none';
    
    // Извлечение ID чата из данных QR
    const chatIdMatch = data.match(/chat_(\d+)/);
    if (chatIdMatch && chatIdMatch[1]) {
        const chatId = chatIdMatch[1];
        tg.showAlert(`Подключение к чату ID: ${chatId}`);
        // В реальном приложении здесь будет переход в чат
    } else {
        tg.showAlert('Неверный QR-код чата');
    }
}

// Остановка сканера QR
function stopQRScanner() {
    const video = document.getElementById('scanner-video');
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
    scannerContainer.innerHTML = '<p>Сканер остановлен</p>';
}

// Инициализация приложения при загрузке
document.addEventListener('DOMContentLoaded', initApp);
