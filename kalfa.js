/* eslint-env node */
// kalfa.js - Proje İnfazcısı Emir Tercümanı
import nodeProcess from 'node:process';
import { exec, spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Gelen komutu alıyoruz (node kalfa.js test -> 'test' alınır)
const command = nodeProcess.argv[2];
const extraArgs = nodeProcess.argv.slice(3).join(' ');

if (!command) {
  console.error('HATA: Bir komut belirtilmedi. (Örnek: node kalfa.js test)');
  nodeProcess.exit(1);
}

console.log(`USTA EMRİ ALINDI: '${command}' görevi icra ediliyor...`);

// Klasörler
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_CWD = __dirname; // e:\satinalma
const BACKEND_CWD = path.resolve(__dirname, '..', 'satinalma-backend');

// Görev haritası: komut -> { cmd, cwd }
const TASKS = {
  // Frontend
  'frontend:install': { cmd: 'npm install', cwd: FRONTEND_CWD },
  'frontend:lint': { cmd: 'npm run lint:ci', cwd: FRONTEND_CWD },
  'frontend:test': { cmd: 'npm run test:ci', cwd: FRONTEND_CWD },
  'frontend:build': { cmd: 'npm run build:ci', cwd: FRONTEND_CWD },
  'frontend:ci': { cmd: 'npm run ci', cwd: FRONTEND_CWD },
  'dev': { cmd: 'npm run dev', cwd: FRONTEND_CWD },
  'build': { cmd: 'npm run build', cwd: FRONTEND_CWD },
  'install': { cmd: 'npm install', cwd: FRONTEND_CWD },

  // Backend
  'backend:install': { cmd: 'npm install', cwd: BACKEND_CWD },
  'backend:test': { cmd: 'npm test --silent', cwd: BACKEND_CWD },
  'backend:test:only': { cmd: 'npx vitest run', cwd: BACKEND_CWD },
  'backend:dev': { cmd: 'npm run dev', cwd: BACKEND_CWD },
  'backend:start': { cmd: 'npm start', cwd: BACKEND_CWD },
  'backend:migrate': { cmd: 'npm run migrate', cwd: BACKEND_CWD },
  'backend:build': { cmd: 'npm run build', cwd: BACKEND_CWD }, // varsa

  // Kısa yollar
  'test': { cmd: '__composite:test', cwd: null },
  'ci': { cmd: '__composite:ci', cwd: null },
  'dev:full': { cmd: '__composite:dev:full', cwd: null }
};

function run(task) {
  if (!task) {
    console.error(`HATA: Bilinmeyen komut: '${command}'.`);
  nodeProcess.exit(1);
  }
  if (task.cmd === '__composite:test') {
    // Ardışık: önce backend test, sonra frontend test
    return run({ cmd: TASKS['backend:test'].cmd, cwd: TASKS['backend:test'].cwd }).then((code) => {
      if (code !== 0) return code;
      return run({ cmd: TASKS['frontend:test'].cmd, cwd: TASKS['frontend:test'].cwd });
    });
  }
  if (task.cmd === '__composite:ci') {
    // Ardışık: önce backend test, sonra frontend CI (lint+test+build)
    return run({ cmd: TASKS['backend:test'].cmd, cwd: TASKS['backend:test'].cwd }).then((code) => {
      if (code !== 0) return code;
      return run({ cmd: TASKS['frontend:ci'].cmd, cwd: TASKS['frontend:ci'].cwd });
    });
  }
  if (task.cmd === '__composite:dev:full') {
    // Eşzamanlı: backend:dev ve frontend dev aynı anda çalışsın
    return new Promise((resolve) => {
      const procs = [];
      const spawnWithPrefix = (label, cmd, cwd) => {
        const child = spawn(cmd, { cwd, shell: true, windowsHide: false, env: { ...process.env } });
        child.stdout.on('data', (d) => process.stdout.write(`[${label}] ${d}`));
        child.stderr.on('data', (d) => process.stderr.write(`[${label}][ERR] ${d}`));
        child.on('close', (code) => {
          console.log(`\n[${label}] süreç bitti (exit=${code}).`);
          // İlk bitene göre diğerini sonlandırmaya çalış
          procs.forEach((p) => { try { p.kill(); } catch { /* no-op */ } });
          resolve(code ?? 0);
        });
        procs.push(child);
      };
      console.log("Her iki servis başlatılıyor: backend:dev ve frontend:dev\n");
      spawnWithPrefix('BACKEND', TASKS['backend:dev'].cmd, TASKS['backend:dev'].cwd);
      spawnWithPrefix('FRONTEND', TASKS['dev'].cmd, TASKS['dev'].cwd);
    });
  }
  const finalCmd = extraArgs ? `${task.cmd} ${extraArgs}` : task.cmd;
  console.log(`kalfa.js üzerinden '${finalCmd}' komutu icra ediliyor (cwd=${task.cwd || nodeProcess.cwd()})`);
  return new Promise((resolve) => {
    const child = exec(finalCmd, { cwd: task.cwd || nodeProcess.cwd(), windowsHide: false, maxBuffer: 1024 * 1024 * 20 });
    child.stdout.on('data', (d) => nodeProcess.stdout.write(d));
    child.stderr.on('data', (d) => nodeProcess.stderr.write(d));
    child.on('close', (code) => resolve(code));
  });
}

const selected = TASKS[command];
run(selected).then((exitCode) => {
  console.log(`\nGÖREV TAMAMLANDI: '${command}' görevi ${exitCode} çıkış koduyla bitti.`);
  nodeProcess.exit(exitCode ?? 0);
});