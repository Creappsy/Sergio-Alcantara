import { NextRequest, NextResponse } from 'next/server';

const WEB3FORMS_KEY = process.env.WEB3FORMS_KEY || process.env.NEXT_PUBLIC_WEB3FORMS_KEY || '';
const EMAIL_DESTINO = process.env.EMAIL_DESTINO || process.env.NEXT_PUBLIC_EMAIL_DESTINO || '';

// Verificar configuración al iniciar
if (!WEB3FORMS_KEY) {
  console.error('ERROR: WEB3FORMS_KEY no está configurada');
}
if (!EMAIL_DESTINO) {
  console.error('ERROR: EMAIL_DESTINO no está configurada');
}

// Rate limiting en memoria (para producción usar Redis)
const submissions = new Map<string, { count: number; firstAttempt: number; blocked: boolean; blockedUntil?: number }>();
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutos

// Patrones de spam
const SPAM_PATTERNS = [
  /\[url=/i, /\[link=/i, /<a\s+href=/i,
  /viagra|cialis|casino|poker|lottery|winner/i,
  /click\s*here\s*now/i, /free\s*money/i,
];

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  return forwarded?.split(',')[0]?.trim() || realIP || 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; waitTime?: number; message?: string } {
  const now = Date.now();
  const entry = submissions.get(ip);

  if (entry?.blocked && entry.blockedUntil && now < entry.blockedUntil) {
    const remaining = Math.ceil((entry.blockedUntil - now) / 1000);
    return { allowed: false, waitTime: remaining, message: `Bloqueado. Espera ${remaining} segundos.` };
  }

  if (!entry) {
    submissions.set(ip, { count: 1, firstAttempt: now, blocked: false });
    return { allowed: true };
  }

  if (now - entry.firstAttempt > BLOCK_DURATION_MS) {
    submissions.set(ip, { count: 1, firstAttempt: now, blocked: false });
    return { allowed: true };
  }

  entry.count++;
  
  if (entry.count >= MAX_ATTEMPTS) {
    entry.blocked = true;
    entry.blockedUntil = now + BLOCK_DURATION_MS;
    return { allowed: false, message: `Límite de ${MAX_ATTEMPTS} intentos alcanzado. Intenta en 15 minutos.` };
  }

  return { allowed: true };
}

function detectSpam(text: string): boolean {
  const lower = text.toLowerCase();
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(lower)) return true;
  }
  const urlCount = (text.match(/https?:\/\//g) || []).length;
  return urlCount > 10;
}

function sanitizeInput(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').trim().substring(0, 10000);
}

export async function POST(req: NextRequest) {
  try {
    // Validar configuración antes de procesar
    if (!WEB3FORMS_KEY || !EMAIL_DESTINO) {
      console.error('Missing config:', { hasKey: !!WEB3FORMS_KEY, hasEmail: !!EMAIL_DESTINO });
      return NextResponse.json(
        { success: false, message: 'Server configuration error: Missing required environment variables' },
        { status: 500 }
      );
    }

    const ip = getClientIP(req);
    
    // Rate limiting
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, message: rateCheck.message || 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await req.json();
    
    // Verificar honeypot
    if (body.website || body.email_confirm || body._gotcha) {
      return NextResponse.json({ success: false, message: 'Invalid submission' }, { status: 400 });
    }

    // Verificar tiempo del formulario
    if (body._timestamp) {
      const formTime = parseInt(body._timestamp, 10);
      if (Date.now() - formTime < 3000) {
        return NextResponse.json({ success: false, message: 'Submission too fast' }, { status: 400 });
      }
    }

    // Detectar spam
    const fieldsToCheck = ['brandName', 'bioShort', 'bioLong', 'pressName', 'extraNotes'];
    for (const field of fieldsToCheck) {
      if (body[field] && detectSpam(body[field])) {
        return NextResponse.json({ success: false, message: 'Spam detected' }, { status: 400 });
      }
    }

    // Validar email requerido
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!body.pressEmail || !emailRegex.test(body.pressEmail)) {
      return NextResponse.json({ success: false, message: 'Invalid email' }, { status: 400 });
    }

    // Preparar datos para Web3Forms
    const formData = new FormData();
    formData.append('access_key', WEB3FORMS_KEY);
    formData.append('subject', `[Creappsy] Nueva solicitud de ${sanitizeInput(body.brandName || 'Artista')}`);
    formData.append('email', sanitizeInput(body.pressEmail));
    formData.append('to', EMAIL_DESTINO);
    formData.append('from_name', sanitizeInput(body.brandName || 'Artista'));
    formData.append('botcheck', '');

    // Campos principales
    formData.append('Nombre Artístico', sanitizeInput(body.brandName || '-'));
    formData.append('Manager/PR', sanitizeInput(body.pressName || '-'));
    formData.append('Email de Contacto', sanitizeInput(body.pressEmail || '-'));
    formData.append('Teléfono', sanitizeInput(body.pressPhone || '-'));
    formData.append('Dominio Deseado', sanitizeInput(body.domain || '-'));
    formData.append('Bio Corta', sanitizeInput((body.bioShort || '-').substring(0, 500)));

    // Redes sociales
    if (body.socialLinks && Array.isArray(body.socialLinks)) {
      const socialText = body.socialLinks.map((s: { platform: string; url: string }) => 
        `${s.platform}: ${sanitizeInput(s.url)}`
      ).join('\n');
      formData.append('Redes Sociales', socialText);
    }

    // Archivos
    if (body._files && Object.keys(body._files).length > 0) {
      const fileList: string[] = [];
      for (const [field, files] of Object.entries(body._files)) {
        if (Array.isArray(files)) {
          const urls = (files as Array<{ url: string }>).map((f) => f.url).join('\n  ');
          fileList.push(`${field}:\n  ${urls}`);
        }
      }
      formData.append('Archivos Subidos', fileList.join('\n\n'));
    }

    // JSON completo
    formData.append('json_completo', JSON.stringify(body, null, 2));

    // Enviar a Web3Forms
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData,
    });

    const resData = await res.json();

    if (!res.ok || !resData.success) {
      return NextResponse.json(
        { success: false, message: resData.message || 'Failed to submit' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Form submitted successfully',
      submissionId: `sub_${Date.now().toString(36)}`
    });

  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}