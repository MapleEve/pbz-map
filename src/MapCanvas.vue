<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import { allCatalogs, boundsToLatLngBounds, localResourceUrl, markerNameCatalogIds, positionInBounds, positionToLatLng, representationKey } from './map-model.js'

const props = defineProps({
  config: { type: Object, required: true },
  landmarks: { type: Array, required: true },
  visibleLandmarks: { type: Array, required: true },
  completedIds: { type: Set, required: true },
  pins: { type: Array, required: true },
  selection: { type: Object, default: null },
  addPinMode: Boolean,
  canSave: Boolean,
  mobile: Boolean,
  showMarkerNames: { type: Boolean, default: true },
  pendingPinPosition: { type: Array, default: null },
  initialZoom: { type: Number, default: null },
})
const emit = defineEmits(['select', 'toggle-complete', 'add-pin', 'remove-pin', 'resource-error', 'outside-map'])
const container = ref(null)
const mobileBody = ref(null)
const mobileDetailHeight = ref(513)
const zoom = ref(props.initialZoom ?? props.config.defaultZoom)
let map
let poiLayer
let pinLayer
let previewLayer
let popup
let resizeObserver
let detailTimer
let closingPopup = false
let disposed = false
const poiMarkers = new Map()
const catalogs = new Map(allCatalogs(props.config).map(catalog => [catalog.id, catalog]))
const namedCatalogIds = new Set(markerNameCatalogIds(props.config))
const controlIcons = Object.freeze({
  zoomIn: '/assets/icons/af5bf0cf8e8a4c7a5c59f79f3abf05218ef38e913324e445702b2bbea985bfe0.png',
  zoomOut: '/assets/icons/311163759c6986b6ecaea30ca596c131a09065572e44751b1976125b5318c8ee.png',
  locate: '/assets/icons/6146781c3c089cec3bf51d2edc50ef53a7de3cb661df3549ad63d1ca7dfda545.svg',
  close: '/assets/icons/e012989b512e5a728bbe7cec071db3784d5ca11bd773dc868d9b7a84ccabbcdc.svg',
  complete: '/assets/icons/3102bb9d8a60e917dfedee8398583bbb1c275e20a789fa4f393f51868fac5c43.svg',
})
const selectedItem = computed(() => props.selection?.kind === 'landmark'
  ? props.visibleLandmarks.find(point => representationKey(props.config, point) === representationKey(props.config, props.selection))
  : props.selection?.kind === 'pin' ? props.pins.find(pin => pin.id === props.selection.id) : null)
const selectedIsLandmark = computed(() => props.selection?.kind === 'landmark')
const selectedName = computed(() => selectedIsLandmark.value ? selectedItem.value?.name : 'Custom pin')

function snapshot() {
  if (!map) return null
  const center = map.getCenter()
  return Object.freeze({
    activeMapId: props.config.id,
    zoom: map.getZoom(),
    center: [center.lng, center.lat],
    visibleCount: props.visibleLandmarks.length,
    poiCount: props.landmarks.length,
    pinCount: props.pins.length,
    completedCount: new Set(props.landmarks.filter(point => props.completedIds.has(point.id)).map(point => point.id)).size,
    selectedPoiId: props.selection?.kind === 'landmark' ? props.selection.id : null,
    selectedCatalogId: props.selection?.kind === 'landmark' ? props.selection.catalogId : null,
    selectedRepresentationKey: props.selection?.kind === 'landmark' ? representationKey(props.config, props.selection) : null,
    markerNamesEnabled: props.showMarkerNames,
  })
}

function updateSnapshot() {
  if (container.value && map) container.value.dataset.snapshot = JSON.stringify(snapshot())
}

function textElement(tag, text, className) {
  const element = document.createElement(tag)
  element.textContent = text
  if (className) element.className = className
  return element
}

function markerNamesVisible(point) {
  return props.showMarkerNames && namedCatalogIds.has(point.catalogId)
    && map.getZoom() > props.config.maxZoom - 6
}

function sourceIcon(point) {
  const catalog = catalogs.get(point.catalogId)
  const selected = props.selection?.kind === 'landmark'
    && representationKey(props.config, props.selection) === representationKey(props.config, point)
  const complete = props.completedIds.has(point.id)
  const element = document.createElement('span')
  element.className = 'poi-symbol'
  const path = selected ? catalog.iconSelectedUrl || catalog.iconUrl : catalog.iconUrl
  if (path) {
    const image = document.createElement('img')
    image.src = localResourceUrl(path)
    image.alt = ''
    image.draggable = false
    image.addEventListener('error', () => emit('resource-error', 'icon'), { once: true })
    element.append(image)
  } else element.classList.add('poi-symbol--no-source-icon')
  if (markerNamesVisible(point)) {
    const label = textElement('span', point.name, 'poi-name')
    label.style.color = props.config.landmarkNameColor || '#BFA95E'
    const halo = props.config.landmarkNameBackgroundColor || '#684F00'
    const size = props.config.defaultIconSize || 24
    label.style.bottom = `${size / 2 + (size === 24 ? 12 : 18)}px`
    label.style.opacity = String(Math.min(1, Math.max(0, map.getZoom() - (props.config.maxZoom - 6))))
    label.style.textShadow = `-1px -1px 1px ${halo}, 1px -1px 1px ${halo}, -1px 1px 1px ${halo}, 1px 1px 1px ${halo}`
    element.append(label)
  }
  const size = props.config.defaultIconSize || 24
  return L.divIcon({
    html: element,
    className: `poi-marker${selected ? ' is-selected' : ''}${complete ? ' is-complete' : ''}`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function renderLandmarks() {
  if (!map) return
  poiLayer.clearLayers()
  poiMarkers.clear()
  for (const point of props.visibleLandmarks) {
    const marker = L.marker(positionToLatLng(point.position), {
      icon: sourceIcon(point), alt: point.name, keyboard: true,
      zIndexOffset: typeof point.z === 'number' ? point.z : 0,
    }).on('click', event => {
      L.DomEvent.stopPropagation(event)
      if (props.addPinMode) {
        if (!props.mobile) emit('add-pin', [...point.position])
      } else emit('select', { kind: 'landmark', id: point.id, catalogId: point.catalogId, source: 'marker' })
    })
    marker.addTo(poiLayer)
    poiMarkers.set(representationKey(props.config, point), marker)
  }
  updateSnapshot()
}

function pinIcon(preview = false) {
  const element = document.createElement('span')
  element.className = 'custom-pin-symbol'
  return L.divIcon({ html: element, className: `custom-pin-marker${preview ? ' is-preview' : ''}`, iconSize: [22, 28], iconAnchor: [11, 27] })
}

function renderPins() {
  if (!map) return
  pinLayer.clearLayers()
  for (const pin of props.pins) {
    L.marker(positionToLatLng(pin.position), {
      icon: pinIcon(), title: 'Custom pin', alt: 'Custom pin', keyboard: true, zIndexOffset: 500,
    }).on('click', event => {
      L.DomEvent.stopPropagation(event)
      if (props.addPinMode) {
        if (!props.mobile) emit('add-pin', [...pin.position])
      } else emit('select', { kind: 'pin', id: pin.id, source: 'pin' })
    }).addTo(pinLayer)
  }
  updateSnapshot()
}

function renderPinPreview() {
  if (!map) return
  previewLayer.clearLayers()
  if (!props.addPinMode) return
  const position = props.mobile ? getCenterPosition() : props.pendingPinPosition
  if (position) L.marker(positionToLatLng(position), { icon: pinIcon(true), interactive: false, keyboard: false, zIndexOffset: 1000 }).addTo(previewLayer)
}

function actionButton(text, className, action, disabled = false) {
  const button = textElement('button', text, className)
  button.type = 'button'
  button.disabled = disabled
  button.addEventListener('click', action)
  return button
}

function imageList(point) {
  const images = document.createElement('div')
  images.className = 'place-images'
  for (const [index, path] of point.images.entries()) {
    const link = document.createElement('a')
    link.href = localResourceUrl(path)
    link.target = '_blank'
    link.rel = 'noopener'
    link.setAttribute('aria-label', `Open ${point.name} image ${index + 1}`)
    const image = document.createElement('img')
    image.src = localResourceUrl(path)
    image.alt = `${point.name} — image ${index + 1}`
    image.loading = 'lazy'
    image.addEventListener('error', () => emit('resource-error', 'image'), { once: true })
    link.append(image)
    images.append(link)
  }
  return images
}

function detailHeader(name, point) {
  const header = document.createElement('header')
  header.className = 'place-header'
  header.append(textElement('h2', name, 'place-name'))
  const locate = actionButton('Locate', 'place-locate', () => locatePoint(point))
  locate.dataset.action = 'locate'
  header.append(locate)
  const close = actionButton('×', 'place-close', () => emit('select', null))
  close.setAttribute('aria-label', 'Close point details')
  header.append(close)
  return header
}

function landmarkPopup(point) {
  const content = document.createElement('article')
  content.className = 'place-info'
  content.dataset.landmarkId = point.id
  content.dataset.catalogId = point.catalogId
  content.dataset.representationKey = representationKey(props.config, point)
  content.append(detailHeader(point.name, point))
  const body = document.createElement('div')
  body.className = 'place-body'
  body.append(textElement('p', catalogs.get(point.catalogId).name, 'place-category'))
  if (point.description) body.append(textElement('p', point.description, 'place-description'))
  if (point.images.length) body.append(imageList(point))
  content.append(body)
  const footer = document.createElement('footer')
  footer.className = 'place-footer'
  const complete = props.completedIds.has(point.id)
  const button = actionButton(complete ? 'Undo' : 'Mark complete', 'popup-action', () => emit('toggle-complete', point.id), !props.canSave)
  button.dataset.action = 'toggle-complete'
  button.setAttribute('aria-pressed', String(complete))
  footer.append(button)
  content.append(footer)
  return content
}

function pinPopup(pin) {
  const content = document.createElement('article')
  content.className = 'place-info'
  content.dataset.pinId = pin.id
  content.append(detailHeader('Custom pin', pin))
  const body = document.createElement('div')
  body.className = 'place-body'
  body.append(textElement('p', 'Saved on this map only.', 'pin-note'))
  content.append(body)
  const button = actionButton('Remove pin', 'popup-action popup-action--remove', () => emit('remove-pin', pin.id), !props.canSave)
  button.dataset.action = 'remove-pin'
  const footer = document.createElement('footer')
  footer.className = 'place-footer'
  footer.append(button)
  content.append(footer)
  return content
}

function closePopup() {
  if (!map) return
  closingPopup = true
  map.closePopup(popup)
  closingPopup = false
}

function updatePopupSize() {
  if (!map || !popup) return
  const size = map.getSize()
  popup.options.maxHeight = Math.max(1, Math.min(528, size.y - 24))
  popup.options.maxWidth = Math.max(210, Math.min(436, size.x - 24))
}

function syncPinMode() {
  container.value?.classList.toggle('is-adding-pin', props.addPinMode)
  renderPinPreview()
}

function refreshMarkerIcons() {
  if (!map) return
  for (const point of props.visibleLandmarks) poiMarkers.get(representationKey(props.config, point))?.setIcon(sourceIcon(point))
}

function renderSelection() {
  if (!map) return
  refreshMarkerIcons()
  const item = selectedItem.value
  if (!item || props.mobile) {
    closePopup()
    updateSnapshot()
    return
  }
  updatePopupSize()
  popup.setLatLng(positionToLatLng(item.position))
    .setContent(props.selection.kind === 'landmark' ? landmarkPopup(item) : pinPopup(item))
  if (!popup.isOpen()) popup.openOn(map)
  updateSnapshot()
}

function locatePoint(point = selectedItem.value) {
  if (!map || !point) return
  map.setView(positionToLatLng(point.position), props.config.maxZoom > 0 ? props.config.maxZoom : props.config.defaultZoom)
  emit('select', null)
  updateSnapshot()
}

function locateAtCurrentZoom(point) {
  if (!map || !point) return
  map.setView(positionToLatLng(point.position), map.getZoom())
  emit('select', null)
  updateSnapshot()
}

function getCenterPosition() {
  if (!map) return null
  const center = map.getCenter()
  return [center.lng, center.lat]
}

function effectiveCenter() {
  const [x, y] = props.config.center
  if (!props.config.useNewMapEngine) return [x, y]
  return [x == null || x === 0 ? -0.7 : x, y == null || y === 0 ? 0.7 : y]
}

function resetView() {
  if (!map) return
  closePopup()
  map.stop()
  map.setView(positionToLatLng(effectiveCenter()), props.config.defaultZoom, { animate: false })
  updateSnapshot()
}

function zoomIn() { map?.zoomIn() }
function zoomOut() { map?.zoomOut() }

function expandMobileDetail() { mobileDetailHeight.value = 513 }

async function syncMobileDetail() {
  clearTimeout(detailTimer)
  if (!props.mobile || !selectedItem.value) return
  mobileDetailHeight.value = props.config.useNewMapEngine === false ? 181 : 513
  await nextTick()
  if (disposed) return
  detailTimer = setTimeout(() => {
    if (!mobileBody.value) return
    mobileBody.value.style.height = `${Math.min(472, mobileBody.value.scrollHeight)}px`
    mobileBody.value.scrollTop = 0
  }, 500)
}

defineExpose({ resetView, getCenterPosition, locateAtCurrentZoom })

onMounted(() => {
  map = L.map(container.value, {
    crs: L.CRS.EPSG3857,
    center: positionToLatLng(effectiveCenter()),
    zoom: props.initialZoom ?? props.config.defaultZoom,
    minZoom: props.config.minZoom,
    maxZoom: props.config.maxZoom,
    boxZoom: false,
    keyboard: true,
    zoomControl: false,
    attributionControl: false,
  })
  L.tileLayer(localResourceUrl(props.config.tileUrl), {
    tileSize: props.config.tileSize,
    minZoom: props.config.minZoom,
    maxZoom: props.config.maxZoom,
    maxNativeZoom: props.config.maxNativeZoom ?? props.config.maxZoom,
    bounds: boundsToLatLngBounds(props.config.bounds),
    noWrap: true,
    tms: false,
  }).on('tileerror', () => emit('resource-error', 'tile')).addTo(map)
  poiLayer = L.layerGroup().addTo(map)
  pinLayer = L.layerGroup().addTo(map)
  previewLayer = L.layerGroup().addTo(map)
  popup = L.popup({ className: 'map-info-popup', minWidth: 210, maxWidth: 436, closeButton: false, autoPan: true, autoPanPadding: [12, 12], offset: [0, -(props.config.defaultIconSize || 24) / 2] })
  updatePopupSize()
  syncPinMode()
  map.on('moveend zoomend', () => {
    zoom.value = map.getZoom()
    refreshMarkerIcons()
    renderPinPreview()
    updateSnapshot()
  })
  map.on('move', () => { if (props.mobile && props.addPinMode) renderPinPreview() })
  map.on('popupclose', event => {
    if (event.popup === popup && !closingPopup) emit('select', null)
  })
  map.on('click', event => {
    if (!props.addPinMode || !props.canSave || props.mobile) return
    const position = [event.latlng.lng, event.latlng.lat]
    if (positionInBounds(position, props.config.bounds)) emit('add-pin', position)
    else emit('outside-map')
  })
  resizeObserver = new ResizeObserver(() => {
    if (!map) return
    map.invalidateSize({ pan: false })
    updatePopupSize()
    if (popup.isOpen()) popup.update()
  })
  resizeObserver.observe(container.value)
  renderLandmarks()
  renderPins()
  renderSelection()
  syncMobileDetail()
  // A read-only observation surface; it does not change map or saved state.
  Object.defineProperty(container.value, 'pbzMapSnapshot', { get: snapshot, configurable: true })
  updateSnapshot()
})

watch(() => props.visibleLandmarks, () => { renderLandmarks(); renderSelection() })
watch(() => props.completedIds, () => { renderLandmarks(); renderSelection() })
watch(() => props.pins, () => { renderPins(); renderSelection() })
watch(() => props.selection, () => { renderSelection(); syncMobileDetail() })
watch(() => props.canSave, renderSelection)
watch(() => props.showMarkerNames, () => { refreshMarkerIcons(); updateSnapshot() })
watch(() => props.addPinMode, syncPinMode)
watch(() => props.pendingPinPosition, renderPinPreview)

onBeforeUnmount(() => {
  disposed = true
  clearTimeout(detailTimer)
  resizeObserver?.disconnect()
  if (map) {
    closingPopup = true
    map.remove()
    map = null
  }
})
</script>

<template>
  <div ref="container" class="map-canvas" data-testid="map" role="region" :aria-label="`${config.mapName} interactive map`"></div>
  <div v-if="!mobile" class="map-zoom" role="group" aria-label="Map zoom"><button type="button" aria-label="Zoom in" :disabled="zoom >= config.maxZoom" @click="zoomIn"><img :src="localResourceUrl(controlIcons.zoomIn)" alt="" width="40" height="40" @error="emit('resource-error', 'icon')" /></button><button type="button" aria-label="Zoom out" :disabled="zoom <= config.minZoom" @click="zoomOut"><img :src="localResourceUrl(controlIcons.zoomOut)" alt="" width="40" height="40" @error="emit('resource-error', 'icon')" /></button></div>
  <template v-if="mobile && selectedItem && !addPinMode">
    <div v-if="mobileDetailHeight === 513" class="detail-overlay" @click="emit('select', null)"></div>
    <article class="mobile-detail" :style="{ height: `${mobileDetailHeight}px` }" :data-landmark-id="selectedIsLandmark ? selectedItem.id : null" :data-catalog-id="selectedIsLandmark ? selectedItem.catalogId : null" :data-representation-key="selectedIsLandmark ? representationKey(config, selectedItem) : null" role="dialog" aria-modal="true" :aria-label="selectedName">
      <header class="place-header"><h2 class="place-name" @click="expandMobileDetail">{{ selectedName }}</h2><button class="place-locate" type="button" data-action="locate" @click="locatePoint()"><img :src="localResourceUrl(controlIcons.locate)" alt="" width="14" height="14" @error="emit('resource-error', 'icon')" />Locate</button><button class="place-close" type="button" aria-label="Close point details" @click="emit('select', null)"><img :src="localResourceUrl(controlIcons.close)" alt="" width="20" height="20" @error="emit('resource-error', 'icon')" /></button></header>
      <div ref="mobileBody" class="mobile-detail-body" :class="{ 'is-expanded': mobileDetailHeight === 513 }" @click="expandMobileDetail">
        <template v-if="selectedIsLandmark"><p class="place-category">{{ catalogs.get(selectedItem.catalogId)?.name }}</p><p v-if="selectedItem.description" class="place-description">{{ selectedItem.description }}</p><div v-if="selectedItem.images.length" class="place-images"><a v-for="(path, index) in selectedItem.images" :key="index" :href="localResourceUrl(path)" target="_blank" rel="noopener" :aria-label="`Open ${selectedName} image ${index + 1}`" @click.stop><img :src="localResourceUrl(path)" :alt="`${selectedName} — image ${index + 1}`" loading="lazy" @error="emit('resource-error', 'image')" /></a></div></template>
        <p v-else class="pin-note">Saved on this map only.</p>
      </div>
      <footer class="place-footer"><button v-if="selectedIsLandmark" class="popup-action" type="button" :disabled="!canSave" :aria-pressed="completedIds.has(selectedItem.id)" data-action="toggle-complete" @click="emit('toggle-complete', selectedItem.id)"><img :src="localResourceUrl(controlIcons.complete)" alt="" width="16" height="16" @error="emit('resource-error', 'icon')" />{{ completedIds.has(selectedItem.id) ? 'Undo' : 'Mark complete' }}</button><button v-else class="popup-action popup-action--remove" type="button" :disabled="!canSave" data-action="remove-pin" @click="emit('remove-pin', selectedItem.id)">Remove pin</button></footer>
    </article>
  </template>
</template>
