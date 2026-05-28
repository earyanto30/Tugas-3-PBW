<script setup>
import { computed } from 'vue';

const props = defineProps({
  qty: {
    type: Number,
    required: true,
  },
  safety: {
    type: Number,
    required: true,
  },
});

const status = computed(() => {
  if (props.qty === 0) {
    return 'kosong';
  }

  if (props.qty < props.safety) {
    return 'menipis';
  }

  return 'aman';
});
</script>

<template>
  <span v-if="status === 'kosong'" class="status-badge status-kosong">Kosong</span>
  <span v-else-if="status === 'menipis'" class="status-badge status-menipis">Menipis</span>
  <span v-else class="status-badge status-aman">Aman</span>
</template>

<style scoped>
.status-badge {
  font-weight: bold;
}

.status-kosong {
  color: red;
}

.status-menipis {
  color: #c49a00;
}

.status-aman {
  color: green;
}
</style>
