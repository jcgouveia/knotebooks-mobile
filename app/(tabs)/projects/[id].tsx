import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, BookOpen, Calendar, Play } from 'lucide-react-native';
import { Project, Notebook } from '@/types/api';
import { apiService } from '@/services/apiService';
import { mockProjects } from '@/services/mockData';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const loadProjectData = async () => {
    try {
      // Get project info
      const projectData = mockProjects.find(p => p.id === id);
      if (projectData) {
        setProject(projectData);
      }

      // Get project notebooks
      const notebooksData = await apiService.getNotebooks(id);
      setNotebooks(notebooksData);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load project data');
    } finally {
      setIsLoading(false);
    }
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
          <BookOpen size={20} color="#059669" />
        </View>
        <View style={styles.notebookInfo}>
          <Text style={styles.notebookName}>{item.name}</Text>
          <Text style={styles.notebookDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <TouchableOpacity style={styles.executeButton}>
          <Play size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.notebookFooter}>
        <View style={styles.notebookMeta}>
          <Calendar size={14} color="#6B7280" />
          <Text style={styles.metaText}>
            Updated {formatDate(item.updatedAt)}
          </Text>
        </View>
        {item.canRunInteractive && (
          <View style={styles.interactiveBadge}>
            <Text style={styles.interactiveBadgeText}>Interactive</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading project...</Text>
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
          <Text style={styles.title}>{project?.name}</Text>
          <Text style={styles.subtitle}>{project?.description}</Text>
        </View>
      </View>

      <FlatList
        data={notebooks}
        renderItem={renderNotebook}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
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
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
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
    backgroundColor: '#ECFDF5',
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