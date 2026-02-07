/* Alke Wallet - Wallet demo (multi-archivos) con Bootstrap + jQuery
   - Captura eventos con jQuery
   - Valida formularios
   - Actualiza saldo/movimientos con localStorage
*/

const storageWalletKeys = {
  usuario: "wallet_user",
  saldo: "wallet_balance",
  movimientos: "wallet_transactions",
  agenda: "wallet_contacts",
};

function formatearClp(n) {
  const num = Math.round(Number(n || 0));
  return "$" + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function fechaHoraActualTexto() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy} ${hh}:${mi}`;
}

function leerStorageJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function guardarStorageJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function inicializarWalletSiHaceFalta() {
  if (!localStorage.getItem(storageWalletKeys.saldo)) {
    localStorage.setItem(storageWalletKeys.saldo, "0");
  }
  if (!localStorage.getItem(storageWalletKeys.movimientos)) {
    guardarStorageJson(storageWalletKeys.movimientos, []);
  }
  if (!localStorage.getItem(storageWalletKeys.agenda)) {
    guardarStorageJson(storageWalletKeys.agenda, [
      { name: "Martin Heidegger", alias: "Heidi", cbu: "1234567890123456789012" },
      { name: "Teun Van Dijk", alias: "Analitico", cbu: "9999888877776666555544" },
      { name: "Gabriela Mistral", alias: "gabi", cbu: "1111222233334444555566" },
    ]);
  }
}

function obtenerSaldo() {
  return Number(localStorage.getItem(storageWalletKeys.saldo) || 0);
}

function guardarSaldo(value) {
  localStorage.setItem(storageWalletKeys.saldo, String(Number(value || 0)));
}

function registrarMovimiento(tx) {
  const movimientosWallet = leerStorageJson(storageWalletKeys.movimientos, []);
  movimientosWallet.unshift(tx);
  guardarStorageJson(storageWalletKeys.movimientos, movimientosWallet);
}

function exigirLogin() {
  const usuarioEmail = localStorage.getItem(storageWalletKeys.usuario);
  if (!usuarioEmail) window.location.href = "login.html";
}

function obtenerNombrePagina() {
  const archivoPagina = (window.location.pathname || "").split("/").pop() || "";
  return archivoPagina.toLowerCase();
}

function mostrarAlertaBootstrap(mensaje, tipo = "info") {
  const $contenedorAlertas = $("#contenedorAlertas");
  if (!$contenedorAlertas.length) return;

  const alertaHtml = `
    <div class="alert alert-${tipo} alert-dismissible fade show mt-3" role="alert">
      ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    </div>
  `;
  $contenedorAlertas.html(alertaHtml);
}

function configurarLogin() {
  if (obtenerNombrePagina() !== "login.html") return;

  inicializarWalletSiHaceFalta();

  $("#formLogin").submit(function (e) {
    e.preventDefault();

    const correoLogin = ($("#inputEmail").val() || "").toString().trim();
    const claveLogin = ($("#inputClave").val() || "").toString().trim();

    if (!correoLogin.includes("@")) {
      mostrarAlertaBootstrap("Por favor, escribe un email válido (debe contener @).", "warning");
      return;
    }
    if (claveLogin.length < 4) {
      mostrarAlertaBootstrap("La contraseña debe tener al menos 4 caracteres (demo).", "warning");
      return;
    }

    localStorage.setItem(storageWalletKeys.usuario, correoLogin);

    mostrarAlertaBootstrap("¡Ingreso correcto! Redirigiendo al menú…", "success");

    setTimeout(() => {
      window.location.href = "menu.html";
    }, 700);
  });
}

function configurarMenu() {
  if (obtenerNombrePagina() !== "menu.html") return;

  exigirLogin();
  inicializarWalletSiHaceFalta();

  const usuarioEmail = localStorage.getItem(storageWalletKeys.usuario) || "usuario";
  $("#textoUsuarioEmail").text(usuarioEmail);

  $("#textoSaldo").text(formatearClp(obtenerSaldo()));

  $("#btnCerrarSesion").on("click", function () {
    localStorage.removeItem(storageWalletKeys.usuario);
    window.location.href = "login.html";
  });

  $("#btnIrADeposito").on("click", function () {
    $("#leyendaRedireccion").removeClass("d-none").text("Redirigiendo a depósito…");
    setTimeout(() => (window.location.href = "deposit.html"), 500);
  });

  $("#btnIrAEnviar").on("click", function () {
    $("#leyendaRedireccion").removeClass("d-none").text("Redirigiendo a enviar dinero…");
    setTimeout(() => (window.location.href = "sendmoney.html"), 500);
  });

  $("#btnIrAMovimientos").on("click", function () {
    $("#leyendaRedireccion").removeClass("d-none").text("Redirigiendo a movimientos…");
    setTimeout(() => (window.location.href = "transactions.html"), 500);
  });
}

function configurarDeposito() {
  if (obtenerNombrePagina() !== "deposit.html") return;

  exigirLogin();
  inicializarWalletSiHaceFalta();

  $("#textoSaldo").text(formatearClp(obtenerSaldo()));

  $("#formDeposito").submit(function (e) {
    e.preventDefault();

    const montoDeposito = Number($("#inputMontoDeposito").val() || 0);

    if (!(montoDeposito > 0)) {
      mostrarAlertaBootstrap("Ingresa un monto válido (mayor a 0).", "warning");
      return;
    }

    guardarSaldo(obtenerSaldo() + montoDeposito);

    registrarMovimiento({
      type: "deposit",
      title: "Depósito",
      detail: `Ingresaste ${formatearClp(montoDeposito)}`,
      amount: montoDeposito,
      date: fechaHoraActualTexto(),
    });

    $("#leyendaDeposito").removeClass("d-none").text(`Depositaste: ${formatearClp(montoDeposito)}`);
    mostrarAlertaBootstrap(`Depósito realizado correctamente por ${formatearClp(montoDeposito)}.`, "success");
    $("#textoSaldo").text(formatearClp(obtenerSaldo()));

    setTimeout(() => {
      window.location.href = "menu.html";
    }, 2000);
  });
}

function configurarEnvioDinero() {
  if (obtenerNombrePagina() !== "sendmoney.html") return;

  exigirLogin();
  inicializarWalletSiHaceFalta();

  $("#textoSaldo").text(formatearClp(obtenerSaldo()));

  $("#cajaNuevoContacto").hide();

  $("#btnMostrarNuevoContacto").on("click", function () {
    $("#cajaNuevoContacto").slideDown(200);
  });

  $("#btnCancelarNuevoContacto").on("click", function () {
    $("#cajaNuevoContacto").slideUp(200);
    $("#formAgregarContacto")[0].reset();
  });

  function renderizarContactos(contactosParaMostrar) {
    const $listaContactos = $("#listaContactos");
    $listaContactos.empty();

    if (!contactosParaMostrar.length) {
      $listaContactos.append(`<li class="list-group-item text-muted">No hay contactos para mostrar.</li>`);
      return;
    }

    contactosParaMostrar.forEach((contactoAgenda, indiceContacto) => {
      $listaContactos.append(`
        <li class="list-group-item contact-item" data-index="${indiceContacto}">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <div class="fw-bold">${contactoAgenda.name}</div>
              <div class="small text-muted">Alias: ${contactoAgenda.alias || "-"}</div>
              <div class="small text-muted">CBU: ${contactoAgenda.cbu || "-"}</div>
            </div>
            <span class="badge bg-light text-dark border">Seleccionar</span>
          </div>
        </li>
      `);
    });
  }

  let agendaContactos = leerStorageJson(storageWalletKeys.agenda, []);
  let contactosFiltrados = [...agendaContactos];
  let contactoSeleccionado = null;

  renderizarContactos(contactosFiltrados);

  $("#formBuscarContacto").submit(function (e) {
    e.preventDefault();
    const consultaBusqueda = ($("#inputBuscarContacto").val() || "").toString().trim().toLowerCase();

    if (consultaBusqueda.length < 2) {
      mostrarAlertaBootstrap("Escribe al menos 2 letras para buscar.", "warning");
      return;
    }

    contactosFiltrados = agendaContactos.filter(contactoAgenda =>
      (contactoAgenda.name || "").toLowerCase().includes(consultaBusqueda) ||
      (contactoAgenda.alias || "").toLowerCase().includes(consultaBusqueda)
    );

    renderizarContactos(contactosFiltrados);
    $("#leyendaBusqueda").removeClass("d-none").text(`Mostrando resultados para: "${consultaBusqueda}"`);
  });

  // Autocompletar búsqueda (jQuery)
  $("#inputBuscarContacto").on("input", function () {
    const consultaBusqueda = ($(this).val() || "").toString().trim().toLowerCase();

    if (consultaBusqueda.length < 2) {
      contactosFiltrados = [...agendaContactos];
      renderizarContactos(contactosFiltrados);
      $("#leyendaBusqueda").addClass("d-none").text("");
      return;
    }

    contactosFiltrados = agendaContactos.filter(contactoAgenda =>
      (contactoAgenda.name || "").toLowerCase().includes(consultaBusqueda) ||
      (contactoAgenda.alias || "").toLowerCase().includes(consultaBusqueda)
    );

    renderizarContactos(contactosFiltrados);
    $("#leyendaBusqueda").removeClass("d-none").text(`Mostrando resultados para: "${consultaBusqueda}"`);
  });

  $("#listaContactos").on("click", ".contact-item", function () {
    const indiceSeleccion = Number($(this).attr("data-index"));
    const contactoElegido = contactosFiltrados[indiceSeleccion];

    if (!contactoElegido) return;

    contactoSeleccionado = contactoElegido;

    $(".contact-item").removeClass("active");
    $(this).addClass("active");

    $("#seccionEnvio").removeClass("d-none");
    $("#contactoSeleccionado").text(contactoElegido.name || "Contacto");
    $("#btnEnviarDinero").removeClass("d-none");
    $("#mensajeConfirmacion").addClass("d-none").text("");
  });

  $("#formEnviarDinero").submit(function (e) {
    e.preventDefault();

    const montoEnvio = Number($("#inputMontoEnvio").val() || 0);

    if (!contactoSeleccionado) {
      mostrarAlertaBootstrap("Selecciona un contacto antes de enviar.", "warning");
      return;
    }
    if (!(montoEnvio > 0)) {
      mostrarAlertaBootstrap("Ingresa un monto válido (mayor a 0).", "warning");
      return;
    }
    if (montoEnvio > obtenerSaldo()) {
      mostrarAlertaBootstrap("No tienes saldo suficiente para esta transferencia.", "danger");
      return;
    }

    guardarSaldo(obtenerSaldo() - montoEnvio);

    registrarMovimiento({
      type: "send",
      title: "Envío",
      detail: `Enviaste ${formatearClp(montoEnvio)} a ${contactoSeleccionado.name}`,
      amount: montoEnvio,
      date: fechaHoraActualTexto(),
    });

    $("#textoSaldo").text(formatearClp(obtenerSaldo()));
    $("#mensajeConfirmacion")
      .removeClass("d-none")
      .text(`Transferencia realizada a ${contactoSeleccionado.name} por ${formatearClp(montoEnvio)}.`);

    $("#inputMontoEnvio").val("");
  });

  $("#formAgregarContacto").submit(function (e) {
    e.preventDefault();

    const nombreContacto = ($("#inputNombreContacto").val() || "").toString().trim();
    const aliasContacto = ($("#inputAliasContacto").val() || "").toString().trim();
    const cbuContacto = ($("#inputCbuContacto").val() || "").toString().trim();

    if (nombreContacto.length < 2) {
      mostrarAlertaBootstrap("El nombre debe tener al menos 2 caracteres.", "warning");
      return;
    }
    if (aliasContacto.length < 3) {
      mostrarAlertaBootstrap("El alias debe tener al menos 3 caracteres.", "warning");
      return;
    }
    if (!/^\d{22}$/.test(cbuContacto)) {
      mostrarAlertaBootstrap("El CBU debe tener exactamente 22 dígitos (solo números).", "warning");
      return;
    }

    agendaContactos.push({ name: nombreContacto, alias: aliasContacto, cbu: cbuContacto });
    guardarStorageJson(storageWalletKeys.agenda, agendaContactos);

    contactosFiltrados = [...agendaContactos];
    renderizarContactos(contactosFiltrados);

    $("#cajaNuevoContacto").slideUp(200);
    $("#formAgregarContacto")[0].reset();

    mostrarAlertaBootstrap("Contacto agregado correctamente.", "success");
  });
}

function configurarMovimientos() {
  if (obtenerNombrePagina() !== "transactions.html") return;

  exigirLogin();
  inicializarWalletSiHaceFalta();

  $("#textoSaldo").text(formatearClp(obtenerSaldo()));

  const movimientosWallet = leerStorageJson(storageWalletKeys.movimientos, []);

  function etiquetaTipoMovimiento(tipoMovimiento) {
    if (tipoMovimiento === "deposit") return "Depósito";
    if (tipoMovimiento === "send") return "Envío";
    return "Movimiento";
  }

  function renderizarMovimientos(filtroTipo) {
    const $listaMovimientos = $("#listaMovimientos");
    $listaMovimientos.empty();

    const movimientosFiltrados = movimientosWallet.filter((movimiento) => {
      if (filtroTipo === "todos") return true;
      return movimiento.type === filtroTipo;
    });

    if (!movimientosFiltrados.length) {
      $listaMovimientos.append(`
        <li class="list-group-item text-muted small">No hay movimientos para mostrar.</li>
      `);
      return;
    }

    movimientosFiltrados.forEach((movimiento) => {
      $listaMovimientos.append(`
        <li class="list-group-item">
          <div class="d-flex justify-content-between align-items-start gap-2">
            <div>
              <div class="fw-bold">${etiquetaTipoMovimiento(movimiento.type)}</div>
              <div class="small text-muted">${movimiento.detail}</div>
              <div class="small text-muted">${movimiento.date}</div>
            </div>
            <div class="text-end fw-bold">${formatearClp(movimiento.amount)}</div>
          </div>
        </li>
      `);
    });
  }

  renderizarMovimientos("todos");

  $("#filtroMovimientos").on("change", function () {
    const filtroTipo = ($(this).val() || "todos").toString();
    renderizarMovimientos(filtroTipo);
  });

}

$(function () {
  inicializarWalletSiHaceFalta();
  configurarLogin();
  configurarMenu();
  configurarDeposito();
  configurarEnvioDinero();
  configurarMovimientos();
});
