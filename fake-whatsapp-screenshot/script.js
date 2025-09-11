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
  const headerIconSizeInput = el('headerIconSize');

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
  const chatHeaderRight = document.querySelector('.chat-header-right');
  const backArrow = document.querySelector('.back-arrow');

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

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-message';
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.title = 'Edit message';

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-message';
    delBtn.innerHTML = '<i class="fas fa-trash"></i>';
    delBtn.title = 'Delete message';

    // Edit form with time editing
    const editForm = document.createElement('div');
    editForm.className = 'message-edit-form';
    editForm.innerHTML = `
      <div class="edit-inputs">
        <input type="text" value="${text}" class="edit-text" placeholder="Message text">
        <input type="time" value="${time.replace(/\s?(AM|PM)/i, '')}" class="edit-time" title="Message time">
      </div>
      <div class="edit-buttons">
        <button type="button" class="save">Save</button>
        <button type="button" class="cancel">Cancel</button>
      </div>
    `;

    editBtn.addEventListener('click', () => {
      editForm.classList.add('active');
      editForm.querySelector('.edit-text').focus();
    });

    editForm.querySelector('.cancel').addEventListener('click', () => {
      editForm.classList.remove('active');
    });

    editForm.querySelector('.save').addEventListener('click', () => {
      const newText = editForm.querySelector('.edit-text').value.trim();
      const newTime = editForm.querySelector('.edit-time').value;
      
      if (newText) {
        textEl.textContent = newText;
        const formattedTime = formatTime(newTime);
        timeEl.textContent = formattedTime;
        
        // Update preview bubble
        const idx = Array.from(list.children).indexOf(item);
        const bubbles = messagesContainer.querySelectorAll('.message-bubble');
        if (bubbles[idx]) {
          const bubbleContent = bubbles[idx].querySelector('.message-content-bubble');
          const bubbleTime = bubbles[idx].querySelector('.message-meta');
          if (bubbleContent) bubbleContent.textContent = newText;
          if (bubbleTime) bubbleTime.innerHTML = bubbleTime.innerHTML.replace(/\d{1,2}:\d{2}\s?(AM|PM)/i, formattedTime);
        }
        
        editForm.classList.remove('active');
        saveToLocalStorage(); // Save changes
      }
    });

    delBtn.addEventListener('click', () => {
      // remove from preview as well
      const idx = Array.from(list.children).indexOf(item);
      const bubbles = messagesContainer.querySelectorAll('.message-bubble');
      if (bubbles[idx]) bubbles[idx].remove();
      item.remove();
      saveToLocalStorage(); // Save after deletion
    });

    const buttonGroup = document.createElement('div');
    buttonGroup.style.display = 'flex';
    buttonGroup.style.gap = '5px';
    buttonGroup.appendChild(editBtn);
    buttonGroup.appendChild(delBtn);

    item.appendChild(content);
    item.appendChild(buttonGroup);
    item.appendChild(editForm);

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
    const formattedTime = formatTime(time);
    displayTime.textContent = formattedTime;

    let level = parseInt(batteryLevelInput.value, 10);
    if (isNaN(level) || level < 0) level = 0;
    if (level > 100) level = 100;
    batteryPercent.textContent = level + '%';
  }

  function syncHeaderIconSize() {
    const scale = headerIconSizeInput.value || 1.0;
    const rangeValue = document.querySelector('.range-value');
    if (rangeValue) rangeValue.textContent = scale + 'x';
    
    if (chatHeaderRight) {
      chatHeaderRight.style.fontSize = (0.9 * scale) + 'rem';
    }
    if (backArrow) {
      backArrow.style.fontSize = (1.0 * scale) + 'rem';
    }
    
    const contactAvatar = document.getElementById('contactAvatar');
    if (contactAvatar) {
      const size = Math.round(36 * scale);
      contactAvatar.style.width = size + 'px';
      contactAvatar.style.height = size + 'px';
      contactAvatar.style.fontSize = (1.0 * scale) + 'rem';
    }
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
      // Clone phone screen content to hidden screenshot container
      const screenshotContainer = document.getElementById('screenshotContainer');
      const phoneScreenClone = phoneScreen.cloneNode(true);
      
      // Remove any IDs to avoid conflicts
      phoneScreenClone.removeAttribute('id');
      const allElements = phoneScreenClone.querySelectorAll('[id]');
      allElements.forEach(el => el.removeAttribute('id'));
      
      // Clear and append clone
      screenshotContainer.innerHTML = '';
      screenshotContainer.appendChild(phoneScreenClone);

      // Match container width
      const rect = phoneScreen.getBoundingClientRect();
      const width = Math.round(rect.width);
      
      // Temporarily make visible for accurate measurements
      screenshotContainer.style.visibility = 'visible';
      screenshotContainer.style.position = 'fixed';
      screenshotContainer.style.top = '0';
      screenshotContainer.style.left = '0';
      screenshotContainer.style.zIndex = '-1';
      screenshotContainer.style.width = width + 'px';
      
      // Get component references
      const statusBar = phoneScreenClone.querySelector('.status-bar');
      const chatHeader = phoneScreenClone.querySelector('.chat-header');
      const messageInput = phoneScreenClone.querySelector('.message-input');
      const messagesContainer = phoneScreenClone.querySelector('.messages-container');
      
      let contentHeight = Math.round(rect.height);
      
      if (messagesContainer) {
        // Get original scroll position BEFORE any modifications
        const originalMessagesContainer = phoneScreen.querySelector('.messages-container');
        const currentScrollTop = originalMessagesContainer.scrollTop;
        
        // Set up messages container to match original viewport
        messagesContainer.style.height = originalMessagesContainer.offsetHeight + 'px';
        messagesContainer.style.maxHeight = originalMessagesContainer.offsetHeight + 'px';
        messagesContainer.style.overflow = 'hidden'; // Hide scrollbars in screenshot
        messagesContainer.style.paddingTop = '15px';
        messagesContainer.style.paddingRight = '15px';
        messagesContainer.style.paddingLeft = '15px';
        messagesContainer.style.paddingBottom = '15px';
        messagesContainer.style.boxSizing = 'border-box';
        
        // REMOVE THE ORIGINAL INPUT ENTIRELY - IT'S PROBLEMATIC
        if (messageInput) {
          console.log('Removing original problematic input:', messageInput);
          messageInput.remove(); // Delete it completely
        }
        
        // CREATE BRAND NEW INPUT FROM SCRATCH - GUARANTEED TO WORK
        console.log('Creating brand new input div...');
        const newInput = document.createElement('div');
        newInput.className = 'message-input new-forced-input';
        
        // Create the complete inner structure
        const inputSection = document.createElement('div');
        inputSection.className = 'input-section';
        inputSection.innerHTML = `
          <i class="fas fa-smile input-emoji"></i>
          <div class="input-field">
            <span>Message</span>
          </div>
          <i class="fas fa-paperclip input-attach"></i>
          <i class="fas fa-camera input-camera"></i>
        `;
        
        const micButton = document.createElement('div');
        micButton.className = 'mic-button';
        micButton.innerHTML = '<i class="fas fa-microphone"></i>';
        
        newInput.appendChild(inputSection);
        newInput.appendChild(micButton);
        
        // Apply BULLETPROOF styling
        newInput.style.cssText = `
          display: flex !important;
          position: static !important;
          width: 100% !important;
          background: #f0f2f6 !important;
          padding: 8px 12px !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 12px !important;
          min-height: 60px !important;
          border-top: none !important;
          z-index: 999 !important;
          visibility: visible !important;
          opacity: 1 !important;
          margin: 0 !important;
          box-sizing: border-box !important;
          flex-shrink: 0 !important;
        `;
        
        // Style the input section
        inputSection.style.cssText = `
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          flex: 1 !important;
          background: #fff !important;
          border: 1px solid #ddd !important;
          border-radius: 25px !important;
          padding: 8px 12px !important;
        `;
        
        // Style the mic button
        micButton.style.cssText = `
          width: 38px !important;
          height: 38px !important;
          background: #25d366 !important;
          color: white !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 1rem !important;
          flex-shrink: 0 !important;
        `;
        
        // FORCE append to phone screen clone
        phoneScreenClone.appendChild(newInput);
        console.log('New input appended to phone screen:', newInput);
        console.log('Phone screen children:', phoneScreenClone.children);
        console.log('New input computed style:', getComputedStyle(newInput));
        
        // Force reflow to ensure everything is rendered
        phoneScreenClone.offsetHeight;
        
        // Wait for rendering
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Apply the EXACT scroll position from original AFTER everything is set up
        console.log('Original scroll position:', currentScrollTop);
        messagesContainer.scrollTop = currentScrollTop;
        console.log('Applied scroll position:', messagesContainer.scrollTop);
        
        // Force another reflow after scroll
        messagesContainer.offsetHeight;

        // Use original phone screen height (fixed viewport)
        contentHeight = Math.round(rect.height);
      }
        
      
      // Set final container dimensions and ensure proper layout
      screenshotContainer.style.height = contentHeight + 'px';
      phoneScreenClone.style.height = contentHeight + 'px';
      phoneScreenClone.style.minHeight = contentHeight + 'px';
      phoneScreenClone.style.display = 'flex';
      phoneScreenClone.style.flexDirection = 'column';
      phoneScreenClone.style.position = 'relative'; // Ensure it can contain relative elements
      phoneScreenClone.style.overflow = 'visible';
      
      // FINAL CHECK: Our new input should always be there
      const finalMessageInput = phoneScreenClone.querySelector('.new-forced-input');
      if (finalMessageInput) {
        console.log('=== FINAL INPUT CHECK ===');
        console.log('New input successfully found:', finalMessageInput);
        console.log('Final display:', getComputedStyle(finalMessageInput).display);
        console.log('Final visibility:', getComputedStyle(finalMessageInput).visibility);
        console.log('Final height:', getComputedStyle(finalMessageInput).height);
        console.log('Final position:', getComputedStyle(finalMessageInput).position);
        console.log('=== SUCCESS ===');
      } else {
        console.error('❌ CRITICAL ERROR: Even new input not found!');
      }

      // Final reflow
      screenshotContainer.offsetHeight;
      phoneScreenClone.offsetHeight;

      // Wait a moment for final layout
      await new Promise(resolve => setTimeout(resolve, 120));
      
      // DON'T override scroll position - keep the user's current scroll position
      
      const deviceScale = Math.min(4, Math.max(2, (window.devicePixelRatio || 2) * 2));
      
      // EXTENSIVE PRE-CAPTURE DEBUGGING
      console.log('=== PRE-CAPTURE DEBUGGING ===');
      console.log('Screenshot container:', screenshotContainer);
      console.log('Screenshot container children:', screenshotContainer.children);
      const debugInput = screenshotContainer.querySelector('.message-input');
      console.log('Input found in container:', debugInput);
      if (debugInput) {
        console.log('Input getBoundingClientRect:', debugInput.getBoundingClientRect());
        console.log('Input offsetHeight:', debugInput.offsetHeight);
        console.log('Input scrollHeight:', debugInput.scrollHeight);
        console.log('Input computed style:', getComputedStyle(debugInput));
      }
      console.log('=== END PRE-CAPTURE DEBUGGING ===');
      
      const canvas = await html2canvas(screenshotContainer, {
        backgroundColor: '#ffffff',
        scale: deviceScale,
        useCORS: true,
        allowTaint: true,
        logging: true, // Enable logging to see what html2canvas is doing
        width: width,
        height: contentHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: width,
        windowHeight: contentHeight,
        imageTimeout: 5000,
        removeContainer: false,
        ignoreElements: function(element) {
          // Don't ignore any elements - capture everything
          return false;
        },
        onclone: function(clonedDoc, element) {
          console.log('=== HTML2CANVAS ONCLONE ===');
          console.log('Cloned document:', clonedDoc);
          console.log('Cloned element:', element);
          
          const clonedInput = element.querySelector('.message-input');
          console.log('Input in html2canvas clone:', clonedInput);
          
          if (clonedInput) {
            console.log('FOUND INPUT IN HTML2CANVAS CLONE!');
            console.log('Clone input computed style:', getComputedStyle(clonedInput));
            console.log('Clone input rect:', clonedInput.getBoundingClientRect());
            
            // ULTRA FORCE in html2canvas clone
            clonedInput.style.cssText = 'display: flex !important; visibility: visible !important; position: relative !important; opacity: 1 !important; background: #f0f2f6 !important; padding: 8px 12px !important; min-height: 60px !important; width: 100% !important;';
            
            console.log('After force in clone:', getComputedStyle(clonedInput));
          } else {
            console.error('❌ INPUT NOT FOUND IN HTML2CANVAS CLONE!');
          }
          
          console.log('=== END HTML2CANVAS ONCLONE ===');
        }
      });
      
      // Hide container again
      screenshotContainer.style.visibility = 'hidden';
      screenshotContainer.style.position = 'absolute';
      screenshotContainer.style.top = '-9999px';
      screenshotContainer.style.left = '-9999px';
      screenshotContainer.style.zIndex = 'auto';
      
      const dataURL = canvas.toDataURL('image/png', 1.0); // Maximum quality

      // Save to history
      saveScreenshotHistory(dataURL);
      
      // Download
      const link = document.createElement('a');
      link.href = dataURL;
      const safeName = (displayContactName.textContent || 'whatsapp').replace(/[^a-z0-9-_]+/gi, '_');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      link.download = `whatsapp_${safeName}_${timestamp}.png`;
      link.click();
      
      // Show success message
      showSuccessMessage('Borderless screenshot generated!');
      
    } catch (e) {
      alert('Failed to generate screenshot. Please try again.');
      console.error('Screenshot error:', e);
    } finally {
      generateBtn.disabled = false;
      generateBtn.innerHTML = originalText;
    }
  }
  
  function showSuccessMessage(text) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = text;
    successDiv.style.display = 'block';
    
    const actionButtons = document.querySelector('.action-buttons');
    actionButtons.appendChild(successDiv);
    
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.parentNode.removeChild(successDiv);
      }
    }, 3000);
  }

  // Event bindings with auto-save
  contactNameInput.addEventListener('input', () => { syncHeader(); saveToLocalStorage(); });
  contactStatusInput.addEventListener('change', () => { syncHeader(); saveToLocalStorage(); });
  profilePicInput.addEventListener('input', () => { syncHeader(); saveToLocalStorage(); });

  batteryLevelInput.addEventListener('input', () => { syncStatusBar(); saveToLocalStorage(); });
  timeDisplayInput.addEventListener('input', () => { syncStatusBar(); saveToLocalStorage(); });
  headerIconSizeInput.addEventListener('input', () => { syncHeaderIconSize(); saveToLocalStorage(); });
  networkProviderInput.addEventListener('input', saveToLocalStorage);

  addMessageBtn.addEventListener('click', () => { addMessage(); saveToLocalStorage(); });
  messageTextInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { 
      addMessage(); 
      saveToLocalStorage(); 
    }
  });

  clearMessagesBtn.addEventListener('click', () => { 
    clearAll(); 
    saveToLocalStorage(); 
  });
  generateBtn.addEventListener('click', generateScreenshot);

  // Local Storage Functions
  function saveToLocalStorage() {
    const messages = [];
    const messageItems = document.querySelectorAll('.message-item');
    
    messageItems.forEach(item => {
      const type = item.classList.contains('sent') ? 'sent' : 'received';
      const text = item.querySelector('.message-text').textContent;
      const time = item.querySelector('.message-time').textContent;
      // Get status from the actual message (if sent)
      const status = type === 'sent' ? 'seen' : 'none'; // Default for now
      messages.push({ type, text, time, status });
    });
    
    const chatData = {
      messages,
      contactName: contactNameInput.value,
      contactStatus: contactStatusInput.value,
      profilePic: profilePicInput.value,
      batteryLevel: batteryLevelInput.value,
      timeDisplay: timeDisplayInput.value,
      networkProvider: networkProviderInput.value,
      headerIconSize: headerIconSizeInput.value
    };
    
    localStorage.setItem('whatsappChatData', JSON.stringify(chatData));
  }
  
  function loadFromLocalStorage() {
    const savedData = localStorage.getItem('whatsappChatData');
    if (savedData) {
      const chatData = JSON.parse(savedData);
      
      // Load form data
      contactNameInput.value = chatData.contactName || 'John Doe';
      contactStatusInput.value = chatData.contactStatus || 'online';
      profilePicInput.value = chatData.profilePic || '';
      batteryLevelInput.value = chatData.batteryLevel || 85;
      timeDisplayInput.value = chatData.timeDisplay || '19:30';
      networkProviderInput.value = chatData.networkProvider || 'Carrier';
      headerIconSizeInput.value = chatData.headerIconSize || 1.0;
      
      // Load messages
      chatData.messages.forEach(m => {
        const b = createMessageBubble(m.type, m.text, m.time, m.status || 'seen');
        messagesContainer.appendChild(b);
        addMessageToList(m.type, m.text, m.time, m.status || 'seen');
      });
      
      // Sync UI
      syncHeader();
      syncStatusBar();
      syncHeaderIconSize();
    }
  }
  
  function saveScreenshotHistory(dataURL) {
    const screenshots = JSON.parse(localStorage.getItem('whatsappScreenshots') || '[]');
    const screenshot = {
      id: Date.now(),
      dataURL,
      contactName: displayContactName.textContent,
      timestamp: new Date().toISOString(),
      messageCount: messagesContainer.querySelectorAll('.message-bubble').length
    };
    
    screenshots.unshift(screenshot); // Add to beginning
    if (screenshots.length > 10) screenshots.pop(); // Keep only 10 recent
    
    localStorage.setItem('whatsappScreenshots', JSON.stringify(screenshots));
  }

  // Initialize with saved data or sample conversation
  function init() {
    syncHeader();
    syncStatusBar();
    syncHeaderIconSize();
    
    // Try to load saved data first
    loadFromLocalStorage();
    
    // If no saved data, load sample
    if (messagesContainer.querySelectorAll('.message-bubble').length === 1) { // Only date divider
      const samples = [
        { type: 'sent', text: 'Hello, how are you doing today', time: '14:29', status: 'seen' }
      ];
      samples.forEach(m => {
        const b = createMessageBubble(m.type, m.text, m.time, m.status || 'seen');
        messagesContainer.appendChild(b);
        addMessageToList(m.type, m.text, m.time, m.status || 'seen');
      });
    }
  }

  init();
})();

