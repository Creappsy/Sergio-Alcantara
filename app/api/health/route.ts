import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Verificar variables de entorno críticas
    const envStatus = {
      hasWeb3formsKey: !!(process.env.WEB3FORMS_KEY || process.env.NEXT_PUBLIC_WEB3FORMS_KEY),
      hasEmailDestino: !!(process.env.EMAIL_DESTINO || process.env.NEXT_PUBLIC_EMAIL_DESTINO),
      hasB2KeyId: !!process.env.B2_KEY_ID,
      hasB2AppKey: !!process.env.B2_APPLICATION_KEY,
      nodeEnv: process.env.NODE_ENV,
    };

    // Listar todas las variables disponibles (solo nombres, no valores por seguridad)
    const availableEnvVars = Object.keys(process.env).filter(key => 
      key.includes('WEB3') || 
      key.includes('EMAIL') || 
      key.includes('B2_') || 
      key.includes('GOFILE') ||
      key === 'NODE_ENV'
    );

    const allOk = envStatus.hasWeb3formsKey && envStatus.hasEmailDestino;

    return NextResponse.json({
      status: allOk ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: {
        ...envStatus,
        availableVars: availableEnvVars,
      },
      message: allOk 
        ? 'Server is configured correctly' 
        : 'Missing required environment variables',
    }, { status: allOk ? 200 : 503 });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
