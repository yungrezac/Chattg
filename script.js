class TelegramChatApp {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.initData = this.tg.initData || '';
        this.initDataUnsafe = this.tg.initDataUnsafe || {};
        this.user = this.initDataUnsafe.user || {};
        this.chats = [];
        this.currentChatId = null;
        
        this.initElements();
        this.setupEventListeners();
        this.initApp();
    }
    
    initElements() {
        // Pages
        this.chatsPage = document.getElementById('chats-page');
        this.profilePage = document.getElementById('profile-page');
        
        // Navigation
        this.chatsNav = document.getElementById('chats-nav');
        this.profileNav = document.getElementById('profile-nav');
        
        // Chat list
        this.chatsList = document.getElementById('chats-list');
        
        // User profile
        this.userAvatar = document.getElementById('user-avatar');
        this.userName = document.getElementById('user-name');
        this.userUsername = document.getElementById('user-username');
        
        // Buttons
        this.shareChatBtn = document.getElementById('share-chat-btn');
        this.joinChatBtn = document.getElementById('join-chat-btn');
        this.copyInviteLinkBtn = document.getElementById('copy-invite-link');
        
        // Modals
        this.qrModal = document.getElementById('qr-modal');
        this.qrCodeContainer = document.getElementById('qr-code-container');
        
        // Close buttons
        this.closeButtons = document.querySelectorAll('.close-btn');
    }
    
    setupEventListeners() {
        // Navigation
        this.chatsNav.addEventListener('click', () => this.showPage('chats'));
        this.profileNav.addEventListener('click', () => this.showPage('profile'));
        
        // Buttons
        this.shareChatBtn.addEventListener('click', () => this.showQRCode());
        this.joinChatBtn.addEventListener('click', () => this.openQRScanner());
        this.copyInviteLinkBtn.addEventListener('click', () => this.copyInviteLink());
        
        // Close modals
        this.closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModals();
            });
        });
        
        // Handle back button
        this.tg.onEvent('backButtonClicked', () => {
            if (this.qrModal.style.display === 'flex') {
                this.closeModals();
            } else {
                this.tg.close();
            }
        });
    }
    
    initApp() {
        // Configure WebApp
        this.tg.expand();
        this.tg.enableClosingConfirmation();
        this.tg.BackButton.hide();
        this.tg.MainButton.hide();
        
        // Set viewport height for mobile browsers
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
        window.addEventListener('resize', () => {
            document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
        });
        
        // Load user data
        this.loadUserData();
        
        // Load chats
        this.loadChats();
        
        // Set theme change handler
        this.tg.onEvent('themeChanged', this.updateTheme);
        this.updateTheme();
    }
    
    updateTheme() {
        document.body.className = this.tg.colorScheme;
    }
    
    loadUserData() {
        if (this.user) {
            this.userName.textContent = [this.user.first_name, this.user.last_name].filter(Boolean).join(' ');
            
            if (this.user.username) {
                this.userUsername.textContent = `@${this.user.username}`;
            } else {
                this.userUsername.style.display = 'none';
            }
            
            if (this.user.photo_url) {
                this.userAvatar.src = this.user.photo_url;
            } else {
                this.userAvatar.src = this.getDefaultAvatar();
            }
        }
    }
    
    getDefaultAvatar() {
        return this.tg.colorScheme === 'dark' ? 
            'https://cdn-icons-png.flaticon.com/512/149/149071.png?dark=1' : 
            'https://cdn-icons-png.flaticon.com/512/149/149071.png';
    }
    
    loadChats() {
        // In a real app, you would fetch this from your backend
        this.chats = [
            { id: 1, title: "Общий чат", lastMessage: "Привет! Как дела?", unread: 2, avatar: '' },
            { id: 2, title: "Рабочая группа", lastMessage: "Завтра встреча в 10:00", unread: 0, avatar: '' },
            { id: 3, title: "Друзья", lastMessage: "Кто сегодня свободен?", unread: 5, avatar: '' }
        ];
        
        this.renderChats();
    }
    
    renderChats() {
        this.chatsList.innerHTML = '';
        
        this.chats.forEach(chat => {
            const chatElement = document.createElement('div');
            chatElement.className = 'chat-item';
            chatElement.innerHTML = `
                <div class="chat-avatar">
                    ${chat.avatar ? `<img src="${chat.avatar}" alt="${chat.title}">` : '👥'}
                </div>
                <div class="chat-info">
                    <div class="chat-title">${chat.title}</div>
                    <div class="chat-preview">${chat.lastMessage}</div>
                </div>
                ${chat.unread > 0 ? `<div class="unread-badge">${chat.unread}</div>` : ''}
            `;
            
            chatElement.addEventListener('click', () => this.openChat(chat.id));
            this.chatsList.appendChild(chatElement);
        });
    }
    
    showPage(page) {
        if (page === 'chats') {
            this.chatsPage.classList.add('active');
            this.profilePage.classList.remove('active');
            this.chatsNav.classList.add('active');
            this.profileNav.classList.remove('active');
        } else {
            this.profilePage.classList.add('active');
            this.chatsPage.classList.remove('active');
            this.profileNav.classList.add('active');
            this.chatsNav.classList.remove('active');
        }
    }
    
    openChat(chatId) {
        this.currentChatId = chatId;
        this.tg.showPopup({
            title: 'Открытие чата',
            message: `Вы будете перенаправлены в чат ${chatId}`,
            buttons: [
                { id: 'open', type: 'default', text: 'Открыть' },
                { type: 'cancel' }
            ]
        }, (buttonId) => {
            if (buttonId === 'open') {
                // In a real app, you would open the chat
                this.tg.showAlert(`Чат ${chatId} открыт`);
            }
        });
    }
    
    showQRCode() {
        if (!this.user.id) {
            this.tg.showAlert('Не удалось загрузить данные пользователя');
            return;
        }
        
        // Generate unique invite link
        const inviteLink = `https://t.me/${this.tg.initDataUnsafe.user.username || 'user'}_${this.user.id}`;
        this.currentInviteLink = inviteLink;
        
        // Generate QR code
        this.qrCodeContainer.innerHTML = '';
        QRCode.toCanvas(this.qrCodeContainer, inviteLink, { 
            width: 200,
            color: {
                dark: this.tg.colorScheme === 'dark' ? '#ffffff' : '#000000',
                light: 'transparent'
            }
        }, (error) => {
            if (error) {
                console.error('QR code error:', error);
                this.tg.showAlert('Ошибка генерации QR-кода');
                return;
            }
            
            // Adjust QR code styling
            const canvas = this.qrCodeContainer.querySelector('canvas');
            if (canvas) {
                canvas.style.backgroundColor = this.tg.colorScheme === 'dark' ? '#18222d' : '#ffffff';
                canvas.style.padding = '12px';
                canvas.style.borderRadius = '8px';
            }
        });
        
        // Show modal
        this.qrModal.style.display = 'flex';
        this.tg.BackButton.show();
    }
    
    openQRScanner() {
        this.tg.showScanQrPopup({
            text: 'Наведите камеру на QR-код для подключения к чату'
        }, (text) => {
            if (text) {
                this.handleScannedQR(text);
            } else {
                this.tg.showAlert('Сканирование отменено');
            }
        });
    }
    
    handleScannedQR(text) {
        // Parse chat ID from QR code
        const chatIdMatch = text.match(/_(\d+)$/);
        if (chatIdMatch && chatIdMatch[1]) {
            const chatId = chatIdMatch[1];
            this.tg.showAlert(`Подключение к чату пользователя с ID: ${chatId}`, () => {
                // In a real app, you would connect to the chat
                this.loadChats();
            });
        } else {
            this.tg.showAlert('Неверный QR-код. Пожалуйста, сканируйте только коды этого приложения.');
        }
    }
    
    copyInviteLink() {
        if (!this.currentInviteLink) return;
        
        navigator.clipboard.writeText(this.currentInviteLink).then(() => {
            this.tg.showAlert('Ссылка скопирована в буфер обмена');
        }).catch(err => {
            console.error('Copy failed:', err);
            this.tg.showAlert('Не удалось скопировать ссылку');
        });
    }
    
    closeModals() {
        this.qrModal.style.display = 'none';
        this.tg.BackButton.hide();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new TelegramChatApp();
    
    // Expose app to window for debugging
    window.app = app;
});
