# 🚀 Deployment na Fly.io

Brzi vodič za deployment Sport Metadata aplikacije na Fly.io.

## 📋 Preduvjeti

- ✅ GitHub account (kod pushan na GitHub)
- ✅ Fly.io account (besplatno)
- ✅ Git repozitorij lokalno (povezan s GitHub-om)

## 🎯 Koraci

### 1. Instaliraj Fly.io CLI

**macOS:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Windows:**
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

**Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

### 2. Prijavi se na Fly.io

```bash
fly auth login
```

Otvorit će se browser gdje se možeš prijaviti ili registrirati.

### 3. Pushaj kod na GitHub

```bash
git add .
git commit -m "Add Fly.io deployment config"
git push origin main
```

### 4. Deploy aplikacije

```bash
fly launch
```

**Odgovori na pitanja:**
- App name: `sport-metadata` (ili bilo koje ime koje želiš)
- Region: Odaberi najbliži (npr. `fra` za Frankfurt)
- PostgreSQL: `n` (ne treba nam)
- Deploy now: `y` (da)

### 5. Provjeri deployment

Nakon deploymenta, aplikacija će biti dostupna na:
```
https://sport-metadata.fly.dev
```

### 6. (Opcionalno) Dodaj vlastitu domenu

```bash
fly domains add yourdomain.com
```

Fly.io će automatski konfigurirati SSL certifikat.

## 🔄 Ažuriranje aplikacije

### Ručni deploy

```bash
# 1. Napravi promjene u kodu
git add .
git commit -m "Update app"
git push origin main  # Push na GitHub (backup)

# 2. Deploy na Fly.io
fly deploy
```

### Automatski deploy s GitHub Actions (preporučeno!)

1. **Dobij Fly.io API token:**
   ```bash
   fly auth token
   ```
   Kopiraj token koji se prikaže.

2. **Dodaj token kao GitHub Secret:**
   - Idi na GitHub repo → Settings → Secrets and variables → Actions
   - Klikni "New repository secret"
   - Name: `FLY_API_TOKEN`
   - Value: Zalijepi token iz koraka 1
   - Klikni "Add secret"

3. **Kreiraj GitHub Actions workflow:**
   
   Kreiraj datoteku `.github/workflows/fly.yml`:
   ```yaml
   name: Fly Deploy
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       name: Deploy app
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: superfly/flyctl-actions/setup-flyctl@master
         - run: flyctl deploy --remote-only
           env:
             FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
   ```

4. **Pushaj na GitHub:**
   ```bash
   git add .github/workflows/fly.yml
   git commit -m "Add GitHub Actions for auto-deploy"
   git push origin main
   ```

**Od sada:** Svaki put kada pushaš na `main`, aplikacija se automatski deploya! 🎉

## 📊 Monitoring

Pogledaj logove:
```bash
fly logs
```

Provjeri status:
```bash
fly status
```

## 💰 Cijena

Fly.io besplatni tier uključuje:
- 3 shared-cpu-1x VM-ova
- 3GB storage
- 160GB outbound transfer

Za ovu aplikaciju, besplatni tier je više nego dovoljan!

## 📚 Dodatni resursi

- [Fly.io dokumentacija](https://fly.io/docs/)
- [Fly.io pricing](https://fly.io/docs/about/pricing/)
