document.getElementById('publicar-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const id_vehiculo = document.getElementById('id_vehiculo').value;
    const id_vendedor = document.getElementById('id_vendedor').value;
    const descripcion = document.getElementById('descripcion').value;
    const fotos_url = document.getElementById('fotos_url').value;
    const mensaje = document.getElementById('mensaje');

    try {
        const respuesta = await fetch('http://192.168.100.3:3000/api/publicaciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_vehiculo, id_vendedor, descripcion, fotos_url })
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(data.error || 'No se pudo registrar la publicación');
        }

        mensaje.className = 'alert alert-success mt-4';
        mensaje.textContent = '¡Publicación creada exitosamente!';
        document.getElementById('publicar-form').reset();

    } catch (error) {
        mensaje.className = 'alert alert-danger mt-4';
        mensaje.textContent = 'Error: ' + error.message;
    }
});