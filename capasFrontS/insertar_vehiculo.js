document.addEventListener("DOMContentLoaded", () => {
    // Manejo de la previsualización de la imagen
    const inputImagen = document.getElementById('imagen');
    if (inputImagen) {
        inputImagen.addEventListener('input', function (e) {
            const url = e.target.value.trim();
            const preview = document.getElementById('preview');
            if (preview) {
                if (url) {
                    preview.src = url;
                    preview.classList.remove('d-none');
                } else {
                    preview.src = '';
                    preview.classList.add('d-none');
                }
            }
        });

        // Limpiar si el enlace ingresado está roto
        const previewImg = document.getElementById('preview');
        if (previewImg) {
            previewImg.addEventListener('error', () => {
                previewImg.classList.add('d-none');
            });
        }
    }

    // Manejo del envío del formulario
    const formVehiculo = document.getElementById('vehiculo-form');
    if (!formVehiculo) return;

    formVehiculo.addEventListener('submit', async function (e) {
        e.preventDefault();

        const mensaje = document.getElementById('mensaje');
        if (mensaje) mensaje.classList.add('d-none');

        // Captura de datos
        const placa = document.getElementById('placa') ? document.getElementById('placa').value.trim().toUpperCase() : '';
        const vin = document.getElementById('vin') ? document.getElementById('vin').value.trim().toUpperCase() : '';
        const tipo = document.getElementById('tipo') ? document.getElementById('tipo').value.trim() : 'Automóvil';
        const marca = document.getElementById('marca') ? document.getElementById('marca').value.trim() : '';
        const modelo = document.getElementById('modelo') ? document.getElementById('modelo').value.trim() : '';
        const ano = document.getElementById('ano') ? document.getElementById('ano').value : '';
        const precio = document.getElementById('precio') ? parseFloat(document.getElementById('precio').value) : 0;
        const kilometraje = document.getElementById('kilometraje') ? document.getElementById('kilometraje').value : '0';
        const estado = document.getElementById('estado') ? document.getElementById('estado').value.trim() : 'Usado';
        const estadoSiniestro = document.getElementById('estado_siniestro') ? document.getElementById('estado_siniestro').value : 'sin_antecedentes';
        const peritajeUrl = document.getElementById('peritaje_url') ? document.getElementById('peritaje_url').value.trim() : '';
        const imagen = document.getElementById('imagen') ? document.getElementById('imagen').value.trim() : '';

        // Obtener usuario logueado si existe
        const usuarioSesion = JSON.parse(localStorage.getItem('usuario')) || {};
        const idVendedor = usuarioSesion.id || usuarioSesion.id_usuario || null;

        // 1. VALIDACIÓN DE CAMPOS OBLIGATORIOS
        if (!placa || !marca || !modelo || !precio || !imagen) {
            mostrarMensaje('Por favor complete todos los campos obligatorios.', 'danger');
            return;
        }

// 2. VALIDACIÓN AMPLIADA CON REGEX (Bloquea electrodomésticos, muebles, ropa, animales, etc.)
        const regexNoVehiculo = /(nev|frig|refrig|helad|lavad|dryer|wash|stov|horn|oven|cook|micro|applianc|frez|cong|furnit|muebl|sofa|chair|tabl|desk|tv|televis|speak|parlant|ventil|fan|shirt|pant|shoe|zapat|ropa|dress|toy|juguet|doll|food|comid|dog|perro|cat|gato|pet|mascot|casas|house|apartam|land|lote|phone|celular|laptop|comput)/i;

        if (regexNoVehiculo.test(imagen)) {
            mostrarMensaje('❌ La URL contiene términos de objetos no permitidos (electrodomésticos, muebles, etc.).', 'danger');
            return;
        }

        // Validar extensión de imagen
        const esUrlValida = /^https?:\/\/.+/i.test(imagen);
	if (!esUrlValida) {
	    mostrarMensaje('❌ Por favor ingrese una URL válida que comience con http:// o https://', 'danger');
	    return;
	}

        try {
            // REGISTRAR VEHÍCULO EN EL MICROSERVICIO DE INVENTARIO (:3005)
            const resVehiculo = await fetch('http://192.168.100.3:3005/api/vehiculos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    placa,
                    vin,
                    tipo,
                    marca,
                    modelo,
                    ano: parseInt(ano),
                    precio,
                    kilometraje: parseInt(kilometraje),
                    estado,
                    estado_siniestro: estadoSiniestro,
                    peritaje_url: peritajeUrl,
                    imagen,
                    id_vendedor: idVendedor
                })
            });

            const dataVehiculo = await resVehiculo.json();

            if (!resVehiculo.ok) {
                throw new Error(dataVehiculo.error || 'Error al guardar el vehículo en el inventario.');
            }

            console.log("✅ Vehículo guardado con éxito:", dataVehiculo);

            // REGISTRAR PUBLICACIÓN EN EL MICROSERVICIO DE PUBLICACIONES (:3002)
            const payloadPublicacion = {
                titulo: `${marca} ${modelo} ${ano}`.trim(),
                descripcion: `Tipo ${tipo}, marca ${marca}, modelo ${ano}. Estado: ${estado}. Chasis: ${estadoSiniestro === 'sin_antecedentes' ? '100% Estructuralmente Sano' : 'Reparado'}.`,
                precio_publicacion: precio,
                precio: precio,
                imagen: imagen,
                imagen_url: imagen,
                placa: placa,
                vin: vin,
                id_vendedor: idVendedor,
                estado: 'Disponible'
            };

            const resPublicacion = await fetch('http://192.168.100.3:3002/api/publicaciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payloadPublicacion)
            });

            const dataPublicacion = await resPublicacion.json();

            if (!resPublicacion.ok) {
                console.error("❌ Error devuelto por el servidor de Publicaciones:", dataPublicacion);
                throw new Error(`Vehículo creado, pero falló la publicación: ${dataPublicacion.error || dataPublicacion.mensaje || 'Error del servidor'}`);
            }

            console.log("✅ Publicación creada con éxito:", dataPublicacion);

            // Mensaje de éxito y reset del formulario
            mostrarMensaje('¡Vehículo y publicación registrados con éxito!', 'success');

            formVehiculo.reset();
            const preview = document.getElementById('preview');
            if (preview) {
                preview.src = '';
                preview.classList.add('d-none');
            }

        } catch (error) {
            console.error('⚠️ Error en el proceso:', error);
            mostrarMensaje(error.message, 'danger');
        }
    });

    // Función auxiliar para mostrar alertas en pantalla
    function mostrarMensaje(texto, tipoAlert) {
        const mensaje = document.getElementById('mensaje');
        if (mensaje) {
            mensaje.className = `alert alert-${tipoAlert} mt-4`;
            mensaje.textContent = texto;
            mensaje.classList.remove('d-none');
        } else {
            alert(texto);
        }
    }
});
