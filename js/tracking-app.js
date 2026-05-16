// load data dari json
async function loadTrackingSeed() {
  const response = await fetch("./js/dataBahanAjar.json");
  if (!response.ok) return {};
  return response.json();
}

function initTrackingApp(seedData) {
  const ekspedisiOptions = ["JNE Regular", "JNE Express"];
  const trackingData = { ...(seedData.tracking || {}) };

  Vue.createApp({
    // load data ke vue
    data() {
      return {
        ekspedisiOptions,
        paketList: seedData.paket || [],
        tracking: trackingData,
        searchDO: "",
        searchError: "",
        selectedTracking: null,
        formError: "",
        newDO: {
          nomorDO: "",
          nim: "",
          nama: "",
          ekspedisi: "",
          paketKode: "",
          tanggalKirim: new Date().toISOString().slice(0, 10),
          total: 0
        }
      };
    },
    computed: {
      // produce data bmp berdasarkan paket yg di select
      selectedPaket() {
        return this.paketList.find((item) => item.kode === this.newDO.paketKode) || null;
      },

      // generate next nomor do
      doSequence() {
        const year = new Date().getFullYear();
        const prefix = "DO" + year + "-";
        const nomorList = Object.keys(this.tracking)
          .filter((key) => key.startsWith(prefix))
          .map((key) => Number(key.replace(prefix, "")))
          .filter((num) => !Number.isNaN(num));
        return nomorList.length ? Math.max(...nomorList) + 1 : 1;
      }
    },

    watch: {
      // watch paketKode lalu calculate total
      "newDO.paketKode"() {
        this.newDO.total = this.selectedPaket ? Number(this.selectedPaket.harga) : 0;
      },

      // clear error saat input nomor do
      searchDO(value) {
        if (!value) {
          this.searchError = "";
        }
      }
    },

    methods: {
      // generate otomatis nomor do
      generateDONumber() {
        const year = new Date().getFullYear();
        const seq = String(this.doSequence).padStart(3, "0");
        return "DO" + year + "-" + seq;
      },
      formatRupiah(nilai) {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(nilai) || 0);
      },

      // action cari do di tombol search
      cariDO() {
        const key = this.searchDO.trim();
        if (!key) {
          this.searchError = "Nomor DO wajib diisi.";
          this.selectedTracking = null;
          return;
        }
        if (!this.tracking[key]) {
          this.searchError = "Nomor DO tidak ditemukan.";
          this.selectedTracking = null;
          return;
        }
        this.searchError = "";
        this.selectedTracking = this.tracking[key];
      },

      // validate inputan do
      validateDO() {
        if (!this.newDO.nim || !this.newDO.nama || !this.newDO.ekspedisi || !this.newDO.paketKode) {
          this.formError = "Semua field wajib diisi kecuali nomor DO otomatis.";
          return false;
        }
        this.formError = "";
        return true;
      },

      // reset all form do
      resetForm() {
        this.newDO = {
          nomorDO: this.generateDONumber(),
          nim: "",
          nama: "",
          ekspedisi: "",
          paketKode: "",
          tanggalKirim: new Date().toISOString().slice(0, 10),
          total: 0
        };
      },

      // submit data do dari inputan
      submitDO() {
        // sblm submit validate dulu
        if (!this.validateDO()) return;

        const nomor = this.newDO.nomorDO;
        this.tracking[nomor] = {
          nim: this.newDO.nim,
          nama: this.newDO.nama,
          status: "Diproses",
          ekspedisi: this.newDO.ekspedisi,
          tanggalKirim: this.newDO.tanggalKirim,
          paket: this.newDO.paketKode,
          total: this.newDO.total,
          perjalanan: [
            {
              waktu: new Date().toLocaleString("id-ID"),
              keterangan: "DO berhasil dibuat dan menunggu pickup ekspedisi"
            }
          ]
        };

        this.searchDO = nomor;
        this.selectedTracking = this.tracking[nomor];
        this.resetForm();
      }
    },
    // refresh agar muncul data baru
    mounted() {
      this.newDO.nomorDO = this.generateDONumber();
    }
  }).mount("#trackingApp");
}

loadTrackingSeed().then((seedData) => {
  initTrackingApp(seedData);
}).catch(() => {
  initTrackingApp({ paket: [], tracking: {} });
});
