// distribuir.js
export const distribuir = (lista, bloqueadosIds = []) => {
  const dezPrimeiros = lista.slice(0, 10);
  const restante = lista.slice(10);

  // Separar bloqueados dos não bloqueados
  const bloqueados = dezPrimeiros.filter(item => bloqueadosIds.includes(item.id));
  const naoBloqueados = dezPrimeiros.filter(item => !bloqueadosIds.includes(item.id));

  const porCategoria = {};
  naoBloqueados.forEach((item) => {
    if (!porCategoria[item.categoria]) porCategoria[item.categoria] = [];
    porCategoria[item.categoria].push(item);
  });

  const timeA = [];
  const timeB = [];

  Object.values(porCategoria).forEach((listaCategoria) => {
    const metade = Math.floor(listaCategoria.length / 2);
    const sobra = listaCategoria.length % 2;

    timeA.push(...listaCategoria.slice(0, metade));
    timeB.push(...listaCategoria.slice(metade, metade + metade));

    if (sobra) {
      if (timeA.length <= timeB.length) {
        timeA.push(listaCategoria[listaCategoria.length - 1]);
      } else {
        timeB.push(listaCategoria[listaCategoria.length - 1]);
      }
    }
  });

  const trimTime = (time) => (time.length <= 5 ? time : time.slice(0, 5));
  const finalA = trimTime(timeA);
  const finalB = trimTime(timeB);

  const usados = finalA.concat(finalB);
  // Manter bloqueados na lista proxima junto com o restante
  const novaProxima = [...bloqueados, ...restante].filter(
    (item) => !usados.some((u) => u.id === item.id)
  );

  return { timeA: finalA, timeB: finalB, proxima: novaProxima };
};

