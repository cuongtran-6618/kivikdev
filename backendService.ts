import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { MessageData } from "./src/types";

// Interface for backend response
export interface BackendResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface BackendServiceConfig {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
  requestInterceptor?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
  responseInterceptor?: (response: any) => any;
}

class BackendService {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(config?: BackendServiceConfig) {
    const {
      baseUrl = process.env.BOT_ENDPOINT || "http://localhost:3001",
      timeout = 5000,
      headers = { "Content-Type": "application/json" },
      requestInterceptor,
      responseInterceptor,
    } = config || {};

    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout,
      headers,
    });

    // Add request interceptor if provided
    if (requestInterceptor) {
      this.client.interceptors.request.use(requestInterceptor);
    }

    // Add response interceptor if provided
    if (responseInterceptor) {
      this.client.interceptors.response.use(responseInterceptor);
    }
  }

  /**
   * Send chat message to backend service
   * @param messageData - The chat message data to send
   * @returns Promise with backend response
   */
  async sendChatMessage(messageData: MessageData): Promise<BackendResponse> {
    try {
      const botEndpoint = process.env.BOT_ENDPOINT || "http://localhost:3001/chat";
      console.log(`[BackendService] Sending message to ${botEndpoint}`, messageData);
      const response = await this.client.post(botEndpoint, { message: messageData.text });
      console.log(`[BackendService] Successfully sent message. Response:`, response.data);
      return {
        success: true,
        data: response.data,
        message: "Message sent successfully",
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Handle errors from backend service
   * @param error - The error object
   * @returns Error response
   */
  private handleError(error: unknown): BackendResponse {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        // Server responded with error status
        console.error(
          `[BackendService] Server error: ${axiosError.response.status}`,
          axiosError.response.data
        );
        return {
          success: false,
          message: `Server error: ${axiosError.response.status}`,
          data: axiosError.response.data,
        };
      } else if (axiosError.request) {
        // Request made but no response received
        console.error(
          `[BackendService] No response from server. Is the backend running at ${this.baseUrl}?`
        );
        return {
          success: false,
          message: "No response from backend service",
        };
      }
    }

    // Unknown error
    console.error(`[BackendService] Unexpected error:`, error);
    return {
      success: false,
      message: "Unexpected error occurred",
    };
  }

  /**
   * Health check for backend service
   * @returns Promise with health status
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get("/health", { timeout: 2000 });
      return response.status === 200;
    } catch (error) {
      console.error(`[BackendService] Health check failed:`, error);
      return false;
    }
  }
}

// Export singleton instance
export default BackendService;
