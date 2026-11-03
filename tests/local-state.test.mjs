import test from 'node:test'
import assert from 'node:assert/strict'
import {
  addCustomPin, clearCompletion, clearCustomPins, emptyLocalState, loadLocalState,
  removeCustomPin, saveLocalState, stateKey, toggleCompletion,
} from '../src/local-state.js'

function memoryStorage() {
  const values = new Map()
  const writes = []
  return {
    values, writes,
    getItem: key => values.get(key) ?? null,
    setItem(key, value) { writes.push(key); values.set(key, value) },
  }
}

await test('New local state is independent and uses original map IDs in its app-only namespace', () => {
  assert.equal(stateKey('251'), 'pbz-map:251:state')
  assert.notEqual(stateKey('251'), stateKey('254'))
  const first = emptyLocalState()
  const second = emptyLocalState()
  first.completedIds.push('912566')
  assert.deepEqual(second, { version: 1, completedIds: [], pins: [] })
  const storage = memoryStorage()
  assert.deepEqual(loadLocalState(storage, '251'), emptyLocalState())
  assert.equal(storage.writes.length, 0)
})

await test('Completion toggles and undo preserve custom pins and the input state', () => {
  const source = addCustomPin(emptyLocalState(), [-0.5, 0.5], 'pin-a')
  const original = structuredClone(source)
  const complete = toggleCompletion(source, '912566')
  assert.deepEqual(complete.completedIds, ['912566'])
  assert.deepEqual(complete.pins, original.pins)
  assert.deepEqual(toggleCompletion(complete, '912566'), original)
  assert.deepEqual(source, original)
})

await test('Custom pins retain longitude/latitude and deletion removes only the requested pin', () => {
  const position = [-0.45, 0.6]
  const completed = toggleCompletion(emptyLocalState(), '912566')
  const one = addCustomPin(completed, position, 'pin-a')
  const two = addCustomPin(one, [-0.55, 0.7], 'pin-b')
  position[0] = -1
  assert.deepEqual(two.pins[0].position, [-0.45, 0.6])
  assert.deepEqual(removeCustomPin(two, 'pin-a').pins, [{ id: 'pin-b', position: [-0.55, 0.7] }])
  assert.deepEqual(removeCustomPin(two, 'missing-pin'), two)
  assert.deepEqual(two.completedIds, ['912566'])
  assert.equal(two.pins.length, 2)
})

await test('Clear pins and reset completion have separate semantics', () => {
  const source = addCustomPin(toggleCompletion(emptyLocalState(), '912566'), [-0.45, 0.6], 'pin-a')
  const before = structuredClone(source)
  const noPins = clearCustomPins(source)
  assert.deepEqual(noPins.completedIds, ['912566'])
  assert.deepEqual(noPins.pins, [])
  const noCompletion = clearCompletion(source)
  assert.deepEqual(noCompletion.completedIds, [])
  assert.deepEqual(noCompletion.pins, before.pins)
  assert.deepEqual(source, before)
})

await test('Per-map state survives a new load; clearing one map never writes any other map', () => {
  const storage = memoryStorage()
  storage.values.set('another-app:state', 'untouched')
  const a = addCustomPin(toggleCompletion(emptyLocalState(), '912566'), [-0.6, 0.6], 'pin-a')
  const b = addCustomPin(toggleCompletion(emptyLocalState(), '911797'), [-0.4, 0.6], 'pin-b')
  saveLocalState(storage, '251', a)
  saveLocalState(storage, '254', b)
  assert.deepEqual(loadLocalState(storage, '251'), a)
  assert.deepEqual(loadLocalState(storage, '254'), b)
  const otherBefore = storage.values.get(stateKey('254'))
  saveLocalState(storage, '251', clearCustomPins(loadLocalState(storage, '251')))
  assert.deepEqual(loadLocalState(storage, '251').completedIds, ['912566'])
  saveLocalState(storage, '251', clearCompletion(loadLocalState(storage, '251')))
  assert.deepEqual(loadLocalState(storage, '251'), emptyLocalState())
  assert.equal(storage.values.get(stateKey('254')), otherBefore)
  assert.equal(storage.values.get('another-app:state'), 'untouched')
  assert.deepEqual(storage.writes, [stateKey('251'), stateKey('254'), stateKey('251'), stateKey('251')])
})

await test('Unreadable or damaged stored data is never overwritten during load', () => {
  for (const raw of ['not-json', 'null', '{"version":2,"completedIds":[],"pins":[]}', '{"version":1,"completedIds":["id","id"],"pins":[]}', '{"version":1,"completedIds":[],"pins":[{"id":"pin","position":["bad",0]}]}']) {
    const storage = memoryStorage()
    storage.values.set(stateKey('251'), raw)
    assert.throws(() => loadLocalState(storage, '251'), /stored data has not been changed/)
    assert.equal(storage.values.get(stateKey('251')), raw)
    assert.equal(storage.writes.length, 0)
  }
  assert.throws(() => loadLocalState({ getItem() { throw new Error('Unavailable') } }, '251'), /Local storage is unavailable/)
})

await test('Failed persistence does not apply the proposed state or erase a previous stored value', () => {
  const previous = toggleCompletion(emptyLocalState(), '912566')
  const raw = JSON.stringify(previous)
  const storage = { getItem: () => raw, setItem() { throw new Error('Quota exceeded') } }
  const loaded = loadLocalState(storage, '251')
  const next = addCustomPin(loaded, [-0.5, 0.5], 'pin-a')
  assert.throws(() => saveLocalState(storage, '251', next), /No marker changes were applied/)
  assert.deepEqual(loaded, previous)
  assert.deepEqual(loadLocalState(storage, '251'), previous)
})

await test('Duplicate pin IDs and invalid coordinates cannot be saved', () => {
  const storage = memoryStorage()
  const one = addCustomPin(emptyLocalState(), [-0.5, 0.5], 'pin-a')
  assert.throws(() => saveLocalState(storage, '251', addCustomPin(one, [-0.6, 0.6], 'pin-a')), /stored data has not been changed/)
  assert.throws(() => saveLocalState(storage, '251', addCustomPin(one, [NaN, 0.6], 'pin-b')), /stored data has not been changed/)
  assert.deepEqual(storage.writes, [])
})
