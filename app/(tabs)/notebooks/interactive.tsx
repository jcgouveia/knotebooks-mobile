import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { ArrowLeft, RefreshCw, Share as ShareIcon, Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { Platform } from 'react-native';
import { usePlatformAlert } from '@/hooks/usePlatformAlert';
import { Base64 } from '@/utils/utils';
import { apiService } from '@/services/apiService';

type Params = {
  notebookId: string;
  notebookName: string;
  projectId: string;
}

export default function InteractiveNotebookScreen() {
  const { notebookId, notebookName, projectId } = useLocalSearchParams<Params>();
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);
  const router = useRouter();
  const { alert, confirm } = usePlatformAlert();
  const url = buildExecutionUrl(notebookId, projectId);

  console.log("url", url);

  const handleRefresh = () => {
    webViewRef.current?.reload();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this interactive notebook: ${notebookName}`,
        url: url || '',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  function buildExecutionUrl(notebookId: string, projectId?: string) {
    const RUNNER_BASE_URL = process.env.EXPO_PUBLIC_RUNNER_URL; 
    let url = `${RUNNER_BASE_URL}?id=${encodeURIComponent(notebookId)}`;
    if (projectId)
      url = url + `&ownerId=${encodeURIComponent(projectId)}`;

    const user = apiService.getUser();
    const auth = user ? Base64.encode(user.username) : undefined;
    const host = process.env.EXPO_PUBLIC_API_URL;
    const layout = "mobile";

    if (auth)
      url = url + `&auth=${auth}`;
    if (host)
      url = url + `&host=${encodeURIComponent(host)}`;

    if (layout)
      url = url + `&layout=${layout}`;

      return url;
  }

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'copy':
          Clipboard.setStringAsync(data.content);
          alert('Copied', 'Content copied to clipboard');
          break;
          
        case 'download':
          alert('Download', `File ${data.filename} ready for download`);
          break;
          
        case 'share':
          Share.share({
            message: data.content,
            title: data.title || 'Notebook Content'
          });
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  const injectedJavaScript = `
    // Add mobile-friendly interactions
    (function() {
      // Add copy functionality to code cells
      document.addEventListener('DOMContentLoaded', function() {
        const codeCells = document.querySelectorAll('.code-cell, pre, code');
        codeCells.forEach(function(cell, index) {
          if (cell.tagName === 'PRE' || cell.tagName === 'CODE') {
            cell.addEventListener('contextmenu', function(e) {
              e.preventDefault();
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'copy',
                content: cell.textContent || cell.innerText
              }));
            });
          }
        });
        
        // Add long press for copy/share options
        let longPressTimer;
        document.addEventListener('touchstart', function(e) {
          longPressTimer = setTimeout(function() {
            const selection = window.getSelection();
            if (selection && selection.toString().length > 0) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'copy',
                content: selection.toString()
              }));
            }
          }, 800);
        });
        
        document.addEventListener('touchend', function(e) {
          clearTimeout(longPressTimer);
        });
        
        document.addEventListener('touchmove', function(e) {
          clearTimeout(longPressTimer);
        });
      });
    })();
    true;
  `;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={1}>{notebookName}</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleRefresh}
          >
            <RefreshCw size={20} color="#6B7280" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleShare}
          >
            <ShareIcon size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Loading interactive notebook...</Text>
        </View>
      )}



    {Platform.OS === 'web' ? (
      <iframe src={url} style={{ flex: 1 }} 
        onLoad={() => setIsLoading(false)}
      />
    ) : (
      <WebView
        ref={webViewRef}
        source={{ uri: url || 'about:blank' }}
        style={styles.webView}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onMessage={handleMessage}
        injectedJavaScript={injectedJavaScript}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        scalesPageToFit
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
        allowsBackForwardNavigationGestures
      />
      )}

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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});