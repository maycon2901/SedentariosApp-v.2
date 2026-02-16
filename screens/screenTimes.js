import React, { useState } from 'react';
import { distribuir } from '../utils/distribuir';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Animated,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useApp } from '../app/App';
import { COLORS, RADIUS, SPACING, ELEVATION, TYPOGRAPHY } from '../utils/theme';

export default function ScreenTimes() {
  const {
    timeA,
    setTimeA,
    timeB,
    setTimeB,
    proxima,
    setProxima,
    setCadastros,
    cadastros,
    distribuirTimes,
    saveForUndo,
    undo,
    undoAvailable,
  } = useApp();

  const [loadingDistribuir10, setLoadingDistribuir10] = useState(false);

  const substituirJogador = (item, origem, setOrigem) => {
    const atualProxima = [...proxima];
    if (atualProxima.length === 0) return;

    saveForUndo();
    const novoOrigem = origem.filter((j) => j.id !== item.id);
    const primeiroDaProxima = atualProxima.shift();

    setOrigem([...novoOrigem, primeiroDaProxima]);
    setProxima([...atualProxima, item]);
  };

  const incrementarGols = (item, origem, setOrigem) => {
    const novoCadastros = cadastros.map((c) =>
      c.id === item.id ? { ...c, gols: (parseInt(c.gols) || 0) + 1 } : c
    );
    setCadastros(novoCadastros);

    setOrigem((prev) =>
      prev.map((c) =>
        c.id === item.id ? { ...c, gols: (parseInt(c.gols) || 0) + 1 } : c
      )
    );
  };

  const decrementarGols = (item, origem, setOrigem) => {
  const novoCadastros = cadastros.map((c) =>
    c.id === item.id
      ? { ...c, gols: Math.max((parseInt(c.gols) || 0) - 1, 0) } // não deixa negativo
      : c
  );
  setCadastros(novoCadastros);

  setOrigem((prev) =>
    prev.map((c) =>
      c.id === item.id
        ? { ...c, gols: Math.max((parseInt(c.gols) || 0) - 1, 0) }
        : c
    )
  );
};

  const renderItemLista = (item, origem, setOrigem, estiloTime) => {
    const scale = new Animated.Value(1);
    const pulse = () => {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.08, duration: 80, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
      ]).start(() => incrementarGols(item, origem, setOrigem));
    };

    return (
      <TouchableOpacity
        style={[styles.listaRow, estiloTime]}
        onPress={pulse}
        onLongPress={() => decrementarGols(item, origem, setOrigem)}
        activeOpacity={1}
      >
        <Animated.View style={[styles.listaRowInner, { transform: [{ scale }] }]}>
          <Text style={styles.listaRowNome} numberOfLines={1}>
            {item.nome}  ·  ⚽ {item.gols || 0}
          </Text>
          <TouchableOpacity
            style={styles.listaRowSub}
            onPress={() => substituirJogador(item, origem, setOrigem)}
          >
            <Text style={styles.listaRowSubText}>🔄</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderListaTime = (jogadores, origem, setOrigem, nomeTime, setTime, estiloTime) => (
    <View style={styles.secaoTime}>
      <View style={styles.secaoTimeHeader}>
        <Text style={styles.secaoTimeTitulo}>{nomeTime}</Text>
        <TouchableOpacity
          style={[styles.secaoTimePerdeuBtn, loadingDistribuir10 && styles.buttonDisabled]}
          onPress={() => timePerdeu(origem, setTime, nomeTime)}
          disabled={loadingDistribuir10}
        >
          <Text style={styles.secaoTimePerdeuText}>❌ Perdeu</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.secaoTimeLista}>
        {jogadores.length === 0 ? (
          <Text style={styles.secaoTimeVazio}>Nenhum jogador</Text>
        ) : (
          jogadores.slice(0, 5).map((item) => (
            <View key={item.id}>
              {renderItemLista(item, origem, setOrigem, estiloTime)}
            </View>
          ))
        )}
      </View>
    </View>
  );

  const distribuir10DaProxima = () => {
    if (timeA.length === 5 && timeB.length === 5) {
      Alert.alert(
        'Times já estão cheios',
        'Os times A e B já possuem 5 jogadores cada. Deseja continuar e substituir os times?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            onPress: () => executarDistribuicao10(),
          },
        ]
      );
    } else {
      executarDistribuicao10();
    }
  };

  const executarDistribuicao10 = () => {
    if (proxima.length === 0) {
      Alert.alert('Tabela Próxima está vazia.');
      return;
    }

    saveForUndo();
    setLoadingDistribuir10(true);

    setTimeout(() => {
      // Pega os 10 primeiros da lista proxima
      const primeiros10 = proxima.slice(0, 10);

      // Extrai os IDs dos bloqueados (bloqueado === true)
      const bloqueadosIds = primeiros10.filter(p => p.bloqueado).map(p => p.id);

      // Distribui passando também os bloqueados para manter no proxima
      const { timeA: novoA, timeB: novoB, proxima: novaProxima } = distribuir(primeiros10, bloqueadosIds);

      setTimeA(novoA);
      setTimeB(novoB);

      // Restante da lista proxima (após os 10 primeiros)
      const restanteProxima = proxima.slice(10);

      // Junta o restante da lista + novaProxima que já tem os bloqueados + não usados
      setProxima([...novaProxima, ...restanteProxima]);

      setLoadingDistribuir10(false);
      Alert.alert('concluída com sucesso!');
    }, 1000);
  };

  const timePerdeu = (time, setTime, nomeTime) => {
    if (time.length < 5) {
      Alert.alert(`${nomeTime} possui menos de 5 jogadores.`);
      return;
    }

    Alert.alert(
      `${nomeTime} perdeu`,
      `Confirma que o ${nomeTime} perdeu?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            saveForUndo();
            setLoadingDistribuir10(true);

            setTimeout(() => {
              const removidos = time.slice(0, 5);
              const novaProximaTemp = [...proxima, ...removidos];

              if (novaProximaTemp.length < 5) {
                setLoadingDistribuir10(false);
                Alert.alert('Erro', 'Mesmo após mover, a tabela Próxima ainda não tem jogadores suficientes para reposição.');
                return;
              }

              const novosDaProxima = novaProximaTemp.slice(0, 5);
              const restanteProxima = novaProximaTemp.slice(5);

              setProxima(restanteProxima);
              setTime(novosDaProxima);

              setLoadingDistribuir10(false);
              Alert.alert(`Reposição concluída para ${nomeTime}`);
            }, 1000);
          },
        },
      ]
    );
  };

  // Função Mesclar Time - alterna jogadores entre A e B
  const mesclarTimes = () => {
  Alert.alert(
    'Misturar Times',
    'Confirma?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: () => {
          saveForUndo();
          const jogadores = [...timeA.slice(0, 5), ...timeB.slice(0, 5)];
          const novoTimeA = [];
          const novoTimeB = [];

          jogadores.forEach((jogador, i) => {
            if (i % 2 === 0) {
              novoTimeA.push(jogador);
            } else {
              novoTimeB.push(jogador);
            }
          });

          setTimeA(novoTimeA);
          setTimeB(novoTimeB);
        },
      },
    ]
  );
};

  return (
    <View style={styles.container}>
      {/* Barra superior: Distribuir, Mesclar, Desfazer */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[
            styles.topBarButton,
            styles.topBarButtonThird,
            styles.topBarButtonDistribuir,
            ((timeA.length === 5 && timeB.length === 5) || loadingDistribuir10) && styles.buttonDisabled,
          ]}
          onPress={distribuir10DaProxima}
          disabled={(timeA.length === 5 && timeB.length === 5) || loadingDistribuir10}
        >
          {loadingDistribuir10 ? (
            <ActivityIndicator size="small" color={COLORS.onSurface} />
          ) : (
            <>
              <Text style={styles.topBarIcon}>👥</Text>
              <Text style={styles.topBarLabel}>Distribuir</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.topBarButton, styles.topBarButtonThird, styles.topBarButtonMesclar, loadingDistribuir10 && styles.buttonDisabled]}
          onPress={mesclarTimes}
          disabled={loadingDistribuir10}
        >
          <Text style={styles.topBarIcon}>🔀</Text>
          <Text style={styles.topBarLabel}>Mesclar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.topBarButton,
            styles.topBarButtonThird,
            styles.topBarButtonDesfazer,
            !undoAvailable && styles.buttonDisabled,
          ]}
          onPress={() => {
            if (!undoAvailable) return;
            Alert.alert('Desfazer', 'Reverter a última alteração?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Desfazer', onPress: undo },
            ]);
          }}
          disabled={!undoAvailable}
        >
          <Text style={styles.topBarIcon}>↩️</Text>
          <Text style={styles.topBarLabel}>Desfazer</Text>
        </TouchableOpacity>
      </View>

      {/* Lista Time A e Time B */}
      <ScrollView
        style={styles.areaLista}
        contentContainerStyle={styles.areaListaContent}
        showsVerticalScrollIndicator={false}
      >
        {renderListaTime(timeA, timeA, setTimeA, 'Time A', setTimeA, styles.listaTimeA)}
        {renderListaTime(timeB, timeB, setTimeB, 'Time B', setTimeB, styles.listaTimeB)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    flexDirection: 'column',
  },
  areaLista: {
    flex: 1,
  },
  areaListaContent: {
    padding: SPACING.sm,
    paddingBottom: SPACING.xs,
    flexGrow: 1,
  },
  secaoTime: {
    flex: 1,
    marginBottom: SPACING.md,
    minHeight: 0,
  },
  secaoTimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },
  secaoTimeTitulo: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  secaoTimePerdeuBtn: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: COLORS.outline,
  },
  secaoTimePerdeuText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.onSurface,
  },
  secaoTimeLista: {
    flex: 1,
    gap: SPACING.xs,
    justifyContent: 'space-evenly',
  },
  secaoTimeVazio: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.onSurfaceVariantMuted,
    padding: SPACING.sm,
    textAlign: 'center',
  },
  listaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    ...ELEVATION.level1,
    minHeight: 40,
  },
  listaRowInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listaRowNome: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.onSurface,
    flex: 1,
  },
  listaRowSub: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  listaRowSubText: { fontSize: 18, color: COLORS.onSurfaceVariant },
  listaTimeA: { backgroundColor: COLORS.surfaceContainer },
  listaTimeB: { backgroundColor: COLORS.primaryContainer },
  topBar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outline,
    backgroundColor: COLORS.surfaceContainer,
  },
  topBarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.outline,
    backgroundColor: COLORS.surface,
  },
  topBarButtonThird: {
    flex: 1,
  },
  topBarButtonDistribuir: {
    backgroundColor: COLORS.primary,
  },
  topBarButtonMesclar: {
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  topBarButtonDesfazer: {
    backgroundColor: COLORS.surfaceContainerHighest,
    borderColor: COLORS.outline,
  },
  topBarIcon: { fontSize: 18, color: COLORS.onSurface },
  topBarLabel: { ...TYPOGRAPHY.labelMedium, color: COLORS.onSurface },
  menuPanel: {
    backgroundColor: COLORS.surfaceContainer,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outline,
    maxHeight: 320,
  },
  menuPanelScroll: {
    padding: SPACING.md,
  },
  menuSection: {
    marginBottom: SPACING.md,
  },
  menuSectionTitle: {
    ...TYPOGRAPHY.titleSmall,
    color: COLORS.onSurface,
    marginBottom: SPACING.sm,
  },
  sidebarItem: {
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  sidebarItemText: { ...TYPOGRAPHY.bodyMedium, color: COLORS.onSurface, fontWeight: '500' },
  sidebarItemGols: { ...TYPOGRAPHY.bodySmall, color: COLORS.primary, marginTop: 4 },
  sidebarEmptyText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.onSurfaceVariantMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  sidebarButtons: { gap: 10, padding: SPACING.md },
  sidebarActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  buttonMesclar: { backgroundColor: COLORS.surfaceContainerHigh },
  buttonDistribuir: { backgroundColor: COLORS.primary },
  buttonLimpar: { backgroundColor: COLORS.error },
  buttonLoading: { backgroundColor: COLORS.surfaceContainerHigh, padding: 15 },
  sidebarButtonText: { ...TYPOGRAPHY.labelLarge, color: COLORS.onSurface },
  sidebarActionIcon: { fontSize: 18, color: COLORS.onSurface },
  sidebarActionIconDisabled: { color: COLORS.onSurfaceVariantMuted },
  buttonDisabled: { backgroundColor: COLORS.surfaceContainerHigh, opacity: 0.7 },
  buttonTextDisabled: { color: COLORS.onSurfaceVariantMuted },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    gap: 8,
    backgroundColor: COLORS.primaryContainer,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  loadingText: { ...TYPOGRAPHY.bodyMedium, color: COLORS.primary },
});

