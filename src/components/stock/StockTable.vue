<script setup>
import StatusBadge from './StatusBadge.vue';

defineProps({
  stockItems: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['edit-stock', 'ask-delete']);

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(value) || 0);
}

function tooltipText(item) {
  const plain = String(item?.catatanHTML ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plain || 'Tidak ada catatan';
}
</script>

<template>
  <table id="tabelStok">
    <thead>
      <tr>
        <th>Kode</th>
        <th>Judul</th>
        <th>Kategori</th>
        <th>UPBJJ</th>
        <th>Lokasi Rak</th>
        <th>Harga</th>
        <th>Qty</th>
        <th>Safety</th>
        <th>Status</th>
        <th>Catatan</th>
        <th>Aksi</th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="stockItems.length === 0">
        <td colspan="11">Data tidak ditemukan.</td>
      </tr>
      <tr v-for="item in stockItems" :key="item.kode">
        <td v-text="item.kode"></td>
        <td v-text="item.judul"></td>
        <td v-text="item.kategori"></td>
        <td v-text="item.upbjj"></td>
        <td v-text="item.lokasiRak"></td>
        <td v-text="formatRupiah(item.harga)"></td>
        <td v-text="`${item.qty} buah`"></td>
        <td v-text="`${item.safety} buah`"></td>
        <td><StatusBadge :qty="Number(item.qty)" :safety="Number(item.safety)" /></td>
        <td>
          <span :title="tooltipText(item)" v-html="item.catatanHTML || '-'"></span>
        </td>
        <td>
          <button class="btn btn-primary" style="margin-right: 6px" @click="emit('edit-stock', item)">Edit</button>
          <button class="btn" @click="emit('ask-delete', item)">Hapus</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
