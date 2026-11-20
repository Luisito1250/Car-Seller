#!/bin/bash
IP=192.168.100.3
echo "componente,url,codigo_http,tiempo_s" > resultados_funcional.csv
probar() {
  r=$(curl -s -o /dev/null -w "%{http_code},%{time_total}" "$2")
  echo "$1,$2,$r" >> resultados_funcional.csv
  printf "%-28s %s\n" "$1" "$r"
}
# APIs a traves de HAProxy (puerto 80)
probar "API publicaciones (HAProxy)" http://$IP/api/publicaciones
probar "API vehiculos (HAProxy)"     http://$IP/api/vehiculos
probar "API transacciones (HAProxy)" http://$IP/api/transacciones
probar "API citas (HAProxy)"         http://$IP/api/citas
probar "API usuarios (HAProxy)"      http://$IP/api/usuarios
# Frontends
probar "Front main"          http://$IP:8080
probar "Front transacciones" http://$IP:8001
probar "Front publicaciones" http://$IP:8002
probar "Front citas"         http://$IP:8003
probar "Front usuarios"      http://$IP:8004
probar "Front vehiculos"     http://$IP:8005
# Infraestructura
probar "HAProxy stats"       http://$IP/stats
probar "Spark Master UI"     http://$IP:8081
probar "Reporte Spark JSON"  http://$IP:8080/reportes/reporte_dashboard.json
probar "Analytics vehiculos" http://$IP:3005/vehiculos/analytics
