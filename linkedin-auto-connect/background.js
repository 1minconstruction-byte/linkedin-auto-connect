// Background service worker for LinkedIn Auto Connect

chrome.runtime.onInstalled.addListener(() => {
  console.log('LinkedIn Auto Connect installed');
  
  chrome.storage.local.get(['urlList', 'currentIndex'], (result) => {
    if (!result.urlList) {
      chrome.storage.local.set({
        urlList: [],
        currentIndex: 0,
        dailyLimit: 5,
        lastRunDate: null,
        stats: {
          totalSent: 0,
          successCount: 0,
          failedCount: 0
        }
      });
    }
  });
});



async function processDaily() {
  const today = new Date().toDateString();
  
  const data = await chrome.storage.local.get([
    'urlList', 
    'currentIndex', 
    'dailyLimit', 
    'lastRunDate',
    'stats'
  ]);
  
  if (data.lastRunDate === today) {
    console.log('Already run today');
    return;
  }
  
  const urlList = data.urlList || [];
  let currentIndex = data.currentIndex || 0;
  const dailyLimit = data.dailyLimit || 5;
  const stats = data.stats || { totalSent: 0, successCount: 0, failedCount: 0 };
  
  if (urlList.length === 0) {
    console.log('URL list is empty');
    return;
  }
  
  const urlsToProcess = [];
  for (let i = 0; i < dailyLimit && currentIndex < urlList.length; i++) {
    urlsToProcess.push(urlList[currentIndex]);
    currentIndex++;
  }
  
  if (currentIndex >= urlList.length) {
    currentIndex = 0;
  }
  
  for (const url of urlsToProcess) {
    try {
      await processConnection(url);
      stats.successCount++;
      stats.totalSent++;
      
      await sleep(3000 + Math.random() * 3000);
    } catch (error) {
      console.error('Connection error:', url, error);
      stats.failedCount++;
      stats.totalSent++;
    }
  }
  
  await chrome.storage.local.set({
    currentIndex: currentIndex,
    lastRunDate: today,
    stats: stats
  });
}

async function processConnection(profileUrl) {
  return new Promise((resolve, reject) => {
    chrome.tabs.create({ url: profileUrl, active: false }, (tab) => {
      const tabId = tab.id;
      let processed = false;
      
      const timeout = setTimeout(() => {
        if (!processed) {
          processed = true;
          chrome.tabs.remove(tabId).catch(() => {});
          reject(new Error('Timeout'));
        }
      }, 40000);
      
      chrome.tabs.onUpdated.addListener(function listener(id, info) {
        if (id === tabId && info.status === 'complete' && !processed) {
          chrome.tabs.onUpdated.removeListener(listener);
          
          setTimeout(() => {
            if (!processed) {
              chrome.tabs.sendMessage(tabId, { action: 'connect' }, (response) => {
                processed = true;
                clearTimeout(timeout);
                
                setTimeout(() => {
                  chrome.tabs.remove(tabId).catch(() => {});
                  
                  if (response && response.success) {
                    resolve();
                  } else {
                    reject(new Error(response?.message || 'Failed to connect'));
                  }
                }, 3000);
              });
            }
          }, 2000);
        }
      });
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'manualRun') {
    processDaily().then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
});
