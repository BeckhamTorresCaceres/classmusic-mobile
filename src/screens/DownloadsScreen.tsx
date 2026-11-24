import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrackCard } from '../components/TrackCard';
import { DownloadService } from '../services/download';
import type { DownloadedTrack } from '../types';

export const DownloadsScreen: React.FC = () => {
  const [downloadedTracks, setDownloadedTracks] = useState<DownloadedTrack[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDownloads = useCallback(async () => {
    try {
      const tracks = await DownloadService.getDownloadedTracks();
      setDownloadedTracks(tracks);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDownloads();
  }, [loadDownloads]);

  const totalSizeMB = downloadedTracks.reduce((acc, t) => acc + (t.fileSize || 0), 0) / (1024 * 1024);

  return (
    <View style={styles.container}>
      {/* Encabezado con información del almacenamiento */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headingTitle}>Descargas Locales</Text>
          <Text style={styles.headingSubtitle}>
            {downloadedTracks.length} {downloadedTracks.length === 1 ? 'canción' : 'canciones'} · {totalSizeMB.toFixed(1)} MB guardados
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadDownloads}>
          <Ionicons name="reload" size={18} color="#a1a1aa" />
        </TouchableOpacity>
      </View>

      {downloadedTracks.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="cloud-download-outline" size={54} color="#3f3f46" />
          <Text style={styles.emptyTitle}>Aún no has descargado música</Text>
          <Text style={styles.emptySubtitle}>
            Ve al buscador y toca el botón de descarga en cualquier canción para guardarla en tu celular y escucharla sin conexión.
          </Text>
        </View>
      ) : (
        <FlatList
          data={downloadedTracks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TrackCard
              track={item}
              queue={downloadedTracks}
              isDownloaded={true}
              onDeleted={loadDownloads}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#18181b',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  headingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  headingSubtitle: {
    fontSize: 13,
    color: '#22c55e',
    marginTop: 2,
    fontWeight: '500',
  },
  refreshBtn: {
    padding: 8,
  },
  listContent: {
    paddingBottom: 120,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#d4d4d8',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
});
