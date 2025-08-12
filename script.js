class TelegramChatApp {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.initData = this.tg.initData || '';
        this.initDataUnsafe = this.tg.initDataUnsafe || {};
        this.user = this.initDataUnsafe.user || {};
        this.chats = [];
        this.currentChatId = null;
        this.currentInviteLink = '';
        this.isLoading = true;
        
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
        this.chatSearch = document.getElementById('chat-search');
        this.newChatBtn = document.getElementById('new-chat-btn');
        
        // User profile
        this.userAvatar = document.getElementById('user-avatar');
        this.userName = document.getElementById('user-name');
        this.userUsername = document.getElementById('user-username');
        this.userId = document.getElementById('user-id');
        
        // Buttons
        this.shareChatBtn = document.getElementById('share-chat-btn');
        this.joinChatBtn = document.getElementById('join-chat-btn');
        this.copyInviteLinkBtn = document.getElementById('copy-invite-link');
        this.shareInviteBtn = document.getElementById('share-invite-btn');
        this.createChatBtn = document.getElementById('create-chat-btn');
        
        // Modals
        this.qrModal = document.getElementById('qr-modal');
        this.qrCodeContainer = document.getElementById('qr-code-container');
        this.inviteLinkInput = document.getElementById('invite-link');
        this.newChatModal = document.getElementById('new-chat-modal');
        
        // Settings
        this.darkModeToggle = document.getElementById('dark-mode-toggle');
        this.notificationsToggle = document.getElementById('notifications-toggle');
        
        // Toast
        this.toast = document.getElementById('toast');
    }
    
    setupEventListeners() {
        // Navigation
        this.chatsNav.addEventListener('click', () => this.showPage('chats'));
        this.profileNav.addEventListener('click', () => this.showPage('profile'));
        
        // Chat actions
        this.newChatBtn.addEventListener('click', () => this.showNewChatModal());
        this.createChatBtn.addEventListener('click', () => this.createNewChat());
        this.chatSearch.addEventListener('input', () => this.searchChats());
        
        // Profile buttons
        this.shareChatBtn.addEventListener('click', () => this.showQRCode());
        this.joinChatBtn.addEventListener('click', () => this.openQRScanner());
        this.copyInviteLinkBtn.addEventListener('click', () => this.copyInviteLink());
        this.shareInviteBtn.addEventListener('click', () => this.shareInviteLink());
        
        // Close modals
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });
        
        // Settings
        this.darkModeToggle.addEventListener('change', () => this.toggleDarkMode());
        this.notificationsToggle.addEventListener('change', () => this.toggleNotifications());
        
        // Handle back button
        this.tg.onEvent('backButtonClicked', () => {
            if (this.qrModal.style.display === 'flex' || this.newChatModal.style.display === 'flex') {
                this.closeModals();
            } else {
                this.tg.close();
            }
        });
        
        // Handle theme change
        this.tg.onEvent('themeChanged', this.updateTheme.bind(this));
        
        // Handle viewport changes
        window.addEventListener('resize', this.handleViewportChange.bind(this));
    }
    
    initApp() {
        // Configure WebApp
        this.tg.expand();
        this.tg.enableClosingConfirmation();
        this.tg.BackButton.hide();
        this.tg.MainButton.hide();
        
        // Set viewport height for mobile browsers
        this.handleViewportChange();
        
        // Load user data
        this.loadUserData();
        
        // Load chats
        this.loadChats();
        
        // Update theme
        this.updateTheme();
        
        // Check for system dark mode preference
        this.checkSystemDarkMode();
    }
    
    handleViewportChange() {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    }
    
    loadUserData() {
        if (this.user) {
            this.userName.textContent = [this.user.first_name, this.user.last_name].filter(Boolean).join(' ');
            
            if (this.user.username) {
                this.userUsername.textContent = `@${this.user.username}`;
            } else {
                this.userUsername.style.display = 'none';
            }
            
            this.userId.textContent = `ID: ${this.user.id}`;
            
            if (this.user.photo_url) {
                this.userAvatar.src = this.user.photo_url;
                this.userAvatar.onerror = () => {
                    this.userAvatar.src = this.getDefaultAvatar();
                };
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
    
    async loadChats() {
        this.isLoading = true;
        this.showSkeletonLoading();
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // In a real app, you would fetch this from your backend
            this.chats = [
                { 
                    id: 1, 
                    title: "Общий чат", 
                    lastMessage: "Привет! Как дела?", 
                    unread: 2, 
                    time: "10:30", 
                    avatar: '' 
                },
                { 
                    id: 2, 
                    title: "Рабочая группа", 
                    lastMessage: "Завтра встреча в 10:00", 
                    unread: 0, 
                    time: "09:15", 
                    avatar: '' 
                },
                { 
                    id: 3, 
                    title: "Друзья", 
                    lastMessage: "Кто сегодня свободен?", 
                    unread: 5, 
                    time: "Вчера", 
                    avatar: '' 
                },
                { 
                    id: 4, 
                    title: "Семья", 
                    lastMessage: "Не забудь купить хлеб", 
                    unread: 0, 
                    time: "20.05", 
                    avatar: '' 
                },
                { 
                    id: 5, 
                    title: "Университет", 
                    lastMessage: "Лекция перенесена на 15:00", 
                    unread: 1, 
                    time: "19.05", 
                    avatar: '' 
                }
            ];
            
            this.renderChats();
        } catch (error) {
            console.error('Error loading chats:', error);
            this.showToast('Ошибка загрузки чатов');
        } finally {
            this.isLoading = false;
        }
    }
    
    showSkeletonLoading() {
        this.chatsList.innerHTML = '';
        
        // Add 5 skeleton items
        for (let i = 0; i < 5; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'skeleton-chat';
            skeleton.innerHTML = `
                <div class="skeleton-avatar"></div>
                <div class="skeleton-info">
                    <div class="skeleton-line" style="width: ${70 + Math.random() * 20}%"></div>
                    <div class="skeleton-line" style="width: ${80 + Math.random() * 15}%"></div>
                </div>
            `;
            this.chatsList.appendChild(skeleton);
        }
    }
    
    renderChats(chats = this.chats) {
        this.chatsList.innerHTML = '';
        
        if (chats.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <div class="empty-icon">💬</div>
                <h3>Нет чатов</h3>
                <p>Создайте новый чат или подключитесь к существующему</p>
                <button id="create-first-chat" class="tg-button primary">Создать чат</button>
            `;
            this.chatsList.appendChild(emptyState);
            
            document.getElementById('create-first-chat').addEventListener('click', () => {
                this.showNewChatModal();
            });
            
            return;
        }
        
        chats.forEach(chat => {
            const chatElement = document.createElement('div');
            chatElement.className = 'chat-item animate__animated animate__fadeIn';
            chatElement.style.animationDelay = `${chat.id * 0.1}s`;
            chatElement.innerHTML = `
                <div class="chat-avatar">
                    ${chat.avatar ? `<img src="${chat.avatar}" alt="${chat.title}">` : '👥'}
                </div>
                <div class="chat-info">
                    <div class="chat-title">${chat.title}</div>
                    <div class="chat-preview">${chat.lastMessage}</div>
                </div>
                <div class="chat-time">${chat.time}</div>
                ${chat.unread > 0 ? `<div class="unread-badge">${chat.unread}</div>` : ''}
            `;
            
            chatElement.addEventListener('click', () => this.openChat(chat.id));
            this.chatsList.appendChild(chatElement);
        });
    }
    
    searchChats() {
        const searchTerm = this.chatSearch.value.toLowerCase();
        if (!searchTerm) {
            this.renderChats();
            return;
        }
        
        const filteredChats = this.chats.filter(chat => 
            chat.title.toLowerCase().includes(searchTerm) || 
            chat.lastMessage.toLowerCase().includes(searchTerm)
        );
        
        this.renderChats(filteredChats);
    }
    
    showPage(page) {
        if (page === 'chats') {
            this.chatsPage.classList.add('active');
            this.profilePage.classList.remove('active');
            this.chatsNav.classList.add('active');
            this.profileNav.classList.remove('active');
            this.tg.BackButton.hide();
        } else {
            this.profilePage.classList.add('active');
            this.chatsPage.classList.remove('active');
            this.profileNav.classList.add('active');
            this.chatsNav.classList.remove('active');
            this.tg.BackButton.show();
        }
    }
    
    openChat(chatId) {
        this.currentChatId = chatId;
        const chat = this.chats.find(c => c.id === chatId);
        
        // In a real app, you would open the chat view
        this.tg.showPopup({
            title: chat.title,
            message: `Открыть чат "${chat.title}"?`,
            buttons: [
                { id: 'open', type: 'default', text: 'Открыть' },
                { type: 'cancel', text: 'Отмена' }
            ]
        }, (buttonId) => {
            if (buttonId === 'open') {
                this.showToast(`Чат "${chat.title}" открыт`);
                // Mark as read
                chat.unread = 0;
                this.renderChats();
            }
        });
    }
    
    showNewChatModal() {
        this.newChatModal.style.display = 'flex';
        this.tg.BackButton.show();
    }
    
    createNewChat() {
        const titleInput = document.getElementById('chat-title');
        const title = titleInput.value.trim();
        
        if (!title) {
            this.showToast('Введите название чата');
            return;
        }
        
        // Simulate API call
        this.isLoading = true;
        this.showToast('Создание чата...');
        
        setTimeout(() => {
            const newChat = {
                id: Math.max(...this.chats.map(c => c.id)) + 1,
                title: title,
                lastMessage: "Чат создан",
                unread: 0,
                time: "Только что",
                avatar: ''
            };
            
            this.chats.unshift(newChat);
            this.renderChats();
            this.closeModals();
            this.showToast(`Чат "${title}" создан`);
            this.isLoading = false;
            
            // Reset form
            titleInput.value = '';
        }, 1000);
    }
    
    showQRCode() {
        if (!this.user.id) {
            this.showToast('Не удалось загрузить данные пользователя');
            return;
        }
        
        // Generate unique invite link
        const inviteLink = `https://t.me/share/url?url=${encodeURIComponent(`https://t.me/${this.tg.initDataUnsafe.user.username || 'user'}_${this.user.id}`)}`;
        this.currentInviteLink = inviteLink;
        this.inviteLinkInput.value = inviteLink;
        
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
                this.showToast('Ошибка генерации QR-кода');
                return;
            }
            
            // Adjust QR code styling
            const canvas = this.qrCodeContainer.querySelector('canvas');
            if (canvas) {
                canvas.style.backgroundColor = this.tg.colorScheme === 'dark' ? '#2c3a4a' : '#ffffff';
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
                this.showToast('Сканирование отменено');
            }
        });
    }
    
    handleScannedQR(text) {
        // Parse chat ID from QR code
        const chatIdMatch = text.match(/_(\d+)$/);
        if (chatIdMatch && chatIdMatch[1]) {
            const chatId = chatIdMatch[1];
            this.showToast(`Подключение к чату пользователя с ID: ${chatId}`, () => {
                // In a real app, you would connect to the chat
                // Simulate adding a new chat
                setTimeout(() => {
                    const newChat = {
                        id: Math.max(...this.chats.map(c => c.id)) + 1,
                        title: `Чат с пользователем ${chatId}`,
                        lastMessage: "Вы подключились к чату",
                        unread: 1,
                        time: "Только что",
                        avatar: ''
                    };
                    
                    this.chats.unshift(newChat);
                    this.renderChats();
                }, 500);
            });
        } else {
            this.showToast('Неверный QR-код. Пожалуйста, сканируйте только коды этого приложения.');
        }
    }
    
    copyInviteLink() {
        if (!this.currentInviteLink) return;
        
        navigator.clipboard.writeText(this.currentInviteLink).then(() => {
            this.showToast('Ссылка скопирована в буфер обмена');
        }).catch(err => {
            console.error('Copy failed:', err);
            this.showToast('Не удалось скопировать ссылку');
        });
    }
    
    shareInviteLink() {
        if (!this.currentInviteLink) return;
        
        if (this.tg.isVersionAtLeast('6.1')) {
            this.tg.shareUrl(this.currentInviteLink, 'Присоединяйтесь к моему чату!');
        } else {
            this.copyInviteLink();
        }
    }
    
    closeModals() {
        this.qrModal.style.display = 'none';
        this.newChatModal.style.display = 'none';
        this.tg.BackButton.hide();
    }
    
    showToast(message, callback) {
        this.toast.textContent = message;
        this.toast.classList.add('show');
        
        setTimeout(() => {
            this.toast.classList.remove('show');
            if (callback) callback();
        }, 3000);
    }
    
    updateTheme() {
        document.body.className = this.tg.colorScheme;
        
        // Update QR code if modal is open
        if (this.qrModal.style.display === 'flex') {
            this.showQRCode();
        }
    }
    
    checkSystemDarkMode() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.darkModeToggle.checked = true;
        }
    }
    
    toggleDarkMode() {
        if (this.darkModeToggle.checked) {
            document.body.classList.add('dark');
            this.tg.setHeaderColor('secondary_bg_color');
        } else {
            document.body.classList.remove('dark');
            this.tg.setHeaderColor('bg_color');
        }
    }
    
    toggleNotifications() {
        this.showToast(this.notificationsToggle.checked ? 
            'Уведомления включены' : 'Уведомления отключены');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new TelegramChatApp();
    
    // Expose app to window for debugging
    window.app = app;
});
