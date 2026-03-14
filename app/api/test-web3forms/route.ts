import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const WEB3FORMS_KEY = process.env.WEB3FORMS_KEY || process.env.NEXT_PUBLIC_WEB3FORMS_KEY || '';
    
    if (!WEB3FORMS_KEY) {
      return NextResponse.json({
        success: false,
        message: 'WEB3FORMS_KEY not configured'
      }, { status: 500 });
    }
    
    // Test simple submission to Web3Forms
    const formData = new FormData();
    formData.append('access_key', WEB3FORMS_KEY);
    formData.append('subject', 'Test from Creappsy Form');
    formData.append('email', 'test@example.com');
    formData.append('to', process.env.EMAIL_DESTINO || process.env.NEXT_PUBLIC_EMAIL_DESTINO || 'test@example.com');
    formData.append('from_name', 'Test');
    formData.append('message', 'This is a test submission');
    formData.append('botcheck', '');
    
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData,
    });
    
    const responseText = await res.text();
    
    return NextResponse.json({
      success: res.ok,
      status: res.status,
      response: responseText.substring(0, 500),
      isJson: responseText.trim().startsWith('{'),
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
