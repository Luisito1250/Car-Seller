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
| **ms-vehiculos** | `3005` | Node.js (Express) | MySQL 8.0 (`capasalmacen`) | Inventario y catálogo de vehículos |

### Micro-frontends

| Frontend | Puerto Mapeado | Módulo |
| :--- | :--- | :--- |
| **front-main** | `8080` | Portal principal de navegación |
| **front-transacciones** | `8001` | Interfaz gráfica de transacciones |
| **front-publicaciones** | `8002` | Interfaz gráfica de publicaciones |
| **front-citas** | `8003` | Interfaz gráfica de citas |
| **front-usuarios** | `8004` | Interfaz gráfica de usuarios |
| **front-vehiculos** | `8005` | Interfaz gráfica de vehículos |

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
└── capasFront*/                # Código fuente de los micro-frontends
