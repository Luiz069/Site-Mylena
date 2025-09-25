function atualizarTemporizador() {
  const inicio = new Date("2024-10-07T23:00:00");
  const agora = new Date();

  let anos = agora.getFullYear() - inicio.getFullYear();
  let meses = agora.getMonth() - inicio.getMonth();
  let dias = agora.getDate() - inicio.getDate();
  let horas = agora.getHours() - inicio.getHours();
  let minutos = agora.getMinutes() - inicio.getMinutes();
  let segundos = agora.getSeconds() - inicio.getSeconds();

  if (segundos < 0) {
    segundos += 60;
    minutos--;
  }
  if (minutos < 0) {
    minutos += 60;
    horas--;
  }
  if (horas < 0) {
    horas += 24;
    dias--;
  }
  if (dias < 0) {
    const ultimoMes = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      0
    ).getDate();
    dias += ultimoMes;
    meses--;
  }
  if (meses < 0) {
    meses += 12;
    anos--;
  }

  document.getElementById("ymd").innerHTML = `
    <div class="time-unit"><span>${anos}</span><div class="time-label">Anos</div></div>
    <div class="time-unit"><span>${meses}</span><div class="time-label">Meses</div></div>
    <div class="time-unit"><span>${dias}</span><div class="time-label">Dias</div></div>
  `;

  document.getElementById("hms").innerHTML = `
    <div class="time-unit"><span>${String(horas).padStart(
      2,
      "0"
    )}</span><div class="time-label">Horas</div></div>
    <div class="time-unit"><span>${String(minutos).padStart(
      2,
      "0"
    )}</span><div class="time-label">Minutos</div></div>
    <div class="time-unit"><span>${String(segundos).padStart(
      2,
      "0"
    )}</span><div class="time-label">Segundos</div></div>
  `;
}

setInterval(atualizarTemporizador, 1000);
atualizarTemporizador();
