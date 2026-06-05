<script setup>
import { computed, ref, watch } from 'vue';
import DoForm from './DoForm.vue';

const props = defineProps({
  deliveryOrders: {
    type: Array,
    required: true,
  },
  packageData: {
    type: Array,
    default: () => [],
  },
  deliveryOptions: {
    type: Array,
    default: () => [],
  },
  nextDoNumber: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['create-delivery-order']);

const searchKeyword = ref('');
const hasSearched = ref(false);
const selectedNomorDO = ref('');

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
});

const formattedDeliveryOrders = computed(() =>
  props.deliveryOrders.map((item) => ({
    ...item,
    searchKey: `${item.nomorDO} ${item.nim}`.toLowerCase(),
  })),
);

const searchResults = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();
  if (!hasSearched.value) {
    return [];
  }

  if (!keyword) {
    return formattedDeliveryOrders.value;
  }

  return formattedDeliveryOrders.value.filter((item) => item.searchKey.includes(keyword));
});

const selectedTracking = computed(() => {
  if (!selectedNomorDO.value) {
    return null;
  }

  return searchResults.value.find((item) => item.nomorDO === selectedNomorDO.value) ?? null;
});

const selectedPackage = computed(() => {
  if (!selectedTracking.value?.paket) {
    return null;
  }

  return props.packageData.find((item) => item.kode === selectedTracking.value.paket) ?? null;
});

const resultMessage = computed(() => {
  if (!hasSearched.value) {
    return 'Masukkan nomor DO atau NIM untuk mulai pencarian.';
  }

  if (searchResults.value.length === 0) {
    return 'Data delivery order tidak ditemukan.';
  }

  return `Ditemukan ${searchResults.value.length} data delivery order.`;
});

watch(
  () => props.deliveryOrders,
  () => {
    if (!selectedNomorDO.value) {
      return;
    }

    const stillExists = props.deliveryOrders.some((item) => item.nomorDO === selectedNomorDO.value);
    if (!stillExists) {
      selectedNomorDO.value = '';
    }
  },
  { deep: true },
);

watch(searchResults, (results) => {
  if (results.length === 0) {
    selectedNomorDO.value = '';
    return;
  }

  const selectedExists = results.some((item) => item.nomorDO === selectedNomorDO.value);
  if (!selectedExists) {
    selectedNomorDO.value = results[0].nomorDO;
  }
});

function runSearch() {
  hasSearched.value = true;
}

function clearSearch() {
  searchKeyword.value = '';
  hasSearched.value = false;
  selectedNomorDO.value = '';
}

function selectTracking(nomorDO) {
  selectedNomorDO.value = nomorDO;
}

function formatRupiah(value) {
  return rupiahFormatter.format(Number(value) || 0);
}

function formatTanggalIndonesia(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function handleCreateDeliveryOrder(payload) {
  emit('create-delivery-order', payload);
}
</script>

<template>
  <section>
    <div class="card text-center">
      <h3>Lacak Pengiriman Bahan Ajar</h3>
      <p class="mt-1">Masukkan nomor delivery order (DO) atau NIM untuk melihat status pengiriman.</p>

      <div class="form-group mt-2" style="max-width: 400px; margin: 20px auto; text-align: center">
        <input
          v-model.trim="searchKeyword"
          type="text"
          placeholder="Contoh: DO2025-0001 / 123456789"
          @keyup.enter="runSearch"
          @keyup.esc="clearSearch"
        />
        <div class="mt-1" style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap">
          <button class="btn btn-primary" style="min-width: 140px" @click="runSearch">Cari</button>
          <button class="btn" type="button" @click="clearSearch">Reset</button>
        </div>
      </div>

      <p class="mt-1" v-text="resultMessage"></p>
    </div>

    <div v-if="hasSearched && searchResults.length" class="card mt-2">
      <h3>Hasil Pencarian DO</h3>
      <p class="mt-1">Klik salah satu hasil untuk melihat detail pengiriman dan riwayat perjalanan.</p>

      <table>
        <thead>
          <tr>
            <th>Nomor DO</th>
            <th>NIM</th>
            <th>Nama</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in searchResults"
            :key="item.nomorDO"
            :style="item.nomorDO === selectedNomorDO ? { backgroundColor: '#f1f1f1' } : undefined"
            @click="selectTracking(item.nomorDO)"
          >
            <td v-text="item.nomorDO"></td>
            <td v-text="item.nim"></td>
            <td v-text="item.nama"></td>
            <td v-text="item.status"></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="selectedTracking">
      <div class="card mt-2">
        <h3>Informasi Paket</h3>
        <table style="margin-top: 10px">
          <tbody>
            <tr>
              <th style="width: 30%">Nomor DO</th>
              <td v-text="selectedTracking.nomorDO"></td>
            </tr>
            <tr>
              <th>NIM</th>
              <td v-text="selectedTracking.nim"></td>
            </tr>
            <tr>
              <th>Nama Mahasiswa</th>
              <td v-text="selectedTracking.nama"></td>
            </tr>
            <tr>
              <th>Status Pengiriman</th>
              <td style="font-weight: bold; color: var(--ut-blue)" v-text="selectedTracking.status"></td>
            </tr>
            <tr>
              <th>Detail Ekspedisi</th>
              <td v-text="selectedTracking.ekspedisi"></td>
            </tr>
            <tr>
              <th>Tanggal Kirim</th>
              <td v-text="formatTanggalIndonesia(selectedTracking.tanggalKirim)"></td>
            </tr>
            <tr>
              <th>Jenis Paket</th>
              <td v-text="selectedTracking.paket"></td>
            </tr>
            <tr v-if="selectedPackage">
              <th>Nama Paket</th>
              <td v-text="selectedPackage.nama"></td>
            </tr>
            <tr v-if="selectedPackage">
              <th>Isi Paket</th>
              <td v-text="selectedPackage.isi.join(', ')"></td>
            </tr>
            <tr>
              <th>Total Pembayaran</th>
              <td v-text="formatRupiah(selectedTracking.total)"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card mt-2">
        <h3>Riwayat Perjalanan (Tracking)</h3>
        <ul v-if="selectedTracking.perjalanan.length" class="timeline" style="padding-left: 20px">
          <li v-for="(item, idx) in selectedTracking.perjalanan" :key="`${selectedTracking.nomorDO}-${idx}`" class="mt-1">
            <strong v-text="item.waktu"></strong> - <span v-text="item.keterangan"></span>
          </li>
        </ul>
        <p v-else class="mt-1">Belum ada riwayat perjalanan.</p>
      </div>
    </div>

    <DoForm
      :next-do-number="nextDoNumber"
      :package-data="packageData"
      :delivery-options="deliveryOptions"
      @create-delivery-order="handleCreateDeliveryOrder"
    />

    <div class="card mt-2">
      <h3>Tambah Progress Pengiriman</h3>
      <p class="mt-1">Area form progress disiapkan untuk Step 13. Detail tracking sudah tampil dari hasil pencarian.</p>
    </div>
  </section>
</template>
