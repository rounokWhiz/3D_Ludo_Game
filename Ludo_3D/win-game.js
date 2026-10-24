// ============================================================
// WIN-GAME MODULE
//
// This file is fully decoupled from ludo.js. It doesn't import
// anything from it — it only:
//   1) Reads the same DOM elements (numberPicker, rollButton, winMessage)
//   2) Listens for two custom events that ludo.js dispatches on `window`:
//        - "turnChanged"      -> { color: "RED" | "GREEN" | "BLUE" | "YELLOW" }
//        - "diceRollComplete" -> { value: 1-6 }
//
// If you ever swap out ludo.js's internals, as long as those two
// events keep firing with the same shape, this file needs no changes.
// ============================================================

const numberPicker = document.getElementById("numberPicker");
const rollButton = document.getElementById("rollButton");
const winMessage = document.getElementById("winMessage");

if (!numberPicker || !rollButton || !winMessage) {
    console.error(
        "win-game.js: missing required element(s) —",
        "numberPicker:", !!numberPicker,
        "rollButton:", !!rollButton,
        "winMessage:", !!winMessage,
        "— check that index.html has all three IDs exactly as spelled here."
    );
} else {
    console.log("win-game.js loaded and wired up correctly.");

    const turnCssColors = {
        RED: "#e74c3c",
        GREEN: "#2ecc71",
        BLUE: "#3498db",
        YELLOW: "#f1c40f"
    };

    let activeColor = "RED";
    let chosenNumber = 1;

    // Snapshot the player's pick the moment they click Roll, so a later
    // change to the dropdown mid-roll can't retroactively change the check
    rollButton.addEventListener("click", function() {
        chosenNumber = parseInt(numberPicker.value, 10);
        winMessage.style.display = "none";
    });

    // ludo.js fires this whenever the active player changes
    window.addEventListener("turnChanged", function(event) {
        activeColor = event.detail.color;
        winMessage.style.display = "none";
    });

    // ludo.js fires this once the dice finishes rolling and settles
    window.addEventListener("diceRollComplete", function(event) {
        const rolledValue = event.detail.value;

        if (chosenNumber === rolledValue) {
            winMessage.textContent = activeColor + " WINS!";
            winMessage.style.background = turnCssColors[activeColor];
            winMessage.style.color =
                activeColor === "YELLOW" ? "#222222" : "#ffffff";
            winMessage.style.display = "block";
        } else {
            winMessage.style.display = "none";
        }
    });
}