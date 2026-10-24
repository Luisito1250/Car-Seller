document.addEventListener('DOMContentLoaded', async () => {
    const contenedor = document.getElementById('publicaciones-container');

    try {
        const respuesta = await fetch('http://192.168.100.3:3000/api/publicaciones');
        const publicaciones = await respuesta.json();

        if (!respuesta.ok) throw new Error('Error al obtener publicaciones');

        if (publicaciones.length === 0) {
            contenedor.innerHTML = '<div class="col-12"><div class="alert alert-info text-center">No hay publicaciones registradas.</div></div>';
            return;
        }

        contenedor.innerHTML = publicaciones.map(pub => `
            <div class="col">
              <div class="card h-100 shadow-sm">
                ${pub.fotos_url ? `<img src="${pub.fotos_url}" class="card-img-top" alt="Foto Vehículo" style="height: 200px; object-fit: cover;">` : ''}
                <div class="card-body">
                  <h5 class="card-title">Vehículo ID: ${pub.id_vehiculo}</h5>
                  <p class="card-text">${pub.descripcion}</p>
                </div>
                <div class="card-footer text-muted small">
                  Vendedor ID: ${pub.id_vendedor} <br>
                  Fecha: ${new Date(pub.fecha_publicacion).toLocaleDateString()}
                </div>
              </div>
            </div>
        `).join('');

    } catch (error) {
        contenedor.innerHTML = `<div class="col-12"><div class="alert alert-danger text-center">Error al cargar anuncios: ${error.message}</div></div>`;
    }
});