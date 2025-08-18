// Sync Manager for Idea Feedback Extension
// Handles syncing interview data with the web dashboard

class SyncManager {
  constructor() {
    this.syncInterval = null;
    this.pendingSync = [];
  }

  // Initialize sync manager
  async init() {
    // Check if user is authenticated
    const { clerkToken } = await chrome.storage.local.get('clerkToken');
    if (clerkToken) {
      this.startPeriodicSync();
    }
    
    // Listen for auth changes
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.clerkToken) {
        if (changes.clerkToken.newValue) {
          this.startPeriodicSync();
        } else {
          this.stopPeriodicSync();
        }
      }
    });
  }

  // Start periodic sync
  startPeriodicSync() {
    // Sync every 5 minutes
    this.syncInterval = setInterval(() => {
      this.syncData();
    }, 5 * 60 * 1000);
    
    // Initial sync
    this.syncData();
  }

  // Stop periodic sync
  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Sync data with the web dashboard
  async syncData() {
    try {
      const { clerkToken, pendingInterviews } = await chrome.storage.local.get([
        'clerkToken',
        'pendingInterviews'
      ]);
      
      if (!clerkToken) return;
      
      // If there are pending interviews to sync
      if (pendingInterviews && pendingInterviews.length > 0) {
        for (const interview of pendingInterviews) {
          await this.syncInterview(interview, clerkToken);
        }
        
        // Clear pending interviews after successful sync
        await chrome.storage.local.set({ pendingInterviews: [] });
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  }

  // Sync a single interview
  async syncInterview(interview, token) {
    try {
      const response = await fetch('https://ideafeedback.co/api/extension/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(interview)
      });
      
      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Interview synced successfully:', result.interviewId);
      
      return result;
    } catch (error) {
      console.error('Failed to sync interview:', error);
      // Keep in pending queue for retry
      throw error;
    }
  }

  // Add interview to sync queue
  async queueInterview(interviewData) {
    const { pendingInterviews = [] } = await chrome.storage.local.get('pendingInterviews');
    pendingInterviews.push({
      ...interviewData,
      timestamp: Date.now(),
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
    
    await chrome.storage.local.set({ pendingInterviews });
    
    // Try to sync immediately if authenticated
    const { clerkToken } = await chrome.storage.local.get('clerkToken');
    if (clerkToken) {
      this.syncData();
    }
  }

  // Fetch user's interviews from the dashboard
  async fetchInterviews() {
    try {
      const { clerkToken } = await chrome.storage.local.get('clerkToken');
      if (!clerkToken) return [];
      
      const response = await fetch('https://ideafeedback.co/api/extension/sync', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Fetch failed: ${response.status}`);
      }
      
      const result = await response.json();
      return result.interviews || [];
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
      return [];
    }
  }
}

// Create and export singleton instance
const syncManager = new SyncManager();
export default syncManager;