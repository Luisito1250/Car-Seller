document.getElementById('borrar-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const id = document.getElementById('id').value;
    const mensaje = document.getElementById('mensaje');

    const confirmar = confirm(`¿Está seguro de que desea borrar el vehículo con ID ${id}?`);
    if (!confirmar) return;

    try {
        const respuesta = await fetch(`http://192.168.100.3:3005/api/vehiculos/${id}`, {
            method: 'DELETE'
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(data.error || 'No se pudo eliminar el vehículo');
        }

        mensaje.className = 'alert alert-success mt-4';
        mensaje.textContent = 'Vehículo eliminado correctamente.';

        document.getElementById('borrar-form').reset();

    } catch (error) {
                mensaje.className = 'alert alert-danger mt-4';
        mensaje.textContent = 'Error: ' + error.message;
    }
});
