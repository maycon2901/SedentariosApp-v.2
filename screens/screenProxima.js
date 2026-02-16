import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
  Alert,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { useApp } from '../app/App';
import { FontAwesome } from '@expo/vector-icons';

export default function ScreenProxima() {
  const { cadastros, proxima, setProxima } = useApp();
  const total = cadastros.length;

  const [valor, setValor] = React.useState('1');
  const [pagos, setPagos] = useState({});
  const [bloqueadosIds, setBloqueadosIds] = useState(new Set());

  const resultado = total && valor ? (total / parseFloat(valor)).toFixed(2) : 0;

  // Alterna pago / não pago para um id
  const togglePago = (id) => {
    setPagos((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Move item de proxima para bloqueados (add id a set bloqueados)
  const bloquearNome = (id) => {
    setBloqueadosIds((prev) => new Set(prev).add(id));
    // Remove da lista proxima mantendo ordem dos demais
    setProxima((prev) => {
      const novaLista = prev.filter((item) => item.id !== id);
      return novaLista;
    });
  };

  // Remove bloqueio: move item de bloqueados para o final da lista proxima
  const desbloquearNome = (id) => {
    setBloqueadosIds((prev) => {
      const novoSet = new Set(prev);
      novoSet.delete(id);
      return novoSet;
    });
    // Adiciona item bloqueado ao final da lista proxima
    const itemBloqueado = cadastros.find((c) => c.id === id);
    if (itemBloqueado) {
      setProxima((prev) => [...prev, itemBloqueado]);
    }
  };

  // Função para definir cor de fundo por grupo de 5
  const backgroundColorByGroup = (index) => {
    const group = Math.floor(index / 5);
    return group % 2 === 0 ? '#78a07aff' : '#856565ff';
  };

  // Itens bloqueados como objetos (filtra cadastros que estão bloqueados)
  const bloqueados = cadastros.filter((c) => bloqueadosIds.has(c.id));

  return (
    <ImageBackground
      source={require('../assets/campo-futebol.jpg')}
      style={styles.backgroundImage}
      imageStyle={styles.imageStyle}
    >
      <View style={styles.overlayEscuro} />
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.botaoZerar}
          onPress={() => {
            Alert.alert('Confirmação', 'Deseja zerar toda a tabela Proxima?', [
              {
                text: 'Cancelar',
                style: 'cancel',
              },
              {
                text: 'Confirmar',
                style: 'destructive',
                onPress: () => setProxima([]),
              },
            ]);
          }}
        >
          <Text style={styles.botaoZerarTexto}>Zerar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Proxima</Text>

        <FlatList
          data={proxima}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
            const pago = pagos[item.id] || false;
            return (
              <View
                style={[
                  styles.item,
                  { backgroundColor: backgroundColorByGroup(index) },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.text}>{item.nome} - ⚽ {item.gols || '0'}</Text>
                </View>

                {/* Botão Pago / Não pago */}
                <TouchableOpacity
                  onPress={() => togglePago(item.id)}
                  style={[styles.botaoPago, { backgroundColor: pago ? 'green' : 'red' }]}
                >
                  <Text style={styles.botaoTexto}>{pago ? 'Pago' : 'Não pago'}</Text>
                </TouchableOpacity>

                {/* Botão bloquear - preto */}
                <TouchableOpacity
                  onPress={() => bloquearNome(item.id)}
                  style={styles.botaoBloquear}
                >
                  <Text style={styles.botaoTexto}>Bloquear</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />

        <Text style={[styles.title, { marginTop: 30 }]}>Bloqueados</Text>

        <FlatList
          data={bloqueados}
          keyExtractor={(item) => item.id}
          style={{ maxHeight: 200 }}
          renderItem={({ item }) => {
            const pago = pagos[item.id] || false;
            return (
              <View style={[styles.item, { backgroundColor: '#444' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.text, { color: 'white' }]}>{item.nome} - ⚽ {item.gols || '0'}</Text>
                </View>

                {/* Botão Pago / Não pago */}
                <TouchableOpacity
                  onPress={() => togglePago(item.id)}
                  style={[styles.botaoPago, { backgroundColor: pago ? 'green' : 'red' }]}
                >
                  <Text style={styles.botaoTexto}>{pago ? 'Pago' : 'Não pago'}</Text>
                </TouchableOpacity>

                {/* Botão desbloquear */}
                <TouchableOpacity
                  onPress={() => desbloquearNome(item.id)}
                  style={[styles.botaoBloquear, { backgroundColor: '#222' }]}
                >
                  <Text style={styles.botaoTexto}>Desbloquear</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },
  imageStyle: {
    opacity: 0.4,
  },
  overlayEscuro: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  container: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    fontFamily: 'Consolas',
    borderWidth: 2,
    backgroundColor: 'rgba(12, 12, 12, 0.9)',
    color: 'white',
  },
  text: {
    fontSize: 18,
    fontFamily: 'Consolas',
  },
  item: {
    padding: 5,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  botaoPago: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 90,
    height: 36,
  },
  botaoBloquear: {
    backgroundColor: 'black',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 90,
    height: 36,
  },
  botaoTexto: {
    color: 'white',
    fontFamily: 'Consolas',
    fontSize: 14,
  },
  botaoZerar: {
    backgroundColor: 'black',
    paddingVertical: 5,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 10,
  },
  botaoZerarTexto: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Consolas',
    color: 'white',
  },
});
