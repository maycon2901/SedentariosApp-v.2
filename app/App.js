// App.js - Organização das telas e contexto global

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { Alert, View, StyleSheet, Text, Platform, TouchableOpacity } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';

// Importar telas
import ScreenHome from '../screens/screenHome';
import ScreenTimes from '../screens/screenTimes';

// Constantes para AsyncStorage
const SALVAR_CADASTROS = 'cadastros';
const SALVAR_TIME_A = 'timeA';
const SALVAR_TIME_B = 'timeB';
const SALVAR_PROXIMA = 'proxima';

// Funções de armazenamento
const loadJSON = async (key, fallback) => {
  try {
    const v = await AsyncStorage.getItem(key);
    if (v !== null) return JSON.parse(v);
  } catch (e) {
    console.warn(`Erro ao carregar ${key}`, e);
  }
  return fallback;
};

const saveJSON = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Erro ao salvar ${key}`, e);
  }
};

// Contexto global
const AppContext = createContext();
export const useApp = () => useContext(AppContext);

// Navegação por abas
const Tab = createBottomTabNavigator();

// Função fictícia para distribuir (você pode substituir pela real)
const distribuir = (lista) => {
  const metade = Math.ceil(lista.length / 2);
  return {
    timeA: lista.slice(0, metade),
    timeB: lista.slice(metade, lista.length),
    proxima: [],
  };
};

// Lista padrão de nomes para inicialização
const NOMES_PADRAO = [];

// Conteúdo principal (usa insets para tab bar responsiva)
function AppContent() {
  const insets = useSafeAreaInsets();
  const [cadastros, setCadastros] = useState([]);
  const [timeA, setTimeA] = useState([]);
  const [timeB, setTimeB] = useState([]);
  const [proxima, setProxima] = useState([]);

  useEffect(() => {
    (async () => {
      const loadedCad = await loadJSON(SALVAR_CADASTROS, []);
      const loadedA = await loadJSON(SALVAR_TIME_A, []);
      const loadedB = await loadJSON(SALVAR_TIME_B, []);
      const loadedP = await loadJSON(SALVAR_PROXIMA, []);

      // Se não houver cadastros salvos, inicializa com os nomes padrão
      if (loadedCad.length === 0) {
        const cadastrosIniciais = NOMES_PADRAO.map((nome, index) => ({
          id: `padrao-${Date.now()}-${index}`,
          nome,
          gols: '0',
          categoria: 'S',
        }));
        setCadastros(cadastrosIniciais);
        // Salva os cadastros iniciais
        await saveJSON(SALVAR_CADASTROS, cadastrosIniciais);
      } else {
        setCadastros(loadedCad);
      }

      setTimeA(loadedA);
      setTimeB(loadedB);
      setProxima(loadedP);
    })();
  }, []);

  useEffect(() => {
    saveJSON(SALVAR_CADASTROS, cadastros);
  }, [cadastros]);

  useEffect(() => {
    saveJSON(SALVAR_TIME_A, timeA);
  }, [timeA]);

  useEffect(() => {
    saveJSON(SALVAR_TIME_B, timeB);
  }, [timeB]);

  useEffect(() => {
    saveJSON(SALVAR_PROXIMA, proxima);
  }, [proxima]);

  const distribuirTimes = useCallback((lista) => {
    if (!lista || lista.length === 0) {
      Alert.alert('Sem nomes suficientes para distribuir');
      return;
    }
    const { timeA, timeB, proxima: novaProxima } = distribuir(lista);
    setTimeA(timeA);
    setTimeB(timeB);
    setProxima(novaProxima);
  }, []);

  const undoSnapshotRef = useRef(null);
  const [undoAvailable, setUndoAvailable] = useState(false);

  const saveForUndo = useCallback(() => {
    undoSnapshotRef.current = {
      cadastros: cadastros.map((c) => ({ ...c })),
      proxima: proxima.map((p) => ({ ...p })),
      timeA: timeA.map((t) => ({ ...t })),
      timeB: timeB.map((t) => ({ ...t })),
    };
    setUndoAvailable(true);
  }, [cadastros, proxima, timeA, timeB]);

  const undo = useCallback(() => {
    if (!undoSnapshotRef.current) return;
    const s = undoSnapshotRef.current;
    setCadastros(s.cadastros);
    setProxima(s.proxima);
    setTimeA(s.timeA);
    setTimeB(s.timeB);
    undoSnapshotRef.current = null;
    setUndoAvailable(false);
  }, []);

  const contextValue = {
    cadastros,
    setCadastros,
    timeA,
    setTimeA,
    timeB,
    setTimeB,
    proxima,
    setProxima,
    distribuirTimes,
    saveForUndo,
    undo,
    undoAvailable,
  };

  const tabBarStyle = {
    ...styles.tabBar,
    paddingTop: 0,
    paddingBottom: Platform.OS === 'android' ? 5 : 0,
    height: 22 + insets.bottom,
    minHeight: 22 + insets.bottom,
    overflow: 'visible',
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <AppContext.Provider value={contextValue}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerEmoji}>⚽</Text>
              <View>
                <Text style={styles.headerTitle} numberOfLines={1}>Sedentários</Text>
                <Text style={styles.headerSubtitle}>Developed by Maycon Santos</Text>
              </View>
            </View>
          </View>
          <NavigationContainer theme={navTheme}>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                headerShown: false,
                tabBarButton: (props) => <TouchableOpacity {...props} activeOpacity={1} />,
                tabBarIcon: ({ focused, color }) => {
                  const iconSize = 14;
                  const iconName =
                    route.name === 'Home'
                      ? (focused ? 'home' : 'home-outline')
                      : route.name === 'Times'
                        ? (focused ? 'people' : 'people-outline')
                        : 'ellipse-outline';
                  return <Ionicons name={iconName} size={iconSize} color={color} />;
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.onSurfaceVariantMuted,
                tabBarStyle: [tabBarStyle, styles.tabBarModern],
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarItemStyle: styles.tabBarItem,
                tabBarShowLabel: true,
              })}
              tabBar={(props) => (
                <SafeAreaView edges={['bottom']} style={styles.tabBarWrapper}>
                  <View>
                    <BottomTabBar {...props} />
                  </View>
                </SafeAreaView>
              )}
            >
              <Tab.Screen name="Home" component={ScreenHome} options={{ title: 'Início' }} />
              <Tab.Screen name="Times" component={ScreenTimes} options={{ title: 'Times' }} />
            </Tab.Navigator>
          </NavigationContainer>
        </View>
      </AppContext.Provider>
    </View>
  );
}

// App principal: carrega fonte dos ícones antes de exibir (fix ícones no APK release)
export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    primary: COLORS.primary,
    background: COLORS.surface,
    card: COLORS.surface,
    text: COLORS.onSurface,
    border: COLORS.outline,
    notification: COLORS.primary,
  },
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 6 : 8,
    paddingBottom: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outline,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  headerTitle: {
    ...TYPOGRAPHY.titleLarge,
    color: COLORS.onSurface,
    fontSize: 20,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.onSurfaceVariantMuted,
    marginTop: 1,
    fontSize: 11,
  },
  tabBar: {
    backgroundColor: COLORS.surfaceContainer,
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarWrapper: {
    backgroundColor: COLORS.surfaceContainer,
    borderTopWidth: 1,
    borderTopColor: COLORS.outline,
  },
  tabBarModern: {
    paddingTop: 0,
    overflow: 'visible',
  },
  tabBarLabel: {
    ...TYPOGRAPHY.labelMedium,
    fontSize: 8,
    marginTop: 0,
    paddingBottom: 0,
  },
  tabBarItem: {
    paddingVertical: 0,
    overflow: 'visible',
    justifyContent: 'center',
  },
});

