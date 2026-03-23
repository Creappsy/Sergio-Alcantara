#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const zod_1 = require("zod");
// Tool schemas
const GenerateLayoutSchema = zod_1.z.object({
    layoutType: zod_1.z.enum(['hero', 'features', 'pricing', 'testimonials', 'footer', 'contact', 'full-page']),
    style: zod_1.z.enum(['modern', 'minimal', 'bold', 'corporate', 'creative']).optional(),
    primaryColor: zod_1.z.string().optional(),
    secondaryColor: zod_1.z.string().optional(),
    responsive: zod_1.z.boolean().optional(),
    framework: zod_1.z.enum(['html', 'react', 'vue', 'tailwind']).optional(),
});
const GenerateComponentSchema = zod_1.z.object({
    componentType: zod_1.z.enum(['button', 'card', 'form', 'modal', 'navbar', 'footer', 'sidebar', 'table', 'list']),
    style: zod_1.z.enum(['modern', 'minimal', 'bold', 'corporate', 'creative']).optional(),
    variant: zod_1.z.string().optional(),
    framework: zod_1.z.enum(['html', 'react', 'vue', 'tailwind']).optional(),
});
const GenerateFormSchema = zod_1.z.object({
    fields: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        type: zod_1.z.enum(['text', 'email', 'password', 'textarea', 'select', 'checkbox', 'radio', 'file']),
        label: zod_1.z.string(),
        required: zod_1.z.boolean().optional(),
        placeholder: zod_1.z.string().optional(),
    })),
    submitText: zod_1.z.string().optional(),
    style: zod_1.z.enum(['modern', 'minimal', 'bold']).optional(),
    framework: zod_1.z.enum(['html', 'react', 'tailwind']).optional(),
});
const OptimizeCSSSchema = zod_1.z.object({
    css: zod_1.z.string(),
    minify: zod_1.z.boolean().optional(),
    addVariables: zod_1.z.boolean().optional(),
});
// Design patterns
const layouts = {
    hero: (style, colors) => `
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
    features: (style, colors) => `
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
    pricing: (style, colors) => `
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
    testimonials: (style, colors) => `
<!-- Testimonials Section - ${style} style -->
<section class="testimonials" style="
  padding: 4rem 2rem;
  background: linear-gradient(180deg, #f8f9fa 0%, white 100%);
">
  <div class="container" style="max-width: 1200px; margin: 0 auto;">
    <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 3rem; color: ${colors.primary};">Lo que dicen nuestros clientes</h2>
    <div class="testimonials-grid" style="
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    ">
      <div class="testimonial-card" style="
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      ">
        <div class="quote" style="font-size: 2rem; color: ${colors.primary}; margin-bottom: 1rem;">"</div>
        <p style="color: #666; margin-bottom: 1.5rem; font-style: italic;">"Excelente servicio y atención al cliente. Muy recomendable."</p>
        <div class="author" style="display: flex; align-items: center; gap: 1rem;">
          <div class="avatar" style="width: 50px; height: 50px; background: ${colors.primary}; border-radius: 50%;"></div>
          <div>
            <strong>Juan Pérez</strong>
            <p style="margin: 0; font-size: 0.875rem; color: #888;">CEO, Empresa ABC</p>
          </div>
        </div>
      </div>
      <div class="testimonial-card" style="
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      ">
        <div class="quote" style="font-size: 2rem; color: ${colors.primary}; margin-bottom: 1rem;">"</div>
        <p style="color: #666; margin-bottom: 1.5rem; font-style: italic;">"Superaron todas mis expectativas. Increíble trabajo."</p>
        <div class="author" style="display: flex; align-items: center; gap: 1rem;">
          <div class="avatar" style="width: 50px; height: 50px; background: ${colors.secondary}; border-radius: 50%;"></div>
          <div>
            <strong>María García</strong>
            <p style="margin: 0; font-size: 0.875rem; color: #888;">Directora, XYZ Corp</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
`,
    footer: (style, colors) => `
<!-- Footer Section - ${style} style -->
<footer style="
  background: ${colors.primary};
  color: white;
  padding: 3rem 2rem;
">
  <div class="container" style="max-width: 1200px; margin: 0 auto;">
    <div class="footer-grid" style="
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    ">
      <div class="footer-col">
        <h4 style="margin-bottom: 1rem;">Logo</h4>
        <p style="opacity: 0.8; font-size: 0.875rem;">Tu descripción breve de la empresa aquí.</p>
      </div>
      <div class="footer-col">
        <h4 style="margin-bottom: 1rem;">Enlaces</h4>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="margin-bottom: 0.5rem;"><a href="#" style="color: white; text-decoration: none; opacity: 0.8;">Inicio</a></li>
          <li style="margin-bottom: 0.5rem;"><a href="#" style="color: white; text-decoration: none; opacity: 0.8;">Servicios</a></li>
          <li style="margin-bottom: 0.5rem;"><a href="#" style="color: white; text-decoration: none; opacity: 0.8;">Precios</a></li>
          <li style="margin-bottom: 0.5rem;"><a href="#" style="color: white; text-decoration: none; opacity: 0.8;">Contacto</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4 style="margin-bottom: 1rem;">Contacto</h4>
        <p style="opacity: 0.8; font-size: 0.875rem;">email@ejemplo.com</p>
        <p style="opacity: 0.8; font-size: 0.875rem;">+34 600 000 000</p>
      </div>
      <div class="footer-col">
        <h4 style="margin-bottom: 1rem;">Síguenos</h4>
        <div style="display: flex; gap: 1rem;">
          <a href="#" style="color: white; text-decoration: none;">FB</a>
          <a href="#" style="color: white; text-decoration: none;">TW</a>
          <a href="#" style="color: white; text-decoration: none;">IG</a>
        </div>
      </div>
    </div>
    <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 2rem; text-align: center; opacity: 0.8; font-size: 0.875rem;">
      © 2024 Tu Empresa. Todos los derechos reservados.
    </div>
  </div>
</footer>
`,
    contact: (style, colors) => `
<!-- Contact Section - ${style} style -->
<section class="contact" style="
  padding: 4rem 2rem;
  background: white;
">
  <div class="container" style="max-width: 1200px; margin: 0 auto;">
    <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 1rem; color: ${colors.primary};">Contáctanos</h2>
    <p style="text-align: center; color: #666; margin-bottom: 3rem;">Estamos aquí para ayudarte</p>
    <div class="contact-grid" style="
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
    ">
      <div class="contact-info">
        <div style="margin-bottom: 2rem;">
          <h4 style="color: ${colors.primary}; margin-bottom: 0.5rem;">Email</h4>
          <p>contacto@ejemplo.com</p>
        </div>
        <div style="margin-bottom: 2rem;">
          <h4 style="color: ${colors.primary}; margin-bottom: 0.5rem;">Teléfono</h4>
          <p>+34 600 000 000</p>
        </div>
        <div style="margin-bottom: 2rem;">
          <h4 style="color: ${colors.primary}; margin-bottom: 0.5rem;">Dirección</h4>
          <p>Calle Ejemplo, 123<br/>28001 Madrid, España</p>
        </div>
      </div>
      <form style="
        background: #f8f9fa;
        padding: 2rem;
        border-radius: 12px;
      ">
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Nombre</label>
          <input type="text" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;" />
        </div>
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Email</label>
          <input type="email" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;" />
        </div>
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Mensaje</label>
          <textarea style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; min-height: 100px;"></textarea>
        </div>
        <button type="submit" style="
          width: 100%;
          padding: 1rem;
          background: ${colors.primary};
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        ">Enviar Mensaje</button>
      </form>
    </div>
  </div>
</section>
`,
    'full-page': (style, colors) => `
<!-- Full Page - ${style} style -->
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mi Página Web</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
  </style>
</head>
<body>
  <nav style="background: white; padding: 1rem 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div class="container" style="display: flex; justify-content: space-between; align-items: center;">
      <strong style="color: ${colors.primary};">Logo</strong>
      <div style="display: flex; gap: 2rem;">
        <a href="#" style="text-decoration: none; color: #333;">Inicio</a>
        <a href="#" style="text-decoration: none; color: #333;">Nosotros</a>
        <a href="#" style="text-decoration: none; color: #333;">Servicios</a>
        <a href="#" style="text-decoration: none; color: #333;">Contacto</a>
      </div>
    </div>
  </nav>
  <header style="background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%); color: white; padding: 6rem 2rem; text-align: center;">
    <h1 style="font-size: 3rem; margin-bottom: 1rem;">Bienvenido a Mi Sitio</h1>
    <p style="font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9;">Tu subtítulo aquí</p>
    <a href="#contacto" style="display: inline-block; padding: 1rem 2rem; background: white; color: ${colors.primary}; text-decoration: none; border-radius: 8px; font-weight: 600;">Contactar</a>
  </header>
  <section style="padding: 4rem 2rem; text-align: center;">
    <h2 style="font-size: 2rem; margin-bottom: 3rem; color: ${colors.primary};">Nuestros Servicios</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
      <div style="padding: 2rem; background: #f8f9fa; border-radius: 12px;">
        <h3 style="color: ${colors.primary}; margin-bottom: 1rem;">Servicio 1</h3>
        <p>Descripción del servicio</p>
      </div>
      <div style="padding: 2rem; background: #f8f9fa; border-radius: 12px;">
        <h3 style="color: ${colors.primary}; margin-bottom: 1rem;">Servicio 2</h3>
        <p>Descripción del servicio</p>
      </div>
      <div style="padding: 2rem; background: #f8f9fa; border-radius: 12px;">
        <h3 style="color: ${colors.primary}; margin-bottom: 1rem;">Servicio 3</h3>
        <p>Descripción del servicio</p>
      </div>
    </div>
  </section>
  <footer id="contacto" style="background: ${colors.primary}; color: white; padding: 3rem 2rem; text-align: center;">
    <h2 style="margin-bottom: 1rem;">¿Listo para empezar?</h2>
    <p style="margin-bottom: 2rem; opacity: 0.9;">Contáctanos hoy mismo</p>
    <a href="mailto:info@ejemplo.com" style="display: inline-block; padding: 1rem 2rem; background: white; color: ${colors.primary}; text-decoration: none; border-radius: 8px; font-weight: 600;">Enviar Email</a>
  </footer>
</body>
</html>
`,
};
const components = {
    button: (variant, style) => `
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
    card: (variant, style) => `
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
    form: (variant, style) => `
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
    modal: (variant, style) => `
<!-- Modal Component - ${style} style -->
<div class="modal-overlay" style="
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
">
  <div class="modal" style="
    background: white;
    border-radius: 12px;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  ">
    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h3 style="margin: 0;">Título del Modal</h3>
      <button style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
    </div>
    <div class="modal-body" style="margin-bottom: 1.5rem;">
      <p>Contenido del modal aquí.</p>
    </div>
    <div class="modal-footer" style="display: flex; gap: 1rem; justify-content: flex-end;">
      <button style="padding: 0.5rem 1rem; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">Cancelar</button>
      <button style="padding: 0.5rem 1rem; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer;">Guardar</button>
    </div>
  </div>
</div>
`,
    navbar: (variant, style) => `
<!-- Navbar Component - ${style} style -->
<nav style="
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
">
  <div class="logo" style="font-size: 1.5rem; font-weight: 700; color: #007bff;">Logo</div>
  <div class="nav-links" style="display: flex; gap: 2rem;">
    <a href="#" style="text-decoration: none; color: #333;">Inicio</a>
    <a href="#" style="text-decoration: none; color: #333;">Servicios</a>
    <a href="#" style="text-decoration: none; color: #333;">Precios</a>
    <a href="#" style="text-decoration: none; color: #333;">Contacto</a>
  </div>
  <button style="padding: 0.5rem 1.5rem; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer;">CTA</button>
</nav>
`,
    sidebar: (variant, style) => `
<!-- Sidebar Component - ${style} style -->
<aside style="
  width: 250px;
  background: #f8f9fa;
  padding: 2rem;
  height: 100vh;
  box-shadow: 2px 0 4px rgba(0,0,0,0.1);
">
  <div class="sidebar-header" style="margin-bottom: 2rem;">
    <h3 style="color: #007bff;">Menú</h3>
  </div>
  <ul style="list-style: none; padding: 0; margin: 0;">
    <li style="margin-bottom: 1rem;">
      <a href="#" style="display: block; padding: 0.75rem; color: #333; text-decoration: none; border-radius: 6px; transition: background 0.2s;">
        Dashboard
      </a>
    </li>
    <li style="margin-bottom: 1rem;">
      <a href="#" style="display: block; padding: 0.75rem; color: #333; text-decoration: none; border-radius: 6px; transition: background 0.2s;">
        Perfil
      </a>
    </li>
    <li style="margin-bottom: 1rem;">
      <a href="#" style="display: block; padding: 0.75rem; color: #333; text-decoration: none; border-radius: 6px; transition: background 0.2s;">
        Configuración
      </a>
    </li>
  </ul>
</aside>
`,
    table: (variant, style) => `
<!-- Table Component - ${style} style -->
<table style="
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
">
  <thead style="background: #007bff; color: white;">
    <tr>
      <th style="padding: 1rem; text-align: left;">Nombre</th>
      <th style="padding: 1rem; text-align: left;">Email</th>
      <th style="padding: 1rem; text-align: left;">Rol</th>
      <th style="padding: 1rem; text-align: left;">Acciones</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 1rem;">Juan Pérez</td>
      <td style="padding: 1rem;">juan@ejemplo.com</td>
      <td style="padding: 1rem;">Admin</td>
      <td style="padding: 1rem;">
        <button style="padding: 0.25rem 0.5rem; margin-right: 0.5rem; cursor: pointer;">Editar</button>
        <button style="padding: 0.25rem 0.5rem; cursor: pointer;">Eliminar</button>
      </td>
    </tr>
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 1rem;">María García</td>
      <td style="padding: 1rem;">maria@ejemplo.com</td>
      <td style="padding: 1rem;">Usuario</td>
      <td style="padding: 1rem;">
        <button style="padding: 0.25rem 0.5rem; margin-right: 0.5rem; cursor: pointer;">Editar</button>
        <button style="padding: 0.25rem 0.5rem; cursor: pointer;">Eliminar</button>
      </td>
    </tr>
  </tbody>
</table>
`,
    list: (variant, style) => `
<!-- List Component - ${style} style -->
<ul style="
  list-style: none;
  padding: 0;
  margin: 0;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
">
  <li style="
    padding: 1rem;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: center;
    gap: 1rem;
  ">
    <span style="width: 8px; height: 8px; background: #007bff; border-radius: 50%;"></span>
    <span>Elemento de lista 1</span>
  </li>
  <li style="
    padding: 1rem;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: center;
    gap: 1rem;
  ">
    <span style="width: 8px; height: 8px; background: #007bff; border-radius: 50%;"></span>
    <span>Elemento de lista 2</span>
  </li>
  <li style="
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  ">
    <span style="width: 8px; height: 8px; background: #007bff; border-radius: 50%;"></span>
    <span>Elemento de lista 3</span>
  </li>
</ul>
`,
};
// Helper functions
function getDefaultColors(style) {
    const colorSchemes = {
        modern: { primary: '#007bff', secondary: '#6c757d' },
        minimal: { primary: '#333333', secondary: '#666666' },
        bold: { primary: '#ff6b6b', secondary: '#4ecdc4' },
        corporate: { primary: '#1a365d', secondary: '#2d3748' },
        creative: { primary: '#9f7aea', secondary: '#ed64a6' },
    };
    return colorSchemes[style] || colorSchemes.modern;
}
// Create server
const server = new index_js_1.Server({
    name: '@creappsy/web-design-mcp',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
// List available tools
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
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
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case 'generate_layout': {
                const parsed = GenerateLayoutSchema.parse(args);
                const colors = {
                    primary: parsed.primaryColor || getDefaultColors(parsed.style || 'modern').primary,
                    secondary: parsed.secondaryColor || getDefaultColors(parsed.style || 'modern').secondary,
                };
                const layoutGenerator = layouts[parsed.layoutType];
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
                const componentGenerator = components[parsed.componentType];
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
                const { primaryColor, paletteType = 'complementary' } = args;
                // Simple color palette generation (basic implementation)
                const hexToHsl = (hex) => {
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
                            case r:
                                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                                break;
                            case g:
                                h = ((b - r) / d + 2) / 6;
                                break;
                            case b:
                                h = ((r - g) / d + 4) / 6;
                                break;
                        }
                    }
                    return { h: h * 360, s: s * 100, l: l * 100 };
                };
                const hslToHex = (h, s, l) => {
                    s /= 100;
                    l /= 100;
                    const a = s * Math.min(l, 1 - l);
                    const f = (n) => {
                        const k = (n + h / 30) % 12;
                        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
                        return Math.round(255 * color).toString(16).padStart(2, '0');
                    };
                    return `#${f(0)}${f(8)}${f(4)}`;
                };
                const { h, s, l } = hexToHsl(primaryColor);
                const palette = {
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
                const colors = palette[paletteType] || palette.complementary;
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
    }
    catch (error) {
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
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error('Creappsy Web Design MCP server running on stdio');
}
main().catch(console.error);
//# sourceMappingURL=index.js.map