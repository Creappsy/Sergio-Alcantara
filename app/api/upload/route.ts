import { NextRequest, NextResponse } from 'next/server';

// Configuración desde variables de entorno
const B2_KEY_ID = process.env.B2_KEY_ID || '';
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY || '';
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME || 'creappsy';
const GOFILE_TOKEN = process.env.GOFILE_TOKEN;
const GOFILE_FOLDER_ID = process.env.GOFILE_FOLDER_ID;

// Verificar si Backblaze está configurado
const isB2Configured = B2_KEY_ID && B2_APPLICATION_KEY;

// Tipos de archivo permitidos
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml',
  'application/pdf', 'application/zip', 'application/postscript',
  'application/illustrator', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Cache de autenticación B2
let b2AuthCache: { authorizationToken: string; apiUrl: string; downloadUrl: string; bucketId: string } | null = null;
let b2AuthExpiry = 0;

async function authorizeB2() {
  if (b2AuthCache && Date.now() < b2AuthExpiry) {
    return b2AuthCache;
  }

  const credentials = Buffer.from(`${B2_KEY_ID}:${B2_APPLICATION_KEY}`).toString('base64');
  
  const res = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
    method: 'GET',
    headers: { 'Authorization': `Basic ${credentials}` },
  });

  if (!res.ok) {
    throw new Error('Backblaze auth failed');
  }

  const data = await res.json();
  b2AuthCache = data as typeof b2AuthCache;
  b2AuthExpiry = Date.now() + 23 * 60 * 60 * 1000;

  return b2AuthCache;
}

async function uploadToBackblaze(file: File, folder: string): Promise<string> {
  const auth = await authorizeB2();
  
  if (!auth) {
    throw new Error('Failed to authenticate with Backblaze');
  }
  
  // Obtener URL de subida
  const uploadUrlRes = await fetch(`${auth.apiUrl}/b2api/v2/b2_get_upload_url`, {
    method: 'POST',
    headers: {
      'Authorization': auth.authorizationToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bucketId: auth.bucketId }),
  });

  if (!uploadUrlRes.ok) {
    throw new Error('Failed to get upload URL');
  }

  const uploadUrlData = await uploadUrlRes.json();
  
  // Subir archivo
  const fileName = `${folder}/${Date.now()}_${file.name}`;
  const fileBuffer = await file.arrayBuffer();
  
  const uploadRes = await fetch(uploadUrlData.uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': uploadUrlData.authorizationToken,
      'X-Bz-File-Name': encodeURIComponent(fileName),
      'Content-Type': file.type || 'b2/x-auto',
      'X-Bz-Content-Sha1': 'do_not_verify',
    },
    body: fileBuffer,
  });

  if (!uploadRes.ok) {
    throw new Error('Upload failed');
  }

  return `${auth.downloadUrl}/file/${B2_BUCKET_NAME}/${encodeURIComponent(fileName)}`;
}

async function uploadToGoFile(file: File, folder: string): Promise<string> {
  // Obtener servidor
  const serverRes = await fetch('https://api.gofile.io/createServer');
  const serverData = await serverRes.json();
  
  if (!serverData.data?.server) {
    throw new Error('Failed to get GoFile server');
  }

  const server = serverData.data.server;
  
  // Preparar FormData
  const formData = new FormData();
  formData.append('file', file);
  if (GOFILE_FOLDER_ID) {
    formData.append('folderId', GOFILE_FOLDER_ID);
  }
  
  // Subir
  const uploadRes = await fetch(`https://${server}.gofile.io/uploadFile`, {
    method: 'POST',
    headers: GOFILE_TOKEN ? { 'Authorization': `Bearer ${GOFILE_TOKEN}` } : {},
    body: formData,
  });

  if (!uploadRes.ok) {
    throw new Error('GoFile upload failed');
  }

  const uploadData = await uploadRes.json();
  
  if (uploadData.status !== 'ok' || !uploadData.data) {
    throw new Error('GoFile error');
  }

  return uploadData.data.downloadPage || uploadData.data.directLink;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'general';
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validar tipo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }

    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    let url: string;

    // Intentar Backblaze primero (si está configurado)
    if (isB2Configured) {
      try {
        url = await uploadToBackblaze(file, folder);
      } catch (b2Error) {
        console.warn('Backblaze failed, using GoFile:', b2Error);
        url = await uploadToGoFile(file, folder);
      }
    } else {
      // Usar GoFile directamente si Backblaze no está configurado
      console.log('Backblaze not configured, using GoFile');
      url = await uploadToGoFile(file, folder);
    }

    return NextResponse.json({ 
      success: true, 
      url,
      name: file.name,
      size: file.size,
      type: file.type,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}