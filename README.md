# 📱 ClassMusic Mobile (React Native / Expo)

Aplicación móvil nativa creada con **React Native** y **Expo (SDK 58)** para buscar, reproducir en streaming y descargar canciones en formato MP3 directamente en el almacenamiento interno de tu teléfono.

---

## 🚀 Conectado con la API en Render

La aplicación viene configurada por defecto para comunicarse directamente con tu API desplegada y segura en la nube:
- **URL Base:** `https://classmusic-api.onrender.com/api/v1`
- **Autenticación:** JWT con Refresh Token rotativo automático (30 días).
- **Protección:** Todos los endpoints de streaming y descarga requieren token válido.

---

## 📁 Arquitectura del Proyecto

```
classmusic-mobile/
├── App.tsx                     # Navegación por pestañas (Tabs), Auth Guard y MiniPlayer global
├── app.json                    # Configuración de Expo (nombre, íconos, permisos de audio y almacenamiento)
└── src/
    ├── types/
    │   └── index.ts            # Tipado de Track, DownloadedTrack, User y AuthTokens
    ├── services/
    │   ├── api.ts              # Cliente HTTP con interceptor automático para renovar token ante 401
    │   └── download.ts         # Descargas reanudables (expo-file-system) y compartir archivos (expo-sharing)
    ├── context/
    │   ├── AuthContext.tsx     # Manejo de sesión persistente con AsyncStorage
    │   └── PlayerContext.tsx   # Reproductor de audio nativo con expo-av (streaming y local)
    ├── components/
    │   ├── TrackCard.tsx       # Ficha de canción con portada, play, progreso de descarga % y compartir
    │   └── MiniPlayer.tsx      # Barra flotante de reproducción en vivo con barra de progreso
    └── screens/
        ├── AuthScreen.tsx      # Inicio de sesión con credenciales precargadas y selector de servidor
        ├── SearchScreen.tsx    # Buscador de canciones con debounce y resultados en vivo
        ├── DownloadsScreen.tsx # Administrador de canciones guardadas localmente y contador de MB
        └── SettingsScreen.tsx  # Estado de conexión en vivo con Render y cierre de sesión
```

---

## ⚡ Cómo Ejecutar la App en tu Celular

### 1. Requisitos Previos
1. Instala la app **Expo Go** en tu celular:
   - **Android:** Descárgala desde Google Play Store ([Expo Go en Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)).
   - **iOS:** Descárgala desde la App Store ([Expo Go en App Store](https://apps.apple.com/app/expo-go/id982107779)).
2. Tu computadora y tu celular deben estar conectados a la **misma red Wi-Fi** (o puedes usar modo túnel).

### 2. Iniciar el Servidor de Desarrollo
Abre una terminal en esta carpeta y ejecuta:
```bash
npx expo start
```
*(Si tu red Wi-Fi tiene aislamiento de clientes o estás en datos móviles, ejecuta `npx expo start --tunnel`)*.

### 3. Escanear el Código QR
- **En Android:** Abre la app **Expo Go** y toca **"Scan QR code"**, luego apunta la cámara al código QR que aparece en tu terminal.
- **En iPhone:** Abre la app de la **Cámara de iOS** nativa, apunta al código QR y toca el aviso amarillo que dice **"Abrir en Expo Go"**.

---

## 🔐 Inicio de Sesión Rápido

Al abrir la aplicación por primera vez, verás la pantalla de inicio de sesión:
- **Correo:** ``
- **Contraseña:** 

*(Ambos datos ya vienen preconfigurados para que solo tengas que presionar **"Iniciar Sesión"**)*.

Una vez iniciada la sesión:
1. El token se guarda de manera segura en tu teléfono.
2. Cada vez que abras la app, tu sesión se restaurará instantáneamente sin pedirte la clave de nuevo.
3. Si el token de acceso expira (dura 24 horas), la app utiliza el token de refresco en segundo plano sin interrumpir lo que estés escuchando o descargando.

---

## 🎧 Funcionalidades Clave

### 1. Explorar y Buscar Música
- Búsqueda instantánea en YouTube Music optimizada por el backend.
- Muestra carátula en alta resolución, título limpio, nombre del artista y duración exacta.

### 2. Reproductor Nativo de Audio
- Reproduce tanto streams en vivo desde Render como archivos MP3 descargados sin internet.
- Funciona en segundo plano con la pantalla bloqueada (`staysActiveInBackground: true`).
- Barra de progreso interactiva con tiempo actual y tiempo total.

### 3. Descargas Locales en tu Celular
- Al presionar el botón de descarga, el backend descarga el audio, lo convierte a MP3 a 192kbps, le incrusta las etiquetas ID3 (título, artista y portada) y lo envía a tu teléfono.
- La aplicación guarda el archivo en la memoria interna (`FileSystem.documentDirectory + 'music/'`).
- Puedes ver el porcentaje en tiempo real (0% a 100%).
- Una vez descargada, aparece el ícono verde de verificado: puedes reproducirla **sin consumir datos móviles ni necesitar internet**.
- **Compartir:** Botón para exportar el MP3 a WhatsApp, Telegram, Google Drive o tu gestor de archivos preferido.

---

## 📦 Compilar un APK Instalable para Android (Opcional)

Si deseas tener un archivo `.apk` instalable directamente en tu teléfono sin necesidad de Expo Go:
```bash
# 1. Instalar el CLI de EAS (Expo Application Services)
npm install -g eas-cli

# 2. Iniciar sesión en Expo
npx eas login

# 3. Configurar el proyecto para compilación en la nube
npx eas build:configure

# 4. Generar APK instalable
npx eas build -p android --profile preview
```
Al terminar la compilación en la nube de EAS, recibirás un enlace directo para descargar el archivo `.apk` en tu celular.
