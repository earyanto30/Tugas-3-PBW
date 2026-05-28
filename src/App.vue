<script setup>
import { computed, reactive, ref } from 'vue';
import { dataPengguna } from '../data/data.js';

const form = reactive({
  email: '',
  password: '',
});

const showForgotModal = ref(false);
const showRegisterModal = ref(false);
const requestEmail = ref('');
const loggedInUser = ref(null);
const activeTab = ref('stock');

// Step 3 root-level app states (temporary local placeholders)
const stockData = ref([
  { kodeBarang: 'ASIP4301', namaBarang: 'Pengantar Ilmu Komunikasi', stok: 548 },
  { kodeBarang: 'EKMA4216', namaBarang: 'Manajemen Keuangan', stok: 392 },
]);
const deliveryOrders = ref([
  { nomorDO: 'DO2025-001', nama: 'Rina Wulandari', status: 'Dalam Perjalanan' },
]);
const packageData = ref([
  { kodePaket: 'PKT-JKT-01', namaPaket: 'Paket Jakarta', totalItem: 2 },
]);
const isLoading = ref(false);
const errorMessage = ref('');

const currentHour = new Date().getHours();

const welcomeMessage = computed(() => {
  if (!loggedInUser.value) {
    return '';
  }

  return `${loggedInUser.value.nama} berhasil login sebagai ${loggedInUser.value.role} (${loggedInUser.value.lokasi})`;
});

const greetingMessage = computed(() => {
  if (currentHour >= 0 && currentHour < 11) {
    return 'Selamat Pagi!';
  }

  if (currentHour >= 11 && currentHour < 15) {
    return 'Selamat Siang!';
  }

  return 'Selamat Sore!';
});

function submitLogin() {
  const user = dataPengguna.find(
    (item) => item.email === form.email.trim() && item.password === form.password,
  );

  if (!user) {
    window.alert('email/password yang anda masukkan salah');
    return;
  }

  loggedInUser.value = user;
  localStorage.setItem('loggedInUser', JSON.stringify(user));
}

function logout() {
  localStorage.removeItem('loggedInUser');
  loggedInUser.value = null;
  activeTab.value = 'stock';
  form.email = '';
  form.password = '';
}

function setActiveTab(tab) {
  activeTab.value = tab;
}

function closeForgotModal() {
  showForgotModal.value = false;
}

function closeRegisterModal() {
  showRegisterModal.value = false;
}

function sendResetRequest() {
  window.alert('Permintaan reset password telah dikirim.');
  requestEmail.value = '';
  closeForgotModal();
}

function showRegistrationInfo() {
  window.alert('Silakan kunjungi admisi-sia.ut.ac.id');
  closeRegisterModal();
}
</script>

<template>
  <div>
    <div v-if="!loggedInUser" class="login-container">
      <div class="login-card">
        <img
          src="/assets/images/logo.png"
          alt="UT Logo"
          style="max-width: 150px; margin-bottom: 15px"
        />
        <h2>Sistem Bahan Ajar UT</h2>
        <form id="loginForm" @submit.prevent="submitLogin">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              placeholder="Masukkan email anda"
            />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              placeholder="Masukkan password anda"
            />
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%">Login</button>
        </form>

        <p v-if="loggedInUser" class="mt-1" style="color: var(--ut-blue)">
          {{ welcomeMessage }}
        </p>

        <div class="auth-links">
          <a id="lupaPasswordBtn" @click="showForgotModal = true">Lupa password?</a> |
          <a id="daftarBtn" @click="showRegisterModal = true">Daftar akun baru</a>
        </div>
      </div>
    </div>

    <div v-else>
      <nav class="navbar">
        <a href="#" class="brand" style="display: flex; align-items: center">
          <img
            src="/assets/images/logo.png"
            alt="UT Logo"
            style="height: 30px; margin-right: 10px"
          />
          Sistem Bahan Ajar UT
        </a>
        <ul class="nav-links">
          <li><a href="#">Informasi Bahan Ajar</a></li>
          <li><a href="#">Tracking Pengiriman</a></li>
          <li class="dropdown">
            <a href="#">Laporan &#9662;</a>
            <div class="dropdown-content">
              <a href="#">Monitoring progress DO</a>
              <a href="#">Rekap bahan ajar</a>
            </div>
          </li>
          <li><a href="#">Histori Transaksi</a></li>
          <li><a href="#" @click.prevent="logout">Logout</a></li>
        </ul>
      </nav>

      <div class="container mt-3">
        <div class="card text-center">
          <h1>{{ greetingMessage }}</h1>
          <p class="mt-1">Anda login sebagai {{ loggedInUser.nama }} ({{ loggedInUser.role }})</p>
        </div>

        <div class="card mt-2">
          <h2>Dashboard</h2>
          <p class="mt-1">
            Pilih menu utama untuk mengelola data stok bahan ajar atau tracking DO.
          </p>

          <div class="nav-links" style="margin-top: 16px; gap: 10px">
            <a
              href="#"
              :class="{ active: activeTab === 'stock' }"
              @click.prevent="setActiveTab('stock')"
            >
              Stok Bahan Ajar
            </a>
            <a
              href="#"
              :class="{ active: activeTab === 'tracking' }"
              @click.prevent="setActiveTab('tracking')"
            >
              Tracking DO
            </a>
          </div>

          <div v-if="isLoading" class="mt-2">
            <p>Memuat data...</p>
          </div>
          <div v-else-if="errorMessage" class="mt-2">
            <p>{{ errorMessage }}</p>
          </div>

          <div v-else class="mt-2">
            <section v-if="activeTab === 'stock'">
              <h3>Stok Bahan Ajar</h3>
              <p class="mt-1">Halaman stok akan ditampilkan di sini.</p>
              <p class="mt-1">
                Data sementara: {{ stockData.length }} item stok, {{ packageData.length }} paket.
              </p>
            </section>

            <section v-else>
              <h3>Tracking DO</h3>
              <p class="mt-1">Halaman tracking delivery order akan ditampilkan di sini.</p>
              <p class="mt-1">Data sementara: {{ deliveryOrders.length }} delivery order.</p>
            </section>
          </div>
        </div>
      </div>
    </div>

    <div
      v-show="showForgotModal"
      id="modalLupaPassword"
      class="modal-overlay"
      @click.self="closeForgotModal"
    >
      <div class="modal-content">
        <span id="closeLupaPassword" class="close-btn" @click="closeForgotModal">&times;</span>
        <h3>Lupa Password?</h3>
        <p class="mt-1">
          Silakan hubungi administrator UT atau masukkan email Anda untuk reset
          password.
        </p>
        <div class="form-group mt-2">
          <input v-model="requestEmail" type="email" placeholder="Email Anda" />
        </div>
        <button class="btn" @click="sendResetRequest">Kirim Permintaan</button>
      </div>
    </div>

    <div
      v-show="showRegisterModal"
      id="modalDaftar"
      class="modal-overlay"
      @click.self="closeRegisterModal"
    >
      <div class="modal-content">
        <span id="closeDaftar" class="close-btn" @click="closeRegisterModal">&times;</span>
        <h3>Daftar Akun</h3>
        <p class="mt-1">Pendaftaran mahasiswa baru dilakukan melalui admisi UT.</p>
        <button class="btn mt-2" @click="showRegistrationInfo">Info Pendaftaran</button>
      </div>
    </div>
  </div>
</template>
