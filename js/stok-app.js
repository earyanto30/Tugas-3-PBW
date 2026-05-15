// load data dari json
async function loadDummyData() {
  const response = await fetch("./js/dataBahanAjar.json");
  if (!response.ok) return {};
  return response.json();
}

function initStokApp(seedData) {
  Vue.createApp({
  // load data ke vue
  data() {
    return {
      upbjjList: [...(seedData.upbjjList || [])],
      kategoriList: [...(seedData.kategoriList || [])],
      stok: (seedData.stok || []).map((item, index) => ({
        id: index + 1,
        ...item
      })),
      filters: {
        upbjj: "",
        kategori: "",
        reorder: ""
      },
      sortBy: "judul",
      editingId: null,
      errorMessage: "",
      form: {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        lokasiRak: "",
        harga: 0,
        qty: 0,
        safety: 0,
        catatanHTML: ""
      }
    };
  },

  computed: {
    // produce data buat list option di kategori
    kategoriOptions() {
      if (!this.filters.upbjj) {
        return this.kategoriList;
      }
      const kategoriTersedia = this.stok
        .filter((item) => item.upbjj === this.filters.upbjj)
        .map((item) => item.kategori);
      return [...new Set(kategoriTersedia)];
    },

    // produce filtered data dari filter function 
    filteredStok() {
      const hasilFilter = this.stok.filter((item) => {
        if (this.filters.upbjj && item.upbjj !== this.filters.upbjj) return false;
        if (this.filters.kategori && item.kategori !== this.filters.kategori) return false;
        if (this.filters.reorder === "lt-safety" && !(Number(item.qty) < Number(item.safety))) return false;
        if (this.filters.reorder === "empty" && Number(item.qty) !== 0) return false;
        return true;
      });

      return hasilFilter.slice().sort((a, b) => {
        if (this.sortBy === "judul") {
          return a.judul.localeCompare(b.judul, "id");
        }
        if (this.sortBy === "qty") {
          return Number(a.qty) - Number(b.qty);
        }
        return Number(a.harga) - Number(b.harga);
      });
    }
  },

  watch: {
    // listen ke option kategori 
    "filters.upbjj"() {
      this.filters.kategori = "";
    },

    // listen ke qty input
    "form.qty"(value) {
      if (value < 0) {
        this.form.qty = 0;
      }
    }
  },

  methods: {
    // logic status stok
    statusStok(item) {
      const qty = Number(item.qty) || 0;
      const safety = Number(item.safety) || 0;
      if (qty === 0) return "kosong";
      if (qty < safety) return "menipis";
      return "aman";
    },

    formatRupiah(nilai) {
      return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(nilai) || 0);
    },

    // action reset filter button
    resetFilters() {
      this.filters.upbjj = "";
      this.filters.kategori = "";
      this.filters.reorder = "";
      this.sortBy = "judul";
    },

    // action reset form
    resetForm() {
      this.form = {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        lokasiRak: "",
        harga: 0,
        qty: 0,
        safety: 0,
        catatanHTML: ""
      };
      this.errorMessage = "";
    },
    
    // logic validation buat inputan
    validateForm() {
      if (!this.form.kode || !this.form.judul || !this.form.kategori || !this.form.upbjj || !this.form.lokasiRak) {
        this.errorMessage = "Semua field wajib diisi.";
        return false;
      }
      if (Number(this.form.harga) < 0 || Number(this.form.qty) < 0 || Number(this.form.safety) < 0) {
        this.errorMessage = "Harga, qty, dan safety tidak boleh negatif.";
        return false;
      }
      this.errorMessage = "";
      return true;
    },

    // action submit
    submitForm() {
      // validate input sebelum submit
      if (!this.validateForm()) return;
      if (this.editingId) {
        const index = this.stok.findIndex((item) => item.id === this.editingId);
        if (index !== -1) {
          this.stok[index] = { ...this.stok[index], ...this.form };
        }
      } else {
        const newId = this.stok.length ? Math.max(...this.stok.map((item) => item.id)) + 1 : 1;
        this.stok.push({ id: newId, ...this.form });
      }
      this.cancelEdit();
    },

    // action edit place existing data ke form nya 
    startEdit(item) {
      this.editingId = item.id;
      this.form = {
        kode: item.kode,
        judul: item.judul,
        kategori: item.kategori,
        upbjj: item.upbjj,
        lokasiRak: item.lokasiRak,
        harga: Number(item.harga),
        qty: Number(item.qty),
        safety: Number(item.safety),
        catatanHTML: item.catatanHTML
      };
      this.errorMessage = "";
    },

    // action cancel
    cancelEdit() {
      this.editingId = null;
      this.resetForm();
    }
  }

  // mount dom nya
  }).mount("#stokApp");
}

loadDummyData().then((seedData) => {
  initStokApp(seedData);
}).catch(() => {
  initStokApp({ upbjjList: [], kategoriList: [], stok: [] });
});
