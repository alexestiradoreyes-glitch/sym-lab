// Envío de correo con Resend (https://resend.com)
// Sin SMTP, sin contraseñas corporativas. Solo una clave API gratuita.

import { Resend } from 'resend'
import { Idea } from './types'

function generarHtmlEmail(idea: Idea): string {
  const filaTabla = (label: string, valor: string, par = false) => `
    <tr style="background:${par ? '#f9fafb' : '#ffffff'}">
      <td style="padding:10px 14px;color:#6b7280;font-size:13px;font-weight:600;width:38%;vertical-align:top;white-space:nowrap;">${label}</td>
      <td style="padding:10px 14px;color:#111827;font-size:13px;">${valor || '—'}</td>
    </tr>`

  const bloque = (titulo: string, contenido: string, colorBorde: string) => `
    <div style="background:#f9fafb;border-left:4px solid ${colorBorde};padding:16px 18px;margin:18px 0;border-radius:0 8px 8px 0;">
      <p style="color:#9ca3af;font-size:11px;margin:0 0 6px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">${titulo}</p>
      <p style="color:#1f2937;font-size:14px;margin:0;line-height:1.7;white-space:pre-wrap;">${contenido}</p>
    </div>`

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Nueva idea SYM LAB</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:30px 16px;">
    <tr><td>
      <table width="600" cellpadding="0" cellspacing="0" style="margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <tr>
          <td style="background:linear-gradient(135deg,#DC2626 0%,#991B1B 100%);padding:36px 32px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:32px;letter-spacing:6px;font-weight:900;">SYM LAB</h1>
            <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;letter-spacing:1px;">Portal de Ideas de I+D+i</p>
            <div style="background:rgba(255,255,255,0.15);border-radius:8px;padding:10px 20px;margin-top:20px;display:inline-block;">
              <p style="color:#ffffff;margin:0;font-size:16px;font-weight:600;">💡 Nueva idea recibida</p>
            </div>
          </td>
        </tr>

        <tr><td style="padding:32px;">
          <h2 style="color:#DC2626;font-size:16px;font-weight:700;margin:0 0 12px;padding-bottom:10px;border-bottom:2px solid #fee2e2;">👤 Datos del remitente</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
            ${filaTabla('ID de la idea', `<code style="font-family:monospace;background:#f3f4f6;padding:2px 6px;border-radius:4px;font-size:11px;">${idea.id}</code>`)}
            ${filaTabla('Fecha y hora', idea.fechaEnvio, true)}
            ${filaTabla('Nombre completo', `<strong>${idea.nombre}</strong>`)}
            ${filaTabla('Empresa', idea.empresa || '', true)}
            ${filaTabla('Email', `<a href="mailto:${idea.email}" style="color:#DC2626;">${idea.email}</a>`)}
            ${filaTabla('Teléfono', idea.telefono || '', true)}
          </table>

          <h2 style="color:#DC2626;font-size:16px;font-weight:700;margin:24px 0 12px;padding-bottom:10px;border-bottom:2px solid #fee2e2;">💡 Detalles de la idea</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:16px;">
            ${filaTabla('Título', `<strong>${idea.titulo}</strong>`)}
            ${filaTabla('Categoría', `<span style="background:#FEE2E2;color:#DC2626;padding:3px 12px;border-radius:20px;font-size:12px;font-weight:600;">${idea.categoria}</span>`, true)}
            ${filaTabla('Nivel de madurez', idea.nivelMadurez)}
          </table>

          ${idea.descripcion ? bloque('Descripción completa', idea.descripcion, '#DC2626') : bloque('Descripción', idea.audioUrl ? '(Idea enviada mediante audio explicativo)' : '—', '#DC2626')}
          ${idea.problemaResuelve ? bloque('Problema que resuelve', idea.problemaResuelve, '#3B82F6') : ''}
          ${idea.beneficiosEsperados ? bloque('Beneficios esperados', idea.beneficiosEsperados, '#10B981') : ''}

          ${idea.archivos && idea.archivos.length > 0 ? `
          <h2 style="color:#DC2626;font-size:16px;font-weight:700;margin:24px 0 12px;padding-bottom:10px;border-bottom:2px solid #fee2e2;">📎 Archivos adjuntos</h2>
          <ul style="margin:0;padding:0 0 0 16px;color:#6b7280;font-size:13px;">
            ${idea.archivos.map(f => `<li style="margin-bottom:4px;">${f}</li>`).join('')}
          </ul>` : ''}

        </td></tr>

        <tr>
          <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">
              Generado automáticamente por <strong>SYM LAB</strong>. No responda a este correo.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function enviarEmailIdea(idea: Idea): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY)

  await resend.emails.send({
    from:    'SYM LAB <onboarding@resend.dev>',
    to:      [process.env.EMAIL_DESTINO || 'SYMLAB1@outlook.com'],
    subject: `[SYM LAB] Nueva idea: ${idea.titulo}`,
    html:    generarHtmlEmail(idea),
  })
}
