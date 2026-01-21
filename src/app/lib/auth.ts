import { apiClient, User, Shop, AuthResponse, SigninRequest, SignupRequest } from './api';

// Auth state interface
export interface AuthState {
  user: User | null;
  currentShop: Shop | null;
  allShops: Shop[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Storage keys
const AUTH_STATE_KEY = 'commerceai_auth_state';

export class AuthService {
  private authState: AuthState = {
    user: null,
    currentShop: null,
    allShops: [],
    isAuthenticated: false,
    isLoading: true,
  };

  private listeners: ((state: AuthState) => void)[] = [];

  constructor() {
    this.loadStoredState();
    this.initializeAuth();
  }

  private loadStoredState() {
    try {
      const stored = localStorage.getItem(AUTH_STATE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.authState = { ...this.authState, ...parsed, isLoading: true };
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
    }
  }

  private saveState() {
    try {
      localStorage.setItem(AUTH_STATE_KEY, JSON.stringify({
        user: this.authState.user,
        currentShop: this.authState.currentShop,
        allShops: this.authState.allShops,
        isAuthenticated: this.authState.isAuthenticated,
      }));
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  }

  private async initializeAuth() {
    try {
      // Check if we have tokens
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        this.setAuthState({
          user: null,
          currentShop: null,
          allShops: [],
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      // Try to refresh token or validate current session
      // For now, assume token is valid if present
      // TODO: Implement proper token validation
      this.authState.isLoading = false;
      this.notifyListeners();
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.logout();
    }
  }

  private setAuthState(state: Partial<AuthState>) {
    this.authState = { ...this.authState, ...state };
    this.saveState();
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.authState));
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getState(): AuthState {
    return this.authState;
  }

  async signin(credentials: SigninRequest): Promise<void> {
    try {
      this.setAuthState({ isLoading: true });
      const authData = await apiClient.signin(credentials);

      this.setAuthState({
        user: authData.user,
        currentShop: authData.currentShop,
        allShops: authData.allShops,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      this.setAuthState({ isLoading: false });
      throw error;
    }
  }

  async signup(userData: SignupRequest): Promise<void> {
    try {
      this.setAuthState({ isLoading: true });
      const authData = await apiClient.signup(userData);

      this.setAuthState({
        user: authData.user,
        currentShop: authData.currentShop,
        allShops: authData.allShops,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      this.setAuthState({ isLoading: false });
      throw error;
    }
  }

  async switchShop(shopId: string): Promise<void> {
    const shop = this.authState.allShops.find(s => s.id === shopId);
    if (!shop) {
      throw new Error('Shop not found');
    }

    // TODO: Call API to switch shop context if needed
    // For now, just update local state
    this.setAuthState({ currentShop: shop });
  }

  logout(): void {
    apiClient.setAccessToken(null);
    localStorage.removeItem('refreshToken');
    localStorage.removeItem(AUTH_STATE_KEY);

    this.setAuthState({
      user: null,
      currentShop: null,
      allShops: [],
      isAuthenticated: false,
      isLoading: false,
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  getCurrentShop(): Shop | null {
    return this.authState.currentShop;
  }

  getCurrentShopId(): string | null {
    return this.authState.currentShop?.id || null;
  }

  hasPermission(permission: string): boolean {
    // TODO: Implement proper permission checking based on role
    if (!this.authState.currentShop) return false;

    const role = this.authState.currentShop.role;
    // Simple role-based permissions
    switch (permission) {
      case 'manage_products':
        return ['owner', 'admin'].includes(role);
      case 'manage_orders':
        return ['owner', 'admin', 'staff'].includes(role);
      case 'view_reports':
        return ['owner', 'admin'].includes(role);
      default:
        return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export convenience functions
export const logout = () => authService.logout();
