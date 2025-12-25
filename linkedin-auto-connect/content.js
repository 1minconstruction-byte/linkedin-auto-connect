// Content script for LinkedIn pages

console.log('LinkedIn Auto Connect content script loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'connect') {
    console.log('🔄 Starting connection process...');
    tryToConnect(sendResponse);
    return true;
  }
});

async function tryToConnect(sendResponse) {
  try {
    await sleep(2000);
    
    console.log('🔍 Searching for Connect button...');
    
    // Try direct Connect button first
    let connectBtn = findConnectButton();
    
    if (connectBtn) {
      console.log('✅ Found direct Connect button, clicking...');
      connectBtn.click();
      await sleep(2000);
      
      console.log('🔍 Looking for Send button...');
      const sendBtn = findSendButton();
      
      if (sendBtn) {
        console.log('✅ Clicking Send without note...');
        sendBtn.click();
        sendResponse({ success: true });
        return;
      }
    }
    
    // If no direct Connect, try ALL More buttons
    console.log('🔍 No direct Connect, trying ALL More buttons...');
    const moreButtons = findAllMoreButtons();
    
    if (moreButtons.length === 0) {
      console.log('❌ No More buttons found');
      sendResponse({ success: false, message: 'No Connect or More button found' });
      return;
    }
    
    console.log(`📋 Found ${moreButtons.length} More buttons, trying each...`);
    
    // Try each More button
    for (let i = 0; i < moreButtons.length; i++) {
      const moreBtn = moreButtons[i];
      console.log(`🖱️ Clicking More button #${i + 1}...`);
      
      moreBtn.click();
      await sleep(1500);
      
      // Look for Connect in dropdown
      connectBtn = findConnectInDropdown();
      
      if (connectBtn) {
        console.log(`✅ Found Connect in dropdown #${i + 1}!`);
        connectBtn.click();
        await sleep(2000);
        
        console.log('🔍 Looking for Send button...');
        const sendBtn = findSendButton();
        
        if (sendBtn) {
          console.log('✅ Clicking Send without note...');
          sendBtn.click();
          sendResponse({ success: true });
          return;
        } else {
          console.log('⚠️ Send button not found');
          
          const closeBtn = document.querySelector('button[aria-label*="Dismiss"]') ||
                          document.querySelector('button[data-test-modal-close-btn]');
          if (closeBtn) closeBtn.click();
          await sleep(500);
        }
      } else {
        console.log(`⚠️ No Connect in dropdown #${i + 1}`);
        document.body.click();
        await sleep(500);
      }
    }
    
    console.log('❌ Tried all More buttons, no Connect found');
    sendResponse({ success: false, message: 'Connect not found in any dropdown' });
    
  } catch (error) {
    console.error('❌ Error:', error);
    sendResponse({ success: false, message: error.message });
  }
}

function findConnectButton() {
  const selectors = [
    'button.pvs-profile-actions__action[aria-label*="Connect"]',
    'button[aria-label*="Invite"]',
    'button[aria-label*="Connect"]'
  ];
  
  for (const selector of selectors) {
    const btn = document.querySelector(selector);
    if (btn) return btn;
  }
  
  const allButtons = document.querySelectorAll('button');
  for (const btn of allButtons) {
    const text = btn.textContent.trim();
    const label = btn.getAttribute('aria-label') || '';
    
    if ((text === 'Connect' || label.includes('Connect')) && 
        !text.includes('Following') && 
        !text.includes('Pending')) {
      return btn;
    }
  }
  
  return null;
}

function findAllMoreButtons() {
  console.log('🔍 Searching for ALL More buttons...');
  const moreButtons = [];
  
  const mainSection = document.querySelector('main') || document.querySelector('#main') || document.body;
  
  const allButtons = mainSection.querySelectorAll('button');
  console.log(`Found ${allButtons.length} total buttons`);
  
  for (const btn of allButtons) {
    const text = btn.textContent.trim();
    const label = btn.getAttribute('aria-label') || '';
    
    if (text === 'More' || label.includes('More')) {
      const inHeader = btn.closest('header') || 
                      btn.closest('.global-nav') ||
                      btn.closest('[role="navigation"]') ||
                      btn.closest('.msg-overlay-list-bubble');
      
      if (!inHeader) {
        const rect = btn.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && rect.top < 800) {
          console.log(`✓ Found More button: "${text}" / "${label}" at y=${rect.top}`);
          moreButtons.push(btn);
        }
      }
    }
  }
  
  console.log(`✓ Total valid More buttons found: ${moreButtons.length}`);
  return moreButtons;
}

function findConnectInDropdown() {
  const dropdown = document.querySelector('.artdeco-dropdown__content-inner') ||
                  document.querySelector('[role="menu"]');
  
  if (!dropdown) return null;
  
  const items = dropdown.querySelectorAll('div[role="button"], li[role="menuitem"]');
  for (const item of items) {
    if (item.textContent.includes('Connect')) {
      return item;
    }
  }
  
  return null;
}

function findSendButton() {
  const selectors = [
    'button[aria-label*="Send without"]',
    'button[aria-label*="Send now"]',
    'button.artdeco-button--primary[aria-label*="Send"]'
  ];
  
  for (const selector of selectors) {
    const btn = document.querySelector(selector);
    if (btn) return btn;
  }
  
  const allButtons = document.querySelectorAll('button');
  for (const btn of allButtons) {
    const text = btn.textContent.trim();
    if (text.includes('Send without') || text.includes('Send now')) {
      return btn;
    }
  }
  
  return null;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
