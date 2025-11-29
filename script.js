const typingText = document.querySelector(".typing-text");
const inputField = document.querySelector(".input-field");
const timerTag = document.querySelector("#timer");
const wpmTag = document.querySelector("#wpm");
const accuracyTag = document.querySelector("#accuracy");
const restartBtn = document.querySelector("#restart-btn");
const modeBtns = document.querySelectorAll(".mode-btn");
const diffBtns = document.querySelectorAll(".diff-btn");
const typingAreaWrapper = document.querySelector(".typing-area-wrapper");
const startMessage = document.querySelector("#start-message");
const resultsModal = document.querySelector("#results-modal");
const finalWpm = document.querySelector("#final-wpm");
const finalAccuracy = document.querySelector("#final-accuracy");
const finalChars = document.querySelector("#final-chars");

let timer,
    maxTime = 300,
    timeLeft = maxTime,
    charIndex = 0,
    mistakes = 0,
    isTyping = 0,
    correctChars = 0,
    difficulty = 'easy';

const paragraphsData = {
    easy: [
        "the sun rises in the east and sets in the west",
        "cats and dogs are popular pets in many households",
        "reading books is a great way to learn new things",
        "apples and oranges are healthy fruits to eat daily",
        "walking in the park is relaxing and good for health",
        "blue is the color of the sky on a clear day",
        "birds fly high in the sky and sing beautiful songs",
        "water is essential for all living things on earth",
        "summer is the warmest season of the year",
        "music makes people feel happy and energetic"
    ],
    medium: [
        "The cyberpunk genre is a subgenre of science fiction in a dystopian futuristic setting that tends to focus on a combination of lowlife and high tech featuring advanced technological and scientific achievements.",
        "In the world of software development, clean code is not just about writing code that works. It is about writing code that is easy to understand, easy to maintain, and easy to extend.",
        "Quantum computing is a type of computation that harnesses the collective properties of quantum states, such as superposition, interference, and entanglement, to perform calculations.",
        "Design is not just what it looks like and feels like. Design is how it works. Great design is transparent, allowing the user to focus on the task at hand without being distracted by the interface itself.",
        "Artificial intelligence is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by animals including humans. AI research has been defined as the field of study of intelligent agents.",
        "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet and is commonly used for touch-typing practice. Speed is important, but accuracy is paramount.",
        "Virtual reality refers to a computer-generated simulation in which a person can interact within an artificial three-dimensional environment using electronic devices, such as special goggles with a screen.",
        "Blockchain is a shared, immutable ledger that facilitates the process of recording transactions and tracking assets in a business network. An asset can be tangible or intangible.",
        "Machine learning is a method of data analysis that automates analytical model building. It is a branch of artificial intelligence based on the idea that systems can learn from data.",
        "The internet of things describes physical objects with sensors, processing ability, software, and other technologies that connect and exchange data with other devices and systems over the Internet."
    ],
    hard: [
        "function debounce(func, wait) { let timeout; return function(...args) { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), wait); }; }",
        "The equation E=mc^2 represents the mass-energy equivalence, where E is energy, m is mass, and c is the speed of light in a vacuum (~3.00 x 10^8 m/s).",
        "SELECT * FROM users WHERE last_login < DATE_SUB(NOW(), INTERVAL 30 DAY) AND status = 'active' ORDER BY created_at DESC LIMIT 100;",
        "In C++, std::vector<int> v = {1, 2, 3, 4, 5}; for(const auto& i : v) { std::cout << i << ' '; } // Output: 1 2 3 4 5",
        "The SHA-256 hash of 'Hello World' is a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e.",
        "Regular expressions (regex) are powerful: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$ matches a valid email address.",
        "Docker containers wrap up a piece of software in a complete filesystem that contains everything it needs to run: code, runtime, system tools, system libraries.",
        "git commit -m 'Fix critical bug in payment gateway' && git push origin master --force # Be careful with force push!",
        "JSON.stringify({ name: 'John', age: 30, city: 'New York', skills: ['JS', 'HTML', 'CSS'] }, null, 2);",
        "The hexadecimal color code #FF5733 represents a vibrant shade of orange-red, often used in modern web design for call-to-action buttons."
    ]
};

function loadParagraph(isAppend = false) {
    const currentParagraphs = paragraphsData[difficulty];
    const randIndex = Math.floor(Math.random() * currentParagraphs.length);
    const textToAdd = currentParagraphs[randIndex];

    if (!isAppend) {
        typingText.innerHTML = "";
    } else {
        // Add a space before appending new text if it's not the start
        typingText.insertAdjacentHTML('beforeend', '<span> </span>');
    }

    textToAdd.split("").forEach(char => {
        let span = `<span>${char}</span>`;
        typingText.insertAdjacentHTML('beforeend', span);
    });

    if (!isAppend) {
        typingText.querySelectorAll("span")[0].classList.add("active");
        typingText.scrollTop = 0;
        document.addEventListener("keydown", () => inputField.focus());
        typingText.addEventListener("click", () => inputField.focus());
    }
}

function initTyping() {
    let characters = typingText.querySelectorAll("span");
    let typedValue = inputField.value;

    // Infinite scroll logic: if near end, append more text
    if (characters.length - charIndex < 50) {
        loadParagraph(true);
        // Re-query characters after append
        characters = typingText.querySelectorAll("span");
    }

    if (timeLeft > 0) {
        if (!isTyping) {
            timer = setInterval(initTimer, 1000);
            isTyping = true;
            typingAreaWrapper.classList.add("focused");
            startMessage.classList.add("hidden");
        }

        // Handle Addition
        if (typedValue.length > charIndex) {
            let typedChar = typedValue[charIndex];
            // Check if character exists (it should, due to append logic)
            if (characters[charIndex]) {
                if (characters[charIndex].innerText === typedChar) {
                    characters[charIndex].classList.add("correct");
                    correctChars++;
                } else {
                    mistakes++;
                    characters[charIndex].classList.add("incorrect");
                }
                charIndex++;
            }
        }
        // Handle Deletion (Backspace / Ctrl+Backspace)
        else {
            let deletedChars = charIndex - typedValue.length;
            for (let i = 0; i < deletedChars; i++) {
                if (charIndex > 0) {
                    charIndex--;
                    if (characters[charIndex].classList.contains("incorrect")) {
                        mistakes--;
                    } else {
                        correctChars--;
                    }
                    characters[charIndex].classList.remove("correct", "incorrect");
                }
            }
        }

        characters.forEach(span => span.classList.remove("active"));
        if (charIndex < characters.length) {
            characters[charIndex].classList.add("active");

            // Auto scroll logic
            let activeSpan = characters[charIndex];
            let spanTop = activeSpan.offsetTop;
            let containerTop = typingText.scrollTop;
            let containerHeight = typingText.clientHeight;

            if (spanTop - containerTop > containerHeight - 40) {
                typingText.scrollTop = spanTop - 40;
            } else if (spanTop - containerTop < 0) {
                typingText.scrollTop = spanTop;
            }
        }

        let wpm = Math.round(((charIndex - mistakes) / 5) / (maxTime - timeLeft) * 60);
        wpm = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;

        let accuracy = Math.floor(((charIndex - mistakes) / charIndex) * 100);
        accuracy = accuracy < 0 || !accuracy || accuracy === Infinity ? 100 : accuracy;

        wpmTag.innerText = wpm;
        accuracyTag.innerText = `${accuracy}%`;
    } else {
        clearInterval(timer);
        finishGame();
    }
}

function initTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        timerTag.innerText = timeLeft;
        let wpm = Math.round(((charIndex - mistakes) / 5) / (maxTime - timeLeft) * 60);
        wpmTag.innerText = wpm;
    } else {
        clearInterval(timer);
        finishGame();
    }
}

function finishGame() {
    inputField.value = "";

    // Calculate final stats
    let wpm = Math.round(((charIndex - mistakes) / 5) / (maxTime - timeLeft > 0 ? maxTime - timeLeft : maxTime) * 60);
    if (timeLeft === 0) {
        wpm = Math.round(((charIndex - mistakes) / 5) / maxTime * 60);
    }

    let accuracy = Math.floor(((charIndex - mistakes) / charIndex) * 100);
    if (isNaN(accuracy)) accuracy = 0;

    finalWpm.innerText = wpm;
    finalAccuracy.innerText = `${accuracy}%`;
    finalChars.innerText = `${correctChars}/${mistakes}/${charIndex}/${typingText.querySelectorAll("span").length - charIndex}`;

    resultsModal.classList.remove("hidden");
    setTimeout(() => resultsModal.classList.add("show"), 10);
}

function resetGame() {
    loadParagraph();
    clearInterval(timer);
    timeLeft = maxTime;
    charIndex = mistakes = isTyping = correctChars = 0;
    inputField.value = "";
    timerTag.innerText = timeLeft;
    wpmTag.innerText = 0;
    accuracyTag.innerText = "100%";
    resultsModal.classList.remove("show");
    setTimeout(() => resultsModal.classList.add("hidden"), 300);
    typingAreaWrapper.classList.remove("focused");
    startMessage.classList.remove("hidden");
}

// Event Listeners
inputField.addEventListener("input", initTyping);
restartBtn.addEventListener("click", resetGame);

modeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        modeBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        maxTime = parseInt(btn.dataset.value);
        resetGame();
    });
});

diffBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        diffBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        difficulty = btn.dataset.difficulty;
        resetGame();
    });
});

// Focus handling
typingAreaWrapper.addEventListener("click", () => {
    inputField.focus();
    typingAreaWrapper.classList.add("focused");
});

inputField.addEventListener("focus", () => {
});

inputField.addEventListener("blur", () => {
});

loadParagraph();
