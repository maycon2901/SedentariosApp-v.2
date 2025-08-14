import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useApp } from './App';

export default function CalculationScreen() {
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
    <View style={styles.container}>
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
                <Text style={styles.text}>{item.nome}</Text>
                <Text style={styles.text}>⚽ {item.gols}</Text>
              </View>

              {/* Botão Pago / Não pago */}
              <Button
                title={pago ? 'Pago' : 'Não pago'}
                color={pago ? 'green' : 'red'}
                onPress={() => togglePago(item.id)}
              />

              {/* Botão bloquear - preto */}
              <TouchableOpacity
                onPress={() => bloquearNome(item.id)}
                style={styles.botaoBloquear}
              >
                <Text style={{ color: 'white' }}>Bloquear</Text>
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
                <Text style={[styles.text, { color: 'white' }]}>{item.nome}</Text>
                <Text style={[styles.text, { color: 'white' }]}>⚽ {item.gols}</Text>
              </View>

              {/* Botão Pago / Não pago */}
              <Button
                title={pago ? 'Pago' : 'Não pago'}
                color={pago ? 'green' : 'red'}
                onPress={() => togglePago(item.id)}
              />

              {/* Botão desbloquear */}
              <TouchableOpacity
                onPress={() => desbloquearNome(item.id)}
                style={[styles.botaoBloquear, { backgroundColor: '#222' }]}
              >
                <Text style={{ color: 'white' }}>Desbloquear</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <View style={{ marginTop: 20 }}>
        <Button
          title="Limpar Proxima"
          color="red"
          onPress={() => {
            Alert.alert('Confirmação', 'Deseja limpar toda a tabela Proxima?', [
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
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#808080',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    marginTop: 30,
  },
  text: {
    fontSize: 13,
  },
  item: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  botaoBloquear: {
    backgroundColor: 'black',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
