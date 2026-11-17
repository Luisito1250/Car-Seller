import glob
import json
import os
from pyspark.sql import SparkSession
from pyspark.sql import functions as F

def main():
    spark = SparkSession.builder \
        .appName("CarSeller-AnalisisDistribuido") \
        .getOrCreate()

    spark.sparkContext.setLogLevel("WARN")

    archivos_csv = glob.glob("/opt/spark/data/*.csv")
    if not archivos_csv:
        raise FileNotFoundError("No se encontró ningún archivo .csv en /opt/spark/data/")

    ruta_dataset = archivos_csv[0]
    print(f"Procesando dataset distribuido: {ruta_dataset}")

    df = spark.read.option("header", "true").option("inferSchema", "true").csv(ruta_dataset)

    # Normalizar nombres de columnas a minúsculas para evitar errores según el dataset de Kaggle
    for col_name in df.columns:
        df = df.withColumnRenamed(col_name, col_name.strip().lower())

    total_registros = df.count()

    # Detectar columnas comunes de marca y precio en datasets de autos (make/brand y price/sellingprice)
    col_marca = next((c for c in ["make", "brand", "marca", "manufacturer"] if c in df.columns), df.columns[0])
    col_precio = next((c for c in ["sellingprice", "price", "precio"] if c in df.columns), None)

    if col_precio:
        df_clean = df.withColumn(col_precio, F.col(col_precio).cast("double")).filter(F.col(col_precio) > 0)
        resumen_marcas = (
            df_clean.groupBy(col_marca)
            .agg(
                F.count("*").alias("cantidad"),
                F.round(F.avg(col_precio), 2).alias("precio_promedio"),
                F.round(F.max(col_precio), 2).alias("precio_maximo")
            )
            .orderBy(F.desc("cantidad"))
            .limit(10)
            .collect()
        )
        precio_global = df_clean.agg(F.round(F.avg(col_precio), 2)).collect()[0][0]
    else:
        resumen_marcas = (
            df.groupBy(col_marca)
            .agg(F.count("*").alias("cantidad"))
            .orderBy(F.desc("cantidad"))
            .limit(10)
            .collect()
        )
        precio_global = 0

    salida = {
        "dataset_procesado": os.path.basename(ruta_dataset),
        "total_vehiculos_analizados": total_registros,
        "precio_promedio_global": precio_global,
        "top_marcas": [row.asDict() for row in resumen_marcas]
    }

    os.makedirs("/opt/spark/reportes", exist_ok=True)
    ruta_salida = "/opt/spark/reportes/reporte_dashboard.json"
    with open(ruta_salida, "w", encoding="utf-8") as f:
        json.dump(salida, f, indent=2, ensure_ascii=False)

    print(f"Reporte generado exitosamente en {ruta_salida}")
    spark.stop()

if __name__ == "__main__":
    main()
