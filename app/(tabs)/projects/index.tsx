import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FolderOpen, Calendar, BookOpen, Inbox, NotebookIcon } from 'lucide-react-native';
import { Project } from '@/types/api';
import { apiService } from '@/services/apiService';
import { AppColors } from '@/types/constants';

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await apiService.getProjects();
      setProjects(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load projects');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderProject = ({ item }: { item: Project }) => {
    const notebookCount: number = item.notebooks?.length;

    return (
      <TouchableOpacity
        style={styles.projectCard}
        onPress={() => router.push(`/(tabs)/projects/${item.id}`)}
      >
        <View style={styles.projectHeader}>
          <View style={styles.projectIcon}>
            <Inbox size={24} color={AppColors.project} />
          </View>
          <View style={styles.projectInfo}>
            <Text style={styles.projectName}>{item.name}</Text>
            <Text style={styles.projectDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        </View>
        
        <View style={styles.projectFooter}>
          <View style={styles.projectMeta}>
            <NotebookIcon size={14} color="#6B7280" />
            <Text style={styles.metaText}>
              {notebookCount} notebook{notebookCount !== 1 ? 's' : ''}
            </Text>
          </View>
          { item.modifiedDate && (
            <View style={styles.projectMeta}>
              <Calendar size={14} color="#6B7280" />
              <Text style={styles.metaText}>
                Updated {formatDate(item.modifiedDate)}
              </Text>
            </View>
          )}
          </View>
      </TouchableOpacity>
    )
    };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Projects</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading projects...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Projects</Text>
        <Text style={styles.subtitle}>Select a project to browse its notebooks</Text>
      </View>

      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadProjects(true)}
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
  projectCard: {
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
  projectHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  projectIcon: {
    width: 48,
    height: 48,
    backgroundColor: AppColors.projectBackground,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
});