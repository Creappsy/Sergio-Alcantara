import { NextRequest, NextResponse } from 'next/server';

// Función para obtener variables de entorno en tiempo de ejecución
function getEnvVars() {
  return {
    B2_KEY_ID: process.env.B2_KEY_ID || '',
    B2_APPLICATION_KEY: process.env.B2_APPLICATION_KEY || '',
    B2_BUCKET_NAME: process.env.B2_BUCKET_NAME || 'creappsy',
    GOFILE_TOKEN: process.env.GOFILE_TOKEN,
    GOFILE_FOLDER_ID: process.env.GOFILE_FOLDER_ID,
  };
}

// Verificar si Backblaze está configurado
function isB2Configured() {
  const { B2_KEY_ID, B2_APPLICATION_KEY } = getEnvVars();
  return !!(B2_KEY_ID && B2_APPLICATION_KEY);
}

// Sanitizar nombre para carpeta (sin caracteres especiales)
function sanitizeFolderName(name: string): string {
  if (!name) return 'unknown';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9_-]/g, '-') // Solo alfanuméricos, guiones y guiones bajos
    .replace(/-+/g, '-') // Sin guiones dobles
    .replace(/^-|-$/g, '') // Sin guiones al inicio/final
    .substring(0, 50); // Máximo 50 caracteres
}

// Generar ID único para submission
function generateSubmissionId(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
  return `${dateStr}_${timeStr}`;
}

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

  const { B2_KEY_ID, B2_APPLICATION_KEY, B2_BUCKET_NAME } = getEnvVars();
  const credentials = Buffer.from(`${B2_KEY_ID}:${B2_APPLICATION_KEY}`).toString('base64');
  
  const res = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
    method: 'GET',
    headers: { 'Authorization': `Basic ${credentials}` },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Backblaze auth failed: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  
  // Guardar datos de autenticación
  b2AuthCache = {
    authorizationToken: data.authorizationToken,
    apiUrl: data.apiUrl,
    downloadUrl: data.downloadUrl,
    bucketId: '', // Lo obtendremos después
  };
  
  b2AuthExpiry = Date.now() + 23 * 60 * 60 * 1000;
  
  // Ahora necesitamos obtener el bucketId listando los buckets
  const bucketRes = await fetch(`${data.apiUrl}/b2api/v2/b2_list_buckets`, {
    method: 'POST',
    headers: {
      'Authorization': data.authorizationToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accountId: data.accountId }),
  });
  
  if (!bucketRes.ok) {
    const errorText = await bucketRes.text();
    throw new Error(`Failed to list buckets: ${bucketRes.status} - ${errorText}`);
  }
  
  const bucketData = await bucketRes.json();
  
  // Encontrar el bucket por nombre
  const bucket = bucketData.buckets?.find((b: { bucketName: string }) => b.bucketName === B2_BUCKET_NAME);
  
  if (!bucket) {
    throw new Error(`Bucket '${B2_BUCKET_NAME}' not found. Available buckets: ${bucketData.buckets?.map((b: { bucketName: string }) => b.bucketName).join(', ') || 'none'}`);
  }
  
  b2AuthCache.bucketId = bucket.bucketId;

  return b2AuthCache;
}

async function uploadToBackblaze(file: File, folderPath: string): Promise<string> {
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
  
  // Subir archivo con la ruta completa de carpeta
  const fileName = `${folderPath}/${Date.now()}_${file.name}`;
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

  const { B2_BUCKET_NAME } = getEnvVars();
  return `${auth.downloadUrl}/file/${B2_BUCKET_NAME}/${encodeURIComponent(fileName)}`;
}

async function uploadToGoFile(file: File, folderPath: string): Promise<string> {
  const { GOFILE_TOKEN, GOFILE_FOLDER_ID } = getEnvVars();
  
  // Obtener servidor
  const serverRes = await fetch('https://api.gofile.io/servers');
  const serverText = await serverRes.text();
  let serverData;
  
  try {
    serverData = JSON.parse(serverText);
  } catch (e) {
    throw new Error(`GoFile server response is not valid JSON: ${serverText.substring(0, 100)}`);
  }
  
  // La API devuelve servers como array
  const server = serverData.data?.servers?.[0]?.name;
  
  if (!server) {
    throw new Error(`Failed to get GoFile server. Response: ${JSON.stringify(serverData)}`);
  }

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

  const uploadText = await uploadRes.text();
  let uploadData;
  
  try {
    uploadData = JSON.parse(uploadText);
  } catch (e) {
    throw new Error(`GoFile upload response is not valid JSON: ${uploadText.substring(0, 200)}`);
  }

  if (uploadData.status !== 'ok' || !uploadData.data) {
    throw new Error(`GoFile error: ${uploadData.status || 'unknown'} - ${JSON.stringify(uploadData)}`);
  }

  return uploadData.data.downloadPage || uploadData.data.directLink;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'general';
    const clientName = (formData.get('clientName') as string) || 'unknown';
    
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

    // Crear estructura de carpetas: cliente/submission_id/tipo_archivo
    const sanitizedClient = sanitizeFolderName(clientName);
    const submissionId = generateSubmissionId();
    const folderPath = `${sanitizedClient}/${submissionId}/${folder}`;

    let url: string;

    // Intentar Backblaze primero (si está configurado)
    if (isB2Configured()) {
      try {
        url = await uploadToBackblaze(file, folderPath);
      } catch (b2Error) {
        console.warn('Backblaze failed, using GoFile:', b2Error);
        url = await uploadToGoFile(file, folderPath);
      }
    } else {
      // Usar GoFile directamente si Backblaze no está configurado
      console.log('Backblaze not configured, using GoFile');
      url = await uploadToGoFile(file, folderPath);
    }

    return NextResponse.json({ 
      success: true, 
      url,
      name: file.name,
      size: file.size,
      type: file.type,
      folderPath, // Incluir la ruta de carpeta en la respuesta
    });

  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Upload failed', message: errorMessage, details: 'Check server logs for more information' },
      { status: 500 }
    );
  }
}