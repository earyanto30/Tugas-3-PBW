<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import LoginPage from './components/auth/LoginPage.vue';
import DashboardHome from './components/dashboard/DashboardHome.vue';
import AppNavbar from './components/layout/AppNavbar.vue';
import StockPage from './components/stock/StockPage.vue';
import DoTracking from './components/tracking/DoTracking.vue';
import { dataPengguna } from '../data/data.js';
import {
  createDeliveryOrder,
  createStock,
  deleteDeliveryOrder,
  deleteStock,
  getRootData,
  updateDeliveryOrder,
  updateStock,
} from './services/api.js';

const form = reactive({ email: '', password: '' });
const showForgotModal = ref(false);
const showRegisterModal = ref(false);
const requestEmail = ref('');
const loggedInUser = ref(null);
const activeTab = ref('stock');

const stockData = ref([]);
const deliveryOrders = ref([]);
const packageData = ref([]);
const masterData = ref({ upbjjList: [], kategoriList: [], pengirimanList: [] });
const isLoading = ref(false);
const errorMessage = ref('');

const currentHour = new Date().getHours();
const greetingMessage = computed(() => {
  if (currentHour >= 0 && currentHour < 11) return 'Selamat Pagi!';
  if (currentHour >= 11 && currentHour < 15) return 'Selamat Siang!';
  return 'Selamat Sore!';
});

function applyRootData(rootData) {
  stockData.value = rootData.stok ?? [];
  deliveryOrders.value = Object.values(rootData.tracking ?? {});
  packageData.value = rootData.paket ?? [];
  masterData.value = {
    upbjjList: rootData.upbjjList ?? [],
    kategoriList: rootData.kategoriList ?? [],
    pengirimanList: rootData.pengirimanList ?? [],
  };
}

function loadRootData() {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    applyRootData(getRootData());
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Gagal memuat data aplikasi.';
  } finally {
    isLoading.value = false;
  }
}

function refreshAfterMutation(mutationFn) {
  try {
    mutationFn();
    loadRootData();
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Terjadi kesalahan saat memperbarui data.';
  }
}

function handleCreateStock(payload) {
  refreshAfterMutation(() => createStock(payload));
}
function handleUpdateStock(kode, payload) {
  refreshAfterMutation(() => updateStock(kode, payload));
}
function handleDeleteStock(kode) {
  refreshAfterMutation(() => deleteStock(kode));
}
function handleCreateDeliveryOrder(payload) {
  refreshAfterMutation(() => createDeliveryOrder(payload));
}
function handleUpdateDeliveryOrder(nomorDO, payload) {
  refreshAfterMutation(() => updateDeliveryOrder(nomorDO, payload));
}
function handleDeleteDeliveryOrder(nomorDO) {
  refreshAfterMutation(() => deleteDeliveryOrder(nomorDO));
}

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

onMounted(() => {
  loadRootData();
});
</script>

<template>
  <div>
    <LoginPage
      v-if="!loggedInUser"
      :form="form"
      :show-forgot-modal="showForgotModal"
      :show-register-modal="showRegisterModal"
      :request-email="requestEmail"
      @submit-login="submitLogin"
      @open-forgot-modal="showForgotModal = true"
      @open-register-modal="showRegisterModal = true"
      @close-forgot-modal="closeForgotModal"
      @close-register-modal="closeRegisterModal"
      @update:request-email="requestEmail = $event"
      @send-reset-request="sendResetRequest"
      @show-registration-info="showRegistrationInfo"
    />

    <div v-else>
      <AppNavbar @logout="logout" />

      <div class="container mt-3">
        <DashboardHome :greeting-message="greetingMessage" :logged-in-user="loggedInUser" />

        <div class="card mt-2">
          <h2>Dashboard</h2>
          <p class="mt-1">Pilih menu utama untuk mengelola data stok bahan ajar atau tracking DO.</p>

          <div class="nav-links" style="margin-top: 16px; gap: 10px">
            <a href="#" :class="{ active: activeTab === 'stock' }" @click.prevent="setActiveTab('stock')">
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

          <div v-if="isLoading" class="mt-2"><p>Memuat data...</p></div>
          <div v-else-if="errorMessage" class="mt-2"><p>{{ errorMessage }}</p></div>
          <div v-else class="mt-2">
            <StockPage
              v-if="activeTab === 'stock'"
              :stock-data="stockData"
              :package-data="packageData"
              :master-data="masterData"
              @create-stock="handleCreateStock"
              @update-stock="handleUpdateStock"
              @delete-stock="handleDeleteStock"
            />
            <DoTracking v-else :delivery-orders="deliveryOrders" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
