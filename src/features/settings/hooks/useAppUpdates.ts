import { useState } from 'react';
import { Alert } from 'react-native';
import * as Updates from 'expo-updates';

export function useAppUpdates() {
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  const checkUpdates = async () => {
    try {
      setCheckingUpdate(true);
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        Alert.alert(
          '¡Actualización encontrada!',
          'Se descargará la nueva versión y se reiniciará la app.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Actualizar',
              onPress: async () => {
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
              },
            },
          ],
        );
      } else {
        Alert.alert('App al día', 'Ya tienes la última versión instalada.');
      }
    } catch {
      Alert.alert(
        'Modo desarrollo / Sin conexión',
        'Las actualizaciones automáticas funcionan en la versión instalada con conexión a internet.',
      );
    } finally {
      setCheckingUpdate(false);
    }
  };

  return { checkingUpdate, checkUpdates };
}
