'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { config } from '@/lib/config';
import {
  validateEmail,
  validateHexColor,
  checkRateLimit,
  recordSubmission,
  uploadFiles,
  submitForm,
  downloadJson,
  generateFileName,
} from '@/lib/utils';
import { useAccessibility } from '@/hooks/useAccessibility';
import { VoiceGuidedInput } from '@/components/VoiceGuidedInput';
import { AccessibilityPanel } from '@/components/AccessibilityPanel';
import { VoiceInstructions } from '@/components/VoiceInstructions';
import type { FormData, Member, Album, Video, Event, MerchItem, UploadedFile } from '@/lib/types';

// Instrucciones para el asistente de voz
const voiceInstructions = {
  bioShort: [
    "Di el nombre artístico o del proyecto musical",
    "Menciona el género musical principal",
    "Describe en una frase tu estilo o propuesta única",
    "Agrega tu ciudad o región de origen"
  ],
  bioLong: [
    "Cuéntanos cómo empezó el proyecto: año y circunstancias",
    "Menciona los miembros principales y sus roles",
    "Describe tus influencias musicales",
    "Habla sobre tus logros más importantes hasta ahora",
    "Menciona próximos proyectos o lanzamientos"
  ],
  aiNotes: [
    "¿Usas alguna herramienta de IA actualmente?",
    "¿Para qué usas la IA? Por ejemplo: letras, imágenes, videos",
    "¿Quieres integrar más herramientas de IA en tu proyecto?"
  ],
  extraNotes: [
    "¿Tienes alguna fecha límite importante para el sitio web?",
    "Menciona eventos próximos donde necesites el sitio listo",
    "¿Hay alguna restricción o requisito especial que debamos saber?",
    "¿Algo más que quieras contarnos sobre tu proyecto?"
  ]
};

const initialFormData: FormData = {
  brandName: '',
  domain: '',
  tagline: '',
  logo: [],
  guia_marca: [],
  colorPrimary: '',
  colorSecondary: '',
  colorAccent: '',
  fonts: '',
  bioShort: '',
  bioLong: '',
  press_kit: [],
  spotify: '',
  appleMusic: '',
  youtube: '',
  instagram: '',
  tiktok: '',
  facebook: '',
  twitter: '',
  soundcloud: '',
  bandcamp: '',
  deezer: '',
  members: [],
  discography: [],
  fotos_hq: [],
  fotos_live: [],
  posters: [],
  videos: [],
  events: [],
  merch: [],
  fotos_merch: [],
  pressName: '',
  pressEmail: '',
  pressPhone: '',
  docs_prensa: [],
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  ogImage: '',
  references: '',
  ticketsInfo: '',
  aiNotes: '',
  extraNotes: '',
};

const sections = [
  { id: 1, name: 'Branding & Assets', label: 'Branding & Assets' },
  { id: 2, name: 'Biografía & Editorial', label: 'Biografía' },
  { id: 3, name: 'Redes Sociales', label: 'Redes Sociales' },
  { id: 4, name: 'Discografía', label: 'Discografía' },
  { id: 5, name: 'Fotos & Videos', label: 'Fotos & Videos' },
  { id: 6, name: 'Agenda & Eventos', label: 'Eventos' },
  { id: 7, name: 'Merchandising', label: 'Merch' },
  { id: 8, name: 'Prensa & Contacto', label: 'Prensa' },
  { id: 9, name: 'SEO & Metadatos', label: 'SEO' },
  { id: 10, name: 'Notas Adicionales', label: 'Notas' },
];

export default function FormPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile[]>>({});
  const [progress, setProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const formRef = useRef<HTMLFormElement>(null);

  const updateProgress = useCallback(() => {
    const inputs = formRef.current?.querySelectorAll('input:not([type="file"]), textarea, select');
    if (!inputs) return;
    
    let filled = 0;
    inputs.forEach((el) => {
      const input = el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (input.value.trim()) filled++;
    });

    const fileInputs = [
      formData.logo,
      formData.guia_marca,
      formData.press_kit,
      formData.fotos_hq,
      formData.fotos_live,
      formData.posters,
      formData.fotos_merch,
      formData.docs_prensa,
    ];
    fileInputs.forEach((files) => {
      filled += files.length;
    });

    const total = inputs.length + 8;
    const pct = Math.min(100, Math.round((filled / total) * 100));
    setProgress(pct);
  }, [formData]);

  useEffect(() => {
    updateProgress();
  }, [formData, updateProgress]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      
      const sectionElements = document.querySelectorAll('.section');
      let current = 0;
      sectionElements.forEach((section, idx) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150) current = idx;
      });
      setCurrentSection(current);
    };

    // IntersectionObserver para mostrar secciones
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.05 }
    );

    document.querySelectorAll('.section').forEach((section) => {
      observer.observe(section);
    });

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear invalid state when user starts typing
    if (invalidFields.has(name)) {
      setInvalidFields((prev) => {
        const newSet = new Set(prev);
        newSet.delete(name);
        return newSet;
      });
    }
  };

  const handleFileChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({
      ...prev,
      [field]: files,
    }));
  };

  const removeFile = (field: keyof FormData, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as File[]).filter((_, i) => i !== index),
    }));
  };

  const addMember = () => {
    setFormData((prev) => ({
      ...prev,
      members: [...prev.members, { name: '', role: '', social: '', bio: '', photoUrl: '' }],
    }));
  };

  const updateMember = (index: number, field: keyof Member, value: string) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    }));
  };

  const removeMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
    }));
  };

  const addAlbum = () => {
    setFormData((prev) => ({
      ...prev,
      discography: [
        ...prev.discography,
        {
          title: '',
          releaseDate: '',
          type: 'album',
          label: '',
          tracks: '',
          formats: '',
          coverUrl: '',
          spotifyUrl: '',
          appleMusicUrl: '',
          youtubeUrl: '',
        },
      ],
    }));
  };

  const updateAlbum = (index: number, field: keyof Album, value: string) => {
    setFormData((prev) => ({
      ...prev,
      discography: prev.discography.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
    }));
  };

  const removeAlbum = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      discography: prev.discography.filter((_, i) => i !== index),
    }));
  };

  const addVideo = () => {
    setFormData((prev) => ({
      ...prev,
      videos: [...prev.videos, { title: '', platform: 'youtube', url: '', caption: '' }],
    }));
  };

  const updateVideo = (index: number, field: keyof Video, value: string) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    }));
  };

  const removeVideo = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
  };

  const addEvent = () => {
    setFormData((prev) => ({
      ...prev,
      events: [
        ...prev.events,
        {
          title: '',
          dateTime: '',
          city: '',
          country: '',
          venueName: '',
          venueAddress: '',
          capacity: '',
          ticketPrice: '',
          ticketsLink: '',
          description: '',
        },
      ],
    }));
  };

  const updateEvent = (index: number, field: keyof Event, value: string) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.map((e, i) => (i === index ? { ...e, [field]: value } : e)),
    }));
  };

  const removeEvent = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.filter((_, i) => i !== index),
    }));
  };

  const addMerch = () => {
    setFormData((prev) => ({
      ...prev,
      merch: [
        ...prev.merch,
        {
          name: '',
          sku: '',
          price: '',
          stock: '',
          category: '',
          sizes: '',
          colors: '',
          weight: '',
          description: '',
          imageUrl: '',
        },
      ],
    }));
  };

  const updateMerch = (index: number, field: keyof MerchItem, value: string) => {
    setFormData((prev) => ({
      ...prev,
      merch: prev.merch.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    }));
  };

  const removeMerch = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      merch: prev.merch.filter((_, i) => i !== index),
    }));
  };

  const scrollToSection = (index: number) => {
    const section = document.querySelectorAll('.section')[index];
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInvalidFields(new Set());
    setIsSubmitting(true);

    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
      setError(
        rateCheck.waitTime
          ? `Por favor espera ${rateCheck.waitTime} segundos antes de enviar de nuevo.`
          : rateCheck.message || 'Límite de envíos alcanzado.'
      );
      setIsSubmitting(false);
      return;
    }

    // Validate required fields
    const newInvalidFields = new Set<string>();
    const missingFields: string[] = [];

    if (!formData.pressName.trim()) {
      newInvalidFields.add('pressName');
      missingFields.push('Nombre del manager/PR');
    }

    if (!formData.pressEmail.trim()) {
      newInvalidFields.add('pressEmail');
      missingFields.push('Email de contacto');
    } else if (!validateEmail(formData.pressEmail)) {
      newInvalidFields.add('pressEmail');
      setError('El email de contacto no es válido.');
      setInvalidFields(newInvalidFields);
      setIsSubmitting(false);
      // Scroll to first invalid field
      document.getElementById('pressEmail')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (missingFields.length > 0) {
      setError(`Por favor completa: ${missingFields.join(', ')}`);
      setInvalidFields(newInvalidFields);
      setIsSubmitting(false);
      // Scroll to first invalid field
      const firstInvalid = newInvalidFields.values().next().value;
      if (firstInvalid) {
        document.getElementById(firstInvalid)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (formData.colorPrimary && !validateHexColor(formData.colorPrimary)) {
      setError('El color principal debe tener formato #RRGGBB (ej: #FF5733)');
      setIsSubmitting(false);
      return;
    }

    try {
      const socialLinks = [
        { platform: 'spotify', url: formData.spotify },
        { platform: 'appleMusic', url: formData.appleMusic },
        { platform: 'youtube', url: formData.youtube },
        { platform: 'instagram', url: formData.instagram },
        { platform: 'tiktok', url: formData.tiktok },
        { platform: 'facebook', url: formData.facebook },
        { platform: 'twitter', url: formData.twitter },
        { platform: 'soundcloud', url: formData.soundcloud },
        { platform: 'bandcamp', url: formData.bandcamp },
        { platform: 'deezer', url: formData.deezer },
      ].filter((s) => s.url);

      const dataToSubmit: Record<string, unknown> = {
        ...formData,
        socialLinks,
        _meta: {
          generatedAt: new Date().toISOString(),
          formVersion: '3.0',
          client: 'Creappsy',
        },
      };

      const fileFields: Array<{ field: keyof FormData; files: File[] }> = [
        { field: 'logo', files: formData.logo },
        { field: 'guia_marca', files: formData.guia_marca },
        { field: 'press_kit', files: formData.press_kit },
        { field: 'fotos_hq', files: formData.fotos_hq },
        { field: 'fotos_live', files: formData.fotos_live },
        { field: 'posters', files: formData.posters },
        { field: 'fotos_merch', files: formData.fotos_merch },
        { field: 'docs_prensa', files: formData.docs_prensa },
      ];

      const uploaded: Record<string, UploadedFile[]> = {};
      for (const { field, files } of fileFields) {
        if (files.length > 0) {
          const result = await uploadFiles(files, field as string, formData.brandName || formData.pressName || 'cliente');
          if (result.length > 0) {
            uploaded[field] = result;
          }
        }
      }
      setUploadedFiles(uploaded);

      if (config.submitMode === 'web3forms') {
        const result = await submitForm(dataToSubmit, uploaded);
        if (!result.success) {
          setError(result.message);
          return;
        }
        recordSubmission();
        setIsSuccess(true);
      } else {
        const fileName = generateFileName(formData.brandName);
        downloadJson({ ...dataToSubmit, _files: uploaded }, fileName);
        setIsSuccess(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al enviar: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFilePreview = (files: File[]) => {
    return files.map((file, idx) => {
      const isImage = file.type.startsWith('image/');
      if (isImage) {
        const url = URL.createObjectURL(file);
        return { file, url, idx, isImage };
      }
      return { file, url: null, idx, isImage: false };
    });
  };

  if (isSuccess) {
    const totalFiles = Object.values(uploadedFiles).reduce((sum, arr) => sum + arr.length, 0);

    return (
      <div className="success-screen" style={{ display: 'block' }}>
        <div className="success-icon">🎸</div>
        <h2>¡Listo!</h2>
        <p>
          Información recibida correctamente.
          <br />
          Creappsy revisará los datos y se pondrán en contacto pronto.
        </p>
        <br />
        <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7 }}>
          {config.submitMode === 'web3forms' ? (
            <>
              ✅ <strong>Datos y archivos enviados correctamente</strong>
              <br />
              <small style={{ opacity: 0.7 }}>
                Recibirás un correo de confirmación
              </small>
              <br />
              <small style={{ opacity: 0.7 }}>(revisa la carpeta de spam si no lo ves)</small>
              {totalFiles > 0 && (
                <>
                  <br />
                  <small style={{ opacity: 0.7 }}>
                    ✓ {totalFiles} archivo{totalFiles > 1 ? 's' : ''} subido
                    {totalFiles > 1 ? 's' : ''} a la nube
                  </small>
                </>
              )}
            </>
          ) : (
            <>
              📥 <strong>Archivo descargado</strong>
              <br />
              <small style={{ opacity: 0.7 }}>
                Adjunta el JSON a {config.emailDestino}
              </small>
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <>
      <VoiceInstructions />
      
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>
      
      <AccessibilityPanel />
      
      <div className="container" id="main-content">
        <header>
          <div className="logo-badge">Creappsy × Sergio Alcántara</div>
          <h1>
            DATOS DEL
            <br />
            <span>ARTISTA</span>
          </h1>
          <p className="subtitle">
            Completa este formulario para que podamos construir
            <br />
            tu sitio web oficial. Todos los campos son editables después.
          </p>
        </header>

      <div className="progress-wrap" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
<div className="progress-info">
  <span className="progress-label">{sections[currentSection]?.name}</span>
  <span className="progress-divider">|</span>
  <span className="progress-pct">{progress}% completado</span>
</div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <main>
        <form ref={formRef} onSubmit={handleSubmit} noValidate autoComplete="on">
          {/* Section 1: Branding */}
          <section className="section visible" data-section="1">
            <div className="section-header">
              <span className="section-num">1</span>
              <div>
                <div className="section-title">Branding & Assets</div>
                <div className="section-desc">Nombre artístico, logo, colores y tipografías</div>
              </div>
            </div>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="brandName">Nombre artístico o de banda</label>
                <input
                  type="text"
                  id="brandName"
                  name="brandName"
                  value={formData.brandName}
                  onChange={handleInputChange}
                  placeholder="Ej: Los Rolling Stones"
                />
              </div>
              <div className="field">
                <label htmlFor="domain">Dominio deseado</label>
                <input
                  type="text"
                  id="domain"
                  name="domain"
                  value={formData.domain}
                  onChange={handleInputChange}
                  placeholder="tunombre.com o banda.com"
                />
              </div>
              <div className="field full">
                <label htmlFor="tagline">Tagline / Eslogan</label>
                <input
                  type="text"
                  id="tagline"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleInputChange}
                  placeholder="Una frase corta que te defina (opcional)"
                />
              </div>
              <div className="field">
                <label>Logo principal (PNG, SVG, AI)</label>
                <FileUploadZone
                  field="logo"
                  files={formData.logo}
                  onChange={handleFileChange('logo')}
                  onRemove={(idx) => removeFile('logo', idx)}
                />
              </div>
              <div className="field">
                <label>Guía de marca o manual</label>
                <FileUploadZone
                  field="guia_marca"
                  files={formData.guia_marca}
                  onChange={handleFileChange('guia_marca')}
                  onRemove={(idx) => removeFile('guia_marca', idx)}
                />
              </div>
              <div className="field">
                <label htmlFor="colorPrimary">Color principal</label>
                <input
                  type="text"
                  id="colorPrimary"
                  name="colorPrimary"
                  value={formData.colorPrimary}
                  onChange={handleInputChange}
                  placeholder="#FF5733"
                />
              </div>
              <div className="field">
                <label htmlFor="colorSecondary">Color secundario</label>
                <input
                  type="text"
                  id="colorSecondary"
                  name="colorSecondary"
                  value={formData.colorSecondary}
                  onChange={handleInputChange}
                  placeholder="#333333"
                />
              </div>
              <div className="field full">
                <label htmlFor="fonts">Tipografías preferidas</label>
                <input
                  type="text"
                  id="fonts"
                  name="fonts"
                  value={formData.fonts}
                  onChange={handleInputChange}
                  placeholder="Ej: Montserrat, Roboto, etc."
                />
              </div>
            </div>
          </section>

          <div className="divider" role="separator" />

          {/* Section 2: Biography */}
          <section className="section" data-section="2">
            <div className="section-header">
              <span className="section-num">2</span>
              <div>
                <div className="section-title">Biografía & Editorial</div>
                <div className="section-desc">Textos para la web y medios</div>
              </div>
            </div>
            <div className="field-grid">
              <div className="field full">
                <label htmlFor="bioShort">Bio corta (máx. 160 palabras)</label>
                <VoiceGuidedInput
                  fieldName="bioShort"
                  instructions={voiceInstructions.bioShort}
                  value={formData.bioShort}
                  onChange={handleInputChange}
                  onTranscript={(text) => setFormData(prev => ({ ...prev, bioShort: prev.bioShort + text }))}
                  placeholder="Párrafo conciso para bios de redes y fichas de prensa..."
                  rows={3}
                  hint={`${formData.bioShort.trim().split(/\s+/).filter(Boolean).length} / 160 palabras`}
                />
              </div>
              <div className="field full">
                <label htmlFor="bioLong">Bio extendida</label>
                <VoiceGuidedInput
                  fieldName="bioLong"
                  instructions={voiceInstructions.bioLong}
                  value={formData.bioLong}
                  onChange={handleInputChange}
                  onTranscript={(text) => setFormData(prev => ({ ...prev, bioLong: prev.bioLong + text }))}
                  placeholder="Historia del proyecto, hitos, estilo musical..."
                  rows={6}
                />
              </div>
              <div className="field full">
                <label>Press Kit (PDF, ZIP)</label>
                <FileUploadZone
                  field="press_kit"
                  files={formData.press_kit}
                  onChange={handleFileChange('press_kit')}
                  onRemove={(idx) => removeFile('press_kit', idx)}
                />
              </div>
            </div>
          </section>

          <div className="divider" role="separator" />

          {/* Section 3: Social Media */}
          <section className="section" data-section="3">
            <div className="section-header">
              <span className="section-num">3</span>
              <div>
                <div className="section-title">Redes Sociales</div>
                <div className="section-desc">Enlaces a tus perfiles</div>
              </div>
            </div>
            <div className="field-grid two-col">
              <div className="field">
                <label htmlFor="spotify">Spotify</label>
                <input
                  type="url"
                  id="spotify"
                  name="spotify"
                  value={formData.spotify}
                  onChange={handleInputChange}
                  placeholder="https://open.spotify.com/artist/..."
                />
              </div>
              <div className="field">
                <label htmlFor="appleMusic">Apple Music</label>
                <input
                  type="url"
                  id="appleMusic"
                  name="appleMusic"
                  value={formData.appleMusic}
                  onChange={handleInputChange}
                  placeholder="https://music.apple.com/..."
                />
              </div>
              <div className="field">
                <label htmlFor="youtube">YouTube</label>
                <input
                  type="url"
                  id="youtube"
                  name="youtube"
                  value={formData.youtube}
                  onChange={handleInputChange}
                  placeholder="https://youtube.com/@..."
                />
              </div>
              <div className="field">
                <label htmlFor="instagram">Instagram</label>
                <input
                  type="url"
                  id="instagram"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="field">
                <label htmlFor="tiktok">TikTok</label>
                <input
                  type="url"
                  id="tiktok"
                  name="tiktok"
                  value={formData.tiktok}
                  onChange={handleInputChange}
                  placeholder="https://tiktok.com/@..."
                />
              </div>
              <div className="field">
                <label htmlFor="facebook">Facebook</label>
                <input
                  type="url"
                  id="facebook"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="field">
                <label htmlFor="twitter">X (Twitter)</label>
                <input
                  type="url"
                  id="twitter"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  placeholder="https://x.com/..."
                />
              </div>
              <div className="field">
                <label htmlFor="soundcloud">SoundCloud</label>
                <input
                  type="url"
                  id="soundcloud"
                  name="soundcloud"
                  value={formData.soundcloud}
                  onChange={handleInputChange}
                  placeholder="https://soundcloud.com/..."
                />
              </div>
              <div className="field">
                <label htmlFor="bandcamp">Bandcamp</label>
                <input
                  type="url"
                  id="bandcamp"
                  name="bandcamp"
                  value={formData.bandcamp}
                  onChange={handleInputChange}
                  placeholder="https://bandcamp.com/..."
                />
              </div>
              <div className="field">
                <label htmlFor="deezer">Deezer</label>
                <input
                  type="url"
                  id="deezer"
                  name="deezer"
                  value={formData.deezer}
                  onChange={handleInputChange}
                  placeholder="https://deezer.com/..."
                />
              </div>
            </div>
          </section>

          <div className="divider" role="separator" />

          {/* Section 4: Discography */}
          <section className="section" data-section="4">
            <div className="section-header">
              <span className="section-num">4</span>
              <div>
                <div className="section-title">Discografía</div>
                <div className="section-desc">Álbumes, EPs y sencillos</div>
              </div>
            </div>
            
            <span className="sublabel">Miembros de la banda</span>
            <div className="array-wrap">
              {formData.members.map((member, idx) => (
                <div key={idx} className="array-item" role="group" aria-label={`Miembro ${idx + 1}`}>
                  <div className="array-item-fields two">
                    <input
                      type="text"
                      placeholder="Nombre completo"
                      value={member.name}
                      onChange={(e) => updateMember(idx, 'name', e.target.value)}
                      aria-label="Nombre completo"
                    />
                    <input
                      type="text"
                      placeholder="Rol (voz, guitarra…)"
                      value={member.role}
                      onChange={(e) => updateMember(idx, 'role', e.target.value)}
                      aria-label="Rol en la banda"
                    />
                    <input
                      type="text"
                      placeholder="Redes sociales personales"
                      value={member.social}
                      onChange={(e) => updateMember(idx, 'social', e.target.value)}
                      aria-label="Redes sociales"
                      style={{ gridColumn: '1 / -1' }}
                    />
                    <input
                      type="text"
                      placeholder="Mini bio"
                      value={member.bio}
                      onChange={(e) => updateMember(idx, 'bio', e.target.value)}
                      aria-label="Mini biografía"
                      style={{ gridColumn: '1 / -1' }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeMember(idx)}
                    aria-label="Eliminar miembro"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button type="button" className="btn-add" onClick={addMember}>
                + Agregar miembro
              </button>
            </div>

            <span className="sublabel">Discografía</span>
            <div className="array-wrap">
              {formData.discography.map((album, idx) => (
                <div key={idx} className="array-item" role="group" aria-label={`Álbum ${idx + 1}`}>
                  <div className="array-item-fields two">
                    <input
                      type="text"
                      placeholder="Título"
                      value={album.title}
                      onChange={(e) => updateAlbum(idx, 'title', e.target.value)}
                      aria-label="Título del álbum"
                    />
                    <input
                      type="date"
                      value={album.releaseDate}
                      onChange={(e) => updateAlbum(idx, 'releaseDate', e.target.value)}
                      aria-label="Fecha de lanzamiento"
                    />
                    <select
                      value={album.type}
                      onChange={(e) => updateAlbum(idx, 'type', e.target.value)}
                      aria-label="Tipo de publicación"
                    >
                      <option value="album">Álbum</option>
                      <option value="single">Sencillo</option>
                      <option value="ep">EP</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Sello discográfico"
                      value={album.label}
                      onChange={(e) => updateAlbum(idx, 'label', e.target.value)}
                      aria-label="Sello discográfico"
                    />
                    <input
                      type="url"
                      placeholder="URL portada"
                      value={album.coverUrl}
                      onChange={(e) => updateAlbum(idx, 'coverUrl', e.target.value)}
                      aria-label="URL de portada"
                      style={{ gridColumn: '1 / -1' }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeAlbum(idx)}
                    aria-label="Eliminar álbum"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button type="button" className="btn-add" onClick={addAlbum}>
                + Agregar álbum
              </button>
            </div>
          </section>

          <div className="divider" role="separator" />

          {/* Section 5: Photos & Videos */}
          <section className="section" data-section="5">
            <div className="section-header">
              <span className="section-num">5</span>
              <div>
                <div className="section-title">Fotos & Videos</div>
                <div className="section-desc">Material visual de alta calidad</div>
              </div>
            </div>
            <div className="field-grid">
              <div className="field">
                <label>Fotos HQ (para web)</label>
                <FileUploadZone
                  field="fotos_hq"
                  files={formData.fotos_hq}
                  onChange={handleFileChange('fotos_hq')}
                  onRemove={(idx) => removeFile('fotos_hq', idx)}
                />
              </div>
              <div className="field">
                <label>Fotos en vivo</label>
                <FileUploadZone
                  field="fotos_live"
                  files={formData.fotos_live}
                  onChange={handleFileChange('fotos_live')}
                  onRemove={(idx) => removeFile('fotos_live', idx)}
                />
              </div>
              <div className="field full">
                <label>Posters y arte</label>
                <FileUploadZone
                  field="posters"
                  files={formData.posters}
                  onChange={handleFileChange('posters')}
                  onRemove={(idx) => removeFile('posters', idx)}
                />
              </div>
            </div>

            <span className="sublabel">Videos</span>
            <div className="array-wrap">
              {formData.videos.map((video, idx) => (
                <div key={idx} className="array-item" role="group" aria-label={`Video ${idx + 1}`}>
                  <div className="array-item-fields two">
                    <input
                      type="text"
                      placeholder="Título del video"
                      value={video.title}
                      onChange={(e) => updateVideo(idx, 'title', e.target.value)}
                      aria-label="Título del video"
                    />
                    <select
                      value={video.platform}
                      onChange={(e) => updateVideo(idx, 'platform', e.target.value)}
                      aria-label="Plataforma"
                    >
                      <option value="youtube">YouTube</option>
                      <option value="vimeo">Vimeo</option>
                      <option value="otro">Otro</option>
                    </select>
                    <input
                      type="url"
                      placeholder="URL del video"
                      value={video.url}
                      onChange={(e) => updateVideo(idx, 'url', e.target.value)}
                      aria-label="URL del video"
                      style={{ gridColumn: '1 / -1' }}
                    />
                    <input
                      type="text"
                      placeholder="Descripción / tipo"
                      value={video.caption}
                      onChange={(e) => updateVideo(idx, 'caption', e.target.value)}
                      aria-label="Descripción"
                      style={{ gridColumn: '1 / -1' }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeVideo(idx)}
                    aria-label="Eliminar video"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button type="button" className="btn-add" onClick={addVideo}>
                + Agregar video
              </button>
            </div>
          </section>

          <div className="divider" role="separator" />

          {/* Section 6: Events */}
          <section className="section" data-section="6">
            <div className="section-header">
              <span className="section-num">6</span>
              <div>
                <div className="section-title">Agenda & Eventos</div>
                <div className="section-desc">Próximos shows y fechas</div>
              </div>
            </div>
            <div className="array-wrap">
              {formData.events.map((event, idx) => (
                <div key={idx} className="array-item" role="group" aria-label={`Evento ${idx + 1}`}>
                  <div className="array-item-fields two">
                    <input
                      type="text"
                      placeholder="Nombre del evento"
                      value={event.title}
                      onChange={(e) => updateEvent(idx, 'title', e.target.value)}
                      aria-label="Nombre del evento"
                    />
                    <input
                      type="datetime-local"
                      value={event.dateTime}
                      onChange={(e) => updateEvent(idx, 'dateTime', e.target.value)}
                      aria-label="Fecha y hora"
                    />
                    <input
                      type="text"
                      placeholder="Ciudad"
                      value={event.city}
                      onChange={(e) => updateEvent(idx, 'city', e.target.value)}
                      aria-label="Ciudad"
                    />
                    <input
                      type="text"
                      placeholder="País"
                      value={event.country}
                      onChange={(e) => updateEvent(idx, 'country', e.target.value)}
                      aria-label="País"
                    />
                    <input
                      type="text"
                      placeholder="Venue"
                      value={event.venueName}
                      onChange={(e) => updateEvent(idx, 'venueName', e.target.value)}
                      aria-label="Nombre del venue"
                      style={{ gridColumn: '1 / -1' }}
                    />
                    <input
                      type="url"
                      placeholder="Link de boletos"
                      value={event.ticketsLink}
                      onChange={(e) => updateEvent(idx, 'ticketsLink', e.target.value)}
                      aria-label="Link de boletos"
                      style={{ gridColumn: '1 / -1' }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeEvent(idx)}
                    aria-label="Eliminar evento"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button type="button" className="btn-add" onClick={addEvent}>
                + Agregar evento
              </button>
            </div>
          </section>

          <div className="divider" role="separator" />

          {/* Section 7: Merch */}
          <section className="section" data-section="7">
            <div className="section-header">
              <span className="section-num">7</span>
              <div>
                <div className="section-title">Merchandising</div>
                <div className="section-desc">Productos para la tienda</div>
              </div>
            </div>
            <div className="array-wrap">
              {formData.merch.map((item, idx) => (
                <div key={idx} className="array-item" role="group" aria-label={`Producto ${idx + 1}`}>
                  <div className="array-item-fields two">
                    <input
                      type="text"
                      placeholder="Nombre del producto"
                      value={item.name}
                      onChange={(e) => updateMerch(idx, 'name', e.target.value)}
                      aria-label="Nombre del producto"
                    />
                    <input
                      type="text"
                      placeholder="SKU"
                      value={item.sku}
                      onChange={(e) => updateMerch(idx, 'sku', e.target.value)}
                      aria-label="SKU"
                    />
                    <input
                      type="number"
                      placeholder="Precio"
                      value={item.price}
                      onChange={(e) => updateMerch(idx, 'price', e.target.value)}
                      aria-label="Precio"
                    />
                    <input
                      type="number"
                      placeholder="Stock"
                      value={item.stock}
                      onChange={(e) => updateMerch(idx, 'stock', e.target.value)}
                      aria-label="Stock disponible"
                    />
                    <select
                      value={item.category}
                      onChange={(e) => updateMerch(idx, 'category', e.target.value)}
                      aria-label="Categoría"
                    >
                      <option value="">Categoría…</option>
                      <option value="ropa">Ropa</option>
                      <option value="accesorios">Accesorios</option>
                      <option value="musica">Música física</option>
                      <option value="otro">Otro</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Tallas (S, M, L, XL)"
                      value={item.sizes}
                      onChange={(e) => updateMerch(idx, 'sizes', e.target.value)}
                      aria-label="Tallas disponibles"
                    />
                    <input
                      type="url"
                      placeholder="URL imagen"
                      value={item.imageUrl}
                      onChange={(e) => updateMerch(idx, 'imageUrl', e.target.value)}
                      aria-label="URL de imagen"
                      style={{ gridColumn: '1 / -1' }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeMerch(idx)}
                    aria-label="Eliminar producto"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button type="button" className="btn-add" onClick={addMerch}>
                + Agregar producto
              </button>
            </div>
            <div className="field">
              <label>Fotos del merch</label>
              <FileUploadZone
                field="fotos_merch"
                files={formData.fotos_merch}
                onChange={handleFileChange('fotos_merch')}
                onRemove={(idx) => removeFile('fotos_merch', idx)}
              />
            </div>
          </section>

          <div className="divider" role="separator" />

          {/* Section 8: Press */}
          <section className="section" data-section="8">
            <div className="section-header">
              <span className="section-num">8</span>
              <div>
                <div className="section-title">Prensa & Contacto</div>
                <div className="section-desc">Datos de contacto obligatorios</div>
              </div>
            </div>
            <div className="field-grid two-col">
              <div className="field">
                <label htmlFor="pressName">
                  Nombre del manager / PR
                  <span className="required-indicator">*</span>
                </label>
                <input
                  type="text"
                  id="pressName"
                  name="pressName"
                  value={formData.pressName}
                  onChange={handleInputChange}
                  placeholder="Tu nombre"
                  required
                  className={invalidFields.has('pressName') ? 'invalid' : ''}
                />
              </div>
              <div className="field">
                <label htmlFor="pressEmail">
                  Email de contacto
                  <span className="required-indicator">*</span>
                </label>
                <input
                  type="email"
                  id="pressEmail"
                  name="pressEmail"
                  value={formData.pressEmail}
                  onChange={handleInputChange}
                  placeholder="tu@email.com"
                  required
                  className={invalidFields.has('pressEmail') ? 'invalid' : ''}
                />
              </div>
              <div className="field full">
                <label htmlFor="pressPhone">Teléfono</label>
                <input
                  type="tel"
                  id="pressPhone"
                  name="pressPhone"
                  value={formData.pressPhone}
                  onChange={handleInputChange}
                  placeholder="+34 600 000 000"
                />
              </div>
              <div className="field full">
                <label>Documentos de prensa</label>
                <FileUploadZone
                  field="docs_prensa"
                  files={formData.docs_prensa}
                  onChange={handleFileChange('docs_prensa')}
                  onRemove={(idx) => removeFile('docs_prensa', idx)}
                />
              </div>
            </div>
          </section>

          <div className="divider" role="separator" />

          {/* Section 9: SEO */}
          <section className="section" data-section="9">
            <div className="section-header">
              <span className="section-num">9</span>
              <div>
                <div className="section-title">SEO & Metadatos</div>
                <div className="section-desc">Para buscadores y redes sociales</div>
              </div>
            </div>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="seoTitle">Título SEO (máx. 60 caracteres)</label>
                <input
                  type="text"
                  id="seoTitle"
                  name="seoTitle"
                  value={formData.seoTitle}
                  onChange={handleInputChange}
                  placeholder="Nombre | Músico"
                  maxLength={60}
                />
              </div>
              <div className="field">
                <label htmlFor="seoDescription">Meta descripción (máx. 160)</label>
                <input
                  type="text"
                  id="seoDescription"
                  name="seoDescription"
                  value={formData.seoDescription}
                  onChange={handleInputChange}
                  placeholder="Descripción corta para buscadores..."
                  maxLength={160}
                />
              </div>
              <div className="field full">
                <label htmlFor="seoKeywords">Palabras clave</label>
                <input
                  type="text"
                  id="seoKeywords"
                  name="seoKeywords"
                  value={formData.seoKeywords}
                  onChange={handleInputChange}
                  placeholder="rock, banda, música, artista..."
                />
              </div>
              <div className="field full">
                <label htmlFor="ogImage">Imagen OG (para redes sociales)</label>
                <input
                  type="url"
                  id="ogImage"
                  name="ogImage"
                  value={formData.ogImage}
                  onChange={handleInputChange}
                  placeholder="URL de imagen para compartir (1200x630)"
                />
              </div>
            </div>
          </section>

          <div className="divider" role="separator" />

          {/* Section 10: Notes */}
          <section className="section" data-section="10">
            <div className="section-header">
              <span className="section-num">10</span>
              <div>
                <div className="section-title">Notas Adicionales</div>
                <div className="section-desc">Cualquier cosa extra que debamos saber</div>
              </div>
            </div>
            <div className="field-grid">
              <div className="field full">
                <label htmlFor="references">Referencias visuales de sitios que te gustan</label>
                <textarea
                  id="references"
                  name="references"
                  value={formData.references}
                  onChange={handleInputChange}
                  placeholder="URLs o descripciones de sitios de referencia…"
                  rows={3}
                />
              </div>
              <div className="field full">
                <label htmlFor="ticketsInfo">¿Tienen sistema propio deentradas?</label>
                <textarea
                  id="ticketsInfo"
                  name="ticketsInfo"
                  value={formData.ticketsInfo}
                  onChange={handleInputChange}
                  placeholder="Describe el flujo actual de venta de entradas, plataformas que usan…"
                  rows={3}
                />
              </div>
              <div className="field full">
                <label htmlFor="aiNotes">¿Usan IA para contenido?</label>
                <VoiceGuidedInput
                  fieldName="aiNotes"
                  instructions={voiceInstructions.aiNotes}
                  value={formData.aiNotes}
                  onChange={handleInputChange}
                  onTranscript={(text) => setFormData(prev => ({ ...prev, aiNotes: prev.aiNotes + text }))}
                  placeholder="Blog automático, subtitulado, traducción, generación de imágenes…"
                  rows={3}
                />
              </div>
              <div className="field full">
                <label htmlFor="extraNotes">¿Alguna restricción, fecha fija o detalle especial?</label>
                <VoiceGuidedInput
                  fieldName="extraNotes"
                  instructions={voiceInstructions.extraNotes}
                  value={formData.extraNotes}
                  onChange={handleInputChange}
                  onTranscript={(text) => setFormData(prev => ({ ...prev, extraNotes: prev.extraNotes + text }))}
                  placeholder="Fecha de lanzamiento deseada, eventos próximos críticos…"
                  rows={4}
                />
              </div>
            </div>
          </section>

          {error && (
            <div className="error-message" role="alert">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="submit-area">
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'ENVIANDO...' : 'ENVIAR INFORMACIÓN'}
            </button>
            <p className="submit-note">
              Los datos se enviarán a <strong style={{ color: 'var(--accent)' }}>{config.emailDestino}</strong>
              <br />
              <small style={{ opacity: 0.7 }}>Modo: Web3Forms (envío directo por email)</small>
            </p>
          </div>
        </form>
      </main>

      <nav className="section-nav" aria-label="Navegación de secciones">
        {sections.map((section, idx) => (
          <button
            key={section.id}
            className={`section-nav-dot ${currentSection === idx ? 'active' : ''}`}
            data-label={section.label}
            onClick={() => scrollToSection(idx)}
            aria-label={`Ir a sección ${section.id}`}
          />
        ))}
      </nav>

      <button
        className={`scroll-top ${showScrollTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Volver arriba"
        title="Volver arriba"
      >
        ↑
      </button>

      <footer>
        Desarrollado por <span>CREAPPSY</span> · Diseño & Desarrollo Web
      </footer>
    </div>
    </>
  );
}

function FileUploadZone({
  field,
  files,
  onChange,
  onRemove,
}: {
  field: string;
  files: File[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.files = e.dataTransfer.files as unknown as FileList;
    const event = { target: input } as unknown as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
  };

  const filePreviews = files.map((file, idx) => {
    const isImage = file.type.startsWith('image/');
    const url = isImage ? URL.createObjectURL(file) : null;
    return { file, idx, isImage, url };
  });

  return (
    <div
      className={`upload-zone ${isDragging ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input type="file" multiple accept="image/*,.pdf,.zip,.ai,.eps,.svg" onChange={onChange} />
      <div className="upload-icon">📁</div>
      <div className="upload-title">Arrastra archivos aquí</div>
      <div className="upload-sub">
        o <strong>haz clic para seleccionar</strong>
      </div>
      <div className="upload-note">PNG, JPG, PDF, ZIP, AI, SVG • Máx. 10MB c/u</div>

      {files.length > 0 && (
        <div className="file-preview-grid">
          {filePreviews.map(({ file, idx, isImage, url }) => (
            <div key={idx} className="file-thumb">
              {isImage && url ? (
                <img src={url} alt={file.name} loading="lazy" />
              ) : (
                <>
                  <div className="ficon">{file.name.endsWith('.pdf') ? '📄' : '📁'}</div>
                  <div className="fname">{file.name.substring(0, 20)}</div>
                </>
              )}
              <button type="button" className="rm" onClick={() => onRemove(idx)} aria-label="Eliminar archivo">
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="file-badge">
          {files.length} archivo{files.length > 1 ? 's' : ''} seleccionado{files.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}