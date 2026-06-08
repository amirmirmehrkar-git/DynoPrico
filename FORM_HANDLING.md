# Kontaktformular-Verarbeitung

Das Kontaktformular sendet Einsendungen an:

`https://formspree.io/f/xykawdqv`

Formspree speichert die Angaben und sendet Benachrichtigungen an die im Formspree-Dashboard konfigurierte E-Mail-Adresse.

## Spam-Schutz

- Ein verstecktes `_gotcha`-Honeypot-Feld blockiert einfache Bots.
- Einsendungen unter drei Sekunden werden im Browser abgewiesen.
- Der Absenden-Button wird während der Übertragung gesperrt.
- Formsprees eigener Spam-Filter prüft die Einsendungen zusätzlich.

Für ein sichtbares CAPTCHA kann später Cloudflare Turnstile oder hCaptcha ergänzt werden. Dafür werden ein Site-Key und ein Secret-Key des jeweiligen Anbieters benötigt.

## Endpoint ändern

Der Standard-Endpunkt ist direkt in `src/App.jsx` hinterlegt. Optional kann er mit `VITE_FORMSPREE_ENDPOINT` überschrieben werden.
