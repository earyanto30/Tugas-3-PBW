document.addEventListener('DOMContentLoaded', function () {
    const btnCari = document.getElementById('btnCari');
    const noDOInput = document.getElementById('noDOInput');
    const trackingResult = document.getElementById('trackingResult');
    const errorMsg = document.getElementById('errorMsg');

    const resNama = document.getElementById('resNama');
    const resStatus = document.getElementById('resStatus');
    const resEkspedisi = document.getElementById('resEkspedisi');
    const resTanggal = document.getElementById('resTanggal');
    const resPaket = document.getElementById('resPaket');
    const resTotal = document.getElementById('resTotal');
    const resPerjalanan = document.getElementById('resPerjalanan');

    btnCari.addEventListener('click', function () {
        const noDO = noDOInput.value.trim();
        const data = dataTracking[noDO];

        if (data) {
            errorMsg.style.display = 'none';
            trackingResult.style.display = 'block';

            resNama.textContent = data.nama;
            resStatus.textContent = data.status;
            resEkspedisi.textContent = data.ekspedisi;
            resTanggal.textContent = data.tanggalKirim;
            resPaket.textContent = data.paket;
            resTotal.textContent = data.total;

            resPerjalanan.innerHTML = '';
            data.perjalanan.forEach(p => {
                const li = document.createElement('li');

                const dateSpan = document.createElement('span');
                dateSpan.className = 'timeline-date';
                dateSpan.textContent = p.waktu;

                const descText = document.createTextNode(p.keterangan);

                li.appendChild(dateSpan);
                li.appendChild(descText);
                resPerjalanan.appendChild(li);
            });

            // kalo error
        } else {
            errorMsg.style.display = 'block';
            trackingResult.style.display = 'none';
        }
    });
});
