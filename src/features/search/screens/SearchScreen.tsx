import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StateMessage, TrackCard } from '@/shared/components';
import { colors, layout, radius, spacing, typography } from '@/theme';
import { useTrackSearch } from '../hooks/useTrackSearch';

export const SearchScreen: React.FC = () => {
  const { query, setQuery, tracks, loading, error, handleSearch } =
    useTrackSearch();

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons
          name="search"
          size={20}
          color={colors.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Canción, artista o álbum..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => handleSearch()}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
            <Ionicons
              name="close-circle"
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => handleSearch()}
        >
          <Text style={styles.searchBtnText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <StateMessage variant="loading" message="Buscando música en la nube..." />
      ) : error ? (
        <StateMessage
          variant="error"
          message={error}
          actionLabel="Reintentar"
          onAction={() => handleSearch()}
        />
      ) : tracks.length === 0 ? (
        <StateMessage
          variant="empty"
          message="Escribe qué canción o artista buscas"
        />
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
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: {
    flex: 1,
    height: 48,
    color: colors.textPrimary,
    fontSize: typography.size.xl,
  },
  clearBtn: { padding: 6 },
  searchBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginLeft: 6,
  },
  searchBtnText: {
    color: colors.primaryForegroundDark,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
  listContent: { paddingBottom: layout.listBottomPadding },
});
