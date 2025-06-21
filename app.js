const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const lineWidth = document.getElementById("line-width");
const color = document.getElementById("color");
const colorOption = Array.from(document.getElementsByClassName("color-option"));
const modeBtn = document.getElementById("mode-btn");
const eraserBtn = document.getElementById("eraser-btn");
const saveBtn = document.getElementById("save-btn");
canvas.width = 800;
canvas.height = 800;
ctx.fillStyle = "white";
ctx.fillRect(0, 0, 800, 800);
ctx.fillStyle = "black";
ctx.lineWidth = lineWidth.value;

let isPainting = false;
let isFilling = false;
let backgroundColor = "white";
let isErase = false;
let brightness = 0;
let lastX = 1000;
let lastY = 0;

const localImage = localStorage.getItem("image");
const localColor = localStorage.getItem("color");

if (localImage) {
    backgroundColor = localColor;
    const img = new Image();
    img.onload = () => {
        ctx.drawImage(img, 0, 0);
    };
    img.src = decodeURIComponent(localImage);
} else {
    const params = new URLSearchParams(location.hash.substring(1));
    const urlsImage = params.get("image");
    const urlsColor = params.get("color");

    if (urlsImage) {
        backgroundColor = urlsColor;
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
        };
        img.src = decodeURIComponent(urlsImage);
    }
}


function onMove(event) {
    if (isPainting) {
        if (lastX === 1000) {
            lastX = event.offsetX;
            lastY = event.offsetY;
        } else {
            if (((event.offsetX-lastX)**2+(event.offsetY-lastY)**2)**0.5 > 25 && !isErase) {
                ctx.strokeStyle = dynamicPen(color.value);
                ctx.beginPath();
            }
            ctx.arc(lastX, lastY, ctx.lineWidth/2, 0, 2*Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(event.offsetX, event.offsetY);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(event.offsetX, event.offsetY, ctx.lineWidth/2, 0, 2*Math.PI);
            ctx.fill();
            ctx.beginPath();
            lastX = event.offsetX;
            lastY = event.offsetY;
        }
        return;
    }
    ctx.moveTo(event.offsetX, event.offsetY);
}
function startPainting() {
    isPainting = true;
}
function cancelPainting() {
    isPainting = false;
    lastX = 1000;
    lastY = 0;
    brightness = 0;
    ctx.beginPath();
    save()
}
function onCanvasClick() {
    if (isFilling) {
        backgroundColor = color.value;
        ctx.fillRect(0, 0, 800, 800);
        save()
    }
}
function onLineWidthChange(event) {
    ctx.lineWidth = event.target.value;
}
function onColorChange(event) {
    ctx.strokeStyle = event.target.value;
    ctx.fillStyle = event.target.value;
    isErase = false;
    ctx.beginPath();
}
function onColorClick(event) {
    const colorValue = event.target.dataset.color;
    ctx.strokeStyle = event.target.dataset.color;
    ctx.fillStyle = event.target.dataset.color;
    color.value = colorValue;
    isErase = false;
    ctx.beginPath();
}
function onModeClick() {
    if (isFilling) {
        isFilling = false;
        modeBtn.innerText = "Drawing";
        eraserBtn.innerText = "Eraser";
    } else {
        isFilling = true;
        modeBtn.innerText = "Filling";
        eraserBtn.innerText = "Destroy";
    }
}
function onEraserClick() {
    if (isFilling) {
        const colorValue = color.value;
        backgroundColor = "white";
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 800, 800);
        ctx.strokeStyle = colorValue;
        ctx.fillStyle = colorValue;
        save()
    } else {
        isErase = true;
        ctx.strokeStyle = backgroundColor;
    }
}
function onSaveClick() {
    const fileName = prompt('Make your file name!', 'My drawing');
    if (fileName !== null) {
        const url = canvas.toDataURL();
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName + ".jpg";
        a.click();
    }
}

function dynamicPen(hex) {
    let random = 20/(Math.exp(-10*(Math.random()-0.5))+1)-10;
    if (brightness+random < -50 || 50 < brightness+random) {
        brightness -= random;
    } else {
        brightness += random;
    }
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const f = brightness / 100;
    const adj = v => Math.min(255, Math.max(0, Math.round(v + (f > 0 ? (255 - v) * f : v * f))));
    return `rgb(${adj(r)}, ${adj(g)}, ${adj(b)})`;
}

function save() {
    const url = encodeURIComponent(canvas.toDataURL());
    location.hash = `image=${url}&color=${backgroundColor}`;
    localStorage.setItem("image", url);
    localStorage.setItem("color", backgroundColor);
}

canvas.addEventListener("mousemove", onMove);
canvas.addEventListener("mousedown", startPainting);
canvas.addEventListener("mouseup", cancelPainting);
canvas.addEventListener("mouseleave", cancelPainting);
canvas.addEventListener("click", onCanvasClick);
lineWidth.addEventListener("change", onLineWidthChange);
color.addEventListener("change", onColorChange);
colorOption.forEach(color => color.addEventListener("click", onColorClick));
modeBtn.addEventListener("click", onModeClick);
eraserBtn.addEventListener("click", onEraserClick);
saveBtn.addEventListener("click", onSaveClick);