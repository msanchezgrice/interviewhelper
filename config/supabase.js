// Supabase configuration for InterviewHelper AI
const SUPABASE_URL = 'https://ftmcmonyfetjeimoxrbt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bWNtb255ZmV0amVpbW94cmJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5ODQ5MTMsImV4cCI6MjA2NzU2MDkxM30.UOEOIpUlG-r4pJ6Kb1xsL1s36RBoS9SAQA6pq2oYi4g';

class SupabaseClient {
  constructor() {
    this.url = SUPABASE_URL;
    this.key = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Get the anon key from MCP or stored settings
      const result = await chrome.storage.local.get(['supabaseKey']);
      this.key = result.supabaseKey || SUPABASE_ANON_KEY;
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Supabase:', error);
    }
  }

  async query(sql, params = []) {
    await this.initialize();
    
    try {
      const response = await fetch(`${this.url}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`
        },
        body: JSON.stringify({ query: sql, params })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
  }

  // Interview methods
  async saveInterview(interviewData) {
    const sql = `
      INSERT INTO interviews (start_time, end_time, transcript, duration_ms, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `;
    
    return await this.query(sql, [
      interviewData.startTime,
      interviewData.endTime,
      JSON.stringify(interviewData.transcript),
      interviewData.duration,
      JSON.stringify(interviewData.notes)
    ]);
  }

  async getInterviews(limit = 10) {
    const sql = `
      SELECT id, start_time, end_time, transcript, duration_ms, notes, created_at
      FROM interviews
      ORDER BY created_at DESC
      LIMIT $1;
    `;
    
    return await this.query(sql, [limit]);
  }

  async getInterview(id) {
    const sql = `
      SELECT id, start_time, end_time, transcript, duration_ms, notes, created_at
      FROM interviews
      WHERE id = $1;
    `;
    
    return await this.query(sql, [id]);
  }

  // Notes methods
  async saveNote(noteData) {
    const sql = `
      INSERT INTO notes (content, timestamp, tags, transcript_context, interview_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `;
    
    return await this.query(sql, [
      noteData.content,
      noteData.timestamp,
      JSON.stringify(noteData.tags),
      JSON.stringify(noteData.transcriptContext),
      noteData.interviewId
    ]);
  }

  async getNotes(interviewId = null) {
    let sql = `
      SELECT id, content, timestamp, tags, transcript_context, interview_id, created_at
      FROM notes
    `;
    
    const params = [];
    if (interviewId) {
      sql += ` WHERE interview_id = $1`;
      params.push(interviewId);
    }
    
    sql += ` ORDER BY created_at DESC`;
    
    return await this.query(sql, params);
  }

  // Settings methods
  async saveSettings(settings) {
    const sql = `
      INSERT INTO user_settings (settings)
      VALUES ($1)
      ON CONFLICT (id) DO UPDATE SET 
        settings = $1,
        updated_at = NOW()
      RETURNING id;
    `;
    
    return await this.query(sql, [JSON.stringify(settings)]);
  }

  async getSettings() {
    const sql = `
      SELECT settings FROM user_settings
      ORDER BY updated_at DESC
      LIMIT 1;
    `;
    
    return await this.query(sql);
  }
}

// Export for use in service worker and other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SupabaseClient;
} else {
  window.SupabaseClient = SupabaseClient;
}
