# Setup Staging Secrets
# Run this to configure all required secrets for the pawtoons-staging worker

Write-Host "=== Pawtoons Staging Secrets Setup ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will help you set up all required secrets for staging." -ForegroundColor Yellow
Write-Host "You'll be prompted to enter each secret value." -ForegroundColor Yellow
Write-Host ""
Write-Host "NOTE: For staging, use Stripe TEST keys (sk_test_... and pk_test_...)" -ForegroundColor Red
Write-Host ""

$workerName = "pawtoons-staging"

# List of required secrets
$secrets = @(
    @{Name="OPENAI_API_KEY"; Desc="OpenAI API key (from https://platform.openai.com/api-keys)"},
    @{Name="STRIPE_SECRET_KEY"; Desc="Stripe SECRET key (use TEST mode: sk_test_...)"},
    @{Name="STRIPE_WEBHOOK_SECRET"; Desc="Stripe webhook secret (from Stripe CLI or dashboard)"},
    @{Name="VITE_STRIPE_PUBLISHABLE_KEY"; Desc="Stripe PUBLISHABLE key (use TEST mode: pk_test_...)"},
    @{Name="SUPABASE_URL"; Desc="Supabase project URL"},
    @{Name="SUPABASE_PUBLISHABLE_KEY"; Desc="Supabase publishable/anon key"},
    @{Name="SUPABASE_SERVICE_ROLE_KEY"; Desc="Supabase service role key"},
    @{Name="VITE_SUPABASE_URL"; Desc="Supabase project URL (same as SUPABASE_URL)"},
    @{Name="VITE_SUPABASE_PUBLISHABLE_KEY"; Desc="Supabase publishable key (same as SUPABASE_PUBLISHABLE_KEY)"},
    @{Name="VITE_SUPABASE_PROJECT_ID"; Desc="Supabase project ID"}
)

Write-Host "About to configure $($secrets.Count) secrets for worker: $workerName" -ForegroundColor Cyan
Write-Host ""
$confirm = Read-Host "Continue? (y/n)"

if ($confirm -ne "y") {
    Write-Host "Cancelled." -ForegroundColor Red
    exit
}

foreach ($secret in $secrets) {
    Write-Host ""
    Write-Host "[$($secret.Name)]" -ForegroundColor Green
    Write-Host "  $($secret.Desc)" -ForegroundColor Gray
    Write-Host ""

    $value = Read-Host "  Enter value (or 'skip' to skip)"

    if ($value -eq "skip" -or $value -eq "") {
        Write-Host "  Skipped." -ForegroundColor Yellow
        continue
    }

    Write-Host "  Setting secret..." -ForegroundColor Gray
    $value | npx wrangler secret put $secret.Name --name $workerName

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Set successfully" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] Failed to set" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Verifying Secrets ===" -ForegroundColor Cyan
npx wrangler secret list --name $workerName

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Green
Write-Host "Staging environment is ready at: https://pawtoons-staging.denveryoung02.workers.dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test the staging site"
Write-Host "2. Make changes to code"
Write-Host "3. Deploy to staging: npm run deploy:staging"
Write-Host "4. Test on staging"
Write-Host "5. Deploy to production: npm run deploy (when ready)"
