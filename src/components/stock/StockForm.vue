<script setup>
import { computed, reactive, watch } from 'vue';

const props = defineProps({
  selectedItem: {
    type: Object,
    default: null,
  },
  mode: {
    type: String,
    default: 'create',
  },
  masterData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['submit', 'cancel']);

const form = reactive(createInitialForm());
const errors = reactive({
  kode: '',
  judul: '',
  kategori: '',
  upbjj: '',
  lokasiRak: '',
  harga: '',
  qty: '',
  safety: '',
});

const isEditMode = computed(() => props.mode === 'update');
const kategoriOptions = computed(() => props.masterData?.kategoriList ?? []);
const upbjjOptions = computed(() => props.masterData?.upbjjList ?? []);
const formStatus = computed(() => {
  const qty = Number(form.qty);
  const safety = Number(form.safety);

  if (qty === 0) return 'Kosong';
  if (qty < safety) return 'Menipis';
  return 'Aman';
});

watch(
  () => props.selectedItem,
  (item) => {
    fillForm(item);
    clearErrors();
  },
  { immediate: true },
);

function createInitialForm() {
  return {
    kode: '',
    judul: '',
    kategori: '',
    upbjj: '',
    lokasiRak: '',
    harga: '',
    qty: '',
    safety: '',
    catatanHTML: '',
  };
}

function fillForm(item) {
  const source = item ?? createInitialForm();
  form.kode = source.kode ?? '';
  form.judul = source.judul ?? '';
  form.kategori = source.kategori ?? '';
  form.upbjj = source.upbjj ?? '';
  form.lokasiRak = source.lokasiRak ?? '';
  form.harga = source.harga ?? '';
  form.qty = source.qty ?? '';
  form.safety = source.safety ?? '';
  form.catatanHTML = source.catatanHTML ?? '';
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

function validateNumber(field, label) {
  const value = Number(form[field]);
  if (!Number.isFinite(value) || value < 0) {
    errors[field] = `${label} harus berupa angka valid.`;
    return false;
  }
  return true;
}

function validateForm() {
  clearErrors();

  const checks = [
    validateRequired('kode', 'Kode Mata Kuliah'),
    validateRequired('judul', 'Judul Mata Kuliah'),
    validateRequired('kategori', 'Kategori'),
    validateRequired('upbjj', 'UPBJJ'),
    validateRequired('lokasiRak', 'Lokasi Rak'),
    validateRequired('harga', 'Harga'),
    validateRequired('qty', 'Jumlah Stok'),
    validateRequired('safety', 'Stok Safety'),
    validateNumber('harga', 'Harga'),
    validateNumber('qty', 'Jumlah Stok'),
    validateNumber('safety', 'Stok Safety'),
  ];

  return checks.every(Boolean);
}

function normalizedPayload() {
  return {
    kode: String(form.kode).trim(),
    judul: String(form.judul).trim(),
    kategori: String(form.kategori).trim(),
    upbjj: String(form.upbjj).trim(),
    lokasiRak: String(form.lokasiRak).trim(),
    harga: Number(form.harga),
    qty: Number(form.qty),
    safety: Number(form.safety),
    catatanHTML: String(form.catatanHTML ?? '').trim(),
  };
}

function submitForm() {
  if (!validateForm()) return;

  emit('submit', {
    mode: props.mode,
    originalKode: props.selectedItem?.kode ?? '',
    payload: normalizedPayload(),
  });

  if (!isEditMode.value) {
    fillForm(null);
    clearErrors();
  }
}

function cancelEdit() {
  fillForm(props.selectedItem);
  clearErrors();
  emit('cancel');
}
</script>

<template>
  <div class="card mt-2">
    <h3 v-text="isEditMode ? 'Edit Stok' : 'Tambah Stok Baru'"></h3>
    <form class="mt-1" @submit.prevent="submitForm" @keydown.enter="submitForm">
      <div class="form-group">
        <label>Kode Mata Kuliah</label>
        <input
          v-model.trim="form.kode"
          type="text"
          :readonly="isEditMode"
          required
          placeholder="Contoh: EKMA4116"
        />
        <p v-if="errors.kode" style="color: red" v-text="errors.kode"></p>
      </div>

      <div class="form-group">
        <label>Judul Mata Kuliah</label>
        <input v-model.trim="form.judul" type="text" required placeholder="Contoh: Pengantar Manajemen" />
        <p v-if="errors.judul" style="color: red" v-text="errors.judul"></p>
      </div>

      <div class="form-group">
        <label>Kategori</label>
        <select v-model="form.kategori" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px">
          <option value="">Pilih Kategori</option>
          <option v-for="item in kategoriOptions" :key="item" :value="item" v-text="item"></option>
        </select>
        <p v-if="errors.kategori" style="color: red" v-text="errors.kategori"></p>
      </div>

      <div class="form-group">
        <label>UPBJJ</label>
        <select v-model="form.upbjj" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px">
          <option value="">Pilih UPBJJ</option>
          <option v-for="item in upbjjOptions" :key="item" :value="item" v-text="item"></option>
        </select>
        <p v-if="errors.upbjj" style="color: red" v-text="errors.upbjj"></p>
      </div>

      <div class="form-group">
        <label>Lokasi Rak</label>
        <input v-model.trim="form.lokasiRak" type="text" required placeholder="Contoh: R1-A1" />
        <p v-if="errors.lokasiRak" style="color: red" v-text="errors.lokasiRak"></p>
      </div>

      <div class="form-group">
        <label>Harga</label>
        <input v-model="form.harga" type="number" required min="0" placeholder="65000" />
        <p v-if="errors.harga" style="color: red" v-text="errors.harga"></p>
      </div>

      <div class="form-group">
        <label>Jumlah Stok</label>
        <input v-model="form.qty" type="number" required min="0" placeholder="100" />
        <p v-if="errors.qty" style="color: red" v-text="errors.qty"></p>
      </div>

      <div class="form-group">
        <label>Stok Safety</label>
        <input v-model="form.safety" type="number" required min="0" placeholder="20" />
        <p v-if="errors.safety" style="color: red" v-text="errors.safety"></p>
      </div>

      <div class="form-group">
        <label>Catatan (HTML sederhana)</label>
        <input v-model="form.catatanHTML" type="text" placeholder="Contoh: <em>Prioritas kirim</em>" />
      </div>

      <p v-if="Object.values(errors).some(Boolean)" style="color: red">Periksa input form sebelum simpan.</p>
      <p v-else style="color: var(--ut-blue)">
        Status otomatis: <strong v-text="formStatus"></strong>
      </p>

      <button type="submit" class="btn btn-primary" v-text="isEditMode ? 'Simpan Perubahan' : 'Tambah ke Tabel'"></button>
      <button type="button" class="btn mt-1" v-if="isEditMode" @click="cancelEdit">Batal Edit</button>
    </form>
  </div>
</template>
