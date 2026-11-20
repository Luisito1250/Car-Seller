#!/usr/bin/env python3
# Genera las graficas de las pruebas a partir de los CSV
import csv, os
from collections import defaultdict
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

D = os.path.expanduser("~/pruebas")
OUTD = os.path.join(D, "graficas")
os.makedirs(OUTD, exist_ok=True)
COL = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"]  # orden fijo de series
TXT, GRID = "#333333", "#e3e3e3"
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 10, "axes.edgecolor": "#999999",
                     "axes.labelcolor": TXT, "xtick.color": TXT, "ytick.color": TXT,
                     "axes.spines.top": False, "axes.spines.right": False})

def num(x):
    try: return float(x)
    except: return None

def prom(lista):
    v = [x for x in lista if x is not None]
    return sum(v) / len(v) if v else None

def estilo(ax, titulo, xl, yl):
    ax.set_title(titulo, loc="left", fontsize=12, color=TXT, fontweight="bold")
    ax.set_xlabel(xl); ax.set_ylabel(yl)
    ax.grid(axis="y", color=GRID, linewidth=0.8); ax.set_axisbelow(True)

def guardar(fig, nombre):
    fig.tight_layout(); fig.savefig(os.path.join(OUTD, nombre), dpi=200); plt.close(fig)
    print("Grafica creada:", os.path.join(OUTD, nombre))

# ---------- Spark ----------
f = os.path.join(D, "resultados_spark.csv")
if os.path.exists(f):
    t = defaultdict(list); mb = {}
    for r in csv.DictReader(open(f)):
        t[(int(r["workers"]), r["tamano"])].append(num(r["tiempo_s"])); mb[r["tamano"]] = float(r["mb"])
    tam = sorted(mb, key=lambda k: mb[k]); ws = sorted({k[0] for k in t})
    # 1) tiempo vs workers
    fig, ax = plt.subplots(figsize=(7.6, 4))
    for i, s in enumerate(tam):
        ys = [prom(t[(w, s)]) for w in ws]
        ax.plot(ws, ys, marker="o", markersize=7, linewidth=2, color=COL[i], label=f"{s} ({mb[s]:.0f} MB)")
    ax.set_xticks(ws); ax.set_ylim(bottom=0)
    estilo(ax, "Tiempo del job de Spark vs. número de Workers", "Número de Workers", "Tiempo promedio (s)")
    ax.legend(title="Tamaño de datos", frameon=False, loc="upper left", bbox_to_anchor=(1.01, 1)); guardar(fig, "1_spark_workers.png")
    # 2) tiempo vs tamano
    fig, ax = plt.subplots(figsize=(6.4, 4))
    xs = [mb[s] for s in tam]
    for i, w in enumerate(ws):
        ax.plot(xs, [prom(t[(w, s)]) for s in tam], marker="o", markersize=7, linewidth=2, color=COL[i], label=f"{w} Worker{'s' if w > 1 else ''}")
    ax.set_ylim(bottom=0)
    estilo(ax, "Tiempo del job de Spark vs. tamaño de datos", "Tamaño del dataset (MB)", "Tiempo promedio (s)")
    ax.legend(frameon=False); guardar(fig, "2_spark_tamano.png")
    # 3) speedup
    fig, ax = plt.subplots(figsize=(6.4, 4))
    for i, s in enumerate(tam):
        base = prom(t[(1, s)])
        ys = [base / prom(t[(w, s)]) if base and prom(t[(w, s)]) else None for w in ws]
        ax.plot(ws, ys, marker="o", markersize=7, linewidth=2, color=COL[i], label=f"{s} ({mb[s]:.0f} MB)")
    ax.plot(ws, ws, linestyle="--", linewidth=1, color="#999999", label="Ideal (lineal)")
    ax.set_xticks(ws); ax.set_ylim(bottom=0)
    estilo(ax, "Speedup del job de Spark", "Número de Workers", "Speedup (T1 / TN)")
    ax.legend(frameon=False); guardar(fig, "3_spark_speedup.png")

# ---------- API ----------
f = os.path.join(D, "resultados_api.csv")
if os.path.exists(f):
    filas = list(csv.DictReader(open(f)))
    cs = defaultdict(lambda: defaultdict(list))
    for r in filas:
        if r["prueba"] in ("carga", "estres"):
            c = int(r["concurrencia"])
            for k in ("req_por_s", "t_medio_ms", "p95_ms"): cs[c][k].append(num(r[k]))
            tot = int(r["peticiones"]); bad = (num(r["fallidas"]) or 0) + (num(r["no_2xx"]) or 0)
            cs[c]["err"].append(100 * bad / tot)
    if cs:
        c_ord = sorted(cs)
        # 4) tiempo de respuesta vs concurrencia
        fig, ax = plt.subplots(figsize=(6.4, 4))
        ax.plot(c_ord, [prom(cs[c]["t_medio_ms"]) for c in c_ord], marker="o", markersize=7, linewidth=2, color=COL[0], label="Tiempo medio")
        ax.plot(c_ord, [prom(cs[c]["p95_ms"]) for c in c_ord], marker="o", markersize=7, linewidth=2, color=COL[1], label="Percentil 95")
        ax.axvline(150, color="#bbbbbb", linewidth=1, linestyle=":")
        ax.text(160, ax.get_ylim()[1] * 0.95, "Estrés →", color="#777777", fontsize=9, va="top")
        ax.set_xscale("log"); ax.set_xticks(c_ord); ax.set_xticklabels(c_ord); ax.set_ylim(bottom=0)
        estilo(ax, "Tiempo de respuesta de la API vs. usuarios concurrentes", "Usuarios concurrentes (escala log)", "Tiempo de respuesta (ms)")
        ax.legend(frameon=False); guardar(fig, "4_api_tiempo_respuesta.png")
        # 5) throughput vs concurrencia
        fig, ax = plt.subplots(figsize=(6.4, 4))
        ys = [prom(cs[c]["req_por_s"]) for c in c_ord]
        ax.bar([str(c) for c in c_ord], ys, color=COL[0], width=0.6, edgecolor="white", linewidth=2)
        for i, y in enumerate(ys):
            if y: ax.text(i, y, f"{y:.0f}", ha="center", va="bottom", fontsize=9, color=TXT)
        estilo(ax, "Throughput de la API vs. usuarios concurrentes", "Usuarios concurrentes", "Peticiones por segundo")
        guardar(fig, "5_api_throughput.png")
        # 6) tasa de error
        fig, ax = plt.subplots(figsize=(6.4, 4))
        ys = [prom(cs[c]["err"]) for c in c_ord]
        ax.bar([str(c) for c in c_ord], ys, color=COL[1], width=0.6, edgecolor="white", linewidth=2)
        for i, y in enumerate(ys): ax.text(i, y, f"{y:.1f}%", ha="center", va="bottom", fontsize=9, color=TXT)
        ax.set_ylim(0, max(5, max(ys) * 1.2))
        estilo(ax, "Tasa de error de la API vs. usuarios concurrentes", "Usuarios concurrentes", "Peticiones con error (%)")
        guardar(fig, "6_api_errores.png")
    bal = defaultdict(lambda: defaultdict(list))
    for r in filas:
        if r["prueba"] == "balanceo":
            for k in ("req_por_s", "t_medio_ms"): bal[int(r["replicas"])][k].append(num(r[k]))
    if bal:
        reps = sorted(bal)
        fig, axs = plt.subplots(1, 2, figsize=(8, 3.8))
        for ax, k, tl, yl in ((axs[0], "req_por_s", "Throughput", "Peticiones por segundo"), (axs[1], "t_medio_ms", "Tiempo medio de respuesta", "ms")):
            ys = [prom(bal[r][k]) for r in reps]
            ax.bar([f"{r} réplica{'s' if r > 1 else ''}" for r in reps], ys, color=COL[:len(reps)], width=0.55, edgecolor="white", linewidth=2)
            for i, y in enumerate(ys):
                if y: ax.text(i, y, f"{y:.1f}", ha="center", va="bottom", fontsize=9, color=TXT)
            estilo(ax, tl, "", yl)
        fig.suptitle("Balanceo de carga: ms-vehiculos con 1 vs. 3 réplicas (100 usuarios)", x=0.02, ha="left", fontsize=12, fontweight="bold", color=TXT)
        guardar(fig, "7_api_balanceo.png")

# ---------- Reparto entre replicas ----------
f = os.path.join(D, "reparto_replicas.txt")
if os.path.exists(f):
    datos = []
    for linea in open(f):
        p = linea.split()
        if len(p) >= 2 and p[0].isdigit():
            nombre = p[1].strip("/").split(".")
            datos.append((f"Réplica {nombre[1]}" if len(nombre) > 1 else p[1], int(p[0])))
    if datos:
        datos.sort()
        tot = sum(v for _, v in datos)
        fig, ax = plt.subplots(figsize=(6.4, 4))
        ax.bar([n for n, _ in datos], [v for _, v in datos], color=COL[0], width=0.55, edgecolor="white", linewidth=2)
        for i, (_, v) in enumerate(datos):
            ax.text(i, v / 2, f"{v}\n({100*v/tot:.1f}%)", ha="center", va="center", fontsize=10, color="white", fontweight="bold")
        ax.axhline(tot / len(datos), color="#999999", linestyle="--", linewidth=1, label=f"Reparto ideal ({tot // len(datos)})")
        ax.set_ylim(0, max(v for _, v in datos) * 1.25)
        ax.legend(frameon=False, loc="upper right")
        estilo(ax, f"Reparto de {tot} peticiones entre {len(datos)} réplicas", "", "Peticiones atendidas")
        guardar(fig, "8_api_reparto_replicas.png")
