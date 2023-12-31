// below code is modified from quarklight where i originally stole it
// below function modified from oneko.js: https://github.com/adryd325/oneko.js
let direction;
function oneko() {
    const nekoEl = document.createElement("div");
    let nekoPosX = Math.floor(Math.random() * window.innerWidth);
    let nekoPosY = Math.floor(Math.random() * window.innerHeight);
    let mousePosX = 0;
    let mousePosY = 0;
    const isReduced = window.matchMedia(`(prefers-reduced-motion: reduce)`) === true || window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;
    if (isReduced) {
        return;
    }

    let frameCount = 0;
    let idleTime = 0;
    let idleAnimation = null;
    let idleAnimationFrame = 0;
    const nekoSpeed = 10;
    const spriteSets = {
        idle: [[-3, -3]],
        alert: [[-7, -3]],
        scratchSelf: [
            [-5, 0],
            [-6, 0],
            [-7, 0],
        ],
        scratchWallN: [
            [0, 0],
            [0, -1],
        ],
        scratchWallS: [
            [-7, -1],
            [-6, -2],
        ],
        scratchWallE: [
            [-2, -2],
            [-2, -3],
        ],
        scratchWallW: [
            [-4, 0],
            [-4, -1],
        ],
        tired: [[-3, -2]],
        sleeping: [
            [-2, 0],
            [-2, -1],
        ],
        N: [
            [-1, -2],
            [-1, -3],
        ],
        NE: [
            [0, -2],
            [0, -3],
        ],
        E: [
            [-3, 0],
            [-3, -1],
        ],
        SE: [
            [-5, -1],
            [-5, -2],
        ],
        S: [
            [-6, -3],
            [-7, -2],
        ],
        SW: [
            [-5, -3],
            [-6, -1],
        ],
        W: [
            [-4, -2],
            [-4, -3],
        ],
        NW: [
            [-1, 0],
            [-1, -1],
        ],
    };

    function create() {
        nekoEl.id = "oneko";
        nekoEl.style.width = "32px";
        nekoEl.style.height = "32px";
        nekoEl.style.position = "fixed";
        // nekoEl.style.pointerEvents = "none";
        nekoEl.style.backgroundImage = "url('/assets/random/oneko.gif')";
        nekoEl.style.imageRendering = "pixelated";
        nekoEl.style.left = `${nekoPosX - 16}px`;
        nekoEl.style.top = `${nekoPosY - 16}px`;
        nekoEl.style.zIndex = "999";

        document.body.appendChild(nekoEl);

        nekoEl.onekoInterval = setInterval(frame, 100);

        nekoEl.moveListener = (e) => {
            const diffX = nekoPosX - e.pageX;
            const diffY = nekoPosY - e.pageY;
            const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

            if (distance < 48) {
                // eek! mouse is too close!! run away!!!
                targetPicker()
            }
        }
        document.addEventListener("mousemove", nekoEl.moveListener)
    }

    function setSprite(name, frame) {
        const sprite = spriteSets[name][frame % spriteSets[name].length];
        nekoEl.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
    }

    function resetIdleAnimation() {
        idleAnimation = null;
        idleAnimationFrame = 0;
    }

    function idle() {
        idleTime += 1;

        // every ~ 20 seconds
        if (
            idleTime > 10 &&
            Math.floor(Math.random() * 200) === 0 &&
            idleAnimation == null
        ) {
            let availableIdleAnimations = ["sleeping", "scratchSelf"];
            if (nekoPosX < 32) {
                availableIdleAnimations.push("scratchWallW");
            }
            if (nekoPosY < 32) {
                availableIdleAnimations.push("scratchWallN");
            }
            if (nekoPosX > window.innerWidth - 32) {
                availableIdleAnimations.push("scratchWallE");
            }
            if (nekoPosY > window.innerHeight - 32) {
                availableIdleAnimations.push("scratchWallS");
            }
            idleAnimation =
                availableIdleAnimations[
                    Math.floor(Math.random() * availableIdleAnimations.length)
                    ];
        }

        switch (idleAnimation) {
            case "sleeping":
                if (idleAnimationFrame < 8) {
                    setSprite("tired", 0);
                    break;
                }
                setSprite("sleeping", Math.floor(idleAnimationFrame / 4));
                if (idleAnimationFrame > 192) {
                    resetIdleAnimation();
                }
                break;
            case "scratchWallN":
            case "scratchWallS":
            case "scratchWallE":
            case "scratchWallW":
            case "scratchSelf":
                setSprite(idleAnimation, idleAnimationFrame);
                if (idleAnimationFrame > 9) {
                    resetIdleAnimation();
                }
                break;
            default:
                setSprite("idle", 0);
                return;
        }
        idleAnimationFrame += 1;
    }

    const targetPicker = () => {
        if (Math.random() > 0.5) return;
        mousePosX = Math.floor(Math.random() * window.innerWidth)
        mousePosY = Math.floor(Math.random() * window.innerHeight)
    }
    nekoEl.pickTarget = setInterval(targetPicker, 5000)
    targetPicker()


    function frame() {
        frameCount += 1;
        const diffX = nekoPosX - mousePosX;
        const diffY = nekoPosY - mousePosY;
        const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

        if (distance < nekoSpeed || distance < 48) {
            idle();
            return;
        }

        idleAnimation = null;
        idleAnimationFrame = 0;

        if (idleTime > 1) {
            setSprite("alert", 0);
            // count down after being alerted before moving
            idleTime = Math.min(idleTime, 7);
            idleTime -= 1;
            return;
        }

        direction = diffY / distance > 0.5 ? "N" : "";
        direction += diffY / distance < -0.5 ? "S" : "";
        direction += diffX / distance > 0.5 ? "W" : "";
        direction += diffX / distance < -0.5 ? "E" : "";
        setSprite(direction, frameCount);

        nekoPosX -= (diffX / distance) * nekoSpeed;
        nekoPosY -= (diffY / distance) * nekoSpeed;

        nekoPosX = Math.min(Math.max(16, nekoPosX), window.innerWidth - 16);
        nekoPosY = Math.min(Math.max(16, nekoPosY), window.innerHeight - 16);

        nekoEl.style.left = `${nekoPosX - 16}px`;
        nekoEl.style.top = `${nekoPosY - 16}px`;
    }

    create();
}

let onekoSpawner;
function startOnekoHell() {

// Oneko spawner
    onekoSpawner = setInterval(() => {
        const onekos = document.querySelectorAll("#oneko");
        const onekoCount = onekos.length
        if (onekoCount > 7) {
            return;
        }
        oneko();
    }, 10000)
    oneko();

    document.addEventListener("click", (e) => {
        if (e.target.id === "oneko") {
            let killCount = localStorage.getItem("onekoKills")
            killCount = Number(killCount)
            if (!killCount) killCount = 0
            killCount++
            localStorage.setItem("onekoKills", killCount)
            clearInterval(e.target.pickTarget)
            clearInterval(e.target.onekoInterval)
            document.removeEventListener("mousemove", e.target.moveListener)
            e.target.remove();
        }
    })
}

if (localStorage.getItem("kitty") === "enabled") startOnekoHell()
else if (localStorage.getItem("nokitty") !== "enabled") oneko();