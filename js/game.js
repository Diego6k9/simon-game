let buttonColors = ["green", "red", "yellow", "blue"];
let gamePattern = [];
let userClickedPattern = [];
let level = 0;
let gameStarted = false;
let buttonsClickable = false;
let overlay = $("#game-over-overlay");

/**
 * Generates the next sequence in the game by selecting a random color,
 * updating the game pattern, animating the selected button, and playing its corresponding sound.
 * Also increments the game level and updates the level display.
 *
 * @return {void} Does not return a value.
 */
function nextSequence() {

    let randomNumber = Math.round(Math.random() * 3);
    let randomChosenColor = buttonColors[randomNumber];
    gamePattern.push(randomChosenColor);

    $("#" + randomChosenColor).fadeOut(250).fadeIn(250);
    playSound(randomChosenColor);
    level++;
    $("#level-title").text("Level " + level);

    setTimeout(function () {
        buttonsClickable = true;
    }, 500); // Fade out + fade in

}

/**
 * Plays the specified sound file.
 *
 * @param {string} name - The name of the sound file to be played, excluding the file extension.
 * @return {void} Does not return a value.
 */
function playSound(name) {
    new Audio("assets/sounds/" + name + ".mp3").play();
}

/**
 * Adds a "pressed" CSS class to the button of the specified color,
 * creating an animation effect, and removes the class after a short timeout.
 *
 * @param {string} currentColor - The color of the button to be animated.
 * @return {void} This method does not return a value.
 */
function animatePress(currentColor) {
    let button = $("#" + currentColor);
    button.addClass("pressed");
    setTimeout(function () {
        button.removeClass("pressed");
    }, 100);
}

/**
 * Compares the user's input with the game's pattern at the specified level.
 *
 * @param {number} currentLevel - The current level to check the user's answer against the game pattern.
 * @return {boolean} - Returns true if the user's input matches the game pattern at the given level, otherwise false.
 */
function checkAnswer(currentLevel) {
    return gamePattern[currentLevel] === userClickedPattern[currentLevel];
}

/**
 * Resets the game's statistics, including level and patterns.
 *
 * This method reinitializes the game state by setting the level to 0
 * and clearing both the game-generated pattern and the user-clicked pattern.
 *
 * @return {void} No return value.
 */
function resetGameStats() {
    level = 0;
    gamePattern = [];
    userClickedPattern = [];
}

/**
 * Updates the endgame UI by applying special effects to user and game buttons,
 * creating a visual history of the game sequence, and animating a marquee track.
 *
 * The method performs the following actions:
 * - Highlights the last incorrect button pressed by the user with a red outline and adds a textual indication.
 * - Highlights the last correct button in the game sequence with a green outline.
 * - Creates and animates a marquee that displays the entire game sequence as a scrolling history of color blocks.
 *
 * @return {void} This method does not return a value.
 */
function editEndgameUI() {

    // Add outline and text to the wrong button pressed
    let wrongButtonColor = userClickedPattern[userClickedPattern.length - 1];
    let wrongButton = $("#" + wrongButtonColor)
    wrongButton.addClass("red-outline");
    wrongButton.html("<p>Got you :P</p>");

    // Add outline to the correct button
    let correctButtonColor = gamePattern[userClickedPattern.length - 1];
    let correctButton = $("#" + correctButtonColor)
    correctButton.addClass("green-outline");

    // Add marquee
    let marqueeContainer = $(".marquee"); // Parent container
    let marqueeTrack = $(".marquee-track");
    marqueeTrack.empty();
    marqueeTrack.css("animation", "none");

    let htmlContent = "";
    gamePattern.forEach(color => {
        htmlContent += "<div class='history-block " + color + "'></div>";
    });

    marqueeTrack.html(htmlContent);
    let parentWidth = marqueeContainer.width();
    let trackWidth = gamePattern.length * (30 + 16);

    marqueeTrack.css("--start-position", parentWidth + "px");

    let totalDistance = parentWidth + trackWidth;
    let speed = 200; // Pixel per second
    let duration = totalDistance / speed;

    setTimeout(() => {
        marqueeTrack.css("animation", "fly-through " + duration + "s linear infinite");
    }, 50)

    setTimeout(() => {
        marqueeContainer.removeClass("invisible");
    }, 250);
}

/**
 * Resets the state of buttons and marquee elements on the page.
 * Removes specific classes from buttons, clears their content, and hides the marquee element.
 *
 * @return {void} This method does not return a value.
 */
function resetButtons() {
    let btn = $(".btn");
    let marquee = $(".marquee");
    btn.removeClass("red-outline green-outline");
    btn.html("");
    marquee.addClass("invisible");
}

/**
 * Terminates the ongoing game session, updates the UI to reflect the game-over state,
 * plays a failure sound, and resets game statistics to prepare for a new game.
 *
 * @return {void} This method does not return a value.
 */
function endGame() {
    gameStarted = false;
    let body = $("body");
    let title = $("#level-title");

    body.addClass("game-over");
    overlay.addClass("overlay-active");

    setTimeout(function () {
        body.removeClass("game-over");
    }, 250);

    playSound("wrong");
    title.html("Game over! You reached <span class='level-color'>level " + level + "</span>.<br> Press any key to restart.");

    editEndgameUI();
    resetGameStats();

}

$(".btn").on("click", function () {

    if (gameStarted && buttonsClickable) {
        let userChosenColor = this.id;
        userClickedPattern.push(userChosenColor);
        animatePress(userChosenColor);

        if (checkAnswer(userClickedPattern.length - 1)) {

            playSound(userChosenColor);

            if (userClickedPattern.length === gamePattern.length) {
                userClickedPattern = [];
                buttonsClickable = false; // Prevent accidental clicks until we know the next color
                setTimeout(nextSequence, 1000);
            }

        } else {
            endGame();
        }

    }
});


$(document).on("keydown", function () {
    if (!gameStarted) {

        if (overlay.hasClass("overlay-active")) {
            overlay.removeClass("overlay-active");
        }

        resetButtons();
        gameStarted = true;
        nextSequence();
    }
})