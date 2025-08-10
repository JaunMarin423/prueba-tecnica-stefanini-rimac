# API de Integración Star Wars y Clima

API RESTful que combina datos de personajes de Star Wars con información meteorológica, implementando caché con DynamoDB.

## 🚀 Características

- Consulta de personajes de Star Wars con datos de sus planetas
- Integración con API de clima
- Sistema de caché de 30 minutos
- Almacenamiento en DynamoDB
- Documentación Swagger/OpenAPI

## 🛠 Requisitos Previos

- Node.js 18+
- npm o yarn
- Java (para DynamoDB Local)
- AWS CLI (opcional, para operaciones con DynamoDB Local)

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd prueba-tecnica
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   Crear un archivo `.env` en la raíz del proyecto:
   ```env
   NODE_ENV=development
   DYNAMODB_TABLE=stefanini-rimac-api-dev
   REGION=us-east-1
   DYNAMODB_ENDPOINT=http://localhost:8000
   OPENWEATHER_API_KEY=tu_clave_opcional
   ```

## 🏃 Ejecución Local

1. **Iniciar DynamoDB Local**
   ```bash
   # En una terminal
   java -D"java.library.path=./DynamoDBLocal_lib" -jar DynamoDBLocal.jar -sharedDb -port 8000
   ```

2. **Crear la tabla en DynamoDB**
   ```bash
   # En otra terminal
   aws dynamodb create-table \
   --table-name stefanini-rimac-api-dev \
   --attribute-definitions AttributeName=PK,AttributeType=S AttributeName=SK,AttributeType=S \
   --key-schema AttributeName=PK,KeyType=HASH AttributeName=SK,KeyType=RANGE \
   --billing-mode PAY_PER_REQUEST \
   --endpoint-url http://localhost:8000
   ```

3. **Iniciar el servidor**
   ```bash
   npm run dev
   ```
   El servidor estará disponible en `http://localhost:3000`

## 📚 Documentación de la API

### Acceso a la Documentación

1. **Iniciar el servidor de documentación** (en otra terminal):
   ```bash
   npx http-server -p 8080 --cors
   ```

2. **Abrir Swagger UI**:
   ```
   https://petstore.swagger.io/?url=http://localhost:8080/docs/swagger.yaml
   ```

### Endpoints Disponibles

#### 1. Obtener Datos de Personaje
```
GET /fusionados/{characterId}
```
**Parámetros**:
- `characterId` (requerido): ID del personaje (1-83)

**Ejemplo**:
```bash
curl http://localhost:3000/dev/fusionados/1
```

#### 2. Almacenar Datos Personalizados
```
POST /almacenar
```
**Cuerpo de la solicitud**:
```json
{
  "id": "ejemplo-123",
  "data": {
    "clave": "valor",
    "numero": 123,
    "activo": true
  }
}
```

**Ejemplo**:
```bash
curl -X POST http://localhost:3000/dev/almacenar \
-H "Content-Type: application/json" \
-d '{"id":"ejemplo","data":{"clave":"valor"}}'
```

#### 3. Obtener Historial
```
GET /historial
```

**Parámetros de consulta**:
- `limit` (opcional): Número de resultados por página (por defecto: 10)
- `nextToken` (opcional): Token para la paginación

**Ejemplo**:
```bash
curl "http://localhost:3000/dev/historial?limit=5"
```

## 🧪 Validación

### 1. Validar Estructura del Proyecto
```bash
npm run lint
```

### 2. Verificar Tipos de TypeScript
```bash
npm run type-check
```

### 3. Probar los Endpoints

1. **Probar GET /fusionados/1**
   - Deberías recibir los datos de Luke Skywalker con información meteorológica
   - Verifica que los datos se guarden en DynamoDB

2. **Probar POST /almacenar**
   - Envía datos de prueba
   - Verifica que se guarden correctamente

3. **Probar GET /historial**
   - Deberías ver las consultas anteriores
   - Prueba la paginación

## 🏗 Estructura del Proyecto

```
src/
├── functions/           # Funciones Lambda
│   ├── getCombinedData/ # Obtener datos de personaje
│   ├── storeCustomData/ # Almacenar datos personalizados
│   └── getHistory/      # Obtener historial
├── services/           # Lógica de negocio
│   ├── dynamodb.service.ts # Servicio de DynamoDB
│   └── fusion.service.ts   # Lógica de fusión de datos
└── utils/              # Utilidades
    └── api.ts          # Cliente HTTP para APIs externas
```

## 🚀 Despliegue

1. Configurar credenciales de AWS:
   ```bash
   aws configure
   ```

2. Desplegar con Serverless Framework:
   ```bash
   npm run deploy
   ```

## 📝 Notas Adicionales

- Los datos meteorológicos son simulados si no se proporciona una clave de OpenWeather
- La caché tiene una duración de 30 minutos
- Se recomienda usar Node.js 18 o superior

## ⚠️ Problemas Conocidos y Soluciones

### 1. Compatibilidad con Docker
**Problema**: Algunos equipos con hardware limitado pueden experimentar problemas al ejecutar contenedores Docker.
**Solución**: Se optó por usar DynamoDB Local sin Docker, ejecutándolo directamente con Java.

### 2. Versiones de Serverless Framework
**Problema**: La versión 4.x de Serverless Framework presentó problemas de compatibilidad.
**Solución**: Se configuró el proyecto para usar una versión estable de Serverless Framework 3.x.

### 3. Requisitos de Hardware
**Problema**: La ejecución de múltiples servicios (DynamoDB Local, API, etc.) puede consumir muchos recursos.
**Solución**:
- Cerrar aplicaciones innecesarias
- Aumentar la memoria asignada a Node.js si es necesario
- Usar `NODE_OPTIONS=--max-old-space-size=4096` para asignar más memoria

### 4. Versiones de Node.js
**Problema**: Algunas versiones de Node.js pueden causar conflictos con las dependencias.
**Solución**:
- Usar Node.js 18.x LTS (versión recomendada)
- Si se usa nvm, ejecutar: `nvm use 18`

### 5. Problemas con DynamoDB Local
**Problema**: Errores al iniciar o conectar con DynamoDB Local.
**Solución**:
- Verificar que Java esté instalado correctamente
- Asegurarse de que el puerto 8000 esté disponible
- Reiniciar el servicio de DynamoDB Local si falla

### 6. Problemas de Red
**Problema**: Errores de conexión con APIs externas.
**Solución**:
- Verificar la conexión a internet
- Configurar proxy si es necesario
- Usar VPN si las APIs están bloqueadas en tu región

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.
