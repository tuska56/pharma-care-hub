# 📊 Cálculo de Sábados Teóricos en Planificación Inteligente

## Concepto Fundamental

El sistema calcula **sábados teóricos** (no sábados reales) para determinar cuántos sábados se *podrían* repartir a cada empleado basándose en su **saldo de horas del año teórico**.

### ¿Por qué es teórico?

```
Ejemplo real:
├─ Convenio: 40 horas/semana (5 días × 8h)
├─ Trabajador trabaja en promedio: 32 horas/semana (4 días)
├─ Diferencia teórica: 8 horas/semana = 1 día/semana
├─ A fin de año:
│  ├─ Si realmente trabajó 40h/semana → NO hay sábados reales (0 sábados)
│  └─ Si trabajó menos (32h/semana) → Puede tomar sábados teóricos
└─ El cálculo de sábados teóricos es SOLO para planificar qué se podría tomar
```

## Fórmula de Cálculo

### 1️⃣ Calcular el Saldo de Horas Anual

**Paso 1: Sumar todas las horas teóricas trabajadas**
```
Horas Teóricas = Horas del Convenio (ajustadas si es año incompleto)

Ejemplo:
- Convenio: 1.680 horas/año
- Empleado se da de alta el 1 de junio: 1.680 × (214 días / 365 días) ≈ 840 horas
```

**Paso 2: Calcular horas reales netas (descontando ajustes)**
```
Horas Reales Netas = Horas Totales Trabajadas 
                   - Vacaciones 
                   - Asuntos Propios 
                   - Faltas de Horas
                   + Horas Extra
                   (NO se descuentan los sábados aún)
```

**Paso 3: Calcular el Saldo**
```
Saldo de Horas = Horas Reales Netas - Horas Teóricas

Ejemplos:
├─ Saldo +100h  → El empleado trabajó más de lo teórico (tiene "crédito")
├─ Saldo -50h   → El empleado trabajó menos (tiene "deuda")
└─ Saldo 0h     → Trabajó exactamente lo del convenio
```

### 2️⃣ Calcular Sábados Teóricos

**Fórmula:**
```
Sábados Teóricos = FLOOR(Saldo de Horas ÷ Horas Promedio por Sábado)

Nota: Solo si Saldo > 0 y Promedio > 0, si no = 0
```

**Horas Promedio por Sábado:**
```
Se calcula iterando cada sábado trabajado del año:
- Se suma el total de horas de todos los sábados
- Se divide entre la cantidad de sábados

Ejemplo:
├─ Total sábados del año: 52
├─ Horas totales en sábados: 208 horas
└─ Promedio: 208 ÷ 52 = 4 horas por sábado
```

**Ejemplo completo:**
```
Año 2025:
├─ Horas Convenio: 1.680h
├─ Horas Reales Netas: 1.720h (20h extra)
├─ Saldo: +20h
├─ Horas Promedio por Sábado: 4h
├─ Sábados Teóricos: FLOOR(20 ÷ 4) = 5 sábados
└─ Interpretación: Teóricamente puede tomar 5 sábados
```

### 3️⃣ Calcular Sábados Disponibles

**Fórmula:**
```
Sábados Disponibles = Sábados Teóricos - Sábados ya Usados

Donde "Sábados ya Usados" = Cantidad de eventos SABADO_LIBRE registrados
```

**Ejemplo:**
```
├─ Sábados Teóricos: 5
├─ Sábados ya Tomados: 2 (registrados en el sistema)
└─ Sábados Disponibles: 3 (lo que falta poder tomar)
```

## Cálculo del Saldo Proyectado

Cuando se **asignan sábados en la planificación**, el sistema calcula:

```
Saldo Proyectado = Saldo Actual - (Sábados Asignados × Horas por Sábado)
```

**Ejemplo:**
```
Empleado: Juan
├─ Saldo Actual: +20h
├─ Se asignan: 3 sábados de oro
├─ Horas por sábado: 4h
├─ Cálculo: 20 - (3 × 4) = 20 - 12 = +8h
└─ Saldo Proyectado: +8h
```

## Dos Modos de Distribución

### 🏆 Modo 1: Sábados de Oro
- **Qué son:** Sábados que vienen después de un viernes festivo O antes de un lunes festivo
- **Cuántos:** Variable según festivos (típicamente 2-4 por año)
- **Lógica de reparto:** Se distribuyen entre empleados con saldo positivo y méritos altos

### 📅 Modo 2: Un Sábado al Mes
- **Qué son:** El primer sábado de cada mes
- **Cuántos:** Exactamente 12 (uno por mes)
- **Lógica de reparto:** Se distribuyen equilibradamente entre empleados

### Lógica de Reparto Común

Ambos modos usan el **mismo algoritmo de distribución equilibrada**:

```
1. Ordenar empleados por:
   ├─ Prioridad de méritos (quienes no tuvieron sábado el año anterior: ALTA)
   ├─ Saldo de horas (mayor saldo primero)
   └─ Antigüedad (más antiguos primero)

2. Para cada sábado a repartir:
   ├─ Buscar candidatos disponibles que:
   │  ├─ NO estén ausentes (vacaciones, asuntos propios, etc.) ese día
   │  ├─ Tengan saldo > 0
   │  └─ No hayan alcanzado su límite de sábados disponibles
   │
   ├─ De los candidatos, seleccionar al que ha recibido MENOS sábados
   │  (esto asegura distribución equilibrada)
   │
   └─ Asignar el sábado a ese empleado
```

## Tabla Resumen de Datos por Empleado

| Campo | Qué es | Cálculo | Ejemplo |
|-------|--------|---------|---------|
| **Saldo Actual** | Horas sobrantes/faltantes teóricas | Horas Reales - Horas Convenio | +20h |
| **Sábados Teóricos** | Cuántos sábados se podrían tomar (teórico) | Saldo ÷ Promedio por Sábado | 5 |
| **Sábados Usados** | Cuántos ya se tomaron | Contar eventos SABADO_LIBRE | 2 |
| **Sábados Disponibles** | Cuántos quedan por tomar | Teóricos - Usados | 3 |
| **Asignados (Reparto)** | Cuántos se asignan en THIS planificación | Se calcula en el reparto | 1 |
| **Saldo Proyectado** | Saldo final tras el reparto | Saldo Actual - (Asignados × Horas) | +16h |

## Casos de Uso

### Caso 1: Empleado con Saldo Positivo ✅
```
Empleado: María
├─ Horas Convenio: 1.680h
├─ Horas Reales Netas: 1.760h
├─ Saldo Actual: +80h
├─ Promedio por Sábado: 4h
├─ Sábados Teóricos: FLOOR(80 ÷ 4) = 20 sábados
├─ Sábados Usados: 5
├─ Sábados Disponibles: 15
└─ ✅ Puede recibir sábados en el reparto
```

### Caso 2: Empleado con Saldo Negativo ❌
```
Empleado: Carlos
├─ Horas Convenio: 1.680h
├─ Horas Reales Netas: 1.620h (faltas, asuntos propios)
├─ Saldo Actual: -60h
├─ Sábados Teóricos: 0 (saldo negativo)
├─ Sábados Usados: 0
├─ Sábados Disponibles: 0
└─ ❌ NO puede recibir sábados en el reparto (deuda de horas)
```

### Caso 3: Empleado que Alcanzó su Límite ⚠️
```
Empleado: Ana
├─ Saldo Actual: +40h
├─ Sábados Teóricos: 10
├─ Sábados Usados: 8
├─ Sábados Disponibles: 2
├─ Se asignan en THIS reparto: 2
├─ Saldo Proyectado: 40 - (2 × 4) = +32h
└─ ✅ Recibe los últimos 2 disponibles, luego no puede más
```

## Aclaraciones Importantes

### 📌 El Cálculo es TEÓRICO
- Los "sábados teóricos" no son un derecho garantizado
- Solo muestran cuántos *se podrían* tomar si se terminara el año con ese saldo
- Si al final del año el empleado trabajó las 5 días completos del convenio, **no tiene derecho a esos sábados**

### 📌 Se Basa en Saldo de Horas
- El sistema ajusta por:
  - Vacaciones tomadas
  - Asuntos propios
  - Faltas de horas
  - Horas extra realizadas
  - Entrada a mitad de año

### 📌 Prioridad de Méritos
- Se considera si el empleado tuvo sábados de oro el año anterior
- Quienes no los tuvieron tiene **prioridad Alta**
- Los demás tienen **prioridad Normal**

### 📌 Disponibilidad por Día
- No se puede asignar un sábado si el empleado:
  - Está de vacaciones ese día
  - Tiene asuntos propios ese día
  - Ya tiene un sábado libre registrado

## Ejemplo Paso a Paso

```
INICIO DEL AÑO 2025
===================

Empleados:
├─ Juan: Convenio 1.680h, Horas Reales: 1.700h → Saldo: +20h
├─ María: Convenio 1.680h, Horas Reales: 1.760h → Saldo: +80h
└─ Carlos: Convenio 1.680h, Horas Reales: 1.600h → Saldo: -80h

Sábados de Oro Disponibles: 4 (fechas: 2025-01-04, 2025-02-01, 2025-03-01, 2025-04-05)
Promedio por Sábado: 4 horas

CÁLCULO DE SÁBADOS TEÓRICOS
============================
Juan:   20h ÷ 4 = 5 sábados teóricos
María:  80h ÷ 4 = 20 sábados teóricos
Carlos: -80h (negativo) = 0 sábados teóricos

REPARTO DEL 1ER SÁBADO ORO (2025-01-04)
========================================
Candidatos: Juan (5 disponibles), María (20 disponibles), NOT Carlos
Ordenados por méritos/saldo: María primero
Asignado a: María

Actualización:
├─ María: 1 asignado, Saldo Proyectado: 80 - 4 = +76h
├─ Juan: 0 asignado, Saldo Proyectado: +20h
└─ Carlos: (descartado)

REPARTO DEL 2º SÁBADO ORO (2025-02-01)
======================================
Candidatos: Juan (5 disponibles), María (20 disponibles), NOT Carlos
Menos sábados asignados: Juan (0 < María's 1)
Asignado a: Juan

Actualización:
├─ Juan: 1 asignado, Saldo Proyectado: 20 - 4 = +16h
├─ María: 1 asignado, Saldo Proyectado: +76h
└─ Carlos: (descartado)

(... y así hasta repartir los 4 sábados ...)

RESULTADO FINAL
===============
├─ Juan: 2 asignados, Saldo Proyectado: +12h
├─ María: 2 asignados, Saldo Proyectado: +72h
└─ Carlos: 0 asignados, Saldo Proyectado: -80h (sin cambios)
```

---

**Preguntas Frecuentes:**

- **P: ¿Qué pasa si un empleado se toma un sábado pero al final no trabajó todas sus horas?**
  - R: Eso se refleja en el "Saldo Actual" del año siguiente. El sistema lo contabiliza.

- **P: ¿Por qué algunos sábados quedan sin asignar?**
  - R: Porque no hay empleados disponibles con saldo positivo que no estén ausentes.

- **P: ¿Puedo editar el saldo de horas?**
  - R: No directamente. El saldo se calcula automáticamente. Edita eventos (vacaciones, faltas, extras) para ajustarlo.

- **P: ¿Qué significa "Sábado de Oro"?**
  - R: Un sábado que viene después de un viernes festivo o antes de un lunes festivo. Se considera "especial" porque cerca hay un festivo.
