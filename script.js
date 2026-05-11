const i18n = {
    ru: { title: "RND Эволюция", btn: "СЛУЧ", ready: "Система готова", admin: "Настройки движка", close: "ЗАКРЫТЬ", filter: "Фильтр", reverb: "Реверберация", release: "Длина хвоста", credits: "Спасибо Rozetked за идею!" },
    en: { title: "RND Evolution", btn: "RND", ready: "System ready", admin: "Engine Settings", close: "CLOSE", filter: "Filter", reverb: "Reverb", release: "Release Time", credits: "Thanks to Rozetked for the idea!" },
    fr: { title: "RND Évolution", btn: "RND", ready: "Système prêt", admin: "Paramètres", close: "FERMER", filter: "Filtre", reverb: "Réverbération", release: "Temps de sortie", credits: "Merci à Rozetked pour l'idée!" },
    zh: { title: "RND 进化", btn: "随机", ready: "系统就绪", admin: "引擎设置", close: "关闭", filter: "滤波器", reverb: "混响", release: "释放时间", credits: "感谢 Rozetked 的创意！" }
};

let currentLang = 'ru';
let releaseTime = 6;
let combo = [];
const secret = ['light', 'dark', 'light', 'dark'];
const activeSynths = [];

const limiter = new Tone.Limiter(-5).toDestination();
const reverb = new Tone.Reverb({ decay: 8, wet: 0.4 }).connect(limiter);
const filter = new Tone.Filter(1200, "lowpass", -24).connect(reverb);

function setLang(lang) {
    currentLang = lang;
    const t = i18n[lang];
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.innerText.toLowerCase() === lang));
    document.getElementById('main-title').innerText = t.title;
    document.getElementById('rndButton').innerText = t.btn;
    document.getElementById('info').innerText = t.ready;
    document.getElementById('admin-title').innerText = t.admin;
    document.getElementById('admin-close').innerText = t.close;
    document.getElementById('label-filter').innerText = t.filter;
    document.getElementById('label-reverb').innerText = t.reverb;
    document.getElementById('label-release').innerText = t.release;
    document.getElementById('credits').innerText = t.credits;
}

function handleThemeClick(theme) {
    document.body.className = theme;
    combo.push(theme);
    if (combo.length > 4) combo.shift();
    if (JSON.stringify(combo) === JSON.stringify(secret)) { toggleAdmin(); combo = []; }
}

function toggleAdmin() { document.getElementById('adminPanel').classList.toggle('visible'); }

function updateParam(type, val) {
    if (type === 'filter') filter.frequency.rampTo(val, 0.1);
    if (type === 'reverb') reverb.wet.rampTo(val, 0.1);
    if (type === 'release') releaseTime = parseFloat(val);
}

async function playSound() {
    if (Tone.context.state !== 'running') await Tone.start();
    if (activeSynths.length >= 3) {
        const oldest = activeSynths.shift();
        oldest.envelope.release = 0.1;
        oldest.triggerRelease();
        setTimeout(() => oldest.dispose(), 200);
    }
    const synth = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.4, decay: 1, sustain: 0.2, release: releaseTime }
    }).connect(filter);
    activeSynths.push(synth);
    const scale = ["C2", "G2", "C3", "E3", "G3", "B3", "D4", "A3"];
    const note = scale[Math.floor(Math.random() * scale.length)];
    synth.triggerAttackRelease(note, "2n");
    setTimeout(() => {
        const index = activeSynths.indexOf(synth);
        if (index > -1) activeSynths.splice(index, 1);
        synth.dispose();
    }, (releaseTime + 2) * 1000);
    document.getElementById('info').innerText = `SIG: ${note}`;
    createPulse();
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let pulses = [];
function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.onresize = resize; resize();

function createPulse() {
    pulses.push({ r: 0, opacity: 1, color: getComputedStyle(document.body).getPropertyValue('--accent') });
}

function draw() {
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg');
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    pulses.forEach((p, i) => {
        p.r += 1.5; p.opacity -= 0.005;
        ctx.beginPath(); ctx.arc(canvas.width/2, canvas.height/2, p.r, 0, Math.PI*2);
        ctx.strokeStyle = p.color; ctx.globalAlpha = Math.max(0, p.opacity); ctx.stroke();
        if(p.opacity <= 0) pulses.splice(i, 1);
    });
    requestAnimationFrame(draw);
}
draw();
document.getElementById('rndButton').addEventListener('click', playSound);
setLang('ru');
