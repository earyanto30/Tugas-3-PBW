<script setup>
defineProps({
  greetingMessage: {
    type: String,
    required: true,
  },
  loggedInUser: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div class="card text-center">
    <h1>{{ greetingMessage }}</h1>
    <p class="mt-1">Anda login sebagai {{ loggedInUser.nama }} ({{ loggedInUser.role }})</p>
  </div>
</template>
