const parametros = new URLSearchParams(window.location.search);
const idURL = parametros.get('id');
if (idURL) {
    document.getElementById('id').value = idURL;
}

document.getElementById('editar-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const id = document.getElementById('id').value;
    const tipo = document.getElementById('tipo').value;
    const marca = document.getElementById('marca').value;
    const modelo = document.getElementById('modelo').value;
    const ano = document.getElementById('ano').value;
    const precio = document.getElementById('precio').value;
    const kilometraje = document.getElementById('kilometraje').value;
    const estado = document.getElementById('estado').value;

    const mensaje = document.getElementById('mensaje');

    try {
        const respuesta = await fetch(`http://192.168.100.3:3005/api/vehiculos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo, marca, modelo, ano, precio, kilometraje, estado })
        });
                const data = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(data.error || 'No se pudo actualizar el vehículo');
        }

        mensaje.className = 'alert alert-success mt-4';
        mensaje.textContent = 'Vehículo actualizado correctamente.';

    } catch (error) {
        mensaje.className = 'alert alert-danger mt-4';
        mensaje.textContent = 'Error: ' + error.message;
    }
});