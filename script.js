// Discord Webhook Sender Pro - Main Script
(function() {
    'use strict';

    // DOM Elements
    const webhookInput = document.getElementById('webhookUrl');
    const messageInput = document.getElementById('messageContent');
    const countInput = document.getElementById('sendCount');
    const botNameInput = document.getElementById('botName');
    const botNamePreview = document.getElementById('botNamePreview');
    const submitBtn = document.getElementById('submitBtn');
    const clearBtn = document.getElementById('clearBtn');
    const statusDiv = document.getElementById('statusMessage');
    const messageCountSpan = document.getElementById('messageCount');

    let totalSent = 0;

    // Bot name live preview
    botNameInput.addEventListener('input', function() {
        botNamePreview.textContent = this.value || 'Unnamed Bot';
    });

    // Status message function
    function setStatus(message, type = 'info') {
        const icons = {
            success: '✓',
            error: '✗',
            info: 'i'
        };
        statusDiv.innerHTML = `<span class="status-icon">${icons[type] || 'i'}</span> ${message}`;
        statusDiv.className = 'status ' + type;
        statusDiv.style.display = 'block';
    }

    // Clear status
    function clearStatus() {
        statusDiv.className = 'status';
        statusDiv.style.display = 'none';
    }

    // Send webhook message
    async function sendWebhookMessage(webhookUrl, content, botName, count) {
        const results = [];

        for (let i = 0; i < count; i++) {
            try {
                const payload = {
                    content: content,
                    username: botName || 'Webhook Pro',
                    avatar_url: 'https://cdn.discordapp.com/avatars/432610292342587392/8f1a4b7b0e2e8a1c5d9f3a7b8e4c6d2a.png?size=256'
                };

                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }

                results.push({ success: true, index: i + 1 });
            } catch (error) {
                results.push({ success: false, index: i + 1, error: error.message });
                break;
            }
        }

        return results;
    }

    // Handle submit
    async function handleSubmit() {
        clearStatus();

        const webhookUrl = webhookInput.value.trim();
        const message = messageInput.value.trim();
        const botName = botNameInput.value.trim() || 'Webhook Pro';
        const count = parseInt(countInput.value) || 1;

        // Validation
        if (!webhookUrl) {
            setStatus('Please enter a Webhook URL!', 'error');
            webhookInput.focus();
            return;
        }

        if (!webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
            setStatus('Invalid Webhook URL! Must start with "https://discord.com/api/webhooks/"', 'error');
            webhookInput.focus();
            return;
        }

        if (!message) {
            setStatus('Please enter a message!', 'error');
            messageInput.focus();
            return;
        }

        if (count < 1 || count > 100) {
            setStatus('Please enter a number between 1 and 100!', 'error');
            countInput.focus();
            return;
        }

        // Disable button and show sending status
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        setStatus(`Sending ${count} message(s) to Discord...`, 'info');

        try {
            const results = await sendWebhookMessage(webhookUrl, message, botName, count);

            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;

            totalSent += successful;
            messageCountSpan.textContent = totalSent;

            if (failed === 0) {
                setStatus(`Successfully sent ${successful} of ${count} message(s)!`, 'success');
            } else {
                const errorMsg = results.find(r => !r.success)?.error || 'Unknown error';
                setStatus(`${successful} succeeded, ${failed} failed. Last error: ${errorMsg}`, 'error');
            }
        } catch (error) {
            setStatus(`Error: ${error.message}`, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send';
        }
    }

    // Event Listeners
    submitBtn.addEventListener('click', handleSubmit);

    // Enter key in message field (Shift+Enter for new line)
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    });

    // Clear button
    clearBtn.addEventListener('click', function() {
        webhookInput.value = '';
        messageInput.value = '';
        countInput.value = '1';
        botNameInput.value = 'Webhook Pro';
        botNamePreview.textContent = 'Webhook Pro';
        clearStatus();
        webhookInput.focus();
    });

    // Auto focus on load
    webhookInput.focus();

    console.log('Discord Webhook Sender Pro loaded successfully!');
    console.log('Bot avatar will appear in Discord messages');
})();
