<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import MapCanvas from './MapCanvas.vue'
import {
  allCatalogs, countByCatalog, defaultCatalogIds, filterLandmarks,
  localResourceUrl, mapSearchUrl, positionInBounds, readLocalJson, representationKey, searchLandmarks, searchTextParts, validateManifest, validatePoints,
} from './map-model.js'
import {
  addCustomPin, clearCompletion, clearCustomPins, emptyLocalState, loadLocalState,
  removeCustomPin, saveLocalState, toggleCompletion,
} from './local-state.js'

const manifest = ref(null)
const activeMapId = ref('')
const landmarks = ref([])
const localState = ref(emptyLocalState())
const selectedCatalogIds = ref([])
const query = ref('')
const searchOpen = ref(false)
const searchReady = ref(false)
const searchResults = ref({ title: [], description: [] })
const searchError = ref('')
const restoredSearch = ref(null)
const device = window.navigator ?? {}
const deviceMode = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(device.userAgent ?? '')
  || device.userAgentData?.mobile === true || (device.platform === 'MacIntel' && device.maxTouchPoints > 1)
  ? 'mobile'
  : device.userAgentData?.mobile === false || /Windows NT|Macintosh|X11|CrOS|Linux x86_64/i.test(device.userAgent ?? '')
    ? 'desktop' : 'unknown'
const completionFilter = ref('incomplete')
const selection = ref(null)
const addPinMode = ref(false)
const panelExpanded = ref(true)
const mobilePanel = ref(null)
const mobileGroupId = ref('')
const showMarkerNames = ref(true)
const preferenceError = ref('')
const draftPinPosition = ref(null)
const confirmation = ref(null)
const confirmationClosing = ref(false)
const pinDeleteSheet = ref(null)
const notice = ref('')
const booting = ref(true)
const loading = ref(false)
const startupError = ref('')
const mapError = ref('')
const storageError = ref('')
const storageLoaded = ref(false)
const assetErrors = ref(new Set())
const pinHint = ref('')
const mapCanvas = ref(null)
let requestNumber = 0
let searchRequestNumber = 0
let searchTimer
let confirmationTimer
let noticeTimer
let disposed = false
let initialSearchPending = true
const searchCollections = new Map()
const searchReads = new Map()
const controlIcons = Object.freeze({
  retract: '/assets/icons/52f882e3b2dff17a986ba703227c112c3379b6ca276046bff2055a7552e0cbe4.png',
  addPin: '/assets/icons/b1c4de01fb338582547dd1c17350c3ac2105036e052351f6607dd4e1d6a4b7f8.png',
  search: '/assets/icons/1e784e6caff34457acef9bef1fe02c84970fb215a409bbde649727e5f2c2da43.png',
  mobileSettings: '/assets/icons/52628858a58728efd9b842a8869fdb38544e16a8fc77d168f0a9768544d94348.png',
  mobileSearch: '/assets/icons/d162033fb38941cffcf5b5f1861017dfc2d70fd65c3090e90664d6fa77fc3093.png',
  mobileMaps: '/assets/icons/833705dd7f86f6a2a5d252ae6731a18bc27df61aa7a388b5e61bbc8cdc4ed1b7.png',
  mobileAddPin: '/assets/icons/40541d5ca567f91d826c68d740508d7c90b12d4fa779561ec4d0c00979cebab2.png',
  mobileFilters: '/assets/icons/033ad009273fb1937fc4475f667f308f08487d8d47619919bc2a8fe527d9d1ff.png',
  mobileSelected: '/assets/icons/fd481223779d8b124328832a054fa62c4e73a1365145aea892d7e5f39a8102a1.png',
})

const activeMap = computed(() => manifest.value?.maps.find(map => map.id === activeMapId.value))
const completedIds = computed(() => new Set(localState.value.completedIds))
const canUseMap = computed(() => Boolean(activeMap.value && !booting.value && !loading.value && !startupError.value && !mapError.value))
const canSave = computed(() => canUseMap.value && storageLoaded.value)
const catalogs = computed(() => activeMap.value ? allCatalogs(activeMap.value) : [])
const ordinaryCatalogs = computed(() => catalogs.value.filter(catalog => catalog.regionType !== 1))
const allCategoriesSelected = computed(() => ordinaryCatalogs.value.every(catalog => selectedCatalogIds.value.includes(catalog.id)))
const mobileGroup = computed(() => activeMap.value?.catalogGroups.find(group => group.id === mobileGroupId.value))
const counts = computed(() => countByCatalog(landmarks.value))
const visibleLandmarks = computed(() => activeMap.value ? filterLandmarks(restoredSearch.value?.landmarks ?? landmarks.value, {
  catalogIds: restoredSearch.value ? catalogs.value.map(catalog => catalog.id) : selectedCatalogIds.value,
  completedIds: completedIds.value,
  completionFilter: completionFilter.value,
}) : [])
const searchResultCount = computed(() => searchResults.value.title.length + searchResults.value.description.length)
const searchGroups = computed(() => [
  { id: 'title', label: 'Name matches', results: searchResults.value.title },
  { id: 'description', label: 'Description matches', results: searchResults.value.description },
])
const showSearchResults = computed(() => searchOpen.value && query.value.trim().length > 0 && searchReady.value)
const assetErrorText = computed(() => {
  const errors = assetErrors.value
  const resources = [errors.has('tile') && 'map tiles', errors.has('icon') && 'category icons', errors.has('image') && 'landmark images'].filter(Boolean)
  return resources.length ? `Some ${resources.join(', ')} could not be loaded from the local snapshot.` : ''
})

async function start() {
  booting.value = true
  startupError.value = ''
  try {
    const data = validateManifest(await readLocalJson('/data/manifest.json'))
    manifest.value = data
    loadNamePreference()
    booting.value = false
    const requestedMap = new URLSearchParams(window.location.search).get('mapId')
    await changeMap(data.maps.find(map => map.id === requestedMap)?.id ?? data.maps[0].id)
  } catch (error) {
    startupError.value = error.message
    booting.value = false
  }
}

async function changeMap(id) {
  const request = ++requestNumber
  activeMapId.value = id
  loading.value = true
  mapError.value = ''
  storageError.value = ''
  storageLoaded.value = false
  assetErrors.value = new Set()
  landmarks.value = []
  localState.value = emptyLocalState()
  selectedCatalogIds.value = []
  closeSearch(true)
  restoredSearch.value = null
  completionFilter.value = 'incomplete'
  selection.value = null
  cancelPlacement()
  mobilePanel.value = null
  pinDeleteSheet.value = null
  clearTimeout(confirmationTimer)
  confirmation.value = null
  confirmationClosing.value = false
  const config = manifest.value.maps.find(map => map.id === id)
  try {
    const data = await readLocalJson(config.pointsUrl)
    const points = validatePoints(config, data)
    if (request !== requestNumber) return
    landmarks.value = points
    searchCollections.set(id, points)
    selectedCatalogIds.value = defaultCatalogIds(config)
    try {
      localState.value = loadLocalState(window.localStorage, id)
      storageLoaded.value = true
    } catch (error) {
      storageError.value = error.message
    }
    if (initialSearchPending) {
      initialSearchPending = false
      await restoreSearch(config, points, request)
    }
  } catch (error) {
    if (request === requestNumber) mapError.value = error.message
  } finally {
    if (request === requestNumber && !disposed) {
      loading.value = false
      if (!mapError.value && restoredSearch.value?.kind === 'keyword' && searchOpen.value
        && query.value === restoredSearch.value.term) scheduleSearch()
    }
  }
}

function mapNavigationUrl(id) {
  const parameters = new URLSearchParams({ mapId: id })
  const currentParameters = new URLSearchParams(window.location.search)
  if (deviceMode === 'mobile' && currentParameters.has('name')) parameters.set('name', currentParameters.get('name'))
  const referral = currentParameters.get('ref')
  if (referral) parameters.set('ref', referral)
  const base = localResourceUrl('/data/manifest.json').slice(0, -'data/manifest.json'.length)
  return `${base}?${parameters}`
}

function chooseMap(id) {
  if (!manifest.value?.maps.some(map => map.id === id)) return
  window.location.href = mapNavigationUrl(id)
}

function toggleCatalog(id) {
  const catalog = catalogs.value.find(value => value.id === id)
  if (!catalog) return
  if (selectedCatalogIds.value.includes(id)) {
    selectedCatalogIds.value = selectedCatalogIds.value.filter(value => value !== id)
  } else {
    const exclusiveIds = catalog.regionType === 1
      ? new Set(catalogs.value.filter(value => value.regionType === 1).map(value => value.id)) : new Set()
    selectedCatalogIds.value = [...selectedCatalogIds.value.filter(value => !exclusiveIds.has(value)), id]
  }
}

function toggleAllCatalogs() {
  const selectedRegions = catalogs.value.filter(catalog => catalog.regionType === 1 && selectedCatalogIds.value.includes(catalog.id)).map(catalog => catalog.id)
  selectedCatalogIds.value = allCategoriesSelected.value ? selectedRegions : [...ordinaryCatalogs.value.map(catalog => catalog.id), ...selectedRegions]
}

function clearCategorySelection() {
  completionFilter.value = null
  selectedCatalogIds.value = []
  selection.value = null
}

function setCompletionFilter(value) {
  if (value === completionFilter.value || !canUseMap.value) return
  completionFilter.value = value
}

function groupSelectionCount(group) {
  return group.catalogs.filter(catalog => selectedCatalogIds.value.includes(catalog.id)).length
}

function categoryIcon(catalog) {
  return selectedCatalogIds.value.includes(catalog.id) ? catalog.iconSelectedUrl || catalog.iconUrl : catalog.iconUrl
}

function openMobilePanel(panel) {
  closeSearch()
  selection.value = null
  mobilePanel.value = panel
  if (panel === 'filters') mobileGroupId.value = activeMap.value?.catalogGroups[0]?.id ?? ''
}

function namePreferenceKey() {
  const siblings = activeMap.value?.siblingMapIds || manifest.value.maps.map(map => map.id).join(',')
  return `mapMakerNameSwitch-${siblings}`
}

function loadNamePreference() {
  try {
    const saved = window.localStorage.getItem(namePreferenceKey())
    showMarkerNames.value = saved === null ? true : JSON.parse(saved) !== false
    preferenceError.value = ''
  } catch {
    preferenceError.value = 'The marker-name preference could not be read. Completion marks and pins were not changed.'
  }
}

function toggleMarkerNames() {
  const next = !showMarkerNames.value
  try {
    window.localStorage.setItem(namePreferenceKey(), JSON.stringify(next))
    showMarkerNames.value = next
    preferenceError.value = ''
  } catch {
    preferenceError.value = 'The marker-name preference could not be saved. Completion marks and pins were not changed.'
  }
}

function persist(nextState) {
  if (!canSave.value) return false
  try {
    saveLocalState(window.localStorage, activeMapId.value, nextState)
    localState.value = nextState
    storageError.value = ''
    return true
  } catch (error) {
    storageError.value = error.message
    return false
  }
}

function markComplete(id) {
  if (landmarks.value.some(point => point.id === id)) persist(toggleCompletion(localState.value, id))
}

function placePin(position) {
  if (!canSave.value || !addPinMode.value) return
  draftPinPosition.value = [...position]
  pinHint.value = ''
}

function confirmPin() {
  if (!canSave.value || !addPinMode.value) return
  const position = deviceMode === 'mobile' ? mapCanvas.value?.getCenterPosition() : draftPinPosition.value
  if (!position) return
  if (!positionInBounds(position, activeMap.value.bounds)) {
    pinHint.value = 'Choose a position within the map bounds.'
    return
  }
  const next = addCustomPin(localState.value, position)
  if (persist(next)) {
    cancelPlacement()
    selection.value = { kind: 'pin', id: next.pins.at(-1).id, source: 'pin' }
  }
}

function cancelPlacement() {
  addPinMode.value = false
  draftPinPosition.value = null
  pinHint.value = ''
}

function removePin(id) {
  if (!canSave.value || !localState.value.pins.some(pin => pin.id === id)) return
  if (deviceMode === 'mobile') pinDeleteSheet.value = { id, mapId: activeMapId.value }
  else askConfirmation('delete-pin', 'Delete this custom pin?', id)
}

function deletePin(id) {
  if (persist(removeCustomPin(localState.value, id)) && selection.value?.kind === 'pin' && selection.value.id === id) selection.value = null
}

function confirmDeletePin() {
  const pending = pinDeleteSheet.value
  pinDeleteSheet.value = null
  if (pending?.mapId === activeMapId.value) deletePin(pending.id)
}

function askConfirmation(kind, text, id = null) {
  if (confirmation.value) return
  confirmationClosing.value = false
  confirmation.value = { kind, text, id, mapId: activeMapId.value }
}

function finishConfirmation(confirmed) {
  if (!confirmation.value || confirmationClosing.value) return
  confirmationClosing.value = true
  const pending = confirmation.value
  confirmationTimer = setTimeout(() => {
    confirmationTimer = undefined
    confirmation.value = null
    confirmationClosing.value = false
    if (!confirmed || disposed || pending.mapId !== activeMapId.value || !canSave.value) return
    if (pending.kind === 'delete-pin') deletePin(pending.id)
    if (pending.kind === 'clear-pins') {
      if (persist(clearCustomPins(localState.value)) && selection.value?.kind === 'pin') selection.value = null
    }
    if (pending.kind === 'clear-completion' && persist(clearCompletion(localState.value))) showNotice('Completion marks cleared.')
  }, 300)
}

function showNotice(text) {
  clearTimeout(noticeTimer)
  notice.value = text
  noticeTimer = setTimeout(() => { notice.value = '' }, 2000)
}

function clearPins() {
  if (!canSave.value || !localState.value.pins.length) return
  askConfirmation('clear-pins', `Clear all custom pins on ${activeMap.value.mapName}? Completion marks will not be changed.`)
}

function resetProgress() {
  if (!canSave.value || !localState.value.completedIds.length) return
  mobilePanel.value = null
  askConfirmation('clear-completion', `Clear completion marks on ${activeMap.value.mapName}? Custom pins will not be changed.`)
}

function togglePinMode() {
  if (addPinMode.value) cancelPlacement()
  else {
    if (!canSave.value) return
    addPinMode.value = true
    draftPinPosition.value = null
    pinHint.value = ''
    selection.value = null
    mobilePanel.value = null
    closeSearch()
  }
}

function resetView() {
  selection.value = null
  mapCanvas.value?.resetView()
}

function invalidateSearch() {
  searchRequestNumber += 1
  clearTimeout(searchTimer)
  searchTimer = undefined
}

function clearSearch() {
  invalidateSearch()
  query.value = ''
  searchReady.value = false
  searchResults.value = { title: [], description: [] }
  searchError.value = ''
}

function closeSearch(clear = false) {
  searchOpen.value = false
  invalidateSearch()
  if (clear) clearSearch()
}

function openSearch() {
  searchOpen.value = true
  if (deviceMode === 'mobile') {
    selection.value = null
    mobilePanel.value = null
  }
  if (query.value.trim() && !searchReady.value) scheduleSearch()
}

function blurSearch() {
  if (deviceMode !== 'mobile') closeSearch()
}

async function loadSearchRegions() {
  return Promise.all(manifest.value.maps.map(async config => {
    if (!searchCollections.has(config.id)) {
      if (!searchReads.has(config.id)) {
        const read = readLocalJson(config.pointsUrl).then(data => {
          const points = validatePoints(config, data)
          searchCollections.set(config.id, points)
          return points
        }).finally(() => searchReads.delete(config.id))
        searchReads.set(config.id, read)
      }
      await searchReads.get(config.id)
    }
    return { config, landmarks: searchCollections.get(config.id) }
  }))
}

function scheduleSearch() {
  invalidateSearch()
  searchReady.value = false
  searchResults.value = { title: [], description: [] }
  searchError.value = ''
  if (disposed || !searchOpen.value || !query.value.trim() || !canUseMap.value) return
  const request = searchRequestNumber
  const text = query.value
  searchTimer = setTimeout(async () => {
    searchTimer = undefined
    try {
      const regions = await loadSearchRegions()
      if (disposed || request !== searchRequestNumber || !searchOpen.value || query.value !== text) return
      searchResults.value = searchLandmarks(regions, text)
      searchReady.value = true
    } catch (error) {
      if (!disposed && request === searchRequestNumber && searchOpen.value) searchError.value = error.message
    }
  }, 500)
}

function searchKey(mapId, kind) {
  return `pbz-map:${mapId}:search-${kind}`
}

function navigateSearch(mapId, term, kind, newTab = false) {
  try {
    const url = mapSearchUrl(mapId, term, kind)
    window.localStorage.removeItem(searchKey(mapId, kind === 'name' ? 'keyword' : 'name'))
    window.localStorage.setItem(searchKey(mapId, kind), term)
    if (newTab) window.open(url, '_blank')
    else window.location.href = url
  } catch {
    searchError.value = 'The local search destination could not be saved or opened. Completion marks and pins were not changed.'
  }
}

function selectResult(result) {
  if (!showSearchResults.value) return
  const match = [...searchResults.value.title, ...searchResults.value.description]
    .find(value => representationKey(value.mapId, value.point) === representationKey(result.mapId, result.point))
  if (!match) return
  navigateSearch(match.mapId, match.point.name, 'name', deviceMode === 'desktop' && match.mapId !== activeMapId.value)
}

function submitSearch() {
  if (showSearchResults.value && searchResultCount.value > 0) navigateSearch(activeMapId.value, query.value, 'keyword')
}

async function restoreSearch(config, points, request) {
  let searchRequest = searchRequestNumber
  try {
    const name = window.localStorage.getItem(searchKey(config.id, 'name'))
    const keyword = window.localStorage.getItem(searchKey(config.id, 'keyword'))
    const kind = name ? 'name' : keyword ? 'keyword' : null
    if (!kind) {
      const route = new URLSearchParams(window.location.search)
      const term = route.get('name')
      if (route.get('mapId') === config.id && term) {
        const catalog = allCatalogs(config).filter(value => value.name === term).at(-1)
        restoredSearch.value = {
          kind: 'url', term, minimumZoom: false,
          landmarks: catalog ? points.filter(point => point.catalogId === catalog.id) : points,
        }
      }
      return
    }
    const term = kind === 'name' ? name : keyword
    window.localStorage.removeItem(searchKey(config.id, kind))
    const matches = kind === 'name'
      ? points.filter(point => point.name === term)
      : filterLandmarks(points, { catalogIds: allCatalogs(config).map(catalog => catalog.id), search: term })
    let minimumZoom = matches.length > 0
    if (kind === 'keyword') {
      query.value = term
      if (deviceMode === 'desktop') searchOpen.value = true
      searchRequest = searchRequestNumber
      const results = searchLandmarks(await loadSearchRegions(), term)
      if (disposed || request !== requestNumber || searchRequest !== searchRequestNumber || query.value !== term) return
      minimumZoom = results.title.length + results.description.length > 0
    }
    restoredSearch.value = { kind, term, minimumZoom, landmarks: matches }
  } catch {
    if (!disposed && request === requestNumber && searchRequest === searchRequestNumber) {
      searchError.value = 'The local search destination could not be restored. Completion marks and pins were not changed.'
    }
  }
}

function resourceError(type) {
  if (!assetErrors.value.has(type)) assetErrors.value = new Set([...assetErrors.value, type])
}

function cancelPinMode(event) {
  if (event.key === 'Escape') cancelPlacement()
}

watch(query, scheduleSearch, { flush: 'sync' })
watch(selectedCatalogIds, () => { restoredSearch.value = null }, { flush: 'sync' })
watch(visibleLandmarks, points => {
  if (selection.value?.kind === 'landmark' && !points.some(point => representationKey(activeMapId.value, point) === representationKey(activeMapId.value, selection.value))) selection.value = null
})
watch(confirmation, value => { document.body.classList.toggle('map-dialog-open', Boolean(value)) })

onMounted(() => {
  window.addEventListener('keydown', cancelPinMode)
  start()
})
onBeforeUnmount(() => {
  disposed = true
  requestNumber += 1
  closeSearch(true)
  clearTimeout(confirmationTimer)
  clearTimeout(noticeTimer)
  document.body.classList.remove('map-dialog-open')
  window.removeEventListener('keydown', cancelPinMode)
})
</script>

<template>
  <main class="map-app" :class="{ 'is-mobile': deviceMode === 'mobile' }" :data-device-mode="deviceMode">
    <MapCanvas
      v-if="canUseMap"
      :key="activeMapId"
      ref="mapCanvas"
      :config="activeMap"
      :landmarks="landmarks"
      :visible-landmarks="visibleLandmarks"
      :completed-ids="completedIds"
      :pins="localState.pins"
      :selection="selection"
      :add-pin-mode="addPinMode"
      :pending-pin-position="draftPinPosition"
      :can-save="canSave"
      :mobile="deviceMode === 'mobile'"
      :show-marker-names="showMarkerNames"
      :initial-zoom="restoredSearch?.minimumZoom ? activeMap.minZoom : null"
      @select="selection = $event"
      @toggle-complete="markComplete"
      @add-pin="placePin"
      @remove-pin="removePin"
      @resource-error="resourceError"
      @outside-map="pinHint = 'Choose a position within the map bounds.'"
    />

    <aside v-if="deviceMode !== 'mobile'" class="map-panel" :class="{ 'is-retracted': !panelExpanded }" aria-label="Map controls">
      <div id="map-controls" class="panel-body" :inert="!panelExpanded">
        <header class="panel-header"><p>Phantom Blade Zero</p><h1>pbz map</h1></header>
        <template v-if="manifest && !startupError">
          <h2 class="panel-title">Maps</h2>
          <nav class="map-choices" :class="{ 'map-choices--three': manifest.maps.length > 4 }" aria-label="Choose a map" data-testid="map-select">
            <a v-for="map in manifest.maps" :key="map.id" :href="mapNavigationUrl(map.id)" :aria-current="map.id === activeMapId ? 'page' : null" :class="{ 'is-active': map.id === activeMapId }" :data-map-id="map.id" @click.prevent="chooseMap(map.id)">{{ map.mapName }}</a>
          </nav>
        </template>
        <template v-if="canUseMap">
          <div class="panel-title-row"><h2 class="panel-title">Map markers</h2><button class="name-toggle" type="button" role="switch" :aria-checked="showMarkerNames" data-testid="marker-names" @click="toggleMarkerNames">Names<span class="switch-track" :class="{ 'is-on': showMarkerNames }" aria-hidden="true"></span></button></div>
          <section class="completion-box">
            <div class="completion-heading"><span>Completion</span><button type="button" :disabled="!canSave || !localState.completedIds.length" data-testid="reset-progress" @click="resetProgress">Clear marks</button></div>
            <div class="completion-filters" role="group" aria-label="Completion filter" data-testid="completion-filter">
              <button type="button" :class="{ 'is-active': completionFilter === null }" :aria-pressed="completionFilter === null" data-testid="completion-all" @click="setCompletionFilter(null)">All</button>
              <button type="button" :class="{ 'is-active': completionFilter === 'completed' }" :aria-pressed="completionFilter === 'completed'" data-testid="completion-completed" @click="setCompletionFilter('completed')">Completed</button>
              <button type="button" :class="{ 'is-active': completionFilter === 'incomplete' }" :aria-pressed="completionFilter === 'incomplete'" data-testid="completion-incomplete" @click="setCompletionFilter('incomplete')">Incomplete</button>
            </div>
          </section>
          <div class="category-actions"><button type="button" data-testid="select-all" :aria-pressed="allCategoriesSelected" @click="toggleAllCatalogs">{{ allCategoriesSelected ? 'Deselect all' : 'Select all' }}</button><button type="button" data-testid="clear-categories" @click="clearCategorySelection">Clear selection</button></div>
          <div class="category-list">
            <section v-for="group in activeMap.catalogGroups" :key="group.id" class="category-group">
              <h2>{{ group.name }}</h2>
              <div class="category-grid">
                <button v-for="catalog in group.catalogs" :key="catalog.id" type="button" class="category-option" :class="{ 'is-active': selectedCatalogIds.includes(catalog.id) }" :aria-pressed="selectedCatalogIds.includes(catalog.id)" :data-catalog-id="catalog.id" @click="toggleCatalog(catalog.id)">
                  <img v-if="categoryIcon(catalog)" :src="localResourceUrl(categoryIcon(catalog))" alt="" width="20" height="20" @error="resourceError('icon')" /><span v-else class="no-category-icon" aria-hidden="true"></span>
                  <span class="category-name">{{ catalog.name }}</span><span class="category-count">{{ counts[catalog.id] || 0 }}</span>
                </button>
              </div>
            </section>
          </div>
          <div class="local-tools"><button type="button" data-testid="reset-view" @click="resetView">Reset view</button><button type="button" :disabled="!canSave || !localState.pins.length" data-testid="clear-pins" @click="clearPins">Clear pins</button></div>
          <p class="local-note">Completion and pins are saved in this browser, per map.</p>
        </template>
      </div>
      <button class="panel-toggle" type="button" :aria-expanded="panelExpanded" aria-controls="map-controls" :aria-label="panelExpanded ? 'Collapse map controls' : 'Expand map controls'" @click="panelExpanded = !panelExpanded"><img :src="localResourceUrl(controlIcons.retract)" alt="" width="10" height="10" @error="resourceError('icon')" /></button>
    </aside>

    <template v-if="deviceMode === 'mobile' && canUseMap">
      <div v-if="!searchOpen && !addPinMode" class="mobile-toolbar" aria-label="Map tools">
        <button type="button" class="toolbar-search" data-testid="open-search" @click="openSearch"><img :src="localResourceUrl(controlIcons.mobileSearch)" alt="" width="40" height="40" @error="resourceError('icon')" /><span class="sr-only">Search</span></button>
        <button type="button" data-testid="open-settings" @click="openMobilePanel('settings')"><img :src="localResourceUrl(controlIcons.mobileSettings)" alt="" width="40" height="40" @error="resourceError('icon')" /><span class="sr-only">Settings</span></button>
        <button type="button" class="toolbar-maps" data-testid="open-maps" @click="openMobilePanel('maps')"><img :src="localResourceUrl(controlIcons.mobileMaps)" alt="" width="40" height="90" @error="resourceError('icon')" /><span class="sr-only">Maps</span></button>
      </div>
      <div v-if="!searchOpen && !addPinMode" class="mobile-bottom"><button type="button" :disabled="!canSave" data-testid="add-pin" @click="togglePinMode"><img :src="localResourceUrl(controlIcons.mobileAddPin)" alt="" width="22" height="22" @error="resourceError('icon')" />Add pin</button><button type="button" data-testid="open-filters" @click="openMobilePanel('filters')"><img :src="localResourceUrl(controlIcons.mobileFilters)" alt="" width="26" height="26" @error="resourceError('icon')" />Filter markers</button></div>
      <div v-if="mobilePanel" class="sheet-overlay" @click.self="mobilePanel = null">
        <section v-if="mobilePanel === 'maps'" class="bottom-sheet map-picker" role="dialog" aria-modal="true" aria-label="Choose a map">
          <header class="sheet-heading"><h2>Maps</h2><button type="button" aria-label="Close map selection" @click="mobilePanel = null">×</button></header>
          <nav class="mobile-map-choices" aria-label="Choose a map"><a v-for="map in manifest.maps" :key="map.id" :href="mapNavigationUrl(map.id)" :class="{ 'is-active': map.id === activeMapId }" :aria-current="map.id === activeMapId ? 'page' : null" :data-map-id="map.id" @click.prevent="chooseMap(map.id)">{{ map.mapName }}</a></nav>
          <button type="button" class="sheet-cancel" @click="mobilePanel = null">Cancel</button>
        </section>
        <section v-else-if="mobilePanel === 'filters'" class="bottom-sheet mobile-filter" role="dialog" aria-modal="true" aria-label="Filter markers">
          <header class="sheet-heading"><h2>Filter markers</h2><button type="button" aria-label="Close filters" @click="mobilePanel = null">×</button></header>
          <div class="mobile-filter-columns">
            <nav class="mobile-group-list" aria-label="Category groups"><button v-for="group in activeMap.catalogGroups" :key="group.id" type="button" :class="{ 'is-active': group.id === mobileGroupId }" :aria-pressed="group.id === mobileGroupId" @click="mobileGroupId = group.id"><span>{{ group.name }}</span><small v-if="groupSelectionCount(group)">{{ groupSelectionCount(group) }}</small></button></nav>
            <div class="mobile-catalog-list"><button v-for="catalog in mobileGroup?.catalogs || []" :key="catalog.id" type="button" class="mobile-category" :class="{ 'is-active': selectedCatalogIds.includes(catalog.id) }" :aria-pressed="selectedCatalogIds.includes(catalog.id)" :data-catalog-id="catalog.id" @click="toggleCatalog(catalog.id)"><span class="mobile-category-icon"><img v-if="categoryIcon(catalog)" :src="localResourceUrl(categoryIcon(catalog))" alt="" @error="resourceError('icon')" /><img v-if="selectedCatalogIds.includes(catalog.id)" class="mobile-category-selected" :src="localResourceUrl(controlIcons.mobileSelected)" alt="" width="12" height="8" @error="resourceError('icon')" /></span><span class="mobile-category-text"><span>{{ catalog.name }}</span><small>{{ counts[catalog.id] || 0 }}</small></span></button></div>
          </div>
          <footer class="mobile-filter-footer"><div><button type="button" data-testid="clear-categories" @click="clearCategorySelection">Clear</button><button type="button" data-testid="select-all" :aria-pressed="allCategoriesSelected" @click="toggleAllCatalogs">{{ allCategoriesSelected ? 'Deselect all' : 'Select all' }}</button></div><button type="button" class="primary-button" @click="mobilePanel = null">View markers</button></footer>
        </section>
        <section v-else-if="mobilePanel === 'settings'" class="bottom-sheet mobile-settings" role="dialog" aria-modal="true" aria-label="Map settings">
          <div class="settings-body"><header class="sheet-heading"><h2>Map settings</h2><button type="button" aria-label="Close settings" @click="mobilePanel = null">×</button></header>
            <button type="button" class="setting-row" role="switch" :aria-checked="showMarkerNames" data-testid="marker-names" @click="toggleMarkerNames">Marker names<span class="switch-track" :class="{ 'is-on': showMarkerNames }" aria-hidden="true"></span></button>
            <section class="mobile-completion-settings"><h3>Completion</h3><div class="completion-filters" role="group" aria-label="Completion filter" data-testid="completion-filter"><button type="button" :class="{ 'is-active': completionFilter === null }" :aria-pressed="completionFilter === null" data-testid="completion-all" @click="setCompletionFilter(null)">All</button><button type="button" :class="{ 'is-active': completionFilter === 'completed' }" :aria-pressed="completionFilter === 'completed'" data-testid="completion-completed" @click="setCompletionFilter('completed')">Completed</button><button type="button" :class="{ 'is-active': completionFilter === 'incomplete' }" :aria-pressed="completionFilter === 'incomplete'" data-testid="completion-incomplete" @click="setCompletionFilter('incomplete')">Incomplete</button></div><button class="clear-completion" type="button" :disabled="!canSave || !localState.completedIds.length" data-testid="reset-progress" @click="resetProgress">Clear completion marks</button></section>
            <div class="local-tools"><button type="button" data-testid="reset-view" @click="resetView(); mobilePanel = null">Reset view</button><button type="button" :disabled="!canSave || !localState.pins.length" data-testid="clear-pins" @click="clearPins">Clear pins</button></div><p class="local-note">Completion and pins are saved in this browser, per map.</p>
          </div><button type="button" class="sheet-cancel" @click="mobilePanel = null">Cancel</button>
        </section>
      </div>
    </template>

    <div v-if="canUseMap && (deviceMode !== 'mobile' || searchOpen)" class="search-toolbar" :class="{ 'search-toolbar--mobile': deviceMode === 'mobile' }">
      <button v-if="deviceMode !== 'mobile'" type="button" class="add-pin-button" :disabled="!canSave" :aria-pressed="addPinMode" data-testid="add-pin" @click="togglePinMode"><img :src="localResourceUrl(controlIcons.addPin)" alt="" width="22" height="22" @error="resourceError('icon')" />{{ addPinMode ? 'Cancel pin' : 'Add pin' }}</button>
      <section class="search-section" aria-label="Place search"><div class="search-entry"><form class="search-field" @submit.prevent><img v-if="deviceMode !== 'mobile'" class="search-field-icon" :src="localResourceUrl(controlIcons.search)" alt="" width="18" height="18" @error="resourceError('icon')" /><label class="sr-only" for="place-search">Search all included regions</label><input id="place-search" v-model="query" type="search" placeholder="Place name or description" autocomplete="off" data-testid="search" @focus="openSearch" @blur="blurSearch" @keyup.enter="submitSearch" /><button v-if="query" type="button" class="search-clear" aria-label="Clear search" @mousedown.prevent @click="clearSearch">×</button></form><button v-if="deviceMode === 'mobile'" type="button" class="search-cancel" data-testid="cancel-search" @click="closeSearch(true)">Cancel</button></div>
        <div v-if="showSearchResults" class="search-results" aria-label="Matching places" data-testid="search-results" @mousedown.prevent>
          <p v-if="!searchResultCount" class="empty-results">No matching places in the included regions.</p>
          <template v-for="group in searchGroups" :key="group.id"><section v-if="group.results.length" :data-search-group="group.id"><h2 class="search-group-title">{{ group.label }}</h2><button v-for="result in group.results" :key="representationKey(result.mapId, result.point)" type="button" class="search-result" :class="{ 'search-result--description': group.id === 'description' }" :data-map-id="result.mapId" :data-catalog-id="result.point.catalogId" :data-landmark-id="result.point.id" @click="selectResult(result)"><span class="search-result-heading"><span class="search-result-name"><template v-if="group.id === 'title'"><template v-for="(part, index) in searchTextParts(result.point.name, query)" :key="index"><mark v-if="part.match">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template></template><template v-else>{{ result.point.name }}</template></span><small>{{ result.catalogName }} · {{ result.mapName }}</small></span><span v-if="group.id === 'description'" class="search-result-description"><template v-for="(part, index) in searchTextParts(result.point.description, query)" :key="index"><mark v-if="part.match">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template></span></button></section></template>
        </div><p v-if="searchError" class="inline-error" role="alert">{{ searchError }}</p>
      </section>
    </div>

    <div v-if="addPinMode" class="pin-instruction" role="status">{{ pinHint || (deviceMode === 'mobile' ? 'Move the map to position your pin.' : draftPinPosition ? 'Confirm this position or click the map to move the pin.' : 'Click the map to position a pin. Escape cancels.') }}</div>
    <div v-if="addPinMode" class="placement-actions" :class="{ 'placement-actions--mobile': deviceMode === 'mobile' }"><button type="button" @click="cancelPlacement">Cancel</button><button type="button" class="primary-button" :disabled="!canSave || (deviceMode !== 'mobile' && !draftPinPosition)" data-testid="confirm-pin" @click="confirmPin">{{ deviceMode === 'mobile' ? 'Create pin' : 'Confirm pin' }}</button></div>

    <div v-if="pinDeleteSheet" class="sheet-overlay" @click.self="pinDeleteSheet = null"><section class="bottom-sheet delete-sheet" role="dialog" aria-modal="true" aria-label="Delete custom pin"><button type="button" class="delete-pin" data-testid="confirm-delete-pin" @click="confirmDeletePin">Delete pin</button><button type="button" class="sheet-cancel" @click="pinDeleteSheet = null">Cancel</button></section></div>
    <div v-if="confirmation" class="confirmation-mask" :class="{ 'is-closing': confirmationClosing, 'confirmation-mask--desktop': deviceMode !== 'mobile' }"><section class="confirmation-dialog" role="dialog" aria-modal="true" aria-labelledby="confirmation-title" aria-describedby="confirmation-text"><header v-if="deviceMode !== 'mobile'"><h2 id="confirmation-title">Confirm</h2><button type="button" aria-label="Cancel" :disabled="confirmationClosing" @click="finishConfirmation(false)">×</button></header><h2 v-else id="confirmation-title" class="sr-only">Confirm</h2><p id="confirmation-text">{{ confirmation.text }}</p><div class="confirmation-actions"><button type="button" :disabled="confirmationClosing" data-testid="cancel-confirmation" @click="finishConfirmation(false)">Cancel</button><button type="button" :disabled="confirmationClosing" class="confirm-action" data-testid="confirm-confirmation" @click="finishConfirmation(true)">Confirm</button></div></section></div>

    <div v-if="booting || loading" class="map-loading" role="status">{{ booting ? 'Loading local maps…' : 'Loading map…' }}</div>
    <div v-if="startupError || mapError" class="map-error" role="alert"><h2>Map unavailable</h2><p>{{ startupError || mapError }}</p><button type="button" @click="startupError ? start() : changeMap(activeMapId)">Retry loading</button></div>
    <div v-if="storageError || preferenceError || assetErrorText" class="map-feedback" role="alert"><p v-if="storageError">{{ storageError }}</p><p v-if="preferenceError">{{ preferenceError }}</p><p v-if="assetErrorText">{{ assetErrorText }}</p></div>
    <p v-if="notice" class="map-notice" role="status">{{ notice }}</p>
    <p class="sr-only" aria-live="polite" data-testid="visible-count">{{ visibleLandmarks.length }} visible · {{ landmarks.length }} places</p>
    <p v-if="!canUseMap && !booting && !loading" class="map-empty-caption">Local map snapshot required. No live-source or sample-data fallback.</p>
  </main>
</template>
