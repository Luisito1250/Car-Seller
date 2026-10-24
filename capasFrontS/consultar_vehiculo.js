document.getElementById('consulta-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const id = document.getElementById('id').value;
    const resultado = document.getElementById('resultado');

    try {
        const respuesta = await fetch('http://192.168.100.3:3005/api/vehiculos');
        const vehiculos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error('No se pudieron consultar los vehículos');
        }

        const vehiculo = vehiculos.find(v => Number(v.id_vehiculo) === Number(id));

        if (!vehiculo) {
            resultado.innerHTML = `
                <div class="alert alert-warning">
                    No existe un vehículo con el ID ${id}.
                </div>
            `;
            return;
        }

        resultado.innerHTML = `
            <div class="card">
                            <div class="card-body">
                    <h4 class="mb-3">Vehículo encontrado</h4>
                    <p><strong>ID:</strong> ${vehiculo.id_vehiculo}</p>
                    <p><strong>Tipo:</strong> ${vehiculo.tipo}</p>
                    <p><strong>Marca:</strong> ${vehiculo.marca}</p>
                    <p><strong>Modelo:</strong> ${vehiculo.modelo}</p>
                    <p><strong>Año:</strong> ${vehiculo.ano}</p>
                    <p><strong>Precio:</strong> $${Number(vehiculo.precio).toLocaleString()}</p>
                    <p><strong>Kilometraje:</strong> ${vehiculo.kilometraje}</p>
                    <p><strong>Estado:</strong> ${vehiculo.estado}</p>
                </div>
            </div>
        `;

    } catch (error) {
        resultado.innerHTML = `
            <div class="alert alert-danger">
                Error al consultar el vehículo.
            </div>
        `;
        console.error(error);
    }
});