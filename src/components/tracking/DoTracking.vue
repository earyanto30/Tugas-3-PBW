<script setup>
defineProps({
  deliveryOrders: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <section>
    <h3>Tracking DO</h3>
    <p class="mt-1">Halaman tracking delivery order akan ditampilkan di sini.</p>
    <p class="mt-1">Data layanan: {{ deliveryOrders.length }} delivery order.</p>
  </section>
</template>
