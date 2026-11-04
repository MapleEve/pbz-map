import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, lstat, realpath } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createContext, runInContext } from 'node:vm'
import * as Vue from 'vue'
import { compile } from '@vue/compiler-dom'
import {
  allCatalogs, boundsToLatLngBounds, countByCatalog, defaultCatalogIds,
  filterLandmarks, isLocalResource, localResourceUrl, markerNameCatalogIds, normalizeSearch, positionInBounds, positionToLatLng,
  mapSearchUrl, readLocalJson, representationKey, searchLandmarks, searchTextParts, validateManifest, validatePoints,
} from '../src/map-model.js'
import * as localStateModel from '../src/local-state.js'

const json = async path => JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), 'utf8'))
const productionManifest = await json('public/data/manifest.json')
const productionCollections = await Promise.all(productionManifest.maps.map(config => json(`public${config.pointsUrl}`)))
// Isolated model/component input. Region/configuration/identity/geometry facts are
// pinned independently. All other labels and instructions are synthetic fixtures,
// not authoritative game English or a fallback product dataset.
const manifest = {
  "name": "pbz map",
  "gameId": "839484",
  "snapshotAt": "2026-11-01T10:03:25.290Z",
  "maps": [
    {
      "id": "251",
      "center": [
        -0.6898578428422013,
        0.39407782838529215
      ],
      "bounds": [
        -1.4,
        0,
        0,
        1.4
      ],
      "minZoom": 8,
      "maxZoom": 13,
      "defaultZoom": 9,
      "tileSize": 256,
      "tileUrl": "/assets/tiles/251/{z}/{x}_{y}.webp",
      "pointsUrl": "/data/maps/251.json",
      "areas": null,
      "useNewMapEngine": true,
      "catalogGroups": [
        {
          "id": "group-1",
          "key": "group-1",
          "orderIndex": 1,
          "catalogs": [
            {
              "id": "9907",
              "key": "catalog-9907",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/08759193ea75990c2c9434aadf6734ce601ba19ecc5ae9efefad4a44ad1bd829.png",
              "iconSelectedUrl": "/assets/icons/5296301f22458274a604bf1f98450db6005f00dc0417983c3f8b1cb835fbe946.png",
              "defaultSelected": true,
              "count": 2,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Bells fixture"
            },
            {
              "id": "9910",
              "key": "catalog-9910",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/7f4a7b7c4d52a4cb3e764bb616065a3fb18d63f925d44a5ba7ea8b1975a1e71e.png",
              "iconSelectedUrl": "/assets/icons/7f4a7b7c4d52a4cb3e764bb616065a3fb18d63f925d44a5ba7ea8b1975a1e71e.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9910"
            },
            {
              "id": "9911",
              "key": "catalog-9911",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/e13477d71cba9d0ffbf9dc41bb6a38dfbfbf613a39216960719aad5052e3420d.png",
              "iconSelectedUrl": "/assets/icons/e13477d71cba9d0ffbf9dc41bb6a38dfbfbf613a39216960719aad5052e3420d.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9911"
            },
            {
              "id": "9912",
              "key": "catalog-9912",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/6665eb8d4ba18beb71b5fa51423fafff298e3f7a700eb98be2589603d0377233.png",
              "iconSelectedUrl": "/assets/icons/2b8568c53d27a548427cc6f3a2f3cd81ca1407abfe85ba3244fea431589bbe82.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9912"
            },
            {
              "id": "10123",
              "key": "catalog-10123",
              "orderIndex": 5,
              "iconUrl": "/assets/icons/a840cde92f4945dd8e09a70cca70661fc42b7cbea0d51c3da3f5cf178de764a5.png",
              "iconSelectedUrl": "/assets/icons/76152dff039939c30c47f3bebec665caefd9f214c0af5886edff49e31c28dd4d.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": null,
              "name": "Category fixture 10123"
            },
            {
              "id": "9913",
              "key": "catalog-9913",
              "orderIndex": 5,
              "iconUrl": "/assets/icons/23ef8b8fac87d54bc430e21ef0c04e797aa1ac1904262d8e25052ba245febe6b.png",
              "iconSelectedUrl": "/assets/icons/23ef8b8fac87d54bc430e21ef0c04e797aa1ac1904262d8e25052ba245febe6b.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9913"
            },
            {
              "id": "9914",
              "key": "catalog-9914",
              "orderIndex": 6,
              "iconUrl": "/assets/icons/2f421011040738597e8670990af5eecc22b64246371e42ec8fe9ba0abc023d58.png",
              "iconSelectedUrl": "/assets/icons/2f421011040738597e8670990af5eecc22b64246371e42ec8fe9ba0abc023d58.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9914"
            },
            {
              "id": "9915",
              "key": "catalog-9915",
              "orderIndex": 7,
              "iconUrl": "/assets/icons/b3aefc18da6e79a33b2e86f482b0336e6653565beb7afd113277b2f9991893f8.png",
              "iconSelectedUrl": "/assets/icons/4bc58374f18d9638758966c3a15399957443e94dedd3fccbd7963dce76a73903.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9915"
            }
          ],
          "name": "Group fixture group-1"
        },
        {
          "id": "group-2",
          "key": "group-2",
          "orderIndex": 2,
          "catalogs": [
            {
              "id": "9916",
              "key": "catalog-9916",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/0b1f1a3ca037a739862f5040d5e79ebee151e262359791435356d98b6284c6fc.png",
              "iconSelectedUrl": "/assets/icons/d611e1fc6a20ecce13baaf1c689d42d3b075ae7aeaa377b4f3ead10d5bff96a9.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9916"
            },
            {
              "id": "9917",
              "key": "catalog-9917",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/86d05861516407f4c55057952d96e39144c80f72b54c52dd5fa3e55bc1e6f1cc.png",
              "iconSelectedUrl": "/assets/icons/08acebdaa987dd5677752af9e7bb64224b9c4a72eb4a47042077738f0ff94194.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9917"
            },
            {
              "id": "9918",
              "key": "catalog-9918",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/71b8b9d742aadf2781437cd68a25c668b7a134fb0b4625ee09a170932b7f4f0a.png",
              "iconSelectedUrl": "/assets/icons/3906bab3c587409c793a77f0c7aa3cac56bde47e1f6b5b121f8c49fa2591807a.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9918"
            },
            {
              "id": "9919",
              "key": "catalog-9919",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/e9a4ab479efc209a980ad99e88613d1f207ae1d4a0485ea222d0a316f1d7ddfb.png",
              "iconSelectedUrl": "/assets/icons/5ef6572a43a3d3b5c7adf659593250925d206055a2a7a591d48b1da8bbf92815.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9919"
            },
            {
              "id": "10277",
              "key": "catalog-10277",
              "orderIndex": 5,
              "iconUrl": "/assets/icons/4dc7d653186a2b242c7ee5c4140c9b0f5dd128c461058b44d789cb038923a1e2.png",
              "iconSelectedUrl": "/assets/icons/8ac99d6c53245ae8b25925ca96303f87a2f76fe64f956eb8d7a78cef48946960.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10277"
            }
          ],
          "name": "Group fixture group-2"
        },
        {
          "id": "group-3",
          "key": "group-3",
          "orderIndex": 3,
          "catalogs": [
            {
              "id": "9920",
              "key": "catalog-9920",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/87f3295cfcb6b5aade35e8555750cdf28641b19bde5636994e558e6891263489.png",
              "iconSelectedUrl": "/assets/icons/361e4cbeec45f4c0e1ff1f8d50b49e0a7941ebf8e140ae79994dca6e399ca549.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9920"
            },
            {
              "id": "9921",
              "key": "catalog-9921",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/80531c5357979d05b33e2f2fb8a4c4980e0f8d38caff8f69c7991652dca69b40.png",
              "iconSelectedUrl": "/assets/icons/b9502633cc4fe308533b0c511df37554f5ab6e3c7a808b8f36d5db7cedde5190.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9921"
            },
            {
              "id": "9922",
              "key": "catalog-9922",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/6999e0ee656edebe21189f2422cb263da391551a165669572295962f086b5012.png",
              "iconSelectedUrl": "/assets/icons/6999e0ee656edebe21189f2422cb263da391551a165669572295962f086b5012.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9922"
            },
            {
              "id": "9923",
              "key": "catalog-9923",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/84ab3b121638853ee389c3a902bfe255319eb7aabad4116e64ca371bbc3201cf.png",
              "iconSelectedUrl": "/assets/icons/84ab3b121638853ee389c3a902bfe255319eb7aabad4116e64ca371bbc3201cf.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9923"
            },
            {
              "id": "9924",
              "key": "catalog-9924",
              "orderIndex": 5,
              "iconUrl": "/assets/icons/aff2455bd0dbbac7358fe76608f967051cd1c11cc54e10372ca2c7772dda5a7a.png",
              "iconSelectedUrl": "/assets/icons/aff2455bd0dbbac7358fe76608f967051cd1c11cc54e10372ca2c7772dda5a7a.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9924"
            },
            {
              "id": "9926",
              "key": "catalog-9926",
              "orderIndex": 7,
              "iconUrl": "/assets/icons/3f4207a5b5a0a926fbdfab9bf1131fc58d8dec0f1be26127dcac5e6d7c2c28e9.png",
              "iconSelectedUrl": "/assets/icons/3f4207a5b5a0a926fbdfab9bf1131fc58d8dec0f1be26127dcac5e6d7c2c28e9.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9926"
            }
          ],
          "name": "Group fixture group-3"
        },
        {
          "id": "group-4",
          "key": "group-4",
          "orderIndex": 4,
          "catalogs": [
            {
              "id": "9927",
              "key": "catalog-9927",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/08d2b1509c28a190d1e08444aade065eb8c1eafff0a022d023c4ee562481f14f.png",
              "iconSelectedUrl": "/assets/icons/08d2b1509c28a190d1e08444aade065eb8c1eafff0a022d023c4ee562481f14f.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9927"
            },
            {
              "id": "9928",
              "key": "catalog-9928",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/46c9cabf695e005254a33a469fb87e5557cea60aa1b25f0eebbc17ae174b3ff9.png",
              "iconSelectedUrl": "/assets/icons/46c9cabf695e005254a33a469fb87e5557cea60aa1b25f0eebbc17ae174b3ff9.png",
              "defaultSelected": false,
              "count": 1,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9928"
            }
          ],
          "name": "Group fixture group-4"
        },
        {
          "id": "group-5",
          "key": "group-5",
          "orderIndex": 5,
          "catalogs": [
            {
              "id": "9929",
              "key": "catalog-9929",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/17f21515e302fcce650ac9289769fadff5717e05c15e2faa5d6f234b89657305.png",
              "iconSelectedUrl": "/assets/icons/17f21515e302fcce650ac9289769fadff5717e05c15e2faa5d6f234b89657305.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9929"
            },
            {
              "id": "9930",
              "key": "catalog-9930",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/3968bb886be8845f95115b9a80cb40efeb24694a7d97b946be28b37282bddc21.png",
              "iconSelectedUrl": "/assets/icons/3968bb886be8845f95115b9a80cb40efeb24694a7d97b946be28b37282bddc21.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9930"
            },
            {
              "id": "9931",
              "key": "catalog-9931",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/9d4c708b25b2661ecb16f774c317ccef834df20cf83c9bcd435a100d1ccfe4e9.png",
              "iconSelectedUrl": "/assets/icons/9d4c708b25b2661ecb16f774c317ccef834df20cf83c9bcd435a100d1ccfe4e9.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9931"
            },
            {
              "id": "9932",
              "key": "catalog-9932",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/401d348acad1438b20bc0a07322a59b06f7ef276da8fa2e3b19b1b4677e68271.png",
              "iconSelectedUrl": "/assets/icons/401d348acad1438b20bc0a07322a59b06f7ef276da8fa2e3b19b1b4677e68271.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9932"
            }
          ],
          "name": "Group fixture group-5"
        },
        {
          "id": "group-6",
          "key": "group-6",
          "orderIndex": 6,
          "catalogs": [
            {
              "id": "9933",
              "key": "catalog-9933",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/86456e20ee9fdc55c251496a71cf99e4efad8f5f93e1b4a8d9f71fe018366a07.png",
              "iconSelectedUrl": "/assets/icons/5a5655a0f4ba1efd664dac232c4942803d21835d4a8316a0ade575ba3bb7a661.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9933"
            },
            {
              "id": "9934",
              "key": "catalog-9934",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/3bd16e6b4cf5b660f9453f75d75bec028a9aa914cb4a0051044b8b80e8017c24.png",
              "iconSelectedUrl": "/assets/icons/3bd16e6b4cf5b660f9453f75d75bec028a9aa914cb4a0051044b8b80e8017c24.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9934"
            }
          ],
          "name": "Group fixture group-6"
        },
        {
          "id": "group-7",
          "key": "group-7",
          "orderIndex": 7,
          "catalogs": [
            {
              "id": "9935",
              "key": "catalog-9935",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/3c7e1eb0b6749234bb8e5073bc6c2bc7049ae19c10b653f7d1ea2a77d7441b55.png",
              "iconSelectedUrl": "/assets/icons/c4538683f94982639695ee19788c03fc1d5d70661e49d82cd1456b75cf1dfc18.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9935"
            },
            {
              "id": "10048",
              "key": "catalog-10048",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/59d8ab5f5f43a6d3b7efac70dd11f1d6ac48c6b6a1c5fd7bed514857f3943a1d.png",
              "iconSelectedUrl": "/assets/icons/8f30b546a7ae42a614a6156eba3062089866a3398156cdf5ee94234abb770605.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10048"
            },
            {
              "id": "9936",
              "key": "catalog-9936",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/4830c47a4c7bba2fe45a7313fc5ba41a13750ed6fcce02e9abadd78c935ca4d6.png",
              "iconSelectedUrl": "/assets/icons/4830c47a4c7bba2fe45a7313fc5ba41a13750ed6fcce02e9abadd78c935ca4d6.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9936"
            },
            {
              "id": "9937",
              "key": "catalog-9937",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/4edf14e077949f7a784e94c6964c504963283fedb9fbab003c8669555d8ef180.png",
              "iconSelectedUrl": "/assets/icons/4edf14e077949f7a784e94c6964c504963283fedb9fbab003c8669555d8ef180.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9937"
            }
          ],
          "name": "Group fixture group-7"
        },
        {
          "id": "group-8",
          "key": "group-8",
          "orderIndex": 8,
          "catalogs": [
            {
              "id": "9938",
              "key": "catalog-9938",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/69c5e3f6114d729d953d4500894c4bee585769b43ec0146a43692f2d993b8d72.png",
              "iconSelectedUrl": "/assets/icons/02977dd03d173a3d4fd6343d9e99558befd4531dcc08c0dc5b6e17ad89e29204.png",
              "defaultSelected": true,
              "count": 1,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9938"
            }
          ],
          "name": "Group fixture group-8"
        },
        {
          "id": "group-9",
          "key": "group-9",
          "orderIndex": 9,
          "catalogs": [
            {
              "id": "9939",
              "key": "catalog-9939",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/a0abc19b718835204b118674d6efa64d4d97ca518325e21e982ebcfdc033d3d3.png",
              "iconSelectedUrl": "/assets/icons/8ecdc39b9e19b863f9a58d53de81054c98e82c3bb304def4ec1b1ffcc5c519e3.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9939"
            },
            {
              "id": "9940",
              "key": "catalog-9940",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/425faf3e7d6d16655ba52e69174b089a62ac37612373191f2f77ba4173b9cd8c.png",
              "iconSelectedUrl": "/assets/icons/445d014b4a7b18d5bd26e2a5293b985b5764d4fbd9bbde7fec0040d55afd897b.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9940"
            },
            {
              "id": "9941",
              "key": "catalog-9941",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/ed197303b9f8b1a84829778a03e225b8ec028aa4a0d67f7a8bd2df1c2c4d1b06.png",
              "iconSelectedUrl": "/assets/icons/83890beefaceed3a8b224a476955f48a98ea9444e922bb4fd6a2a6326a200ef8.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9941"
            },
            {
              "id": "9942",
              "key": "catalog-9942",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/1c5c6e1439d0d8b8d684c19e0c692717a1eb3c32cc402233e46ad24888b2c792.png",
              "iconSelectedUrl": "/assets/icons/0a40a664984e8731706a490433ca9737869ff82c5532125c0ad7f6a9563a6fe4.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 9942"
            }
          ],
          "name": "Group fixture group-9"
        }
      ],
      "defaultIconSize": 32,
      "landmarkNameColor": "#FFFFFF",
      "landmarkNameBackgroundColor": "#161413",
      "siblingMapIds": "251,252,253,254,255,256,257,258",
      "mapName": "Weeping Creek Valley"
    },
    {
      "id": "252",
      "center": [
        -0.820552571139558,
        0.5101784981668658
      ],
      "bounds": [
        -1.4,
        0,
        0,
        1.4
      ],
      "minZoom": 8,
      "maxZoom": 13,
      "defaultZoom": 10,
      "tileSize": 256,
      "tileUrl": "/assets/tiles/252/{z}/{x}_{y}.webp",
      "pointsUrl": "/data/maps/252.json",
      "areas": null,
      "useNewMapEngine": true,
      "catalogGroups": [
        {
          "id": "group-1",
          "key": "group-1",
          "orderIndex": 1,
          "catalogs": [
            {
              "id": "10051",
              "key": "catalog-10051",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/08759193ea75990c2c9434aadf6734ce601ba19ecc5ae9efefad4a44ad1bd829.png",
              "iconSelectedUrl": "/assets/icons/5296301f22458274a604bf1f98450db6005f00dc0417983c3f8b1cb835fbe946.png",
              "defaultSelected": true,
              "count": 1,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10051"
            },
            {
              "id": "10053",
              "key": "catalog-10053",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/a840cde92f4945dd8e09a70cca70661fc42b7cbea0d51c3da3f5cf178de764a5.png",
              "iconSelectedUrl": "/assets/icons/76152dff039939c30c47f3bebec665caefd9f214c0af5886edff49e31c28dd4d.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": false,
              "name": "Category fixture 10053"
            },
            {
              "id": "10052",
              "key": "catalog-10052",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/7f4a7b7c4d52a4cb3e764bb616065a3fb18d63f925d44a5ba7ea8b1975a1e71e.png",
              "iconSelectedUrl": "/assets/icons/7f4a7b7c4d52a4cb3e764bb616065a3fb18d63f925d44a5ba7ea8b1975a1e71e.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10052"
            },
            {
              "id": "10054",
              "key": "catalog-10054",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/e13477d71cba9d0ffbf9dc41bb6a38dfbfbf613a39216960719aad5052e3420d.png",
              "iconSelectedUrl": "/assets/icons/e13477d71cba9d0ffbf9dc41bb6a38dfbfbf613a39216960719aad5052e3420d.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10054"
            },
            {
              "id": "10055",
              "key": "catalog-10055",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/ed7ac6794bc5b24f7df3af11d2398d9706bffd2f2304ad026be3c20ed3476a15.png",
              "iconSelectedUrl": "/assets/icons/9a45db04bfecfa33add7bf4b0508747f12ebe58fa67421ea5c31d5f047e38074.png",
              "defaultSelected": true,
              "count": 1,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10055"
            },
            {
              "id": "10056",
              "key": "catalog-10056",
              "orderIndex": 5,
              "iconUrl": "/assets/icons/23ef8b8fac87d54bc430e21ef0c04e797aa1ac1904262d8e25052ba245febe6b.png",
              "iconSelectedUrl": "/assets/icons/23ef8b8fac87d54bc430e21ef0c04e797aa1ac1904262d8e25052ba245febe6b.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10056"
            },
            {
              "id": "10057",
              "key": "catalog-10057",
              "orderIndex": 6,
              "iconUrl": "/assets/icons/2f421011040738597e8670990af5eecc22b64246371e42ec8fe9ba0abc023d58.png",
              "iconSelectedUrl": "/assets/icons/2f421011040738597e8670990af5eecc22b64246371e42ec8fe9ba0abc023d58.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10057"
            },
            {
              "id": "10058",
              "key": "catalog-10058",
              "orderIndex": 7,
              "iconUrl": "/assets/icons/b3aefc18da6e79a33b2e86f482b0336e6653565beb7afd113277b2f9991893f8.png",
              "iconSelectedUrl": "/assets/icons/4bc58374f18d9638758966c3a15399957443e94dedd3fccbd7963dce76a73903.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10058"
            }
          ],
          "name": "Group fixture group-1"
        },
        {
          "id": "group-2",
          "key": "group-2",
          "orderIndex": 2,
          "catalogs": [
            {
              "id": "10059",
              "key": "catalog-10059",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/9f37096e7550deb341bf45cccc7ea808bfb5480dc901edfbc870da46e1aac05c.png",
              "iconSelectedUrl": "/assets/icons/50a29d8161fde6cfe1ef907e282a4b92d782fc9c5277a5207471989c6be55a6b.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10059"
            },
            {
              "id": "10060",
              "key": "catalog-10060",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/86d05861516407f4c55057952d96e39144c80f72b54c52dd5fa3e55bc1e6f1cc.png",
              "iconSelectedUrl": "/assets/icons/08acebdaa987dd5677752af9e7bb64224b9c4a72eb4a47042077738f0ff94194.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10060"
            },
            {
              "id": "10061",
              "key": "catalog-10061",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/71b8b9d742aadf2781437cd68a25c668b7a134fb0b4625ee09a170932b7f4f0a.png",
              "iconSelectedUrl": "/assets/icons/3906bab3c587409c793a77f0c7aa3cac56bde47e1f6b5b121f8c49fa2591807a.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10061"
            },
            {
              "id": "10062",
              "key": "catalog-10062",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/e9a4ab479efc209a980ad99e88613d1f207ae1d4a0485ea222d0a316f1d7ddfb.png",
              "iconSelectedUrl": "/assets/icons/5ef6572a43a3d3b5c7adf659593250925d206055a2a7a591d48b1da8bbf92815.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10062"
            },
            {
              "id": "10278",
              "key": "catalog-10278",
              "orderIndex": 5,
              "iconUrl": "/assets/icons/2463221df16dbb12da4e54d22caba38bdbc2e75b4a1b13206345a635ba00ba85.png",
              "iconSelectedUrl": "/assets/icons/f21c3270c5f3932c347659be40194b2204213746b8b0cb83ea6acec8d6b1b660.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10278"
            }
          ],
          "name": "Group fixture group-2"
        },
        {
          "id": "group-3",
          "key": "group-3",
          "orderIndex": 3,
          "catalogs": [
            {
              "id": "10063",
              "key": "catalog-10063",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/87f3295cfcb6b5aade35e8555750cdf28641b19bde5636994e558e6891263489.png",
              "iconSelectedUrl": "/assets/icons/361e4cbeec45f4c0e1ff1f8d50b49e0a7941ebf8e140ae79994dca6e399ca549.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10063"
            },
            {
              "id": "10064",
              "key": "catalog-10064",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/80531c5357979d05b33e2f2fb8a4c4980e0f8d38caff8f69c7991652dca69b40.png",
              "iconSelectedUrl": "/assets/icons/b9502633cc4fe308533b0c511df37554f5ab6e3c7a808b8f36d5db7cedde5190.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10064"
            },
            {
              "id": "10065",
              "key": "catalog-10065",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/6999e0ee656edebe21189f2422cb263da391551a165669572295962f086b5012.png",
              "iconSelectedUrl": "/assets/icons/6999e0ee656edebe21189f2422cb263da391551a165669572295962f086b5012.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10065"
            },
            {
              "id": "10066",
              "key": "catalog-10066",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/84ab3b121638853ee389c3a902bfe255319eb7aabad4116e64ca371bbc3201cf.png",
              "iconSelectedUrl": "/assets/icons/84ab3b121638853ee389c3a902bfe255319eb7aabad4116e64ca371bbc3201cf.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10066"
            },
            {
              "id": "10067",
              "key": "catalog-10067",
              "orderIndex": 5,
              "iconUrl": "/assets/icons/aff2455bd0dbbac7358fe76608f967051cd1c11cc54e10372ca2c7772dda5a7a.png",
              "iconSelectedUrl": "/assets/icons/aff2455bd0dbbac7358fe76608f967051cd1c11cc54e10372ca2c7772dda5a7a.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10067"
            },
            {
              "id": "10068",
              "key": "catalog-10068",
              "orderIndex": 6,
              "iconUrl": "/assets/icons/e564f1c54ddf9ffb4750f29b531f119061baa5acb1781e7b021f3e9147f1b36e.png",
              "iconSelectedUrl": "/assets/icons/e564f1c54ddf9ffb4750f29b531f119061baa5acb1781e7b021f3e9147f1b36e.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10068"
            },
            {
              "id": "10069",
              "key": "catalog-10069",
              "orderIndex": 7,
              "iconUrl": "/assets/icons/3f4207a5b5a0a926fbdfab9bf1131fc58d8dec0f1be26127dcac5e6d7c2c28e9.png",
              "iconSelectedUrl": "/assets/icons/3f4207a5b5a0a926fbdfab9bf1131fc58d8dec0f1be26127dcac5e6d7c2c28e9.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10069"
            }
          ],
          "name": "Group fixture group-3"
        },
        {
          "id": "group-4",
          "key": "group-4",
          "orderIndex": 4,
          "catalogs": [
            {
              "id": "10070",
              "key": "catalog-10070",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/08d2b1509c28a190d1e08444aade065eb8c1eafff0a022d023c4ee562481f14f.png",
              "iconSelectedUrl": "/assets/icons/08d2b1509c28a190d1e08444aade065eb8c1eafff0a022d023c4ee562481f14f.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10070"
            },
            {
              "id": "10071",
              "key": "catalog-10071",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/46c9cabf695e005254a33a469fb87e5557cea60aa1b25f0eebbc17ae174b3ff9.png",
              "iconSelectedUrl": "/assets/icons/46c9cabf695e005254a33a469fb87e5557cea60aa1b25f0eebbc17ae174b3ff9.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10071"
            }
          ],
          "name": "Group fixture group-4"
        },
        {
          "id": "group-5",
          "key": "group-5",
          "orderIndex": 5,
          "catalogs": [
            {
              "id": "10072",
              "key": "catalog-10072",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/17f21515e302fcce650ac9289769fadff5717e05c15e2faa5d6f234b89657305.png",
              "iconSelectedUrl": "/assets/icons/17f21515e302fcce650ac9289769fadff5717e05c15e2faa5d6f234b89657305.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10072"
            },
            {
              "id": "10073",
              "key": "catalog-10073",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/3968bb886be8845f95115b9a80cb40efeb24694a7d97b946be28b37282bddc21.png",
              "iconSelectedUrl": "/assets/icons/3968bb886be8845f95115b9a80cb40efeb24694a7d97b946be28b37282bddc21.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10073"
            },
            {
              "id": "10074",
              "key": "catalog-10074",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/9d4c708b25b2661ecb16f774c317ccef834df20cf83c9bcd435a100d1ccfe4e9.png",
              "iconSelectedUrl": "/assets/icons/9d4c708b25b2661ecb16f774c317ccef834df20cf83c9bcd435a100d1ccfe4e9.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10074"
            },
            {
              "id": "10075",
              "key": "catalog-10075",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/401d348acad1438b20bc0a07322a59b06f7ef276da8fa2e3b19b1b4677e68271.png",
              "iconSelectedUrl": "/assets/icons/401d348acad1438b20bc0a07322a59b06f7ef276da8fa2e3b19b1b4677e68271.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10075"
            }
          ],
          "name": "Group fixture group-5"
        },
        {
          "id": "group-6",
          "key": "group-6",
          "orderIndex": 6,
          "catalogs": [
            {
              "id": "10076",
              "key": "catalog-10076",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/86456e20ee9fdc55c251496a71cf99e4efad8f5f93e1b4a8d9f71fe018366a07.png",
              "iconSelectedUrl": "/assets/icons/5a5655a0f4ba1efd664dac232c4942803d21835d4a8316a0ade575ba3bb7a661.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10076"
            },
            {
              "id": "10077",
              "key": "catalog-10077",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/3bd16e6b4cf5b660f9453f75d75bec028a9aa914cb4a0051044b8b80e8017c24.png",
              "iconSelectedUrl": "/assets/icons/3bd16e6b4cf5b660f9453f75d75bec028a9aa914cb4a0051044b8b80e8017c24.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10077"
            }
          ],
          "name": "Group fixture group-6"
        },
        {
          "id": "group-7",
          "key": "group-7",
          "orderIndex": 7,
          "catalogs": [
            {
              "id": "10078",
              "key": "catalog-10078",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/3c7e1eb0b6749234bb8e5073bc6c2bc7049ae19c10b653f7d1ea2a77d7441b55.png",
              "iconSelectedUrl": "/assets/icons/c4538683f94982639695ee19788c03fc1d5d70661e49d82cd1456b75cf1dfc18.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10078"
            },
            {
              "id": "10079",
              "key": "catalog-10079",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/59d8ab5f5f43a6d3b7efac70dd11f1d6ac48c6b6a1c5fd7bed514857f3943a1d.png",
              "iconSelectedUrl": "/assets/icons/8f30b546a7ae42a614a6156eba3062089866a3398156cdf5ee94234abb770605.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10079"
            },
            {
              "id": "10080",
              "key": "catalog-10080",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/4830c47a4c7bba2fe45a7313fc5ba41a13750ed6fcce02e9abadd78c935ca4d6.png",
              "iconSelectedUrl": "/assets/icons/4830c47a4c7bba2fe45a7313fc5ba41a13750ed6fcce02e9abadd78c935ca4d6.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10080"
            },
            {
              "id": "10081",
              "key": "catalog-10081",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/4edf14e077949f7a784e94c6964c504963283fedb9fbab003c8669555d8ef180.png",
              "iconSelectedUrl": "/assets/icons/4edf14e077949f7a784e94c6964c504963283fedb9fbab003c8669555d8ef180.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10081"
            }
          ],
          "name": "Group fixture group-7"
        },
        {
          "id": "group-8",
          "key": "group-8",
          "orderIndex": 8,
          "catalogs": [
            {
              "id": "10082",
              "key": "catalog-10082",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/69c5e3f6114d729d953d4500894c4bee585769b43ec0146a43692f2d993b8d72.png",
              "iconSelectedUrl": "/assets/icons/02977dd03d173a3d4fd6343d9e99558befd4531dcc08c0dc5b6e17ad89e29204.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10082"
            }
          ],
          "name": "Group fixture group-8"
        },
        {
          "id": "group-9",
          "key": "group-9",
          "orderIndex": 9,
          "catalogs": [
            {
              "id": "10083",
              "key": "catalog-10083",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/a0abc19b718835204b118674d6efa64d4d97ca518325e21e982ebcfdc033d3d3.png",
              "iconSelectedUrl": "/assets/icons/8ecdc39b9e19b863f9a58d53de81054c98e82c3bb304def4ec1b1ffcc5c519e3.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10083"
            },
            {
              "id": "10084",
              "key": "catalog-10084",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/425faf3e7d6d16655ba52e69174b089a62ac37612373191f2f77ba4173b9cd8c.png",
              "iconSelectedUrl": "/assets/icons/445d014b4a7b18d5bd26e2a5293b985b5764d4fbd9bbde7fec0040d55afd897b.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10084"
            },
            {
              "id": "10085",
              "key": "catalog-10085",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/ed197303b9f8b1a84829778a03e225b8ec028aa4a0d67f7a8bd2df1c2c4d1b06.png",
              "iconSelectedUrl": "/assets/icons/83890beefaceed3a8b224a476955f48a98ea9444e922bb4fd6a2a6326a200ef8.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10085"
            },
            {
              "id": "10086",
              "key": "catalog-10086",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/1c5c6e1439d0d8b8d684c19e0c692717a1eb3c32cc402233e46ad24888b2c792.png",
              "iconSelectedUrl": "/assets/icons/0a40a664984e8731706a490433ca9737869ff82c5532125c0ad7f6a9563a6fe4.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10086"
            }
          ],
          "name": "Group fixture group-9"
        }
      ],
      "defaultIconSize": 32,
      "landmarkNameColor": "#F3FFE1",
      "landmarkNameBackgroundColor": "#0F0B09",
      "siblingMapIds": "251,252,253,254,255,256,257,258",
      "mapName": "Crimson Forest"
    },
    {
      "id": "253",
      "center": [
        -0.5842706187644353,
        0.4512893716765518
      ],
      "bounds": [
        -1.4,
        0,
        0,
        1.4
      ],
      "minZoom": 8,
      "maxZoom": 13,
      "defaultZoom": 10,
      "tileSize": 256,
      "tileUrl": "/assets/tiles/253/{z}/{x}_{y}.webp",
      "pointsUrl": "/data/maps/253.json",
      "areas": null,
      "useNewMapEngine": true,
      "catalogGroups": [
        {
          "id": "group-1",
          "key": "group-1",
          "orderIndex": 1,
          "catalogs": [
            {
              "id": "10087",
              "key": "catalog-10087",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/08759193ea75990c2c9434aadf6734ce601ba19ecc5ae9efefad4a44ad1bd829.png",
              "iconSelectedUrl": "/assets/icons/5296301f22458274a604bf1f98450db6005f00dc0417983c3f8b1cb835fbe946.png",
              "defaultSelected": true,
              "count": 1,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10087"
            },
            {
              "id": "10089",
              "key": "catalog-10089",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/a840cde92f4945dd8e09a70cca70661fc42b7cbea0d51c3da3f5cf178de764a5.png",
              "iconSelectedUrl": "/assets/icons/76152dff039939c30c47f3bebec665caefd9f214c0af5886edff49e31c28dd4d.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": false,
              "name": "Category fixture 10089"
            },
            {
              "id": "10088",
              "key": "catalog-10088",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/7f4a7b7c4d52a4cb3e764bb616065a3fb18d63f925d44a5ba7ea8b1975a1e71e.png",
              "iconSelectedUrl": "/assets/icons/7f4a7b7c4d52a4cb3e764bb616065a3fb18d63f925d44a5ba7ea8b1975a1e71e.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10088"
            },
            {
              "id": "10090",
              "key": "catalog-10090",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/e13477d71cba9d0ffbf9dc41bb6a38dfbfbf613a39216960719aad5052e3420d.png",
              "iconSelectedUrl": "/assets/icons/e13477d71cba9d0ffbf9dc41bb6a38dfbfbf613a39216960719aad5052e3420d.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10090"
            },
            {
              "id": "10091",
              "key": "catalog-10091",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/13ae859a6fbce19b3974ab70013bb6559193a38f286b65c3575167ce5b1620ec.png",
              "iconSelectedUrl": "/assets/icons/4b12309e12336ea86df3c4dc4ddc96439d6934b15c070e8e757d0fb2b0bf6a84.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10091"
            },
            {
              "id": "10092",
              "key": "catalog-10092",
              "orderIndex": 5,
              "iconUrl": "/assets/icons/23ef8b8fac87d54bc430e21ef0c04e797aa1ac1904262d8e25052ba245febe6b.png",
              "iconSelectedUrl": "/assets/icons/23ef8b8fac87d54bc430e21ef0c04e797aa1ac1904262d8e25052ba245febe6b.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10092"
            },
            {
              "id": "10093",
              "key": "catalog-10093",
              "orderIndex": 6,
              "iconUrl": "/assets/icons/2f421011040738597e8670990af5eecc22b64246371e42ec8fe9ba0abc023d58.png",
              "iconSelectedUrl": "/assets/icons/2f421011040738597e8670990af5eecc22b64246371e42ec8fe9ba0abc023d58.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10093"
            },
            {
              "id": "10094",
              "key": "catalog-10094",
              "orderIndex": 7,
              "iconUrl": "/assets/icons/b3aefc18da6e79a33b2e86f482b0336e6653565beb7afd113277b2f9991893f8.png",
              "iconSelectedUrl": "/assets/icons/4bc58374f18d9638758966c3a15399957443e94dedd3fccbd7963dce76a73903.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10094"
            }
          ],
          "name": "Group fixture group-1"
        },
        {
          "id": "group-2",
          "key": "group-2",
          "orderIndex": 2,
          "catalogs": [
            {
              "id": "10095",
              "key": "catalog-10095",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/8b6210724bbf49c2abb6c00c896e555c04c13f31e1944f897eb5470def220a82.png",
              "iconSelectedUrl": "/assets/icons/859b0994ab8041a8d245b8f336b2f5ac074b97707a54d6f56ab835fa35bb1076.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10095"
            },
            {
              "id": "10096",
              "key": "catalog-10096",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/86d05861516407f4c55057952d96e39144c80f72b54c52dd5fa3e55bc1e6f1cc.png",
              "iconSelectedUrl": "/assets/icons/08acebdaa987dd5677752af9e7bb64224b9c4a72eb4a47042077738f0ff94194.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10096"
            },
            {
              "id": "10097",
              "key": "catalog-10097",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/71b8b9d742aadf2781437cd68a25c668b7a134fb0b4625ee09a170932b7f4f0a.png",
              "iconSelectedUrl": "/assets/icons/3906bab3c587409c793a77f0c7aa3cac56bde47e1f6b5b121f8c49fa2591807a.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10097"
            },
            {
              "id": "10098",
              "key": "catalog-10098",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/e9a4ab479efc209a980ad99e88613d1f207ae1d4a0485ea222d0a316f1d7ddfb.png",
              "iconSelectedUrl": "/assets/icons/5ef6572a43a3d3b5c7adf659593250925d206055a2a7a591d48b1da8bbf92815.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10098"
            },
            {
              "id": "10124",
              "key": "catalog-10124",
              "orderIndex": 5,
              "iconUrl": "/assets/icons/325cd6637c59f67bfef61f19e81fe6d7d5725768e2f8d514d1d1992504158d5d.png",
              "iconSelectedUrl": "/assets/icons/03cc5bbeb90ac0cd800bef6ea5ee68ad6287c27a97428a757654b8e5eefef786.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10124"
            }
          ],
          "name": "Group fixture group-2"
        },
        {
          "id": "group-3",
          "key": "group-3",
          "orderIndex": 3,
          "catalogs": [
            {
              "id": "10099",
              "key": "catalog-10099",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/87f3295cfcb6b5aade35e8555750cdf28641b19bde5636994e558e6891263489.png",
              "iconSelectedUrl": "/assets/icons/361e4cbeec45f4c0e1ff1f8d50b49e0a7941ebf8e140ae79994dca6e399ca549.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10099"
            },
            {
              "id": "10100",
              "key": "catalog-10100",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/80531c5357979d05b33e2f2fb8a4c4980e0f8d38caff8f69c7991652dca69b40.png",
              "iconSelectedUrl": "/assets/icons/b9502633cc4fe308533b0c511df37554f5ab6e3c7a808b8f36d5db7cedde5190.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10100"
            },
            {
              "id": "10101",
              "key": "catalog-10101",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/6999e0ee656edebe21189f2422cb263da391551a165669572295962f086b5012.png",
              "iconSelectedUrl": "/assets/icons/6999e0ee656edebe21189f2422cb263da391551a165669572295962f086b5012.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10101"
            },
            {
              "id": "10102",
              "key": "catalog-10102",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/84ab3b121638853ee389c3a902bfe255319eb7aabad4116e64ca371bbc3201cf.png",
              "iconSelectedUrl": "/assets/icons/84ab3b121638853ee389c3a902bfe255319eb7aabad4116e64ca371bbc3201cf.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10102"
            },
            {
              "id": "10103",
              "key": "catalog-10103",
              "orderIndex": 5,
              "iconUrl": "/assets/icons/aff2455bd0dbbac7358fe76608f967051cd1c11cc54e10372ca2c7772dda5a7a.png",
              "iconSelectedUrl": "/assets/icons/aff2455bd0dbbac7358fe76608f967051cd1c11cc54e10372ca2c7772dda5a7a.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10103"
            },
            {
              "id": "10104",
              "key": "catalog-10104",
              "orderIndex": 6,
              "iconUrl": "/assets/icons/e564f1c54ddf9ffb4750f29b531f119061baa5acb1781e7b021f3e9147f1b36e.png",
              "iconSelectedUrl": "/assets/icons/e564f1c54ddf9ffb4750f29b531f119061baa5acb1781e7b021f3e9147f1b36e.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10104"
            },
            {
              "id": "10105",
              "key": "catalog-10105",
              "orderIndex": 7,
              "iconUrl": "/assets/icons/3f4207a5b5a0a926fbdfab9bf1131fc58d8dec0f1be26127dcac5e6d7c2c28e9.png",
              "iconSelectedUrl": "/assets/icons/3f4207a5b5a0a926fbdfab9bf1131fc58d8dec0f1be26127dcac5e6d7c2c28e9.png",
              "defaultSelected": true,
              "count": 1,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10105"
            }
          ],
          "name": "Group fixture group-3"
        },
        {
          "id": "group-4",
          "key": "group-4",
          "orderIndex": 4,
          "catalogs": [
            {
              "id": "10106",
              "key": "catalog-10106",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/08d2b1509c28a190d1e08444aade065eb8c1eafff0a022d023c4ee562481f14f.png",
              "iconSelectedUrl": "/assets/icons/08d2b1509c28a190d1e08444aade065eb8c1eafff0a022d023c4ee562481f14f.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10106"
            },
            {
              "id": "10107",
              "key": "catalog-10107",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/46c9cabf695e005254a33a469fb87e5557cea60aa1b25f0eebbc17ae174b3ff9.png",
              "iconSelectedUrl": "/assets/icons/46c9cabf695e005254a33a469fb87e5557cea60aa1b25f0eebbc17ae174b3ff9.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10107"
            }
          ],
          "name": "Group fixture group-4"
        },
        {
          "id": "group-5",
          "key": "group-5",
          "orderIndex": 5,
          "catalogs": [
            {
              "id": "10108",
              "key": "catalog-10108",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/17f21515e302fcce650ac9289769fadff5717e05c15e2faa5d6f234b89657305.png",
              "iconSelectedUrl": "/assets/icons/17f21515e302fcce650ac9289769fadff5717e05c15e2faa5d6f234b89657305.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10108"
            },
            {
              "id": "10109",
              "key": "catalog-10109",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/3968bb886be8845f95115b9a80cb40efeb24694a7d97b946be28b37282bddc21.png",
              "iconSelectedUrl": "/assets/icons/3968bb886be8845f95115b9a80cb40efeb24694a7d97b946be28b37282bddc21.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10109"
            },
            {
              "id": "10110",
              "key": "catalog-10110",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/9d4c708b25b2661ecb16f774c317ccef834df20cf83c9bcd435a100d1ccfe4e9.png",
              "iconSelectedUrl": "/assets/icons/9d4c708b25b2661ecb16f774c317ccef834df20cf83c9bcd435a100d1ccfe4e9.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10110"
            },
            {
              "id": "10111",
              "key": "catalog-10111",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/401d348acad1438b20bc0a07322a59b06f7ef276da8fa2e3b19b1b4677e68271.png",
              "iconSelectedUrl": "/assets/icons/401d348acad1438b20bc0a07322a59b06f7ef276da8fa2e3b19b1b4677e68271.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10111"
            }
          ],
          "name": "Group fixture group-5"
        },
        {
          "id": "group-6",
          "key": "group-6",
          "orderIndex": 6,
          "catalogs": [
            {
              "id": "10112",
              "key": "catalog-10112",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/86456e20ee9fdc55c251496a71cf99e4efad8f5f93e1b4a8d9f71fe018366a07.png",
              "iconSelectedUrl": "/assets/icons/5a5655a0f4ba1efd664dac232c4942803d21835d4a8316a0ade575ba3bb7a661.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10112"
            },
            {
              "id": "10113",
              "key": "catalog-10113",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/3bd16e6b4cf5b660f9453f75d75bec028a9aa914cb4a0051044b8b80e8017c24.png",
              "iconSelectedUrl": "/assets/icons/3bd16e6b4cf5b660f9453f75d75bec028a9aa914cb4a0051044b8b80e8017c24.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10113"
            }
          ],
          "name": "Group fixture group-6"
        },
        {
          "id": "group-7",
          "key": "group-7",
          "orderIndex": 7,
          "catalogs": [
            {
              "id": "10114",
              "key": "catalog-10114",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/3c7e1eb0b6749234bb8e5073bc6c2bc7049ae19c10b653f7d1ea2a77d7441b55.png",
              "iconSelectedUrl": "/assets/icons/c4538683f94982639695ee19788c03fc1d5d70661e49d82cd1456b75cf1dfc18.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10114"
            },
            {
              "id": "10115",
              "key": "catalog-10115",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/59d8ab5f5f43a6d3b7efac70dd11f1d6ac48c6b6a1c5fd7bed514857f3943a1d.png",
              "iconSelectedUrl": "/assets/icons/8f30b546a7ae42a614a6156eba3062089866a3398156cdf5ee94234abb770605.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10115"
            },
            {
              "id": "10116",
              "key": "catalog-10116",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/4830c47a4c7bba2fe45a7313fc5ba41a13750ed6fcce02e9abadd78c935ca4d6.png",
              "iconSelectedUrl": "/assets/icons/4830c47a4c7bba2fe45a7313fc5ba41a13750ed6fcce02e9abadd78c935ca4d6.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10116"
            },
            {
              "id": "10117",
              "key": "catalog-10117",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/4edf14e077949f7a784e94c6964c504963283fedb9fbab003c8669555d8ef180.png",
              "iconSelectedUrl": "/assets/icons/4edf14e077949f7a784e94c6964c504963283fedb9fbab003c8669555d8ef180.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10117"
            }
          ],
          "name": "Group fixture group-7"
        },
        {
          "id": "group-8",
          "key": "group-8",
          "orderIndex": 8,
          "catalogs": [
            {
              "id": "10118",
              "key": "catalog-10118",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/69c5e3f6114d729d953d4500894c4bee585769b43ec0146a43692f2d993b8d72.png",
              "iconSelectedUrl": "/assets/icons/02977dd03d173a3d4fd6343d9e99558befd4531dcc08c0dc5b6e17ad89e29204.png",
              "defaultSelected": true,
              "count": 1,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10118"
            }
          ],
          "name": "Group fixture group-8"
        },
        {
          "id": "group-9",
          "key": "group-9",
          "orderIndex": 9,
          "catalogs": [
            {
              "id": "10119",
              "key": "catalog-10119",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/a0abc19b718835204b118674d6efa64d4d97ca518325e21e982ebcfdc033d3d3.png",
              "iconSelectedUrl": "/assets/icons/8ecdc39b9e19b863f9a58d53de81054c98e82c3bb304def4ec1b1ffcc5c519e3.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10119"
            },
            {
              "id": "10120",
              "key": "catalog-10120",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/425faf3e7d6d16655ba52e69174b089a62ac37612373191f2f77ba4173b9cd8c.png",
              "iconSelectedUrl": "/assets/icons/445d014b4a7b18d5bd26e2a5293b985b5764d4fbd9bbde7fec0040d55afd897b.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10120"
            },
            {
              "id": "10121",
              "key": "catalog-10121",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/ed197303b9f8b1a84829778a03e225b8ec028aa4a0d67f7a8bd2df1c2c4d1b06.png",
              "iconSelectedUrl": "/assets/icons/83890beefaceed3a8b224a476955f48a98ea9444e922bb4fd6a2a6326a200ef8.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10121"
            },
            {
              "id": "10122",
              "key": "catalog-10122",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/1c5c6e1439d0d8b8d684c19e0c692717a1eb3c32cc402233e46ad24888b2c792.png",
              "iconSelectedUrl": "/assets/icons/0a40a664984e8731706a490433ca9737869ff82c5532125c0ad7f6a9563a6fe4.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10122"
            }
          ],
          "name": "Group fixture group-9"
        }
      ],
      "defaultIconSize": 32,
      "landmarkNameColor": "#F3FFE1",
      "landmarkNameBackgroundColor": "#0F0B09",
      "siblingMapIds": "251,252,253,254,255,256,257,258",
      "mapName": "Village of Lu"
    },
    {
      "id": "254",
      "center": [
        -0.40520260580467493,
        0.5487435450189508
      ],
      "bounds": [
        -1.4,
        0,
        0,
        1.4
      ],
      "minZoom": 8,
      "maxZoom": 14,
      "defaultZoom": 11,
      "tileSize": 256,
      "tileUrl": "/assets/tiles/254/{z}/{x}_{y}.webp",
      "pointsUrl": "/data/maps/254.json",
      "areas": null,
      "useNewMapEngine": true,
      "catalogGroups": [
        {
          "id": "group-1",
          "key": "group-1",
          "orderIndex": 1,
          "catalogs": [
            {
              "id": "10014",
              "key": "catalog-10014",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/08759193ea75990c2c9434aadf6734ce601ba19ecc5ae9efefad4a44ad1bd829.png",
              "iconSelectedUrl": "/assets/icons/5296301f22458274a604bf1f98450db6005f00dc0417983c3f8b1cb835fbe946.png",
              "defaultSelected": true,
              "count": 1,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10014"
            },
            {
              "id": "10050",
              "key": "catalog-10050",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/a840cde92f4945dd8e09a70cca70661fc42b7cbea0d51c3da3f5cf178de764a5.png",
              "iconSelectedUrl": "/assets/icons/76152dff039939c30c47f3bebec665caefd9f214c0af5886edff49e31c28dd4d.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": false,
              "name": "Category fixture 10050"
            },
            {
              "id": "10015",
              "key": "catalog-10015",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/7f4a7b7c4d52a4cb3e764bb616065a3fb18d63f925d44a5ba7ea8b1975a1e71e.png",
              "iconSelectedUrl": "/assets/icons/7f4a7b7c4d52a4cb3e764bb616065a3fb18d63f925d44a5ba7ea8b1975a1e71e.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10015"
            },
            {
              "id": "10016",
              "key": "catalog-10016",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/e13477d71cba9d0ffbf9dc41bb6a38dfbfbf613a39216960719aad5052e3420d.png",
              "iconSelectedUrl": "/assets/icons/e13477d71cba9d0ffbf9dc41bb6a38dfbfbf613a39216960719aad5052e3420d.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10016"
            },
            {
              "id": "10017",
              "key": "catalog-10017",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/89a848fb2c3fd1fab1b9f5d669246548299c69894740539ab6907b4bd5127047.png",
              "iconSelectedUrl": "/assets/icons/c56bfa59f59facac152f6f8427ab0f0be07f5cb247f1ae2ee28c52e1e3f054e7.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10017"
            },
            {
              "id": "10018",
              "key": "catalog-10018",
              "orderIndex": 5,
              "iconUrl": "/assets/icons/23ef8b8fac87d54bc430e21ef0c04e797aa1ac1904262d8e25052ba245febe6b.png",
              "iconSelectedUrl": "/assets/icons/23ef8b8fac87d54bc430e21ef0c04e797aa1ac1904262d8e25052ba245febe6b.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10018"
            },
            {
              "id": "10019",
              "key": "catalog-10019",
              "orderIndex": 6,
              "iconUrl": "/assets/icons/2f421011040738597e8670990af5eecc22b64246371e42ec8fe9ba0abc023d58.png",
              "iconSelectedUrl": "/assets/icons/2f421011040738597e8670990af5eecc22b64246371e42ec8fe9ba0abc023d58.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10019"
            },
            {
              "id": "10020",
              "key": "catalog-10020",
              "orderIndex": 7,
              "iconUrl": "/assets/icons/b3aefc18da6e79a33b2e86f482b0336e6653565beb7afd113277b2f9991893f8.png",
              "iconSelectedUrl": "/assets/icons/4bc58374f18d9638758966c3a15399957443e94dedd3fccbd7963dce76a73903.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10020"
            }
          ],
          "name": "Group fixture group-1"
        },
        {
          "id": "group-2",
          "key": "group-2",
          "orderIndex": 2,
          "catalogs": [
            {
              "id": "10021",
              "key": "catalog-10021",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/67e48a4033a36900671fe92c9a5a6aa296e98e2d39ad1f646f4e62af50f5f8fb.png",
              "iconSelectedUrl": "/assets/icons/9fd95b481a18f5ecdd62d2cdcd323cd76fcb1c156397b430b302e632d8b97ac3.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10021"
            },
            {
              "id": "10022",
              "key": "catalog-10022",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/86d05861516407f4c55057952d96e39144c80f72b54c52dd5fa3e55bc1e6f1cc.png",
              "iconSelectedUrl": "/assets/icons/08acebdaa987dd5677752af9e7bb64224b9c4a72eb4a47042077738f0ff94194.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10022"
            },
            {
              "id": "10023",
              "key": "catalog-10023",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/71b8b9d742aadf2781437cd68a25c668b7a134fb0b4625ee09a170932b7f4f0a.png",
              "iconSelectedUrl": "/assets/icons/3906bab3c587409c793a77f0c7aa3cac56bde47e1f6b5b121f8c49fa2591807a.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10023"
            },
            {
              "id": "10024",
              "key": "catalog-10024",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/e9a4ab479efc209a980ad99e88613d1f207ae1d4a0485ea222d0a316f1d7ddfb.png",
              "iconSelectedUrl": "/assets/icons/5ef6572a43a3d3b5c7adf659593250925d206055a2a7a591d48b1da8bbf92815.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10024"
            },
            {
              "id": "10125",
              "key": "catalog-10125",
              "orderIndex": 5,
              "iconUrl": "/assets/icons/15d7c172dcf87cf5ab7e256b9a82fcd0c7b708007ee8cc2e9739b69c306cc838.png",
              "iconSelectedUrl": "/assets/icons/9e1bd69132b26e07323ba8e47e3bea8d3e0813e596925a6c51744af8f05638f8.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10125"
            }
          ],
          "name": "Group fixture group-2"
        },
        {
          "id": "group-3",
          "key": "group-3",
          "orderIndex": 3,
          "catalogs": [
            {
              "id": "10025",
              "key": "catalog-10025",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/87f3295cfcb6b5aade35e8555750cdf28641b19bde5636994e558e6891263489.png",
              "iconSelectedUrl": "/assets/icons/361e4cbeec45f4c0e1ff1f8d50b49e0a7941ebf8e140ae79994dca6e399ca549.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10025"
            },
            {
              "id": "10026",
              "key": "catalog-10026",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/80531c5357979d05b33e2f2fb8a4c4980e0f8d38caff8f69c7991652dca69b40.png",
              "iconSelectedUrl": "/assets/icons/b9502633cc4fe308533b0c511df37554f5ab6e3c7a808b8f36d5db7cedde5190.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10026"
            },
            {
              "id": "10027",
              "key": "catalog-10027",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/6999e0ee656edebe21189f2422cb263da391551a165669572295962f086b5012.png",
              "iconSelectedUrl": "/assets/icons/6999e0ee656edebe21189f2422cb263da391551a165669572295962f086b5012.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10027"
            },
            {
              "id": "10028",
              "key": "catalog-10028",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/84ab3b121638853ee389c3a902bfe255319eb7aabad4116e64ca371bbc3201cf.png",
              "iconSelectedUrl": "/assets/icons/84ab3b121638853ee389c3a902bfe255319eb7aabad4116e64ca371bbc3201cf.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10028"
            },
            {
              "id": "10029",
              "key": "catalog-10029",
              "orderIndex": 5,
              "iconUrl": "/assets/icons/aff2455bd0dbbac7358fe76608f967051cd1c11cc54e10372ca2c7772dda5a7a.png",
              "iconSelectedUrl": "/assets/icons/aff2455bd0dbbac7358fe76608f967051cd1c11cc54e10372ca2c7772dda5a7a.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10029"
            },
            {
              "id": "10030",
              "key": "catalog-10030",
              "orderIndex": 6,
              "iconUrl": "/assets/icons/e564f1c54ddf9ffb4750f29b531f119061baa5acb1781e7b021f3e9147f1b36e.png",
              "iconSelectedUrl": "/assets/icons/e564f1c54ddf9ffb4750f29b531f119061baa5acb1781e7b021f3e9147f1b36e.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10030"
            },
            {
              "id": "10031",
              "key": "catalog-10031",
              "orderIndex": 7,
              "iconUrl": "/assets/icons/3f4207a5b5a0a926fbdfab9bf1131fc58d8dec0f1be26127dcac5e6d7c2c28e9.png",
              "iconSelectedUrl": "/assets/icons/3f4207a5b5a0a926fbdfab9bf1131fc58d8dec0f1be26127dcac5e6d7c2c28e9.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10031"
            }
          ],
          "name": "Group fixture group-3"
        },
        {
          "id": "group-4",
          "key": "group-4",
          "orderIndex": 4,
          "catalogs": [
            {
              "id": "10032",
              "key": "catalog-10032",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/08d2b1509c28a190d1e08444aade065eb8c1eafff0a022d023c4ee562481f14f.png",
              "iconSelectedUrl": "/assets/icons/08d2b1509c28a190d1e08444aade065eb8c1eafff0a022d023c4ee562481f14f.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10032"
            },
            {
              "id": "10033",
              "key": "catalog-10033",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/46c9cabf695e005254a33a469fb87e5557cea60aa1b25f0eebbc17ae174b3ff9.png",
              "iconSelectedUrl": "/assets/icons/46c9cabf695e005254a33a469fb87e5557cea60aa1b25f0eebbc17ae174b3ff9.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10033"
            }
          ],
          "name": "Group fixture group-4"
        },
        {
          "id": "group-5",
          "key": "group-5",
          "orderIndex": 5,
          "catalogs": [
            {
              "id": "10034",
              "key": "catalog-10034",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/17f21515e302fcce650ac9289769fadff5717e05c15e2faa5d6f234b89657305.png",
              "iconSelectedUrl": "/assets/icons/17f21515e302fcce650ac9289769fadff5717e05c15e2faa5d6f234b89657305.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10034"
            },
            {
              "id": "10035",
              "key": "catalog-10035",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/3968bb886be8845f95115b9a80cb40efeb24694a7d97b946be28b37282bddc21.png",
              "iconSelectedUrl": "/assets/icons/3968bb886be8845f95115b9a80cb40efeb24694a7d97b946be28b37282bddc21.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10035"
            },
            {
              "id": "10036",
              "key": "catalog-10036",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/9d4c708b25b2661ecb16f774c317ccef834df20cf83c9bcd435a100d1ccfe4e9.png",
              "iconSelectedUrl": "/assets/icons/9d4c708b25b2661ecb16f774c317ccef834df20cf83c9bcd435a100d1ccfe4e9.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10036"
            },
            {
              "id": "10037",
              "key": "catalog-10037",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/401d348acad1438b20bc0a07322a59b06f7ef276da8fa2e3b19b1b4677e68271.png",
              "iconSelectedUrl": "/assets/icons/401d348acad1438b20bc0a07322a59b06f7ef276da8fa2e3b19b1b4677e68271.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10037"
            }
          ],
          "name": "Group fixture group-5"
        },
        {
          "id": "group-6",
          "key": "group-6",
          "orderIndex": 6,
          "catalogs": [
            {
              "id": "10038",
              "key": "catalog-10038",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/86456e20ee9fdc55c251496a71cf99e4efad8f5f93e1b4a8d9f71fe018366a07.png",
              "iconSelectedUrl": "/assets/icons/5a5655a0f4ba1efd664dac232c4942803d21835d4a8316a0ade575ba3bb7a661.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10038"
            },
            {
              "id": "10039",
              "key": "catalog-10039",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/3bd16e6b4cf5b660f9453f75d75bec028a9aa914cb4a0051044b8b80e8017c24.png",
              "iconSelectedUrl": "/assets/icons/3bd16e6b4cf5b660f9453f75d75bec028a9aa914cb4a0051044b8b80e8017c24.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10039"
            }
          ],
          "name": "Group fixture group-6"
        },
        {
          "id": "group-7",
          "key": "group-7",
          "orderIndex": 7,
          "catalogs": [
            {
              "id": "10040",
              "key": "catalog-10040",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/3c7e1eb0b6749234bb8e5073bc6c2bc7049ae19c10b653f7d1ea2a77d7441b55.png",
              "iconSelectedUrl": "/assets/icons/c4538683f94982639695ee19788c03fc1d5d70661e49d82cd1456b75cf1dfc18.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10040"
            },
            {
              "id": "10049",
              "key": "catalog-10049",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/59d8ab5f5f43a6d3b7efac70dd11f1d6ac48c6b6a1c5fd7bed514857f3943a1d.png",
              "iconSelectedUrl": "/assets/icons/8f30b546a7ae42a614a6156eba3062089866a3398156cdf5ee94234abb770605.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10049"
            },
            {
              "id": "10041",
              "key": "catalog-10041",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/4830c47a4c7bba2fe45a7313fc5ba41a13750ed6fcce02e9abadd78c935ca4d6.png",
              "iconSelectedUrl": "/assets/icons/4830c47a4c7bba2fe45a7313fc5ba41a13750ed6fcce02e9abadd78c935ca4d6.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10041"
            },
            {
              "id": "10042",
              "key": "catalog-10042",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/4edf14e077949f7a784e94c6964c504963283fedb9fbab003c8669555d8ef180.png",
              "iconSelectedUrl": "/assets/icons/4edf14e077949f7a784e94c6964c504963283fedb9fbab003c8669555d8ef180.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10042"
            }
          ],
          "name": "Group fixture group-7"
        },
        {
          "id": "group-8",
          "key": "group-8",
          "orderIndex": 8,
          "catalogs": [
            {
              "id": "10043",
              "key": "catalog-10043",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/69c5e3f6114d729d953d4500894c4bee585769b43ec0146a43692f2d993b8d72.png",
              "iconSelectedUrl": "/assets/icons/02977dd03d173a3d4fd6343d9e99558befd4531dcc08c0dc5b6e17ad89e29204.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10043"
            }
          ],
          "name": "Group fixture group-8"
        },
        {
          "id": "group-9",
          "key": "group-9",
          "orderIndex": 9,
          "catalogs": [
            {
              "id": "10044",
              "key": "catalog-10044",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/a0abc19b718835204b118674d6efa64d4d97ca518325e21e982ebcfdc033d3d3.png",
              "iconSelectedUrl": "/assets/icons/8ecdc39b9e19b863f9a58d53de81054c98e82c3bb304def4ec1b1ffcc5c519e3.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10044"
            },
            {
              "id": "10045",
              "key": "catalog-10045",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/425faf3e7d6d16655ba52e69174b089a62ac37612373191f2f77ba4173b9cd8c.png",
              "iconSelectedUrl": "/assets/icons/445d014b4a7b18d5bd26e2a5293b985b5764d4fbd9bbde7fec0040d55afd897b.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10045"
            },
            {
              "id": "10046",
              "key": "catalog-10046",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/ed197303b9f8b1a84829778a03e225b8ec028aa4a0d67f7a8bd2df1c2c4d1b06.png",
              "iconSelectedUrl": "/assets/icons/83890beefaceed3a8b224a476955f48a98ea9444e922bb4fd6a2a6326a200ef8.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10046"
            },
            {
              "id": "10047",
              "key": "catalog-10047",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/1c5c6e1439d0d8b8d684c19e0c692717a1eb3c32cc402233e46ad24888b2c792.png",
              "iconSelectedUrl": "/assets/icons/0a40a664984e8731706a490433ca9737869ff82c5532125c0ad7f6a9563a6fe4.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10047"
            }
          ],
          "name": "Group fixture group-9"
        }
      ],
      "defaultIconSize": 24,
      "landmarkNameColor": "#F3FFE1",
      "landmarkNameBackgroundColor": "#0F0B09",
      "siblingMapIds": "251,252,253,254,255,256,257,258",
      "mapName": "Pangzhen"
    },
    {
      "id": "255",
      "center": [
        0,
        0
      ],
      "bounds": [
        -1.4,
        0,
        0,
        1.4
      ],
      "minZoom": 8,
      "maxZoom": 14,
      "defaultZoom": 10,
      "tileSize": 256,
      "tileUrl": "/assets/tiles/255/{z}/{x}_{y}.webp",
      "pointsUrl": "/data/maps/255.json",
      "maxNativeZoom": 13,
      "areas": null,
      "useNewMapEngine": true,
      "catalogGroups": [
        {
          "id": "group-1",
          "key": "group-1",
          "orderIndex": 1,
          "catalogs": [
            {
              "id": "10126",
              "key": "catalog-10126",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/08759193ea75990c2c9434aadf6734ce601ba19ecc5ae9efefad4a44ad1bd829.png",
              "iconSelectedUrl": "/assets/icons/5296301f22458274a604bf1f98450db6005f00dc0417983c3f8b1cb835fbe946.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10126"
            },
            {
              "id": "10130",
              "key": "catalog-10130",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/a840cde92f4945dd8e09a70cca70661fc42b7cbea0d51c3da3f5cf178de764a5.png",
              "iconSelectedUrl": "/assets/icons/76152dff039939c30c47f3bebec665caefd9f214c0af5886edff49e31c28dd4d.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": false,
              "name": "Category fixture 10130"
            },
            {
              "id": "10129",
              "key": "catalog-10129",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/7f4a7b7c4d52a4cb3e764bb616065a3fb18d63f925d44a5ba7ea8b1975a1e71e.png",
              "iconSelectedUrl": "/assets/icons/7f4a7b7c4d52a4cb3e764bb616065a3fb18d63f925d44a5ba7ea8b1975a1e71e.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10129"
            },
            {
              "id": "10131",
              "key": "catalog-10131",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/e13477d71cba9d0ffbf9dc41bb6a38dfbfbf613a39216960719aad5052e3420d.png",
              "iconSelectedUrl": "/assets/icons/e13477d71cba9d0ffbf9dc41bb6a38dfbfbf613a39216960719aad5052e3420d.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10131"
            },
            {
              "id": "10132",
              "key": "catalog-10132",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/ed7ac6794bc5b24f7df3af11d2398d9706bffd2f2304ad026be3c20ed3476a15.png",
              "iconSelectedUrl": "/assets/icons/9a45db04bfecfa33add7bf4b0508747f12ebe58fa67421ea5c31d5f047e38074.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10132"
            },
            {
              "id": "10133",
              "key": "catalog-10133",
              "orderIndex": 5,
              "iconUrl": "/assets/icons/23ef8b8fac87d54bc430e21ef0c04e797aa1ac1904262d8e25052ba245febe6b.png",
              "iconSelectedUrl": "/assets/icons/23ef8b8fac87d54bc430e21ef0c04e797aa1ac1904262d8e25052ba245febe6b.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10133"
            },
            {
              "id": "10134",
              "key": "catalog-10134",
              "orderIndex": 6,
              "iconUrl": "/assets/icons/2f421011040738597e8670990af5eecc22b64246371e42ec8fe9ba0abc023d58.png",
              "iconSelectedUrl": "/assets/icons/2f421011040738597e8670990af5eecc22b64246371e42ec8fe9ba0abc023d58.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10134"
            },
            {
              "id": "10135",
              "key": "catalog-10135",
              "orderIndex": 7,
              "iconUrl": "/assets/icons/b3aefc18da6e79a33b2e86f482b0336e6653565beb7afd113277b2f9991893f8.png",
              "iconSelectedUrl": "/assets/icons/4bc58374f18d9638758966c3a15399957443e94dedd3fccbd7963dce76a73903.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10135"
            }
          ],
          "name": "Group fixture group-1"
        },
        {
          "id": "group-2",
          "key": "group-2",
          "orderIndex": 2,
          "catalogs": [
            {
              "id": "10136",
              "key": "catalog-10136",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/9f37096e7550deb341bf45cccc7ea808bfb5480dc901edfbc870da46e1aac05c.png",
              "iconSelectedUrl": "/assets/icons/50a29d8161fde6cfe1ef907e282a4b92d782fc9c5277a5207471989c6be55a6b.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10136"
            },
            {
              "id": "10137",
              "key": "catalog-10137",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/86d05861516407f4c55057952d96e39144c80f72b54c52dd5fa3e55bc1e6f1cc.png",
              "iconSelectedUrl": "/assets/icons/08acebdaa987dd5677752af9e7bb64224b9c4a72eb4a47042077738f0ff94194.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10137"
            },
            {
              "id": "10138",
              "key": "catalog-10138",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/71b8b9d742aadf2781437cd68a25c668b7a134fb0b4625ee09a170932b7f4f0a.png",
              "iconSelectedUrl": "/assets/icons/3906bab3c587409c793a77f0c7aa3cac56bde47e1f6b5b121f8c49fa2591807a.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10138"
            },
            {
              "id": "10139",
              "key": "catalog-10139",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/e9a4ab479efc209a980ad99e88613d1f207ae1d4a0485ea222d0a316f1d7ddfb.png",
              "iconSelectedUrl": "/assets/icons/5ef6572a43a3d3b5c7adf659593250925d206055a2a7a591d48b1da8bbf92815.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10139"
            },
            {
              "id": "10273",
              "key": "catalog-10273",
              "orderIndex": 5,
              "iconUrl": "/assets/icons/4d427814e56f69d1f19d032a04cdbd1e2728bb3a3df07db2b1dfe406ba37660a.png",
              "iconSelectedUrl": "/assets/icons/34b6e752d302ddf60cd8aa1d6d6097b1da44b5a04bfbf53d74bd722406605fe8.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10273"
            }
          ],
          "name": "Group fixture group-2"
        },
        {
          "id": "group-3",
          "key": "group-3",
          "orderIndex": 3,
          "catalogs": [
            {
              "id": "10140",
              "key": "catalog-10140",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/87f3295cfcb6b5aade35e8555750cdf28641b19bde5636994e558e6891263489.png",
              "iconSelectedUrl": "/assets/icons/361e4cbeec45f4c0e1ff1f8d50b49e0a7941ebf8e140ae79994dca6e399ca549.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10140"
            },
            {
              "id": "10141",
              "key": "catalog-10141",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/80531c5357979d05b33e2f2fb8a4c4980e0f8d38caff8f69c7991652dca69b40.png",
              "iconSelectedUrl": "/assets/icons/b9502633cc4fe308533b0c511df37554f5ab6e3c7a808b8f36d5db7cedde5190.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10141"
            },
            {
              "id": "10142",
              "key": "catalog-10142",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/6999e0ee656edebe21189f2422cb263da391551a165669572295962f086b5012.png",
              "iconSelectedUrl": "/assets/icons/6999e0ee656edebe21189f2422cb263da391551a165669572295962f086b5012.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10142"
            },
            {
              "id": "10143",
              "key": "catalog-10143",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/84ab3b121638853ee389c3a902bfe255319eb7aabad4116e64ca371bbc3201cf.png",
              "iconSelectedUrl": "/assets/icons/84ab3b121638853ee389c3a902bfe255319eb7aabad4116e64ca371bbc3201cf.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10143"
            },
            {
              "id": "10144",
              "key": "catalog-10144",
              "orderIndex": 5,
              "iconUrl": "/assets/icons/aff2455bd0dbbac7358fe76608f967051cd1c11cc54e10372ca2c7772dda5a7a.png",
              "iconSelectedUrl": "/assets/icons/aff2455bd0dbbac7358fe76608f967051cd1c11cc54e10372ca2c7772dda5a7a.png",
              "defaultSelected": true,
              "count": 1,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10144"
            },
            {
              "id": "10146",
              "key": "catalog-10146",
              "orderIndex": 7,
              "iconUrl": "/assets/icons/3f4207a5b5a0a926fbdfab9bf1131fc58d8dec0f1be26127dcac5e6d7c2c28e9.png",
              "iconSelectedUrl": "/assets/icons/3f4207a5b5a0a926fbdfab9bf1131fc58d8dec0f1be26127dcac5e6d7c2c28e9.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10146"
            }
          ],
          "name": "Group fixture group-3"
        },
        {
          "id": "group-4",
          "key": "group-4",
          "orderIndex": 4,
          "catalogs": [
            {
              "id": "10147",
              "key": "catalog-10147",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/08d2b1509c28a190d1e08444aade065eb8c1eafff0a022d023c4ee562481f14f.png",
              "iconSelectedUrl": "/assets/icons/08d2b1509c28a190d1e08444aade065eb8c1eafff0a022d023c4ee562481f14f.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10147"
            },
            {
              "id": "10148",
              "key": "catalog-10148",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/46c9cabf695e005254a33a469fb87e5557cea60aa1b25f0eebbc17ae174b3ff9.png",
              "iconSelectedUrl": "/assets/icons/46c9cabf695e005254a33a469fb87e5557cea60aa1b25f0eebbc17ae174b3ff9.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10148"
            }
          ],
          "name": "Group fixture group-4"
        },
        {
          "id": "group-5",
          "key": "group-5",
          "orderIndex": 5,
          "catalogs": [
            {
              "id": "10149",
              "key": "catalog-10149",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/17f21515e302fcce650ac9289769fadff5717e05c15e2faa5d6f234b89657305.png",
              "iconSelectedUrl": "/assets/icons/17f21515e302fcce650ac9289769fadff5717e05c15e2faa5d6f234b89657305.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10149"
            },
            {
              "id": "10150",
              "key": "catalog-10150",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/3968bb886be8845f95115b9a80cb40efeb24694a7d97b946be28b37282bddc21.png",
              "iconSelectedUrl": "/assets/icons/3968bb886be8845f95115b9a80cb40efeb24694a7d97b946be28b37282bddc21.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10150"
            },
            {
              "id": "10151",
              "key": "catalog-10151",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/9d4c708b25b2661ecb16f774c317ccef834df20cf83c9bcd435a100d1ccfe4e9.png",
              "iconSelectedUrl": "/assets/icons/9d4c708b25b2661ecb16f774c317ccef834df20cf83c9bcd435a100d1ccfe4e9.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10151"
            },
            {
              "id": "10152",
              "key": "catalog-10152",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/401d348acad1438b20bc0a07322a59b06f7ef276da8fa2e3b19b1b4677e68271.png",
              "iconSelectedUrl": "/assets/icons/401d348acad1438b20bc0a07322a59b06f7ef276da8fa2e3b19b1b4677e68271.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10152"
            }
          ],
          "name": "Group fixture group-5"
        },
        {
          "id": "group-6",
          "key": "group-6",
          "orderIndex": 6,
          "catalogs": [
            {
              "id": "10153",
              "key": "catalog-10153",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/86456e20ee9fdc55c251496a71cf99e4efad8f5f93e1b4a8d9f71fe018366a07.png",
              "iconSelectedUrl": "/assets/icons/5a5655a0f4ba1efd664dac232c4942803d21835d4a8316a0ade575ba3bb7a661.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10153"
            },
            {
              "id": "10154",
              "key": "catalog-10154",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/3bd16e6b4cf5b660f9453f75d75bec028a9aa914cb4a0051044b8b80e8017c24.png",
              "iconSelectedUrl": "/assets/icons/3bd16e6b4cf5b660f9453f75d75bec028a9aa914cb4a0051044b8b80e8017c24.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10154"
            }
          ],
          "name": "Group fixture group-6"
        },
        {
          "id": "group-7",
          "key": "group-7",
          "orderIndex": 7,
          "catalogs": [
            {
              "id": "10155",
              "key": "catalog-10155",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/3c7e1eb0b6749234bb8e5073bc6c2bc7049ae19c10b653f7d1ea2a77d7441b55.png",
              "iconSelectedUrl": "/assets/icons/c4538683f94982639695ee19788c03fc1d5d70661e49d82cd1456b75cf1dfc18.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10155"
            },
            {
              "id": "10156",
              "key": "catalog-10156",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/59d8ab5f5f43a6d3b7efac70dd11f1d6ac48c6b6a1c5fd7bed514857f3943a1d.png",
              "iconSelectedUrl": "/assets/icons/8f30b546a7ae42a614a6156eba3062089866a3398156cdf5ee94234abb770605.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10156"
            },
            {
              "id": "10157",
              "key": "catalog-10157",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/4830c47a4c7bba2fe45a7313fc5ba41a13750ed6fcce02e9abadd78c935ca4d6.png",
              "iconSelectedUrl": "/assets/icons/4830c47a4c7bba2fe45a7313fc5ba41a13750ed6fcce02e9abadd78c935ca4d6.png",
              "defaultSelected": true,
              "count": 1,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10157"
            },
            {
              "id": "10158",
              "key": "catalog-10158",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/4edf14e077949f7a784e94c6964c504963283fedb9fbab003c8669555d8ef180.png",
              "iconSelectedUrl": "/assets/icons/4edf14e077949f7a784e94c6964c504963283fedb9fbab003c8669555d8ef180.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10158"
            }
          ],
          "name": "Group fixture group-7"
        },
        {
          "id": "group-8",
          "key": "group-8",
          "orderIndex": 8,
          "catalogs": [
            {
              "id": "10159",
              "key": "catalog-10159",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/69c5e3f6114d729d953d4500894c4bee585769b43ec0146a43692f2d993b8d72.png",
              "iconSelectedUrl": "/assets/icons/02977dd03d173a3d4fd6343d9e99558befd4531dcc08c0dc5b6e17ad89e29204.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10159"
            }
          ],
          "name": "Group fixture group-8"
        },
        {
          "id": "group-9",
          "key": "group-9",
          "orderIndex": 9,
          "catalogs": [
            {
              "id": "10160",
              "key": "catalog-10160",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/a0abc19b718835204b118674d6efa64d4d97ca518325e21e982ebcfdc033d3d3.png",
              "iconSelectedUrl": "/assets/icons/8ecdc39b9e19b863f9a58d53de81054c98e82c3bb304def4ec1b1ffcc5c519e3.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10160"
            },
            {
              "id": "10161",
              "key": "catalog-10161",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/425faf3e7d6d16655ba52e69174b089a62ac37612373191f2f77ba4173b9cd8c.png",
              "iconSelectedUrl": "/assets/icons/445d014b4a7b18d5bd26e2a5293b985b5764d4fbd9bbde7fec0040d55afd897b.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10161"
            },
            {
              "id": "10162",
              "key": "catalog-10162",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/ed197303b9f8b1a84829778a03e225b8ec028aa4a0d67f7a8bd2df1c2c4d1b06.png",
              "iconSelectedUrl": "/assets/icons/83890beefaceed3a8b224a476955f48a98ea9444e922bb4fd6a2a6326a200ef8.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10162"
            },
            {
              "id": "10163",
              "key": "catalog-10163",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/1c5c6e1439d0d8b8d684c19e0c692717a1eb3c32cc402233e46ad24888b2c792.png",
              "iconSelectedUrl": "/assets/icons/0a40a664984e8731706a490433ca9737869ff82c5532125c0ad7f6a9563a6fe4.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10163"
            }
          ],
          "name": "Group fixture group-9"
        }
      ],
      "defaultIconSize": 32,
      "landmarkNameColor": "#F3FFE1",
      "landmarkNameBackgroundColor": "#0F0B09",
      "siblingMapIds": "251,252,253,254,255,256,257,258",
      "mapName": "Mandate Encampment"
    },
    {
      "id": "256",
      "center": [
        0,
        0
      ],
      "bounds": [
        -1.4,
        0,
        0,
        1.4
      ],
      "minZoom": 8,
      "maxZoom": 14,
      "defaultZoom": 10,
      "tileSize": 256,
      "tileUrl": "/assets/tiles/256/{z}/{x}_{y}.webp",
      "pointsUrl": "/data/maps/256.json",
      "maxNativeZoom": 13,
      "areas": null,
      "useNewMapEngine": true,
      "catalogGroups": [
        {
          "id": "group-1",
          "key": "group-1",
          "orderIndex": 1,
          "catalogs": [
            {
              "id": "10165",
              "key": "catalog-10165",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/08759193ea75990c2c9434aadf6734ce601ba19ecc5ae9efefad4a44ad1bd829.png",
              "iconSelectedUrl": "/assets/icons/5296301f22458274a604bf1f98450db6005f00dc0417983c3f8b1cb835fbe946.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10165"
            },
            {
              "id": "10166",
              "key": "catalog-10166",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/a840cde92f4945dd8e09a70cca70661fc42b7cbea0d51c3da3f5cf178de764a5.png",
              "iconSelectedUrl": "/assets/icons/76152dff039939c30c47f3bebec665caefd9f214c0af5886edff49e31c28dd4d.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": false,
              "name": "Category fixture 10166"
            },
            {
              "id": "10167",
              "key": "catalog-10167",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/7f4a7b7c4d52a4cb3e764bb616065a3fb18d63f925d44a5ba7ea8b1975a1e71e.png",
              "iconSelectedUrl": "/assets/icons/7f4a7b7c4d52a4cb3e764bb616065a3fb18d63f925d44a5ba7ea8b1975a1e71e.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10167"
            },
            {
              "id": "10168",
              "key": "catalog-10168",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/e13477d71cba9d0ffbf9dc41bb6a38dfbfbf613a39216960719aad5052e3420d.png",
              "iconSelectedUrl": "/assets/icons/e13477d71cba9d0ffbf9dc41bb6a38dfbfbf613a39216960719aad5052e3420d.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10168"
            },
            {
              "id": "10169",
              "key": "catalog-10169",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/ed7ac6794bc5b24f7df3af11d2398d9706bffd2f2304ad026be3c20ed3476a15.png",
              "iconSelectedUrl": "/assets/icons/9a45db04bfecfa33add7bf4b0508747f12ebe58fa67421ea5c31d5f047e38074.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10169"
            },
            {
              "id": "10170",
              "key": "catalog-10170",
              "orderIndex": 5,
              "iconUrl": "/assets/icons/23ef8b8fac87d54bc430e21ef0c04e797aa1ac1904262d8e25052ba245febe6b.png",
              "iconSelectedUrl": "/assets/icons/23ef8b8fac87d54bc430e21ef0c04e797aa1ac1904262d8e25052ba245febe6b.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10170"
            },
            {
              "id": "10171",
              "key": "catalog-10171",
              "orderIndex": 6,
              "iconUrl": "/assets/icons/2f421011040738597e8670990af5eecc22b64246371e42ec8fe9ba0abc023d58.png",
              "iconSelectedUrl": "/assets/icons/2f421011040738597e8670990af5eecc22b64246371e42ec8fe9ba0abc023d58.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10171"
            },
            {
              "id": "10172",
              "key": "catalog-10172",
              "orderIndex": 7,
              "iconUrl": "/assets/icons/b3aefc18da6e79a33b2e86f482b0336e6653565beb7afd113277b2f9991893f8.png",
              "iconSelectedUrl": "/assets/icons/4bc58374f18d9638758966c3a15399957443e94dedd3fccbd7963dce76a73903.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10172"
            }
          ],
          "name": "Group fixture group-1"
        },
        {
          "id": "group-2",
          "key": "group-2",
          "orderIndex": 2,
          "catalogs": [
            {
              "id": "10173",
              "key": "catalog-10173",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/9f37096e7550deb341bf45cccc7ea808bfb5480dc901edfbc870da46e1aac05c.png",
              "iconSelectedUrl": "/assets/icons/50a29d8161fde6cfe1ef907e282a4b92d782fc9c5277a5207471989c6be55a6b.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10173"
            },
            {
              "id": "10174",
              "key": "catalog-10174",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/86d05861516407f4c55057952d96e39144c80f72b54c52dd5fa3e55bc1e6f1cc.png",
              "iconSelectedUrl": "/assets/icons/08acebdaa987dd5677752af9e7bb64224b9c4a72eb4a47042077738f0ff94194.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10174"
            },
            {
              "id": "10175",
              "key": "catalog-10175",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/71b8b9d742aadf2781437cd68a25c668b7a134fb0b4625ee09a170932b7f4f0a.png",
              "iconSelectedUrl": "/assets/icons/3906bab3c587409c793a77f0c7aa3cac56bde47e1f6b5b121f8c49fa2591807a.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10175"
            },
            {
              "id": "10176",
              "key": "catalog-10176",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/e9a4ab479efc209a980ad99e88613d1f207ae1d4a0485ea222d0a316f1d7ddfb.png",
              "iconSelectedUrl": "/assets/icons/5ef6572a43a3d3b5c7adf659593250925d206055a2a7a591d48b1da8bbf92815.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10176"
            },
            {
              "id": "10274",
              "key": "catalog-10274",
              "orderIndex": 5,
              "iconUrl": "/assets/icons/820707d44e0a962d67c157338f43651cc9f3cbd59197d9d5ec8edc2c82b38fac.png",
              "iconSelectedUrl": "/assets/icons/6ad1892dfb7aca74e2d25bd61d81544b144a356e0de25f9969a3077e269461b7.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10274"
            }
          ],
          "name": "Group fixture group-2"
        },
        {
          "id": "group-3",
          "key": "group-3",
          "orderIndex": 3,
          "catalogs": [
            {
              "id": "10177",
              "key": "catalog-10177",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/87f3295cfcb6b5aade35e8555750cdf28641b19bde5636994e558e6891263489.png",
              "iconSelectedUrl": "/assets/icons/361e4cbeec45f4c0e1ff1f8d50b49e0a7941ebf8e140ae79994dca6e399ca549.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10177"
            },
            {
              "id": "10178",
              "key": "catalog-10178",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/80531c5357979d05b33e2f2fb8a4c4980e0f8d38caff8f69c7991652dca69b40.png",
              "iconSelectedUrl": "/assets/icons/b9502633cc4fe308533b0c511df37554f5ab6e3c7a808b8f36d5db7cedde5190.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10178"
            },
            {
              "id": "10179",
              "key": "catalog-10179",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/6999e0ee656edebe21189f2422cb263da391551a165669572295962f086b5012.png",
              "iconSelectedUrl": "/assets/icons/6999e0ee656edebe21189f2422cb263da391551a165669572295962f086b5012.png",
              "defaultSelected": true,
              "count": 1,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10179"
            },
            {
              "id": "10180",
              "key": "catalog-10180",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/84ab3b121638853ee389c3a902bfe255319eb7aabad4116e64ca371bbc3201cf.png",
              "iconSelectedUrl": "/assets/icons/84ab3b121638853ee389c3a902bfe255319eb7aabad4116e64ca371bbc3201cf.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10180"
            },
            {
              "id": "10181",
              "key": "catalog-10181",
              "orderIndex": 5,
              "iconUrl": "/assets/icons/aff2455bd0dbbac7358fe76608f967051cd1c11cc54e10372ca2c7772dda5a7a.png",
              "iconSelectedUrl": "/assets/icons/aff2455bd0dbbac7358fe76608f967051cd1c11cc54e10372ca2c7772dda5a7a.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10181"
            },
            {
              "id": "10182",
              "key": "catalog-10182",
              "orderIndex": 6,
              "iconUrl": "/assets/icons/e564f1c54ddf9ffb4750f29b531f119061baa5acb1781e7b021f3e9147f1b36e.png",
              "iconSelectedUrl": "/assets/icons/e564f1c54ddf9ffb4750f29b531f119061baa5acb1781e7b021f3e9147f1b36e.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10182"
            },
            {
              "id": "10183",
              "key": "catalog-10183",
              "orderIndex": 7,
              "iconUrl": "/assets/icons/3f4207a5b5a0a926fbdfab9bf1131fc58d8dec0f1be26127dcac5e6d7c2c28e9.png",
              "iconSelectedUrl": "/assets/icons/3f4207a5b5a0a926fbdfab9bf1131fc58d8dec0f1be26127dcac5e6d7c2c28e9.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10183"
            }
          ],
          "name": "Group fixture group-3"
        },
        {
          "id": "group-4",
          "key": "group-4",
          "orderIndex": 4,
          "catalogs": [
            {
              "id": "10184",
              "key": "catalog-10184",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/08d2b1509c28a190d1e08444aade065eb8c1eafff0a022d023c4ee562481f14f.png",
              "iconSelectedUrl": "/assets/icons/08d2b1509c28a190d1e08444aade065eb8c1eafff0a022d023c4ee562481f14f.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10184"
            },
            {
              "id": "10185",
              "key": "catalog-10185",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/46c9cabf695e005254a33a469fb87e5557cea60aa1b25f0eebbc17ae174b3ff9.png",
              "iconSelectedUrl": "/assets/icons/46c9cabf695e005254a33a469fb87e5557cea60aa1b25f0eebbc17ae174b3ff9.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10185"
            }
          ],
          "name": "Group fixture group-4"
        },
        {
          "id": "group-5",
          "key": "group-5",
          "orderIndex": 5,
          "catalogs": [
            {
              "id": "10186",
              "key": "catalog-10186",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/17f21515e302fcce650ac9289769fadff5717e05c15e2faa5d6f234b89657305.png",
              "iconSelectedUrl": "/assets/icons/17f21515e302fcce650ac9289769fadff5717e05c15e2faa5d6f234b89657305.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10186"
            },
            {
              "id": "10187",
              "key": "catalog-10187",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/3968bb886be8845f95115b9a80cb40efeb24694a7d97b946be28b37282bddc21.png",
              "iconSelectedUrl": "/assets/icons/3968bb886be8845f95115b9a80cb40efeb24694a7d97b946be28b37282bddc21.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10187"
            },
            {
              "id": "10188",
              "key": "catalog-10188",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/9d4c708b25b2661ecb16f774c317ccef834df20cf83c9bcd435a100d1ccfe4e9.png",
              "iconSelectedUrl": "/assets/icons/9d4c708b25b2661ecb16f774c317ccef834df20cf83c9bcd435a100d1ccfe4e9.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10188"
            },
            {
              "id": "10189",
              "key": "catalog-10189",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/401d348acad1438b20bc0a07322a59b06f7ef276da8fa2e3b19b1b4677e68271.png",
              "iconSelectedUrl": "/assets/icons/401d348acad1438b20bc0a07322a59b06f7ef276da8fa2e3b19b1b4677e68271.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10189"
            }
          ],
          "name": "Group fixture group-5"
        },
        {
          "id": "group-6",
          "key": "group-6",
          "orderIndex": 6,
          "catalogs": [
            {
              "id": "10190",
              "key": "catalog-10190",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/86456e20ee9fdc55c251496a71cf99e4efad8f5f93e1b4a8d9f71fe018366a07.png",
              "iconSelectedUrl": "/assets/icons/5a5655a0f4ba1efd664dac232c4942803d21835d4a8316a0ade575ba3bb7a661.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10190"
            },
            {
              "id": "10191",
              "key": "catalog-10191",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/3bd16e6b4cf5b660f9453f75d75bec028a9aa914cb4a0051044b8b80e8017c24.png",
              "iconSelectedUrl": "/assets/icons/3bd16e6b4cf5b660f9453f75d75bec028a9aa914cb4a0051044b8b80e8017c24.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10191"
            }
          ],
          "name": "Group fixture group-6"
        },
        {
          "id": "group-7",
          "key": "group-7",
          "orderIndex": 7,
          "catalogs": [
            {
              "id": "10192",
              "key": "catalog-10192",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/3c7e1eb0b6749234bb8e5073bc6c2bc7049ae19c10b653f7d1ea2a77d7441b55.png",
              "iconSelectedUrl": "/assets/icons/c4538683f94982639695ee19788c03fc1d5d70661e49d82cd1456b75cf1dfc18.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10192"
            },
            {
              "id": "10193",
              "key": "catalog-10193",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/59d8ab5f5f43a6d3b7efac70dd11f1d6ac48c6b6a1c5fd7bed514857f3943a1d.png",
              "iconSelectedUrl": "/assets/icons/8f30b546a7ae42a614a6156eba3062089866a3398156cdf5ee94234abb770605.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10193"
            },
            {
              "id": "10194",
              "key": "catalog-10194",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/4830c47a4c7bba2fe45a7313fc5ba41a13750ed6fcce02e9abadd78c935ca4d6.png",
              "iconSelectedUrl": "/assets/icons/4830c47a4c7bba2fe45a7313fc5ba41a13750ed6fcce02e9abadd78c935ca4d6.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10194"
            },
            {
              "id": "10195",
              "key": "catalog-10195",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/4edf14e077949f7a784e94c6964c504963283fedb9fbab003c8669555d8ef180.png",
              "iconSelectedUrl": "/assets/icons/4edf14e077949f7a784e94c6964c504963283fedb9fbab003c8669555d8ef180.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10195"
            }
          ],
          "name": "Group fixture group-7"
        },
        {
          "id": "group-8",
          "key": "group-8",
          "orderIndex": 8,
          "catalogs": [
            {
              "id": "10196",
              "key": "catalog-10196",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/69c5e3f6114d729d953d4500894c4bee585769b43ec0146a43692f2d993b8d72.png",
              "iconSelectedUrl": "/assets/icons/02977dd03d173a3d4fd6343d9e99558befd4531dcc08c0dc5b6e17ad89e29204.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10196"
            }
          ],
          "name": "Group fixture group-8"
        },
        {
          "id": "group-9",
          "key": "group-9",
          "orderIndex": 9,
          "catalogs": [
            {
              "id": "10197",
              "key": "catalog-10197",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/a0abc19b718835204b118674d6efa64d4d97ca518325e21e982ebcfdc033d3d3.png",
              "iconSelectedUrl": "/assets/icons/8ecdc39b9e19b863f9a58d53de81054c98e82c3bb304def4ec1b1ffcc5c519e3.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10197"
            },
            {
              "id": "10198",
              "key": "catalog-10198",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/425faf3e7d6d16655ba52e69174b089a62ac37612373191f2f77ba4173b9cd8c.png",
              "iconSelectedUrl": "/assets/icons/445d014b4a7b18d5bd26e2a5293b985b5764d4fbd9bbde7fec0040d55afd897b.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10198"
            },
            {
              "id": "10199",
              "key": "catalog-10199",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/ed197303b9f8b1a84829778a03e225b8ec028aa4a0d67f7a8bd2df1c2c4d1b06.png",
              "iconSelectedUrl": "/assets/icons/83890beefaceed3a8b224a476955f48a98ea9444e922bb4fd6a2a6326a200ef8.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10199"
            },
            {
              "id": "10200",
              "key": "catalog-10200",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/1c5c6e1439d0d8b8d684c19e0c692717a1eb3c32cc402233e46ad24888b2c792.png",
              "iconSelectedUrl": "/assets/icons/0a40a664984e8731706a490433ca9737869ff82c5532125c0ad7f6a9563a6fe4.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10200"
            }
          ],
          "name": "Group fixture group-9"
        }
      ],
      "defaultIconSize": 32,
      "landmarkNameColor": "#F3FFE1",
      "landmarkNameBackgroundColor": "#0F0B09",
      "siblingMapIds": "251,252,253,254,255,256,257,258",
      "mapName": "Meigu Lake"
    },
    {
      "id": "257",
      "center": [
        0,
        0
      ],
      "bounds": [
        -1.4,
        0,
        0,
        1.4
      ],
      "minZoom": 8,
      "maxZoom": 13,
      "defaultZoom": 10,
      "tileSize": 256,
      "tileUrl": "/assets/tiles/257/{z}/{x}_{y}.webp",
      "pointsUrl": "/data/maps/257.json",
      "areas": null,
      "useNewMapEngine": true,
      "catalogGroups": [
        {
          "id": "group-1",
          "key": "group-1",
          "orderIndex": 1,
          "catalogs": [
            {
              "id": "10201",
              "key": "catalog-10201",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/08759193ea75990c2c9434aadf6734ce601ba19ecc5ae9efefad4a44ad1bd829.png",
              "iconSelectedUrl": "/assets/icons/5296301f22458274a604bf1f98450db6005f00dc0417983c3f8b1cb835fbe946.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10201"
            },
            {
              "id": "10202",
              "key": "catalog-10202",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/a840cde92f4945dd8e09a70cca70661fc42b7cbea0d51c3da3f5cf178de764a5.png",
              "iconSelectedUrl": "/assets/icons/76152dff039939c30c47f3bebec665caefd9f214c0af5886edff49e31c28dd4d.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": false,
              "name": "Category fixture 10202"
            },
            {
              "id": "10203",
              "key": "catalog-10203",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/7f4a7b7c4d52a4cb3e764bb616065a3fb18d63f925d44a5ba7ea8b1975a1e71e.png",
              "iconSelectedUrl": "/assets/icons/7f4a7b7c4d52a4cb3e764bb616065a3fb18d63f925d44a5ba7ea8b1975a1e71e.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10203"
            },
            {
              "id": "10204",
              "key": "catalog-10204",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/e13477d71cba9d0ffbf9dc41bb6a38dfbfbf613a39216960719aad5052e3420d.png",
              "iconSelectedUrl": "/assets/icons/e13477d71cba9d0ffbf9dc41bb6a38dfbfbf613a39216960719aad5052e3420d.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10204"
            },
            {
              "id": "10205",
              "key": "catalog-10205",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/ed7ac6794bc5b24f7df3af11d2398d9706bffd2f2304ad026be3c20ed3476a15.png",
              "iconSelectedUrl": "/assets/icons/9a45db04bfecfa33add7bf4b0508747f12ebe58fa67421ea5c31d5f047e38074.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10205"
            },
            {
              "id": "10206",
              "key": "catalog-10206",
              "orderIndex": 5,
              "iconUrl": "/assets/icons/23ef8b8fac87d54bc430e21ef0c04e797aa1ac1904262d8e25052ba245febe6b.png",
              "iconSelectedUrl": "/assets/icons/23ef8b8fac87d54bc430e21ef0c04e797aa1ac1904262d8e25052ba245febe6b.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10206"
            },
            {
              "id": "10207",
              "key": "catalog-10207",
              "orderIndex": 6,
              "iconUrl": "/assets/icons/2f421011040738597e8670990af5eecc22b64246371e42ec8fe9ba0abc023d58.png",
              "iconSelectedUrl": "/assets/icons/2f421011040738597e8670990af5eecc22b64246371e42ec8fe9ba0abc023d58.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10207"
            },
            {
              "id": "10208",
              "key": "catalog-10208",
              "orderIndex": 7,
              "iconUrl": "/assets/icons/b3aefc18da6e79a33b2e86f482b0336e6653565beb7afd113277b2f9991893f8.png",
              "iconSelectedUrl": "/assets/icons/4bc58374f18d9638758966c3a15399957443e94dedd3fccbd7963dce76a73903.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10208"
            }
          ],
          "name": "Group fixture group-1"
        },
        {
          "id": "group-2",
          "key": "group-2",
          "orderIndex": 2,
          "catalogs": [
            {
              "id": "10209",
              "key": "catalog-10209",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/9f37096e7550deb341bf45cccc7ea808bfb5480dc901edfbc870da46e1aac05c.png",
              "iconSelectedUrl": "/assets/icons/50a29d8161fde6cfe1ef907e282a4b92d782fc9c5277a5207471989c6be55a6b.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10209"
            },
            {
              "id": "10210",
              "key": "catalog-10210",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/86d05861516407f4c55057952d96e39144c80f72b54c52dd5fa3e55bc1e6f1cc.png",
              "iconSelectedUrl": "/assets/icons/08acebdaa987dd5677752af9e7bb64224b9c4a72eb4a47042077738f0ff94194.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10210"
            },
            {
              "id": "10211",
              "key": "catalog-10211",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/71b8b9d742aadf2781437cd68a25c668b7a134fb0b4625ee09a170932b7f4f0a.png",
              "iconSelectedUrl": "/assets/icons/3906bab3c587409c793a77f0c7aa3cac56bde47e1f6b5b121f8c49fa2591807a.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10211"
            },
            {
              "id": "10212",
              "key": "catalog-10212",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/e9a4ab479efc209a980ad99e88613d1f207ae1d4a0485ea222d0a316f1d7ddfb.png",
              "iconSelectedUrl": "/assets/icons/5ef6572a43a3d3b5c7adf659593250925d206055a2a7a591d48b1da8bbf92815.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10212"
            },
            {
              "id": "10275",
              "key": "catalog-10275",
              "orderIndex": 5,
              "iconUrl": "/assets/icons/eccf9966781d17a32266dca1d6df4695e1597b63a17f55bb7e669a197f681817.png",
              "iconSelectedUrl": "/assets/icons/637cc38e0ec749fd7cd66fcaa62db6cc1855840bd57af178053c81d4da3ae18b.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10275"
            }
          ],
          "name": "Group fixture group-2"
        },
        {
          "id": "group-3",
          "key": "group-3",
          "orderIndex": 3,
          "catalogs": [
            {
              "id": "10213",
              "key": "catalog-10213",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/87f3295cfcb6b5aade35e8555750cdf28641b19bde5636994e558e6891263489.png",
              "iconSelectedUrl": "/assets/icons/361e4cbeec45f4c0e1ff1f8d50b49e0a7941ebf8e140ae79994dca6e399ca549.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10213"
            },
            {
              "id": "10214",
              "key": "catalog-10214",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/80531c5357979d05b33e2f2fb8a4c4980e0f8d38caff8f69c7991652dca69b40.png",
              "iconSelectedUrl": "/assets/icons/b9502633cc4fe308533b0c511df37554f5ab6e3c7a808b8f36d5db7cedde5190.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10214"
            },
            {
              "id": "10215",
              "key": "catalog-10215",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/6999e0ee656edebe21189f2422cb263da391551a165669572295962f086b5012.png",
              "iconSelectedUrl": "/assets/icons/6999e0ee656edebe21189f2422cb263da391551a165669572295962f086b5012.png",
              "defaultSelected": true,
              "count": 1,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10215"
            },
            {
              "id": "10216",
              "key": "catalog-10216",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/84ab3b121638853ee389c3a902bfe255319eb7aabad4116e64ca371bbc3201cf.png",
              "iconSelectedUrl": "/assets/icons/84ab3b121638853ee389c3a902bfe255319eb7aabad4116e64ca371bbc3201cf.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10216"
            },
            {
              "id": "10217",
              "key": "catalog-10217",
              "orderIndex": 5,
              "iconUrl": "/assets/icons/aff2455bd0dbbac7358fe76608f967051cd1c11cc54e10372ca2c7772dda5a7a.png",
              "iconSelectedUrl": "/assets/icons/aff2455bd0dbbac7358fe76608f967051cd1c11cc54e10372ca2c7772dda5a7a.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10217"
            },
            {
              "id": "10218",
              "key": "catalog-10218",
              "orderIndex": 6,
              "iconUrl": "/assets/icons/e564f1c54ddf9ffb4750f29b531f119061baa5acb1781e7b021f3e9147f1b36e.png",
              "iconSelectedUrl": "/assets/icons/e564f1c54ddf9ffb4750f29b531f119061baa5acb1781e7b021f3e9147f1b36e.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10218"
            },
            {
              "id": "10219",
              "key": "catalog-10219",
              "orderIndex": 7,
              "iconUrl": "/assets/icons/3f4207a5b5a0a926fbdfab9bf1131fc58d8dec0f1be26127dcac5e6d7c2c28e9.png",
              "iconSelectedUrl": "/assets/icons/3f4207a5b5a0a926fbdfab9bf1131fc58d8dec0f1be26127dcac5e6d7c2c28e9.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10219"
            }
          ],
          "name": "Group fixture group-3"
        },
        {
          "id": "group-4",
          "key": "group-4",
          "orderIndex": 4,
          "catalogs": [
            {
              "id": "10220",
              "key": "catalog-10220",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/08d2b1509c28a190d1e08444aade065eb8c1eafff0a022d023c4ee562481f14f.png",
              "iconSelectedUrl": "/assets/icons/08d2b1509c28a190d1e08444aade065eb8c1eafff0a022d023c4ee562481f14f.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10220"
            },
            {
              "id": "10221",
              "key": "catalog-10221",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/46c9cabf695e005254a33a469fb87e5557cea60aa1b25f0eebbc17ae174b3ff9.png",
              "iconSelectedUrl": "/assets/icons/46c9cabf695e005254a33a469fb87e5557cea60aa1b25f0eebbc17ae174b3ff9.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10221"
            }
          ],
          "name": "Group fixture group-4"
        },
        {
          "id": "group-5",
          "key": "group-5",
          "orderIndex": 5,
          "catalogs": [
            {
              "id": "10222",
              "key": "catalog-10222",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/17f21515e302fcce650ac9289769fadff5717e05c15e2faa5d6f234b89657305.png",
              "iconSelectedUrl": "/assets/icons/17f21515e302fcce650ac9289769fadff5717e05c15e2faa5d6f234b89657305.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10222"
            },
            {
              "id": "10223",
              "key": "catalog-10223",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/3968bb886be8845f95115b9a80cb40efeb24694a7d97b946be28b37282bddc21.png",
              "iconSelectedUrl": "/assets/icons/3968bb886be8845f95115b9a80cb40efeb24694a7d97b946be28b37282bddc21.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10223"
            },
            {
              "id": "10224",
              "key": "catalog-10224",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/9d4c708b25b2661ecb16f774c317ccef834df20cf83c9bcd435a100d1ccfe4e9.png",
              "iconSelectedUrl": "/assets/icons/9d4c708b25b2661ecb16f774c317ccef834df20cf83c9bcd435a100d1ccfe4e9.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10224"
            },
            {
              "id": "10225",
              "key": "catalog-10225",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/401d348acad1438b20bc0a07322a59b06f7ef276da8fa2e3b19b1b4677e68271.png",
              "iconSelectedUrl": "/assets/icons/401d348acad1438b20bc0a07322a59b06f7ef276da8fa2e3b19b1b4677e68271.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10225"
            }
          ],
          "name": "Group fixture group-5"
        },
        {
          "id": "group-6",
          "key": "group-6",
          "orderIndex": 6,
          "catalogs": [
            {
              "id": "10226",
              "key": "catalog-10226",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/86456e20ee9fdc55c251496a71cf99e4efad8f5f93e1b4a8d9f71fe018366a07.png",
              "iconSelectedUrl": "/assets/icons/5a5655a0f4ba1efd664dac232c4942803d21835d4a8316a0ade575ba3bb7a661.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10226"
            },
            {
              "id": "10227",
              "key": "catalog-10227",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/3bd16e6b4cf5b660f9453f75d75bec028a9aa914cb4a0051044b8b80e8017c24.png",
              "iconSelectedUrl": "/assets/icons/3bd16e6b4cf5b660f9453f75d75bec028a9aa914cb4a0051044b8b80e8017c24.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10227"
            }
          ],
          "name": "Group fixture group-6"
        },
        {
          "id": "group-7",
          "key": "group-7",
          "orderIndex": 7,
          "catalogs": [
            {
              "id": "10228",
              "key": "catalog-10228",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/3c7e1eb0b6749234bb8e5073bc6c2bc7049ae19c10b653f7d1ea2a77d7441b55.png",
              "iconSelectedUrl": "/assets/icons/c4538683f94982639695ee19788c03fc1d5d70661e49d82cd1456b75cf1dfc18.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10228"
            },
            {
              "id": "10229",
              "key": "catalog-10229",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/59d8ab5f5f43a6d3b7efac70dd11f1d6ac48c6b6a1c5fd7bed514857f3943a1d.png",
              "iconSelectedUrl": "/assets/icons/8f30b546a7ae42a614a6156eba3062089866a3398156cdf5ee94234abb770605.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10229"
            },
            {
              "id": "10230",
              "key": "catalog-10230",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/4830c47a4c7bba2fe45a7313fc5ba41a13750ed6fcce02e9abadd78c935ca4d6.png",
              "iconSelectedUrl": "/assets/icons/4830c47a4c7bba2fe45a7313fc5ba41a13750ed6fcce02e9abadd78c935ca4d6.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10230"
            },
            {
              "id": "10231",
              "key": "catalog-10231",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/4edf14e077949f7a784e94c6964c504963283fedb9fbab003c8669555d8ef180.png",
              "iconSelectedUrl": "/assets/icons/4edf14e077949f7a784e94c6964c504963283fedb9fbab003c8669555d8ef180.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10231"
            }
          ],
          "name": "Group fixture group-7"
        },
        {
          "id": "group-8",
          "key": "group-8",
          "orderIndex": 8,
          "catalogs": [
            {
              "id": "10232",
              "key": "catalog-10232",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/69c5e3f6114d729d953d4500894c4bee585769b43ec0146a43692f2d993b8d72.png",
              "iconSelectedUrl": "/assets/icons/02977dd03d173a3d4fd6343d9e99558befd4531dcc08c0dc5b6e17ad89e29204.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10232"
            }
          ],
          "name": "Group fixture group-8"
        },
        {
          "id": "group-9",
          "key": "group-9",
          "orderIndex": 9,
          "catalogs": [
            {
              "id": "10233",
              "key": "catalog-10233",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/a0abc19b718835204b118674d6efa64d4d97ca518325e21e982ebcfdc033d3d3.png",
              "iconSelectedUrl": "/assets/icons/8ecdc39b9e19b863f9a58d53de81054c98e82c3bb304def4ec1b1ffcc5c519e3.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10233"
            },
            {
              "id": "10234",
              "key": "catalog-10234",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/425faf3e7d6d16655ba52e69174b089a62ac37612373191f2f77ba4173b9cd8c.png",
              "iconSelectedUrl": "/assets/icons/445d014b4a7b18d5bd26e2a5293b985b5764d4fbd9bbde7fec0040d55afd897b.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10234"
            },
            {
              "id": "10235",
              "key": "catalog-10235",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/ed197303b9f8b1a84829778a03e225b8ec028aa4a0d67f7a8bd2df1c2c4d1b06.png",
              "iconSelectedUrl": "/assets/icons/83890beefaceed3a8b224a476955f48a98ea9444e922bb4fd6a2a6326a200ef8.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10235"
            },
            {
              "id": "10236",
              "key": "catalog-10236",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/1c5c6e1439d0d8b8d684c19e0c692717a1eb3c32cc402233e46ad24888b2c792.png",
              "iconSelectedUrl": "/assets/icons/0a40a664984e8731706a490433ca9737869ff82c5532125c0ad7f6a9563a6fe4.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10236"
            }
          ],
          "name": "Group fixture group-9"
        }
      ],
      "defaultIconSize": 32,
      "landmarkNameColor": "#F3FFE1",
      "landmarkNameBackgroundColor": "#0F0B09",
      "siblingMapIds": "251,252,253,254,255,256,257,258",
      "mapName": "Mountain of Imprisonment"
    },
    {
      "id": "258",
      "center": [
        0,
        0
      ],
      "bounds": [
        -1.4,
        0,
        0,
        1.4
      ],
      "minZoom": 8,
      "maxZoom": 13,
      "defaultZoom": 10,
      "tileSize": 256,
      "tileUrl": "/assets/tiles/258/{z}/{x}_{y}.webp",
      "pointsUrl": "/data/maps/258.json",
      "areas": null,
      "useNewMapEngine": true,
      "catalogGroups": [
        {
          "id": "group-1",
          "key": "group-1",
          "orderIndex": 1,
          "catalogs": [
            {
              "id": "10237",
              "key": "catalog-10237",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/08759193ea75990c2c9434aadf6734ce601ba19ecc5ae9efefad4a44ad1bd829.png",
              "iconSelectedUrl": "/assets/icons/5296301f22458274a604bf1f98450db6005f00dc0417983c3f8b1cb835fbe946.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10237"
            },
            {
              "id": "10238",
              "key": "catalog-10238",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/a840cde92f4945dd8e09a70cca70661fc42b7cbea0d51c3da3f5cf178de764a5.png",
              "iconSelectedUrl": "/assets/icons/76152dff039939c30c47f3bebec665caefd9f214c0af5886edff49e31c28dd4d.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": false,
              "name": "Category fixture 10238"
            },
            {
              "id": "10239",
              "key": "catalog-10239",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/7f4a7b7c4d52a4cb3e764bb616065a3fb18d63f925d44a5ba7ea8b1975a1e71e.png",
              "iconSelectedUrl": "/assets/icons/7f4a7b7c4d52a4cb3e764bb616065a3fb18d63f925d44a5ba7ea8b1975a1e71e.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10239"
            },
            {
              "id": "10240",
              "key": "catalog-10240",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/e13477d71cba9d0ffbf9dc41bb6a38dfbfbf613a39216960719aad5052e3420d.png",
              "iconSelectedUrl": "/assets/icons/e13477d71cba9d0ffbf9dc41bb6a38dfbfbf613a39216960719aad5052e3420d.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10240"
            },
            {
              "id": "10241",
              "key": "catalog-10241",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/ed7ac6794bc5b24f7df3af11d2398d9706bffd2f2304ad026be3c20ed3476a15.png",
              "iconSelectedUrl": "/assets/icons/9a45db04bfecfa33add7bf4b0508747f12ebe58fa67421ea5c31d5f047e38074.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10241"
            },
            {
              "id": "10242",
              "key": "catalog-10242",
              "orderIndex": 5,
              "iconUrl": "/assets/icons/23ef8b8fac87d54bc430e21ef0c04e797aa1ac1904262d8e25052ba245febe6b.png",
              "iconSelectedUrl": "/assets/icons/23ef8b8fac87d54bc430e21ef0c04e797aa1ac1904262d8e25052ba245febe6b.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10242"
            },
            {
              "id": "10243",
              "key": "catalog-10243",
              "orderIndex": 6,
              "iconUrl": "/assets/icons/2f421011040738597e8670990af5eecc22b64246371e42ec8fe9ba0abc023d58.png",
              "iconSelectedUrl": "/assets/icons/2f421011040738597e8670990af5eecc22b64246371e42ec8fe9ba0abc023d58.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10243"
            },
            {
              "id": "10244",
              "key": "catalog-10244",
              "orderIndex": 7,
              "iconUrl": "/assets/icons/b3aefc18da6e79a33b2e86f482b0336e6653565beb7afd113277b2f9991893f8.png",
              "iconSelectedUrl": "/assets/icons/4bc58374f18d9638758966c3a15399957443e94dedd3fccbd7963dce76a73903.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10244"
            }
          ],
          "name": "Group fixture group-1"
        },
        {
          "id": "group-2",
          "key": "group-2",
          "orderIndex": 2,
          "catalogs": [
            {
              "id": "10245",
              "key": "catalog-10245",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/9f37096e7550deb341bf45cccc7ea808bfb5480dc901edfbc870da46e1aac05c.png",
              "iconSelectedUrl": "/assets/icons/50a29d8161fde6cfe1ef907e282a4b92d782fc9c5277a5207471989c6be55a6b.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10245"
            },
            {
              "id": "10246",
              "key": "catalog-10246",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/86d05861516407f4c55057952d96e39144c80f72b54c52dd5fa3e55bc1e6f1cc.png",
              "iconSelectedUrl": "/assets/icons/08acebdaa987dd5677752af9e7bb64224b9c4a72eb4a47042077738f0ff94194.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10246"
            },
            {
              "id": "10247",
              "key": "catalog-10247",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/71b8b9d742aadf2781437cd68a25c668b7a134fb0b4625ee09a170932b7f4f0a.png",
              "iconSelectedUrl": "/assets/icons/3906bab3c587409c793a77f0c7aa3cac56bde47e1f6b5b121f8c49fa2591807a.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10247"
            },
            {
              "id": "10248",
              "key": "catalog-10248",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/e9a4ab479efc209a980ad99e88613d1f207ae1d4a0485ea222d0a316f1d7ddfb.png",
              "iconSelectedUrl": "/assets/icons/5ef6572a43a3d3b5c7adf659593250925d206055a2a7a591d48b1da8bbf92815.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10248"
            },
            {
              "id": "10276",
              "key": "catalog-10276",
              "orderIndex": 5,
              "iconUrl": "/assets/icons/adc0ddc3abe6801e63f2f39d765a8f21be4bac2b04a39090a2492dcc13cbcc79.png",
              "iconSelectedUrl": "/assets/icons/774a5ee69dc97f1e9664523f33cd9fb94400c8fe551fd8f1c10cb7dd419dca44.png",
              "defaultSelected": true,
              "count": 1,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10276"
            }
          ],
          "name": "Group fixture group-2"
        },
        {
          "id": "group-3",
          "key": "group-3",
          "orderIndex": 3,
          "catalogs": [
            {
              "id": "10249",
              "key": "catalog-10249",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/87f3295cfcb6b5aade35e8555750cdf28641b19bde5636994e558e6891263489.png",
              "iconSelectedUrl": "/assets/icons/361e4cbeec45f4c0e1ff1f8d50b49e0a7941ebf8e140ae79994dca6e399ca549.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10249"
            },
            {
              "id": "10250",
              "key": "catalog-10250",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/80531c5357979d05b33e2f2fb8a4c4980e0f8d38caff8f69c7991652dca69b40.png",
              "iconSelectedUrl": "/assets/icons/b9502633cc4fe308533b0c511df37554f5ab6e3c7a808b8f36d5db7cedde5190.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10250"
            },
            {
              "id": "10251",
              "key": "catalog-10251",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/6999e0ee656edebe21189f2422cb263da391551a165669572295962f086b5012.png",
              "iconSelectedUrl": "/assets/icons/6999e0ee656edebe21189f2422cb263da391551a165669572295962f086b5012.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10251"
            },
            {
              "id": "10252",
              "key": "catalog-10252",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/84ab3b121638853ee389c3a902bfe255319eb7aabad4116e64ca371bbc3201cf.png",
              "iconSelectedUrl": "/assets/icons/84ab3b121638853ee389c3a902bfe255319eb7aabad4116e64ca371bbc3201cf.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10252"
            },
            {
              "id": "10253",
              "key": "catalog-10253",
              "orderIndex": 5,
              "iconUrl": "/assets/icons/aff2455bd0dbbac7358fe76608f967051cd1c11cc54e10372ca2c7772dda5a7a.png",
              "iconSelectedUrl": "/assets/icons/aff2455bd0dbbac7358fe76608f967051cd1c11cc54e10372ca2c7772dda5a7a.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10253"
            },
            {
              "id": "10254",
              "key": "catalog-10254",
              "orderIndex": 6,
              "iconUrl": "/assets/icons/e564f1c54ddf9ffb4750f29b531f119061baa5acb1781e7b021f3e9147f1b36e.png",
              "iconSelectedUrl": "/assets/icons/e564f1c54ddf9ffb4750f29b531f119061baa5acb1781e7b021f3e9147f1b36e.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10254"
            },
            {
              "id": "10255",
              "key": "catalog-10255",
              "orderIndex": 7,
              "iconUrl": "/assets/icons/3f4207a5b5a0a926fbdfab9bf1131fc58d8dec0f1be26127dcac5e6d7c2c28e9.png",
              "iconSelectedUrl": "/assets/icons/3f4207a5b5a0a926fbdfab9bf1131fc58d8dec0f1be26127dcac5e6d7c2c28e9.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10255"
            }
          ],
          "name": "Group fixture group-3"
        },
        {
          "id": "group-4",
          "key": "group-4",
          "orderIndex": 4,
          "catalogs": [
            {
              "id": "10256",
              "key": "catalog-10256",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/08d2b1509c28a190d1e08444aade065eb8c1eafff0a022d023c4ee562481f14f.png",
              "iconSelectedUrl": "/assets/icons/08d2b1509c28a190d1e08444aade065eb8c1eafff0a022d023c4ee562481f14f.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10256"
            },
            {
              "id": "10257",
              "key": "catalog-10257",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/46c9cabf695e005254a33a469fb87e5557cea60aa1b25f0eebbc17ae174b3ff9.png",
              "iconSelectedUrl": "/assets/icons/46c9cabf695e005254a33a469fb87e5557cea60aa1b25f0eebbc17ae174b3ff9.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10257"
            }
          ],
          "name": "Group fixture group-4"
        },
        {
          "id": "group-5",
          "key": "group-5",
          "orderIndex": 5,
          "catalogs": [
            {
              "id": "10258",
              "key": "catalog-10258",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/17f21515e302fcce650ac9289769fadff5717e05c15e2faa5d6f234b89657305.png",
              "iconSelectedUrl": "/assets/icons/17f21515e302fcce650ac9289769fadff5717e05c15e2faa5d6f234b89657305.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10258"
            },
            {
              "id": "10259",
              "key": "catalog-10259",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/3968bb886be8845f95115b9a80cb40efeb24694a7d97b946be28b37282bddc21.png",
              "iconSelectedUrl": "/assets/icons/3968bb886be8845f95115b9a80cb40efeb24694a7d97b946be28b37282bddc21.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10259"
            },
            {
              "id": "10260",
              "key": "catalog-10260",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/9d4c708b25b2661ecb16f774c317ccef834df20cf83c9bcd435a100d1ccfe4e9.png",
              "iconSelectedUrl": "/assets/icons/9d4c708b25b2661ecb16f774c317ccef834df20cf83c9bcd435a100d1ccfe4e9.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10260"
            },
            {
              "id": "10261",
              "key": "catalog-10261",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/401d348acad1438b20bc0a07322a59b06f7ef276da8fa2e3b19b1b4677e68271.png",
              "iconSelectedUrl": "/assets/icons/401d348acad1438b20bc0a07322a59b06f7ef276da8fa2e3b19b1b4677e68271.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10261"
            }
          ],
          "name": "Group fixture group-5"
        },
        {
          "id": "group-6",
          "key": "group-6",
          "orderIndex": 6,
          "catalogs": [
            {
              "id": "10262",
              "key": "catalog-10262",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/86456e20ee9fdc55c251496a71cf99e4efad8f5f93e1b4a8d9f71fe018366a07.png",
              "iconSelectedUrl": "/assets/icons/5a5655a0f4ba1efd664dac232c4942803d21835d4a8316a0ade575ba3bb7a661.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10262"
            },
            {
              "id": "10263",
              "key": "catalog-10263",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/3bd16e6b4cf5b660f9453f75d75bec028a9aa914cb4a0051044b8b80e8017c24.png",
              "iconSelectedUrl": "/assets/icons/3bd16e6b4cf5b660f9453f75d75bec028a9aa914cb4a0051044b8b80e8017c24.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10263"
            }
          ],
          "name": "Group fixture group-6"
        },
        {
          "id": "group-7",
          "key": "group-7",
          "orderIndex": 7,
          "catalogs": [
            {
              "id": "10264",
              "key": "catalog-10264",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/3c7e1eb0b6749234bb8e5073bc6c2bc7049ae19c10b653f7d1ea2a77d7441b55.png",
              "iconSelectedUrl": "/assets/icons/c4538683f94982639695ee19788c03fc1d5d70661e49d82cd1456b75cf1dfc18.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10264"
            },
            {
              "id": "10265",
              "key": "catalog-10265",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/59d8ab5f5f43a6d3b7efac70dd11f1d6ac48c6b6a1c5fd7bed514857f3943a1d.png",
              "iconSelectedUrl": "/assets/icons/8f30b546a7ae42a614a6156eba3062089866a3398156cdf5ee94234abb770605.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10265"
            },
            {
              "id": "10266",
              "key": "catalog-10266",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/4830c47a4c7bba2fe45a7313fc5ba41a13750ed6fcce02e9abadd78c935ca4d6.png",
              "iconSelectedUrl": "/assets/icons/4830c47a4c7bba2fe45a7313fc5ba41a13750ed6fcce02e9abadd78c935ca4d6.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10266"
            },
            {
              "id": "10267",
              "key": "catalog-10267",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/4edf14e077949f7a784e94c6964c504963283fedb9fbab003c8669555d8ef180.png",
              "iconSelectedUrl": "/assets/icons/4edf14e077949f7a784e94c6964c504963283fedb9fbab003c8669555d8ef180.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10267"
            }
          ],
          "name": "Group fixture group-7"
        },
        {
          "id": "group-8",
          "key": "group-8",
          "orderIndex": 8,
          "catalogs": [
            {
              "id": "10268",
              "key": "catalog-10268",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/69c5e3f6114d729d953d4500894c4bee585769b43ec0146a43692f2d993b8d72.png",
              "iconSelectedUrl": "/assets/icons/02977dd03d173a3d4fd6343d9e99558befd4531dcc08c0dc5b6e17ad89e29204.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10268"
            }
          ],
          "name": "Group fixture group-8"
        },
        {
          "id": "group-9",
          "key": "group-9",
          "orderIndex": 9,
          "catalogs": [
            {
              "id": "10269",
              "key": "catalog-10269",
              "orderIndex": 1,
              "iconUrl": "/assets/icons/a0abc19b718835204b118674d6efa64d4d97ca518325e21e982ebcfdc033d3d3.png",
              "iconSelectedUrl": "/assets/icons/8ecdc39b9e19b863f9a58d53de81054c98e82c3bb304def4ec1b1ffcc5c519e3.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10269"
            },
            {
              "id": "10270",
              "key": "catalog-10270",
              "orderIndex": 2,
              "iconUrl": "/assets/icons/425faf3e7d6d16655ba52e69174b089a62ac37612373191f2f77ba4173b9cd8c.png",
              "iconSelectedUrl": "/assets/icons/445d014b4a7b18d5bd26e2a5293b985b5764d4fbd9bbde7fec0040d55afd897b.png",
              "defaultSelected": true,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10270"
            },
            {
              "id": "10271",
              "key": "catalog-10271",
              "orderIndex": 3,
              "iconUrl": "/assets/icons/ed197303b9f8b1a84829778a03e225b8ec028aa4a0d67f7a8bd2df1c2c4d1b06.png",
              "iconSelectedUrl": "/assets/icons/83890beefaceed3a8b224a476955f48a98ea9444e922bb4fd6a2a6326a200ef8.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10271"
            },
            {
              "id": "10272",
              "key": "catalog-10272",
              "orderIndex": 4,
              "iconUrl": "/assets/icons/1c5c6e1439d0d8b8d684c19e0c692717a1eb3c32cc402233e46ad24888b2c792.png",
              "iconSelectedUrl": "/assets/icons/0a40a664984e8731706a490433ca9737869ff82c5532125c0ad7f6a9563a6fe4.png",
              "defaultSelected": false,
              "count": 0,
              "regionType": 0,
              "showLandmarkName": true,
              "name": "Category fixture 10272"
            }
          ],
          "name": "Group fixture group-9"
        }
      ],
      "defaultIconSize": 32,
      "landmarkNameColor": "#F3FFE1",
      "landmarkNameBackgroundColor": "#0F0B09",
      "siblingMapIds": "251,252,253,254,255,256,257,258",
      "mapName": "Mount Soulrend"
    }
  ]
}
const fixtureCollections = [
  {
    "mapId": "251",
    "sourceCount": 4,
    "landmarks": [
      {
        "id": "912566",
        "catalogId": "9907",
        "position": [
          -1.1471898042807993,
          0.526619531277376
        ],
        "z": 400,
        "images": [
          "/assets/images/7b27ed85daea10032eb19e85460a694832063ba0aede719dd64db158e3ed4dd6.jpg",
          "/assets/images/7e5596e2d20785d7fc3adb472f31e42f2a57e02e227397aa1e52e2469e216783.jpg",
          "/assets/images/5a26753fc1dd8e47f6f69ce6a2a8acd7bbdf1f068ae37166424b7369c4a93af6.jpg"
        ],
        "sourceUrl": "?mapId=251&landmarkCatalogId=9907&landmarkId=912566",
        "regionType": 0,
        "regionPoints": null,
        "name": "Primary fixture cave",
        "description": "Cross the bridge. Description-only fixture."
      },
      {
        "id": "912250",
        "catalogId": "9907",
        "position": [
          -0.4765873396443112,
          1.1453997525835575
        ],
        "z": 400,
        "images": [
          "/assets/images/788b9ff82189ede8cdd5c96a8684b4addb2802344386f4df358a94160c05ec83.jpg"
        ],
        "sourceUrl": "?mapId=251&landmarkCatalogId=9907&landmarkId=912250",
        "regionType": 0,
        "regionPoints": null,
        "name": "Bridge fixture crossing",
        "description": ""
      },
      {
        "id": "912829",
        "catalogId": "9928",
        "position": [
          -0.6001513286458078,
          1.1457654506648964
        ],
        "z": 400,
        "images": [
          "/assets/images/bcc5241e41f9eb8c32b3255f9d2e722a20cb574e77618219123a2945b40d2b95.jpg"
        ],
        "sourceUrl": "?mapId=251&landmarkCatalogId=9928&landmarkId=912829",
        "regionType": null,
        "regionPoints": null,
        "name": "Hidden fixture",
        "description": "Bridge hidden-category fixture."
      },
      {
        "id": "912132",
        "catalogId": "9938",
        "position": [
          -0.5310929771524684,
          0.6370150780211787
        ],
        "z": 400,
        "images": [
          "/assets/images/211d745349793f86f982b00dc320ab0a5a6c75a603dc5a2df7ff110b0c0f34fc.jpg",
          "/assets/images/822dffb73ef801240f49f25ddfabaf4ff7e90b7c529f71b2d26f1bb6032ca170.jpg"
        ],
        "sourceUrl": "?mapId=251&landmarkCatalogId=9938&landmarkId=912132",
        "regionType": 0,
        "regionPoints": null,
        "name": "Long fixture instructions",
        "description": "Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. Full fixture instructions. "
      }
    ]
  },
  {
    "mapId": "252",
    "sourceCount": 2,
    "landmarks": [
      {
        "id": "912580",
        "catalogId": "10051",
        "position": [
          -0.6842018591558485,
          0.7585751560420988
        ],
        "z": 400,
        "images": [
          "/assets/images/2bdbc9f0c998603a2c7f6c96cd109fd348ff7817e278ff6a9f6c8c13defa38e8.jpg",
          "/assets/images/bb7192b88f2e30724f042ee797cc8561fca4cba62a365ef392dda06ca54ea196.jpg"
        ],
        "sourceUrl": "?mapId=252&landmarkCatalogId=10051&landmarkId=912580",
        "regionType": 0,
        "regionPoints": null,
        "name": "Foreign Bridge fixture",
        "description": ""
      },
      {
        "id": "912585",
        "catalogId": "10055",
        "position": [
          -0.7081803923410064,
          0.8272226644239282
        ],
        "z": 400,
        "images": [
          "/assets/images/bcfe7bacb581112f08a57f956b33cb6156294604d4b028bcd8ba937d6ecd3a93.jpg",
          "/assets/images/08ecd64e53ba7d64396e1c8c8c94dc01e6c15649db9a03dbd013efa25d1d2029.jpg",
          "/assets/images/5e2beb07edc2b5fef9f3ffc93777ad098c7e70a91f162a7bc4273da15cb34638.jpg"
        ],
        "sourceUrl": "?mapId=252&landmarkCatalogId=10055&landmarkId=912585",
        "regionType": 0,
        "regionPoints": null,
        "name": "To the Foreign Bridge fixture",
        "description": ""
      }
    ]
  },
  {
    "mapId": "253",
    "sourceCount": 3,
    "landmarks": [
      {
        "id": "912760",
        "catalogId": "10087",
        "position": [
          -0.5077407638208342,
          0.8036537642310577
        ],
        "z": 400,
        "images": [
          "/assets/images/2e3148b61748c9babad07686996e6c198d2ac6a1b6293be9bd50c194f97599eb.jpg",
          "/assets/images/aa58bb34bca880e6a5f7608e76b52eb4436f507417f05f14540c1da424e8d5dd.jpg",
          "/assets/images/11ce71a28c1393378936b79b99b61caa422cf7010c0a9710fb01bd9c9ceaf14b.jpg",
          "/assets/images/8aca9d491ec7bf9c94c6f5deb38cefd1f9017a82902b9c40b292e21dd0fae938.jpg"
        ],
        "sourceUrl": "?mapId=253&landmarkCatalogId=10087&landmarkId=912760",
        "regionType": 0,
        "regionPoints": null,
        "name": "Fixture courtyard",
        "description": "Bridge description fixture."
      },
      {
        "id": "912538",
        "catalogId": "10105",
        "position": [
          -0.28584625785458684,
          0.30659744058090155
        ],
        "z": 400,
        "images": [
          "/assets/images/c79cef52c9789203e5958f6602fa8c78f552e0a51e33dbfa69962dfc8611e362.jpg"
        ],
        "sourceUrl": "?mapId=253&landmarkCatalogId=10105&landmarkId=912538",
        "regionType": 0,
        "regionPoints": null,
        "name": "Long courtyard fixture",
        "description": "Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. Full courtyard fixture instructions. "
      },
      {
        "id": "912778",
        "catalogId": "10118",
        "position": [
          -0.23274619883738978,
          0.6100754277070308
        ],
        "z": 400,
        "images": [
          "/assets/images/fixture-first.png",
          "/assets/images/fixture-second.png",
          "/assets/images/fixture-first.png"
        ],
        "sourceUrl": "?mapId=253&landmarkCatalogId=10118&landmarkId=912778",
        "regionType": 0,
        "regionPoints": null,
        "name": "Long tower fixture",
        "description": "Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. Full tower fixture instructions. "
      }
    ]
  },
  {
    "mapId": "254",
    "sourceCount": 1,
    "landmarks": [
      {
        "id": "912092",
        "catalogId": "10014",
        "position": [
          -1.1430335771926536,
          0.8691119605147293
        ],
        "z": 400,
        "images": [
          "/assets/images/69b141c6331873486f3fd125f8341cdb35455f52779a0f3d8cbed4db62f16a03.jpg"
        ],
        "sourceUrl": "?mapId=254&landmarkCatalogId=10014&landmarkId=912092",
        "regionType": 0,
        "regionPoints": null,
        "name": "Fixture lion",
        "description": "Bridge source fixture."
      }
    ]
  },
  {
    "mapId": "255",
    "sourceCount": 2,
    "landmarks": [
      {
        "id": "913193",
        "catalogId": "10144",
        "position": [
          -0.7437984914378148,
          1.0149717183482778
        ],
        "z": 400,
        "images": [
          "/assets/images/3d934d8833162e7728b3bf118e71bebf3164be14eea92ef9ba9c3bd6b32c89e0.jpg",
          "/assets/images/783cd5ab33c38ba4bef4d075539ecbe72505d462caf39be835bb9add1523217c.jpg",
          "/assets/images/6b6bb33becfda0e77c804791c55bb11e6a559ff2fa60c0feac6f4da2ea1a5570.jpg",
          "/assets/images/6174ab6c01304c2e414513f2e494233a9dc10e5386fda7ec4429e6f01d96f211.jpg"
        ],
        "sourceUrl": "?mapId=255&landmarkCatalogId=10144&landmarkId=913193",
        "regionType": 0,
        "regionPoints": null,
        "name": "Shared item fixture",
        "description": "Item representation fixture: follow the bridge route; retain the item-specific condition."
      },
      {
        "id": "913193",
        "catalogId": "10157",
        "position": [
          -0.743648930242216,
          1.0210237672753948
        ],
        "z": 400,
        "images": [
          "/assets/images/3d934d8833162e7728b3bf118e71bebf3164be14eea92ef9ba9c3bd6b32c89e0.jpg",
          "/assets/images/783cd5ab33c38ba4bef4d075539ecbe72505d462caf39be835bb9add1523217c.jpg",
          "/assets/images/6b6bb33becfda0e77c804791c55bb11e6a559ff2fa60c0feac6f4da2ea1a5570.jpg",
          "/assets/images/6174ab6c01304c2e414513f2e494233a9dc10e5386fda7ec4429e6f01d96f211.jpg"
        ],
        "sourceUrl": "?mapId=255&landmarkCatalogId=10157&landmarkId=913193",
        "regionType": 0,
        "regionPoints": null,
        "name": "Shared quest fixture",
        "description": "Quest representation fixture: follow the bridge route; retain the separate prerequisite and objective."
      }
    ]
  },
  {
    "mapId": "256",
    "sourceCount": 1,
    "landmarks": [
      {
        "id": "913313",
        "catalogId": "10179",
        "position": [
          -1.022216422371315,
          0.8416999889369001
        ],
        "z": 400,
        "images": [
          "/assets/images/fixture-first.png",
          "/assets/images/fixture-second.png",
          "/assets/images/fixture-first.png"
        ],
        "sourceUrl": "?mapId=256&landmarkCatalogId=10179&landmarkId=913313",
        "regionType": 0,
        "regionPoints": null,
        "name": "Lake fixture point",
        "description": "Bridge lake fixture."
      }
    ]
  },
  {
    "mapId": "257",
    "sourceCount": 1,
    "landmarks": [
      {
        "id": "913756",
        "catalogId": "10215",
        "position": [
          -0.33622964009310863,
          0.3988117268325624
        ],
        "z": 400,
        "images": [
          "/assets/images/fixture-first.png",
          "/assets/images/fixture-second.png",
          "/assets/images/fixture-first.png"
        ],
        "sourceUrl": "?mapId=257&landmarkCatalogId=10215&landmarkId=913756",
        "regionType": 0,
        "regionPoints": null,
        "name": "Mountain fixture point",
        "description": "Bridge mountain fixture."
      }
    ]
  },
  {
    "mapId": "258",
    "sourceCount": 1,
    "landmarks": [
      {
        "id": "914542",
        "catalogId": "10276",
        "position": [
          -1.1197421962733642,
          0.4653872301836799
        ],
        "z": 400,
        "images": [
          "/assets/images/fixture-first.png",
          "/assets/images/fixture-second.png",
          "/assets/images/fixture-first.png"
        ],
        "sourceUrl": "?mapId=258&landmarkCatalogId=10276&landmarkId=914542",
        "regionType": null,
        "regionPoints": null,
        "name": "Final fixture point",
        "description": "Bridge final fixture."
      }
    ]
  }
]
const map = manifest.maps[0]
const data = fixtureCollections.find(collection => collection.mapId === map.id)
const landmarks = data.landmarks
const catalogs = allCatalogs(map)
const allIds = catalogs.map(catalog => catalog.id)
const visible = options => filterLandmarks(landmarks, { catalogIds: allIds, ...options })
const expectedModel = {
  orderedIds: ['912566','912250','912829','912132'],
  incompleteIds: ['912250','912829','912132'],
  completedIds: ['912566'],
  bridgeIds: ['912566','912250','912829'],
  incompleteBridgeIds: ['912250','912829'],
  bridgeCategoryId: '9907',
  bridgeCategoryIds: ['912566','912250'],
  descriptionOnlyIds: ['912566','912829'],
}
await test('Snapshot longitude/latitude and bounds convert only at the Leaflet boundary', () => {
  for (const config of manifest.maps) {
    assert.deepEqual(positionToLatLng(config.center), [config.center[1], config.center[0]])
    assert.deepEqual(boundsToLatLngBounds(config.bounds), [[config.bounds[1], config.bounds[0]], [config.bounds[3], config.bounds[2]]])
    assert.ok(positionInBounds(config.center, config.bounds))
    const converted = positionToLatLng(config.center)
    assert.deepEqual([converted[1], converted[0]], config.center)
  }
  const point = landmarks.find(value => value.id === '912566')
  assert.deepEqual(point.position, [-1.1471898042807993, 0.526619531277376])
  assert.deepEqual(positionToLatLng(point.position), [0.526619531277376, -1.1471898042807993])
  assert.equal(point.z, 400, 'Snapshot z is data, not a floor selector')
  assert.equal(positionInBounds([-1.4, 0], map.bounds), true)
  assert.equal(positionInBounds([0, 1.4], map.bounds), true)
  assert.equal(positionInBounds([0.001, 0.5], map.bounds), false)
  assert.equal(positionInBounds([-0.5, -0.001], map.bounds), false)
})

await test('Default-unselected categories and their points remain available to category selection', () => {
  const defaults = defaultCatalogIds(map)
  const hiddenDefaults = catalogs.filter(catalog => !catalog.defaultSelected)
  assert.deepEqual(hiddenDefaults.map(catalog => catalog.id), ["9927","9928","9929","9930","9931","9932","9942"])
  assert.deepEqual(visible({ catalogIds: [] }), [])
  assert.deepEqual(visible({}).map(point => point.id), expectedModel.orderedIds)
  for (const catalog of hiddenDefaults) {
    assert.equal(defaults.includes(catalog.id), false)
    const members = visible({ catalogIds: [catalog.id] })
    assert.equal(members.length, catalog.count)
    assert.ok(members.every(point => !visible({ catalogIds: defaults }).some(value => value.id === point.id)))
  }
  assert.deepEqual(countByCatalog(landmarks), Object.fromEntries(catalogs.filter(catalog => catalog.count > 0).map(catalog => [catalog.id, catalog.count])))
})

await test('The visible-marker helper searches direct English name and description fields', () => {
  // This pure helper contract is not acceptance of the separate source-site search UI.
  assert.equal(normalizeSearch('  Xuan Yù  '), 'xuan yu')
  assert.equal(normalizeSearch('Bastion of Mó'), 'bastion of mo')
  assert.deepEqual(visible({ search: 'bridge' }).map(point => point.id), expectedModel.bridgeIds)
  for (const id of expectedModel.descriptionOnlyIds) {
    const point = landmarks.find(point => point.id === id)
    assert.equal(point.name.toLowerCase().includes('bridge'), false)
    assert.ok(point.description.toLowerCase().includes('bridge'), `${id}: description-only match`)
  }
  assert.deepEqual(visible({ search: '  BRIDGE  ', catalogIds: [expectedModel.bridgeCategoryId] }).map(point => point.id), expectedModel.bridgeCategoryIds)
  assert.deepEqual(visible({ search: 'bridge', catalogIds: [] }), [])
})

await test('Null, completed and incomplete filtering preserve input objects, options and original order', () => {
  const before = structuredClone(landmarks)
  const completedIds = new Set([...expectedModel.completedIds, 'saved-outside-this-snapshot'])
  const selectedIds = [...allIds]
  const options = { catalogIds: selectedIds, search: '', completedIds }
  const optionsBefore = structuredClone(options)
  const ids = points => points.map(point => point.id)
  assert.deepEqual(ids(filterLandmarks(landmarks, options)), expectedModel.orderedIds, 'Omitted completion filter includes both states')
  for (const completionFilter of [null, 'completed', 'incomplete']) {
    const expectedIds = expectedModel.orderedIds.filter(id => completionFilter === null
      || (completionFilter === 'completed' ? completedIds.has(id) : !completedIds.has(id)))
    const result = visible({ ...options, completionFilter })
    assert.deepEqual(ids(result), expectedIds)
    for (const point of result) assert.equal(point, landmarks.find(value => value.id === point.id), 'Return original records, not replacements')
    const expectedSearchIds = expectedModel.bridgeIds.filter(id => completionFilter === null
      || (completionFilter === 'completed' ? completedIds.has(id) : !completedIds.has(id)))
    assert.deepEqual(ids(visible({ ...options, search: 'bridge', completionFilter })), expectedSearchIds)
    const expectedCategoryIds = expectedModel.bridgeCategoryIds.filter(id => completionFilter === null
      || (completionFilter === 'completed' ? completedIds.has(id) : !completedIds.has(id)))
    assert.deepEqual(ids(visible({ ...options, catalogIds: [expectedModel.bridgeCategoryId], search: 'bridge', completionFilter })), expectedCategoryIds)
    assert.deepEqual(visible({ ...options, catalogIds: [], completionFilter }), [])
  }
  assert.deepEqual(visible({ completionFilter: 'completed', completedIds: new Set() }), [])
  assert.deepEqual(ids(visible({ completionFilter: 'incomplete', completedIds: new Set() })), expectedModel.orderedIds)
  assert.deepEqual(landmarks, before)
  assert.deepEqual(options, optionsBefore)
})

await test('Owning records require direct English fields without a fallback dictionary', () => {
  assert.equal(validateManifest(manifest), manifest)
  assert.equal(validatePoints(map, data), landmarks)
  for (const field of ['name', 'description']) {
    for (const invalid of [undefined, null, 123]) {
      const changed = structuredClone(data)
      if (invalid === undefined) delete changed.landmarks[0][field]
      else changed.landmarks[0][field] = invalid
      assert.throws(() => validatePoints(map, changed), /English landmark content.*No source-language fallback/)
    }
  }
  // Deliberately invalid in-memory input: this code point is never product wording.
  const invalidNonEnglish = structuredClone(data)
  invalidNonEnglish.landmarks[0].description = String.fromCodePoint(0x4e00)
  assert.throws(() => validatePoints(map, invalidNonEnglish), /English landmark content.*No source-language fallback/)
  const blank = structuredClone(data)
  blank.landmarks[0].name = '  '
  assert.throws(() => validatePoints(map, blank), /English landmark content/)
  blank.landmarks[0].name = 'An English landmark'
  blank.landmarks[0].description = ''
  assert.equal(validatePoints(map, blank), blank.landmarks, 'An existing empty description is valid')
  for (const target of ['region', 'group', 'category']) {
    for (const invalid of [undefined, null, '', '  ', 123]) {
      const changed = structuredClone(manifest)
      const owner = target === 'region' ? changed.maps[0] : target === 'group'
        ? changed.maps[0].catalogGroups[0] : changed.maps[0].catalogGroups[0].catalogs[0]
      const field = target === 'region' ? 'mapName' : 'name'
      if (invalid === undefined) delete owner[field]
      else owner[field] = invalid
      assert.throws(() => validateManifest(changed), /English content.*No source-language fallback/)
    }
  }
})

await test('Missing or extra points, duplicate IDs and unknown categories fail explicitly', () => {
  const incomplete = structuredClone(data)
  incomplete.landmarks.pop()
  assert.throws(() => validatePoints(map, incomplete), /incomplete or invalid/)
  const extra = structuredClone(data)
  extra.landmarks.push({ ...structuredClone(extra.landmarks[0]), id: 'not-in-the-snapshot' })
  assert.throws(() => validatePoints(map, extra), /incomplete or invalid/)
  const duplicate = structuredClone(data)
  duplicate.landmarks[1] = structuredClone(duplicate.landmarks[0])
  assert.throws(() => validatePoints(map, duplicate), /incomplete or invalid/)
  const unknownCategory = structuredClone(data)
  unknownCategory.landmarks[0].catalogId = 'not-a-category'
  assert.throws(() => validatePoints(map, unknownCategory), /incomplete or invalid/)
})

await test('Native zoom is optional, integral and inside the unchanged display range', () => {
  const pangTown = manifest.maps.find(config => config.id === '254')
  assert.equal(pangTown.maxZoom, 14)
  assert.equal(pangTown.maxNativeZoom ?? pangTown.maxZoom, 14)
  const legacy = structuredClone(manifest)
  delete legacy.maps.find(config => config.id === '254').maxNativeZoom
  assert.equal(validateManifest(legacy), legacy, 'Maps without a native limit retain their display maximum')
  for (const value of [null, 7, 15, 12.5, '13', NaN]) {
    const invalid = structuredClone(manifest)
    invalid.maps.find(config => config.id === '254').maxNativeZoom = value
    assert.throws(() => validateManifest(invalid), /manifest is incomplete or invalid/)
  }
})

// Exercise the component's actual setup/lifecycle code with small Node-only API
// doubles. These assertions do not stand in for Leaflet geometry or browser UI tests.
const canvasSource = await readFile(new URL('../src/MapCanvas.vue', import.meta.url), 'utf8')
function domElement(tag) {
  const classes = new Set()
  const events = new Map()
  return {
    tag, children: [], dataset: {}, style: {}, attributes: {}, events,
    classList: { add: name => classes.add(name), remove: name => classes.delete(name),
      toggle(name, enabled) { if (enabled ?? !classes.has(name)) classes.add(name); else classes.delete(name) }, contains: name => classes.has(name) },
    append(...children) { this.children.push(...children) },
    setAttribute(name, value) { this.attributes[name] = value },
    addEventListener(name, action) { events.set(name, action) },
  }
}
const domNodes = node => [node, ...(node.children ?? []).flatMap(domNodes)]
function canvasLifecycle(config, addPinMode = false, base = '/', initialZoom = null, options = {}) {
  const classes = new Set(['map-canvas'])
  const element = domElement('div')
  element.classList = { toggle(name, enabled) { if (enabled) classes.add(name); else classes.delete(name) } }
  const props = Vue.reactive({ config, landmarks: [], visibleLandmarks: [], completedIds: new Set(), pins: [], selection: null, addPinMode, canSave: true,
    initialZoom, mobile: false, showMarkerNames: true, pendingPinPosition: null, ...options })
  const size = { x: 1280, y: 523 }
  const calls = [], emissions = [], markers = [], layers = [], watches = [], timers = new Map()
  const scroller = { scrollTop: 100, scrollHeight: 900, style: {} }
  const events = new Map()
  let mount, unmount, resize, popup, tiles, mapOptions, exposed, timerId = 0
  let currentZoom = initialZoom ?? config.defaultZoom
  let center = { lng: config.center[0], lat: config.center[1] }
  const map = {
    getSize: () => size, getZoom: () => currentZoom, getCenter: () => center,
    on(names, callback) { for (const name of names.split(' ')) events.set(name, callback); return this },
    invalidateSize() { calls.push('invalidate') },
    setView(position, zoom, options) { center = { lat: position[0], lng: position[1] }; currentZoom = zoom; calls.push({ method: 'setView', position, zoom, ...(options ? { options: structuredClone(options) } : {}) }); return this },
    zoomIn() { currentZoom = Math.min(config.maxZoom, currentZoom + 1); calls.push('zoomIn') },
    zoomOut() { currentZoom = Math.max(config.minZoom, currentZoom - 1); calls.push('zoomOut') },
    stop() { calls.push('stop') }, closePopup() { if (popup) popup.open = false; calls.push('close') }, remove() { calls.push('remove') },
  }
  const L = {
    CRS: { EPSG3857: {} },
    map(_element, options) {
      mapOptions = options
      center = { lat: options.center[0], lng: options.center[1] }
      currentZoom = options.zoom
      classes.add('leaflet-container'); classes.add('leaflet-touch')
      return map
    },
    layerGroup() { const layer = { markers: [], addTo() { return this }, clearLayers() { this.markers = [] } }; layers.push(layer); return layer },
    divIcon: options => options,
    marker(position, options) {
      const marker = { position, options, events: new Map(),
        on(name, action) { this.events.set(name, action); return this },
        addTo(layer) { layer.markers.push(this); return this },
        setIcon(icon) { this.options.icon = icon; return this },
      }; markers.push(marker); return marker
    },
    DomEvent: { stopPropagation() {} },
    tileLayer(url, options) { tiles = { url, options, events: new Map() }; return { on(name, action) { tiles.events.set(name, action); return this }, addTo() {} } },
    popup(options) {
      popup = { options, open: false, updates: 0,
        setLatLng(value) { this.position = value; return this }, setContent(value) { this.content = value; return this },
        isOpen() { return this.open }, openOn() { this.open = true; return this },
        getElement: () => ({ querySelector: () => scroller }), update() { this.updates++ },
      }; return popup
    },
  }
  const context = createContext({
    L, allCatalogs, boundsToLatLngBounds, markerNameCatalogIds, positionInBounds, positionToLatLng, representationKey, element, scroller,
    localResourceUrl: path => localResourceUrl(path, base),
    defineProps: () => props, defineEmits: () => (...args) => emissions.push(args), defineExpose: value => { exposed = value },
    ref: Vue.ref, computed: Vue.computed, nextTick: Vue.nextTick,
    onMounted: callback => { mount = callback }, onBeforeUnmount: callback => { unmount = callback },
    watch: (read, callback) => watches.push({ read, callback }),
    setTimeout(callback, delay) { const id = ++timerId; timers.set(id, { callback, delay }); return id }, clearTimeout: id => timers.delete(id),
    ResizeObserver: class { constructor(callback) { resize = callback } observe() {} disconnect() {} },
    document: { createElement: domElement },
  })
  const script = canvasSource.match(/<script setup>([\s\S]*?)<\/script>/)[1].replace(/^import .*\n/gm, '')
  const run = code => runInContext(code, context)
  runInContext(script, context, { filename: 'MapCanvas.vue' })
  run('container.value = element; mobileBody.value = scroller')
  mount()
  const setup = new Proxy({}, { get(_target, key) { if (typeof key !== 'string') return undefined; try { return Vue.unref(run(key)) } catch (error) { if (error.name === 'ReferenceError') return props[key]; throw error } } })
  const render = new Function('Vue', compile(canvasSource.split('<template>')[1].replace(/<\/template>\s*$/, ''), { mode: 'function', prefixIdentifiers: true }).code)({ ...Vue, resolveComponent: name => name, withDirectives: node => node })
  return { props, size, classes, calls, emissions, markers, layers, scroller, popup, tiles, mapOptions, map, element, exposed, watches, timers,
    resize: () => resize(), run, unmount: () => unmount(),
    fire: (name, event) => events.get(name)?.(event),
    nodes: () => templateNodes(render(setup, [])),
    pinModeWatch: watches.find(watch => watch.read.toString().includes('props.addPinMode')),
  }
}

await test('Pin mode changes preserve Leaflet-owned classes and native tile options use the local limit', () => {
  assert.doesNotMatch(canvasSource.match(/<div\b[^>]*ref="container"[^>]*>/)[0], /\s:class=/, 'Vue must not replace the Leaflet container class string')
  for (const config of manifest.maps) {
    const canvas = canvasLifecycle(config, true)
    assert.ok(canvas.classes.has('is-adding-pin'), 'Initial placement mode is synchronized')
    for (const mode of [false, true, false, true, false]) {
      canvas.props.addPinMode = mode
      canvas.pinModeWatch.callback()
      assert.equal(canvas.classes.has('is-adding-pin'), mode)
      assert.ok(canvas.classes.has('map-canvas'))
      assert.ok(canvas.classes.has('leaflet-container'))
      assert.ok(canvas.classes.has('leaflet-touch'))
    }
    assert.equal(canvas.tiles.options.maxZoom, config.maxZoom)
    assert.equal(canvas.tiles.options.maxNativeZoom, config.maxNativeZoom ?? config.maxZoom)
    assert.equal(canvas.tiles.options.noWrap, true)
    assert.equal(canvas.tiles.options.tms, false)
    assert.equal(canvas.tiles.url, config.tileUrl)
    assert.equal(canvas.popup.options.autoPan, true)
  }
})

await test('Long fixture popups retain complete text and ordered local image links through resize and Reset view', () => {
  for (const [mapId, id, width, height] of [['251', '912132', 1280, 523], ['253', '912538', 1280, 523], ['253', '912778', 1280, 523], ['253', '912538', 375, 667]]) {
    const config = manifest.maps.find(map => map.id === mapId)
    const point = fixtureCollections.find(collection => collection.mapId === config.id).landmarks.find(point => point.id === id)
    const originalPosition = [...point.position]
    const canvas = canvasLifecycle(config)
    Object.assign(canvas.size, { x: width, y: height })
    Object.assign(canvas.props, { landmarks: [point], visibleLandmarks: [point], selection: { kind: 'landmark', id, catalogId: point.catalogId, source: 'marker' } })
    canvas.run('renderSelection()')
    const { options, content } = canvas.popup
    const elements = domNodes(content)
    assert.equal(content.dataset.landmarkId, id)
    assert.equal(content.dataset.catalogId, point.catalogId)
    assert.equal(elements.find(child => child.className === 'place-name').textContent, point.name)
    assert.equal(elements.find(child => child.className === 'place-description').textContent, point.description)
    assert.deepEqual(elements.filter(child => child.tag === 'img').map(image => image.src), point.images)
    assert.deepEqual(elements.filter(child => child.tag === 'a').map(link => link.href), point.images)
    for (const link of elements.filter(child => child.tag === 'a')) { assert.equal(link.target, '_blank'); assert.equal(link.rel, 'noopener') }
    assert.equal(elements.find(child => child.dataset.action === 'toggle-complete').textContent, 'Mark complete')
    assert.deepEqual(canvas.popup.position, positionToLatLng(point.position))
    assert.deepEqual(point.position, originalPosition)
    assert.ok(options.maxHeight <= height - 24)
    assert.ok(options.maxWidth <= width - 24)
    canvas.size.y = 300
    canvas.resize()
    assert.equal(canvas.calls.at(-1), 'invalidate')
    assert.equal(canvas.popup.updates, 1)
    assert.ok(options.maxHeight < 300)
    canvas.calls.length = 0
    canvas.run('resetView()')
    assert.equal(canvas.popup.open, false)
    assert.deepEqual(canvas.calls.slice(0, 2), ['close', 'stop'])
    assert.deepEqual(canvas.calls[2], { method: 'setView', position: positionToLatLng(config.center), zoom: config.defaultZoom, options: { animate: false } })
    canvas.unmount()
  }
})

await test('Runtime resource boundaries use root and project bases without changing source URLs', async () => {
  const appSource = await readFile(new URL('../src/App.vue', import.meta.url), 'utf8')
  assert.match(appSource, /:src="localResourceUrl\(categoryIcon\(catalog\)\)"/)
  for (const base of ['/', '/pbz-map/']) {
    const prefix = base === '/' ? '' : '/pbz-map'
    for (const config of manifest.maps) {
      const points = fixtureCollections.find(collection => collection.mapId === config.id).landmarks
      const catalogById = new Map(allCatalogs(config).map(catalog => [catalog.id, catalog]))
      const point = points.find(point => point.images.length && catalogById.get(point.catalogId).iconUrl && catalogById.get(point.catalogId).iconSelectedUrl)
      assert.ok(point, 'Use a real landmark with ordinary/selected icons and popup images')
      const original = structuredClone(point)
      const catalog = catalogById.get(point.catalogId)
      const canvas = canvasLifecycle(config, false, base)
      canvas.props.landmarks = [point]
      assert.equal(canvas.tiles.url, `${prefix}${config.tileUrl}`)
      assert.ok(['{z}', '{x}', '{y}'].every(token => canvas.tiles.url.includes(token)))
      assert.equal(localResourceUrl(config.pointsUrl, base), `${prefix}${config.pointsUrl}`)
      assert.equal(localResourceUrl(catalog.iconUrl, base), `${prefix}${catalog.iconUrl}`)
      assert.equal(canvas.run('sourceIcon(props.landmarks[0])').html.children[0].src, `${prefix}${catalog.iconUrl}`)
      canvas.props.selection = { kind: 'landmark', id: point.id, catalogId: point.catalogId, source: 'marker' }
      assert.equal(canvas.run('sourceIcon(props.landmarks[0])').html.children[0].src, `${prefix}${catalog.iconSelectedUrl}`)
      const content = canvas.run('landmarkPopup(props.landmarks[0])')
      assert.deepEqual(domNodes(content).filter(child => child.tag === 'img').map(image => image.src), point.images.map(path => `${prefix}${path}`))
      assert.deepEqual(point, original)
    }
  }
  assert.throws(() => localResourceUrl('/pbz-map/assets/icon.png', '/pbz-map/'), /non-local resource/, 'Only logical snapshot paths enter the resolver; resolved URLs cannot be prefixed twice')
  for (const base of ['https://example.com/', '//example.com/', '/pbz-map/../', '/pbz-map/?query=x']) {
    assert.throws(() => localResourceUrl('/data/manifest.json', base), /local app base path is invalid/)
  }
})

await test('Only local snapshot resources are requested, with no credentials or live fallback', async () => {
  for (const value of ['/data/manifest.json', map.pointsUrl, map.tileUrl]) assert.equal(isLocalResource(value), true)
  for (const value of ['https://mapapi.gamersky.com/map/getMap', '//example.com/file', '/assets/../private', '/assets/a?token=x']) assert.equal(isLocalResource(value), false)
  const requests = []
  const fetcher = async (path, options) => {
    requests.push({ path, options })
    return { ok: true, json: async () => manifest }
  }
  assert.equal(await readLocalJson('/data/manifest.json', fetcher), manifest)
  assert.deepEqual(requests, [{ path: '/data/manifest.json', options: { method: 'GET', credentials: 'omit', redirect: 'error' } }])
  await assert.rejects(readLocalJson('https://mapapi.gamersky.com/map/getMap', fetcher), /non-local resource/)
  await assert.rejects(readLocalJson('/data/manifest.json', fetcher, 'https://example.com/'), /local app base path is invalid/)
  assert.equal(requests.length, 1)
  const jsonPaths = ['/data/manifest.json', map.pointsUrl]
  for (const base of ['/', '/pbz-map/']) {
    const start = requests.length
    for (const path of jsonPaths) assert.equal(await readLocalJson(path, fetcher, base), manifest)
    const prefix = base === '/' ? '' : '/pbz-map'
    assert.deepEqual(requests.slice(start), jsonPaths.map(path => ({ path: `${prefix}${path}`, options: { method: 'GET', credentials: 'omit', redirect: 'error' } })))
  }
  await assert.rejects(readLocalJson('/data/missing.json', async () => ({ ok: false, status: 404 })), /HTTP 404/)
  await assert.rejects(readLocalJson('/data/broken.json', async () => ({ ok: true, json: async () => { throw new SyntaxError() } })), /not valid JSON/)
  await assert.rejects(readLocalJson('/data/unreachable.json', async () => { throw new Error('Offline') }), /Could not read the local map file/)
})

// Execute the actual App setup and compile its actual template with real Vue
// reactivity. Only browser I/O, timers, lifecycle registration and DOM directives
// are doubled. Template VNodes are not native input, layout or touch acceptance.
const appSource = await readFile(new URL('../src/App.vue', import.meta.url), 'utf8')
const pointCollections = new Map(manifest.maps.map(config => [config.pointsUrl, fixtureCollections.find(collection => collection.mapId === config.id)]))
const renderAppTemplate = new Function('Vue', compile(appSource.split('<template>')[1].replace(/<\/template>\s*$/, ''), {
  mode: 'function', prefixIdentifiers: true,
}).code)({ ...Vue, resolveComponent: name => name, withDirectives: node => node })
const flushApp = async () => { await new Promise(resolve => setImmediate(resolve)); await Vue.nextTick() }
function templateNodes(node) {
  if (!node || typeof node !== 'object') return []
  return [node, ...(Array.isArray(node.children) ? node.children.flatMap(templateNodes) : [])]
}
function templateText(node) {
  return typeof node === 'string' ? node : typeof node?.children === 'string'
    ? node.children : Array.isArray(node?.children) ? node.children.map(templateText).join('') : ''
}
function appSetup({ base = '/', search = '', navigator = { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)' }, width = 1280, stored = new Map(), manifestInput = manifest, collectionInputs = fixtureCollections } = {}) {
  const collections = new Map(manifestInput.maps.map(config => [config.pointsUrl, collectionInputs.find(collection => collection.mapId === config.id)]))
  const writes = []
  const removals = []
  const requests = []
  const requestOptions = []
  const opened = []
  const timers = new Map()
  const stops = []
  const control = { gate: null }
  let now = 0, timerId = 0, beforeUnmount
  const storage = {
    failWrites: false,
    getItem: key => stored.get(key) ?? null,
    removeItem(key) { stored.delete(key); removals.push(key) },
    setItem(key, value) {
      if (this.failWrites) throw new Error('Quota exceeded')
      stored.set(key, value)
      writes.push(key)
    },
  }
  const browser = {
    localStorage: storage, navigator, innerWidth: width, location: { search, href: `${base}${search}` },
    open: (...args) => { opened.push(args); return {} },
    addEventListener() {}, removeEventListener() {},
  }
  const fetcher = async (url, options) => {
    requests.push(url)
    requestOptions.push(options)
    const path = base === '/' ? url : url.slice(base.length - 1)
    if (control.gate) await control.gate(path)
    assert.ok(path === '/data/manifest.json' || collections.has(path), `Unexpected product request: ${path}`)
    return { ok: true, json: async () => structuredClone(path === '/data/manifest.json' ? manifestInput : collections.get(path)) }
  }
  const context = createContext({
    allCatalogs, countByCatalog, defaultCatalogIds, filterLandmarks, positionInBounds, representationKey, searchLandmarks, searchTextParts,
    localResourceUrl: path => localResourceUrl(path, base),
    mapSearchUrl: (id, term, kind) => mapSearchUrl(id, term, kind, base),
    readLocalJson: path => readLocalJson(path, fetcher, base),
    validateManifest, validatePoints, ...localStateModel, URLSearchParams,
    ref: Vue.ref, computed: Vue.computed,
    watch: (...args) => { const stop = Vue.watch(...args); stops.push(stop); return stop },
    onMounted() {}, onBeforeUnmount: callback => { beforeUnmount = callback },
    document: { body: { classList: { toggle() {}, remove() {} } } },
    setTimeout: (callback, delay) => { const id = ++timerId; timers.set(id, { at: now + delay, callback }); return id },
    clearTimeout: id => timers.delete(id), window: browser,
  })
  const script = appSource.match(/<script setup>([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\s*\n/gm, '')
  const run = code => runInContext(code, context)
  runInContext(script, context, { filename: 'App.vue' })
  const setup = new Proxy({}, {
    get(_target, key) {
      if (typeof key !== 'string') return undefined
      try { return Vue.unref(run(key)) } catch (error) { if (error.name === 'ReferenceError') return undefined; throw error }
    },
    set(_target, key, value) { const reference = run(key); assert.ok(Vue.isRef(reference)); reference.value = value; return true },
  })
  const nodes = () => templateNodes(renderAppTemplate(setup, []))
  const byTestId = id => nodes().find(node => node.props?.['data-testid'] === id)
  return {
    stored, writes, removals, requests, requestOptions, storage, browser, opened, timers, control, run, nodes, byTestId,
    input(value) { byTestId('search').props['onUpdate:modelValue'](value) },
    focus() { byTestId('search').props.onFocus() },
    enter() { byTestId('search').props.onKeyup({ key: 'Enter' }) },
    async advance(milliseconds) {
      now += milliseconds
      for (const [id, timer] of timers) if (timer.at <= now) { timers.delete(id); timer.callback() }
      await flushApp()
    },
    unmount() { beforeUnmount(); stops.forEach(stop => stop()) },
  }
}

await test('Actual App defaults and Clear reset only category/completion filters, not saved records', async () => {
  const app = appSetup()
  const saved = { version: 1, completedIds: ['912566', 'retained-unknown-id'], pins: [{ id: 'kept-pin', position: [-0.45, 0.6] }] }
  app.stored.set('pbz-map:251:state', JSON.stringify(saved))
  app.stored.set('another-app:state', 'untouched')
  assert.equal(app.run('completionFilter.value'), 'incomplete')
  await app.run('start()')
  assert.equal(app.run('canUseMap.value'), true)
  assert.equal(app.run('canSave.value'), true)
  assert.deepEqual(app.requests, ['/data/manifest.json', map.pointsUrl])
  assert.deepEqual(Array.from(app.run('selectedCatalogIds.value')), defaultCatalogIds(map))
  assert.deepEqual(app.run('localState.value'), saved)
  app.run('clearCategorySelection()')
  assert.equal(app.run('completionFilter.value'), null)
  assert.deepEqual(Array.from(app.run('selectedCatalogIds.value')), [])
  assert.deepEqual(Array.from(app.run('visibleLandmarks.value')), [])
  assert.deepEqual(app.run('localState.value'), saved)
  assert.equal(app.stored.get('pbz-map:251:state'), JSON.stringify(saved))
  assert.equal(app.stored.get('another-app:state'), 'untouched')
  assert.deepEqual(app.writes, [])
  app.run('toggleAllCatalogs()')
  assert.deepEqual(Array.from(app.run('selectedCatalogIds.value')), allIds)
  assert.equal(app.run('allCategoriesSelected.value'), true)
  assert.equal(app.run('completionFilter.value'), null, 'Category selection does not silently restore the completion filter')
  app.run('toggleAllCatalogs()')
  assert.deepEqual(Array.from(app.run('selectedCatalogIds.value')), [])
  for (const config of manifest.maps) {
    await app.run(`changeMap(${JSON.stringify(config.id)})`)
    assert.equal(app.run('activeMapId.value'), config.id)
    assert.equal(app.run('completionFilter.value'), 'incomplete')
    assert.deepEqual(Array.from(app.run('selectedCatalogIds.value')), defaultCatalogIds(config))
  }
  await app.run('changeMap("251")')
  assert.deepEqual(app.run('localState.value'), saved)
  assert.deepEqual(app.writes, [], 'Boot and map switches never write back saved state')
})

await test('Actual App applies completion changes only after a successful per-map save', async () => {
  const app = appSetup()
  const saved = { version: 1, completedIds: ['retained-unknown-id'], pins: [{ id: 'kept-pin', position: [-0.45, 0.6] }] }
  app.stored.set('pbz-map:251:state', JSON.stringify(saved))
  app.stored.set('pbz-map:254:state', 'untouched-other-map')
  await app.run('start()')
  app.storage.failWrites = true
  app.run('markComplete("912566")')
  assert.deepEqual(app.run('localState.value'), saved)
  assert.equal(app.stored.get('pbz-map:251:state'), JSON.stringify(saved))
  assert.match(app.run('storageError.value'), /No marker changes were applied/)
  assert.deepEqual(app.writes, [])
  app.storage.failWrites = false
  app.run('markComplete("912566")')
  assert.deepEqual(app.run('localState.value').completedIds, ['retained-unknown-id', '912566'])
  assert.deepEqual(app.run('localState.value').pins, saved.pins)
  assert.equal(app.run('storageError.value'), '')
  assert.deepEqual(app.writes, ['pbz-map:251:state'])
  assert.equal(app.stored.get('pbz-map:254:state'), 'untouched-other-map')
})

// Fixed independently from the isolated eight-map fixture input, not from search output.
const expectedSearchTitles = ['251:912250', '252:912580', '252:912585']
const expectedSearchDescriptionDigest = "efcc511723cd8c804334e78f46ada356b3f39b41061c5f4c02cab28acec3cae5"
const groupedIds = (app, group) => Array.from(app.run(`searchResults.value.${group}`), result => `${result.mapId}:${result.point.id}`)
const resultNode = (app, mapId, id, catalogId) => app.nodes().find(node => node.props?.['data-map-id'] === mapId && node.props?.['data-landmark-id'] === id && (!catalogId || node.props?.['data-catalog-id'] === catalogId))
async function beginSearch(app, text) {
  if (app.byTestId('open-search')) app.byTestId('open-search').props.onClick()
  else app.focus()
  app.input(text)
  await Vue.nextTick()
}

await test('Actual App waits 500 ms and groups all eight fixture regions independently of marker filters', async t => {
  const app = appSetup()
  t.after(() => app.unmount())
  const saved = JSON.stringify({ version: 1, completedIds: ['912566', 'retained-unknown-id'], pins: [{ id: 'kept-pin', position: [-0.45, 0.6] }] })
  app.stored.set('pbz-map:251:state', saved)
  await app.run('start()')
  const initialVisibleIds = Array.from(app.run('visibleLandmarks.value'), point => point.id)
  await beginSearch(app, 'bridge')
  app.enter()
  assert.equal(app.browser.location.href, '/')
  assert.equal(app.byTestId('search-results'), undefined)
  await app.advance(499)
  assert.equal(app.run('searchReady.value'), false)
  assert.deepEqual(app.requests, ['/data/manifest.json', '/data/maps/251.json'])
  assert.deepEqual(Array.from(app.run('visibleLandmarks.value'), point => point.id), initialVisibleIds, 'Typing does not filter or select map markers')
  await app.advance(1)
  assert.equal(app.run('searchReady.value'), true)
  assert.deepEqual(groupedIds(app, 'title'), expectedSearchTitles)
  const descriptions = groupedIds(app, 'description')
  assert.equal(descriptions.length, 9)
  assert.equal(createHash('sha256').update(JSON.stringify(descriptions)).digest('hex'), expectedSearchDescriptionDigest)
  assert.equal(app.run('searchResultCount.value'), 12)
  assert.ok(descriptions.includes('251:912566'), 'Completed landmarks remain searchable')
  const groups = app.nodes().filter(node => node.props?.['data-search-group'])
  assert.deepEqual(groups.map(node => node.props['data-search-group']), ['title', 'description'])
  assert.ok(app.nodes().some(node => node.type === 'mark' && /bridge/i.test(templateText(node))))
  assert.match(templateText(resultNode(app, '251', '912566')), /Bells fixture · Weeping Creek Valley/)
  app.run('clearCategorySelection()')
  assert.equal(app.run('visibleLandmarks.value.length'), 0)
  for (const filter of [null, 'completed', 'incomplete']) {
    app.run(`completionFilter.value = ${JSON.stringify(filter)}`)
    assert.equal(app.run('searchResultCount.value'), 12)
    assert.deepEqual(groupedIds(app, 'title'), expectedSearchTitles)
  }
  assert.equal(app.run('selection.value'), null)
  assert.equal(app.nodes().find(node => node.type === 'MapCanvas').props['initial-zoom'], null)
  assert.equal(app.stored.get('pbz-map:251:state'), saved)
  assert.deepEqual(app.writes, [])
  assert.deepEqual(app.requests, ['/data/manifest.json', '/data/maps/251.json', '/data/maps/252.json', '/data/maps/253.json', '/data/maps/254.json', '/data/maps/255.json', '/data/maps/256.json', '/data/maps/257.json', '/data/maps/258.json'])
  for (const options of app.requestOptions) assert.deepEqual(options, { method: 'GET', credentials: 'omit', redirect: 'error' })
})

await test('Actual App retains exact English hits and region/category feedback for each included region', async t => {
  const app = appSetup()
  t.after(() => app.unmount())
  await app.run('start()')
  for (const [mapId, id, name, region] of [
    ['251', '912566', 'Primary fixture cave', 'Weeping Creek Valley'],
    ['252', '912580', 'Foreign Bridge fixture', 'Crimson Forest'],
    ['253', '912760', 'Fixture courtyard', 'Village of Lu'],
    ['254', '912092', 'Fixture lion', 'Pangzhen'],
  ]) {
    await beginSearch(app, name)
    await app.advance(500)
    const result = resultNode(app, mapId, id)
    assert.ok(result)
    assert.ok(templateText(result).includes(name))
    assert.ok(templateText(result).includes(region))
    assert.ok(templateText(result).includes(mapId === '251' ? 'Bells fixture' : `Category fixture ${result.props['data-catalog-id']}`))
  }
  assert.equal(app.requests.length, 9, 'Only the eight isolated fixture collections and manifest are read')
})

await test('Search highlighting preserves accented and unsafe-looking text as text-only template nodes', async t => {
  const text = 'Before Xuan Yù after'
  assert.deepEqual(searchTextParts(text, 'xuan yu'), [
    { text: 'Before ', match: false }, { text: 'Xuan Yù', match: true }, { text: ' after', match: false },
  ])
  const combiningText = `A ${String.fromCodePoint(0x65, 0x301)} B`
  assert.equal(searchTextParts(combiningText, 'e').find(part => part.match).text.length, 2)
  assert.equal(searchTextParts(text, 'not found').map(part => part.text).join(''), text)
  const app = appSetup()
  t.after(() => app.unmount())
  await app.run('start()')
  // In-memory HTML-looking English text exercises rendering, not a product-data edit.
  app.run('landmarks.value[0].name = "<img src=x onerror=alert(1)>"')
  await beginSearch(app, 'img')
  await app.advance(500)
  const result = resultNode(app, '251', '912566')
  assert.ok(templateText(result).includes('<img src=x onerror=alert(1)>'))
  assert.equal(templateNodes(result).some(node => node.type === 'img'), false)
  assert.equal(templateNodes(result).some(node => node.props && 'innerHTML' in node.props), false)
  assert.equal(templateNodes(result).find(node => node.type === 'mark').children, 'img')
  assert.doesNotMatch(appSource, /v-html|innerHTML/)
})

await test('Actual result-click and Enter routes restore distinct one-use state under root and project bases', async t => {
  for (const base of ['/', '/pbz-map/']) {
    for (const kind of ['name', 'keyword']) {
      const stored = new Map()
      const saved = JSON.stringify({ version: 1, completedIds: ['912566', 'retained-unknown-id'], pins: [{ id: 'kept-pin', position: [-0.45, 0.6] }] })
      stored.set('pbz-map:251:state', saved)
      stored.set('pbz-map:254:state', 'untouched-other-map')
      stored.set('map-searchName', 'untouched-upstream')
      stored.set('mapEnterInfo', 'untouched-upstream-entry')
      const source = appSetup({ base, stored })
      t.after(() => source.unmount())
      await source.run('start()')
      await beginSearch(source, kind === 'name' ? 'Primary fixture cave' : 'bridge')
      source.enter()
      assert.equal(source.browser.location.href, base, 'Enter before the completed debounce does not navigate')
      await source.advance(500)
      if (kind === 'name') resultNode(source, '251', '912566').props.onClick()
      else source.enter()
      const expectedUrl = kind === 'name' ? `${base}?mapId=251&name=Primary%20fixture%20cave` : `${base}?mapId=251&name=+bridge`
      assert.equal(source.browser.location.href, expectedUrl)
      assert.deepEqual(source.opened, [])
      assert.equal(source.run('selection.value'), null)
      assert.equal(source.stored.get(`pbz-map:251:search-${kind}`), kind === 'name' ? 'Primary fixture cave' : 'bridge')
      assert.equal(source.stored.has(`pbz-map:251:search-${kind === 'name' ? 'keyword' : 'name'}`), false)
      assert.equal(stored.get('pbz-map:251:state'), saved)
      const destination = appSetup({ base, stored, search: new URL(expectedUrl, 'https://local.invalid').search })
      t.after(() => destination.unmount())
      await destination.run('start()')
      assert.equal(destination.run('activeMapId.value'), '251')
      assert.equal(destination.run('restoredSearch.value.kind'), kind)
      assert.deepEqual(Array.from(destination.run('visibleLandmarks.value'), point => point.id), kind === 'name' ? [] : expectedModel.incompleteBridgeIds, 'Restoration does not bypass the saved canonical Incomplete filter')
      const canvasProps = destination.nodes().find(node => node.type === 'MapCanvas').props
      assert.equal(canvasProps['initial-zoom'], map.minZoom)
      const mounted = canvasLifecycle(map, false, base, canvasProps['initial-zoom'])
      assert.equal(mounted.mapOptions.zoom, 8)
      assert.equal(mounted.popup.open, false)
      assert.equal(mounted.calls.some(call => call?.method === 'setView'), false)
      if (kind === 'keyword') {
        assert.equal(destination.run('searchOpen.value'), true, 'Keyword restoration opens desktop search without a focus event')
        assert.equal(destination.timers.size, 1)
        assert.equal(destination.run('searchReady.value'), false)
        await destination.advance(499)
        assert.equal(destination.byTestId('search-results'), undefined)
        assert.equal(destination.run('searchReady.value'), false)
        await destination.advance(1)
        assert.equal(destination.run('searchReady.value'), true)
        assert.ok(destination.byTestId('search-results'))
        assert.deepEqual(groupedIds(destination, 'title'), expectedSearchTitles)
        assert.equal(destination.run('searchResultCount.value'), 12)
        assert.deepEqual(Array.from(destination.run('visibleLandmarks.value'), point => point.id), expectedModel.incompleteBridgeIds)
      } else {
        assert.equal(destination.run('searchOpen.value'), false, 'Name-result restoration does not reopen keyword search')
        assert.equal(destination.run('query.value'), '')
        assert.equal(destination.timers.size, 0)
      }
      assert.equal(destination.run('selection.value'), null)
      assert.equal(stored.has(`pbz-map:251:search-${kind}`), false)
      assert.equal(stored.get('pbz-map:251:state'), saved)
      assert.equal(stored.get('pbz-map:254:state'), 'untouched-other-map')
      assert.equal(stored.get('map-searchName'), 'untouched-upstream')
      assert.equal(stored.get('mapEnterInfo'), 'untouched-upstream-entry')
      assert.ok(source.writes.every(key => key === `pbz-map:251:search-${kind}`))
      assert.deepEqual(destination.writes, [])
      const reloaded = appSetup({ base, stored, search: new URL(expectedUrl, 'https://local.invalid').search })
      t.after(() => reloaded.unmount())
      await reloaded.run('start()')
      assert.equal(reloaded.run('restoredSearch.value.kind'), 'url', 'A consumed route falls through to its name URL branch')
      assert.deepEqual(Array.from(reloaded.run('visibleLandmarks.value'), point => point.id), expectedModel.incompleteIds)
      assert.equal(reloaded.nodes().find(node => node.type === 'MapCanvas').props['initial-zoom'], null)
      assert.deepEqual(reloaded.writes, [])
      await reloaded.run('changeMap("252")')
      await reloaded.run('changeMap("251")')
      assert.equal(reloaded.run('restoredSearch.value'), null, 'Internal region selection does not consume an initial URL again')
      destination.run('clearCategorySelection()')
      assert.equal(destination.run('restoredSearch.value'), null)
      assert.equal(destination.run('visibleLandmarks.value.length'), 0)
      const prefix = base === '/' ? '' : '/pbz-map'
      for (const url of [...source.requests, ...destination.requests]) assert.ok(url.startsWith(`${prefix}/data/`))
      assert.equal(source.requests.length, 9)
    }
    const saved = JSON.stringify({ version: 1, completedIds: ['912566', 'retained-unknown-id'], pins: [{ id: 'kept-pin', position: [-0.45, 0.6] }] })
    const stored = new Map([['pbz-map:251:state', saved], ['pbz-map:254:state', 'untouched-other-map']])
    const source = appSetup({ base, stored })
    t.after(() => source.unmount())
    await source.run('start()')
    await beginSearch(source, 'Foreign Bridge fixture')
    await source.advance(500)
    // Both identities and order are pinned to the independent fixture specification.
    const expectedForeignHits = ['252:912580', '252:912585']
    assert.deepEqual(groupedIds(source, 'title'), expectedForeignHits)
    assert.deepEqual(groupedIds(source, 'description'), [])
    source.storage.failWrites = true
    source.enter()
    assert.equal(source.browser.location.href, base, 'Failed transient save cannot bypass the navigation boundary')
    assert.match(source.run('searchError.value'), /could not be saved or opened/)
    assert.deepEqual(source.writes, [])
    assert.equal(stored.get('pbz-map:251:state'), saved)
    source.storage.failWrites = false
    source.enter()
    const expectedUrl = `${base}?mapId=251&name=+Foreign%20Bridge%20fixture`
    assert.equal(source.browser.location.href, expectedUrl)
    assert.deepEqual(source.opened, [])
    const destination = appSetup({ base, stored, search: new URL(expectedUrl, 'https://local.invalid').search })
    t.after(() => destination.unmount())
    await destination.run('start()')
    assert.equal(destination.run('activeMapId.value'), '251')
    assert.deepEqual(Array.from(destination.run('visibleLandmarks.value')), [])
    assert.equal(destination.run('restoredSearch.value.minimumZoom'), true, 'A nonempty unfiltered response still uses minimum zoom with no current-region markers')
    const canvasProps = destination.nodes().find(node => node.type === 'MapCanvas').props
    assert.equal(canvasProps['initial-zoom'], 8)
    const mounted = canvasLifecycle(map, false, base, canvasProps['initial-zoom'])
    assert.equal(mounted.mapOptions.zoom, 8, 'The actual Canvas must mount at minimum 8, not default 9')
    assert.equal(mounted.popup.open, false)
    assert.equal(mounted.calls.some(call => call?.method === 'setView'), false)
    assert.equal(destination.run('searchOpen.value'), true)
    assert.equal(destination.timers.size, 1)
    await destination.advance(499)
    assert.equal(destination.run('searchReady.value'), false)
    assert.equal(destination.byTestId('search-results'), undefined)
    await destination.advance(1)
    assert.equal(destination.run('searchReady.value'), true)
    assert.ok(destination.byTestId('search-results'), 'Both foreign-region results reappear without focus')
    assert.deepEqual(groupedIds(destination, 'title'), expectedForeignHits)
    assert.deepEqual(groupedIds(destination, 'description'), [])
    assert.match(templateText(resultNode(destination, '252', '912580')), /Foreign Bridge fixture.*Category fixture 10051 · Crimson Forest/)
    assert.match(templateText(resultNode(destination, '252', '912585')), /To the Foreign Bridge fixture.*Category fixture 10055 · Crimson Forest/)
    assert.equal(destination.run('selection.value'), null)
    assert.equal(stored.has('pbz-map:251:search-keyword'), false)
    destination.run('clearCategorySelection()')
    for (const filter of [null, 'completed', 'incomplete']) {
      destination.run(`completionFilter.value = ${JSON.stringify(filter)}`)
      assert.deepEqual(groupedIds(destination, 'title'), expectedForeignHits)
      assert.equal(destination.run('visibleLandmarks.value.length'), 0)
    }
    assert.equal(stored.get('pbz-map:251:state'), saved)
    assert.equal(stored.get('pbz-map:254:state'), 'untouched-other-map')
    assert.deepEqual(source.writes, ['pbz-map:251:search-keyword'])
    assert.deepEqual(destination.writes, [])
  }
})

await test('The source-evidenced name URL fallback selects a directly named category without progress writes', async t => {
  const app = appSetup({ search: '?mapId=251&name=Bells%20fixture' })
  t.after(() => app.unmount())
  await app.run('start()')
  const ids = Array.from(app.run('visibleLandmarks.value'), point => point.id)
  assert.equal(ids.length, 2)
  assert.equal(createHash('sha256').update(JSON.stringify(ids)).digest('hex'), "3ec92849a70d198a72f3ff1a559dbb016c9d72382d620a6bc97dc5c806ee44e2")
  assert.equal(app.run('restoredSearch.value.kind'), 'url')
  assert.equal(app.nodes().find(node => node.type === 'MapCanvas').props['initial-zoom'], null)
  assert.deepEqual(app.writes, [])
})

await test('Actual navigation uses identifiable device signals, never viewport width, for cross-region results', async t => {
  for (const [navigator, width, deviceMode, newTab] of [
    [{ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)' }, 375, 'desktop', true],
    [{ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS)' }, 1280, 'mobile', false],
    [{ userAgent: 'Masked', userAgentData: { mobile: true } }, 1280, 'mobile', false],
    [{ userAgent: 'Masked', platform: 'MacIntel', maxTouchPoints: 5 }, 1280, 'mobile', false],
    [{}, 375, 'unknown', false],
  ]) {
    const app = appSetup({ navigator, width, base: '/pbz-map/' })
    t.after(() => app.unmount())
    await app.run('start()')
    app.run('selection.value = { kind: "landmark", id: "912566", catalogId: "9907", source: "marker" }')
    if (deviceMode === 'mobile') {
      app.byTestId('open-search').props.onClick()
      assert.equal(app.run('selection.value'), null, 'Opening mobile search closes detail')
    }
    await beginSearch(app, 'Foreign Bridge fixture')
    await app.advance(500)
    assert.equal(app.run('deviceMode'), deviceMode)
    resultNode(app, '252', '912580').props.onClick()
    const url = '/pbz-map/?mapId=252&name=Foreign%20Bridge%20fixture'
    if (newTab) {
      assert.deepEqual(app.opened, [[url, '_blank']])
      assert.equal(app.browser.location.href, '/pbz-map/')
    } else {
      assert.deepEqual(app.opened, [])
      assert.equal(app.browser.location.href, url)
    }
    assert.equal(app.stored.get('pbz-map:252:search-name'), 'Foreign Bridge fixture')
    const destination = appSetup({ base: '/pbz-map/', stored: app.stored, search: new URL(url, 'https://local.invalid').search, navigator, width })
    t.after(() => destination.unmount())
    await destination.run('start()')
    assert.equal(destination.run('activeMapId.value'), '252')
    assert.deepEqual(Array.from(destination.run('visibleLandmarks.value'), point => point.id), ['912580'])
    assert.equal(destination.run('selection.value'), null)
    if (deviceMode === 'mobile') {
      app.byTestId('cancel-search').props.onClick()
      assert.equal(app.run('searchOpen.value'), false)
      assert.equal(app.run('query.value'), '')
      assert.equal(app.byTestId('search-results'), undefined)
    }
  }
})

await test('Actual App ignores obsolete async searches after replacement, clear, blur, map change and unmount', async t => {
  for (const action of ['replace', 'clear', 'blur', 'map', 'unmount']) {
    const app = appSetup()
    t.after(() => app.unmount())
    await app.run('start()')
    let release
    const blocked = new Promise(resolve => { release = resolve })
    app.control.gate = path => path === '/data/maps/252.json' ? blocked : undefined
    await beginSearch(app, 'bridge')
    await app.advance(500)
    assert.equal(app.run('searchReady.value'), false)
    if (action === 'replace') { app.input('Fixture lion'); await app.advance(500) }
    if (action === 'clear') app.nodes().find(node => node.props?.['aria-label'] === 'Clear search').props.onClick()
    if (action === 'blur') app.byTestId('search').props.onBlur()
    if (action === 'map') await app.run('changeMap("254")')
    if (action === 'unmount') app.unmount()
    release()
    await flushApp()
    if (action === 'replace') {
      assert.deepEqual(groupedIds(app, 'title'), ['254:912092'])
      assert.equal(app.run('query.value'), 'Fixture lion')
    } else {
      assert.equal(app.byTestId('search-results'), undefined)
      assert.equal(app.run('searchReady.value'), false)
      assert.equal(app.run('searchResultCount.value'), 0)
    }
    assert.equal(app.run('selection.value'), null)
    assert.equal(app.timers.size, 0)
    assert.deepEqual(app.writes, [])
  }
  for (const base of ['/', '/pbz-map/']) {
    for (const action of ['replace', 'clear', 'close', 'map', 'unmount', 'failure', 'stale-failure']) {
      const saved = JSON.stringify({ version: 1, completedIds: ['912566', 'retained-unknown-id'], pins: [{ id: 'kept-pin', position: [-0.45, 0.6] }] })
      const stored = new Map([['pbz-map:251:state', saved], ['pbz-map:254:state', saved], ['pbz-map:251:search-keyword', 'Foreign Bridge fixture']])
      const app = appSetup({ base, stored, search: '?mapId=251&name=+Foreign%20Bridge%20fixture' })
      t.after(() => app.unmount())
      let release, reject
      const blocked = new Promise((resolve, fail) => { release = resolve; reject = fail })
      app.control.gate = path => path === '/data/maps/252.json' ? blocked : undefined
      const starting = app.run('start()')
      await flushApp()
      assert.equal(app.run('loading.value'), true)
      assert.equal(app.run('canSave.value'), false)
      assert.equal(app.timers.size, 0, 'The restored grouped search waits for map readiness')
      app.run('markComplete("912566"); addPinMode.value = true; placePin([-0.45, 0.6]); addPinMode.value = false')
      assert.deepEqual(app.writes, [], 'Loading cannot bypass save-before-apply')
      if (action === 'replace') app.run('query.value = "Fixture lion"')
      if (action === 'clear') app.run('clearSearch()')
      if (action === 'close') app.run('closeSearch()')
      if (action === 'map' || action === 'stale-failure') await app.run('changeMap("254")')
      if (action === 'unmount') app.unmount()
      if (action === 'failure' || action === 'stale-failure') reject(new Error('Offline'))
      else release()
      await starting
      await app.advance(500)
      assert.equal(app.byTestId('search-results'), undefined)
      assert.equal(app.run('restoredSearch.value'), null, 'An invalidated destination must not commit late restoration')
      assert.equal(app.run('searchReady.value'), false)
      assert.equal(app.run('searchResultCount.value'), 0)
      assert.equal(app.run('selection.value'), null)
      assert.equal(app.timers.size, 0)
      if (action === 'failure') {
        assert.match(app.run('searchError.value'), /local search destination could not be restored/)
        assert.equal(app.run('canUseMap.value'), true)
      } else assert.equal(app.run('searchError.value'), '', 'A stale response or failure cannot restore errors either')
      assert.equal(stored.get('pbz-map:251:state'), saved)
      assert.equal(stored.get('pbz-map:254:state'), saved)
      assert.deepEqual(app.writes, [], 'Failure, cancellation, replacement, region change and disposal never write completion or pins')
    }
  }
})

await test('Actual App keeps blur/focus, empty-result, cancel and failed-search states separate from progress', async t => {
  for (const navigator of [{ userAgent: 'Macintosh' }, { userAgent: 'iPhone' }]) {
    const app = appSetup({ navigator })
    t.after(() => app.unmount())
    await app.run('start()')
    await beginSearch(app, 'bridge')
    await app.advance(500)
    app.byTestId('search').props.onBlur()
    assert.equal(app.run('searchOpen.value'), app.run('deviceMode') === 'mobile')
    if (app.run('deviceMode') !== 'mobile') {
      assert.equal(app.byTestId('search-results'), undefined)
      app.focus()
      assert.ok(app.byTestId('search-results'))
    }
    app.input('No matching local landmark 8675309')
    await app.advance(500)
    assert.equal(app.run('searchResultCount.value'), 0)
    assert.match(templateText(app.byTestId('search-results')), /No matching places in the included regions/)
    app.enter()
    assert.equal(app.browser.location.href, '/')
    assert.deepEqual(app.writes, [])
    assert.deepEqual(app.opened, [])
  }
  const failed = appSetup()
  t.after(() => failed.unmount())
  await failed.run('start()')
  failed.control.gate = path => { if (path === '/data/maps/252.json') throw new Error('Offline') }
  await beginSearch(failed, 'bridge')
  await failed.advance(500)
  assert.equal(failed.run('searchReady.value'), false)
  assert.match(failed.run('searchError.value'), /Could not read the local map file/)
  assert.equal(failed.run('canUseMap.value'), true)
  assert.deepEqual(failed.writes, [])
})

await test('Actual canvas starts restored search at minimum zoom without opening or inventing a selected point', () => {
  for (const config of manifest.maps) {
    const canvas = canvasLifecycle(config, false, '/', config.minZoom)
    assert.equal(canvas.mapOptions.zoom, config.minZoom)
    assert.equal(canvas.popup.open, false)
    assert.equal(canvas.calls.some(call => call?.method === 'setView'), false)
    const point = config.id === '251' ? landmarks[0] : pointCollections.get(config.pointsUrl).landmarks[0]
    Object.assign(canvas.props, { landmarks: [point], visibleLandmarks: [point], selection: { kind: 'landmark', id: point.id, catalogId: point.catalogId, source: 'marker' } })
    canvas.run('renderSelection(true)')
    assert.equal(canvas.calls.some(call => call?.method === 'setView'), false, 'Opening marker detail does not invent a locate action')
    assert.equal(canvas.map.getZoom(), config.minZoom)
  }
})

await test('Representation identity accepts the two real source tuples but rejects a repeated identical tuple', () => {
  const config=manifest.maps.find(map=>map.id==='255')
  const data=fixtureCollections.find(collection=>collection.mapId==='255')
  const [item,quest]=data.landmarks
  assert.deepEqual(data.landmarks.map(point=>[point.id,point.catalogId,point.position,point.z]),[
    ['913193','10144',[-0.7437984914378148,1.0149717183482778],400],
    ['913193','10157',[-0.743648930242216,1.0210237672753948],400],
  ])
  assert.equal(representationKey(config,item),'["255","10144","913193"]')
  assert.equal(representationKey('255',quest),'["255","10157","913193"]')
  assert.equal(validatePoints(config,data),data.landmarks)
  const duplicate=structuredClone(data);duplicate.landmarks.push(structuredClone(item));duplicate.sourceCount++
  assert.throws(()=>validatePoints(config,duplicate),/incomplete or invalid/)
  const wrongCount={...data,sourceCount:1};assert.throws(()=>validatePoints(config,wrongCount),/incomplete or invalid/)
  for(const [id,point] of [[null,item],['',item],['255',{...item,catalogId:''}],['255',{...item,id:null}]])assert.throws(()=>representationKey(id,point),/representation identity/)
  const results=searchLandmarks([{config,landmarks:data.landmarks}],'shared')
  assert.deepEqual(results.title.map(result=>[result.mapId,result.catalogId,result.point.id]),[['255','10144','913193'],['255','10157','913193']])
  assert.equal(results.title[0].point,item);assert.equal(results.title[1].point,quest)
  assert.equal(results.title[0].catalogName,'Category fixture 10144');assert.equal(results.title[1].catalogName,'Category fixture 10157')
  assert.deepEqual(countByCatalog(data.landmarks),{'10144':1,'10157':1})
  const complete=localStateModel.toggleCompletion(localStateModel.emptyLocalState(),'913193')
  assert.deepEqual(complete.completedIds,['913193'])
  assert.deepEqual(filterLandmarks(data.landmarks,{catalogIds:['10144','10157'],completionFilter:'completed',completedIds:new Set(complete.completedIds)}),data.landmarks)
  assert.deepEqual(filterLandmarks(data.landmarks,{catalogIds:['10144','10157'],completionFilter:'incomplete',completedIds:new Set(complete.completedIds)}),[])
})

await test('All direct English owners reject Han fixtures; source configuration preserves null, false, zero and omission', () => {
  for(const owner of ['map','group','catalog']) {
    const invalid=structuredClone(manifest)
    const target=owner==='map'?invalid.maps[0]:owner==='group'?invalid.maps[0].catalogGroups[0]:invalid.maps[0].catalogGroups[0].catalogs[0]
    target[owner==='map'?'mapName':'name']=String.fromCodePoint(0x4e00)
    assert.throws(()=>validateManifest(invalid),/English content.*No source-language fallback/)
  }
  for(const field of ['name','description']) {
    const invalid=structuredClone(data);invalid.landmarks[0][field]=String.fromCodePoint(0x4e00)
    assert.throws(()=>validatePoints(map,invalid),/English landmark content.*No source-language fallback/)
  }
  const legal=structuredClone(manifest)
  for(const config of legal.maps) {
    config.useNewMapEngine=false;config.areas=null
    Object.assign(config.catalogGroups[0].catalogs[0],{regionType:0,showLandmarkName:false})
    Object.assign(config.catalogGroups[0].catalogs[1],{regionType:null,showLandmarkName:null})
    delete config.catalogGroups[0].catalogs[2].showLandmarkName
  }
  const before=structuredClone(legal)
  assert.equal(validateManifest(legal),legal);assert.deepEqual(legal,before)
  for(const [owner,field,value] of [['map','useNewMapEngine',0],['map','areas',{}],['catalog','regionType','0'],['catalog','showLandmarkName',0]]) {
    const invalid=structuredClone(manifest)
    const target=owner==='map'?invalid.maps[0]:invalid.maps[0].catalogGroups[0].catalogs[0]
    target[field]=value;assert.throws(()=>validateManifest(invalid),/incomplete or invalid/)
  }
})

await test('Actual map choices preserve all eight source IDs and base/ref navigation; mobile cancellation writes nothing', async t => {
  const ids=['251','252','253','254','255','256','257','258']
  for(const mobile of [false,true])for(const base of ['/','/pbz-map/']) {
    const app=appSetup({base,search:'?ref=fixture&mapId=251',navigator:{userAgent:mobile?'iPhone':'Macintosh'}})
    t.after(()=>app.unmount());await app.run('start()')
    if(mobile)app.byTestId('open-maps').props.onClick()
    const choices=app.nodes().filter(node=>node.type==='a'&&node.props?.['data-map-id'])
    assert.deepEqual(choices.map(node=>node.props['data-map-id']),ids)
    assert.deepEqual(choices.map(node=>templateText(node)),['Weeping Creek Valley','Crimson Forest','Village of Lu','Pangzhen','Mandate Encampment','Meigu Lake','Mountain of Imprisonment','Mount Soulrend'])
    assert.equal(choices[0].props['aria-current'],'page')
    assert.equal(choices.at(-1).props.href,`${base}?mapId=258&ref=fixture`)
    if(mobile) {
      app.nodes().find(node=>node.type==='button'&&templateText(node)==='Cancel').props.onClick()
      assert.equal(app.run('mobilePanel.value'),null);assert.equal(app.browser.location.href,`${base}?ref=fixture&mapId=251`)
      app.byTestId('open-maps').props.onClick()
    }
    app.nodes().find(node=>node.type==='a'&&node.props?.['data-map-id']==='258').props.onClick({preventDefault(){}})
    assert.equal(app.browser.location.href,`${base}?mapId=258&ref=fixture`)
    assert.deepEqual(app.writes,[])
  }
})

await test('The desktop whole panel retracts without collapsing source category headings or replacing the map container classes', async t => {
  const app=appSetup();t.after(()=>app.unmount());await app.run('start()')
  const toggle=()=>app.nodes().find(node=>node.props?.['aria-controls']==='map-controls')
  assert.equal(toggle().props['aria-expanded'],true)
  toggle().props.onClick();assert.equal(app.run('panelExpanded.value'),false)
  assert.ok(app.nodes().find(node=>node.type==='aside').props.class.includes('is-retracted'))
  assert.equal(app.nodes().find(node=>node.props?.id==='map-controls').props.inert,true)
  assert.equal(app.nodes().filter(node=>node.type==='details').length,0)
  toggle().props.onClick();assert.equal(app.run('panelExpanded.value'),true)
  assert.deepEqual(app.writes,[])
})

await test('Category controls use owning ordinary/selected icons, immediate filters, zero categories and exclusive-area-safe select all', async t => {
  const app=appSetup();t.after(()=>app.unmount());await app.run('start()')
  const category=id=>app.nodes().find(node=>node.type==='button'&&node.props?.['data-catalog-id']===id)
  const bell=map.catalogGroups[0].catalogs[0]
  assert.equal(templateNodes(category(bell.id)).find(node=>node.type==='img').props.src,bell.iconSelectedUrl)
  category(bell.id).props.onClick();await Vue.nextTick()
  assert.equal(category(bell.id).props['aria-pressed'],false)
  assert.equal(templateNodes(category(bell.id)).find(node=>node.type==='img').props.src,bell.iconUrl)
  assert.equal(app.run('visibleLandmarks.value.some(point=>point.catalogId==="9907")'),false)
  const empty=catalogs.find(catalog=>catalog.count===0)
  assert.ok(category(empty.id),'Configured zero-count categories remain selectable')
  assert.ok(templateText(category(empty.id)).endsWith('0'))
  app.run('manifest.value.maps[0].catalogGroups[0].catalogs[0].regionType=1;manifest.value.maps[0].catalogGroups[0].catalogs[1].regionType=1;selectedCatalogIds.value=[]')
  app.run('toggleCatalog("9907");toggleCatalog("9910")')
  assert.deepEqual(Array.from(app.run('selectedCatalogIds.value')),['9910'])
  app.run('toggleAllCatalogs()');assert.equal(app.run('selectedCatalogIds.value.includes("9910")'),true)
  assert.equal(app.run('selectedCatalogIds.value.includes("9907")'),false)
  app.run('toggleAllCatalogs()');assert.deepEqual(Array.from(app.run('selectedCatalogIds.value')),['9910'])
  assert.deepEqual(app.writes,[])
})

await test('Actual completion filters share state, ignore repeated/loading selections and never write progress by themselves', async t => {
  const app=appSetup();t.after(()=>app.unmount());await app.run('start()')
  app.run('localState.value=toggleCompletion(localState.value,"912566")')
  app.byTestId('completion-completed').props.onClick();await Vue.nextTick()
  assert.deepEqual(Array.from(app.run('visibleLandmarks.value'),point=>point.id),['912566'])
  app.byTestId('completion-completed').props.onClick();assert.equal(app.run('completionFilter.value'),'completed')
  app.byTestId('completion-all').props.onClick();assert.equal(app.run('completionFilter.value'),null)
  app.run('loading.value=true');app.byTestId('completion-incomplete')?.props.onClick()
  app.run('setCompletionFilter("incomplete")');assert.equal(app.run('completionFilter.value'),null)
  app.run('loading.value=false');app.byTestId('completion-incomplete').props.onClick();await Vue.nextTick()
  assert.equal(app.run('visibleLandmarks.value.some(point=>point.id==="912566")'),false)
  assert.deepEqual(app.writes,[])
})

await test('The marker-name preference is separate from saved progress and Canvas obeys the actual per-category zoom flag', async t => {
  const stored=new Map([['mapMakerNameSwitch-251,252,253,254,255,256,257,258','false']])
  const app=appSetup({stored});t.after(()=>app.unmount());await app.run('start()')
  assert.equal(app.run('showMarkerNames.value'),false)
  app.storage.failWrites=true;app.byTestId('marker-names').props.onClick()
  assert.equal(app.run('showMarkerNames.value'),false);assert.match(app.run('preferenceError.value'),/could not be saved/)
  app.storage.failWrites=false;app.byTestId('marker-names').props.onClick();assert.equal(app.run('showMarkerNames.value'),true)
  assert.deepEqual(app.writes,['mapMakerNameSwitch-251,252,253,254,255,256,257,258'])
  for(const config of productionManifest.maps) {
    assert.equal(config.useNewMapEngine,true);assert.equal(config.areas,null)
    const points=productionCollections.find(row=>row.mapId===config.id).landmarks
    const canvas=canvasLifecycle(config,false,'/',config.minZoom)
    t.after(()=>canvas.unmount())
    canvas.props.landmarks=points
    const point=points[0]
    canvas.map.setView(positionToLatLng(config.center),config.maxZoom-6)
    assert.equal(canvas.run('markerNamesVisible(props.landmarks[0])'),false)
    canvas.map.setView(positionToLatLng(config.center),config.maxZoom-5)
    const group=config.catalogGroups.find(group=>group.catalogs.some(catalog=>catalog.id===point.catalogId))
    assert.equal(canvas.run('markerNamesVisible(props.landmarks[0])'),['group-1','group-6','group-7','group-8','group-9'].includes(group.id)
      && allCatalogs(config).find(catalog=>catalog.id===point.catalogId).showLandmarkName === true)
    const icon=canvas.run('sourceIcon(props.landmarks[0])')
    const label=icon.html.children.find(child=>child.className==='poi-name')
    if(label) {
      assert.equal(label.textContent,point.name);assert.equal(label.style.color,config.landmarkNameColor)
      assert.ok(label.style.textShadow.includes(config.landmarkNameBackgroundColor))
    }
    assert.deepEqual(Array.from(icon.iconSize),[config.defaultIconSize,config.defaultIconSize])
    canvas.props.showMarkerNames=false;assert.equal(canvas.run('markerNamesVisible(props.landmarks[0])'),false)
  }
})

await test('Current eight-map configurations do not fabricate an area selector, and mobile panels keep separate dismissal and group state', async t => {
  const app=appSetup({navigator:{userAgent:'iPhone'}});t.after(()=>app.unmount());await app.run('start()')
  for(const config of manifest.maps) {
    await app.run(`changeMap(${JSON.stringify(config.id)})`)
    assert.equal(config.areas,null);assert.equal(allCatalogs(config).every(catalog=>catalog.regionType===0),true)
    assert.equal(app.nodes().some(node=>node.props?.['data-testid']==='area-select'),false)
    app.byTestId('open-filters').props.onClick()
    assert.equal(app.run('mobileGroupId.value'),config.catalogGroups[0].id)
    const groupButtons=app.nodes().find(node=>node.props?.['aria-label']==='Category groups').children
    assert.ok(groupButtons)
    app.run(`mobileGroupId.value=${JSON.stringify(config.catalogGroups.at(-1).id)}`)
    const view=app.nodes().find(node=>node.type==='button'&&templateText(node)==='View markers')
    view.props.onClick();assert.equal(app.run('mobilePanel.value'),null)
    app.byTestId('open-filters').props.onClick();assert.equal(app.run('mobileGroupId.value'),config.catalogGroups[0].id)
    app.byTestId('open-settings')?.props.onClick()
    app.run('openMobilePanel("settings")');assert.equal(app.run('mobilePanel.value'),'settings')
    app.byTestId('open-search').props.onClick();assert.equal(app.run('mobilePanel.value'),null);assert.equal(app.run('searchOpen.value'),true)
    app.byTestId('cancel-search').props.onClick();assert.equal(app.run('searchOpen.value'),false)
  }
  assert.deepEqual(app.writes,[])
})

await test('Actual App search, Canvas marker/popup selection and completion preserve both 913193 representations', async t => {
  const app=appSetup();t.after(()=>app.unmount());await app.run('start()');await app.run('changeMap("255")')
  await beginSearch(app,'shared');await app.advance(500)
  const itemNode=resultNode(app,'255','913193','10144'),questNode=resultNode(app,'255','913193','10157')
  assert.ok(itemNode);assert.ok(questNode);assert.notEqual(itemNode.key,questNode.key)
  assert.ok(templateText(itemNode).includes('Shared item fixture'));assert.ok(templateText(questNode).includes('Shared quest fixture'))
  questNode.props.onClick();assert.equal(app.browser.location.href,'/?mapId=255&name=Shared%20quest%20fixture')
  assert.equal(app.stored.get('pbz-map:255:search-name'),'Shared quest fixture')
  app.run('closeSearch(true);completionFilter.value=null;selectedCatalogIds.value=["10144","10157"];selection.value={kind:"landmark",id:"913193",catalogId:"10144",source:"marker"}')
  await Vue.nextTick();assert.equal(app.run('selection.value.catalogId'),'10144')
  app.run('selectedCatalogIds.value=["10157"]');await Vue.nextTick();assert.equal(app.run('selection.value'),null,'An equal canonical ID in another category cannot retain hidden detail')
  app.run('selectedCatalogIds.value=["10144","10157"];completionFilter.value="incomplete";selection.value={kind:"landmark",id:"913193",catalogId:"10157",source:"marker"}')
  app.run('markComplete("913193")');await Vue.nextTick()
  assert.deepEqual(app.run('localState.value.completedIds'),['913193']);assert.equal(app.run('visibleLandmarks.value.length'),0);assert.equal(app.run('selection.value'),null)
  assert.deepEqual(JSON.parse(app.stored.get('pbz-map:255:state')).completedIds,['913193'])
  const config=manifest.maps.find(row=>row.id==='255'),points=fixtureCollections.find(row=>row.mapId==='255').landmarks
  const canvas=canvasLifecycle(config);t.after(()=>canvas.unmount())
  Object.assign(canvas.props,{landmarks:points,visibleLandmarks:points})
  canvas.run('renderLandmarks()');assert.equal(canvas.run('poiMarkers.size'),2)
  assert.deepEqual(canvas.layers[0].markers.map(marker=>marker.position),points.map(point=>positionToLatLng(point.position)))
  for(const [index,point] of points.entries()) {
    canvas.layers[0].markers[index].events.get('click')({})
    assert.equal(canvas.emissions.at(-1)[1].catalogId,point.catalogId);assert.equal(canvas.emissions.at(-1)[1].id,'913193')
    canvas.props.selection={kind:'landmark',id:'913193',catalogId:point.catalogId,source:'marker'}
    canvas.run('renderSelection()')
    assert.equal(canvas.popup.content.dataset.representationKey,representationKey(config,point))
    const nodes=domNodes(canvas.popup.content)
    assert.equal(nodes.find(node=>node.className==='place-name').textContent,point.name)
    assert.equal(nodes.find(node=>node.className==='place-description').textContent,point.description)
    assert.equal(nodes.find(node=>node.className==='place-category').textContent,`Category fixture ${point.catalogId}`)
    assert.deepEqual(canvas.popup.position,positionToLatLng(point.position))
    const selected=canvas.layers[0].markers.filter(marker=>marker.options.icon.className.includes('is-selected'))
    assert.equal(selected.length,1);assert.deepEqual(selected[0].position,positionToLatLng(point.position))
    nodes.find(node=>node.dataset.action==='toggle-complete').events.get('click')()
    assert.deepEqual(canvas.emissions.at(-1),['toggle-complete','913193'])
  }
  canvas.props.completedIds=new Set(['913193']);canvas.run('renderLandmarks()')
  assert.equal(canvas.layers[0].markers.every(marker=>marker.options.icon.className.includes('is-complete')),true)
  assert.equal(canvas.run('snapshot().completedCount'),1)
})

await test('Actual mobile detail keeps complete owning content, 513px branch, ordered local anchors, close and separate locate actions', async t => {
  const config=manifest.maps.find(row=>row.id==='255'),points=fixtureCollections.find(row=>row.mapId==='255').landmarks
  for(const base of ['/','/pbz-map/']) {
    const canvas=canvasLifecycle(config,false,base,null,{mobile:true,landmarks:points,visibleLandmarks:points,selection:{kind:'landmark',id:'913193',catalogId:'10157',source:'marker'}})
    t.after(()=>canvas.unmount());await canvas.run('syncMobileDetail()');await Vue.nextTick()
    assert.equal(canvas.popup.open,false);assert.equal(canvas.run('mobileDetailHeight.value'),513)
    for(const timer of canvas.timers.values()) {assert.equal(timer.delay,500);timer.callback()}
    assert.equal(canvas.scroller.style.height,'472px');assert.equal(canvas.scroller.scrollTop,0)
    const nodes=canvas.nodes();const detail=nodes.find(node=>node.props?.['data-representation-key'])
    assert.equal(detail.props['data-catalog-id'],'10157');assert.ok(detail.props.style.height==='513px')
    assert.equal(templateText(nodes.find(node=>node.props?.class==='place-description')),points[1].description)
    const prefix=base==='/'?'':'/pbz-map'
    const imageNodes=templateNodes(nodes.find(node=>node.props?.class==='place-images'))
    assert.deepEqual(imageNodes.filter(node=>node.type==='img').map(node=>node.props.src),points[1].images.map(path=>prefix+path))
    assert.deepEqual(imageNodes.filter(node=>node.type==='a').map(node=>node.props.href),points[1].images.map(path=>prefix+path))
    nodes.find(node=>node.props?.['data-action']==='toggle-complete').props.onClick()
    assert.deepEqual(canvas.emissions.at(-1),['toggle-complete','913193'])
    nodes.find(node=>node.props?.class==='detail-overlay').props.onClick();assert.deepEqual(canvas.emissions.at(-1),['select',null])
    assert.equal(canvas.calls.some(call=>call?.method==='setView'),false)
    nodes.find(node=>node.props?.['data-action']==='locate').props.onClick()
    assert.equal(canvas.calls.at(-1).zoom,config.maxZoom);assert.deepEqual(canvas.calls.at(-1).position,positionToLatLng(points[1].position))
    canvas.map.setView(positionToLatLng(config.center),config.minZoom)
    canvas.exposed.locateAtCurrentZoom(points[0]);assert.equal(canvas.calls.at(-1).zoom,config.minZoom)
  }
})

await test('Clear completion confirmation cancels, waits 300ms, rejects stale/in-flight actions and preserves independent pins/maps', async t => {
  const app=appSetup();t.after(()=>app.unmount());await app.run('start()')
  const state={version:1,completedIds:['912566','retained-unknown-id'],pins:[{id:'kept-pin',position:[-0.45,0.6]}]}
  app.stored.set('pbz-map:251:state',JSON.stringify(state));app.run('localState.value=loadLocalState(window.localStorage,"251")')
  app.stored.set('pbz-map:254:state','untouched-other-map')
  app.byTestId('reset-progress').props.onClick();await Vue.nextTick()
  assert.equal(app.run('confirmation.value.kind'),'clear-completion');assert.deepEqual(app.writes,[])
  app.byTestId('cancel-confirmation').props.onClick();await app.advance(300)
  assert.deepEqual(app.run('localState.value'),state);assert.deepEqual(app.writes,[])
  app.byTestId('reset-progress').props.onClick();app.byTestId('confirm-confirmation').props.onClick();app.run('finishConfirmation(true)')
  await app.advance(299);assert.deepEqual(app.writes,[])
  await app.advance(1);assert.deepEqual(app.run('localState.value.completedIds'),[]);assert.deepEqual(app.run('localState.value.pins'),state.pins)
  assert.deepEqual(app.writes,['pbz-map:251:state']);assert.equal(app.stored.get('pbz-map:254:state'),'untouched-other-map')
  app.run('markComplete("912566")');app.byTestId('reset-progress').props.onClick();app.storage.failWrites=true
  app.byTestId('confirm-confirmation').props.onClick();await app.advance(300)
  assert.deepEqual(app.run('localState.value.completedIds'),['912566']);assert.match(app.run('storageError.value'),/No marker changes were applied/)
  app.storage.failWrites=false;app.byTestId('reset-progress').props.onClick();app.byTestId('confirm-confirmation').props.onClick()
  const before=app.stored.get('pbz-map:251:state');await app.run('changeMap("252")');await app.advance(300)
  assert.equal(app.stored.get('pbz-map:251:state'),before);assert.equal(app.run('confirmation.value'),null)
})

await test('Desktop local pin creation stages/cancels before save; mobile commits the current map center, not a clicked source submission', async t => {
  for(const mobile of [false,true]) {
    const app=appSetup({navigator:{userAgent:mobile?'iPhone':'Macintosh'}});t.after(()=>app.unmount());await app.run('start()')
    app.byTestId('add-pin').props.onClick();assert.equal(app.run('addPinMode.value'),true)
    app.run('mapCanvas.value={getCenterPosition:()=>[-0.55,0.65]};placePin([-0.45,0.6])')
    assert.deepEqual(app.writes,[]);assert.equal(app.run('localState.value.pins.length'),0)
    app.run('cancelPinMode({key:"Escape"})');assert.equal(app.run('addPinMode.value'),false);assert.equal(app.run('draftPinPosition.value'),null)
    app.byTestId('add-pin').props.onClick();app.run('placePin([-0.45,0.6])');app.storage.failWrites=true
    app.byTestId('confirm-pin').props.onClick();assert.equal(app.run('localState.value.pins.length'),0);assert.equal(app.run('addPinMode.value'),true)
    app.storage.failWrites=false;app.byTestId('confirm-pin').props.onClick()
    assert.equal(app.run('addPinMode.value'),false);assert.equal(app.run('localState.value.pins.length'),1)
    assert.deepEqual(Array.from(app.run('localState.value.pins[0].position')),mobile?[-0.55,0.65]:[-0.45,0.6])
    assert.deepEqual(app.writes,['pbz-map:251:state']);assert.deepEqual(app.run('localState.value.completedIds'),[])
  }
})

await test('Single custom-pin deletion and Clear pins have distinct confirmation/cancel semantics without clearing completion', async t => {
  for(const mobile of [false,true]) {
    const app=appSetup({navigator:{userAgent:mobile?'iPhone':'Macintosh'}});t.after(()=>app.unmount());await app.run('start()')
    app.run('localState.value={version:1,completedIds:["912566"],pins:[{id:"pin-a",position:[-0.45,0.6]},{id:"pin-b",position:[-0.55,0.7]}]};selection.value={kind:"pin",id:"pin-a",source:"pin"};removePin("pin-a")')
    assert.deepEqual(app.writes,[])
    if(mobile) {
      assert.equal(app.run('pinDeleteSheet.value.id'),'pin-a')
      app.nodes().find(node=>node.type==='button'&&templateText(node)==='Cancel').props.onClick();assert.equal(app.run('pinDeleteSheet.value'),null)
      app.run('removePin("pin-a")');app.byTestId('confirm-delete-pin').props.onClick()
    } else {
      app.byTestId('cancel-confirmation').props.onClick();await app.advance(300);assert.equal(app.run('localState.value.pins.length'),2)
      app.run('removePin("pin-a")');app.byTestId('confirm-confirmation').props.onClick();await app.advance(300)
    }
    assert.deepEqual(Array.from(app.run('localState.value.pins'),pin=>pin.id),['pin-b'])
    assert.deepEqual(Array.from(app.run('localState.value.completedIds')),['912566']);assert.equal(app.run('selection.value'),null)
    app.run('clearPins()');app.byTestId('confirm-confirmation').props.onClick();await app.advance(300)
    assert.equal(app.run('localState.value.pins.length'),0);assert.deepEqual(Array.from(app.run('localState.value.completedIds')),['912566'])
    assert.deepEqual(app.writes,['pbz-map:251:state','pbz-map:251:state'])
  }
})

await test('Eight-map Canvas viewport contracts keep native/display zoom, no invented pan clamp and read-only canonical completion observations', t => {
  for(const config of manifest.maps) {
    const canvas=canvasLifecycle(config);t.after(()=>canvas.unmount())
    assert.equal(canvas.mapOptions.boxZoom,false);assert.equal(canvas.mapOptions.keyboard,true)
    assert.equal(Object.hasOwn(canvas.mapOptions,'maxBounds'),false)
    assert.equal(canvas.tiles.options.maxNativeZoom,config.id==='254'?14:13)
    assert.deepEqual(canvas.tiles.options.bounds,boundsToLatLngBounds([-1.4,0,0,1.4]))
    canvas.run('zoomIn();zoomOut()');assert.deepEqual(canvas.calls.slice(-2),['zoomIn','zoomOut'])
    canvas.fire('moveend');assert.equal(canvas.element.pbzMapSnapshot.activeMapId,config.id)
    assert.equal(Object.getOwnPropertyDescriptor(canvas.element,'pbzMapSnapshot').set,undefined)
    assert.equal(canvas.emissions.length,0)
    canvas.tiles.events.get('tileerror')();assert.deepEqual(canvas.emissions.at(-1),['resource-error','tile'])
    canvas.props.addPinMode=true;canvas.props.canSave=true
    canvas.fire('click',{latlng:{lng:-0.5,lat:0.5}});assert.deepEqual(Array.from(canvas.emissions.at(-1)[1]),[-0.5,0.5])
    canvas.fire('click',{latlng:{lng:1,lat:1}});assert.deepEqual(canvas.emissions.at(-1),['outside-map'])
  }
})

// Independent source-bound control identities. These are not read from component
// constants, generated bundles or the media files being tested.
const expectedControlAssets = {
  retract: { path: '/assets/icons/52f882e3b2dff17a986ba703227c112c3379b6ca276046bff2055a7552e0cbe4.png', sha256: '930ef8ae8fa16966aa2f7eeaaeba51ea5bc4d91e1d070990b6beb21a23545361', bytes: 632 },
  addPin: { path: '/assets/icons/b1c4de01fb338582547dd1c17350c3ac2105036e052351f6607dd4e1d6a4b7f8.png', sha256: 'fe37c6e3fd298ce8cadc8a449db0827969cbbe70a7c13f40ce9ee68ad592d01e', bytes: 2092 },
  search: { path: '/assets/icons/1e784e6caff34457acef9bef1fe02c84970fb215a409bbde649727e5f2c2da43.png', sha256: '9180d5a7386fd32186ccdbfe24389a2e7d960acc658e91b3e206ad878ba6a360', bytes: 3131 },
  zoomIn: { path: '/assets/icons/af5bf0cf8e8a4c7a5c59f79f3abf05218ef38e913324e445702b2bbea985bfe0.png', sha256: '007ce25536af74d38b519d34c00794068f6afe2022d79741dd2e41edafb3323a', bytes: 1824 },
  zoomOut: { path: '/assets/icons/311163759c6986b6ecaea30ca596c131a09065572e44751b1976125b5318c8ee.png', sha256: '96d2b490efaa0ae883a80136f51d8fb3391afeab4048244d69732b0e6a92f105', bytes: 1655 },
  mobileSettings: { path: '/assets/icons/52628858a58728efd9b842a8869fdb38544e16a8fc77d168f0a9768544d94348.png', sha256: 'bf7802650ab89b0b30c1995a2763d74b1493285d4329689f172ddefc26fbfa07', bytes: 741 },
  mobileSearch: { path: '/assets/icons/d162033fb38941cffcf5b5f1861017dfc2d70fd65c3090e90664d6fa77fc3093.png', sha256: '79d5cd472f86fc7f0e5abfe5c906ba48bed9aefa45982d84e931271398058dd4', bytes: 2102 },
  mobileMaps: { path: '/assets/icons/833705dd7f86f6a2a5d252ae6731a18bc27df61aa7a388b5e61bbc8cdc4ed1b7.png', sha256: '22b4b9619604a08cf10efb3859d7ce298652354af905b3ad1c40143006a4ff2a', bytes: 8009 },
  mobileAddPin: { path: '/assets/icons/40541d5ca567f91d826c68d740508d7c90b12d4fa779561ec4d0c00979cebab2.png', sha256: '01b1fd65ca45d60049b1eefa9e46e52b1c01edaa87a0e9cbbefd8c3ff904fad6', bytes: 1353 },
  mobileFilters: { path: '/assets/icons/033ad009273fb1937fc4475f667f308f08487d8d47619919bc2a8fe527d9d1ff.png', sha256: 'ab9a90be7a86ff1c2ab9cc3a0e31167d7d26f1a00a9d14186e17217ed6a01c78', bytes: 2216 },
  mobileSelected: { path: '/assets/icons/fd481223779d8b124328832a054fa62c4e73a1365145aea892d7e5f39a8102a1.png', sha256: '8149a5f93b5aeb52fc5bb5dcedd851161fe007b847d74c88c5b415c3524da1cc', bytes: 706 },
  locate: { path: '/assets/icons/6146781c3c089cec3bf51d2edc50ef53a7de3cb661df3549ad63d1ca7dfda545.svg', sha256: '31688d4ece168ba6022dbddda9a08b0cd9322b30c3a9b78d0f6eceed23625cfb', bytes: 790 },
  close: { path: '/assets/icons/e012989b512e5a728bbe7cec071db3784d5ca11bd773dc868d9b7a84ccabbcdc.svg', sha256: '23bbd4f56a8d80e670a8f2699f4c9db5e11c7041ee8e159bce3a944a312003d4', bytes: 384 },
  complete: { path: '/assets/icons/3102bb9d8a60e917dfedee8398583bbb1c275e20a789fa4f393f51868fac5c43.svg', sha256: '22f3c67ee003a677aaa82e2f5f583b485780eae1e7c8405f5b4969cff8423154', bytes: 370 },
}

for (const [id, effectiveLeafletCenter] of [
  ['251', [0.39407782838529215, -0.6898578428422013]],
  ['252', [0.5101784981668658, -0.820552571139558]],
  ['253', [0.4512893716765518, -0.5842706187644353]],
  ['254', [0.5487435450189508, -0.40520260580467493]],
  ['255', [0.7, -0.7]], ['256', [0.7, -0.7]], ['257', [0.7, -0.7]], ['258', [0.7, -0.7]],
]) {
  await test(`Actual Canvas initial rendering and Reset view use the source-effective center for ${id} without rewriting raw data`, t => {
    const config = manifest.maps.find(value => value.id === id)
    const before = structuredClone(config)
    for (const initialZoom of [null, config.minZoom]) {
      const canvas = canvasLifecycle(config, false, '/', initialZoom)
      t.after(() => canvas.unmount())
      assert.deepEqual(Array.from(canvas.mapOptions.center), effectiveLeafletCenter)
      assert.deepEqual(Array.from(canvas.exposed.getCenterPosition()), [effectiveLeafletCenter[1], effectiveLeafletCenter[0]])
      assert.equal(canvas.mapOptions.zoom, initialZoom ?? config.defaultZoom)
      canvas.map.setView([0.3, -0.2], config.maxZoom)
      canvas.exposed.resetView()
      assert.deepEqual(Array.from(canvas.calls.at(-1).position), effectiveLeafletCenter)
      assert.equal(canvas.calls.at(-1).zoom, config.defaultZoom)
      assert.equal(canvas.calls.at(-1).options.animate, false)
      assert.deepEqual(canvas.calls.slice(-3, -1), ['close', 'stop'])
      assert.deepEqual(config, before, 'Rendering must not normalize saved raw centers, bounds or display configuration')
    }
  })
}

await test('Generic Canvas center semantics handle each zero/null axis independently and leave other engines and nonzero values unchanged', t => {
  for (const [center, engine, expected] of [
    [[0, 0], true, [0.7, -0.7]], [[null, null], true, [0.7, -0.7]],
    [[0, 1.1], true, [1.1, -0.7]], [[-1.1, 0], true, [0.7, -1.1]],
    [[null, 1.1], true, [1.1, -0.7]], [[-1.1, null], true, [0.7, -1.1]],
    [[-0.8, 0.9], true, [0.9, -0.8]], [[0, 0], false, [0, 0]], [[0, 1.1], undefined, [1.1, 0]],
  ]) {
    const config = { ...structuredClone(map), id: 'unrelated-fixture-map', center, useNewMapEngine: engine }
    if (engine === undefined) delete config.useNewMapEngine
    const before = structuredClone(config)
    const canvas = canvasLifecycle(config)
    t.after(() => canvas.unmount())
    assert.deepEqual(Array.from(canvas.mapOptions.center), expected)
    canvas.map.setView([0.5, -0.5], config.maxZoom)
    canvas.exposed.resetView()
    assert.deepEqual(Array.from(canvas.calls.at(-1).position), expected)
    assert.deepEqual(config, before)
  }
})

await test('The four source display fields and ordered sibling IDs remain exact independent configuration data', () => {
  const expected = [
    ['251', 32, '#FFFFFF', '#161413'], ['252', 32, '#F3FFE1', '#0F0B09'],
    ['253', 32, '#F3FFE1', '#0F0B09'], ['254', 24, '#F3FFE1', '#0F0B09'],
    ['255', 32, '#F3FFE1', '#0F0B09'], ['256', 32, '#F3FFE1', '#0F0B09'],
    ['257', 32, '#F3FFE1', '#0F0B09'], ['258', 32, '#F3FFE1', '#0F0B09'],
  ]
  assert.deepEqual(manifest.maps.map(config => [config.id, config.defaultIconSize, config.landmarkNameColor, config.landmarkNameBackgroundColor]), expected)
  assert.deepEqual(manifest.maps.map(config => config.id), ['251', '252', '253', '254', '255', '256', '257', '258'])
  for (const config of manifest.maps) {
    assert.equal(config.siblingMapIds, '251,252,253,254,255,256,257,258')
    assert.equal(config.useNewMapEngine, true)
    assert.equal(config.areas, null)
  }
})

// Join the two actual component setups at their compiled template event/prop
// boundary. Only browser/Leaflet APIs are doubled; no alternate component is used.
function appCanvasBridge(app, base, t) {
  const component = () => app.nodes().find(node => node.type === 'MapCanvas')
  const inputs = props => ({
    landmarks: props.landmarks, visibleLandmarks: props['visible-landmarks'], completedIds: props['completed-ids'],
    pins: props.pins, selection: props.selection, addPinMode: props['add-pin-mode'], pendingPinPosition: props['pending-pin-position'],
    canSave: props['can-save'], mobile: props.mobile, showMarkerNames: props['show-marker-names'],
  })
  const initial = component().props
  const canvas = canvasLifecycle(initial.config, initial['add-pin-mode'], base, initial['initial-zoom'], inputs(initial))
  t.after(() => canvas.unmount())
  const dispatch = () => {
    const [event, value] = canvas.emissions.at(-1)
    const key = { select: 'onSelect', 'toggle-complete': 'onToggleComplete' }[event]
    assert.equal(typeof component().props[key], 'function', `Missing real component listener for ${event}`)
    component().props[key](value)
  }
  return {
    canvas,
    sync() { Object.assign(canvas.props, inputs(component().props)); canvas.run('renderLandmarks(); renderPins(); renderSelection()') },
    select(id, catalogId) {
      const index = canvas.props.visibleLandmarks.findIndex(point => point.id === id && point.catalogId === catalogId)
      assert.ok(index >= 0)
      canvas.layers[0].markers[index].events.get('click')({})
      dispatch()
    },
    toggle() {
      if (canvas.props.mobile) canvas.nodes().find(node => node.props?.['data-action'] === 'toggle-complete').props.onClick()
      else domNodes(canvas.popup.content).find(node => node.dataset.action === 'toggle-complete').events.get('click')()
      dispatch()
    },
    closed() {
      assert.equal(canvas.popup.open, false)
      assert.equal(canvas.nodes().some(node => node.props?.role === 'dialog'), false)
      assert.equal(canvas.run('poiMarkers.size'), canvas.props.visibleLandmarks.length)
    },
  }
}

for (const base of ['/', '/pbz-map/']) for (const mobile of [false, true]) for (const kind of ['url', 'name', 'keyword']) {
  await test(`Restored ${kind} completion and undo preserve scope, close excluded detail and honor failed saves (${mobile ? 'mobile' : 'desktop'}, ${base})`, async t => {
    const saved = { version: 1, completedIds: ['retained-unknown-id'], pins: [{ id: 'kept-pin', position: [-0.45, 0.6] }] }
    const serialized = JSON.stringify(saved)
    const stored = new Map([['pbz-map:251:state', serialized], ['pbz-map:254:state', 'untouched-other-map'], ['another-app:state', 'untouched']])
    const term = kind === 'url' ? 'Bells fixture' : kind === 'name' ? 'Primary fixture cave' : 'bridge'
    const scopeIds = kind === 'url' ? ['912566', '912250'] : kind === 'name' ? ['912566'] : ['912566', '912250', '912829']
    if (kind !== 'url') stored.set(`pbz-map:251:search-${kind}`, term)
    const app = appSetup({ base, stored, search: `?mapId=251&name=${encodeURIComponent(term)}`, navigator: { userAgent: mobile ? 'iPhone' : 'Macintosh' } })
    t.after(() => app.unmount())
    await app.run('start()')
    assert.equal(app.run('restoredSearch.value.kind'), kind)
    assert.equal(app.run('completionFilter.value'), 'incomplete')
    assert.deepEqual(Array.from(app.run('visibleLandmarks.value'), point => point.id), scopeIds)
    assert.deepEqual(app.writes, [])
    const bridge = appCanvasBridge(app, base, t)
    bridge.select('912566', '9907')
    await Vue.nextTick(); bridge.sync()
    assert.equal(app.run('selection.value.id'), '912566')
    if (mobile) assert.ok(bridge.canvas.nodes().find(node => node.props?.['data-representation-key']))
    else assert.equal(bridge.canvas.popup.open, true)

    app.storage.failWrites = true
    bridge.toggle()
    await Vue.nextTick(); bridge.sync()
    assert.deepEqual(app.run('localState.value'), saved)
    assert.equal(stored.get('pbz-map:251:state'), serialized)
    assert.equal(app.run('selection.value.id'), '912566')
    assert.deepEqual(Array.from(app.run('visibleLandmarks.value'), point => point.id), scopeIds)
    assert.match(app.run('storageError.value'), /No marker changes were applied/)
    assert.deepEqual(app.writes, [])

    app.storage.failWrites = false
    bridge.toggle()
    await Vue.nextTick(); bridge.sync()
    assert.deepEqual(app.run('localState.value.completedIds'), ['retained-unknown-id', '912566'])
    assert.deepEqual(Array.from(app.run('visibleLandmarks.value'), point => point.id), scopeIds.filter(id => id !== '912566'))
    assert.equal(app.run('selection.value'), null)
    bridge.closed()
    assert.equal(app.run('restoredSearch.value.kind'), kind)
    assert.deepEqual(Array.from(app.run('restoredSearch.value.landmarks'), point => point.id), scopeIds)
    assert.equal(app.run('storageError.value'), '')

    app.run('setCompletionFilter("completed")')
    await Vue.nextTick(); bridge.sync()
    assert.deepEqual(Array.from(app.run('visibleLandmarks.value'), point => point.id), ['912566'])
    bridge.select('912566', '9907')
    await Vue.nextTick(); bridge.sync()
    const completed = stored.get('pbz-map:251:state')
    app.storage.failWrites = true
    bridge.toggle()
    await Vue.nextTick(); bridge.sync()
    assert.equal(stored.get('pbz-map:251:state'), completed)
    assert.equal(app.run('selection.value.id'), '912566')
    assert.deepEqual(Array.from(app.run('visibleLandmarks.value'), point => point.id), ['912566'])
    app.storage.failWrites = false
    bridge.toggle()
    await Vue.nextTick(); bridge.sync()
    assert.deepEqual(Array.from(app.run('visibleLandmarks.value')), [])
    assert.equal(app.run('selection.value'), null)
    bridge.closed()
    for (const filter of [null, 'incomplete']) {
      app.run(`setCompletionFilter(${JSON.stringify(filter)})`)
      await Vue.nextTick(); bridge.sync()
      assert.deepEqual(Array.from(app.run('visibleLandmarks.value'), point => point.id), scopeIds, 'Changing completion state cannot expand a restored subset to the whole region')
      assert.equal(app.run('restoredSearch.value.kind'), kind)
    }
    await beginSearch(app, 'bridge')
    await app.advance(500)
    assert.deepEqual(groupedIds(app, 'title'), expectedSearchTitles)
    assert.equal(app.run('searchResultCount.value'), 12, 'Global search discovery stays independent of restored markers and completion')
    assert.deepEqual(Array.from(app.run('visibleLandmarks.value'), point => point.id), scopeIds)
    assert.equal(stored.get('pbz-map:251:state'), serialized)
    assert.deepEqual(app.run('localState.value'), saved)
    assert.equal(stored.get('pbz-map:254:state'), 'untouched-other-map')
    assert.equal(stored.get('another-app:state'), 'untouched')
    assert.deepEqual(app.writes, ['pbz-map:251:state', 'pbz-map:251:state'])
  })
}

for (const base of ['/', '/pbz-map/']) {
  await test(`Restored shared-ID markers retain both real category tuples but save exactly one canonical completion (${base})`, async t => {
    const saved = { version: 1, completedIds: ['retained-unknown-id'], pins: [{ id: 'kept-pin', position: [-0.45, 0.6] }] }
    const stored = new Map([['pbz-map:255:state', JSON.stringify(saved)], ['pbz-map:255:search-keyword', 'shared'], ['pbz-map:251:state', 'untouched-other-map']])
    const app = appSetup({ base, stored, search: '?mapId=255&name=+shared' })
    t.after(() => app.unmount()); await app.run('start()')
    const identities = () => Array.from(app.run('visibleLandmarks.value'), point => [point.id, point.catalogId, Array.from(point.position), point.z])
    const expected = [
      ['913193', '10144', [-0.7437984914378148, 1.0149717183482778], 400],
      ['913193', '10157', [-0.743648930242216, 1.0210237672753948], 400],
    ]
    assert.deepEqual(identities(), expected)
    const bridge = appCanvasBridge(app, base, t)
    assert.equal(bridge.canvas.run('poiMarkers.size'), 2)
    bridge.select('913193', '10157'); await Vue.nextTick(); bridge.sync()
    assert.equal(bridge.canvas.popup.content.dataset.catalogId, '10157')
    assert.equal(domNodes(bridge.canvas.popup.content).find(node => node.className === 'place-name').textContent, 'Shared quest fixture')
    app.storage.failWrites = true; bridge.toggle(); await Vue.nextTick(); bridge.sync()
    assert.deepEqual(identities(), expected)
    assert.equal(app.run('selection.value.catalogId'), '10157')
    assert.deepEqual(app.writes, [])
    app.storage.failWrites = false; bridge.toggle(); await Vue.nextTick(); bridge.sync()
    assert.deepEqual(Array.from(app.run('visibleLandmarks.value')), [])
    assert.equal(app.run('selection.value'), null); bridge.closed()
    assert.deepEqual(JSON.parse(stored.get('pbz-map:255:state')).completedIds, ['retained-unknown-id', '913193'])
    app.run('setCompletionFilter("completed")'); await Vue.nextTick(); bridge.sync()
    assert.deepEqual(identities(), expected)
    assert.equal(bridge.canvas.layers[0].markers.every(marker => marker.options.icon.className.includes('is-complete')), true)
    assert.equal(bridge.canvas.run('snapshot().completedCount'), 1)
    bridge.select('913193', '10144'); await Vue.nextTick(); bridge.sync()
    assert.equal(domNodes(bridge.canvas.popup.content).find(node => node.className === 'place-name').textContent, 'Shared item fixture')
    bridge.toggle(); await Vue.nextTick(); bridge.sync()
    assert.deepEqual(Array.from(app.run('visibleLandmarks.value')), []); bridge.closed()
    assert.deepEqual(app.run('localState.value'), saved)
    assert.equal(stored.get('pbz-map:251:state'), 'untouched-other-map')
    assert.deepEqual(app.writes, ['pbz-map:255:state', 'pbz-map:255:state'])
  })
}

await test('Actual mobile map choices retain name/ref once at each base without changing desktop behavior or forwarding platform gates', async t => {
  for (const base of ['/', '/pbz-map/']) for (const mobile of [false, true]) for (const name of ['Category A', 'A & B/+ name', '', ' representation', null]) {
    const search = `?mapId=251&ref=kept%20ref&isChannel=true${name === null ? '' : `&name=${encodeURIComponent(name)}`}`
    const app = appSetup({ base, search, navigator: { userAgent: mobile ? 'iPhone' : 'Macintosh' } })
    t.after(() => app.unmount()); await app.run('start()')
    if (mobile) app.byTestId('open-maps').props.onClick()
    const choices = app.nodes().filter(node => node.type === 'a' && node.props?.['data-map-id'])
    assert.deepEqual(choices.map(node => node.props['data-map-id']), ['251', '252', '253', '254', '255', '256', '257', '258'])
    const choice = choices.find(node => node.props['data-map-id'] === '258')
    const url = new URL(choice.props.href, 'https://local.invalid')
    assert.equal(url.pathname, base)
    assert.equal(url.searchParams.get('mapId'), '258')
    assert.equal(url.searchParams.get('ref'), 'kept ref')
    assert.equal(url.searchParams.has('name'), mobile && name !== null)
    if (mobile && name !== null) assert.equal(url.searchParams.get('name'), name)
    assert.deepEqual([...url.searchParams.keys()], mobile && name !== null ? ['mapId', 'name', 'ref'] : ['mapId', 'ref'])
    assert.equal(choice.props.href.includes('/pbz-map/pbz-map/'), false)
    choice.props.onClick({ preventDefault() {} })
    assert.equal(app.browser.location.href, choice.props.href)
    assert.deepEqual(app.writes, [])
    assert.deepEqual(app.opened, [])
  }
})

function assertControlImage(control, role, base) {
  assert.ok(control, `Missing existing control for ${role}`)
  const images = templateNodes(control).filter(node => node.type === 'img')
  const path = `${base === '/' ? '' : '/pbz-map'}${expectedControlAssets[role].path}`
  const image = images.find(node => node.props.src === path)
  assert.ok(image, `${role} must use its exact source-bound local image at ${base}`)
  assert.equal(image.props.alt, '')
  assert.equal(typeof image.props.onError, 'function')
  assert.doesNotMatch(image.props.src, /^(?:https?:)?\/\//)
  return image
}

for (const base of ['/', '/pbz-map/']) {
  await test(`All fourteen original controls use their corresponding actual App/Canvas local consumers once (${base})`, async t => {
    const desktop = appSetup({ base })
    t.after(() => desktop.unmount()); await desktop.run('start()')
    assertControlImage(desktop.nodes().find(node => node.props?.['aria-controls'] === 'map-controls'), 'retract', base)
    assertControlImage(desktop.byTestId('add-pin'), 'addPin', base)
    const searchImage = desktop.nodes().find(node => node.props?.class === 'search-field-icon')
    assertControlImage(searchImage, 'search', base)
    searchImage.props.onError()
    assert.equal(desktop.run('assetErrors.value.has("icon")'), true)
    assert.deepEqual(desktop.writes, [])

    const mobile = appSetup({ base, navigator: { userAgent: 'iPhone' } })
    t.after(() => mobile.unmount()); await mobile.run('start()')
    for (const [testId, role] of [['open-settings', 'mobileSettings'], ['open-search', 'mobileSearch'], ['open-maps', 'mobileMaps'], ['add-pin', 'mobileAddPin'], ['open-filters', 'mobileFilters']]) {
      assertControlImage(mobile.byTestId(testId), role, base)
    }
    mobile.byTestId('open-filters').props.onClick()
    const category = () => mobile.nodes().find(node => node.type === 'button' && node.props?.['data-catalog-id'] === '9907')
    assertControlImage(category(), 'mobileSelected', base)
    category().props.onClick(); await Vue.nextTick()
    assert.equal(templateNodes(category()).some(node => node.type === 'img' && node.props.src.endsWith(expectedControlAssets.mobileSelected.path)), false, 'Unselected categories cannot retain the selected overlay')
    assert.deepEqual(mobile.writes, [])

    const desktopCanvas = canvasLifecycle(map, false, base)
    t.after(() => desktopCanvas.unmount())
    for (const [label, role] of [['Zoom in', 'zoomIn'], ['Zoom out', 'zoomOut']]) {
      const button = desktopCanvas.nodes().find(node => node.props?.['aria-label'] === label)
      const image = assertControlImage(button, role, base)
      image.props.onError()
      assert.deepEqual(desktopCanvas.emissions.at(-1), ['resource-error', 'icon'])
      button.props.onClick()
      assert.equal(desktopCanvas.calls.at(-1), role)
    }
    const points = fixtureCollections.find(collection => collection.mapId === '255').landmarks
    const config = manifest.maps.find(config => config.id === '255')
    const mobileCanvas = canvasLifecycle(config, false, base, null, {
      mobile: true, landmarks: points, visibleLandmarks: points,
      selection: { kind: 'landmark', id: '913193', catalogId: '10157', source: 'marker' },
    })
    t.after(() => mobileCanvas.unmount())
    const nodes = mobileCanvas.nodes()
    const locate = nodes.find(node => node.props?.['data-action'] === 'locate')
    const close = nodes.find(node => node.props?.['aria-label'] === 'Close point details')
    const complete = nodes.find(node => node.props?.['data-action'] === 'toggle-complete')
    for (const [button, role] of [[locate, 'locate'], [close, 'close'], [complete, 'complete']]) assertControlImage(button, role, base)
    close.props.onClick(); assert.deepEqual(mobileCanvas.emissions.at(-1), ['select', null])
    complete.props.onClick(); assert.deepEqual(mobileCanvas.emissions.at(-1), ['toggle-complete', '913193'])
    locate.props.onClick(); assert.deepEqual(Array.from(mobileCanvas.calls.at(-1).position), [1.0210237672753948, -0.743648930242216])
  })
}

// Expected group identities and material identities are pinned from the captured
// source taxonomy, independently of the English-name selectors under test.
const sourceNamedGroupIds = new Set(['group-1', 'group-6', 'group-7', 'group-8', 'group-9'])
const sourceSoulMaterialIds = {
  '251': '10277', '252': '10278', '253': '10124', '254': '10125',
  '255': '10273', '256': '10274', '257': '10275', '258': '10276',
}
const sourceDefaultOff = config => config.catalogGroups.flatMap(group => group.catalogs
  .filter(catalog => ['group-4', 'group-5'].includes(group.id) || catalog.id === sourceSoulMaterialIds[config.id]))

await test('Exact business categories govern labels and defaults without substring matches or truthy flags', () => {
  const names = ['Locations', 'Quests', 'Characters', 'NPCs', 'Others', 'Enemies', 'Equipment', 'Equipments', 'Collectibles', 'Items', 'Upgrade Materials', 'Locations extra']
  const config = { catalogGroups: names.map((name, index) => ({ name, catalogs: [
    { id: `ordinary-${index}`, name: name === 'Enemies' ? 'Bosses' : 'Ordinary', defaultSelected: true, showLandmarkName: true },
    { id: `false-${index}`, name: 'Disabled', defaultSelected: false, showLandmarkName: false },
    { id: `null-${index}`, name: 'Unspecified', defaultSelected: null, showLandmarkName: null },
    { id: `string-${index}`, name: 'Invalid flag', defaultSelected: 'false', showLandmarkName: 'true' },
    { id: `material-${index}`, name: 'Soul Tempering Materials', defaultSelected: true, showLandmarkName: true },
  ] })) }
  assert.deepEqual(markerNameCatalogIds(config), [
    'ordinary-0', 'material-0', 'ordinary-1', 'material-1', 'ordinary-2', 'material-2',
    'ordinary-3', 'material-3', 'ordinary-4', 'material-4', 'ordinary-5',
  ])
  assert.deepEqual(defaultCatalogIds(config), [
    'ordinary-0', 'material-0', 'ordinary-1', 'material-1', 'ordinary-2', 'material-2',
    'ordinary-3', 'material-3', 'ordinary-4', 'material-4', 'ordinary-5', 'material-5',
    'ordinary-6', 'ordinary-7', 'ordinary-8', 'material-8', 'ordinary-11', 'material-11',
  ])
  const before = structuredClone(config)
  markerNameCatalogIds(config); defaultCatalogIds(config)
  assert.deepEqual(config, before)
})

await test('All eight maps keep only source-enabled quest, boss, NPC, other and location labels while every category retains its icon', t => {
  for (const config of productionManifest.maps) {
    const expectedIds = config.catalogGroups.filter(group => sourceNamedGroupIds.has(group.id))
      .flatMap(group => group.catalogs.filter(catalog => catalog.showLandmarkName === true).map(catalog => catalog.id))
    assert.deepEqual(markerNameCatalogIds(config), expectedIds, config.id)
    const points = allCatalogs(config).map(catalog => ({
      id: `display-${catalog.id}`, catalogId: catalog.id, name: `Full name for ${catalog.name}`,
      description: 'Full owning description.', position: [...config.center], images: [],
    }))
    const canvas = canvasLifecycle(config, false, '/pbz-map/', config.maxZoom, { landmarks: points, visibleLandmarks: points })
    t.after(() => canvas.unmount())
    canvas.run('renderLandmarks()')
    assert.equal(canvas.layers[0].markers.length, points.length)
    for (const [index, marker] of canvas.layers[0].markers.entries()) {
      const point = points[index], catalog = allCatalogs(config)[index]
      const label = domNodes(marker.options.icon.html).find(node => node.className === 'poi-name')
      assert.equal(Boolean(label), expectedIds.includes(catalog.id), `${config.id}/${catalog.id}`)
      if (label) assert.equal(label.textContent, point.name)
      assert.equal(marker.options.title, undefined, 'Icon-only markers must not gain native hover-name tooltips')
      assert.equal(marker.options.alt, point.name, 'Accessible names remain complete without visible text')
      if (catalog.iconUrl) assert.equal(domNodes(marker.options.icon.html).find(node => node.tag === 'img').src, `/pbz-map${catalog.iconUrl}`)
    }
    canvas.props.showMarkerNames = false
    canvas.run('refreshMarkerIcons()')
    assert.ok(canvas.layers[0].markers.every(marker => !domNodes(marker.options.icon.html).some(node => node.className === 'poi-name')))
    canvas.props.showMarkerNames = true
    canvas.run('refreshMarkerIcons()')
    assert.equal(canvas.layers[0].markers.filter(marker => domNodes(marker.options.icon.html).some(node => node.className === 'poi-name')).length, expectedIds.length)
  }
})

await test('Actual desktop and mobile App defaults leave materials, consumables and dust off without clearing manual selections on reset or rerender', async t => {
  for (const mobile of [false, true]) {
    const stored = new Map([['pbz-map:251:state', JSON.stringify({ version: 1, completedIds: ['kept-completion'], pins: [{ id: 'kept-pin', position: [-0.4, 0.6] }] })]])
    const saved = stored.get('pbz-map:251:state')
    const app = appSetup({ navigator: { userAgent: mobile ? 'iPhone' : 'Macintosh' }, stored, manifestInput: productionManifest, collectionInputs: productionCollections })
    t.after(() => app.unmount())
    await app.run('start()')
    assert.equal(app.run('showMarkerNames.value'), true, 'The existing name switch is not a blanket-off substitute')
    for (const config of productionManifest.maps) {
      await app.run(`changeMap(${JSON.stringify(config.id)})`)
      const off = sourceDefaultOff(config), offIds = off.map(catalog => catalog.id)
      const expected = allCatalogs(config).filter(catalog => catalog.defaultSelected === true && !offIds.includes(catalog.id)).map(catalog => catalog.id)
      assert.deepEqual(defaultCatalogIds(config), expected)
      assert.deepEqual(Array.from(app.run('selectedCatalogIds.value')), expected)
      assert.equal(app.run(`visibleLandmarks.value.some(point => ${JSON.stringify(offIds)}.includes(point.catalogId))`), false)
      if (mobile) app.run('openMobilePanel("filters")')
      for (const catalog of off) {
        if (mobile) {
          const group = config.catalogGroups.find(group => group.catalogs.some(value => value.id === catalog.id))
          app.run(`mobileGroupId.value=${JSON.stringify(group.id)}`)
        }
        const button = app.nodes().find(node => node.type === 'button' && node.props?.['data-catalog-id'] === catalog.id)
        assert.ok(button, `Default-off category remains available: ${config.id}/${catalog.id}`)
        assert.equal(button.props['aria-pressed'], false)
        button.props.onClick(); await Vue.nextTick()
        assert.equal(app.run(`selectedCatalogIds.value.includes(${JSON.stringify(catalog.id)})`), true)
        const members = productionCollections.find(row => row.mapId === config.id).landmarks.filter(point => point.catalogId === catalog.id)
        assert.deepEqual(Array.from(app.run(`visibleLandmarks.value.filter(point => point.catalogId === ${JSON.stringify(catalog.id)})`), point => point.id), members.map(point => point.id))
      }
      const selected = Array.from(app.run('selectedCatalogIds.value'))
      app.run('resetView(); completionFilter.value=null; panelExpanded.value=!panelExpanded.value')
      await Vue.nextTick()
      assert.deepEqual(Array.from(app.run('selectedCatalogIds.value')), selected, 'Ordinary rerenders and Reset view retain explicit choices')
      app.run('clearCategorySelection()')
      assert.deepEqual(Array.from(app.run('selectedCatalogIds.value')), [], 'Clear is the existing explicit all-category reset')
    }
    assert.equal(stored.get('pbz-map:251:state'), saved)
    assert.deepEqual(app.writes, [], 'Default filters never rewrite completion or pins')
  }
})

await test('Default-off material names remain searchable and restored details retain their full owning name and description', async t => {
  const config = productionManifest.maps[0]
  const point = productionCollections[0].landmarks.find(point => point.catalogId === sourceSoulMaterialIds[config.id])
  assert.ok(point)
  const before = structuredClone(point)
  const result = searchLandmarks(productionManifest.maps.map(config => ({ config, landmarks: productionCollections.find(row => row.mapId === config.id).landmarks })), point.name)
  assert.ok(result.title.some(result => result.mapId === config.id && result.point.id === point.id && result.point.catalogId === point.catalogId))
  const app = appSetup({ stored: new Map([['pbz-map:251:search-name', point.name]]), manifestInput: productionManifest, collectionInputs: productionCollections })
  t.after(() => app.unmount())
  await app.run('start()')
  assert.equal(app.run(`selectedCatalogIds.value.includes(${JSON.stringify(point.catalogId)})`), false)
  assert.equal(app.run(`visibleLandmarks.value.some(point => point.id === ${JSON.stringify(point.id)} && point.catalogId === ${JSON.stringify(point.catalogId)})`), true, 'An explicit restored search is not an initial default category selection')
  for (const mobile of [false, true]) {
    const canvas = canvasLifecycle(config, false, '/', config.maxZoom, { mobile, landmarks: [point], visibleLandmarks: [point], selection: { kind: 'landmark', id: point.id, catalogId: point.catalogId, source: 'marker' } })
    t.after(() => canvas.unmount())
    assert.equal(canvas.run('markerNamesVisible(props.landmarks[0])'), false)
    if (mobile) {
      assert.ok(canvas.nodes().some(node => node.type === 'h2' && templateText(node) === point.name))
      assert.ok(canvas.nodes().some(node => node.type === 'p' && templateText(node) === point.description))
    } else {
      const nodes = domNodes(canvas.popup.content)
      assert.equal(nodes.find(node => node.className === 'place-name').textContent, point.name)
      if (point.description) assert.equal(nodes.find(node => node.className === 'place-description').textContent, point.description)
    }
  }
  assert.deepEqual(point, before)
})

await test('All fourteen source-bound control files retain exact original bytes as independent ordinary local files', async () => {
  assert.equal(Object.keys(expectedControlAssets).length, 14)
  assert.equal(new Set(Object.values(expectedControlAssets).map(asset => asset.path)).size, 14)
  for (const asset of Object.values(expectedControlAssets)) {
    const file = new URL(`../public${asset.path}`, import.meta.url)
    const info = await lstat(file)
    assert.ok(info.isFile() && !info.isSymbolicLink())
    assert.equal(info.nlink, 1)
    assert.equal(await realpath(file), fileURLToPath(file))
    const bytes = await readFile(file)
    assert.equal(bytes.length, asset.bytes, asset.path)
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, asset.path)
  }
})
