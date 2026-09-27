// Tiny in-browser memory for the mock user journey (name/email for the booking form, chosen slot for the Done screen).
export interface Journey {
  fullName?: string
  email?: string
  booking?: { date: string; time: string }
}

const KEY = 'sada.journey'

export function getJourney(): Journey {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? '{}') as Journey
  } catch {
    return {}
  }
}

export function saveJourney(patch: Journey) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...getJourney(), ...patch }))
  } catch {
    /* ignore — prototype only */
  }
}

export function clearJourney() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
