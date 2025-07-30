# Knotebooks Mobile App

A React Native mobile application for executing and managing Jupyter notebooks with OAuth authentication.

## Features

- OAuth authentication with GitHub, GitLab, and Google
- Project and notebook management
- Interactive notebook execution
- WebView integration for Svelte runner component
- File sharing and download capabilities

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure OAuth Providers

Copy `.env.example` to `.env` and configure your OAuth credentials:

```bash
cp .env.example .env
```

#### GitHub OAuth Setup
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL to: `https://auth.expo.io/@your-username/your-app-slug`
4. Copy the Client ID to `EXPO_PUBLIC_GITHUB_CLIENT_ID`

#### GitLab OAuth Setup
1. Go to GitLab User Settings > Applications
2. Create a new application
3. Set Redirect URI to: `https://auth.expo.io/@your-username/your-app-slug`
4. Select scopes: `read_user`, `email`
5. Copy the Application ID to `EXPO_PUBLIC_GITLAB_CLIENT_ID`

#### Google OAuth Setup
1. Go to Google Cloud Console > APIs & Services > Credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `https://auth.expo.io/@your-username/your-app-slug`
4. Copy the Client ID to `EXPO_PUBLIC_GOOGLE_CLIENT_ID`

### 3. Update App Configuration

Update `app.json` with your project details:
- Change `bundleIdentifier` and `package` to your app's identifier
- Update the `scheme` if needed

### 4. Run the App

```bash
npm run dev
```

## OAuth Flow

The app uses Expo's AuthSession with PKCE for secure OAuth authentication:

1. User selects OAuth provider (GitHub, GitLab, or Google)
2. App opens provider's authorization page in secure browser
3. User authorizes the app
4. App receives authorization code
5. App exchanges code for access token using PKCE
6. App fetches user profile information
7. User is authenticated and can access the app

## Development

The app includes mock data for testing without connecting to your backend. Set `EXPO_PUBLIC_USE_MOCK=true` in your `.env` file to use mock mode.

## Deployment

For production deployment, you'll need to:

1. Configure your OAuth apps with production redirect URIs
2. Set up proper deep linking with custom URL schemes
3. Update the API endpoints to point to your production server
4. Build and deploy using EAS Build or Expo CLI

## Security Notes

- OAuth tokens are stored securely using Expo SecureStore
- PKCE is used for additional security in the OAuth flow
- All API communications should use HTTPS in production