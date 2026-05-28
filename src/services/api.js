import rawData from '../../data/dataBahanAjar.json';

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeStockItem(item) {
  return {
    kode: String(item?.kode ?? '').trim(),
    judul: String(item?.judul ?? '').trim(),
    kategori: String(item?.kategori ?? '').trim(),
    upbjj: String(item?.upbjj ?? '').trim(),
    lokasiRak: String(item?.lokasiRak ?? '').trim(),
    harga: toNumber(item?.harga),
    qty: toNumber(item?.qty),
    safety: toNumber(item?.safety),
    catatanHTML: String(item?.catatanHTML ?? '').trim(),
  };
}

function normalizePackageItem(item) {
  return {
    kode: String(item?.kode ?? '').trim(),
    nama: String(item?.nama ?? '').trim(),
    isi: Array.isArray(item?.isi) ? item.isi.map((kode) => String(kode).trim()) : [],
    harga: toNumber(item?.harga),
  };
}

function normalizeTrackingEntry(nomorDO, entry) {
  const perjalanan = Array.isArray(entry?.perjalanan)
    ? entry.perjalanan.map((step) => ({
        waktu: String(step?.waktu ?? '').trim(),
        keterangan: String(step?.keterangan ?? '').trim(),
      }))
    : [];

  return {
    nomorDO: String(nomorDO).trim(),
    nim: String(entry?.nim ?? '').trim(),
    nama: String(entry?.nama ?? '').trim(),
    status: String(entry?.status ?? '').trim(),
    ekspedisi: String(entry?.ekspedisi ?? '').trim(),
    tanggalKirim: String(entry?.tanggalKirim ?? '').trim(),
    paket: String(entry?.paket ?? '').trim(),
    total: toNumber(entry?.total),
    perjalanan,
  };
}

function createStore() {
  const normalized = {
    upbjjList: Array.isArray(rawData?.upbjjList) ? rawData.upbjjList.map((v) => String(v).trim()) : [],
    kategoriList: Array.isArray(rawData?.kategoriList)
      ? rawData.kategoriList.map((v) => String(v).trim())
      : [],
    pengirimanList: Array.isArray(rawData?.pengirimanList)
      ? rawData.pengirimanList.map((item) => ({
          kode: String(item?.kode ?? '').trim(),
          nama: String(item?.nama ?? '').trim(),
        }))
      : [],
    paket: Array.isArray(rawData?.paket) ? rawData.paket.map(normalizePackageItem) : [],
    stok: Array.isArray(rawData?.stok) ? rawData.stok.map(normalizeStockItem) : [],
    tracking: {},
  };

  const sourceTracking = rawData?.tracking && typeof rawData.tracking === 'object' ? rawData.tracking : {};
  Object.entries(sourceTracking).forEach(([nomorDO, entry]) => {
    const normalizedEntry = normalizeTrackingEntry(nomorDO, entry);
    normalized.tracking[normalizedEntry.nomorDO] = normalizedEntry;
  });

  return normalized;
}

const state = createStore();

function getRootData() {
  return deepClone(state);
}

function getMasterData() {
  return {
    upbjjList: [...state.upbjjList],
    kategoriList: [...state.kategoriList],
    pengirimanList: deepClone(state.pengirimanList),
  };
}

function getStockList() {
  return deepClone(state.stok);
}

function getStockByKode(kode) {
  const kodeValue = String(kode ?? '').trim();
  const found = state.stok.find((item) => item.kode === kodeValue);
  return found ? deepClone(found) : null;
}

function createStock(payload) {
  const newItem = normalizeStockItem(payload);
  if (!newItem.kode) throw new Error('Kode stok wajib diisi.');
  if (state.stok.some((item) => item.kode === newItem.kode)) {
    throw new Error(`Kode stok ${newItem.kode} sudah ada.`);
  }
  state.stok.push(newItem);
  return deepClone(newItem);
}

function updateStock(kode, payload) {
  const kodeValue = String(kode ?? '').trim();
  const index = state.stok.findIndex((item) => item.kode === kodeValue);
  if (index === -1) throw new Error(`Stok dengan kode ${kodeValue} tidak ditemukan.`);

  const current = state.stok[index];
  const merged = normalizeStockItem({ ...current, ...payload, kode: current.kode });
  state.stok[index] = merged;
  return deepClone(merged);
}

function deleteStock(kode) {
  const kodeValue = String(kode ?? '').trim();
  const index = state.stok.findIndex((item) => item.kode === kodeValue);
  if (index === -1) return false;
  state.stok.splice(index, 1);
  return true;
}

function getPackageList() {
  return deepClone(state.paket);
}

function getPackageByKode(kodePaket) {
  const kodeValue = String(kodePaket ?? '').trim();
  const found = state.paket.find((item) => item.kode === kodeValue);
  return found ? deepClone(found) : null;
}

function getTrackingList() {
  return Object.values(state.tracking).map((item) => deepClone(item));
}

function getTrackingByNomorDO(nomorDO) {
  const key = String(nomorDO ?? '').trim();
  return state.tracking[key] ? deepClone(state.tracking[key]) : null;
}

function searchTracking(keyword) {
  const term = String(keyword ?? '').trim().toLowerCase();
  if (!term) return getTrackingList();

  return Object.values(state.tracking)
    .filter((item) => item.nomorDO.toLowerCase().includes(term) || item.nim.toLowerCase().includes(term))
    .map((item) => deepClone(item));
}

function getNextDONumber(year = new Date().getFullYear()) {
  const yearText = String(year);
  const prefix = `DO${yearText}-`;
  let maxSequence = 0;

  Object.keys(state.tracking).forEach((nomorDO) => {
    if (!nomorDO.startsWith(prefix)) return;
    const sequenceText = nomorDO.slice(prefix.length);
    const sequence = Number.parseInt(sequenceText, 10);
    if (Number.isFinite(sequence) && sequence > maxSequence) {
      maxSequence = sequence;
    }
  });

  const nextSequence = String(maxSequence + 1).padStart(3, '0');
  return `${prefix}${nextSequence}`;
}

function createDeliveryOrder(payload) {
  const nomorDO = String(payload?.nomorDO ?? getNextDONumber()).trim();
  if (state.tracking[nomorDO]) {
    throw new Error(`Nomor DO ${nomorDO} sudah terdaftar.`);
  }

  const newEntry = normalizeTrackingEntry(nomorDO, {
    ...payload,
    perjalanan: Array.isArray(payload?.perjalanan) ? payload.perjalanan : [],
  });

  state.tracking[nomorDO] = newEntry;
  return deepClone(newEntry);
}

function updateDeliveryOrder(nomorDO, payload) {
  const key = String(nomorDO ?? '').trim();
  if (!state.tracking[key]) {
    throw new Error(`Delivery order ${key} tidak ditemukan.`);
  }

  const current = state.tracking[key];
  const merged = normalizeTrackingEntry(key, {
    ...current,
    ...payload,
    perjalanan: payload?.perjalanan ?? current.perjalanan,
  });

  state.tracking[key] = merged;
  return deepClone(merged);
}

function deleteDeliveryOrder(nomorDO) {
  const key = String(nomorDO ?? '').trim();
  if (!state.tracking[key]) return false;
  delete state.tracking[key];
  return true;
}

function addDeliveryProgress(nomorDO, progressItem) {
  const key = String(nomorDO ?? '').trim();
  const target = state.tracking[key];
  if (!target) throw new Error(`Delivery order ${key} tidak ditemukan.`);

  const newProgress = {
    waktu: String(progressItem?.waktu ?? '').trim(),
    keterangan: String(progressItem?.keterangan ?? '').trim(),
  };

  target.perjalanan.push(newProgress);
  return deepClone(newProgress);
}

export {
  getRootData,
  getMasterData,
  getStockList,
  getStockByKode,
  createStock,
  updateStock,
  deleteStock,
  getPackageList,
  getPackageByKode,
  getTrackingList,
  getTrackingByNomorDO,
  searchTracking,
  createDeliveryOrder,
  updateDeliveryOrder,
  deleteDeliveryOrder,
  addDeliveryProgress,
  getNextDONumber,
};
