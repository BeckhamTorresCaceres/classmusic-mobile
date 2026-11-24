import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrackCard } from '../components/TrackCard';
import { ApiService } from '../services/api';
import type { Track } from '../types';

export const SearchScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Búsqueda inicial automática (canciones populares para explorar)
  useEffect(() => {
    handleSearch('musica exitos 2026');
  }, []);

  const handleSearch = async (term?: string) => {
    const searchText = (term !== undefined ? term : query).trim();
    if (!searchText) return;

    try {
      setLoading(true);
      setError(null);
      const results = await ApiService.searchTracks(searchText, 20);
      setTracks(results);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo completar la búsqueda',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Barra de Búsqueda */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#71717a" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Canción, artista o álbum..."
          placeholderTextColor="#71717a"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => handleSearch()}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color="#a1a1aa" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.searchBtn} onPress={() => handleSearch()}>
          <Text style={styles.searchBtnText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* Estados: Loading, Error o Lista */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Buscando música en la nube...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => handleSearch()}>
            <Text style={styles.retryBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : tracks.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="musical-notes-outline" size={48} color="#52525b" />
          <Text style={styles.emptyText}>Escribe qué canción o artista buscas</Text>
        </View>
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TrackCard track={item} queue={tracks} />}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: '#fff',
    fontSize: 15,
  },
  clearBtn: {
    padding: 6,
  },
  searchBtn: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 6,
  },
  searchBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 120, // espacio para el miniplayer y tabs
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  loadingText: {
    color: '#a1a1aa',
    fontSize: 14,
    marginTop: 12,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryBtn: {
    marginTop: 14,
    backgroundColor: '#27272a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    color: '#71717a',
    fontSize: 14,
    marginTop: 8,
  },
});
