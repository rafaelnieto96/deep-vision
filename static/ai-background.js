let neurons = [];
let NUM_NEURONS = 40;
let ACTIVATION_DISTANCE = 150;
let MAX_CONNECTIONS = 5;

function calculateDensity() {
    const screenArea = window.innerWidth * window.innerHeight;
    const baseDensity = 0.00004;
    NUM_NEURONS = Math.max(10, Math.floor(screenArea * baseDensity));
    ACTIVATION_DISTANCE = Math.min(150, Math.max(80, window.innerWidth / 10));
    MAX_CONNECTIONS = window.innerWidth < 768 ? 3 : 5;
}

function setup() {
    let canvas = createCanvas(window.innerWidth, window.innerHeight);
    canvas.parent('p5-background');
    noFill();
    angleMode(DEGREES);
    calculateDensity();

    for (let i = 0; i < NUM_NEURONS; i++) {
        neurons.push(new Neuron());
    }
}

function drawGradientBackground(c1, c2) {
    noFill();
    for (let y = 0; y < height; y++) {
        let inter = map(y, 0, height, 0, 1);
        let c = lerpColor(c1, c2, inter);
        stroke(c);
        line(0, y, width, y);
    }
    noStroke();
}

function setup() {
    let canvas = createCanvas(window.innerWidth, window.innerHeight);
    canvas.parent('p5-background');
    // Crear canvas con fondo transparente
    clear();
    angleMode(DEGREES);
    calculateDensity();

    for (let i = 0; i < NUM_NEURONS; i++) {
        neurons.push(new Neuron());
    }
}

function draw() {
    // Solo limpiar el canvas con transparencia en cada frame
    clear();
    
    // El resto del código se mantiene igual
    neurons.forEach(neuron => {
        neuron.update();
        neuron.show();
    });

    drawNeuralConnections();

    if (window.innerWidth > 768) {
        globalPulseEffect();
    }
}

class Neuron {
    constructor() {
        this.pos = createVector(random(width), random(height));
        this.connections = [];
        this.pulse = 0;
        const baseSize = window.innerWidth < 768 ? 5 : 7; // Ligeramente más pequeñas
        this.targetSize = random(baseSize, baseSize * 1.6);
        this.hue = random(160, 190); // Tonos turquesa/cian
        this.saturation = random(60, 90);
        this.brightness = random(70, 100);
    }

    update() {
        const moveSpeed = window.innerWidth < 768 ? 0.15 : 0.25; // Movimiento más sutil
        this.pos.add(createVector(random(-moveSpeed, moveSpeed), random(-moveSpeed, moveSpeed)));
        this.pos.x = constrain(this.pos.x, 0, width);
        this.pos.y = constrain(this.pos.y, 0, height);

        let mouseDist = dist(mouseX, mouseY, this.pos.x, this.pos.y);
        if (mouseDist < ACTIVATION_DISTANCE * 0.8) { // Menor distancia para activar
            this.activate();
        }

        this.pulse = lerp(this.pulse, 0, 0.08); // Decaimiento más lento
    }

    activate() {
        this.pulse = 1;
        this.hue = (this.hue + random(-5, 5)) % 360; // Variación sutil del color
    }

    show() {
        colorMode(HSB, 360, 100, 100, 1);
        let currentSize = this.targetSize * (1 + this.pulse * 1.5); // Pulso más sutil
        let currentAlpha = 0.6 + 0.4 * sin(frameCount * 0.5 + this.pos.x * 0.1); // Alpha variable
        
        // Glow effect
        noStroke();
        fill(this.hue, this.saturation, this.brightness, this.pulse * 0.3 * currentAlpha);
        ellipse(this.pos.x, this.pos.y, currentSize * 1.5);

        // Main body
        stroke(this.hue, this.saturation * 0.8, this.brightness, 0.8 * currentAlpha);
        strokeWeight(1.5);
        fill(this.hue, this.saturation * 0.5, this.brightness * 0.8, 0.9 * currentAlpha);
        ellipse(this.pos.x, this.pos.y, this.targetSize);
        colorMode(RGB); // Volver a RGB
    }
}

function drawNeuralConnections() {
    colorMode(HSB, 360, 100, 100, 1);
    neurons.forEach((a, i) => {
        let others = neurons.slice(i + 1)
            .map(b => ({ neuron: b, dist: dist(a.pos.x, a.pos.y, b.pos.x, b.pos.y) }))
            .sort((x, y) => x.dist - y.dist)
            .slice(0, MAX_CONNECTIONS);

        others.forEach(({ neuron: b, dist }) => {
            if (dist < ACTIVATION_DISTANCE * 1.5) { // Mayor distancia para conexiones
                let alpha = map(dist, 0, ACTIVATION_DISTANCE * 1.5, 0.6, 0);
                let lineWidth = map(dist, 0, ACTIVATION_DISTANCE * 1.5, 1.5, 0.3);
                
                let pulse = (a.pulse + b.pulse) * 0.5; // Conexión pulsa si neuronas lo hacen
                alpha *= (0.5 + pulse * 0.5); // Más alpha si está pulsando
                
                stroke(a.hue, a.saturation * 0.7, a.brightness * 0.9, alpha);
                strokeWeight(lineWidth);
                line(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
            }
        });
    });
    colorMode(RGB); // Volver a RGB
}

function globalPulseEffect() {
    // Efecto más sutil o eliminado si se prefiere
    /*
    noFill();
    stroke(180, 100, 255, window.innerWidth < 768 ? 20 : 40); // Menos opacidad
    strokeWeight(1);
    let pulseSize = (frameCount % 150) * (window.innerWidth < 768 ? 2 : 3); // Más lento
    ellipse(mouseX, mouseY, pulseSize, pulseSize);
    */
}

function windowResized() {
    resizeCanvas(window.innerWidth, window.innerHeight);
    calculateDensity();
    neurons = [];
    for (let i = 0; i < NUM_NEURONS; i++) {
        neurons.push(new Neuron());
    }
} 