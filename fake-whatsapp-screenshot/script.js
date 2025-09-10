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
  const messageStatusInput = el('messageStatus');
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
  function createMessageBubble(type, text, time, status = 'seen') {
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${type}`;

    const content = document.createElement('div');
    content.className = 'message-content-bubble';
    content.textContent = text || '';

    const metaEl = document.createElement('div');
    metaEl.className = 'message-meta';
    
    // Format time as 12-hour format
    const formattedTime = formatTime(time);
    
    // Add ticks for sent messages
    if (type === 'sent') {
      const ticksSpan = document.createElement('span');
      ticksSpan.className = 'ticks';
      
      switch (status) {
        case 'sent':
          ticksSpan.innerHTML = '✓';
          ticksSpan.style.color = '#667781';
          break;
        case 'delivered':
          ticksSpan.innerHTML = '✓✓';
          ticksSpan.style.color = '#667781';
          break;
        case 'seen':
          ticksSpan.innerHTML = '✓✓';
          ticksSpan.style.color = '#53bdeb';
          break;
        default:
          ticksSpan.innerHTML = '';
      }
      
      metaEl.innerHTML = `${formattedTime} `;
      metaEl.appendChild(ticksSpan);
    } else {
      metaEl.textContent = formattedTime;
    }

    bubble.appendChild(content);
    bubble.appendChild(metaEl);

    return bubble;
  }

  function formatTime(timeStr) {
    if (!timeStr) return '';
    
    // Handle both HH:MM and H:MM formats
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  function addMessageToList(type, text, time, status = 'seen') {
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
    const status = type === 'sent' ? messageStatusInput.value : 'none';

    if (!text) {
      messageTextInput.focus();
      return;
    }

    // Add to preview
    const bubble = createMessageBubble(type, text, time, status);
    messagesContainer.appendChild(bubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Add to list (editor)
    addMessageToList(type, text, time, status);

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
      { type: 'sent', text: 'Hello, how are you doing today', time: '14:29', status: 'seen' }
    ];
    samples.forEach(m => {
      const b = createMessageBubble(m.type, m.text, m.time, m.status || 'seen');
      messagesContainer.appendChild(b);
      addMessageToList(m.type, m.text, m.time, m.status || 'seen');
    });
  }

  init();
})();

