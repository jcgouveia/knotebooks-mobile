import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Github, GitBranch } from 'lucide-react-native';
import { OAuthProvider } from '@/types/auth';

interface OAuthButtonProps {
  provider: OAuthProvider;
  onPress: (providerId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const providerIcons = {
  github: Github,
  gitlab: GitBranch,
  google: () => null // We'll use a text icon for Google
};

const providerStyles = {
  github: {
    backgroundColor: '#24292e',
    color: '#ffffff'
  },
  gitlab: {
    backgroundColor: '#FC6D26',
    color: '#ffffff'
  },
  google: {
    backgroundColor: '#4285f4',
    color: '#ffffff'
  }
};

export default function OAuthButton({ provider, onPress, isLoading, disabled }: OAuthButtonProps) {
  const IconComponent = providerIcons[provider.id];
  const style = providerStyles[provider.id];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: style.backgroundColor },
        disabled && styles.buttonDisabled
      ]}
      onPress={() => onPress(provider.id)}
      disabled={disabled || isLoading}
    >
      <View style={styles.buttonContent}>
        {isLoading ? (
          <ActivityIndicator color={style.color} size="small" />
        ) : (
          <>
            {IconComponent && <IconComponent size={20} color={style.color} />}
            {provider.id === 'google' && (
              <Text style={[styles.googleIcon, { color: style.color }]}>G</Text>
            )}
            <Text style={[styles.buttonText, { color: style.color }]}>
              Continue with {provider.name}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    width: 20,
    textAlign: 'center',
  },
});