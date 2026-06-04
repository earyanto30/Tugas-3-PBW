<script setup>
import { computed, reactive, ref, watch } from 'vue';
import AppModal from '../shared/AppModal.vue';
import StockForm from './StockForm.vue';
import StockTable from './StockTable.vue';

const props = defineProps({
  stockData: {
    type: Array,
    required: true,
  },
  packageData: {
    type: Array,
    required: true,
  },
  masterData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['create-stock', 'update-stock', 'delete-stock']);

const filters = reactive({
  upbjj: '',
  kategori: '',
  reorder: '',
});

const sortBy = ref('judul');
const editingKode = ref('');
const selectedItem = ref(null);
const deleteTarget = ref(null);

const upbjjOptions = computed(() => props.masterData?.upbjjList ?? []);

const kategoriOptions = computed(() => {
  if (!filters.upbjj) {
    return [];
  }

  const fromStock = props.stockData
    .filter((item) => item.upbjj === filters.upbjj)
    .map((item) => item.kategori)
    .filter(Boolean);

  return [...new Set(fromStock)].sort((a, b) => a.localeCompare(b, 'id'));
});

const filteredAndSortedStock = computed(() => {
  let result = [...props.stockData];

  if (filters.upbjj) {
    result = result.filter((item) => item.upbjj === filters.upbjj);
  }
  if (filters.kategori) {
    result = result.filter((item) => item.kategori === filters.kategori);
  }
  if (filters.reorder === 'lt-safety') {
    result = result.filter((item) => Number(item.qty) < Number(item.safety));
  } else if (filters.reorder === 'empty') {
    result = result.filter((item) => Number(item.qty) === 0);
  }

  result.sort((a, b) => {
    if (sortBy.value === 'qty') return Number(a.qty) - Number(b.qty);
    if (sortBy.value === 'harga') return Number(a.harga) - Number(b.harga);
    return String(a.judul ?? '').localeCompare(String(b.judul ?? ''), 'id');
  });

  return result;
});

watch(
  () => filters.upbjj,
  () => {
    filters.kategori = '';
  },
);

function resetFilters() {
  filters.upbjj = '';
  filters.kategori = '';
  filters.reorder = '';
  sortBy.value = 'judul';
}

function startEdit(item) {
  editingKode.value = item.kode;
  selectedItem.value = { ...item };
}

function cancelEdit() {
  editingKode.value = '';
  selectedItem.value = null;
}

function handleFormSubmit({ mode, originalKode, payload }) {
  if (mode === 'update' && originalKode) {
    emit('update-stock', originalKode, payload);
    cancelEdit();
    return;
  }

  emit('create-stock', payload);
}

function askDelete(item) {
  deleteTarget.value = item;
}

function confirmDelete() {
  if (!deleteTarget.value) return;
  emit('delete-stock', deleteTarget.value.kode);
  deleteTarget.value = null;
}

function cancelDelete() {
  deleteTarget.value = null;
}
</script>

<template>
  <section>
    <h3>Stok Bahan Ajar</h3>
    <div class="mt-1">
      <strong>Total Data:</strong> <span v-text="filteredAndSortedStock.length"></span>
    </div>

    <div class="mt-2">
      <h3>Filter dan Urutkan</h3>
      <div class="form-group">
        <label>UT Daerah (UPBJJ)</label>
        <select
          v-model="filters.upbjj"
          style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px"
        >
          <option value="">Semua UPBJJ</option>
          <option v-for="item in upbjjOptions" :key="item" :value="item" v-text="item"></option>
        </select>
      </div>

      <div v-show="filters.upbjj" class="form-group">
        <label>Kategori Mata Kuliah</label>
        <select
          v-model="filters.kategori"
          style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px"
        >
          <option value="">Semua Kategori</option>
          <option v-for="item in kategoriOptions" :key="item" :value="item" v-text="item"></option>
        </select>
      </div>

      <div class="form-group">
        <label>Status Reorder</label>
        <select
          v-model="filters.reorder"
          style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px"
        >
          <option value="">Semua</option>
          <option value="lt-safety">Qty &lt; Safety</option>
          <option value="empty">Qty = 0</option>
        </select>
      </div>

      <div class="form-group">
        <label>Urutkan Berdasarkan</label>
        <select v-model="sortBy" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px">
          <option value="judul">Judul</option>
          <option value="qty">Stok</option>
          <option value="harga">Harga</option>
        </select>
      </div>

      <button class="btn" @click="resetFilters">Reset Filter</button>
    </div>

    <StockTable
      :stock-items="filteredAndSortedStock"
      @edit-stock="startEdit"
      @ask-delete="askDelete"
    />

    <StockForm
      :selected-item="selectedItem"
      :mode="editingKode ? 'update' : 'create'"
      :master-data="masterData"
      @submit="handleFormSubmit"
      @cancel="cancelEdit"
    />

    <AppModal :show="Boolean(deleteTarget)" title="Konfirmasi Hapus" @close="cancelDelete">
      <p v-if="deleteTarget" class="mt-1">
        Hapus stok <strong>{{ deleteTarget.judul }}</strong> ({{ deleteTarget.kode }})?
      </p>

      <template #footer>
        <button class="btn btn-primary" style="margin-right: 8px" @click="confirmDelete">Ya, Hapus</button>
        <button class="btn" @click="cancelDelete">Batal</button>
      </template>
    </AppModal>
  </section>
</template>
