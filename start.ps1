# Sobe o banco PostgreSQL e a aplicação Next.js

Write-Host "Iniciando banco de dados..." -ForegroundColor Cyan
docker compose up -d

Write-Host "Aguardando PostgreSQL ficar pronto..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

Write-Host "Instalando dependências..." -ForegroundColor Cyan
npm install

Write-Host "Gerando Prisma client..." -ForegroundColor Cyan
npx prisma generate

Write-Host "Aplicando schema ao banco..." -ForegroundColor Cyan
npx prisma db push

Write-Host "Iniciando aplicação..." -ForegroundColor Green
npm run dev
