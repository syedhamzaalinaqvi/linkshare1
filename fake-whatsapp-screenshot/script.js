// Fake WhatsApp Screenshot Tool
// Author: Agent Mode

(function () {
  const el = (id) => document.getElementById(id);

  // Inputs
  const contactNameInput = el('contactName');
  const contactStatusInput = el('contactStatus');
  const profilePicInput = el('profilePic');
  const batteryLevelInput = el('batteryLevel');
  const timeDisplayInput = el('timeDisplay');
  const networkProviderInput = el('networkProvider');

  const messageTypeInput = el('messageType');
  const messageTextInput = el('messageText');
  const messageTimeInput = el('messageTime');
  const addMessageBtn = el('addMessage');
  const clearMessagesBtn = el('clearMessages');
  const generateBtn = el('generateScreenshot');

  // Preview elements
  const displayContactName = el('displayContactName');
  const displayContactStatus = el('displayContactStatus');
  const contactAvatar = el('contactAvatar');
  const messagesContainer = el('messagesContainer');
  const displayTime = el('displayTime');
  const batteryPercent = el('batteryPercent');
  const phoneScreen = el('phoneScreen');

  // Helpers
  function createMessageBubble(type, text, time) {
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${type}`;

    const content = document.createElement('div');
    content.className = 'message-content-bubble';
    content.textContent = text || '';

    const timeEl = document.createElement('div');
    timeEl.className = 'message-time-bubble';
    timeEl.textContent = time || '';

    bubble.appendChild(content);
    bubble.appendChild(timeEl);

    return bubble;
  }

  function addMessageToList(type, text, time) {
    const list = document.getElementById('messagesList');
    const item = document.createElement('div');
    item.className = `message-item ${type}`;

    const content = document.createElement('div');
    content.className = 'message-content';

    const textEl = document.createElement('div');
    textEl.className = 'message-text';
    textEl.textContent = text;

    const timeEl = document.createElement('div');
    timeEl.className = 'message-time';
    timeEl.textContent = time;

    content.appendChild(textEl);
    content.appendChild(timeEl);

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-message';
    delBtn.innerHTML = '<i class="fas fa-trash"></i>';

    delBtn.addEventListener('click', () => {
      // remove from preview as well
      const idx = Array.from(list.children).indexOf(item);
      const bubbles = messagesContainer.querySelectorAll('.message-bubble');
      if (bubbles[idx]) bubbles[idx].remove();
      item.remove();
    });

    item.appendChild(content);
    item.appendChild(delBtn);

    list.appendChild(item);
  }

  function syncHeader() {
    displayContactName.textContent = contactNameInput.value || 'John Doe';

    const statusMap = {
      'online': 'Online',
      'last-seen': 'Last seen recently',
      'typing': 'typing…'
    };
    displayContactStatus.textContent = statusMap[contactStatusInput.value] || 'Online';

    const url = profilePicInput.value.trim();
    contactAvatar.innerHTML = '';
    if (url) {
      const img = document.createElement('img');
      img.src = url;
      img.alt = 'avatar';
      img.onerror = () => {
        contactAvatar.innerHTML = '<i class="fas fa-user"></i>';
      };
      contactAvatar.appendChild(img);
    } else {
      contactAvatar.innerHTML = '<i class="fas fa-user"></i>';
    }
  }

  function syncStatusBar() {
    const time = timeDisplayInput.value || '19:30';
    displayTime.textContent = time;

    let level = parseInt(batteryLevelInput.value, 10);
    if (isNaN(level) || level < 0) level = 0;
    if (level > 100) level = 100;
    batteryPercent.textContent = level + '%';
  }

  function addMessage() {
    const type = messageTypeInput.value;
    const text = messageTextInput.value.trim();
    const time = messageTimeInput.value || '';

    if (!text) {
      messageTextInput.focus();
      return;
    }

    // Add to preview
    const bubble = createMessageBubble(type, text, time);
    messagesContainer.appendChild(bubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Add to list (editor)
    addMessageToList(type, text, time);

    // reset input
    messageTextInput.value = '';
  }

  function clearAll() {
    messagesContainer.innerHTML = '<div class="date-divider"><span>Today</span></div>';
    document.getElementById('messagesList').innerHTML = '';
  }

  async function generateScreenshot() {
    generateBtn.disabled = true;
    const originalText = generateBtn.innerHTML;
    generateBtn.innerHTML = '<span class="loading"></span> Generating...';
    try {
      const canvas = await html2canvas(phoneScreen, {
        backgroundColor: null,
        scale: 2,
        useCORS: true
      });
      const dataURL = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.href = dataURL;
      const safeName = (displayContactName.textContent || 'whatsapp').replace(/[^a-z0-9-_]+/gi, '_');
      link.download = `fake_whatsapp_${safeName}.png`;
      link.click();
    } catch (e) {
      alert('Failed to generate screenshot. Try again.');
      console.error(e);
    } finally {
      generateBtn.disabled = false;
      generateBtn.innerHTML = originalText;
    }
  }

  // Event bindings
  contactNameInput.addEventListener('input', syncHeader);
  contactStatusInput.addEventListener('change', syncHeader);
  profilePicInput.addEventListener('input', syncHeader);

  batteryLevelInput.addEventListener('input', syncStatusBar);
  timeDisplayInput.addEventListener('input', syncStatusBar);

  addMessageBtn.addEventListener('click', addMessage);
  messageTextInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addMessage();
  });

  clearMessagesBtn.addEventListener('click', clearAll);
  generateBtn.addEventListener('click', generateScreenshot);

  // Initialize with a sample conversation
  function init() {
    syncHeader();
    syncStatusBar();

    const samples = [
      { type: 'received', text: 'Hey! Are we still on for tonight?', time: '19:12' },
      { type: 'sent', text: 'Yes, 7:30 pm sharp! See you there.', time: '19:14' },
      { type: 'received', text: 'Perfect, see you 👋', time: '19:15' }
    ];
    samples.forEach(m => {
      const b = createMessageBubble(m.type, m.text, m.time);
      messagesContainer.appendChild(b);
      addMessageToList(m.type, m.text, m.time);
    });
  }

  init();
})();

