# Deep Vision - Text to Image Generator

Deep Vision es una aplicación web que permite generar imágenes a partir de descripciones textuales utilizando inteligencia artificial. La aplicación utiliza el modelo Gemini Pro Vision de Google AI Studio para la generación de imágenes.

## Características

- Interfaz moderna y minimalista
- Fondo animado interactivo con p5.js
- Generación de imágenes con múltiples estilos artísticos
- Control de nivel de creatividad
- Descarga de imágenes generadas
- Diseño responsive para desktop y móvil

## Requisitos

- Python 3.8 o superior
- pip (gestor de paquetes de Python)
- Cuenta en Google AI Studio para obtener una API key

## Instalación

1. Clona este repositorio:
```bash
git clone https://github.com/tu-usuario/deep-vision.git
cd deep-vision
```

2. Crea un entorno virtual e instala las dependencias:
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Crea un archivo `.env` en la raíz del proyecto y añade tu API key de Google AI Studio:
```
GOOGLE_API_KEY=tu-api-key-aquí
```

## Uso

1. Activa el entorno virtual si no está activado:
```bash
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

2. Ejecuta la aplicación:
```bash
python app.py
```

3. Abre tu navegador y visita `http://localhost:5000`

## Estructura del Proyecto

```
deep-vision/
├── app.py              # Aplicación Flask
├── requirements.txt    # Dependencias de Python
├── static/            # Archivos estáticos
│   ├── style.css      # Estilos CSS
│   ├── script.js      # JavaScript principal
│   └── ai-background.js # Animación de fondo
├── templates/         # Plantillas HTML
│   └── index.html     # Página principal
└── README.md          # Este archivo
```

## Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue para discutir los cambios propuestos o envía un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles. 