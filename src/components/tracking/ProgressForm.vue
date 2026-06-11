<script setup>
import { computed, reactive, watch } from 'vue';

const props = defineProps({
  selectedTracking: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['add-progress']);

const form = reactive({
  waktu: createTimestamp(),
  keterangan: '',
});

const errorMessage = computed(() => {
  if (!props.selectedTracking) {
    return 'Pilih salah satu delivery order dari hasil pencarian untuk menambah progress.';
  }

  return '';
});

watch(
  () => props.selectedTracking?.nomorDO,
  () => {
    resetForm();
  },
);

function createTimestamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');

  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
  ].join('-') + ` ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function resetForm() {
  form.waktu = createTimestamp();
  form.keterangan = '';
}

function submitForm() {
  if (!props.selectedTracking) {
    return;
  }

  if (!String(form.keterangan).trim()) {
    return;
  }

  emit('add-progress', props.selectedTracking.nomorDO, {
    waktu: form.waktu,
    keterangan: String(form.keterangan).trim(),
  });

  resetForm();
}
</script>

<template>
  <div class="card mt-2">
    <h3>Tambah Progress Pengiriman</h3>
    <p class="mt-1">
      Tambahkan riwayat perjalanan baru untuk delivery order yang sedang dipilih.
    </p>

    <form class="mt-1" @submit.prevent="submitForm" @keyup.enter.ctrl="submitForm">
      <div class="form-group">
        <label>Nomor DO Terpilih</label>
        <input :value="selectedTracking?.nomorDO ?? '-'" type="text" readonly />
      </div>

      <div class="form-group">
        <label>Timestamp Otomatis</label>
        <input :value="form.waktu" type="text" readonly />
      </div>

      <div class="form-group">
        <label>Keterangan Progress</label>
        <input
          v-model.trim="form.keterangan"
          type="text"
          :disabled="!selectedTracking"
          placeholder="Contoh: Paket tiba di hub tujuan"
        />
      </div>

      <p v-if="errorMessage" style="color: red" v-text="errorMessage"></p>
      <p v-else-if="!form.keterangan.trim()" style="color: red">
        Keterangan progress wajib diisi.
      </p>
      <p v-else style="color: var(--ut-blue)">
        Progress akan disimpan dengan waktu otomatis saat ini.
      </p>

      <button type="submit" class="btn btn-primary" :disabled="!selectedTracking">
        Simpan Progress
      </button>
    </form>
  </div>
</template>
