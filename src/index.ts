#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Tool schemas
const GenerateLayoutSchema = z.object({
  layoutType: z.enum(['hero', 'features', 'pricing', 'testimonials', 'footer', 'contact', 'full-page']),
  style: z.enum(['modern', 'minimal', 'bold', 'corporate', 'creative']).optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  responsive: z.boolean().optional(),
  framework: z.enum(['html', 'react', 'vue', 'tailwind']).optional(),
});

const GenerateComponentSchema = z.object({
  componentType: z.enum(['button', 'card', 'form', 'modal', 'navbar', 'footer', 'sidebar', 'table', 'list']),
  style: z.enum(['modern', 'minimal', 'bold', 'corporate', 'creative']).optional(),
  variant: z.string().optional(),
  framework: z.enum(['html', 'react', 'vue', 'tailwind']).optional(),
});

const GenerateFormSchema = z.object({
  fields: z.array(z.object({
    name: z.string(),
    type: z.enum(['text', 'email', 'password', 'textarea', 'select', 'checkbox', 'radio', 'file']),
    label: z.string(),
    required: z.boolean().optional(),
    placeholder: z.string().optional(),
  })),
  submitText: z.string().optional(),
  style: z.enum(['modern', 'minimal', 'bold']).optional(),
  framework: z.enum(['html', 'react', 'tailwind']).optional(),
});

const OptimizeCSSSchema = z.object({
  css: z.string(),
  minify: z.boolean().optional(),
  addVariables: z.boolean().optional(),
});

// Design patterns
const layouts = {
  hero: (style: string, colors: { primary: string; secondary: string }) => `
<!-- Hero Section - ${style} style -->
<section class="hero" style="
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
  color: white;
  padding: 2rem;
">
  <div class="hero-content" style="max-width: 800px; margin: 0 auto; text-align: center;">
    <h1 style="font-size: 3.5rem; margin-bottom: 1rem; font-weight: 700;">Tu Título Aquí</h1>
    <p style="font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9;">Subtítulo descriptivo que explica tu propuesta de valor</p>
    <div class="cta-buttons" style="display: flex; gap: 1rem; justify-content: center;">
      <a href="#" class="btn btn-primary" style="
        padding: 1rem 2rem;
        background: white;
        color: ${colors.primary};
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
      ">Comenzar</a>
      <a href="#" class="btn btn-secondary" style="
        padding: 1rem 2rem;
        background: transparent;
        color: white;
        text-decoration: none;
        border: 2px solid white;
        border-radius: 8px;
      ">Saber Más</a>
    </div>
  </div>
</section>
`,
  features: (style: string, colors: { primary: string; secondary: string }) => `
<!-- Features Section - ${style} style -->
<section class="features" style="
  padding: 4rem 2rem;
  background: #f8f9fa;
">
  <div class="container" style="max-width: 1200px; margin: 0 auto;">
    <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 3rem; color: ${colors.primary};">Nuestras Características</h2>
    <div class="features-grid" style="
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
    ">
      <div class="feature-card" style="
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        text-align: center;
      ">
        <div class="icon" style="font-size: 3rem; margin-bottom: 1rem;">🚀</div>
        <h3 style="margin-bottom: 0.5rem; color: ${colors.primary};">Característica 1</h3>
        <p style="color: #666;">Descripción breve de la característica y sus beneficios.</p>
      </div>
      <div class="feature-card" style="
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        text-align: center;
      ">
        <div class="icon" style="font-size: 3rem; margin-bottom: 1rem;">⚡</div>
        <h3 style="margin-bottom: 0.5rem; color: ${colors.primary};">Característica 2</h3>
        <p style="color: #666;">Descripción breve de la característica y sus beneficios.</p>
      </div>
      <div class="feature-card" style="
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        text-align: center;
      ">
        <div class="icon" style="font-size: 3rem; margin-bottom: 1rem;">🎯</div>
        <h3 style="margin-bottom: 0.5rem; color: ${colors.primary};">Característica 3</h3>
        <p style="color: #666;">Descripción breve de la característica y sus beneficios.</p>
      </div>
    </div>
  </div>
</section>
`,
  pricing: (style: string, colors: { primary: string; secondary: string }) => `
<!-- Pricing Section - ${style} style -->
<section class="pricing" style="padding: 4rem 2rem; background: white;">
  <div class="container" style="max-width: 1200px; margin: 0 auto;">
    <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 3rem; color: ${colors.primary};">Planes y Precios</h2>
    <div class="pricing-grid" style="
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
    ">
      <div class="pricing-card" style="
        background: #f8f9fa;
        padding: 2rem;
        border-radius: 12px;
        text-align: center;
      ">
        <h3 style="color: ${colors.primary}; margin-bottom: 1rem;">Básico</h3>
        <div class="price" style="font-size: 3rem; font-weight: 700; margin-bottom: 1rem;">$9<span style="font-size: 1rem;">/mes</span></div>
        <ul style="list-style: none; padding: 0; margin-bottom: 2rem;">
          <li style="padding: 0.5rem 0; border-bottom: 1px solid #eee;">✓ Característica 1</li>
          <li style="padding: 0.5rem 0; border-bottom: 1px solid #eee;">✓ Característica 2</li>
          <li style="padding: 0.5rem 0;">✓ Característica 3</li>
        </ul>
        <button style="
          width: 100%;
          padding: 1rem;
          background: ${colors.primary};
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        ">Seleccionar</button>
      </div>
      <div class="pricing-card featured" style="
        background: ${colors.primary};
        color: white;
        padding: 2rem;
        border-radius: 12px;
        text-align: center;
        transform: scale(1.05);
      ">
        <h3 style="margin-bottom: 1rem;">Profesional</h3>
        <div class="price" style="font-size: 3rem; font-weight: 700; margin-bottom: 1rem;">$29<span style="font-size: 1rem;">/mes</span></div>
        <ul style="list-style: none; padding: 0; margin-bottom: 2rem;">
          <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.2);">✓ Todo en Básico</li>
          <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.2);">✓ Característica Premium</li>
          <li style="padding: 0.5rem 0;">✓ Soporte Prioritario</li>
        </ul>
        <button style="
          width: 100%;
          padding: 1rem;
          background: white;
          color: ${colors.primary};
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        ">Seleccionar</button>
      </div>
    </div>
  </div>
</section>
`,
};

const components = {
  button: (variant: string, style: string) => `
<!-- Button Component - ${style} style -->
<button class="btn btn-${variant || 'primary'}" style="
  padding: 0.75rem 1.5rem;
  background: ${variant === 'secondary' ? '#6c757d' : '#007bff'};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
">Botón</button>

<style>
.btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
.btn:active {
  transform: translateY(0);
}
</style>
`,
  card: (variant: string, style: string) => `
<!-- Card Component - ${style} style -->
<div class="card" style="
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  overflow: hidden;
  max-width: 320px;
">
  <div class="card-image" style="
    height: 200px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  "></div>
  <div class="card-content" style="padding: 1.5rem;">
    <h3 style="margin-bottom: 0.5rem;">Título de la Tarjeta</h3>
    <p style="color: #666; margin-bottom: 1rem;">Descripción breve del contenido de la tarjeta.</p>
    <button style="
      padding: 0.5rem 1rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    ">Ver Más</button>
  </div>
</div>
`,
  form: (variant: string, style: string) => `
<!-- Form Component - ${style} style -->
<form class="form" style="
  max-width: 400px;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
">
  <div class="form-group" style="margin-bottom: 1.5rem;">
    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Nombre</label>
    <input type="text" style="
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
    " placeholder="Tu nombre" />
  </div>
  <div class="form-group" style="margin-bottom: 1.5rem;">
    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Email</label>
    <input type="email" style="
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
    " placeholder="tu@email.com" />
  </div>
  <button type="submit" style="
    width: 100%;
    padding: 1rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
  ">Enviar</button>
</form>
`,
};

// Helper functions
function getDefaultColors(style: string): { primary: string; secondary: string } {
  const colorSchemes: Record<string, { primary: string; secondary: string }> = {
    modern: { primary: '#007bff', secondary: '#6c757d' },
    minimal: { primary: '#333333', secondary: '#666666' },
    bold: { primary: '#ff6b6b', secondary: '#4ecdc4' },
    corporate: { primary: '#1a365d', secondary: '#2d3748' },
    creative: { primary: '#9f7aea', secondary: '#ed64a6' },
  };
  return colorSchemes[style] || colorSchemes.modern;
}

// Create server
const server = new Server(
  {
    name: '@creappsy/web-design-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'generate_layout',
        description: 'Generate HTML/CSS code for common web page layouts (hero, features, pricing, testimonials, footer, contact, full-page)',
        inputSchema: {
          type: 'object',
          properties: {
            layoutType: {
              type: 'string',
              enum: ['hero', 'features', 'pricing', 'testimonials', 'footer', 'contact', 'full-page'],
              description: 'Type of layout to generate',
            },
            style: {
              type: 'string',
              enum: ['modern', 'minimal', 'bold', 'corporate', 'creative'],
              description: 'Visual style for the layout',
            },
            primaryColor: {
              type: 'string',
              description: 'Primary brand color (hex)',
            },
            secondaryColor: {
              type: 'string',
              description: 'Secondary brand color (hex)',
            },
            responsive: {
              type: 'boolean',
              description: 'Include responsive styles',
            },
            framework: {
              type: 'string',
              enum: ['html', 'react', 'vue', 'tailwind'],
              description: 'Framework to generate code for',
            },
          },
          required: ['layoutType'],
        },
      },
      {
        name: 'generate_component',
        description: 'Generate reusable UI component code (button, card, form, modal, navbar, footer, sidebar, table, list)',
        inputSchema: {
          type: 'object',
          properties: {
            componentType: {
              type: 'string',
              enum: ['button', 'card', 'form', 'modal', 'navbar', 'footer', 'sidebar', 'table', 'list'],
              description: 'Type of component to generate',
            },
            style: {
              type: 'string',
              enum: ['modern', 'minimal', 'bold', 'corporate', 'creative'],
              description: 'Visual style for the component',
            },
            variant: {
              type: 'string',
              description: 'Component variant (e.g., primary, secondary, outline)',
            },
            framework: {
              type: 'string',
              enum: ['html', 'react', 'vue', 'tailwind'],
              description: 'Framework to generate code for',
            },
          },
          required: ['componentType'],
        },
      },
      {
        name: 'generate_form',
        description: 'Generate custom form HTML/CSS with specified fields',
        inputSchema: {
          type: 'object',
          properties: {
            fields: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  type: { type: 'string', enum: ['text', 'email', 'password', 'textarea', 'select', 'checkbox', 'radio', 'file'] },
                  label: { type: 'string' },
                  required: { type: 'boolean' },
                  placeholder: { type: 'string' },
                },
                required: ['name', 'type', 'label'],
              },
              description: 'Form fields configuration',
            },
            submitText: {
              type: 'string',
              description: 'Submit button text',
            },
            style: {
              type: 'string',
              enum: ['modern', 'minimal', 'bold'],
              description: 'Visual style for the form',
            },
            framework: {
              type: 'string',
              enum: ['html', 'react', 'tailwind'],
              description: 'Framework to generate code for',
            },
          },
          required: ['fields'],
        },
      },
      {
        name: 'optimize_css',
        description: 'Optimize and clean CSS code, add CSS variables for easy theming',
        inputSchema: {
          type: 'object',
          properties: {
            css: {
              type: 'string',
              description: 'CSS code to optimize',
            },
            minify: {
              type: 'boolean',
              description: 'Minify the output CSS',
            },
            addVariables: {
              type: 'boolean',
              description: 'Extract colors and spacing into CSS variables',
            },
          },
          required: ['css'],
        },
      },
      {
        name: 'get_color_palette',
        description: 'Generate a cohesive color palette from a primary color',
        inputSchema: {
          type: 'object',
          properties: {
            primaryColor: {
              type: 'string',
              description: 'Primary brand color (hex)',
            },
            paletteType: {
              type: 'string',
              enum: ['complementary', 'analogous', 'triadic', 'monochromatic'],
              description: 'Type of color palette to generate',
            },
          },
          required: ['primaryColor'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'generate_layout': {
        const parsed = GenerateLayoutSchema.parse(args);
        const colors = {
          primary: parsed.primaryColor || getDefaultColors(parsed.style || 'modern').primary,
          secondary: parsed.secondaryColor || getDefaultColors(parsed.style || 'modern').secondary,
        };
        
        const layoutGenerator = layouts[parsed.layoutType as keyof typeof layouts];
        if (!layoutGenerator) {
          return {
            content: [{ type: 'text', text: `Unknown layout type: ${parsed.layoutType}` }],
            isError: true,
          };
        }
        
        const code = layoutGenerator(parsed.style || 'modern', colors);
        return {
          content: [
            {
              type: 'text',
              text: `# ${parsed.layoutType.toUpperCase()} Layout - ${parsed.style || 'modern'} style\n\n\`\`\`html\n${code}\n\`\`\`\n\n**Usage:** Copy and paste this code into your HTML file. Customize colors and content as needed.`,
            },
          ],
        };
      }
      
      case 'generate_component': {
        const parsed = GenerateComponentSchema.parse(args);
        const componentGenerator = components[parsed.componentType as keyof typeof components];
        
        if (!componentGenerator) {
          return {
            content: [{ type: 'text', text: `Unknown component type: ${parsed.componentType}` }],
            isError: true,
          };
        }
        
        const code = componentGenerator(parsed.variant || 'primary', parsed.style || 'modern');
        return {
          content: [
            {
              type: 'text',
              text: `# ${parsed.componentType.toUpperCase()} Component - ${parsed.style || 'modern'} style\n\n\`\`\`html\n${code}\n\`\`\`\n\n**Usage:** Customize colors, sizes, and content based on your needs.`,
            },
          ],
        };
      }
      
      case 'generate_form': {
        const parsed = GenerateFormSchema.parse(args);
        
        const fieldsHtml = parsed.fields.map(field => {
          const required = field.required ? ' required' : '';
          const requiredMark = field.required ? ' <span style="color: red;">*</span>' : '';
          
          if (field.type === 'textarea') {
            return `
  <div class="form-group" style="margin-bottom: 1rem;">
    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">${field.label}${requiredMark}</label>
    <textarea name="${field.name}"${required} style="
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      min-height: 100px;
    " placeholder="${field.placeholder || ''}"></textarea>
  </div>`;
          }
          
          if (field.type === 'select') {
            return `
  <div class="form-group" style="margin-bottom: 1rem;">
    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">${field.label}${requiredMark}</label>
    <select name="${field.name}"${required} style="
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
    ">
      <option value="">Seleccionar...</option>
    </select>
  </div>`;
          }
          
          const inputType = field.type === 'checkbox' || field.type === 'radio' ? field.type : field.type;
          
          if (field.type === 'checkbox') {
            return `
  <div class="form-group" style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
    <input type="checkbox" name="${field.name}" id="${field.name}"${required} style="width: auto;">
    <label for="${field.name}">${field.label}</label>
  </div>`;
          }
          
          return `
  <div class="form-group" style="margin-bottom: 1rem;">
    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">${field.label}${requiredMark}</label>
    <input type="${inputType}" name="${field.name}"${required} style="
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
    " placeholder="${field.placeholder || ''}" />
  </div>`;
        }).join('\n');
        
        const code = `<form class="form" style="
  max-width: 500px;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
">${fieldsHtml}
  <button type="submit" style="
    width: 100%;
    padding: 1rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
  ">${parsed.submitText || 'Enviar'}</button>
</form>`;
        
        return {
          content: [
            {
              type: 'text',
              text: `# Custom Form - ${parsed.style || 'modern'} style\n\n\`\`\`html\n${code}\n\`\`\`\n\n**Fields:** ${parsed.fields.length}\n**Usage:** Customize labels, placeholders, and add validation as needed.`,
            },
          ],
        };
      }
      
      case 'optimize_css': {
        const parsed = OptimizeCSSSchema.parse(args);
        let optimized = parsed.css;
        
        // Basic optimization
        optimized = optimized
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
          .replace(/\s+/g, ' ') // Normalize whitespace
          .replace(/\s*([{};:,])\s*/g, '$1') // Remove unnecessary spaces
          .replace(/;}/g, '}'); // Remove trailing semicolons before }
        
        // Add CSS variables if requested
        if (parsed.addVariables) {
          const colorRegex = /#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/g;
          const colors = [...new Set(optimized.match(colorRegex) || [])];
          
          let variables = ':root {\n';
          colors.forEach((color, i) => {
            variables += `  --color-${i + 1}: ${color};\n`;
          });
          variables += '}\n\n';
          
          colors.forEach((color, i) => {
            optimized = optimized.replace(new RegExp(color, 'g'), `var(--color-${i + 1})`);
          });
          
          optimized = variables + optimized;
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `# Optimized CSS\n\n\`\`\`css\n${optimized}\n\`\`\`\n\n**Original size:** ${parsed.css.length} bytes\n**Optimized size:** ${optimized.length} bytes\n**Saved:** ${parsed.css.length - optimized.length} bytes`,
            },
          ],
        };
      }
      
      case 'get_color_palette': {
        const { primaryColor, paletteType = 'complementary' } = args as { primaryColor: string; paletteType?: string };
        
        // Simple color palette generation (basic implementation)
        const hexToHsl = (hex: string) => {
          const r = parseInt(hex.slice(1, 3), 16) / 255;
          const g = parseInt(hex.slice(3, 5), 16) / 255;
          const b = parseInt(hex.slice(5, 7), 16) / 255;
          
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          let h = 0, s = 0, l = (max + min) / 2;
          
          if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
              case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
              case g: h = ((b - r) / d + 2) / 6; break;
              case b: h = ((r - g) / d + 4) / 6; break;
            }
          }
          
          return { h: h * 360, s: s * 100, l: l * 100 };
        };
        
        const hslToHex = (h: number, s: number, l: number) => {
          s /= 100;
          l /= 100;
          const a = s * Math.min(l, 1 - l);
          const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
          };
          return `#${f(0)}${f(8)}${f(4)}`;
        };
        
        const { h, s, l } = hexToHsl(primaryColor);
        const palette: Record<string, string[]> = {
          complementary: [
            primaryColor,
            hslToHex((h + 180) % 360, s, l),
            hslToHex(h, s, Math.max(l - 20, 10)),
            hslToHex(h, s, Math.min(l + 20, 90)),
            hslToHex((h + 180) % 360, s, Math.min(l + 10, 90)),
          ],
          analogous: [
            primaryColor,
            hslToHex((h + 30) % 360, s, l),
            hslToHex((h + 60) % 360, s, l),
            hslToHex((h - 30 + 360) % 360, s, l),
            hslToHex((h - 60 + 360) % 360, s, l),
          ],
          triadic: [
            primaryColor,
            hslToHex((h + 120) % 360, s, l),
            hslToHex((h + 240) % 360, s, l),
            hslToHex(h, s * 0.5, l),
            hslToHex(h, s, l * 1.2),
          ],
          monochromatic: [
            primaryColor,
            hslToHex(h, s, Math.max(l - 30, 10)),
            hslToHex(h, s, Math.max(l - 15, 10)),
            hslToHex(h, s, Math.min(l + 15, 90)),
            hslToHex(h, s, Math.min(l + 30, 90)),
          ],
        };
        
        const colors = palette[paletteType as keyof typeof palette] || palette.complementary;
        
        return {
          content: [
            {
              type: 'text',
              text: `# Color Palette - ${paletteType}\n\n**Primary:** ${primaryColor}\n\n${colors.map((c, i) => `Color ${i + 1}: ${c}`).join('\n')}\n\n\`\`\`css\n:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n')}\n}\n\`\`\`\n\n**CSS Variables:** Use these colors in your stylesheets for consistent theming.`,
            },
          ],
        };
      }
      
      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Creappsy Web Design MCP server running on stdio');
}

main().catch(console.error);