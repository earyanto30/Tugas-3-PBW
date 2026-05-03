document.addEventListener('DOMContentLoaded', function () {
    const stokBody = document.getElementById('stokBody');
    const formTambahStok = document.getElementById('formTambahStok');

    // Render table
    function renderTable() {
        stokBody.innerHTML = '';

        dataBahanAjar.forEach(item => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${item.cover ? `<img src="${item.cover}" alt="Cover" style="height: 50px; border-radius: 4px;">` : 'Tidak ada cover'}</td>
                <td>${item.kodeLokasi}</td>
                <td>${item.kodeBarang}</td>
                <td>${item.namaBarang}</td>
                <td>${item.jenisBarang}</td>
                <td>${item.edisi}</td>
                <td>${item.stok}</td>
            `;

            stokBody.appendChild(tr);
        });
    }

    renderTable();

    formTambahStok.addEventListener('submit', function (e) {
        e.preventDefault();

        const newLokasi = document.getElementById('inputLokasi').value;
        const newKode = document.getElementById('inputKode').value;
        const newNama = document.getElementById('inputNama').value;
        const newJenis = document.getElementById('inputJenis').value;
        const newEdisi = document.getElementById('inputEdisi').value;
        const newStok = document.getElementById('inputStok').value;

        // Create 
        const newItem = {
            kodeLokasi: newLokasi,
            kodeBarang: newKode,
            namaBarang: newNama,
            jenisBarang: newJenis,
            edisi: newEdisi,
            stok: parseInt(newStok),
            cover: ""
        };

        dataBahanAjar.push(newItem);

        renderTable();

        formTambahStok.reset();

        alert('Stok baru berhasil ditambahkan!');
    });
});
