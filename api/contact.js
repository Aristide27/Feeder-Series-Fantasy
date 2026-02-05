const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// Configuration de l'email (à mettre dans .env)
const EMAIL_USER = process.env.EMAIL_USER; // ton email Gmail
const EMAIL_PASS = process.env.EMAIL_PASS; // mot de passe d'application Gmail
const EMAIL_TO = process.env.EMAIL_TO || process.env.EMAIL_USER; // email destinataire (toi)

// Vérifier la configuration
if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn("⚠️  Configuration email manquante dans .env");
  console.warn("   Ajoutez EMAIL_USER et EMAIL_PASS pour activer les emails");
}

// Configurer le transporteur
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// POST /api/contact - Envoyer un message de contact
router.post("/", async (req, res) => {
  const { firstName, email, subject, message } = req.body;

  // Validation
  if (!firstName || !email || !subject || !message) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  // Validation email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Email invalide" });
  }

  // Vérifier si l'email est configuré
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error("[CONTACT] Configuration email manquante");
    return res.status(500).json({ 
      error: "Service d'envoi d'email non configuré. Veuillez contacter l'administrateur." 
    });
  }

  try {
    // Déterminer le libellé du sujet
    const subjectLabels = {
      improvement: "Amélioration",
      bug: "Bug",
      feedback: "Avis",
      question: "Question",
    };
    const subjectLabel = subjectLabels[subject] || "📧 Message";

    // Préparer l'email
    const mailOptions = {
      from: EMAIL_USER,
      to: EMAIL_TO,
      subject: `[FSF Contact] ${subjectLabel} - ${firstName}`,
      replyTo: email,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-row { margin: 15px 0; padding: 10px; background: white; border-left: 4px solid #ef4444; }
            .label { font-weight: bold; color: #64748b; font-size: 12px; text-transform: uppercase; }
            .value { color: #1e293b; margin-top: 5px; }
            .message-box { background: white; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #e2e8f0; }
            .footer { text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">🏎️ Nouveau message de contact</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Feeder Series Fantasy F2</p>
            </div>
            
            <div class="content">
              <div class="info-row">
                <div class="label">Prénom</div>
                <div class="value">${firstName}</div>
              </div>
              
              <div class="info-row">
                <div class="label">Email</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              
              <div class="info-row">
                <div class="label">Type de message</div>
                <div class="value">${subjectLabel}</div>
              </div>
              
              <div class="message-box">
                <div class="label">Message</div>
                <div class="value" style="white-space: pre-wrap; margin-top: 10px;">${message}</div>
              </div>
              
              <div class="footer">
                <p>Reçu le ${new Date().toLocaleString('fr-FR')}</p>
                <p>Pour répondre, utilisez directement l'email : ${email}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Envoyer l'email
    await transporter.sendMail(mailOptions);

    console.log(`[CONTACT] Email envoyé de ${firstName} (${email})`);
    res.json({ 
      message: "Message envoyé avec succès",
      success: true 
    });

  } catch (err) {
    console.error("[CONTACT ERROR]", err);
    res.status(500).json({ 
      error: "Erreur lors de l'envoi du message. Veuillez réessayer." 
    });
  }
});

module.exports = router;