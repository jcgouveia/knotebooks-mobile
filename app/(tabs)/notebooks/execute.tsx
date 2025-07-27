import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Play, Monitor, Download, Share, Copy } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { Notebook, NotebookExecution } from '@/types/api';
import { apiService } from '@/services/apiService';
import { mockNotebooks } from '@/services/mockData';

export default function ExecuteNotebookScreen() {
  const { notebookId } = useLocalSearchParams<{ notebookId: string }>();
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [execution, setExecution] = useState<NotebookExecution | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadNotebook();
  }, [notebookId]);

  const loadNotebook = async () => {
    try {
      const notebookData = mockNotebooks.find(nb => nb.id === notebookId);
      if (notebookData) {
        setNotebook(notebookData);
        // Initialize parameters with default values
        const initialParams: Record<string, any> = {};
        notebookData.parameters.forEach(param => {
          if (param.defaultValue !== undefined) {
            initialParams[param.name] = param.defaultValue;
          }
        });
        setParameters(initialParams);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load notebook');
    }
  };

  const handleParameterChange = (paramName: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const executeNotebook = async () => {
    if (!notebook) return;

    // Validate required parameters
    const missingParams = notebook.parameters
      .filter(param => param.required && !parameters[param.name])
      .map(param => param.name);

    if (missingParams.length > 0) {
      Alert.alert('Missing Parameters', `Please provide: ${missingParams.join(', ')}`);
      return;
    }

    setIsExecuting(true);
    try {
      const executionData = await apiService.executeNotebook(notebook.id, parameters);
      setExecution(executionData);
      pollExecution(executionData.id);
    } catch (error: any) {
      Alert.alert('Execution Failed', error.message || 'Failed to execute notebook');
      setIsExecuting(false);
    }
  };

  const pollExecution = async (executionId: string) => {
    const interval = setInterval(async () => {
      try {
        const executionData = await apiService.getExecution(executionId);
        setExecution(executionData);
        
        if (executionData.status === 'completed' || executionData.status === 'failed') {
          clearInterval(interval);
          setIsExecuting(false);
        }
      } catch (error) {
        clearInterval(interval);
        setIsExecuting(false);
      }
    }, 2000);
  };

  const openInteractiveMode = () => {
    if (!notebook) return;
    
    //let url = apiService.getInteractiveNotebookUrl(notebook.id, notebook.projectId);
    const url = "http://localhost:3091/runner/index.html?id=resource-test&ownerId=8e6c02f3-da14-4864-a13d-e8bd2ff09cd6&anonymous=true&auth=am9hby5nb3V2ZWlhQG1vcnBoaXMtdGVjaC5jb20%3D&host=http%253A%252F%252F127.0.0.1%253A9040%252Fnotebooks&theme="
    router.push({
      pathname: '/(tabs)/notebooks/interactive',
      params: { 
        notebookId: notebook.id,
        notebookName: notebook.name,
        url: url
      }
    });
  };

  const copyResult = async () => {
    if (execution?.result) {
      const resultText = JSON.stringify(execution.result.data, null, 2);
      await Clipboard.setStringAsync(resultText);
      Alert.alert('Copied', 'Result copied to clipboard');
    }
  };

  const shareResult = async () => {
    if (execution?.result) {
      const resultText = JSON.stringify(execution.result.data, null, 2);
      await Sharing.shareAsync('data:text/plain;base64,' + btoa(resultText), {
        dialogTitle: 'Share Execution Result',
        mimeType: 'text/plain'
      });
    }
  };

  const renderParameterInput = (param: any) => {
    switch (param.type) {
      case 'boolean':
        return (
          <View key={param.name} style={styles.parameterContainer}>
            <View style={styles.parameterHeader}>
              <Text style={styles.parameterLabel}>
                {param.name} {param.required && <Text style={styles.required}>*</Text>}
              </Text>
              <Switch
                value={parameters[param.name] || false}
                onValueChange={(value) => handleParameterChange(param.name, value)}
                trackColor={{ false: '#E5E7EB', true: '#2563EB' }}
                thumbColor="#FFFFFF"
              />
            </View>
            {param.description && (
              <Text style={styles.parameterDescription}>{param.description}</Text>
            )}
          </View>
        );

      case 'select':
        return (
          <View key={param.name} style={styles.parameterContainer}>
            <Text style={styles.parameterLabel}>
              {param.name} {param.required && <Text style={styles.required}>*</Text>}
            </Text>
            <View style={styles.selectContainer}>
              {param.options?.map((option: string) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.selectOption,
                    parameters[param.name] === option && styles.selectOptionActive
                  ]}
                  onPress={() => handleParameterChange(param.name, option)}
                >
                  <Text style={[
                    styles.selectOptionText,
                    parameters[param.name] === option && styles.selectOptionTextActive
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {param.description && (
              <Text style={styles.parameterDescription}>{param.description}</Text>
            )}
          </View>
        );

      default:
        return (
          <View key={param.name} style={styles.parameterContainer}>
            <Text style={styles.parameterLabel}>
              {param.name} {param.required && <Text style={styles.required}>*</Text>}
            </Text>
            <TextInput
              style={styles.parameterInput}
              value={parameters[param.name]?.toString() || ''}
              onChangeText={(value) => handleParameterChange(param.name, param.type === 'number' ? parseFloat(value) || 0 : value)}
              placeholder={`Enter ${param.name}...`}
              keyboardType={param.type === 'number' ? 'numeric' : 'default'}
            />
            {param.description && (
              <Text style={styles.parameterDescription}>{param.description}</Text>
            )}
          </View>
        );
    }
  };

  if (!notebook) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading notebook...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{notebook.name}</Text>
          <Text style={styles.subtitle}>{notebook.projectName}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>{notebook.description}</Text>

        {notebook.parameters.length > 0 && (
          <View style={styles.parametersSection}>
            <Text style={styles.sectionTitle}>Parameters</Text>
            {notebook.parameters.map(renderParameterInput)}
          </View>
        )}

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.executeButton, isExecuting && styles.executeButtonDisabled]}
            onPress={executeNotebook}
            disabled={isExecuting}
          >
            {isExecuting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Play size={20} color="#FFFFFF" />
                <Text style={styles.executeButtonText}>Execute Notebook</Text>
              </>
            )}
          </TouchableOpacity>

          {notebook.canRunInteractive && (
            <TouchableOpacity
              style={styles.interactiveButton}
              onPress={openInteractiveMode}
            >
              <Monitor size={20} color="#2563EB" />
              <Text style={styles.interactiveButtonText}>Interactive Mode</Text>
            </TouchableOpacity>
          )}
        </View>

        {execution && (
          <View style={styles.resultSection}>
            <Text style={styles.sectionTitle}>Execution Result</Text>
            <View style={styles.executionCard}>
              <View style={styles.executionHeader}>
                <Text style={styles.executionId}>ID: {execution.id}</Text>
                <View style={[
                  styles.statusBadge,
                  execution.status === 'completed' && styles.statusCompleted,
                  execution.status === 'failed' && styles.statusFailed,
                  execution.status === 'running' && styles.statusRunning
                ]}>
                  <Text style={styles.statusText}>{execution.status.toUpperCase()}</Text>
                </View>
              </View>

              {execution.result && (
                <View style={styles.resultContent}>
                  <View style={styles.resultActions}>
                    <TouchableOpacity style={styles.resultAction} onPress={copyResult}>
                      <Copy size={16} color="#6B7280" />
                      <Text style={styles.resultActionText}>Copy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.resultAction} onPress={shareResult}>
                      <Share size={16} color="#6B7280" />
                      <Text style={styles.resultActionText}>Share</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.resultData}>
                    {JSON.stringify(execution.result.data, null, 2)}
                  </Text>

                  {execution.result.files && execution.result.files.length > 0 && (
                    <View style={styles.filesSection}>
                      <Text style={styles.filesTitle}>Generated Files:</Text>
                      {execution.result.files.map((file) => (
                        <TouchableOpacity key={file.name} style={styles.fileItem}>
                          <Download size={16} color="#059669" />
                          <Text style={styles.fileName}>{file.name}</Text>
                          <Text style={styles.fileSize}>
                            {(file.size / 1024).toFixed(1)} KB
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        )}
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    marginTop: -4,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 32,
  },
  parametersSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  parameterContainer: {
    marginBottom: 20,
  },
  parameterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  parameterLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  parameterInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  parameterDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectOptionActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  selectOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectOptionTextActive: {
    color: '#FFFFFF',
  },
  actionsSection: {
    marginBottom: 32,
  },
  executeButton: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  executeButtonDisabled: {
    opacity: 0.6,
  },
  executeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  interactiveButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  interactiveButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultSection: {
    marginBottom: 32,
  },
  executionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  executionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  executionId: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  statusCompleted: {
    backgroundColor: '#ECFDF5',
  },
  statusFailed: {
    backgroundColor: '#FEF2F2',
  },
  statusRunning: {
    backgroundColor: '#EFF6FF',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  resultContent: {
    marginTop: 16,
  },
  resultActions: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  resultAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultActionText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  resultData: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#111827',
    marginBottom: 16,
  },
  filesSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  filesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    marginLeft: 8,
  },
  fileSize: {
    fontSize: 12,
    color: '#6B7280',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
});