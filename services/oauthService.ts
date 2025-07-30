import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { OAuthProvider, OAuthConfig, OAuthTokens, OAuthUserInfo } from '@/types/auth';

// Complete the auth session for better UX
WebBrowser.maybeCompleteAuthSession();

class OAuthService {
  private configs: Record<string, OAuthConfig> = {
    github: {
      clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID || 'your-github-client-id',
      redirectUri: AuthSession.makeRedirectUri(),
      scopes: ['user:email', 'read:user'],
      authorizationEndpoint: 'https://github.com/login/oauth/authorize',
      tokenEndpoint: 'https://github.com/login/oauth/access_token',
      userInfoEndpoint: 'https://api.github.com/user'
    },
    gitlab: {
      clientId: process.env.EXPO_PUBLIC_GITLAB_CLIENT_ID || 'your-gitlab-client-id',
      redirectUri: AuthSession.makeRedirectUri(),
      scopes: ['read_user', 'email'],
      authorizationEndpoint: 'https://gitlab.com/oauth/authorize',
      tokenEndpoint: 'https://gitlab.com/oauth/token',
      userInfoEndpoint: 'https://gitlab.com/api/v4/user'
    },
    google: {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id',
      redirectUri: AuthSession.makeRedirectUri(),
      scopes: ['openid', 'profile', 'email'],
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      userInfoEndpoint: 'https://www.googleapis.com/oauth2/v2/userinfo'
    }
  };

  async signInWithProvider(providerId: string): Promise<OAuthUserInfo> {
    const config = this.configs[providerId];
    if (!config) {
      throw new Error(`Unsupported provider: ${providerId}`);
    }

    try {
      // Generate PKCE challenge for security
      const codeChallenge = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Math.random().toString(36),
        { encoding: Crypto.CryptoEncoding.BASE64 }
      );

      // Create auth request
      const request = new AuthSession.AuthRequest({
        clientId: config.clientId,
        scopes: config.scopes,
        redirectUri: config.redirectUri,
        responseType: AuthSession.ResponseType.Code,
        codeChallenge,
        codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
        extraParams: providerId === 'google' ? {
          access_type: 'offline',
          prompt: 'consent'
        } : {}
      });

      // Perform auth request
      const result = await request.promptAsync({
        authorizationEndpoint: config.authorizationEndpoint
      });

      if (result.type !== 'success') {
        throw new Error('Authentication was cancelled or failed');
      }

      // Exchange code for tokens
      const tokens = await this.exchangeCodeForTokens(
        providerId,
        result.params.code,
        codeChallenge
      );

      // Get user info
      const userInfo = await this.getUserInfo(providerId, tokens.accessToken);

      return {
        ...userInfo,
        provider: providerId
      };

    } catch (error) {
      console.error(`OAuth error for ${providerId}:`, error);
      throw error;
    }
  }

  private async exchangeCodeForTokens(
    providerId: string,
    code: string,
    codeVerifier: string
  ): Promise<OAuthTokens> {
    const config = this.configs[providerId];
    
    const tokenParams = new URLSearchParams({
      client_id: config.clientId,
      code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri
    });

    if (config.clientSecret) {
      tokenParams.append('client_secret', config.clientSecret);
    }

    const response = await fetch(config.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: tokenParams.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const data = await response.json();
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      idToken: data.id_token,
      expiresIn: data.expires_in
    };
  }

  private async getUserInfo(providerId: string, accessToken: string): Promise<Omit<OAuthUserInfo, 'provider'>> {
    const config = this.configs[providerId];
    
    const response = await fetch(config.userInfoEndpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    const data = await response.json();
    
    // Normalize user data across providers
    switch (providerId) {
      case 'github':
        return {
          id: data.id.toString(),
          email: data.email,
          name: data.name || data.login,
          avatar: data.avatar_url
        };
      
      case 'gitlab':
        return {
          id: data.id.toString(),
          email: data.email,
          name: data.name || data.username,
          avatar: data.avatar_url
        };
      
      case 'google':
        return {
          id: data.id,
          email: data.email,
          name: data.name,
          avatar: data.picture
        };
      
      default:
        throw new Error(`Unknown provider: ${providerId}`);
    }
  }

  getRedirectUri(): string {
    return AuthSession.makeRedirectUri();
  }
}

export const oauthService = new OAuthService();