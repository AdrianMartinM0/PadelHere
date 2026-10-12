# Guia de Despliegue y Rollback de PadelHere

## 1. Ramas
- develop: Entorno de Staging / Pre-produccion.
- main: Entorno de Produccion.

## 2. Flujo de Trabajo
1. Abrir PR de feature/* -> develop.
2. Validar que la CI pasa todos los checks en verde.
3. Al mergear en develop, se dispara el despliegue automatico a Staging.
4. Una vez validada la version en Staging, abrir PR de develop -> main.
5. Al mergear en main, el pipeline despliega automaticamente en Produccion.

## 3. Protocolo de Rollback
En caso de fallo critico en produccion:
1. Revertir el commit defectuoso con git revert <hash-commit>.
2. Hacer push a main para disparar el redespliegue de la version estable.
