import fs from 'fs';
import path from 'path';

const dirs = [
  'd:/RISE-W/Frontend/src/pages/admin',
  'd:/RISE-W/Frontend/src/pages/authority',
  'd:/RISE-W/Frontend/src/components/admin',
];

const replacements = [
  { regex: /text-white/g, replacement: 'text-emerald-950 dark:text-white' },
  { regex: /bg-white\/\[0\.02\]/g, replacement: 'bg-emerald-900/5 dark:bg-white/[0.02]' },
  { regex: /bg-white\/\[0\.03\]/g, replacement: 'bg-emerald-900/5 dark:bg-white/[0.03]' },
  { regex: /bg-white\/\[0\.04\]/g, replacement: 'bg-emerald-900/10 dark:bg-white/[0.04]' },
  { regex: /bg-white\/\[0\.05\]/g, replacement: 'bg-emerald-900/10 dark:bg-white/[0.05]' },
  { regex: /bg-white\/5(?!\d)/g, replacement: 'bg-emerald-900/5 dark:bg-white/5' },
  { regex: /bg-white\/10(?!\d)/g, replacement: 'bg-emerald-900/10 dark:bg-white/10' },
  { regex: /border-white\/5(?!\d)/g, replacement: 'border-emerald-900/5 dark:border-white/5' },
  { regex: /border-white\/10(?!\d)/g, replacement: 'border-emerald-900/10 dark:border-white/10' },
  { regex: /border-white\/20(?!\d)/g, replacement: 'border-emerald-900/20 dark:border-white/20' },
  { regex: /bg-black\/20(?!\d)/g, replacement: 'bg-emerald-900/5 dark:bg-black/20' },
  { regex: /bg-black\/35(?!\d)/g, replacement: 'bg-wayanad-panel dark:bg-black/35' },
  { regex: /text-slate-400(?!\d)/g, replacement: 'text-emerald-800/70 dark:text-slate-400' },
  { regex: /text-slate-300(?!\d)/g, replacement: 'text-emerald-800 dark:text-slate-300' },
  { regex: /text-slate-500(?!\d)/g, replacement: 'text-emerald-900/60 dark:text-slate-500' },
  { regex: /bg-slate-950(?!\d)/g, replacement: 'bg-emerald-50 dark:bg-slate-950' },
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let changed = false;

      // Because we already ran this, some strings might be like "text-emerald-950 dark:text-white"
      // We don't want to replace "text-white" inside "dark:text-white" or "text-emerald-950 dark:text-white"
      // So we will only replace if they are NOT preceded by "dark:" or "dark:hover:" and NOT followed by already done stuff.
      // Easiest is to reverse previous replacements if they happened, then do clean replace.
      
      // Remove previously applied bad replacements:
      content = content.replace(/text-emerald-950 dark:text-white/g, 'text-white');
      content = content.replace(/bg-emerald-900\/5 dark:bg-white\/\[0\.02\]/g, 'bg-white/[0.02]');
      content = content.replace(/bg-emerald-900\/5 dark:bg-white\/\[0\.03\]/g, 'bg-white/[0.03]');
      content = content.replace(/bg-emerald-900\/10 dark:bg-white\/\[0\.04\]/g, 'bg-white/[0.04]');
      content = content.replace(/bg-emerald-900\/10 dark:bg-white\/\[0\.05\]/g, 'bg-white/[0.05]');
      content = content.replace(/bg-emerald-900\/5 dark:bg-white\/5/g, 'bg-white/5');
      content = content.replace(/bg-emerald-900\/10 dark:bg-white\/10/g, 'bg-white/10');
      content = content.replace(/border-emerald-900\/5 dark:border-white\/5/g, 'border-white/5');
      content = content.replace(/border-emerald-900\/10 dark:border-white\/10/g, 'border-white/10');
      content = content.replace(/border-emerald-900\/20 dark:border-white\/20/g, 'border-white/20');
      content = content.replace(/bg-emerald-900\/5 dark:bg-black\/20/g, 'bg-black/20');
      content = content.replace(/bg-wayanad-panel dark:bg-black\/35/g, 'bg-black/35');
      content = content.replace(/text-emerald-800\/70 dark:text-slate-400/g, 'text-slate-400');
      content = content.replace(/text-emerald-800 dark:text-slate-300/g, 'text-slate-300');
      content = content.replace(/text-emerald-900\/60 dark:text-slate-500/g, 'text-slate-500');
      content = content.replace(/bg-emerald-50 dark:bg-slate-950/g, 'bg-slate-950');

      // Now apply fresh:
      // using negative lookbehinds so we don't accidentally replace inside dark:text-white if any existed natively
      for (const { regex, replacement } of replacements) {
         // modify regex to ensure no dark: or hover: before it unless it's safe
         const safeRegex = new RegExp(`(?<!dark:)(?<!dark:hover:)(?<!dark:focus:)(?<!dark:active:)(?<!dark:group-hover:)(?<!hover:)${regex.source}`, 'g');
         if (safeRegex.test(content)) {
           content = content.replace(safeRegex, replacement);
           changed = true;
         }
      }

      // Also apply for hover: prefixes separately
      const hoverReplacements = replacements.map(r => ({
          regex: new RegExp(`(?<!dark:)hover:${r.regex.source}`, 'g'),
          replacement: r.replacement.split(' ').map(cls => 'hover:' + cls.replace('dark:', 'dark:hover:')).join(' ')
      }));

      for (const { regex, replacement } of hoverReplacements) {
         if (regex.test(content)) {
           content = content.replace(regex, replacement);
           changed = true;
         }
      }
      
      // Also apply for focus: prefixes separately
      const focusReplacements = replacements.map(r => ({
          regex: new RegExp(`(?<!dark:)focus:${r.regex.source}`, 'g'),
          replacement: r.replacement.split(' ').map(cls => 'focus:' + cls.replace('dark:', 'dark:focus:')).join(' ')
      }));

      for (const { regex, replacement } of focusReplacements) {
         if (regex.test(content)) {
           content = content.replace(regex, replacement);
           changed = true;
         }
      }

      // focus-within:
      const focusWithinReplacements = replacements.map(r => ({
          regex: new RegExp(`(?<!dark:)focus-within:${r.regex.source}`, 'g'),
          replacement: r.replacement.split(' ').map(cls => 'focus-within:' + cls.replace('dark:', 'dark:focus-within:')).join(' ')
      }));

      for (const { regex, replacement } of focusWithinReplacements) {
         if (regex.test(content)) {
           content = content.replace(regex, replacement);
           changed = true;
         }
      }

      // group-hover:
      const groupHoverReplacements = replacements.map(r => ({
          regex: new RegExp(`(?<!dark:)group-hover:${r.regex.source}`, 'g'),
          replacement: r.replacement.split(' ').map(cls => 'group-hover:' + cls.replace('dark:', 'dark:group-hover:')).join(' ')
      }));

      for (const { regex, replacement } of groupHoverReplacements) {
         if (regex.test(content)) {
           content = content.replace(regex, replacement);
           changed = true;
         }
      }

      fs.writeFileSync(fullPath, content, 'utf-8');
      console.log(`Updated ${fullPath}`);
    }
  }
}

dirs.forEach(processDir);
console.log('Done!');
