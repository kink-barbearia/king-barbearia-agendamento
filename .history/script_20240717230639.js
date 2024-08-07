// Função para exibir ou ocultar seções
function toggleSection(event, sectionId) {
  event.preventDefault();
  const sections = [
    "services",
    "portfolio",
    "evaluation",
    "detalhes",
    "agenda",
  ]; // IDs de todas as seções

  sections.forEach((id) => {
    const section = document.getElementById(id);
    if (sectionId !== id) {
      section.style.display = "none";
    } else {
      const selectedSection = document.getElementById(sectionId);
      selectedSection.style.display =
        selectedSection.style.display === "none" ? "block" : "none";
    }
  });
}

// Função para inicializar o mapa
function initMap() {
  // Coordenadas de exemplo (São Paulo, Brasil)
  const location = [-23.612242436593856, -46.594654991394556];

  // Verificar se o contêiner do mapa está visível
  const mapContainer = document.getElementById("map");
  if (
    mapContainer.style.display === "none" ||
    mapContainer.offsetWidth === 0 ||
    mapContainer.offsetHeight === 0
  ) {
    // Aguardar até que o contêiner do mapa esteja visível
    setTimeout(initMap, 100);
    return;
  }

  // Inicializar o mapa
  const map = L.map("map").setView(location, 13);

  // Adicionar camada de mapa do OpenStreetMap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/export#map=19/-23.61312/-46.59401">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Adicionar um marcador na localização
  L.marker(location).addTo(map).bindPopup("São Paulo, Brasil").openPopup();
}

// Evento de clique no botão de navegação
document
  .getElementById("navigate-button")
  .addEventListener("click", function () {
    const lat = -23.612242436593856; // Latitude de destino
    const lng = -46.594654991394556; // Longitude de destino
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      "_blank"
    );
  });

// Evento de clique no botão "curtir"
document.getElementById("curtir").addEventListener("click", function () {
  if (this.src.includes("coracao.png")) {
    this.src = "./images/coracaopreenchido.png";
  } else {
    this.src = "./images/coracao.png";
  }
});

// Seleciona todos os botões de agendamento
const agendarButtons = document.querySelectorAll("#agendar-btn");

// Adiciona um evento de clique para cada botão de agendamento
agendarButtons.forEach((button) => {
  button.addEventListener("click", function (event) {
    // Evita o comportamento padrão do botão (enviar formulário)
    event.preventDefault();

    // Obtém os dados do serviço, valor e tempo da mesma div do botão clicado
    const service = button.getAttribute("data-servico"); // Obtém o valor do data-servico
    const value = button.parentNode.querySelector("#valor").textContent.trim();
    const duration = button.parentNode
      .querySelector("#tempo")
      .textContent.trim(); // Renomeado para duration

    // Fecha o elemento de serviços
    document.getElementById("services").style.display = "none";

    // Preenche o modal com os dados do serviço selecionado
    document.querySelector("#scheduleModal").style.display = "block";
    document.querySelector('#scheduleForm input[type="text"]').value = ""; // Limpa os campos de texto (nome e whatsapp)
    document.querySelector("#barber").selectedIndex = 0; // Reseta o dropdown de barbeiros
    document.querySelector("#date").value = ""; // Limpa o campo de data
    document.querySelector("#time").value = ""; // Limpa o campo de horário

    // Preenche os campos ocultos no formulário com os dados do serviço selecionado
    document.querySelector('#scheduleForm input[name="service"]').value =
      service;
    document.querySelector('#scheduleForm input[name="valueservice"]').value =
      value; // Renomeado para valueservice
    document.querySelector('#scheduleForm input[name="duration"]').value =
      duration; // Envia duration ao invés de time
  });
});

// Função para fechar o modal de agendamento
function closeModal() {
  document.querySelector("#scheduleModal").style.display = "none";
  // Reabre o elemento de serviços quando o modal é fechado
  document.getElementById("services").style.display = "block";
}

// Evento de clique no ícone do menu mobile para exibir/ocultar o menu
const mobileMenu = document.getElementById("mobile-menu");
const navList = document.querySelector(".nav-list");
const navLinks = document.querySelectorAll(".nav-list li a");

mobileMenu.addEventListener("click", () => {
  navList.classList.toggle("active");
});

// Evento de clique nos links do menu para marcar o link ativo
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.forEach((nav) => nav.classList.remove("active"));
    link.classList.add("active");
  });
});

// Inicializar o mapa assim que o documento estiver pronto
document.addEventListener("DOMContentLoaded", function () {
  initMap();
});

// Função para enviar os dados do formulário para a rota Flask
let isSubmitting = false;

function submitForm(event) {
  event.preventDefault();

  if (isSubmitting) return;

  isSubmitting = true;

  const form = document.getElementById("scheduleForm");
  const formData = new FormData(form);

  fetch("http://127.0.0.1:8000/schedule", {
    method: "POST",
    body: JSON.stringify(Object.fromEntries(formData.entries())), // Converte FormData para objeto JSON
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Booking confirmed:", data.message);
      // Aqui você pode adicionar lógica adicional após o agendamento ser confirmado
      closeModal(); // Fecha o modal após o agendamento ser confirmado
      isSubmitting = false; // Reseta o flag de submissão
    })
    .catch((error) => {
      console.error("Error:", error);
      // Aqui você pode tratar erros de requisição, se necessário
      isSubmitting = false; // Reseta o flag de submissão
    });
}

// Adiciona um evento de submit para o formulário
document.getElementById("scheduleForm").addEventListener("submit", submitForm);

//consultar dados agenda
function fetchBookings() {
  fetch("http://127.0.0.1:8000/bookings")
    .then((response) => response.json())
    .then((data) => {
      const bookingsDiv = document.getElementById("bookings");
      bookingsDiv.innerHTML = "";

      data.forEach((booking) => {
        const bookingDiv = document.createElement("div");
        bookingDiv.classList.add("booking");
        bookingDiv.innerHTML = `
              <p><strong>Nome:</strong> ${booking.name}</p>
              <p><strong>Telefone:</strong> ${booking.phone}</p>
              <p><strong>Serviço:</strong> ${booking.service}</p>
              <p><strong>Barbeiro:</strong> ${booking.barber}</p>
              <p><strong>Data:</strong> ${booking.date}</p>
              <p><strong>Hora:</strong> ${booking.time}</p>
              <p><strong>Duração:</strong> ${booking.duration}</p>
              <p><strong>Valor:</strong> ${booking.valueservice}</p>
            `;
        bookingsDiv.appendChild(bookingDiv);
      });

      document.getElementById("agenda").style.display = "block";
    })
    .catch((error) => {
      console.error("Erro ao buscar agendamentos:", error);
    });
}
// Exemplo de uso:
window.onload = function () {
  const user = getUserCredentials();
  if (user.name && user.phone) {
    console.log(`Usuário logado: ${user.name}, Telefone: ${user.phone}`);
    // Aqui você pode usar os dados do usuário para preencher campos ou realizar outras ações
    document.getElementById("userNameField").value = user.name;
    document.getElementById("userPhoneField").value = user.phone;
  } else {
    window.location.href = "/index.html"; // Redirecionar para login se não estiver logado
  }
};


