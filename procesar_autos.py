from pyspark.sql import SparkSession
from pyspark.sql.functions import col, regexp_replace, avg, count, round as spark_round, desc

spark = SparkSession.builder \
    .appName("CarSeller-AnalisisMercado") \
    .getOrCreate()

df_raw = spark.read.csv("train.csv", header=True, inferSchema=True)

df_clean = df_raw.select(
    col("Manufacturer").alias("marca"),
    col("Model").alias("modelo"),
    col("`Prod. year`").cast("int").alias("anio"),
    col("Price").cast("double").alias("precio"),
    regexp_replace(col("Mileage"), " km", "").cast("int").alias("kilometraje"),
    col("Category").alias("categoria")
).dropna() \
 .filter((col("precio") > 500) & (col("precio") < 500000))

reporte_marcas = df_clean.groupBy("marca") \
    .agg(
        count("*").alias("total_vehiculos"),
        spark_round(avg("precio"), 2).alias("precio_promedio")
    ) \
    .orderBy(desc("total_vehiculos")) \
    .limit(10)

reporte_categorias = df_clean.groupBy("categoria") \
    .agg(
        count("*").alias("cantidad"),
        spark_round(avg("precio"), 2).alias("precio_promedio"),
        spark_round(avg("kilometraje"), 0).alias("km_promedio")
    ) \
    .orderBy(desc("precio_promedio"))

reporte_anios = df_clean.filter(col("anio") >= 2005) \
    .groupBy("anio") \
    .agg(
        count("*").alias("cantidad"),
        spark_round(avg("precio"), 2).alias("precio_promedio")
    ) \
    .orderBy("anio")

print("--- REPORTE 1: TOP MARCAS ---")
reporte_marcas.show()

print("--- REPORTE 2: CATEGORIAS ---")
reporte_categorias.show()

print("--- REPORTE 3: EVOLUCION POR ANIO ---")
reporte_anios.show()

reporte_marcas.coalesce(1).write.mode("overwrite").json("output/reporte_marcas")
reporte_categorias.coalesce(1).write.mode("overwrite").json("output/reporte_categorias")
reporte_anios.coalesce(1).write.mode("overwrite").json("output/reporte_anios")

spark.stop()
