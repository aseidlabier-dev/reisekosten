# Reisekosten App – Android APK erstellen & offline nutzen

**100% Offline-Betrieb. Keine Cloud, kein Server, kein Internet im Ausland nötig.**

---

## SCHRITT 1 – GitHub Desktop öffnen & Repository erstellen

1. In GitHub Desktop: **File → New Repository...** (oder `Strg + N`)
   - **Name:** `reisekosten`
   - **Local Path:** Wähle diesen Ordner hier aus (`D:\Antigravity_Programme\Reisekosten\Android`)
2. Klicke auf **Create Repository**
3. Klicke oben auf **Publish repository**
   - Haken bei „Keep this code private" setzen (privates Repository)
   - Klicke auf **Publish Repository**

---

## SCHRITT 2 – APK-Bau auf GitHub beobachten & herunterladen

1. Öffne im Browser: **https://github.com/DEIN-BENUTZERNAME/reisekosten/actions**
2. Du siehst den Workflow **„Reisekosten Android APK bauen“**
3. Nach ca. 8–10 Minuten erscheint das grüne Häkchen ✅
4. Workflow anklicken → unten bei **„Artifacts“** die Datei **„Reisekosten-App-Android-APK“** (ZIP) herunterladen
5. ZIP entpacken → darin liegt **`app-debug.apk`**

---

## SCHRITT 3 – APK auf das Handy übertragen & installieren

1. Übertrage `app-debug.apk` per OneDrive oder USB auf das Handy.
2. In der App **„Eigene Dateien“** antippen und installieren.

---

## SCHRITT 4 – Vorhandene Daten importieren

1. Öffne die Reisekosten-App auf dem PC (oder Browser):
   - Gehe auf **Verwalten** → **Datensicherung**
   - Klicke auf **„Backup-Datei herunterladen (.json)“**
2. Übertrage diese Datei auf dein Handy (z.B. per OneDrive).
3. Öffne die neue installierte Reisekosten-App auf dem Handy:
   - Gehe auf **Verwalten** → **Datensicherung**
   - Wähle die heruntergeladene `.json`-Datei aus
   - Klicke auf **„Daten jetzt importieren“**
   - Fertig! Alle Reisen, Ausgaben und Kategorien sind sofort verfügbar!
