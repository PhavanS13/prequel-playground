const STORAGE_KEY = 'prequel-device-lock-v1';
const ITERATIONS = 210000;

function toHex(bytes) {
  return Array.from(new Uint8Array(bytes), b =>
    b.toString(16).padStart(2, '0')
  ).join('');
}

function fromHex(value) {
  return new Uint8Array(
    (String(value).match(/.{2}/g) || [])
      .map(part => parseInt(part, 16))
  );
}

export function lockEnabled() {
  try {
    const settings = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || 'null'
    );
    return !!(settings?.salt && settings?.hash);
  } catch {
    return false;
  }
}

async function hashPin(pin, salt, iterations = ITERATIONS) {
  if (!globalThis.crypto?.subtle) {
    throw new Error(
      'PIN locking requires HTTPS or localhost and a supported browser.'
    );
  }

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(String(pin)),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const result = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256'
    },
    key,
    256
  );

  return toHex(result);
}

export async function setPin(pin) {
  if (!/^\d{4,8}$/.test(String(pin))) {
    throw new Error('Your PIN must contain 4 to 8 digits.');
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await hashPin(pin, salt);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      salt: toHex(salt),
      hash,
      iterations: ITERATIONS
    })
  );
}

export async function checkPin(pin) {
  try {
    const settings = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || 'null'
    );

    if (!settings?.salt || !settings?.hash) {
      return false;
    }

    const actual = await hashPin(
      pin,
      fromHex(settings.salt),
      Number(settings.iterations) || ITERATIONS
    );

    const expected = String(settings.hash);

    if (actual.length !== expected.length) return false;

    let difference = 0;

    for (let i = 0; i < actual.length; i++) {
      difference |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
    }

    return difference === 0;
  } catch {
    return false;
  }
}

export function removePin() {
  localStorage.removeItem(STORAGE_KEY);
}