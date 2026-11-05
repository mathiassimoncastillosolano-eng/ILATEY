const KEY = 'ilatey-welcome-v1'

/** ¿Ya vio el visitante la bienvenida completa? Si el navegador bloquea el almacenamiento, se considera que no. */
export function hasSeenWelcome(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function markWelcomeSeen(): void {
  try {
    localStorage.setItem(KEY, '1')
  } catch {
    // Sin almacenamiento disponible: la bienvenida simplemente podrá repetirse.
  }
}
