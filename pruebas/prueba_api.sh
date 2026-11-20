#!/bin/bash
# Pruebas de carga, estres y balanceo de la API REST (a traves de HAProxy)
URL=http://192.168.100.3/api/vehiculos
SVC=carseller_ms-vehiculos
OUT=~/pruebas/resultados_api.csv
RAW=~/pruebas/api_raw
REPS=3
ulimit -n 65535 2>/dev/null
mkdir -p $RAW

medir() {  # $1=prueba $2=concurrencia $3=peticiones $4=replicas $5=repeticion
  F=$RAW/${1}_c${2}_r${4}_rep${5}.txt
  ab -r -s 30 -n $3 -c $2 $URL > $F 2>&1
  RPS=$(grep "Requests per second" $F | awk '{print $4}')
  TM=$(grep "Time per request" $F | head -1 | awk '{print $4}')
  P95=$(grep " 95%" $F | awk '{print $2}')
  FAIL=$(grep "Failed requests" $F | awk '{print $3}')
  NON2XX=$(grep "Non-2xx" $F | awk '{print $3}')
  echo "$1,$2,$3,$4,$5,${RPS:-ERROR},${TM:-ERROR},${P95:-ERROR},${FAIL:-ERROR},${NON2XX:-0}" >> $OUT
  echo "$1 c=$2 replicas=$4 rep=$5 -> ${RPS:-ERROR} req/s, ${TM:-ERROR} ms medio, p95=${P95:-?} ms, fallidas=${FAIL:-?}, no-2xx=${NON2XX:-0}"
}
escalar() {
  docker service scale $SVC=$1 > /dev/null 2>&1
  sleep 30
  ab -n 500 -c 10 $URL > /dev/null 2>&1   # calentamiento (no se mide)
  echo "Replicas de ms-vehiculos: $(docker service ls --filter name=$SVC --format '{{.Replicas}}')"
}

rm -f ~/pruebas/reparto_replicas.txt
echo "prueba,concurrencia,peticiones,replicas,repeticion,req_por_s,t_medio_ms,p95_ms,fallidas,no_2xx" > $OUT
COD=$(curl -s --max-time 5 -o /dev/null -w "%{http_code}" $URL)
echo "Chequeo previo de la API: HTTP $COD"
if [ "$COD" != "200" ]; then echo "La API no responde 200. Prueba cancelada."; exit 1; fi

# 1. Carga (1 replica)
echo "=== PRUEBA DE CARGA ==="
escalar 1
for C in 10 50 100; do for R in $(seq $REPS); do medir carga $C 2000 1 $R; done; done

# 2. Estres (1 replica)
echo "=== PRUEBA DE ESTRES ==="
for C in 200 500 1000; do for R in $(seq $REPS); do medir estres $C 5000 1 $R; done; done

# 3. Balanceo: 1 vs 3 replicas
echo "=== PRUEBA DE BALANCEO ==="
for REP in 1 3; do
  escalar $REP
  DESDE=$(date -u +%Y-%m-%dT%H:%M:%S)
  for R in $(seq $REPS); do medir balanceo 100 5000 $REP $R; done
  echo "Peticiones atendidas por cada replica ($REP replica/s):" | tee -a ~/pruebas/reparto_replicas.txt
  docker service logs --since $DESDE $SVC 2>&1 | grep "/api/vehiculos" \
    | awk '{print $1}' | sort | uniq -c | tee -a ~/pruebas/reparto_replicas.txt
done

escalar 1
echo "=== LISTO ==="
column -t -s, $OUT
