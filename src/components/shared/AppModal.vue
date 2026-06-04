<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['close']);

function closeModal() {
  emit('close');
}
</script>

<template>
  <div v-show="show" class="modal-overlay" style="display: flex" @click.self="closeModal">
    <div class="modal-content" role="dialog" aria-modal="true" :aria-label="title || 'Modal dialog'">
      <h3 v-if="title" v-text="title"></h3>
      <div :class="{ 'mt-1': title }">
        <slot />
      </div>
      <div v-if="$slots.footer" class="mt-2">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
