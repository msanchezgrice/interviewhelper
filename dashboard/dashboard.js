// Dashboard functionality for InterviewHelper AI
document.addEventListener('DOMContentLoaded', () => {
  initializeDashboard();
});

// State management
let interviews = [];
let filteredInterviews = [];
let currentPage = 1;
const itemsPerPage = 10;

// Initialize dashboard
function initializeDashboard() {
  loadInterviews();
  setupEventListeners();
  updateStats();
}

// Set up event listeners
function setupEventListeners() {
  // Header buttons
  document.getElementById('newInterviewBtn').addEventListener('click', startNewInterview);
  document.getElementById('settingsBtn').addEventListener('click', openSettings);
  
  // Search and filter
  document.getElementById('searchInput').addEventListener('input', handleSearch);
  document.getElementById('filterBtn').addEventListener('click', showFilterMenu);
  
  // Empty state button
  const emptyStateBtn = document.querySelector('.empty-state .btn-primary');
  if (emptyStateBtn) {
    emptyStateBtn.addEventListener('click', startNewInterview);
  }
  
  // Modal controls
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('exportBtn').addEventListener('click', exportInterview);
  document.getElementById('editBtn').addEventListener('click', editInterview);
  document.getElementById('deleteBtn').addEventListener('click', deleteInterview);
  
  // Pagination
  document.getElementById('prevBtn').addEventListener('click', () => changePage(-1));
  document.getElementById('nextBtn').addEventListener('click', () => changePage(1));
  
  // Close modal on background click
  document.getElementById('detailsModal').addEventListener('click', (e) => {
    if (e.target.id === 'detailsModal') {
      closeModal();
    }
  });
}

// Load interviews from storage
function loadInterviews() {
  chrome.storage.local.get(['interviews'], (result) => {
    interviews = result.interviews || [];
    filteredInterviews = [...interviews];
    
    // Sort by date (newest first)
    filteredInterviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    renderInterviews();
    updateStats();
  });
}

// Render interviews list
function renderInterviews() {
  const interviewsList = document.getElementById('interviewsList');
  const emptyState = document.getElementById('emptyState');
  const pagination = document.getElementById('pagination');
  
  if (filteredInterviews.length === 0) {
    emptyState.style.display = 'block';
    pagination.style.display = 'none';
    return;
  }
  
  emptyState.style.display = 'none';
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredInterviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageInterviews = filteredInterviews.slice(startIndex, endIndex);
  
  // Clear existing content
  interviewsList.innerHTML = '';
  
  // Add interview items
  pageInterviews.forEach(interview => {
    const interviewItem = createInterviewItem(interview);
    interviewsList.appendChild(interviewItem);
  });
  
  // Update pagination
  updatePagination(totalPages);
}

// Create interview item element
function createInterviewItem(interview) {
  const item = document.createElement('div');
  item.className = 'interview-item';
  item.dataset.id = interview.id;
  
  item.innerHTML = `
    <div class="interview-header">
      <h3 class="interview-title">${interview.title || 'Untitled Interview'}</h3>
      <span class="interview-date">${formatDate(interview.date)}</span>
    </div>
    <div class="interview-meta">
      <div class="interview-meta-item">
        <span>⏱️</span>
        <span>${formatDuration(interview.duration)}</span>
      </div>
      <div class="interview-meta-item">
        <span>👥</span>
        <span>${interview.participants || 'Unknown'}</span>
      </div>
      <div class="interview-meta-item">
        <span>💡</span>
        <span>${interview.insights?.length || 0} insights</span>
      </div>
    </div>
  `;
  
  item.addEventListener('click', () => showInterviewDetails(interview));
  
  return item;
}

// Update dashboard statistics
function updateStats() {
  // Total interviews
  document.getElementById('totalInterviews').textContent = interviews.length;
  
  // Total duration
  const totalMinutes = interviews.reduce((sum, interview) => sum + (interview.duration || 0), 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  document.getElementById('totalDuration').textContent = `${hours}h ${minutes}m`;
  
  // Total insights
  const totalInsights = interviews.reduce((sum, interview) => 
    sum + (interview.insights?.length || 0), 0);
  document.getElementById('totalInsights').textContent = totalInsights;
  
  // This week's interviews
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  const weeklyCount = interviews.filter(interview => 
    new Date(interview.date) >= weekStart).length;
  document.getElementById('weeklyInterviews').textContent = weeklyCount;
}

// Search functionality
function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase().trim();
  
  if (!searchTerm) {
    filteredInterviews = [...interviews];
  } else {
    filteredInterviews = interviews.filter(interview => {
      const title = (interview.title || '').toLowerCase();
      const participants = (interview.participants || '').toLowerCase();
      const transcript = (interview.transcript || '').toLowerCase();
      
      return title.includes(searchTerm) || 
             participants.includes(searchTerm) || 
             transcript.includes(searchTerm);
    });
  }
  
  currentPage = 1;
  renderInterviews();
}

// Pagination
function updatePagination(totalPages) {
  const pagination = document.getElementById('pagination');
  const pageNumbers = document.getElementById('pageNumbers');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  if (totalPages <= 1) {
    pagination.style.display = 'none';
    return;
  }
  
  pagination.style.display = 'flex';
  
  // Update page numbers
  pageNumbers.innerHTML = '';
  
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || 
      i === totalPages || 
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      const pageBtn = document.createElement('button');
      pageBtn.className = 'page-btn';
      pageBtn.textContent = i;
      
      if (i === currentPage) {
        pageBtn.classList.add('active');
      }
      
      pageBtn.addEventListener('click', () => {
        currentPage = i;
        renderInterviews();
      });
      
      pageNumbers.appendChild(pageBtn);
    } else if (
      i === currentPage - 2 || 
      i === currentPage + 2
    ) {
      const dots = document.createElement('span');
      dots.textContent = '...';
      dots.style.padding = '0 8px';
      pageNumbers.appendChild(dots);
    }
  }
  
  // Update navigation buttons
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

function changePage(direction) {
  const totalPages = Math.ceil(filteredInterviews.length / itemsPerPage);
  currentPage = Math.max(1, Math.min(totalPages, currentPage + direction));
  renderInterviews();
}

// Show interview details in modal
function showInterviewDetails(interview) {
  const modal = document.getElementById('detailsModal');
  
  // Update modal content
  document.getElementById('modalTitle').textContent = interview.title || 'Untitled Interview';
  document.getElementById('modalDate').textContent = formatDate(interview.date);
  document.getElementById('modalDuration').textContent = formatDuration(interview.duration);
  document.getElementById('modalParticipants').textContent = interview.participants || 'Unknown';
  document.getElementById('modalTranscript').textContent = interview.transcript || 'No transcript available';
  
  // Format insights
  const insightsContent = document.getElementById('modalInsights');
  if (interview.insights && interview.insights.length > 0) {
    insightsContent.innerHTML = interview.insights
      .map(insight => `• ${insight}`)
      .join('\n');
  } else {
    insightsContent.textContent = 'No insights generated yet';
  }
  
  // Store current interview ID for actions
  modal.dataset.interviewId = interview.id;
  
  // Show modal
  modal.classList.add('active');
}

// Close modal
function closeModal() {
  const modal = document.getElementById('detailsModal');
  modal.classList.remove('active');
  delete modal.dataset.interviewId;
}

// Export interview
function exportInterview() {
  const modal = document.getElementById('detailsModal');
  const interviewId = modal.dataset.interviewId;
  const interview = interviews.find(i => i.id === interviewId);
  
  if (!interview) return;
  
  // Create export data
  const exportData = {
    title: interview.title || 'Untitled Interview',
    date: interview.date,
    duration: interview.duration,
    participants: interview.participants,
    transcript: interview.transcript,
    insights: interview.insights,
    exportedAt: new Date().toISOString()
  };
  
  // Create and download file
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `interview-${interview.id}-${new Date().getTime()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  closeModal();
}

// Edit interview (placeholder)
function editInterview() {
  alert('Edit functionality coming soon!');
}

// Delete interview
function deleteInterview() {
  const modal = document.getElementById('detailsModal');
  const interviewId = modal.dataset.interviewId;
  
  if (!confirm('Are you sure you want to delete this interview? This action cannot be undone.')) {
    return;
  }
  
  // Remove interview from array
  interviews = interviews.filter(i => i.id !== interviewId);
  
  // Save to storage
  chrome.storage.local.set({ interviews }, () => {
    closeModal();
    loadInterviews();
  });
}

// Navigation functions
function startNewInterview() {
  // Send message to background script to start new interview
  chrome.runtime.sendMessage({ action: 'startNewInterview' });
  window.close();
}

function openSettings() {
  chrome.runtime.openOptionsPage();
}

// Filter menu (placeholder)
function showFilterMenu() {
  alert('Filter options coming soon!');
}

// Utility functions
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
}

function formatDuration(minutes) {
  if (!minutes) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

// Mock data for testing (remove in production)
function generateMockData() {
  const mockInterviews = [
    {
      id: '1',
      title: 'User Research - Mobile App Usability',
      date: new Date().toISOString(),
      duration: 45,
      participants: 'John Doe',
      transcript: 'This is a sample transcript of the interview...',
      insights: [
        'Users find the navigation confusing',
        'Feature X is highly valued',
        'Onboarding process needs improvement'
      ]
    },
    {
      id: '2',
      title: 'Customer Feedback Session',
      date: new Date(Date.now() - 86400000).toISOString(),
      duration: 30,
      participants: 'Jane Smith',
      transcript: 'Customer feedback transcript...',
      insights: [
        'Price point is acceptable',
        'Need better customer support'
      ]
    }
  ];
  
  chrome.storage.local.set({ interviews: mockInterviews }, () => {
    loadInterviews();
  });
}

// Uncomment for testing with mock data
// generateMockData();
