document.addEventListener('DOMContentLoaded', () => {
  const API_URL = `http://${window.location.hostname}:3005/vehiculos/analytics`;

  fetch(API_URL)
    .then(response => {
      if (!response.ok) throw new Error('Error al consultar el reporte de Spark');
      return response.json();
    })
    .then(data => {
      // 1. Llenar KPIs reales
      document.getElementById('kpi-total').textContent = data.resumen_general.total_vehiculos_analizados.toLocaleString();
      document.getElementById('kpi-precio').textContent = '$' + data.resumen_general.precio_promedio_global.toLocaleString();
      document.getElementById('kpi-km').textContent = data.resumen_general.kilometraje_promedio.toLocaleString() + ' km';

      // 2. Gráfica de Barras: Top 10 Marcas (Precio Promedio)
      new Chart(document.getElementById('graficaMarcas'), {
        type: 'bar',
        data: {
          labels: data.precio_promedio_por_marca.map(item => item.marca),
          datasets: [{
            label: 'Precio Promedio ($)',
            data: data.precio_promedio_por_marca.map(item => item.precio_promedio),
            backgroundColor: '#0d6efd'
          }]
        }
      });

      // 3. Gráfica de Líneas: Tendencia por Año (2005 - 2020)
      new Chart(document.getElementById('graficaAnios'), {
        type: 'line',
        data: {
          labels: data.tendencia_por_anio.map(item => item.anio),
          datasets: [{
            label: 'Precio Promedio ($)',
            data: data.tendencia_por_anio.map(item => item.precio_promedio),
            borderColor: '#198754',
            backgroundColor: 'rgba(25, 135, 84, 0.2)',
            fill: true,
            tension: 0.3
          }]
        }
      });

      // 4. Gráfica de Dona: Distribución por Categoría
      new Chart(document.getElementById('graficaCombustible'), {
        type: 'doughnut',
        data: {
          labels: data.distribucion_categorias.map(item => item.categoria),
          datasets: [{
            data: data.distribucion_categorias.map(item => item.cantidad),
            backgroundColor: [
              '#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1',
              '#0dcaf0', '#fd7e14', '#20c997', '#6c757d', '#d63384', '#343a40'
            ]
          }]
        }
      });
    })
    .catch(error => {
      console.error('Error:', error);
      alert('No se pudieron cargar las estadísticas. Verifica que el microservicio Vehiculos (puerto 3005) esté activo.');
    });
});