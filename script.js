class TelegramChatApp {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.initData = this.tg.initData || '';
        this.initDataUnsafe = this.tg.initDataUnsafe || {};
        this.user = this.initDataUnsafe.user || {};
        this.chats = [];
        this.currentChatId = null;
        this.supabase = null;
        this.currentUser = null;
        
        this.initSupabase();
        this.initElements();
        this.setupEventListeners();
        this.initApp();
    }
    
    initSupabase() {
        // Инициализация Supabase
        this.supabase = supabase.createClient(
            'https://gukwsidcqfhtqxhzevch.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1a3dzaWRjcWZodHF4aHpldmNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMTE4MzUsImV4cCI6MjA3MDU4NzgzNX0.4RCzXKHjcrw4YUONg4nqI2QcLlSsZ6BHQ_fkJl14jA8'
        );
        
        // Установка JWT из Telegram WebApp
        if (this.initData) {
            this.supabase.realtime.setAuth(this.initData);
        }
    }
    
    async initApp() {
        // Configure WebApp
        this.tg.expand();
        this.tg.enableClosingConfirmation();
        this.tg.BackButton.hide();
        this.tg.MainButton.hide();
        
        // Set viewport height for mobile browsers
        this.handleViewportChange();
        
        // Authenticate with Telegram data
        await this.authenticateWithTelegram();
        
        // Load user data
        await this.loadUserData();
        
        // Load chats
        await this.loadChats();
        
        // Setup realtime subscriptions
        this.setupRealtime();
        
        // Update theme
        this.updateTheme();
    }
    
    async authenticateWithTelegram() {
        if (!this.user.id) {
            console.error('No Telegram user data available');
            return;
        }
        
        try {
            // Sign in with Telegram data
            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'telegram',
                options: {
                    redirectTo: window.location.origin,
                    data: {
                        telegram_id: this.user.id.toString(),
                        username: this.user.username,
                        first_name: this.user.first_name,
                        last_name: this.user.last_name,
                        avatar_url: this.user.photo_url
                    }
                }
            });
            
            if (error) throw error;
            
            // Get the current user
            const { data: { user } } = await this.supabase.auth.getUser();
            this.currentUser = user;
            
        } catch (error) {
            console.error('Authentication error:', error);
            this.showToast('Ошибка авторизации');
        }
    }
    
    async loadUserData() {
        if (!this.currentUser) return;
        
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('id', this.currentUser.id)
                .single();
                
            if (error) throw error;
            
            this.userName.textContent = [data.first_name, data.last_name].filter(Boolean).join(' ');
            
            if (data.username) {
                this.userUsername.textContent = `@${data.username}`;
            } else {
                this.userUsername.style.display = 'none';
            }
            
            this.userId.textContent = `ID: ${data.telegram_id}`;
            
            if (data.avatar_url) {
                this.userAvatar.src = data.avatar_url;
                this.userAvatar.onerror = () => {
                    this.userAvatar.src = this.getDefaultAvatar();
                };
            } else {
                this.userAvatar.src = this.getDefaultAvatar();
            }
            
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }
    
    async loadChats() {
        try {
            const { data, error } = await this.supabase
                .from('chat_participants')
                .select(`
                    chat:chats(
                        id,
                        title,
                        created_at,
                        messages:messages(
                            content,
                            created_at
                        )
                    )
                `)
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false, referencedTable: 'chats' })
                .limit(20);
                
            if (error) throw error;
            
            this.chats = data.map(item => {
                const lastMessage = item.chat.messages.length > 0 
                    ? item.chat.messages[0] 
                    : { content: 'Чат создан', created_at: item.chat.created_at };
                
                return {
                    id: item.chat.id,
                    title: item.chat.title,
                    lastMessage: lastMessage.content,
                    time: this.formatTime(lastMessage.created_at),
                    unread: 0 // You would calculate this from your DB
                };
            });
            
            this.renderChats();
            
        } catch (error) {
            console.error('Error loading chats:', error);
            this.showToast('Ошибка загрузки чатов');
        }
    }
    
    setupRealtime() {
        if (!this.currentUser) return;
        
        // Subscribe to new messages in user's chats
        this.supabase
            .channel('user_chats')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `chat_id=in.(${this.chats.map(c => `"${c.id}"`).join(',')})`
                },
                (payload) => {
                    this.handleNewMessage(payload.new);
                }
            )
            .subscribe();
    }
    
    handleNewMessage(message) {
        // Update the chat list with new message
        const chatIndex = this.chats.findIndex(c => c.id === message.chat_id);
        if (chatIndex !== -1) {
            const chat = this.chats[chatIndex];
            chat.lastMessage = message.content;
            chat.time = this.formatTime(message.created_at);
            
            // Move chat to top
            this.chats.splice(chatIndex, 1);
            this.chats.unshift(chat);
            
            this.renderChats();
            
            // Show notification if not on chat page
            if (this.currentChatId !== message.chat_id) {
                this.showToast(`Новое сообщение в чате "${chat.title}"`);
            }
        }
    }
    
    async createNewChat() {
        const titleInput = document.getElementById('chat-title');
        const title = titleInput.value.trim();
        
        if (!title) {
            this.showToast('Введите название чата');
            return;
        }
        
        try {
            const { data, error } = await this.supabase
                .from('chats')
                .insert([
                    { 
                        title: title,
                        created_by: this.currentUser.id
                    }
                ])
                .select()
                .single();
                
            if (error) throw error;
            
            // Add creator as participant
            await this.supabase
                .from('chat_participants')
                .insert([
                    {
                        chat_id: data.id,
                        user_id: this.currentUser.id
                    }
                ]);
            
            // Add to local chats
            this.chats.unshift({
                id: data.id,
                title: title,
                lastMessage: "Чат создан",
                time: "Только что",
                unread: 0
            });
            
            this.renderChats();
            this.closeModals();
            this.showToast(`Чат "${title}" создан`);
            
            // Reset form
            titleInput.value = '';
            
        } catch (error) {
            console.error('Error creating chat:', error);
            this.showToast('Ошибка создания чата');
        }
    }
    
    async showQRCode() {
        if (!this.currentUser) return;
        
        try {
            // Create invitation in database
            const { data, error } = await this.supabase
                .from('invitations')
                .insert([
                    {
                        chat_id: this.currentChatId,
                        created_by: this.currentUser.id,
                        token: crypto.randomUUID(),
                        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
                    }
                ])
                .select()
                .single();
                
            if (error) throw error;
            
            // Generate invite link
            const inviteLink = `${window.location.origin}?invite=${data.token}`;
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
            });
            
            // Show modal
            this.qrModal.style.display = 'flex';
            this.tg.BackButton.show();
            
        } catch (error) {
            console.error('Error creating invitation:', error);
            this.showToast('Ошибка создания приглашения');
        }
    }
    
    async handleScannedQR(token) {
        try {
            // Validate invitation
            const { data: invitation, error: inviteError } = await this.supabase
                .from('invitations')
                .select('*')
                .eq('token', token)
                .gte('expires_at', new Date().toISOString())
                .single();
                
            if (inviteError || !invitation) throw new Error('Invalid or expired invitation');
            
            // Add user to chat
            const { error: participantError } = await this.supabase
                .from('chat_participants')
                .insert([
                    {
                        chat_id: invitation.chat_id,
                        user_id: this.currentUser.id
                    }
                ]);
                
            if (participantError) throw participantError;
            
            // Update invitation uses
            await this.supabase
                .from('invitations')
                .update({ uses: invitation.uses + 1 })
                .eq('id', invitation.id);
            
            // Get chat info
            const { data: chat, error: chatError } = await this.supabase
                .from('chats')
                .select('*')
                .eq('id', invitation.chat_id)
                .single();
                
            if (chatError) throw chatError;
            
            this.showToast(`Вы присоединились к чату "${chat.title}"`);
            
            // Reload chats
            await this.loadChats();
            
        } catch (error) {
            console.error('Error joining chat:', error);
            this.showToast('Ошибка подключения к чату');
        }
    }
    
    // ... (остальные методы остаются без изменений)
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new TelegramChatApp();
    
    // Handle invite link if present in URL
    const urlParams = new URLSearchParams(window.location.search);
    const inviteToken = urlParams.get('invite');
    
    if (inviteToken) {
        app.handleScannedQR(inviteToken);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Expose app to window for debugging
    window.app = app;
});
