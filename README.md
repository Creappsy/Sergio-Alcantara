# @creappsy/web-design-mcp

MCP (Model Context Protocol) server para generación de código de diseño web.

## Instalación

```bash
npm install
npm run build
```

## Uso con Claude Desktop

Agrega esto a tu configuración de Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "web-design": {
      "command": "node",
      "args": ["/ruta/a/mcp-server/dist/index.js"]
    }
  }
}
```

## Herramientas disponibles

### `generate_layout`
Genera código HTML/CSS para layouts comunes:
- `hero` - Sección hero con título y CTAs
- `features` - Grid de características
- `pricing` - Tabla de precios
- `testimonials` - Testimonios
- `footer` - Pie de página
- `contact` - Formulario de contacto
- `full-page` - Página completa

**Parámetros:**
- `layoutType` (requerido): Tipo de layout
- `style`: `modern` | `minimal` | `bold` | `corporate` | `creative`
- `primaryColor`: Color primario (hex)
- `secondaryColor`: Color secundario (hex)
- `framework`: `html` | `react` | `vue` | `tailwind`

### `generate_component`
Genera componentes UI reutilizables:
- `button` - Botón
- `card` - Tarjeta
- `form` - Formulario
- `modal` - Modal
- `navbar` - Barra de navegación
- `footer` - Pie de página
- `sidebar` - Barra lateral
- `table` - Tabla
- `list` - Lista

### `generate_form`
Genera formularios personalizados con campos específicos.

### `optimize_css`
Optimiza código CSS:
- Elimina comentarios
- Minifica espacios
- Extrae colores a variables CSS

### `get_color_palette`
Genera paletas de colores coherentes:
- `complementary` - Colores complementarios
- `analogous` - Colores análogos
- `triadic` - Tríada de colores
- `monochromatic` - Monocromático

## Ejemplo de uso

```
Usuario: Genera un hero section moderno con colores azul y naranja

Claude usaría:
generate_layout({
  layoutType: "hero",
  style: "modern", 
  primaryColor: "#007bff",
  secondaryColor: "#ff6b00"
})
```

## Estilos disponibles

### Modern
- Limpio y minimalista
- Sombras suaves
- Border radius moderado

### Minimal
- Sin decoraciones extras
- Tipografía limpia
- Espacios blancos

### Bold
- Colores vibrantes
- Contrastes altos
- Tipografías grandes

### Corporate
- Profesional
- Azules y grises
- Conservador

### Creative
- Gradientes
- Colores llamativos
- Diseño único