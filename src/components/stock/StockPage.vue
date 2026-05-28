<script setup>
import StatusBadge from './StatusBadge.vue';

defineProps({
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
</script>

<template>
  <section>
    <h3>Stok Bahan Ajar</h3>
    <p class="mt-1">Halaman stok akan ditampilkan di sini.</p>
    <p class="mt-1">
      Data layanan: {{ stockData.length }} item stok, {{ packageData.length }} paket,
      {{ masterData.upbjjList.length }} UPBJJ.
    </p>
    <div class="mt-1">
      <strong>Preview Status Stok:</strong>
      <StatusBadge v-if="stockData.length" :qty="stockData[0].qty" :safety="stockData[0].safety" />
      <span v-else>-</span>
    </div>
  </section>
</template>
