// This namespace belongs only to this app and the original source map ID.
export function stateKey(mapId) {
  return `pbz-map:${mapId}:state`
}

export function emptyLocalState() {
  return { version: 1, completedIds: [], pins: [] }
}

function validateState(state) {
  const invalid = () => { throw new Error('Saved map markers could not be read. The stored data has not been changed.') }
  if (!state || state.version !== 1 || !Array.isArray(state.completedIds) || !Array.isArray(state.pins)) invalid()
  if (!state.completedIds.every(id => typeof id === 'string' && id.length > 0)
    || new Set(state.completedIds).size !== state.completedIds.length) invalid()
  const ids = new Set()
  for (const pin of state.pins) {
    if (!pin || typeof pin.id !== 'string' || !pin.id || ids.has(pin.id)
      || !Array.isArray(pin.position) || pin.position.length !== 2
      || !pin.position.every(value => typeof value === 'number' && Number.isFinite(value))) invalid()
    ids.add(pin.id)
  }
  return state
}

export function loadLocalState(storage, mapId) {
  let raw
  try {
    raw = storage.getItem(stateKey(mapId))
  } catch {
    throw new Error('Local storage is unavailable. Your map markers cannot be loaded or saved in this browser.')
  }
  if (raw === null) return emptyLocalState()
  try {
    return validateState(JSON.parse(raw))
  } catch {
    throw new Error('Saved map markers could not be read. The stored data has not been changed.')
  }
}

export function saveLocalState(storage, mapId, state) {
  validateState(state)
  try {
    storage.setItem(stateKey(mapId), JSON.stringify(state))
  } catch {
    throw new Error('Your change could not be saved to local storage. No marker changes were applied. Please try again.')
  }
  return state
}

export function toggleCompletion(state, landmarkId) {
  const ids = new Set(state.completedIds)
  if (ids.has(landmarkId)) ids.delete(landmarkId)
  else ids.add(landmarkId)
  return { ...state, completedIds: [...ids] }
}

export function addCustomPin(state, position, id = globalThis.crypto.randomUUID()) {
  return { ...state, pins: [...state.pins, { id, position: [...position] }] }
}

export function removeCustomPin(state, pinId) {
  return { ...state, pins: state.pins.filter(pin => pin.id !== pinId) }
}

export function clearCustomPins(state) {
  return { ...state, pins: [] }
}

export function clearCompletion(state) {
  return { ...state, completedIds: [] }
}
