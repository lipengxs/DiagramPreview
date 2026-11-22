# Arbeitsbereichseinstellungen — Designspezifikation

> Unabhängiges DiagramPreview-Beispiel. Passen Sie die Regeln an Ihr Produkt an. Kein offizielles Figma-Format.

## Ziel und Umfang
Eigentümer können den Namen und die Benachrichtigungseinstellung des Arbeitsbereichs ändern.
Abrechnung, Einladungen und Berechtigungsverwaltung gehören nicht zum Umfang.
Nur synthetische Daten verwenden; keine Produktionsanbindung.

## Design-Tokens
- Primäre Aktion: #1D4ED8 mit weißem Text.
- Text: #0F172A auf #FFFFFF; sekundär: #475569; Fehler: #B91C1C.
- Schrift: system-ui; Fließtext 16px / 24px, Überschrift 24px / 32px.
- Abstände: 4, 8, 12, 16, 24, 32px; Kartenradius: 8px.
- Benannte Tokens verwenden, keine beliebigen Farben oder Abstände ergänzen.

## Komponenten und Zustände
### Speichern-Schaltfläche
- Standard: „Änderungen speichern“ auf primärem Hintergrund.
- Hover: #1E40AF mit lesbarem weißem Text.
- Fokus: sichtbare Kontur von 2px mit 2px Abstand.
- Deaktiviert bei unveränderten oder ungültigen Daten; Feldfehler erläutern.
- Beim Speichern eine Meldung anzeigen und doppelte Anfragen verhindern.
- Erfolg: „Änderungen gespeichert“ über eine Live-Region melden.
- Bei einem Fehler Eingaben beibehalten und Wiederholen anbieten.
### Name des Arbeitsbereichs
- Pflichtfeld: nach Entfernen äußerer Leerzeichen 2–60 Zeichen.
- Sichtbare Beschriftung und Hilfe; Platzhalter ersetzt keine Beschriftung.
- Beim Fokusverlust und vor dem Speichern validieren, Fehler dem Feld zuordnen.
- Ungültige Daten nicht speichern.

## Interaktion und Daten
1. Aktuellen Namen und Benachrichtigungswert laden.
2. Speichern nur bei gültigen geänderten Werten aktivieren.
3. Beim Absenden einen simulierten Vorgang ausführen und Ladezustand zeigen.
4. Bei Erfolg bestätigte Werte behalten und Abschluss melden.
5. Bei Fehler Entwurf behalten und Wiederholen anbieten.
- Beim ersten Laden einen beschrifteten Platzhalter anzeigen.
- Initialer Ladefehler: Wiederholen anbieten; gespeicherte Daten nicht erfinden.
- Bei leerem Namen vom Server eine Pflichtfeldmeldung anzeigen.

## Responsives Layout
- Unter 768px: eine Spalte, 16px Seitenabstand, Speichern über volle Breite.
- Ab 768px: zentriertes Formular, maximal 640px breit, 24px Abstand.
- Bei 320px Viewport-Breite kein horizontales Scrollen.

## Barrierefreiheit
- Alle Eingaben haben programmatische Beschriftungen; Tab folgt der visuellen Reihenfolge.
- Tastaturbedienung mit sichtbarem Fokus für alle interaktiven Elemente.
- Erfolg und Fehler durch Text, nicht nur Farbe vermitteln.
- Normalen Textkontrast von mindestens 4.5:1 am tatsächlichen Hintergrund prüfen.

## Abnahmecheckliste
- [ ] Leere Namen können nicht abgesendet werden; eine Meldung wird angezeigt.
- [ ] Außerhalb von 2–60 Zeichen wird ein konkreter Fehler angezeigt.
- [ ] Wiederholtes Klicken während des Speicherns erzeugt nur eine Anfrage.
- [ ] Bei Fehler bleiben Eingaben erhalten; Wiederholen ist möglich.
- [ ] Erfolg wird ohne Fokusverschiebung angekündigt.
- [ ] Tastaturbedienung und 320px-Layout prüfen.
- [ ] Jeden umgesetzten Zustand mit der Spezifikation vergleichen.

## Vor Produktion klären
- TODO: Endpunkt, Berechtigungen und Fehlerantworten mit der Entwicklung bestätigen.
- TODO: Benachrichtigungsverhalten und Texte mit der Produktverantwortung bestätigen.
- Simulation erst nach Freigabe des Datenvertrags ersetzen.
