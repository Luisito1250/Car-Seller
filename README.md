# Car Seller

Aplicación web orientada a microservicios para la gestión de publicaciones, transacciones, citas, usuarios y vehículos. La arquitectura implementa el patrón *Database per Service*, donde cada módulo posee su propia base de datos aislada, backend en Node.js y micro-frontend.

---

## Arquitectura

La infraestructura está orquestada sobre **Docker Swarm** dentro de una máquina virtual (Ubuntu/Vagrant) interconectada mediante una red de tipo `overlay` (`red-almacen`). Un contenedor de **HAProxy** expuesto en el puerto `80` actúa como punto único de entrada, proxy inverso y balanceador de carga.

| Componente | IP / Puerto | Función |
| :--- | :--- | :--- |
| **HAProxy** | `192.168.100.3:80` | Balanceador de carga y enrutamiento centralizado |
| **Docker Swarm** | Red `red-almacen` | Orquestación de contenedores y escalabilidad horizontal |

---

## Servicios

### Microservicios Backend y Bases de Datos

| Servicio | Puerto Contenedor | Tecnología Backend | Base de Datos | Función |
| :--- | :--- | :--- | :--- | :--- |
| **ms-transacciones** | `3001` | Node.js (Express) | MySQL 8.0 (`transacciones`) | Gestión de ventas y transacciones |
| **ms-publicaciones** | `3002` | Node.js (Express) | MySQL 8.0 (`consesionario`) | Publicaciones del concesionario |
| **ms-citas** | `3003` | Node.js (Express) | MySQL 8.0 (`solicitudcita`) | Agendamiento de citas de taller/mantenimiento |
| **ms-usuarios** | `3004` | Node.js (Express) | MySQL 8.0 (`usuarios`) | Gestión de cuentas de usuario y perfiles |
| **ms-vehiculos** | `3005` | Node.js (Express) | MySQL 8.0 (`capasalmacen`) | Inventario, catálogo y endpoint analítico Spark |

### Micro-frontends

| Frontend | Puerto Mapeado | Módulo |
| :--- | :--- | :--- |
| **front-main** | `8080` | Portal principal de navegación |
| **front-transacciones** | `8001` | Interfaz gráfica de transacciones |
| **front-publicaciones** | `8002` | Interfaz gráfica de publicaciones |
| **front-citas** | `8003` | Interfaz gráfica de citas |
| **front-usuarios** | `8004` | Interfaz gráfica de usuarios |
| **front-vehiculos** | `8005` | Interfaz gráfica de vehículos y estadísticas Spark |

### Clúster de Procesamiento Distribuido (Apache Spark)

Integra una capa analítica desplegada sobre la misma red `red-almacen` de Docker Swarm para procesar conjuntos de datos de vehículos en memoria y exportar métricas en formato JSON hacia el dashboard mediante volúmenes compartidos.

| Componente | Puerto / Red | Volumen Montado | Función |
| :--- | :--- | :--- | :--- |
| **spark-master** | `8081` (Web UI) / `7077` (RPC) | `./spark_cluster/*` $\rightarrow$ `/opt/spark/*` | Coordinación del clúster y recepción de trabajos |
| **spark-worker (x2)** | Red `red-almacen` | `./spark_cluster/*` $\rightarrow$ `/opt/spark/*` | Procesamiento distribuido en memoria de datasets CSV |

---

## Estructura del Repositorio

```text
.
├── docker-compose.yml          # Definición de la pila de servicios para Swarm
├── haproxy.cfg                 # Configuración de balanceo y enrutamiento de HAProxy
├── plan_pruebas.jmx            # Plan de pruebas de carga de Apache JMeter
├── sql_scripts/                # Scripts de inicialización SQL
│   ├── transacciones.sql
│   ├── consesionario.sql
│   ├── solicitudcita.sql
│   ├── usuarios.sql
│   └── capasalmacen.sql
├── Transacciones/              # Código fuente ms-transacciones (Node.js)
├── Publicaciones/              # Código fuente ms-publicaciones (Node.js)
├── Citas/                      # Código fuente ms-citas (Node.js)
├── Usuarios/                   # Código fuente ms-usuarios (Node.js)
├── Vehiculos/                  # Código fuente ms-vehiculos (Node.js)
├── capasFront*/                # Código fuente de los micro-frontends
└── spark_cluster/              # Capa de procesamiento distribuido con Apache Spark
    ├── data/                   # Datasets CSV de entrada (train.csv)
    ├── jobs/                   # Scripts PySpark (analisis_autos.py)
    └── reportes/               # Reportes JSON compartidos (reporte_dashboard.json)
```

---

## Paso a Paso para Reproducir la Implementación

### 1. Clonar o actualizar el repositorio
En el nodo administrador (Ubuntu Server `192.168.100.3`):
```bash
git clone [https://github.com/Luisito1250/Car-Seller.git](https://github.com/Luisito1250/Car-Seller.git) Proyecto
cd Proyecto
git pull origin main
```

### 2. Inicializar Docker Swarm y desplegar la pila de servicios
Si el clúster Swarm aún no está activo en la máquina virtual, inicialízalo y despliega los 19 servicios definidos en `docker-compose.yml`:
```bash
docker swarm init
docker stack deploy -c docker-compose.yml proyecto_almacen
```
Verifica que todas las réplicas estén activas (`1/1` o `2/2`):
```bash
docker service ls
```

### 3. Ejecutar el procesamiento distribuido en Apache Spark
Lanza el trabajo PySpark (`analisis_autos.py`) asignando `450 MB` por ejecutor para ajustarse al límite de memoria de los contenedores *Worker* y generar el reporte consolidado `reporte_dashboard.json`:
```bash
docker exec -it $(docker ps -q -f name=proyecto_almacen_spark-master) \
  /opt/spark/bin/spark-submit \
  --master spark://spark-master:7077 \
  --executor-memory 450m \
  /opt/spark/jobs/analisis_autos.py
```

### 4. Escalar los nodos trabajadores de Spark (Pruebas de escalabilidad)
Para reproducir las mediciones de rendimiento con `1`, `2` o `3` *Workers*:
```bash
docker service scale proyecto_almacen_spark-worker=1
docker service scale proyecto_almacen_spark-worker=2
docker service scale proyecto_almacen_spark-worker=3
```

### 5. Verificación de acceso y endpoints
* **Aplicación Principal (HAProxy):** `http://192.168.100.3/`
* **Estadísticas de HAProxy:** `http://192.168.100.3/stats`
* **Dashboard Estadístico de Vehículos:** `http://192.168.100.3:8005/estadisticas_vehiculos.html`
* **API REST Analítica (vía HAProxy):** `http://192.168.100.3/api/vehiculos/analytics`
* **Spark Master Web UI:** `http://192.168.100.3:8081`
