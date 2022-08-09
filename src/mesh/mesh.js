import * as THREE from "three";

class Mesh {
  geometry;
  material;
  mesh;

  constructor(geometry, material) {
    this.geometry = geometry;
    this.material = material;
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  addToScene(scene) {
    scene.add(this.mesh);
  }

  update(target, prop, amount) {
    if (!prop) {
      target = amount;
    } else {
      target[`${prop}`] = amount;
    }
  }
}

export default Mesh;
