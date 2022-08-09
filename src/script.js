import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import * as dat from "dat.gui";
import gsap from "gsap";
import Mesh from "./mesh/mesh";

class App {
  canvas = document.querySelector(".webgl");
  renderer = new THREE.WebGLRenderer({
    canvas: this.canvas,
  });
  scene = new THREE.Scene();
  sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  camera = new THREE.PerspectiveCamera(
    45,
    this.sizes.width / this.sizes.height,
    0.1,
    100
  );
  clock = new THREE.Clock();
  loadingManager = new THREE.LoadingManager(
    () => console.log("load"),
    (url, loaded, total) => console.log(url, loaded, total),
    (url) => console.log(url)
  );
  textureLoader = new THREE.TextureLoader(this.loadingManager);
  fontLoader = new FontLoader();
  controls = new OrbitControls(this.camera, this.canvas);
  dat = new dat.GUI();
  animateFunction;

  constructor() {
    this.scene.add(this.camera);
    this.camera.position.z = 20;

    this.controls.enableDamping = true;

    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.handleWindowResize();

    const matcap = this.textureLoader.load("/textures/matcaps/7.png");

    const points = [];
    for (let i = 0; i < 10; ++i) {
      points.push(new THREE.Vector2(Math.sin(i * 0.2) * 3 + 3, (i - 5) * 0.8));
    }

    const lathe = new Mesh(
      new THREE.LatheGeometry(points),
      new THREE.MeshMatcapMaterial({ matcap })
    );
    const parameter = {
      pumping: () => {
        const timeline = gsap.timeline();
        timeline.add(
          gsap.to(lathe.mesh.scale, {
            x: 3,
            y: 3,
            duration: 1,
          })
        );
        timeline.add(
          gsap.to(lathe.mesh.scale, {
            x: 1,
            y: 1,
            duration: 1,
          })
        );

        timeline.play();
      },
    };
    this.setDat(parameter, "pumping", null, null, null, null, false, true);
    lathe.addToScene(this.scene);

    const customGeo = new THREE.BufferGeometry();
    const positionArr = new Float32Array([0, 2, 2, -2, 0, 2, 2, 0, 2]);
    const positionAttr = new THREE.BufferAttribute(positionArr, 3);
    customGeo.setAttribute("position", positionAttr);
    customGeo.center();

    const custom = new Mesh(
      customGeo,
      new THREE.MeshBasicMaterial({ color: "red" })
    );
    custom.update(custom.mesh.position, "z", -10);
    this.setDat(
      custom.material,
      "color",
      "customColor",
      null,
      null,
      null,
      true
    );
    custom.addToScene(this.scene);

    let helvetikerRegular;
    let text;
    const loadFont = async () => {
      helvetikerRegular = await this.fontLoader.loadAsync(
        "/fonts/helvetiker_regular.typeface.json"
      );
    };

    loadFont().then(() => {
      const textGeo = new TextGeometry("This is nothing.", {
        font: helvetikerRegular,
        size: 1,
        height: 0.2,
        curveSegments: 6,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5,
      });
      textGeo.center();
      text = new Mesh(textGeo, new THREE.MeshNormalMaterial());
      text.update(text.mesh.position, "z", "8");
      this.setDat(text.mesh.position, "y", "Text-y", -10, 10, 0.1);
      text.addToScene(this.scene);

      this.setAnimateFunciton((time = undefined) => {
        lathe.update(
          lathe.mesh.rotation,
          "x",
          time * Math.PI + Math.sin(time * Math.PI)
        );
        lathe.update(
          lathe.mesh.rotation,
          "y",
          time * Math.PI + Math.sin(time * Math.PI)
        );
        custom.update(custom.mesh.scale, "x", 4 * Math.sin(time * Math.PI));
        custom.update(
          custom.mesh.scale,
          "y",
          4 * Math.abs(Math.sin(time * Math.PI))
        );
        text.update(text.mesh.position, "x", 4 * Math.sin(time * 3));
      });

      this.animate();
    });
  }

  animate(time) {
    const elapsedTime = this.clock.getElapsedTime();
    this.animateFunction && this.animateFunction(elapsedTime);
    this.renderer.render(this.scene, this.camera);

    this.controls.update();

    window.requestAnimationFrame(this.animate.bind(this));
  }

  setAnimateFunciton(func) {
    this.animateFunction = func;
  }

  handleWindowResize() {
    window.addEventListener("resize", (e) => {
      this.sizes.width = window.innerWidth;
      this.sizes.height = window.innerHeight;

      this.camera.aspect = this.sizes.width / this.sizes.height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.sizes.width, this.sizes.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  setDat(
    target,
    propName,
    tweakName,
    min = 0,
    max = 1,
    step = 0.1,
    isAddColor = false,
    isFunction = false
  ) {
    if (isAddColor) {
      this.dat //
        .addColor(target, propName)
        .onChange((val) => {
          target[`${propName}`] = new THREE.Color(
            `rgb(${Math.round(val.r)},${Math.round(val.g)},${Math.round(
              val.b
            )})`
          );
        })
        .name(tweakName);
      return;
    }

    if (isFunction) {
      this.dat.add(target, propName);
      return;
    }

    this.dat //
      .add(target, propName)
      .min(min)
      .max(max)
      .step(step)
      .name(tweakName);
  }
}

new App();

// 3. 그룹화 시켜보기
// 4. gsap 사용하기
// 5. dat-gui 사용하기
// 6. 객체지향적 코딩하기.
