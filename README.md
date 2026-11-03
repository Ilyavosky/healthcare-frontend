# healthcare-frontend

Interfaz del proyecto **Healthcare: Priorización de Urgencias Médicas**. Permite capturar la sala de urgencias, ver la agenda que calcula el backend y animar la búsqueda de A*.

## Requisitos

- Node.js 20.9 o superior.
- El backend [`healthcare-backend`](https://github.com/Ilyavosky/healthcare-backend) en ejecución, local o desplegado.

## Instalación

```bash
git clone https://github.com/Ilyavosky/healthcare-frontend.git
cd healthcare-frontend/healthcare
npm install
```

## Configuración

Copia la plantilla y edita la dirección del backend:

```bash
cp .env.example .env.local
```

En Windows (PowerShell): `Copy-Item .env.example .env.local`.

| Variable | Valor de ejemplo | Para qué |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Dirección del backend. Para usar el desplegado, pon su URL de Railway. |

El backend debe tener la dirección de este frontend en su `ALLOWED_ORIGIN` (por defecto ya incluye `http://localhost:3000`). Si cambias `.env.local`, reinicia el servidor.

## Ejecutar

```bash
npm run dev
```

Abre `http://localhost:3000`.

Para la versión de producción:

```bash
npm run build
npm run start
```

Para revisar el código: `npm run lint`.

## Uso

1. **Agregar pacientes** de una de tres formas:
   - *Individual:* nombre, nivel de triage (1 a 5), minutos que ya lleva esperando y duración de su consulta.
   - *Excel / CSV:* un archivo `.xlsx` o `.csv` con las columnas `nombre`, `nivel`, `espera` y `duracion`. El nivel puede escribirse como `2` o `N2`.
   - *Aleatorio:* número de pacientes, de médicos y una semilla opcional; también puede sortear el inicio y la meta. Con la misma semilla y las mismas opciones se obtiene el mismo escenario.
2. **Configurar inicio:** minuto actual del turno y pacientes que ya fueron atendidos.
3. **Configurar médicos:** cuántos hay y, si se desea, el minuto en que se libera cada uno.
4. **Cambiar meta:** todos, solo críticos (N1–N2), próximos K pacientes, por tiempo (T minutos) o pacientes específicos.
5. La tabla muestra la agenda: médico, inicio, fin, minutos sobre el límite, penalización y alertas. Arriba se puede cambiar entre el orden de A* y el orden por gravedad.
6. **¿Por qué este orden es el mejor?** abre la animación del grafo de búsqueda de A*, paso a paso.
7. **Reiniciar** borra el escenario.
