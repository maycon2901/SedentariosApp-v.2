import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  StyleSheet,
  Alert,
  ImageBackground,
  Pressable,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useApp } from '../app/App';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING, ELEVATION, TYPOGRAPHY } from '../utils/theme';

const TAB_BAR_HEIGHT = 36;

export default function ScreenHome() {
  const insets = useSafeAreaInsets();
  const { cadastros, setCadastros, proxima, setProxima, timeA, timeB, setTimeA, setTimeB } = useApp();
  const [cadastrosOrdenados, setCadastrosOrdenados] = useState([]);
  const [categoria, setCategoria] = useState('S');
  const [editandoId, setEditandoId] = useState(null);
  const [nomesNoModal, setNomesNoModal] = useState(['']);
  const [ativosIds, setAtivosIds] = useState([]);
  const [pagos, setPagos] = useState({});
  const [bloqueadosIds, setBloqueadosIds] = useState(new Set());
  const [modalCadastroVisible, setModalCadastroVisible] = useState(false);
  const [listaCadastrosVisivel, setListaCadastrosVisivel] = useState(true);
  const [textoListaColada, setTextoListaColada] = useState('');
  const [menuFabVisible, setMenuFabVisible] = useState(false);
  const [modalCadastroModo, setModalCadastroModo] = useState('umAum');

  useEffect(() => {
    const ativos = proxima.map((item) => item.id);
    setAtivosIds(ativos);
  }, [proxima]);

  useEffect(() => {
    const ordenados = [...cadastros].sort((a, b) => Number(b.gols) - Number(a.gols));
    setCadastrosOrdenados(ordenados);
  }, [cadastros]);

  const adicionarCadastros = (listaNomes) => {
    const nomesValidos = listaNomes.map((n) => n.trim()).filter(Boolean);
    if (nomesValidos.length === 0) {
      Alert.alert('Preencha pelo menos um nome');
      return false;
    }
    const novos = nomesValidos.map((nomeItem) => ({
      id: Date.now().toString() + Math.random(),
      nome: nomeItem,
      gols: '0',
      categoria: 'S',
    }));
    setCadastros((prev) => [...prev, ...novos]);
    return true;
  };

  const atualizarCadastro = (nomeAtualizado) => {
    if (!editandoId || !nomeAtualizado.trim()) {
      Alert.alert('Preencha o nome');
      return false;
    }
    const atualizados = cadastros.map((item) =>
      item.id === editandoId ? { ...item, nome: nomeAtualizado.trim() } : item
    );
    setCadastros(atualizados);
    if (ativosIds.includes(editandoId)) {
      setProxima((prev) =>
        prev.map((item) =>
          item.id === editandoId ? { ...item, nome: nomeAtualizado.trim() } : item
        )
      );
    }
    setEditandoId(null);
    return true;
  };

  const abrirModalLista = () => {
    setMenuFabVisible(false);
    setEditandoId(null);
    setTextoListaColada('');
    setModalCadastroModo('lista');
    setModalCadastroVisible(true);
  };

  const abrirModalUmAum = () => {
    setMenuFabVisible(false);
    setEditandoId(null);
    setNomesNoModal(['']);
    setModalCadastroModo('umAum');
    setModalCadastroVisible(true);
  };

  const zerarListas = () => {
    setMenuFabVisible(false);
    Alert.alert(
      'Zerar listas',
      'Remover todos os nomes das listas Cadastros e Próxima?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Zerar',
          style: 'destructive',
          onPress: () => {
            setCadastros([]);
            setProxima([]);
            setBloqueadosIds(new Set());
            Alert.alert('Pronto', 'Listas zeradas.');
          },
        },
      ]
    );
  };

  const zerarGols = () => {
    setMenuFabVisible(false);
    Alert.alert(
      'Zerar gols',
      'Colocar 0 gols para todos os jogadores (Cadastros e Próxima)?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Zerar',
          onPress: () => {
            setCadastros((prev) => prev.map((c) => ({ ...c, gols: '0' })));
            setProxima((prev) => prev.map((p) => ({ ...p, gols: '0' })));
            Alert.alert('Pronto', 'Gols zerados.');
          },
        },
      ]
    );
  };

  const limparNomeParaLista = (texto) => {
    return texto
      .replace(/\d/g, '')
      .replace(/[^\p{L}\s]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const adicionarDaListaColada = () => {
    const separadores = /[\n,;]+/;
    const nomes = textoListaColada
      .split(separadores)
      .map((n) => limparNomeParaLista(n))
      .filter(Boolean);
    if (nomes.length === 0) {
      Alert.alert('Cole uma lista de nomes', 'Um nome por linha ou separados por vírgula/ponto e vírgula.');
      return;
    }
    adicionarCadastros(nomes);
    setTextoListaColada('');
    Alert.alert('Pronto', `${nomes.length} jogador(es) adicionado(s).`);
  };

  const adicionarMaisUmCampo = () => {
    setNomesNoModal((prev) => [...prev, '']);
  };

  const salvarModal = () => {
    if (editandoId) {
      if (atualizarCadastro(nomesNoModal[0])) setModalCadastroVisible(false);
    } else {
      if (adicionarCadastros(nomesNoModal)) {
        setNomesNoModal(['']);
        setModalCadastroVisible(false);
      }
    }
  };

  const atualizarNomeNoModal = (index, valor) => {
    setNomesNoModal((prev) => {
      const next = [...prev];
      next[index] = valor;
      return next;
    });
  };

  const iniciarEdicao = (item) => {
    setEditandoId(item.id);
    setNomesNoModal([item.nome]);
    setModalCadastroModo('umAum');
    setModalCadastroVisible(true);
  };

  const excluirCadastro = (id) => {
    Alert.alert('Confirmação', 'Deseja excluir este cadastro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        onPress: () => {
          const atualizados = cadastros.filter((item) => item.id !== id);
          setCadastros(atualizados);
          if (ativosIds.includes(id)) {
            const proximaAtualizada = proxima.filter((item) => item.id !== id);
            setProxima(proximaAtualizada);
            setAtivosIds((prev) => prev.filter((pid) => pid !== id));
          }
          setBloqueadosIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          if (editandoId === id) {
            setEditandoId(null);
            setNomesNoModal(['']);
            setModalCadastroVisible(false);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const toggleAtivar = (item) => {
    if (ativosIds.includes(item.id)) {
      setAtivosIds((prev) => prev.filter((id) => id !== item.id));
      setProxima((prev) => prev.filter((p) => p.id !== item.id));
    } else {
      setAtivosIds((prev) => [...prev, item.id]);
      setProxima((prev) => [...prev, item]);
    }
  };

  const togglePago = (id) => {
    setPagos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const bloquearNome = (id) => {
    setBloqueadosIds((prev) => new Set(prev).add(id));
    setProxima((prev) => prev.filter((item) => item.id !== id));
  };

  const desbloquearNome = (id) => {
    setBloqueadosIds((prev) => {
      const novoSet = new Set(prev);
      novoSet.delete(id);
      return novoSet;
    });
    const itemBloqueado = cadastros.find((c) => c.id === id);
    if (itemBloqueado) setProxima((prev) => [...prev, itemBloqueado]);
  };

  const finalizarPartida = () => {
    Alert.alert(
      'Finalizar partida',
      'Todos os jogadores dos dois times e da fila Próxima voltam para a lista de cadastrados. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          onPress: () => {
            setTimeA([]);
            setTimeB([]);
            setProxima([]);
          },
        },
      ]
    );
  };

  const desativarDaProxima = (item) => {
    setProxima((prev) => prev.filter((p) => p.id !== item.id));
  };

  const cadastrosParaLista = cadastrosOrdenados.filter(
    (c) =>
      !proxima.some((p) => p.id === c.id) &&
      !timeA.some((t) => t.id === c.id) &&
      !timeB.some((t) => t.id === c.id)
  );

  const backgroundColorByGroup = (index) => {
    const group = Math.floor(index / 5);
    return group % 2 === 0 ? COLORS.primaryContainer : COLORS.surfaceContainerHigh;
  };

  const renderItemCadastro = ({ item }) => {
    const bloqueado = bloqueadosIds.has(item.id);
    const pago = pagos[item.id] || false;
    const itemStyle = [
      styles.card,
      bloqueado && styles.cardBloqueado,
      pago && styles.cardPago,
    ];

    return (
      <View style={itemStyle}>
        <Pressable
          style={styles.cardContent}
          onPress={() => togglePago(item.id)}
        >
          <Text style={styles.cardTitle}>
            {item.nome}  ·  ⚽ {item.gols || '0'}
          </Text>
          <View style={styles.chipRow}>
            {bloqueado && (
              <View style={[styles.chip, styles.chipBloqueado]}>
                <Text style={styles.chipText}>Bloqueado</Text>
              </View>
            )}
          </View>
        </Pressable>
        <View style={styles.cardActions}>
          {bloqueado && (
            <Pressable
              onPress={() => desbloquearNome(item.id)}
              style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
            >
              <Text style={styles.btnPrimaryLabel}>Desbloquear</Text>
            </Pressable>
          )}
          {!bloqueado && (
            <Pressable
              onPress={() => toggleAtivar(item)}
              style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
            >
              <Text style={styles.btnPrimaryLabel}>Ativar</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => iniciarEdicao(item)}
            style={({ pressed }) => [styles.btnOutlined, pressed && styles.pressed]}
          >
            <Text style={styles.btnOutlinedLabel}>Editar</Text>
          </Pressable>
          <Pressable
            onPress={() => excluirCadastro(item.id)}
            style={({ pressed }) => [styles.btnDestructive, pressed && styles.pressed]}
          >
            <Text style={styles.btnDestructiveLabel}>Excluir</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require('../assets/campo-futebol.jpg')}
      style={styles.backgroundImage}
      imageStyle={styles.imageStyle}
    >
      <View style={styles.overlay} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Lista de cadastros — só exibe quando houver itens (não na Próxima) */}
          {cadastrosParaLista.length > 0 && (
            <View style={styles.section}>
              <Pressable
                style={({ pressed }) => [styles.sectionRowCadastros, pressed && styles.pressed]}
                onPress={() => setListaCadastrosVisivel((v) => !v)}
              >
                <Text style={styles.sectionLabel}>
                  Lista de Nomes · {cadastrosParaLista.length}
                  {bloqueadosIds.size > 0 && ` · ${bloqueadosIds.size} bloqueado(s)`}
                </Text>
                <Text style={styles.sectionToggleIcon}>
                  {listaCadastrosVisivel ? '▼' : '▶'}
                </Text>
              </Pressable>
              {listaCadastrosVisivel && (
                <FlatList
                  scrollEnabled={false}
                  data={cadastrosParaLista}
                  keyExtractor={(item) => item.id}
                  renderItem={renderItemCadastro}
                />
              )}
            </View>
          )}

          {/* Fila Próxima — só exibe quando houver jogadores */}
          {proxima.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionLabel}>Sedentários · {proxima.length}</Text>
                <Pressable
                  style={({ pressed }) => [styles.btnText, pressed && styles.pressed]}
                  onPress={finalizarPartida}
                >
                  <Text style={styles.btnTextLabel}>Finalizar partida</Text>
                </Pressable>
              </View>
              {proxima.map((item, index) => {
                const pago = pagos[item.id] || false;
                return (
                  <View
                    key={item.id}
                    style={[styles.rowProxima, { backgroundColor: backgroundColorByGroup(index) }]}
                  >
                    <View style={styles.rowProximaContent}>
                      <Text style={styles.rowProximaTitle}>
                        {item.nome}  ·  ⚽ {item.gols || '0'}
                      </Text>
                    </View>
                    <View style={styles.rowProximaActions}>
                      <Pressable
                        onPress={() => togglePago(item.id)}
                        style={({ pressed }) => [
                          styles.btnChipSmall,
                          pago ? styles.btnChipSuccess : styles.btnChipError,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text style={styles.btnChipLabel}>{pago ? 'Pago' : 'Não pago'}</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => desativarDaProxima(item)}
                        style={({ pressed }) => [styles.btnOutlinedSmall, pressed && styles.pressed]}
                      >
                        <Text style={styles.btnOutlinedLabel}>Desativar</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB + no canto — abre menu de opções */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { bottom: TAB_BAR_HEIGHT + insets.bottom + SPACING.md },
          pressed && styles.pressed,
        ]}
        onPress={() => setMenuFabVisible(true)}
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>

      {/* Menu do FAB */}
      <Modal
        visible={menuFabVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuFabVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuBackdrop}
          activeOpacity={1}
          onPress={() => setMenuFabVisible(false)}
        >
          <View style={[styles.menuCard, { bottom: TAB_BAR_HEIGHT + insets.bottom + 70 }]}>
            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
              onPress={abrirModalLista}
            >
              <Text style={styles.menuItemIcon}>📋</Text>
              <Text style={styles.menuItemLabel}>Cadastrar lista</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
              onPress={abrirModalUmAum}
            >
              <Text style={styles.menuItemIcon}>✏️</Text>
              <Text style={styles.menuItemLabel}>Cadastrar</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
              onPress={zerarListas}
            >
              <Text style={styles.menuItemIcon}>🗑️</Text>
              <Text style={styles.menuItemLabel}>Zerar lista</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
              onPress={zerarGols}
            >
              <Text style={styles.menuItemIcon}>⚽</Text>
              <Text style={styles.menuItemLabel}>Zerar gols</Text>
            </Pressable>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal Cadastro */}
      <Modal
        visible={modalCadastroVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalCadastroVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setModalCadastroVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalCadastroModo === 'lista'
                  ? 'Cadastrar lista'
                  : editandoId
                    ? 'Editar jogador'
                    : 'Cadastrar'}
              </Text>
              <Pressable
                onPress={() => setModalCadastroVisible(false)}
                style={({ pressed }) => [styles.modalCloseBtn, pressed && styles.pressed]}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            {modalCadastroModo === 'lista' ? (
              <View style={styles.modalSecaoLista}>
                <Text style={styles.modalSecaoLabel}>Cole os nomes (um por linha ou separados por vírgula)</Text>
                <TextInput
                  style={styles.inputListaColada}
                  placeholder="Cole aqui..."
                  placeholderTextColor={COLORS.onSurfaceVariantMuted}
                  value={textoListaColada}
                  onChangeText={setTextoListaColada}
                  multiline
                  numberOfLines={4}
                />
                <Pressable
                  style={({ pressed }) => [styles.btnFilled, pressed && styles.pressed]}
                  onPress={adicionarDaListaColada}
                >
                  <Text style={styles.btnFilledLabel}>Adicionar da lista</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
                  {nomesNoModal.map((valor, index) => (
                    <View key={index} style={styles.modalInputRow}>
                      <TextInput
                        style={styles.inputModal}
                        placeholder="Nome do jogador"
                        placeholderTextColor={COLORS.onSurfaceVariantMuted}
                        value={valor}
                        onChangeText={(t) => atualizarNomeNoModal(index, t)}
                      />
                      {!editandoId && index === nomesNoModal.length - 1 && (
                        <Pressable
                          style={({ pressed }) => [styles.btnAddCampo, pressed && styles.pressed]}
                          onPress={adicionarMaisUmCampo}
                        >
                          <Text style={styles.btnAddCampoLabel}>+</Text>
                        </Pressable>
                      )}
                    </View>
                  ))}
                </ScrollView>
                <Pressable
                  style={({ pressed }) => [styles.btnFilled, pressed && styles.pressed]}
                  onPress={salvarModal}
                >
                  <Text style={styles.btnFilledLabel}>
                    {editandoId ? 'Atualizar' : 'Cadastrar'}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, resizeMode: 'cover', width: '100%', height: '100%' },
  imageStyle: { opacity: 0.4 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 18, 18, 0.82)',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 0, paddingHorizontal: SPACING.lg },
  container: { paddingTop: SPACING.lg },
  section: { marginBottom: SPACING.xl },
  sectionLabel: {
    ...TYPOGRAPHY.titleSmall,
    color: COLORS.onSurfaceVariant,
  },
  sectionRowCadastros: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionToggleIcon: {
    fontSize: 14,
    color: COLORS.onSurfaceVariantMuted,
    marginLeft: SPACING.sm,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  input: {
    flex: 1,
    height: 52,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.onSurface,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.outline,
  },
  inputGolsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: RADIUS.md,
    paddingLeft: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.outline,
  },
  inputGolsIcon: { fontSize: 20, marginRight: 4 },
  inputGols: {
    width: 48,
    height: '100%',
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.onSurface,
    paddingHorizontal: SPACING.xs,
  },
  btnFilled: {
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnFilledLabel: { ...TYPOGRAPHY.labelLarge, color: COLORS.onPrimary },
  btnText: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md },
  btnTextLabel: { ...TYPOGRAPHY.labelLarge, color: COLORS.error },
  pressed: { opacity: 0.82 },
  emptyState: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  emptyStateText: { ...TYPOGRAPHY.bodyMedium, color: COLORS.onSurfaceVariant },
  emptyStateHint: { ...TYPOGRAPHY.bodySmall, color: COLORS.onSurfaceVariantMuted, marginTop: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    backgroundColor: COLORS.surfaceContainer,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    ...ELEVATION.level1,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  cardNaFila: { backgroundColor: COLORS.primaryContainer, borderColor: 'rgba(34, 197, 94, 0.3)' },
  cardBloqueado: { backgroundColor: COLORS.surfaceContainerHigh, opacity: 0.95 },
  cardPago: { backgroundColor: 'rgba(59, 130, 246, 0.4)' },
  cardContent: { flex: 1, minWidth: 100 },
  cardTitle: { ...TYPOGRAPHY.bodyLarge, color: COLORS.onSurface, fontWeight: '500' },
  chipRow: { flexDirection: 'row', marginTop: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  chipFila: { backgroundColor: COLORS.primary },
  chipBloqueado: { backgroundColor: COLORS.surfaceContainerHighest, borderWidth: 1, borderColor: COLORS.outline },
  chipText: { ...TYPOGRAPHY.labelSmall, color: COLORS.onSurface },
  chipTextFila: { ...TYPOGRAPHY.labelSmall, color: COLORS.onPrimary },
  cardActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 8 },
  btnChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginRight: 6,
    marginBottom: 4,
  },
  btnChipSuccess: { backgroundColor: COLORS.success },
  btnChipError: { backgroundColor: COLORS.errorContainer },
  btnChipLabel: { ...TYPOGRAPHY.labelSmall, color: COLORS.onSurface },
  btnOutlined: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.outline,
    marginRight: 6,
    marginBottom: 4,
  },
  btnOutlinedLabel: { ...TYPOGRAPHY.labelSmall, color: COLORS.onSurfaceVariant },
  btnPrimary: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    marginRight: 6,
    marginBottom: 4,
  },
  btnPrimaryLabel: { ...TYPOGRAPHY.labelSmall, color: COLORS.onPrimary },
  btnDestructive: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.errorContainer,
    marginBottom: 4,
  },
  btnDestructiveLabel: { ...TYPOGRAPHY.labelSmall, color: COLORS.error },
  rowProxima: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  rowProximaContent: { flex: 1 },
  rowProximaTitle: { ...TYPOGRAPHY.bodyLarge, color: COLORS.onSurface, fontWeight: '500' },
  rowProximaActions: { flexDirection: 'row', alignItems: 'center' },
  btnChipSmall: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginLeft: 8,
  },
  btnOutlinedSmall: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.outline,
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...ELEVATION.level3,
  },
  fabIcon: {
    fontSize: 32,
    fontWeight: '300',
    color: COLORS.onPrimary,
    lineHeight: 36,
    marginTop: -2,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingRight: SPACING.lg,
  },
  menuCard: {
    position: 'absolute',
    right: SPACING.lg,
    minWidth: 220,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    ...ELEVATION.level2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  menuItemLabel: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.onSurface,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  modalContent: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TYPOGRAPHY.titleMedium,
    color: COLORS.onSurface,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  modalCloseText: {
    fontSize: 18,
    color: COLORS.onSurfaceVariant,
  },
  modalSecaoLista: {
    marginBottom: SPACING.md,
  },
  modalSecaoLabel: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.sm,
  },
  inputListaColada: {
    minHeight: 100,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.onSurface,
    borderWidth: 1,
    borderColor: COLORS.outline,
    textAlignVertical: 'top',
  },
  btnListaColada: {
    height: 44,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryContainer,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  btnListaColadaLabel: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.primary,
  },
  modalSecaoDivider: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.onSurfaceVariantMuted,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  modalScroll: {
    maxHeight: 240,
    marginBottom: SPACING.md,
  },
  modalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  inputModal: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.onSurface,
    borderWidth: 1,
    borderColor: COLORS.outline,
  },
  btnAddCampo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  btnAddCampoLabel: {
    fontSize: 28,
    fontWeight: '300',
    color: COLORS.onPrimary,
    lineHeight: 32,
  },
});
