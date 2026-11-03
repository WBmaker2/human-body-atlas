/**
 * Real-organ GLB pipeline — loads vendored HuBMAP HRA models (CC BY 4.0),
 * fits each into the stage (uniform scale + anchor, identity rotation),
 * recolors with the educational palette, and tags meshes for the existing
 * layer/raycast/selection system.
 *
 * Anything that fails to load simply keeps its procedural fallback mesh,
 * so the atlas always stays usable (classroom offline tolerance).
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  MODEL_SOURCES,
  computeFit,
  modelColorFor,
  type ModelSource,
} from '../anatomy/modelCatalog';

export interface LoadedModel {
  source: ModelSource;
  /** Positioned at the anchor. Heartbeat scales this wrapper for the heart. */
  wrapper: THREE.Group;
  /** Breathing pivots (lungs only). */
  lungPivots?: { left: THREE.Group; right: THREE.Group };
}

export interface LoadProgress {
  done: number;
  total: number;
}

function recoloredMaterial(color: number): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.48,
    metalness: 0,
    clearcoat: 0.35,
    clearcoatRoughness: 0.6,
    transparent: true,
    opacity: 1,
  });
}

function tagMeshes(root: THREE.Object3D, organId: string, material: THREE.Material): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = [];
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.material = material;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.layerId = 'organs';
    mesh.userData.organId = organId;
    meshes.push(mesh);
  });
  return meshes;
}

function fitWrapper(
  content: THREE.Object3D,
  source: ModelSource,
): { wrapper: THREE.Group; inner: THREE.Group; meshes: THREE.Mesh[] } {
  const nativeBox = new THREE.Box3().setFromObject(content);
  const fit = computeFit(
    nativeBox.min.toArray() as [number, number, number],
    nativeBox.max.toArray() as [number, number, number],
    source.targetSize,
    source.anchorMode ?? 'center',
  );
  const material = recoloredMaterial(modelColorFor(source.file, source.organId));
  const meshes = tagMeshes(content, source.organId, material);

  const inner = new THREE.Group();
  inner.scale.setScalar(fit.scale);
  inner.position.set(...fit.shift);
  inner.add(content);

  const wrapper = new THREE.Group();
  wrapper.position.set(...source.anchor);
  wrapper.userData.layerId = 'organs';
  wrapper.userData.organId = source.organId;
  wrapper.add(inner);
  wrapper.updateMatrixWorld(true);
  return { wrapper, inner, meshes };
}

/** Split lung meshes by side so each half can breathe around its own pivot. */
function splitLungSides(
  inner: THREE.Group,
  meshes: THREE.Mesh[],
  organId: string,
): { left: THREE.Group; right: THREE.Group } {
  const whole = new THREE.Box3();
  const perMesh: { mesh: THREE.Mesh; center: THREE.Vector3 }[] = [];
  for (const mesh of meshes) {
    const box = new THREE.Box3().setFromObject(mesh);
    const center = box.getCenter(new THREE.Vector3());
    // Convert world (wrapper-space) center into inner-local coords.
    inner.worldToLocal(center);
    perMesh.push({ mesh, center });
    whole.expandByPoint(center);
  }
  const midX = whole.getCenter(new THREE.Vector3()).x;

  const mkPivot = (name: string, center: THREE.Vector3): THREE.Group => {
    const pivot = new THREE.Group();
    pivot.name = name;
    pivot.position.copy(center);
    pivot.userData.layerId = 'organs';
    pivot.userData.organId = organId;
    pivot.userData.baseScale = [1, 1, 1];
    inner.add(pivot);
    return pivot;
  };

  const leftBox = new THREE.Box3();
  const rightBox = new THREE.Box3();
  const leftMeshes: THREE.Mesh[] = [];
  const rightMeshes: THREE.Mesh[] = [];
  for (const { mesh, center } of perMesh) {
    if (center.x >= midX) {
      leftMeshes.push(mesh);
      leftBox.expandByPoint(center);
    } else {
      rightMeshes.push(mesh);
      rightBox.expandByPoint(center);
    }
  }
  const left = mkPivot('lungL', leftBox.getCenter(new THREE.Vector3()));
  const right = mkPivot('lungR', rightBox.getCenter(new THREE.Vector3()));
  // attach() keeps world transforms — scaling a pivot now breathes around it.
  for (const mesh of leftMeshes) left.attach(mesh);
  for (const mesh of rightMeshes) right.attach(mesh);
  return { left, right };
}

export async function loadOrganModels(
  onModel: (model: LoadedModel) => void,
  onProgress: (p: LoadProgress) => void,
): Promise<LoadedModel[]> {
  const loader = new GLTFLoader();
  const base = `${import.meta.env.BASE_URL}models/`;
  const loaded: LoadedModel[] = [];
  const total = MODEL_SOURCES.length;
  let attempted = 0;

  for (const source of MODEL_SOURCES) {
    try {
      const gltf = await loader.loadAsync(`${base}${source.file}`);
      const { wrapper, inner, meshes } = fitWrapper(gltf.scene, source);
      const model: LoadedModel = { source, wrapper };
      if (source.organId === 'heart') {
        wrapper.name = 'heart';
        wrapper.userData.baseScale = 1;
      }
      if (source.splitSides) {
        model.lungPivots = splitLungSides(inner, meshes, source.organId);
      }
      loaded.push(model);
      onModel(model);
    } catch {
      // Keep the procedural fallback mesh for this file — atlas stays usable.
    }
    attempted += 1;
    onProgress({ done: attempted, total });
    // Yield so progress text paints and input stays responsive during the
    // ~37 MB upgrade (matters on low-end classroom devices).
    await new Promise((resolve) => setTimeout(resolve, 30));
  }
  return loaded;
}
