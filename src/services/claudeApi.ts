interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeRequest {
  model: string;
  max_tokens: number;
  messages: ClaudeMessage[];
  system?: string;
}

interface ClaudeResponse {
  content: ClaudeMessage[];
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

class ClaudeAPIService {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    // Get API key from environment variable
    this.apiKey = import.meta.env.VITE_CLAUDE_API_KEY || '';
    this.baseUrl = 'https://api.anthropic.com/v1/messages';
    this.defaultModel = 'claude-3-sonnet-20240229';
  }

  private async makeRequest(requestBody: ClaudeRequest): Promise<ClaudeResponse> {
    if (!this.apiKey) {
      throw new Error('Claude API key not found. Please set VITE_CLAUDE_API_KEY environment variable.');
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Claude API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return {
        content: data.content,
        usage: data.usage
      };
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw error;
    }
  }

  async chat(
    userMessage: string,
    conversationHistory: ClaudeMessage[] = [],
    systemPrompt?: string
  ): Promise<string> {
    const messages: ClaudeMessage[] = [
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    const requestBody: ClaudeRequest = {
      model: this.defaultModel,
      max_tokens: 1000,
      messages,
      ...(systemPrompt && { system: systemPrompt })
    };

    try {
      const response = await this.makeRequest(requestBody);
      
      if (response.content && response.content.length > 0) {
        return response.content[0].content;
      } else {
        throw new Error('No response content received from Claude API');
      }
    } catch (error) {
      console.error('Error in Claude chat:', error);
      throw error;
    }
  }

  // Method to check if API is properly configured
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  // Method to get API configuration status
  getConfigStatus(): { configured: boolean; model: string } {
    return {
      configured: this.isConfigured(),
      model: this.defaultModel
    };
  }
}

// Create and export a singleton instance
export const claudeAPI = new ClaudeAPIService();

// Export types for use in components
export type { ClaudeMessage, ClaudeRequest, ClaudeResponse };
