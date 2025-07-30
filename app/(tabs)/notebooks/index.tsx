import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Calendar, Play, Search, Filter, NotebookIcon } from 'lucide-react-native';
import { Notebook } from '@/types/api';
import { apiService } from '@/services/apiService';
import { AppColors } from '@/types/constants';

export default function NotebooksScreen() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [filteredNotebooks, setFilteredNotebooks] = useState<Notebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadNotebooks();
  }, []);

  useEffect(() => {
    filterNotebooks();
  }, [notebooks, searchQuery]);

  const loadNotebooks = async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await apiService.getNotebooks();
      setNotebooks(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load notebooks');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const filterNotebooks = () => {
    if (!searchQuery.trim()) {
      setFilteredNotebooks(notebooks);
      return;
    }

    const filtered = notebooks.filter(notebook =>
      notebook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notebook.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notebook.projectName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredNotebooks(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderNotebook = ({ item }: { item: Notebook }) => (
    <TouchableOpacity
      style={styles.notebookCard}
      onPress={() => router.push({
        pathname: '/(tabs)/notebooks/execute',
        params: { notebookId: item.id }
      })}
    >
      <View style={styles.notebookHeader}>
        <View style={styles.notebookIcon}>
          <NotebookIcon size={20} color={AppColors.notebook} />
        </View>
        <View style={styles.notebookInfo}>
          <Text style={styles.notebookName}>{item.name}</Text>
          <Text style={styles.projectName}>{item.projectName}</Text>
          <Text style={styles.notebookDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <TouchableOpacity style={styles.executeButton}>
          <Play size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.notebookFooter}>
        { item.modifiedDate && (
          <View style={styles.notebookMeta}>
            <Calendar size={14} color="#6B7280" />
              <Text style={styles.metaText}>
                Updated {formatDate(item.modifiedDate)}
              </Text>
          </View>
        )}

        <View style={styles.interactiveBadge}>
          <Text style={styles.interactiveBadgeText}>Interactive</Text>
        </View>

      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>All Notebooks</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading notebooks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Notebooks</Text>
        <Text style={styles.subtitle}>Execute any notebook from any project</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notebooks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredNotebooks}
        renderItem={renderNotebook}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadNotebooks(true)}
            tintColor="#2563EB"
          />
        }
        showsVerticalScrollIndicator={false}
      />
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
    paddingBottom: 16,
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
  searchContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#111827',
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
  list: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  notebookCard: {
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
  notebookHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  notebookIcon: {
    width: 40,
    height: 40,
    backgroundColor: AppColors.notebookBackground,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notebookInfo: {
    flex: 1,
  },
  notebookName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  projectName: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
    marginBottom: 4,
  },
  notebookDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  executeButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notebookFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notebookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  interactiveBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  interactiveBadgeText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
  },
});