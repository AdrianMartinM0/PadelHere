# Instrucciones de Instalación y Ejecución de la API

Este proyecto utiliza un entorno virtual (virtualenv) para gestionar las dependencias de Python. Aquí se explican los pasos para configurar y ejecutar el proyecto en diferentes sistemas operativos.

## Requisitos previos

- **Python 3** debe estar instalado en tu máquina.
- **PIP** debe estar instalado para gestionar las dependencias.

## Pasos para instalar y ejecutar el proyecto

### 1. Crear el entorno virtual (venv)
1. Abre la terminal.
2. Navega al directorio de la API del proyecto.
    ```bash
        cd api
    ```
3. Ejecuta el siguiente comando para crear un entorno virtual:
    #### **Linux / macOS**
    ```bash
        python3 -m venv .venv
    ```
    #### **Windows (cmd)**
    ```bash
        python -m venv venv
    ```
    #### **Windows (Bash o WSL)**
    ```bash
        python3 -m venv venv
    ```
---
### 2. Activar el entorno virtual (venv)
1. Ejeuta el siguiente comando.
    #### **Linux / macOS**
    ```bash
        source venv/bin/activate
    ```
    #### **Windows (cmd)**
    ```bash
        venv\Scripts\activate
    ```    
    #### **Windows (Bash o WSL)**
    ```bash
        source .venv/Scripts/activate
    ```    
---
### 3. Instalar las dependencias desde requirements.txt
1. Una vez que el entorno virtual esté activado, instala las dependencias del proyecto utilizando el siguiente comando:
    ```bash
        pip install -r requirements.txt
    ```

### 4. Configurar el entorno
1. Crea un archivo `.env` en la carpeta `api/` basándote en `api/.env.example`.
2. Completa los valores de las variables necesarias (MONGO_URI, SECRET_KEY, etc.).

### 5. Ejecutar la API
1. Después de haber configurado el entorno, puedes arrancar la API con el siguiente comando:
    ```bash
        fastapi dev main.py
    ```

- FastAPI crea documentacion de la API de forma automatica
    ### FastAPI/Docs
    ```bash
        http://127.0.0.1:8000/docs
    ```
    
    ### FastAPI/Redoc
    ```bash
        http://127.0.0.1:8000/redoc
    ```
---
---
