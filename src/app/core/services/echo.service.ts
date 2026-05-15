import { Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { ConfigService } from './config.service';
import { AuthService } from '../auth/services/auth.service';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<any>;
  }
}

@Injectable({
  providedIn: 'root'
})
export class EchoService {
  private echo: Echo<any> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    window.Pusher = Pusher;
  }

  /**
   * Connect to Reverb WebSocket server
   */
  connect(): void {
    if (this.echo) {
      return; // Already connected
    }

    const config = this.configService.getConfig();
    const token = this.authService.accessToken;

    if (!config.reverb || !token) {
      console.warn('EchoService: Reverb config or token not available');
      return;
    }

    try {
      this.echo = new Echo({
        broadcaster: 'reverb',
        key: config.reverb.key,
        wsHost: config.reverb.host,
        wsPort: config.reverb.wsPort,
        wssPort: config.reverb.wssPort,
        forceTLS: config.reverb.forceTLS,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: config.broadcasting?.authEndpoint || `${config.apiURL.root}/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      });

      this.setupConnectionHandlers();
    } catch (error) {
      console.error('EchoService: Failed to initialize Echo', error);
    }
  }

  /**
   * Setup connection event handlers
   */
  private setupConnectionHandlers(): void {
    if (!this.echo) return;

    try {
      // @ts-ignore - Accessing internal Pusher connection
      const pusher = this.echo.connector.pusher;

      pusher.connection.bind('connected', () => {
        console.log('EchoService: WebSocket connected');
        this.reconnectAttempts = 0;
      });

      pusher.connection.bind('disconnected', () => {
        console.log('EchoService: WebSocket disconnected');
        this.handleReconnect();
      });

      pusher.connection.bind('error', (error: any) => {
        console.error('EchoService: WebSocket error', error);
      });

      pusher.connection.bind('state_change', (states: any) => {
        console.log('EchoService: Connection state changed', states);
      });
    } catch (error) {
      console.error('EchoService: Failed to setup connection handlers', error);
    }
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('EchoService: Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      30000
    );

    setTimeout(() => {
      console.log(`EchoService: Reconnecting... Attempt ${this.reconnectAttempts}`);
      if (this.echo) {
        try {
          // @ts-ignore
          this.echo.connector.pusher.connection.connect();
        } catch (error) {
          console.error('EchoService: Reconnection failed', error);
        }
      }
    }, delay);
  }

  /**
   * Join a presence channel
   */
  joinConversation(conversationId: number | string): any {
    if (!this.echo) {
      console.warn('EchoService: Echo not initialized');
      return null;
    }

    try {
      const channelName = `conversation.${conversationId}`;
      console.log('EchoService: Joining channel:', channelName);
      const channel = this.echo.join(channelName);
      console.log('EchoService: Channel object:', channel);
      
      // Add debugging for channel events
      if (channel) {
        // Listen to all events on this channel for debugging
        const pusherChannel = (this.echo as any).connector?.pusher?.channels?.channels[channelName];
        if (pusherChannel) {
          pusherChannel.bind_global((eventName: string, data: any) => {
            console.log('EchoService: Raw event received on channel:', channelName, eventName, data);
          });
        }
      }
      
      return channel;
    } catch (error) {
      console.error('EchoService: Failed to join conversation', error);
      return null;
    }
  }

  /**
   * Leave a presence channel
   */
  leaveConversation(conversationId: number | string): void {
    if (!this.echo) {
      return;
    }

    try {
      this.echo.leave(`conversation.${conversationId}`);
    } catch (error) {
      console.error('EchoService: Failed to leave conversation', error);
    }
  }

  /**
   * Disconnect from Echo
   */
  disconnect(): void {
    if (this.echo) {
      try {
        this.echo.disconnect();
        this.echo = null;
        this.reconnectAttempts = 0;
        console.log('EchoService: Disconnected');
      } catch (error) {
        console.error('EchoService: Failed to disconnect', error);
      }
    }
  }

  /**
   * Check if Echo is connected
   */
  isConnected(): boolean {
    if (!this.echo) {
      return false;
    }

    try {
      // @ts-ignore
      return this.echo.connector.pusher.connection.state === 'connected';
    } catch {
      return false;
    }
  }

  /**
   * Reconnect with new token
   */
  reconnectWithToken(token: string): void {
    this.disconnect();
    // Small delay to ensure cleanup
    setTimeout(() => {
      this.connect();
    }, 100);
  }
}
