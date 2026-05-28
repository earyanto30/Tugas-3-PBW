<script setup>
defineEmits(['logout']);
</script>

<template>
  <nav class="navbar">
    <a href="#" class="brand" style="display: flex; align-items: center">
      <img src="/assets/images/logo.png" alt="UT Logo" style="height: 30px; margin-right: 10px" />
      Sistem Bahan Ajar UT
    </a>
    <ul class="nav-links">
      <li><a href="#">Informasi Bahan Ajar</a></li>
      <li><a href="#">Tracking Pengiriman</a></li>
      <li class="dropdown">
        <a href="#">Laporan &#9662;</a>
        <div class="dropdown-content">
          <a href="#">Monitoring progress DO</a>
          <a href="#">Rekap bahan ajar</a>
        </div>
      </li>
      <li><a href="#">Histori Transaksi</a></li>
      <li><a href="#" @click.prevent="$emit('logout')">Logout</a></li>
    </ul>
  </nav>
</template>
