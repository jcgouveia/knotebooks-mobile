import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Server, Palette, RotateCcw, Check } from 'lucide-react-native';
import { useSettings, Theme } from '@/contexts/SettingsContext';

export default function SettingsScreen() {
  const { serverUrl, theme, setServerUrl, setTheme, resetToDefaults } = useSettings();
  const [tempServerUrl, setTempServerUrl] = useState(serverUrl);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleServerUrlChange = (url: string) => {
    setTempServerUrl(url);
    setHasUnsavedChanges(url !== serverUrl);
  };

  const saveServerUrl = async () => {
    if (!tempServerUrl.trim()) {
      Alert.alert('Error', 'Server URL cannot be empty');
      return;
    }

    try {
      // Basic URL validation
      new URL(tempServerUrl);
      await setServerUrl(tempServerUrl);
      setHasUnsavedChanges(false);
      Alert.alert('Success', 'Server URL updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Please enter a valid URL');
    }
  };

  const handleThemeChange = async (newTheme: Theme) => {
    try {
      await setTheme(newTheme);
    } catch (error) {
      Alert.alert('Error', 'Failed to update theme');
    }
  };

  const handleResetToDefaults = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to their default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetToDefaults();
              setTempServerUrl(serverUrl);
              setHasUnsavedChanges(false);
              Alert.alert('Success', 'Settings reset to defaults');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset settings');
            }
          }
        }
      ]
    );
  };

  const themeOptions: { value: Theme; label: string; description: string }[] = [
    { value: 'automatic', label: 'Automatic', description: 'Follow system setting' },
    { value: 'light', label: 'Light', description: 'Always use light theme' },
    { value: 'dark', label: 'Dark', description: 'Always use dark theme' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Configure your app preferences</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Server Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Server size={20} color="#2563EB" />
            <Text style={styles.sectionTitle}>Server</Text>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Base URL</Text>
            <Text style={styles.settingDescription}>
              The base URL for your Knotebooks server
            </Text>
            <TextInput
              style={styles.textInput}
              value={tempServerUrl}
              onChangeText={handleServerUrlChange}
              placeholder="https://api.knotebooks.com"
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {hasUnsavedChanges && (
              <TouchableOpacity style={styles.saveButton} onPress={saveServerUrl}>
                <Check size={16} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Palette size={20} color="#2563EB" />
            <Text style={styles.sectionTitle}>Theme</Text>
          </View>
          
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.themeOption}
              onPress={() => handleThemeChange(option.value)}
            >
              <View style={styles.themeOptionContent}>
                <Text style={styles.themeOptionLabel}>{option.label}</Text>
                <Text style={styles.themeOptionDescription}>{option.description}</Text>
              </View>
              <View style={[
                styles.radioButton,
                theme === option.value && styles.radioButtonSelected
              ]}>
                {theme === option.value && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reset Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.resetButton} onPress={handleResetToDefaults}>
            <RotateCcw size={20} color="#EF4444" />
            <Text style={styles.resetButtonText}>Reset to Defaults</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>App Information</Text>
          <Text style={styles.infoText}>Version: 1.0.0</Text>
          <Text style={styles.infoText}>Build: Development</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  settingItem: {
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  themeOptionContent: {
    flex: 1,
  },
  themeOptionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  themeOptionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#2563EB',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  resetButtonText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
    marginLeft: 8,
  },
  infoSection: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
});