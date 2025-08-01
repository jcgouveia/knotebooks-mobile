import * as Network from 'expo-network';
import { Platform, PlatformAndroidStatic } from 'react-native';
import { usePlatformAlert } from '@/hooks/usePlatformAlert';

const { alert, message } = usePlatformAlert();

export const checkAllStataus = async () => {
    checkNetworkStatus();
    testApiConnection();
    testDnsResolution();
    runFullDiagnostics();
    showPlatformInfo();
}

export const checkNetworkStatus = async () => {
  const networkState = await Network.getNetworkStateAsync();
  message(`Network Status:
    - Connected: ${networkState.isConnected}
    - Type: ${networkState.type}
    - Is Internet Reachable: ${networkState.isInternetReachable}`);
};

export const testApiConnection = async () => {
    try {
      const testUrl = 'https://ai.morphis-tech.com/api/project'; // or your API endpoint
      const response = await fetch(testUrl, { method: 'GET' });
      
      message(`API Test:
        - URL: ${testUrl}
        - Status: ${response.status}
        - OK: ${response.ok}`);

    } catch (error: any) {
        message(`API Test Failed:
        - Error: ${error.message}
        - Stack: ${error.stack}`);
    }
  };


  export const testDnsResolution = async () => {
    try {
      // Test DNS by resolving a known domain
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      
      message(`DNS Resolution:
        - Public IP: ${data.ip}
        - Successfully resolved external domain`);

    } catch (error: any) {
        message(`DNS Resolution Failed:
        - Error: ${error.message}`);
    }
  };


export const runFullDiagnostics = async () => {
  try {
    const networkState = await Network.getNetworkStateAsync();
    const ipAddress = await Network.getIpAddressAsync();
    
    // Test API connection
    const apiTest = await fetch('https://jsonplaceholder.typicode.com/posts/1');
    
    message(`Full Network Diagnostics:
      - Connected: ${networkState.isConnected}
      - Type: ${networkState.type}
      - IP: ${ipAddress}
      - API Test: ${apiTest.ok ? 'Success' : 'Failed'}
      - Internet Reachable: ${networkState.isInternetReachable}`);
  } 
  catch (error:any) {
    message(`Diagnostics Failed:
      - Error: ${error.message}`);
  }
};

export const showPlatformInfo = () => {
    if (Platform.OS === 'web') {
        message(`Platform Info:
        - OS: ${Platform.OS}
        - Version: ${Platform.Version}`
        );
    }
    if (Platform.OS === 'android') {
        const p = Platform as PlatformAndroidStatic;
        message(`Platform Info:
        - OS: ${Platform.OS}
        - Version: ${p.Version}
        - Model: ${p.constants.Model}
        - Brand: ${p.constants.Brand}`
        );
    }
  };