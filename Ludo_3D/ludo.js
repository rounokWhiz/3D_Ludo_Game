import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// ============================================================
// SCENE
// ============================================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x20252b);
scene.fog = new THREE.Fog(0x20252b, 25, 60);

// ============================================================
// CAMERA
// ============================================================

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.set(0, 12, 19);

// ============================================================
// RENDERER
// ============================================================

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// ============================================================
// LIGHTING
// ============================================================

const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(2048, 2048);
directionalLight.shadow.camera.left = -14;
directionalLight.shadow.camera.right = 14;
directionalLight.shadow.camera.top = 14;
directionalLight.shadow.camera.bottom = -14;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 40;
scene.add(directionalLight);

// Soft fill light from the opposite side so shadows aren't pitch black
const fillLight = new THREE.DirectionalLight(0x9fc6ff, 0.4);
fillLight.position.set(-8, 6, -6);
scene.add(fillLight);

// ============================================================
// HELPER
// ============================================================

function createBox(width, height, depth, material, x, y, z) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
}

// ============================================================
// SIMPLE TEXTURE
// ============================================================

function createSimpleTexture(baseColor, patternColor) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;

    const context = canvas.getContext("2d");

    context.fillStyle = baseColor;
    context.fillRect(0, 0, 256, 256);

    context.strokeStyle = patternColor;
    context.lineWidth = 8;

    for (let i = -256; i < 512; i += 40) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i + 256, 256);
        context.stroke();
    }

    context.strokeStyle = patternColor;
    context.lineWidth = 10;
    context.strokeRect(5, 5, 246, 246);

    return new THREE.CanvasTexture(canvas);
}

// ============================================================
// COLOR TEXTURES
// ============================================================

const redTexture = createSimpleTexture("#e74c3c", "#b71c1c");
const greenTexture = createSimpleTexture("#2ecc71", "#1b8e4b");
const blueTexture = createSimpleTexture("#3498db", "#1f5f99");
const yellowTexture = createSimpleTexture("#f1c40f", "#b7950b");
const whiteTexture = createSimpleTexture("#ffffff", "#bbbbbb");

// ============================================================
// GROUND
// ============================================================

const groundTexture = createSimpleTexture("#444444", "#555555");
groundTexture.repeat.set(12, 12);

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({
        map: groundTexture,
        roughness: 0.95,
        metalness: 0
    })
);

ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.6;
ground.receiveShadow = true;
scene.add(ground);

// ============================================================
// BOARD TEXTURE
// ============================================================

function createBoardTexture(firstColor, secondColor) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;

    const context = canvas.getContext("2d");
    const size = 64;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            context.fillStyle =
                (row + col) % 2 === 0 ? firstColor : secondColor;

            context.fillRect(
                col * size,
                row * size,
                size,
                size
            );
        }
    }

    context.strokeStyle = "#333333";
    context.lineWidth = 8;
    context.strokeRect(4, 4, 504, 504);

    return new THREE.CanvasTexture(canvas);
}

const boardTextureDefault = createBoardTexture("#eeeeee", "#777777");

// Three extra themed finishes — none reuse the RGBY piece colors,
// chosen to look like real board/table materials
const boardTextureWalnut =
    createBoardTexture("#8b5a2b", "#c9975c");  // warm walnut wood

const boardTextureMarble =
    createBoardTexture("#eef1f3", "#5c6b73");  // cool grey marble

const boardTextureEmerald =
    createBoardTexture("#0b3d3a", "#d4af37");  // emerald + gold

const boardTextures = [
    boardTextureDefault,
    boardTextureWalnut,
    boardTextureMarble,
    boardTextureEmerald
];

const boardMaterial = new THREE.MeshStandardMaterial({
    map: boardTextures[0],
    roughness: 0.6,
    metalness: 0.05
});

const boardBase = createBox(
    12, 0.6, 12,
    boardMaterial,
    0, 0, 0
);

// ============================================================
// MOUSE: CHANGE BOARD TEXTURE
// ============================================================

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let boardTextureIndex = 0;

window.addEventListener("click", function(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1; 
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(boardBase);

    if (intersects.length > 0) {
        boardTextureIndex = (boardTextureIndex + 1) % boardTextures.length;

        boardMaterial.map = boardTextures[boardTextureIndex];
        boardMaterial.needsUpdate = true;
    }
});

// ============================================================
// LUDO COLORS
// ============================================================

const RED = 0xe74c3c;
const GREEN = 0x2ecc71;
const BLUE = 0x3498db;
const YELLOW = 0xf1c40f;
const WHITE = 0xffffff;

function getTextureForColor(color) {
    if (color === RED) return redTexture;
    if (color === GREEN) return greenTexture;
    if (color === BLUE) return blueTexture;
    if (color === YELLOW) return yellowTexture;
    return whiteTexture;
}

// ============================================================
// PATH CELL
// ============================================================

const cellSize = 0.8;

function createGridCell(x, z, color) {
    const material = new THREE.MeshStandardMaterial({
        map: getTextureForColor(color),
        roughness: 0.55,
        metalness: 0.05
    });

    const cell = new THREE.Mesh(
        new THREE.BoxGeometry(0.76, 0.12, 0.76),
        material
    );

    cell.position.set(x, 0.38, z);
    cell.castShadow = true;
    cell.receiveShadow = true;
    scene.add(cell);
    return cell;
}

// Horizontal path
for (let row = -1; row <= 1; row++) {
    for (let col = -6; col <= 6; col++) {
        let color = WHITE;

        if (col < -1 && row === 0) color = RED;
        else if (col > 1 && row === 0) color = YELLOW;

        createGridCell(col * cellSize, row * cellSize, color);
    }
}

// Vertical path
for (let col = -1; col <= 1; col++) {
    for (let row = -6; row <= 6; row++) {
        let color = WHITE;

        if (row > 1 && col === 0) color = BLUE;
        else if (row < -1 && col === 0) color = GREEN;

        createGridCell(col * cellSize, row * cellSize, color);
    }
}

// ============================================================
// HOME AREAS
// ============================================================

function createHomeArea(x, z, color) {
    const colorTexture = getTextureForColor(color);

    createBox(
        4, 0.18, 4,
        new THREE.MeshStandardMaterial({ map: colorTexture }),
        x, 0.42, z
    );

    createBox(
        2.9, 0.12, 2.9,
        new THREE.MeshStandardMaterial({ map: whiteTexture }),
        x, 0.54, z
    );

    const positions = [
        [-0.8, -0.8],
        [0.8, -0.8],
        [-0.8, 0.8],
        [0.8, 0.8]
    ];

    for (const position of positions) {
        const slot = new THREE.Mesh(
            new THREE.CylinderGeometry(0.38, 0.38, 0.08, 32),
            new THREE.MeshStandardMaterial({
                map: colorTexture,
                roughness: 0.5,
                metalness: 0.1
            })
        );

        slot.position.set(
            x + position[0],
            0.63,
            z + position[1]
        );

        slot.castShadow = true;
        slot.receiveShadow = true;
        scene.add(slot);
    }
}

createHomeArea(-4, -4, RED);
createHomeArea(4, -4, GREEN);
createHomeArea(-4, 4, BLUE);
createHomeArea(4, 4, YELLOW);

// ============================================================
// FINISHING LANES
// ============================================================

for (let i = -1; i <= 1; i++) {
    createGridCell(i * cellSize, -2.4, GREEN);
    createGridCell(i * cellSize, 2.4, BLUE);
    createGridCell(-2.4, i * cellSize, RED);
    createGridCell(2.4, i * cellSize, YELLOW);
}

// ============================================================
// FIXED LUDO CENTER
// ============================================================

const center = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.16, 2.4),
    new THREE.MeshStandardMaterial({ map: whiteTexture })
);

center.position.set(0, 0.62, 0);
scene.add(center);

function createCenterTriangle(color, vertices) {
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array([
        vertices[0][0], 0.72, vertices[0][1],
        vertices[1][0], 0.72, vertices[1][1],
        vertices[2][0], 0.72, vertices[2][1]
    ]);

    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
    );

    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
        map: getTextureForColor(color),
        side: THREE.DoubleSide
    });

    const triangle = new THREE.Mesh(geometry, material);
    scene.add(triangle);

    return triangle;
}

// Four colored center triangles
createCenterTriangle(RED, [
    [-1.2, -1.2],
    [0, -1.2],
    [0, 0]
]);

createCenterTriangle(GREEN, [
    [0, -1.2],
    [1.2, -1.2],
    [0, 0]
]);

createCenterTriangle(BLUE, [
    [-1.2, 1.2],
    [0, 0],
    [0, 1.2]
]);

createCenterTriangle(YELLOW, [
    [0, 0],
    [1.2, 1.2],
    [0, 1.2]
]);

// ============================================================
// LUDO TOKENS
// ============================================================

function createToken(x, z, color) {
    const material = new THREE.MeshStandardMaterial({
        map: getTextureForColor(color),
        roughness: 0.3,
        metalness: 0.2
    });

    const bottom = new THREE.Mesh(
        new THREE.CylinderGeometry(0.48, 0.55, 0.25, 32),
        material
    );

    bottom.position.set(x, 0.82, z);
    bottom.castShadow = true;
    bottom.receiveShadow = true;
    scene.add(bottom);

    const middle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.45, 0.35, 32),
        material
    );

    middle.position.set(x, 1.05, z);
    middle.castShadow = true;
    middle.receiveShadow = true;
    scene.add(middle);

    const top = new THREE.Mesh(
        new THREE.SphereGeometry(0.38, 32, 16),
        material
    );

    top.scale.y = 0.7;
    top.position.set(x, 1.35, z);
    top.castShadow = true;
    top.receiveShadow = true;
    scene.add(top);
}

// Red
createToken(-4.75, -4.75, RED);
createToken(-3.25, -4.75, RED);
createToken(-4.75, -3.25, RED);
createToken(-3.25, -3.25, RED);

// Green
createToken(3.25, -4.75, GREEN);
createToken(4.75, -4.75, GREEN);
createToken(3.25, -3.25, GREEN);
createToken(4.75, -3.25, GREEN);

// Blue
createToken(-4.75, 3.25, BLUE);
createToken(-3.25, 3.25, BLUE);
createToken(-4.75, 4.75, BLUE);
createToken(-3.25, 4.75, BLUE);

// Yellow
createToken(3.25, 3.25, YELLOW);
createToken(4.75, 3.25, YELLOW);
createToken(3.25, 4.75, YELLOW);
createToken(4.75, 4.75, YELLOW);

// ============================================================
// OUTER BOARD BORDER
// ============================================================

const borderMaterial = new THREE.MeshStandardMaterial({
    map: createSimpleTexture("#222222", "#444444")
});

createBox(12.5, 0.25, 0.3, borderMaterial, 0, 0.45, -6.1);
createBox(12.5, 0.25, 0.3, borderMaterial, 0, 0.45, 6.1);
createBox(0.3, 0.25, 12.5, borderMaterial, -6.1, 0.45, 0);
createBox(0.3, 0.25, 12.5, borderMaterial, 6.1, 0.45, 0);

// ============================================================
// CUSTOM SHADER
// ============================================================

const glowVertexShader = `
    varying vec3 vPosition;

    void main() {
        vPosition = position;
        gl_Position =
            projectionMatrix *
            modelViewMatrix *
            vec4(position, 1.0);
    }
`;

const glowFragmentShader = `
    uniform float time;
    uniform vec3 glowColor;
    uniform float intensity;
    varying vec3 vPosition;

    void main() {
        // Pulses brightness over time
        float pulse = 0.6 + 0.4 * sin(time * 1.5);

        // Slides a light band across the surface
        float wave =
            0.5 + 0.5 * sin(vPosition.x * 2.0 + vPosition.z * 2.0 + time * 2.0);

        float brightness = pulse * (0.6 + 0.4 * wave) * intensity;

        gl_FragColor = vec4(glowColor * brightness, brightness);
    }
`;

// Every glow material created below is tracked here so animate()
// can advance all of their "time" uniforms in one place
const glowMaterials = [];

function createGlowMaterial(colorHex, startIntensity) {
    const material = new THREE.ShaderMaterial({
        vertexShader: glowVertexShader,
        fragmentShader: glowFragmentShader,
        uniforms: {
            time: { value: 0 },
            glowColor: { value: new THREE.Color(colorHex) },
            intensity: { value: startIntensity }
        },
        transparent: true
    });

    glowMaterials.push(material);
    return material;
}

// Glowing shader rim — thick and raised so it reads clearly as a
// custom-shaded object framing the whole board, not just a trim line
const shaderMaterial = createGlowMaterial(0x26d9ff, 1.0);

createBox(12.6, 0.25, 0.25, shaderMaterial, 0, 0.78, -6.3);
createBox(12.6, 0.25, 0.25, shaderMaterial, 0, 0.78, 6.3);
createBox(0.25, 0.25, 12.6, shaderMaterial, -6.3, 0.78, 0);
createBox(0.25, 0.25, 12.6, shaderMaterial, 6.3, 0.78, 0);




// ============================================================
// TURN INDICATOR (glow spotlight under the active player's home)
// ============================================================

function createHomeHighlight(x, z, colorHex, isActive) {
    const material = createGlowMaterial(colorHex, isActive ? 1.0 : 0.0);

    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(4.6, 4.6),
        material
    );

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0.32, z);
    scene.add(mesh);

    return material;
}

const turnOrder = ["RED", "GREEN", "BLUE", "YELLOW"];
let currentTurnIndex = 0;

const homeHighlights = {
    RED: createHomeHighlight(-4, -4, RED, turnOrder[currentTurnIndex] === "RED"),
    GREEN: createHomeHighlight(4, -4, GREEN, turnOrder[currentTurnIndex] === "GREEN"),
    BLUE: createHomeHighlight(-4, 4, BLUE, turnOrder[currentTurnIndex] === "BLUE"),
    YELLOW: createHomeHighlight(4, 4, YELLOW, turnOrder[currentTurnIndex] === "YELLOW")
};

const turnIndicator = document.getElementById("turnIndicator");
const nextTurnButton = document.getElementById("nextTurnButton");

const turnCssColors = {
    RED: "#e74c3c",
    GREEN: "#2ecc71",
    BLUE: "#3498db",
    YELLOW: "#f1c40f"
};

// Maps turn names to the same hex numbers already used for the pieces
const turnGlowColors = { RED, GREEN, BLUE, YELLOW };

function updateTurnUI() {
    const activeColor = turnOrder[currentTurnIndex];

    turnIndicator.textContent = "Turn: " + activeColor;
    turnIndicator.style.background = turnCssColors[activeColor];
    turnIndicator.style.color =
        activeColor === "YELLOW" ? "#222222" : "#ffffff";

    // Recolor the glowing board rim itself to the active player's color —
    // impossible to miss, unlike a highlight hidden under the board
    shaderMaterial.uniforms.glowColor.value.set(turnGlowColors[activeColor]);

    for (const colorName in homeHighlights) {
        homeHighlights[colorName].uniforms.intensity.value =
            colorName === activeColor ? 1.0 : 0.0;
    }

    // Let any other script (e.g. win-game.js) know whose turn it is now
    window.dispatchEvent(
        new CustomEvent("turnChanged", { detail: { color: activeColor } })
    );
}

nextTurnButton.addEventListener("click", function() {
    currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
    updateTurnUI();
});

updateTurnUI();

// ============================================================
// DICE TEXTURE
// ============================================================

function createDiceFace(number) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;

    const context = canvas.getContext("2d");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 256, 256);

    context.strokeStyle = "#111111";
    context.lineWidth = 12;
    context.strokeRect(6, 6, 244, 244);

    const positions = {
        1: [[128, 128]],
        2: [[75, 75], [181, 181]],
        3: [[75, 75], [128, 128], [181, 181]],
        4: [[75, 75], [181, 75], [75, 181], [181, 181]],
        5: [[75, 75], [181, 75], [128, 128], [75, 181], [181, 181]],
        6: [[75, 65], [181, 65], [75, 128], [181, 128], [75, 191], [181, 191]]
    };

    context.fillStyle = "#111111";

    for (const point of positions[number]) {
        context.beginPath();
        context.arc(point[0], point[1], 25, 0, Math.PI * 2);
        context.fill();
    }

    return new THREE.CanvasTexture(canvas);
}

const diceTextures = [
    createDiceFace(1),
    createDiceFace(2),
    createDiceFace(3),
    createDiceFace(4),
    createDiceFace(5),
    createDiceFace(6)
];

const diceMaterials = diceTextures.map(
    texture => new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.25,
        metalness: 0.1
    })
);

// ============================================================
// DICE
// ============================================================

const dice = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.2, 1.2),
    diceMaterials
);

// Dice outside the board
dice.position.set(0, 1.3, 7);
dice.castShadow = true;
dice.receiveShadow = true;
scene.add(dice);

// ============================================================
// DICE ROLL
// ============================================================

let diceRolling = false;
let diceRollTime = 0;
let selectedDiceNumber = 1;

const rollButton = document.getElementById("rollButton");
const diceResult = document.getElementById("diceResult");

// BoxGeometry assigns materials to faces in this fixed order:
// [0]=+X, [1]=-X, [2]=+Y, [3]=-Y, [4]=+Z, [5]=-Z
// diceMaterials[i] holds the texture for value (i + 1), so each value's
// local face-normal (before any rotation) is:
const UP = new THREE.Vector3(0, 1, 0);

const diceFaceNormals = {
    1: new THREE.Vector3(1, 0, 0),
    2: new THREE.Vector3(-1, 0, 0),
    3: new THREE.Vector3(0, 1, 0),
    4: new THREE.Vector3(0, -1, 0),
    5: new THREE.Vector3(0, 0, 1),
    6: new THREE.Vector3(0, 0, -1)
};

const spinDuration = 0.7;     // seconds of free tumbling
const totalRollDuration = 1;  // seconds, matches spin + settle

let rollStartQuaternion = new THREE.Quaternion();
let rollTargetQuaternion = new THREE.Quaternion();
let settling = false;

rollButton.addEventListener("click", function() {
    if (diceRolling) return;

    selectedDiceNumber =
        Math.floor(Math.random() * 6) + 1;

    diceResult.textContent =
        "Result: " + selectedDiceNumber;

    // Orientation that puts the rolled face's normal pointing straight up
    rollTargetQuaternion.setFromUnitVectors(
        diceFaceNormals[selectedDiceNumber],
        UP
    );

    // Spin it around the vertical axis too, purely for visual variety —
    // rotating about world "up" doesn't change which face ends up on top
    const randomYaw = new THREE.Quaternion().setFromAxisAngle(
        UP,
        Math.random() * Math.PI * 2
    );
    rollTargetQuaternion.premultiply(randomYaw);

    diceRolling = true;
    diceRollTime = 0;
    settling = false;
    rollButton.disabled = true;
});

// ============================================================
// CAMERA CONTROL
// ============================================================

let cameraAngle = 0;
let cameraDistance = 19;
const defaultCameraAngle = 0;
const defaultCameraDistance = 19;

// Tracks the last time the user touched camera controls, so we know
// when it's safe to resume the automatic orbit
let lastCameraInputTime = Date.now();
const idleBeforeAutoOrbit = 3000; // ms of no input before auto-orbit resumes
const autoOrbitSpeed = 0.0025;    // radians per frame
let autoOrbitEnabled = true;

window.addEventListener("keydown", function(event) {
    const key = event.key.toLowerCase();

    if (key === "a") cameraAngle -= 0.08;
    if (key === "d") cameraAngle += 0.08;

    if (key === "w") cameraDistance -= 0.5;
    if (key === "s") cameraDistance += 0.5;

    cameraDistance =
        Math.max(12, Math.min(cameraDistance, 30));

    if (key === "a" || key === "d" || key === "w" || key === "s") {
        lastCameraInputTime = Date.now();
    }
});

const cameraResetButton = document.getElementById("cameraResetButton");
const autoOrbitToggle = document.getElementById("autoOrbitToggle");

cameraResetButton.addEventListener("click", function() {
    cameraAngle = defaultCameraAngle;
    cameraDistance = defaultCameraDistance;
    lastCameraInputTime = Date.now();
});

autoOrbitToggle.addEventListener("change", function() {
    autoOrbitEnabled = autoOrbitToggle.checked;
    lastCameraInputTime = Date.now();
});

function updateCamera() {
    // Auto-orbit the camera around the board whenever the user
    // hasn't pressed a camera key recently (and the toggle is on)
    if (autoOrbitEnabled &&
        Date.now() - lastCameraInputTime > idleBeforeAutoOrbit) {
        cameraAngle += autoOrbitSpeed;
    }

    camera.position.x =
        Math.sin(cameraAngle) * cameraDistance;

    camera.position.z =
        Math.cos(cameraAngle) * cameraDistance;

    camera.position.y = 12;

    camera.lookAt(0, 0, 0);
}

// ============================================================
// RESIZE
// ============================================================

window.addEventListener("resize", function() {
    camera.aspect =
        window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});

// ============================================================
// ANIMATION
// ============================================================

function animate() {
    requestAnimationFrame(animate);

    for (const material of glowMaterials) {
        material.uniforms.time.value += 0.03;
    }

    if (diceRolling) {
        diceRollTime += 0.016;

        if (diceRollTime < spinDuration) {
            // Free tumbling — fast, chaotic spin
            dice.rotation.x += 0.35;
            dice.rotation.y += 0.4;
            dice.rotation.z += 0.28;
        } else {
            // Settle smoothly into the orientation that shows the
            // rolled number face-up
            if (!settling) {
                rollStartQuaternion.copy(dice.quaternion);
                settling = true;
            }

            const settleProgress = Math.min(
                (diceRollTime - spinDuration) / (totalRollDuration - spinDuration),
                1
            );

            dice.quaternion.slerpQuaternions(
                rollStartQuaternion,
                rollTargetQuaternion,
                settleProgress
            );
        }

        if (diceRollTime > totalRollDuration) {
            diceRolling = false;
            settling = false;
            rollButton.disabled = false;

            // Let any other script (e.g. win-game.js) know the result
            window.dispatchEvent(
                new CustomEvent("diceRollComplete", {
                    detail: { value: selectedDiceNumber }
                })
            );
        }
    } else {
        // Idle spin when no roll is in progress
        dice.rotation.x += 0.01;
        dice.rotation.y += 0.01;
    }

    updateCamera();

    renderer.render(scene, camera);
}

animate();