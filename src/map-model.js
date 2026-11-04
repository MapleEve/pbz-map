// Public positions remain [longitude, latitude]; only Leaflet boundaries swap them.
export function positionToLatLng(position) {
  return [position[1], position[0]]
}

export function boundsToLatLngBounds(bounds) {
  return [[bounds[1], bounds[0]], [bounds[3], bounds[2]]]
}

export function positionInBounds(position, bounds) {
  return position[0] >= bounds[0] && position[0] <= bounds[2]
    && position[1] >= bounds[1] && position[1] <= bounds[3]
}

export function allCatalogs(map) {
  return map.catalogGroups.flatMap(group => group.catalogs)
}

const namedCatalogGroups = new Set(['Locations', 'Quests', 'Characters', 'NPCs', 'Others'])
const defaultOffCatalogGroups = new Set(['Items', 'Upgrade Materials'])

export function markerNameCatalogIds(map) {
  return map.catalogGroups.flatMap(group => group.catalogs
    .filter(catalog => catalog.showLandmarkName === true && (namedCatalogGroups.has(group.name)
      || (group.name === 'Enemies' && catalog.name === 'Bosses')))
    .map(catalog => catalog.id))
}

export function defaultCatalogIds(map) {
  return map.catalogGroups.flatMap(group => group.catalogs
    .filter(catalog => catalog.defaultSelected === true && !defaultOffCatalogGroups.has(group.name)
      && !(['Equipment', 'Equipments'].includes(group.name) && catalog.name === 'Soul Tempering Materials'))
    .map(catalog => catalog.id))
}

// Render and selection identity is separate from the canonical completion ID.
export function representationKey(mapOrId, point) {
  const mapId = typeof mapOrId === 'string' ? mapOrId : mapOrId?.id
  requireCondition(isId(mapId) && isRecord(point) && isId(point.catalogId) && isId(point.id),
    'The landmark representation identity is incomplete or invalid.')
  return JSON.stringify([mapId, point.catalogId, point.id])
}

export function normalizeSearch(text) {
  return text.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase('en').trim()
}

export function filterLandmarks(landmarks, { catalogIds, search = '', completionFilter = null, completedIds = new Set() }) {
  const selected = new Set(catalogIds)
  const query = normalizeSearch(search)
  return landmarks.filter(landmark => {
    if (!selected.has(landmark.catalogId)) return false
    if (completionFilter === 'completed' && !completedIds.has(landmark.id)) return false
    if (completionFilter === 'incomplete' && completedIds.has(landmark.id)) return false
    if (!query) return true
    return normalizeSearch(`${landmark.name}\n${landmark.description}`).includes(query)
  })
}

// Search uses complete owning records, never the category/completion-filtered markers.
export function searchLandmarks(regions, text) {
  const query = normalizeSearch(text)
  const groups = { title: [], description: [] }
  if (!query) return groups
  for (const { config, landmarks } of regions) {
    const catalogs = new Map(allCatalogs(config).map(catalog => [catalog.id, catalog]))
    for (const point of landmarks) {
      const titleHit = normalizeSearch(point.name).includes(query)
      if (!titleHit && !normalizeSearch(point.description).includes(query)) continue
      groups[titleHit ? 'title' : 'description'].push({
        mapId: config.id, mapName: config.mapName,
        catalogId: point.catalogId, catalogName: catalogs.get(point.catalogId).name, point,
      })
    }
  }
  return groups
}

// Preserve the original text, including accents, while returning text-only spans.
export function searchTextParts(text, search) {
  const query = normalizeSearch(search)
  if (!query) return [{ text, match: false }]
  let folded = ''
  const positions = []
  let offset = 0
  for (const character of text) {
    const end = offset + character.length
    const value = character.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase('en')
    if (!value && positions.length) positions.at(-1).end = end
    for (let i = 0; i < value.length; i++) positions.push({ start: offset, end })
    folded += value
    offset = end
  }
  const index = folded.indexOf(query)
  if (index < 0) return [{ text, match: false }]
  const start = positions[index].start
  const end = positions[index + query.length - 1].end
  return [
    { text: text.slice(0, start), match: false },
    { text: text.slice(start, end), match: true },
    { text: text.slice(end), match: false },
  ].filter(part => part.text.length)
}

export function countByCatalog(landmarks) {
  return landmarks.reduce((counts, landmark) => {
    counts[landmark.catalogId] = (counts[landmark.catalogId] || 0) + 1
    return counts
  }, {})
}

const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const isId = value => typeof value === 'string' && value.length > 0
const isNumber = value => typeof value === 'number' && Number.isFinite(value)
const isPosition = value => Array.isArray(value) && value.length === 2 && value.every(isNumber)
const isEnglish = (value, allowEmpty = false) => typeof value === 'string'
  && (allowEmpty || value.trim().length > 0) && !/\p{Script=Han}/u.test(value)

export function isLocalResource(path) {
  return typeof path === 'string' && /^\/(assets|data)\//.test(path)
    && !/[\\\u0000-\u001f?#]/.test(path)
    && !path.split('/').some(part => part === '..' || part === '.')
}

function requireCondition(condition, message) {
  if (!condition) throw new Error(message)
}

export function validateManifest(manifest) {
  const invalid = 'The local map manifest is incomplete or invalid.'
  requireCondition(isRecord(manifest) && manifest.name === 'pbz map'
    && Array.isArray(manifest.maps) && manifest.maps.length > 0, invalid)
  const mapIds = new Set()
  for (const map of manifest.maps) {
    requireCondition(isRecord(map) && isId(map.id) && !mapIds.has(map.id), invalid)
    mapIds.add(map.id)
    const untranslated = `English content is missing or incomplete for map ${map.id}. No source-language fallback is used.`
    requireCondition(isEnglish(map.mapName), untranslated)
    requireCondition(isPosition(map.center) && Array.isArray(map.bounds) && map.bounds.length === 4
      && map.bounds.every(isNumber) && map.bounds[0] < map.bounds[2] && map.bounds[1] < map.bounds[3]
      && isNumber(map.minZoom) && isNumber(map.maxZoom) && isNumber(map.defaultZoom)
      && map.minZoom <= map.defaultZoom && map.defaultZoom <= map.maxZoom && map.tileSize === 256
      && (map.maxNativeZoom === undefined || (Number.isInteger(map.maxNativeZoom)
        && map.minZoom <= map.maxNativeZoom && map.maxNativeZoom <= map.maxZoom))
      && isLocalResource(map.tileUrl) && ['{z}', '{x}', '{y}'].every(token => map.tileUrl.includes(token))
      && isLocalResource(map.pointsUrl) && Array.isArray(map.catalogGroups)
      && (map.useNewMapEngine === undefined || typeof map.useNewMapEngine === 'boolean')
      && (map.areas === undefined || map.areas === null || Array.isArray(map.areas)), invalid)
    const groups = new Set()
    const catalogs = new Set()
    for (const group of map.catalogGroups) {
      requireCondition(isRecord(group) && isId(group.id) && !groups.has(group.id)
        && Array.isArray(group.catalogs), invalid)
      groups.add(group.id)
      requireCondition(isEnglish(group.name), untranslated)
      for (const catalog of group.catalogs) {
        requireCondition(isRecord(catalog) && isId(catalog.id) && !catalogs.has(catalog.id)
          && typeof catalog.defaultSelected === 'boolean'
          && (catalog.iconUrl === null || isLocalResource(catalog.iconUrl))
          && (catalog.iconSelectedUrl === null || isLocalResource(catalog.iconSelectedUrl))
          && (catalog.regionType === undefined || catalog.regionType === null || isNumber(catalog.regionType))
          && (catalog.showLandmarkName === undefined || catalog.showLandmarkName === null
            || typeof catalog.showLandmarkName === 'boolean'), invalid)
        catalogs.add(catalog.id)
        requireCondition(isEnglish(catalog.name), untranslated)
      }
    }
  }
  return manifest
}

export function validatePoints(map, data) {
  const invalid = `The local landmark snapshot for map ${map.id} is incomplete or invalid.`
  requireCondition(isRecord(data) && data.mapId === map.id && Array.isArray(data.landmarks)
    && Number.isInteger(data.sourceCount) && data.sourceCount === data.landmarks.length, invalid)
  const catalogs = new Set(allCatalogs(map).map(catalog => catalog.id))
  const representations = new Set()
  const untranslated = `English landmark content is missing or incomplete for map ${map.id}. No source-language fallback is used.`
  for (const landmark of data.landmarks) {
    requireCondition(isRecord(landmark) && isId(landmark.id)
      && catalogs.has(landmark.catalogId) && isPosition(landmark.position)
      && Array.isArray(landmark.images) && landmark.images.every(isLocalResource), invalid)
    const key = representationKey(map, landmark)
    requireCondition(!representations.has(key), invalid)
    requireCondition(isEnglish(landmark.name) && isEnglish(landmark.description, true), untranslated)
    representations.add(key)
  }
  return data.landmarks
}

function localAppBase(base) {
  requireCondition(typeof base === 'string' && base.startsWith('/') && !base.startsWith('//')
    && !/[\\\u0000-\u001f?#]/.test(base)
    && !base.split('/').some(part => part === '..' || part === '.'), 'The local app base path is invalid.')
  return `${base.replace(/\/$/, '')}/`
}

export function localResourceUrl(path, base = import.meta.env ? import.meta.env.BASE_URL : '/') {
  requireCondition(isLocalResource(path), 'The map requested a non-local resource. Only the local snapshot is supported.')
  return `${localAppBase(base).slice(0, -1)}${path}`
}

export function mapSearchUrl(mapId, term, kind, base = import.meta.env ? import.meta.env.BASE_URL : '/') {
  requireCondition(isId(mapId) && typeof term === 'string' && term.trim().length > 0
    && ['name', 'keyword'].includes(kind), 'The local search destination is invalid.')
  // The leading plus distinguishes the keyword route from a selected name.
  return `${localAppBase(base)}?mapId=${encodeURIComponent(mapId)}&name=${kind === 'keyword' ? '+' : ''}${encodeURIComponent(term)}`
}

export async function readLocalJson(path, fetcher = fetch, base) {
  const url = localResourceUrl(path, base)
  let response
  try {
    response = await fetcher(url, { method: 'GET', credentials: 'omit', redirect: 'error' })
  } catch {
    throw new Error(`Could not read the local map file: ${path}. Check that the local app is running.`)
  }
  requireCondition(response.ok, `Could not read the local map file: ${path} (HTTP ${response.status}).`)
  try {
    return await response.json()
  } catch {
    throw new Error(`The local map file is not valid JSON: ${path}.`)
  }
}
