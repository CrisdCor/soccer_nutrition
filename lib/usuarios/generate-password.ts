// Pensada para correr en el navegador (Web Crypto), no en el servidor --
// la contraseña generada nunca sale del cliente hasta que el admin confirma
// el reset, así que no hace falta pedirla a un Route Handler.
const CHARSET_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
const CHARSET_DIGITS = "23456789";
// Sin 0/O/1/l/I: se lee/dicta por WhatsApp o en persona, así que se evitan
// los caracteres que se confunden entre sí a simple vista.
const CHARSET_ALL = CHARSET_LETTERS + CHARSET_DIGITS;

function randomChar(charset: string): string {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return charset[bytes[0] % charset.length];
}

/**
 * Contraseña temporal de 12 caracteres, mezcla de letras y números
 * (garantizado: se fuerza al menos una letra y un número, el resto es
 * aleatorio uniforme del charset completo, y se mezcla para no dejar el
 * dígito forzado siempre al final).
 */
export function generateTemporaryPassword(length = 12): string {
  const chars = [randomChar(CHARSET_LETTERS), randomChar(CHARSET_DIGITS)];
  while (chars.length < length) {
    chars.push(randomChar(CHARSET_ALL));
  }

  // Fisher-Yates con randomness criptográfica, para no revelar por posición
  // cuáles fueron los dos caracteres "forzados".
  for (let i = chars.length - 1; i > 0; i--) {
    const bytes = new Uint32Array(1);
    crypto.getRandomValues(bytes);
    const j = bytes[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}
