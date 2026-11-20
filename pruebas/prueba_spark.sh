#!/bin/bash
DATA=~/Car-Seller/spark_cluster/data
DS=~/pruebas/datasets
OUT=~/pruebas/resultados_spark.csv
ERR=~/pruebas/errores
STACK=carseller
REPS=3
TAMANOS="1 50 200 500"

correr_job() {
  docker exec $(docker ps -q -f name=${STACK}_spark-master) \
    /opt/spark/bin/spark-submit --master spark://spark-master:7077 \
    --executor-memory 450m /opt/spark/jobs/analisis_autos.py > $1 2>&1
}
workers_vivos() {
  curl -s --max-time 5 http://localhost:8081/json/ | grep -o '"aliveworkers" *: *[0-9]*' | grep -o '[0-9]*$'
}

mkdir -p $DS $ERR
[ -f $DATA/train.csv ] && [ ! -f $DS/train_x1.csv ] && mv $DATA/train.csv $DS/train_x1.csv
for F in $TAMANOS; do
  if [ ! -f $DS/train_x$F.csv ]; then
    echo "Generando dataset x$F..."
    head -1 $DS/train_x1.csv > $DS/train_x$F.csv
    for i in $(seq $F); do tail -n +2 $DS/train_x1.csv >> $DS/train_x$F.csv; done
  fi
done

echo "workers,tamano,filas,mb,repeticion,tiempo_s" > $OUT
for W in 1 2 3; do
  echo "=== Escalando a $W worker(s) ==="
  docker service scale ${STACK}_spark-worker=$W > /dev/null 2>&1
  n=0
  until [ "$(workers_vivos)" = "$W" ] || [ $n -ge 40 ]; do sleep 3; n=$((n+1)); done
  echo "Workers vivos segun el Master: $(workers_vivos)"
  sleep 5
  for T in $TAMANOS; do
    rm -f $DATA/*.csv
    ln $DS/train_x$T.csv $DATA/train_x$T.csv
    FILAS=$(( $(wc -l < $DS/train_x$T.csv) - 1 ))
    MB=$(du -m $DS/train_x$T.csv | cut -f1)
    for R in $(seq $REPS); do
      LOG=$ERR/w${W}_x${T}_r${R}.log
      INI=$(date +%s.%N)
      if correr_job $LOG; then
        FIN=$(date +%s.%N)
        TS=$(awk "BEGIN{printf \"%.2f\", $FIN-$INI}")
        rm -f $LOG
      else
        TS="ERROR"
      fi
      echo "$W,x$T,$FILAS,$MB,$R,$TS" >> $OUT
      echo "workers=$W tamano=x$T rep=$R -> $TS s"
    done
  done
done

echo "=== Restaurando estado original ==="
docker service scale ${STACK}_spark-worker=2 > /dev/null 2>&1
rm -f $DATA/*.csv
ln $DS/train_x1.csv $DATA/train.csv
sleep 20
correr_job /dev/null
echo "=== LISTO ==="
column -t -s, $OUT
