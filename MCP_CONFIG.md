# Configuración de Servidores MCP para PadelHere

Este documento detalla la configuración de los servidores del **Model Context Protocol (MCP)** para el proyecto PadelHere.

**IMPORTANTE:** Nunca incluyas credenciales, tokens o claves API en archivos de configuración dentro del repositorio. Utiliza variables de entorno o gestores de secretos locales.

## Servidores MCP Requeridos

Para integrar los servidores, añade la siguiente configuración a tu cliente MCP (por ejemplo, en `~/.config/mcp/config.json` o la configuración de tu editor/IDE):

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "TU_TOKEN_GITHUB"
      }
    },
    "cloudflare": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-cloudflare"],
      "env": {
        "CLOUDFLARE_API_TOKEN": "TU_TOKEN_CLOUDFLARE",
        "CLOUDFLARE_ACCOUNT_ID": "TU_ACCOUNT_ID"
      }
    },
    "mongodb": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-mongodb"],
      "env": {
        "MONGODB_CONNECTION_STRING": "TU_CONNECTION_STRING"
      }
    },
    "render": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-render"],
      "env": {
        "RENDER_API_KEY": "TU_RENDER_API_KEY",
        "RENDER_SERVICE_ID": "TU_RENDER_SERVICE_ID"
      }
    }
  }
}
```

## Pasos para la Integración

1.  **Tokens y Credenciales:** Obtén los tokens necesarios desde los paneles de control de cada servicio.
2.  **Configuración del Entorno:** Sustituye los valores `TU_...` en la configuración anterior por tus credenciales reales.
3.  **Actualización del Cliente:** Reinicia tu cliente MCP o el IDE para que reconozca la nueva configuración.
4.  **Verificación:** Gemini CLI debería detectar automáticamente los nuevos servidores y herramientas disponibles tras el reinicio.

Si tienes problemas con alguno de los servidores, revisa sus repositorios oficiales en GitHub para obtener la versión más reciente del comando de ejecución.
