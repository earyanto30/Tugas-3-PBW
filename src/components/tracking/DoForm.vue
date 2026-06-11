<script setup>
import { computed, reactive, watch } from 'vue';

const props = defineProps({
  nextDoNumber: {
    type: String,
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
});

const emit = defineEmits(['create-delivery-order']);

const form = reactive(createInitialForm());
const errors = reactive({
  nomorDO: '',
  nim: '',
  nama: '',
  ekspedisi: '',
  paket: '',
  tanggalKirim: '',
});

const selectedPackage = computed(
  () => props.packageData.find((item) => item.kode === form.paket) ?? null,
);
const formattedTanggalKirim = computed(() => formatTanggalIndonesia(form.tanggalKirim));
const totalPriceLabel = computed(() => formatRupiah(form.total));
const doPreviewLabel = computed(() => form.nomorDO || props.nextDoNumber);

watch(
  () => props.nextDoNumber,
  (value) => {
    form.nomorDO = value;
  },
  { immediate: true },
);

watch(
  selectedPackage,
  (paket) => {
    form.total = paket?.harga ?? 0;
  },
  { immediate: true },
);

function createInitialForm() {
  return {
    nomorDO: '',
    nim: '',
    nama: '',
    ekspedisi: '',
    paket: '',
    tanggalKirim: getTodayLocalDate(),
    total: 0,
  };
}

function getTodayLocalDate() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatTanggalIndonesia(value) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function clearErrors() {
  Object.keys(errors).forEach((key) => {
    errors[key] = '';
  });
}

function validateRequired(field, label) {
  if (String(form[field] ?? '').trim() === '') {
    errors[field] = `${label} wajib diisi.`;
    return false;
  }

  return true;
}

function validateForm() {
  clearErrors();

  const doNumberValid = /^DO\d{4}-\d{3}$/.test(String(form.nomorDO ?? '').trim());
  if (!doNumberValid) {
    errors.nomorDO = 'Nomor DO otomatis tidak valid.';
  }

  const checks = [
    doNumberValid,
    validateRequired('nim', 'NIM'),
    validateRequired('nama', 'Nama mahasiswa'),
    validateRequired('ekspedisi', 'Ekspedisi'),
    validateRequired('paket', 'Paket bahan ajar'),
    validateRequired('tanggalKirim', 'Tanggal kirim'),
  ];

  return checks.every(Boolean);
}

function resetForm() {
  form.nomorDO = props.nextDoNumber;
  form.nim = '';
  form.nama = '';
  form.ekspedisi = '';
  form.paket = '';
  form.tanggalKirim = getTodayLocalDate();
  form.total = 0;
  clearErrors();
}

function submitForm() {
  if (!validateForm()) return;

  emit('create-delivery-order', {
    nomorDO: String(form.nomorDO).trim(),
    nim: String(form.nim).trim(),
    nama: String(form.nama).trim(),
    status: 'Menunggu Diproses',
    ekspedisi: String(form.ekspedisi).trim(),
    tanggalKirim: form.tanggalKirim,
    paket: String(form.paket).trim(),
    total: Number(form.total) || 0,
    perjalanan: [],
  });

  resetForm();
}
</script>

<template>
  <div class="card mt-2">
    <h3>Tambah Delivery Order Baru</h3>
    <form class="mt-1" @submit.prevent="submitForm" @keyup.enter="submitForm">
      <div class="form-group">
        <label>Nomor DO (Otomatis)</label>
        <input :value="form.nomorDO" type="text" readonly />
        <p class="mt-1">
          Format DO: <strong v-text="doPreviewLabel"></strong>
        </p>
        <p v-if="errors.nomorDO" style="color: red" v-text="errors.nomorDO"></p>
      </div>

      <div class="form-group">
        <label>NIM</label>
        <input v-model.trim="form.nim" type="text" required placeholder="Contoh: 123456789" />
        <p v-if="errors.nim" style="color: red" v-text="errors.nim"></p>
      </div>

      <div class="form-group">
        <label>Nama</label>
        <input v-model.trim="form.nama" type="text" required placeholder="Nama mahasiswa" />
        <p v-if="errors.nama" style="color: red" v-text="errors.nama"></p>
      </div>

      <div class="form-group">
        <label>Ekspedisi</label>
        <select v-model="form.ekspedisi" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px">
          <option value="">Pilih Ekspedisi</option>
          <option
            v-for="item in deliveryOptions"
            :key="item.kode"
            :value="item.nama"
            v-text="`${item.kode} - ${item.nama}`"
          ></option>
        </select>
        <p v-if="errors.ekspedisi" style="color: red" v-text="errors.ekspedisi"></p>
      </div>

      <div class="form-group">
        <label>Paket Bahan Ajar</label>
        <select v-model="form.paket" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px">
          <option value="">Pilih Paket</option>
          <option
            v-for="item in packageData"
            :key="item.kode"
            :value="item.kode"
            v-text="`${item.kode} - ${item.nama}`"
          ></option>
        </select>
        <p v-if="errors.paket" style="color: red" v-text="errors.paket"></p>
      </div>

      <div v-show="selectedPackage" class="form-group">
        <label>Detail Isi Paket</label>
        <p><strong>Kode Paket:</strong> <span v-text="selectedPackage?.kode ?? '-'"></span></p>
        <p><strong>Nama Paket:</strong> <span v-text="selectedPackage?.nama ?? '-'"></span></p>
        <p><strong>Isi:</strong> <span v-text="selectedPackage ? selectedPackage.isi.join(', ') : '-'"></span></p>
        <p><strong>Total Paket:</strong> <span v-text="totalPriceLabel"></span></p>
      </div>

      <div class="form-group">
        <label>Tanggal Kirim</label>
        <input v-model="form.tanggalKirim" type="date" required />
        <p class="mt-1">Format Indonesia: <strong v-text="formattedTanggalKirim"></strong></p>
        <p v-if="errors.tanggalKirim" style="color: red" v-text="errors.tanggalKirim"></p>
      </div>

      <div class="form-group">
        <label>Total Harga</label>
        <input :value="totalPriceLabel" type="text" readonly />
      </div>

      <div v-if="selectedPackage" class="form-group">
        <label>Preview Delivery Order</label>
        <p><strong>Nomor DO:</strong> <span v-text="doPreviewLabel"></span></p>
        <p><strong>Tanggal Kirim:</strong> <span v-text="formattedTanggalKirim"></span></p>
        <p><strong>Nama Paket:</strong> <span v-text="selectedPackage.nama"></span></p>
        <p><strong>Total Bayar:</strong> <span v-text="totalPriceLabel"></span></p>
      </div>

      <p v-if="Object.values(errors).some(Boolean)" style="color: red">Periksa input form sebelum simpan.</p>
      <button type="submit" class="btn btn-primary">Simpan DO</button>
    </form>
  </div>
</template>
