<script setup>
defineProps({
  form: {
    type: Object,
    required: true,
  },
  showForgotModal: {
    type: Boolean,
    required: true,
  },
  showRegisterModal: {
    type: Boolean,
    required: true,
  },
  requestEmail: {
    type: String,
    required: true,
  },
});

const emit = defineEmits([
  'submit-login',
  'open-forgot-modal',
  'open-register-modal',
  'close-forgot-modal',
  'close-register-modal',
  'update:requestEmail',
  'send-reset-request',
  'show-registration-info',
]);
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <img src="/assets/images/logo.png" alt="UT Logo" style="max-width: 150px; margin-bottom: 15px" />
      <h2>Sistem Bahan Ajar UT</h2>
      <form id="loginForm" @submit.prevent="emit('submit-login')">
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="form.email" type="email" required placeholder="Masukkan email anda" />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            placeholder="Masukkan password anda"
          />
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%">Login</button>
      </form>

      <div class="auth-links">
        <a id="lupaPasswordBtn" @click="emit('open-forgot-modal')">Lupa password?</a> |
        <a id="daftarBtn" @click="emit('open-register-modal')">Daftar akun baru</a>
      </div>
    </div>
  </div>

  <div
    v-show="showForgotModal"
    id="modalLupaPassword"
    class="modal-overlay"
    @click.self="emit('close-forgot-modal')"
  >
    <div class="modal-content">
      <span id="closeLupaPassword" class="close-btn" @click="emit('close-forgot-modal')">&times;</span>
      <h3>Lupa Password?</h3>
      <p class="mt-1">Silakan hubungi administrator UT atau masukkan email Anda untuk reset password.</p>
      <div class="form-group mt-2">
        <input
          :value="requestEmail"
          type="email"
          placeholder="Email Anda"
          @input="emit('update:requestEmail', $event.target.value)"
        />
      </div>
      <button class="btn" @click="emit('send-reset-request')">Kirim Permintaan</button>
    </div>
  </div>

  <div
    v-show="showRegisterModal"
    id="modalDaftar"
    class="modal-overlay"
    @click.self="emit('close-register-modal')"
  >
    <div class="modal-content">
      <span id="closeDaftar" class="close-btn" @click="emit('close-register-modal')">&times;</span>
      <h3>Daftar Akun</h3>
      <p class="mt-1">Pendaftaran mahasiswa baru dilakukan melalui admisi UT.</p>
      <button class="btn mt-2" @click="emit('show-registration-info')">Info Pendaftaran</button>
    </div>
  </div>
</template>
