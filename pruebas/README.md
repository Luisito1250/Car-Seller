# Pruebas de escalabilidad, rendimiento y calidad

Esta carpeta tiene los scripts, los datos y las gráficas de las pruebas del proyecto Car Seller (Persona 4, capa de validación).

## Contenido

| Archivo | Qué es |
| --- | --- |
| `prueba_funcional.sh` | Prueba con `curl` que los 15 componentes respondan (APIs, frontends, HAProxy y Spark) |
| `prueba_spark.sh` | Mide el tiempo del job de Spark con 1, 2 y 3 Workers y datasets de 2 MB a 1 GB |
| `prueba_api.sh` | Pruebas de carga, estrés y balanceo de la API con Apache Bench |
| `graficas.py` | Genera las gráficas a partir de los CSV |
| `resultados_funcional.csv` | Resultado de la prueba funcional |
| `resultados_spark.csv` | 36 corridas de Spark |
| `resultados_api.csv` | 24 corridas de la API |
| `reparto_replicas.txt` | Peticiones atendidas por cada réplica de ms-vehiculos |
| `graficas/` | Las 8 gráficas usadas en el informe |

## Requisitos

- El stack desplegado en Docker Swarm (`docker stack deploy -c docker-compose.yml carseller`) en la VM `192.168.100.3`.
- `train.csv` del dataset en `spark_cluster/data/`.
- En la VM: `sudo apt install -y apache2-utils python3-matplotlib`.

## Cómo reproducir las pruebas

Todos los scripts se corren dentro de la VM, desde esta carpeta.

1. **Prueba funcional**

   ```bash
   ./prueba_funcional.sh
   ```

2. **Escalabilidad de Spark** (unos 40 minutos). Para medir sin interferencias, primero se apagan los demás servicios:

   ```bash
   for s in $(docker service ls --format '{{.Name}}' | grep -v spark); do docker service scale -d $s=0; done
   nohup ./prueba_spark.sh > log_spark.txt 2>&1 &
   ```

   El script genera los datasets x1, x50, x200 y x500, escala los Workers y deja todo como estaba al terminar.

3. **Carga, estrés y balanceo de la API** (unos 15 minutos). Se encienden otra vez los servicios y se apagan los Workers de Spark:

   ```bash
   for s in $(docker service ls --format '{{.Name}}' | grep -v spark); do docker service scale -d $s=1; done
   docker service scale -d carseller_spark-worker=0
   # esperar 2-3 minutos a que MySQL termine de iniciar
   nohup ./prueba_api.sh > log_api.txt 2>&1 &
   ```

   Si la API no responde HTTP 200 al inicio, el script se cancela solo.

4. **Gráficas**

   ```bash
   python3 graficas.py
   ```

## Resultados principales

- **Funcionales:** 14 de 15 componentes responden HTTP 200; `/vehiculos/analytics` da 404.
- **Spark:** con 1 GB, 3 Workers bajan el tiempo de 62,0 s a 43,1 s (speedup de 1,44x). Con 105 MB o menos, más Workers lo hacen más lento.
- **API:** una réplica se satura en unas 880 peticiones/s; con 1000 usuarios el tiempo medio sube a 1,2 s, sin errores.
- **Balanceo:** con 3 réplicas, el throughput sube un 35 % y el reparto es 998 / 998 / 1004 de 3000 peticiones.

## Notas

- El job de Spark se ejecuta con `--executor-memory 450m`, porque cada Worker tiene 512 MB.
- Si el portátil se suspende durante una prueba, Swarm reinicia los servicios y la medición se pierde.
