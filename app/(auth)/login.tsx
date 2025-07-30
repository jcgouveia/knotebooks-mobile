import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, BookOpen, NotebookIcon } from 'lucide-react-native';
import OAuthButton from '@/components/OAuthButton';
import { OAuthProvider } from '@/types/auth';
import logoImage from '@/assets/images/k.notebooks-dark.svg';
import logoCompany from '@/assets/images/logo-dark.png';

const oauthProviders: OAuthProvider[] = [
  { id: 'github', name: 'GitHub', icon: 'github', color: '#24292e' },
  { id: 'gitlab', name: 'GitLab', icon: 'gitlab', color: '#FC6D26' },
  { id: 'google', name: 'Google', icon: 'google', color: '#4285f4' }
];

export default function LoginScreen() {
  const [email, setEmail] = useState('demo@knotebooks.com');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const { login, loginWithOAuth } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (providerId: string) => {
    setOauthLoading(providerId);
    try {
      await loginWithOAuth(providerId);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('OAuth Login Failed', error.message || 'Authentication failed');
    } finally {
      setOauthLoading(null);
    }
  };
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={logoImage} 
              style={{ width: 270, height: 60 }}
            />
          </View>
          <Text style={styles.subtitle}>Execute notebooks on the go</Text>
          <View style={styles.logoContainer}>
            <Text style={styles.subtitle2}>by</Text>
            <Image
              source={logoCompany} 
              style={{ width: 150, height: 30 }}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Sign in</Text>

        <View style={styles.inputContainer}>
          <Mail size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Lock size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.form}>
          <View style={styles.oauthSection}>
            <Text style={styles.sectionTitle}>Sign in with your account</Text>
            {oauthProviders.map((provider) => (
              <OAuthButton
                key={provider.id}
                provider={provider}
                onPress={handleOAuthLogin}
                isLoading={oauthLoading === provider.id}
                disabled={isLoading || oauthLoading !== null}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#6B7280',
    textAlign: 'center',
  },
  subtitle2: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 5,
  },
  form: {
    marginBottom: 32,
  },
  oauthSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 14,
    color: '#6B7280',
    paddingHorizontal: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 5,
    color: '#111827',
  },
  loginButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  demoInfo: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  demoText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
  },
});