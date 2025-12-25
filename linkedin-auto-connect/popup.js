// Popup script

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  
  document.getElementById('saveBtn').addEventListener('click', saveData);
  document.getElementById('runBtn').addEventListener('click', runNow);
  document.getElementById('clearBtn').addEventListener('click', clearStats);
});

async function loadData() {
  const data = await chrome.storage.local.get([
    'urlList',
    'currentIndex',
    'dailyLimit',
    'lastRunDate',
    'stats'
  ]);
  
  if (data.urlList && data.urlList.length > 0) {
    document.getElementById('urlList').value = data.urlList.join('\n');
  }
  
  document.getElementById('dailyLimit').value = data.dailyLimit || 5;
  
  const stats = data.stats || { totalSent: 0, successCount: 0, failedCount: 0 };
  document.getElementById('totalSent').textContent = stats.totalSent;
  document.getElementById('successCount').textContent = stats.successCount;
  document.getElementById('failedCount').textContent = stats.failedCount;
  
  const totalUrls = data.urlList?.length || 0;
  const currentIndex = data.currentIndex || 0;
  const remaining = totalUrls - currentIndex;
  
  document.getElementById('remaining').textContent = remaining > 0 ? remaining : 0;
  document.getElementById('totalUrls').textContent = totalUrls;
  document.getElementById('currentIndex').textContent = currentIndex;
  
  document.getElementById('lastRun').textContent = data.lastRunDate || 'Never';
  
  const dailyLimit = data.dailyLimit || 5;
  if (remaining > 0) {
    const daysRemaining = Math.ceil(remaining / dailyLimit);
    document.getElementById('estimatedDays').textContent = `${daysRemaining} days`;
  } else {
    document.getElementById('estimatedDays').textContent = 'Completed';
  }
}

async function saveData() {
  const urlText = document.getElementById('urlList').value;
  const dailyLimit = parseInt(document.getElementById('dailyLimit').value);
  
  const urlList = urlText
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0 && url.includes('linkedin.com/in/'));
  
  if (urlList.length === 0) {
    showStatus('❌ Please enter at least one valid LinkedIn URL!', 'error');
    return;
  }
  
  if (dailyLimit < 1 || dailyLimit > 50) {
    showStatus('❌ Daily limit must be between 1 and 50!', 'error');
    return;
  }
  
  await chrome.storage.local.set({
    urlList: urlList,
    dailyLimit: dailyLimit,
    currentIndex: 0
  });
  
  showStatus(`✅ Saved! ${urlList.length} URLs in list. Index reset to 0.`, 'success');
  
  setTimeout(() => loadData(), 500);
}

async function runNow() {
  const urlText = document.getElementById('urlList').value;
  const dailyLimit = parseInt(document.getElementById('dailyLimit').value);
  
  const urlList = urlText
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0 && url.includes('linkedin.com/in/'));
  
  if (urlList.length === 0) {
    showStatus('❌ Please enter at least one valid LinkedIn URL!', 'error');
    return;
  }
  
  await chrome.storage.local.set({
    urlList: urlList,
    dailyLimit: dailyLimit,
    currentIndex: 0,
    lastRunDate: null
  });
  
  const runBtn = document.getElementById('runBtn');
  runBtn.disabled = true;
  runBtn.textContent = '⏳ Running...';
  
  showStatus(`🔄 Starting batch process... (${urlList.length} URLs, from beginning)`, 'success');
  
  chrome.runtime.sendMessage({ action: 'manualRun' }, (response) => {
    runBtn.disabled = false;
    runBtn.textContent = '▶️ Run Now';
    
    if (response && response.success) {
      showStatus('✅ Process completed successfully!', 'success');
    } else {
      showStatus(`❌ Error: ${response?.error || 'Unknown error'}`, 'error');
    }
    
    setTimeout(() => loadData(), 2000);
  });
}

function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `status show ${type}`;
  
  setTimeout(() => {
    statusDiv.className = 'status';
  }, 5000);
}

async function clearStats() {
  const confirmClear = confirm('⚠️ All data, statistics and URL list will be cleared. Continue?');
  
  if (!confirmClear) return;
  
  await chrome.storage.local.set({
    urlList: [],
    currentIndex: 0,
    lastRunDate: null,
    stats: {
      totalSent: 0,
      successCount: 0,
      failedCount: 0
    }
  });
  
  // Clear textarea as well
  document.getElementById('urlList').value = '';
  
  showStatus('✅ Everything cleared! Add new URLs and click Save.', 'success');
  
  setTimeout(() => loadData(), 500);
}
