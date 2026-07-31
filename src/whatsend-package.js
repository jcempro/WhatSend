// Autor: JeanCarloEM.com
// Site do Autor: https://jeancarloem.com
// Licenca: Mozilla Public License 2.0
// Site da Licenca: https://www.mozilla.org/MPL/2.0/
// Resumo da Licenca: uso, copia, modificacao e distribuicao permitidos conforme os termos da MPL-2.0.
// Disclaimer: fornecido "AS IS", sem garantias de qualquer tipo.

(function exposeWhatSendPackage(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.WhatSendPackage = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createWhatSendPackage() {
  "use strict";

  const SCHEMA = "https://jeancarloem.com/whatsend/package/v1";
  const VERSION = 1;
  const MAX_PACKAGE_BYTES = 20 * 1024 * 1024;

  function normalizeContent(value) {
    return String(value == null ? "" : value).replace(/^\ufeff/u, "");
  }

  async function sha256(value) {
    const content = normalizeContent(value);
    if (typeof require === "function") {
      try { return require("crypto").createHash("sha256").update(content, "utf8").digest("hex"); } catch (_) {}
    }
    if (globalThis.crypto && globalThis.crypto.subtle) {
      const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(content));
      return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    }
    return sha256Fallback(content);
  }

  function sha256Fallback(value) {
    // PROTECAO: mantém a verificação de integridade disponível em file:// sem WebCrypto.
    const constants = [
      0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
      0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
      0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
      0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
      0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
      0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
      0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
      0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2,
    ];
    const input = new TextEncoder().encode(value);
    const paddedLength = Math.ceil((input.length + 9) / 64) * 64;
    const padded = new Uint8Array(paddedLength);
    padded.set(input);
    padded[input.length] = 0x80;
    const view = new DataView(padded.buffer);
    const bitLength = input.length * 8;
    view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000), false);
    view.setUint32(paddedLength - 4, bitLength >>> 0, false);
    const hash = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    const words = new Uint32Array(64);
    const rotate = (word, count) => (word >>> count) | (word << (32 - count));
    for (let offset = 0; offset < paddedLength; offset += 64) {
      for (let index = 0; index < 16; index += 1) words[index] = view.getUint32(offset + index * 4, false);
      for (let index = 16; index < 64; index += 1) {
        const s0 = rotate(words[index - 15], 7) ^ rotate(words[index - 15], 18) ^ (words[index - 15] >>> 3);
        const s1 = rotate(words[index - 2], 17) ^ rotate(words[index - 2], 19) ^ (words[index - 2] >>> 10);
        words[index] = (words[index - 16] + s0 + words[index - 7] + s1) >>> 0;
      }
      let [a,b,c,d,e,f,g,h] = hash;
      for (let index = 0; index < 64; index += 1) {
        const s1 = rotate(e, 6) ^ rotate(e, 11) ^ rotate(e, 25);
        const choice = (e & f) ^ (~e & g);
        const temp1 = (h + s1 + choice + constants[index] + words[index]) >>> 0;
        const s0 = rotate(a, 2) ^ rotate(a, 13) ^ rotate(a, 22);
        const majority = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (s0 + majority) >>> 0;
        h=g;g=f;f=e;e=(d+temp1)>>>0;d=c;c=b;b=a;a=(temp1+temp2)>>>0;
      }
      hash[0]=(hash[0]+a)>>>0;hash[1]=(hash[1]+b)>>>0;hash[2]=(hash[2]+c)>>>0;hash[3]=(hash[3]+d)>>>0;
      hash[4]=(hash[4]+e)>>>0;hash[5]=(hash[5]+f)>>>0;hash[6]=(hash[6]+g)>>>0;hash[7]=(hash[7]+h)>>>0;
    }
    return hash.map((word) => word.toString(16).padStart(8, "0")).join("");
  }

  async function createPackage(input = {}) {
    const templateContent = normalizeContent(input.templateContent);
    const csvContent = normalizeContent(input.csvContent);
    if (!templateContent.trim() || !csvContent.trim()) throw new Error("O pacote completo exige modelo e CSV.");
    const document = isPlainObject(input.preserved) ? cloneSafe(input.preserved) : {};
    document.schema = SCHEMA;
    document.version = VERSION;
    document.createdAt = input.createdAt || document.createdAt || new Date().toISOString();
    document.template = { ...(isPlainObject(document.template) ? document.template : {}), name: safeName(input.templateName, "modelo.md", ".md"), content: templateContent };
    document.csv = { ...(isPlainObject(document.csv) ? document.csv : {}), name: safeName(input.csvName, "clientes.csv", ".csv"), content: csvContent };
    document.integrity = {
      algorithm: "SHA-256",
      template: await sha256(templateContent),
      csv: await sha256(csvContent),
    };
    return document;
  }

  async function parsePackage(value) {
    const source = typeof value === "string" ? value.replace(/^\ufeff/u, "") : JSON.stringify(value);
    if (new TextEncoder().encode(source).length > MAX_PACKAGE_BYTES) throw new Error("Pacote excede o limite de 20 MiB.");
    let document;
    try { document = typeof value === "string" ? JSON.parse(source) : cloneSafe(value); }
    catch (error) { throw new Error(`Pacote JSON inválido: ${error.message}`); }
    if (!isPlainObject(document) || document.schema !== SCHEMA || document.version !== VERSION) throw new Error("Schema ou versão do pacote não suportado.");
    if (!isPlainObject(document.template) || typeof document.template.content !== "string") throw new Error("Modelo ausente ou inválido no pacote.");
    if (!isPlainObject(document.csv) || typeof document.csv.content !== "string") throw new Error("CSV ausente ou inválido no pacote.");
    if (!isPlainObject(document.integrity) || document.integrity.algorithm !== "SHA-256") throw new Error("Contrato de integridade ausente ou inválido.");
    const templateHash = await sha256(document.template.content);
    const csvHash = await sha256(document.csv.content);
    if (!constantTimeEqual(templateHash, document.integrity.template) || !constantTimeEqual(csvHash, document.integrity.csv)) {
      throw new Error("Integridade SHA-256 divergente; o pacote não foi aplicado.");
    }
    return {
      csvContent: normalizeContent(document.csv.content),
      csvName: safeName(document.csv.name, "clientes.csv", ".csv"),
      document,
      templateContent: normalizeContent(document.template.content),
      templateName: safeName(document.template.name, "modelo.md", ".md"),
    };
  }

  function stringifyPackage(document) {
    return `${JSON.stringify(document, null, 2)}\n`;
  }

  function safeName(value, fallback, extension) {
    const name = String(value || fallback).replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-").trim() || fallback;
    return name.toLocaleLowerCase("pt-BR").endsWith(extension) ? name : `${name}${extension}`;
  }

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
  }

  function cloneSafe(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function constantTimeEqual(left, right) {
    const a = String(left || "").toLocaleLowerCase("en-US");
    const b = String(right || "").toLocaleLowerCase("en-US");
    if (!/^[a-f0-9]{64}$/u.test(a) || !/^[a-f0-9]{64}$/u.test(b) || a.length !== b.length) return false;
    let difference = 0;
    for (let index = 0; index < a.length; index += 1) difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
    return difference === 0;
  }

  return { MAX_PACKAGE_BYTES, SCHEMA, VERSION, createPackage, parsePackage, sha256, stringifyPackage };
});
