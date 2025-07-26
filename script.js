// Global variables for test state
let allQuestions = [];
let currentQuestions = [];
let currentQuestion = 0;
let userAnswers = [];

// Topic mapping for organization
const topicCategories = {
    'Government Basics': ['government', 'constitution basics', 'system of government'],
    'Writing the Constitution': ['constitutional convention', 'federalist papers', 'constitution creation'],
    'Courts': ['supreme court', 'judicial branch', 'courts'],
    'Congress': ['legislative branch', 'senate', 'house of representatives', 'congress'],
    'The Presidency': ['executive branch', 'president', 'commander in chief'],
    'A Growing Nation': ['westward expansion', 'louisiana purchase', 'territorial growth'],
    'Geography': ['geography', 'states', 'rivers', 'capitals', 'territories'],
    'Establishing Independence': ['revolutionary war', 'declaration of independence', 'founding'],
    'The 1800s': ['civil war', '1800s', 'abraham lincoln', 'slavery'],
    'The 1900s': ['world war', 'cold war', '1900s', 'great depression'],
    'Famous Citizens': ['founding fathers', 'benjamin franklin', 'washington', 'jefferson'],
    'Rights': ['bill of rights', 'amendments', 'civil rights', 'freedoms'],
    'Responsibilities': ['citizenship duties', 'civic responsibilities'],
    'Voting': ['elections', 'voting', 'democracy'],
    'Symbols and Holidays': ['flag', 'anthem', 'holidays', 'symbols']
};

// Function to load and parse CSV file
async function loadQuestionsFromCSV() {
    try {
        const response = await fetch('questions.csv');
        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error('Error loading questions.csv:', error);
        // Fallback to embedded questions if CSV fails
        return getFallbackQuestions();
    }
}

// Function to parse CSV data
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    
    const questions = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        
        if (values.length >= 7) {
            const question = {
                question: values[0].replace(/"/g, ''),
                options: [
                    values[1].replace(/"/g, ''),
                    values[2].replace(/"/g, ''),
                    values[3].replace(/"/g, ''),
                    values[4].replace(/"/g, '')
                ],
                correct: values[5].replace(/"/g, '') === 'A' ? 0 : 
                        values[5].replace(/"/g, '') === 'B' ? 1 : 
                        values[5].replace(/"/g, '') === 'C' ? 2 : 3,
                explanation: values[6].replace(/"/g, ''),
                topic: values[7] ? values[7].replace(/"/g, '') : 'General',
                category: categorizeQuestion(values[0], values[7])
            };
            questions.push(question);
        }
    }
    
    return questions;
}

// Helper function to parse CSV line handling quotes and commas
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"' && line[j + 1] === '"') {
            current += '"';
            j++; // Skip next quote
        } else if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current.trim()); // Add the last value
    
    return values;
}

// Function to categorize questions based on content and topic
function categorizeQuestion(questionText, originalTopic) {
    if (!questionText) return 'Government Basics';
    
    const questionLower = questionText.toLowerCase();
    const topicLower = originalTopic ? originalTopic.toLowerCase() : '';
    
    // Check each category for keyword matches
    for (const [category, keywords] of Object.entries(topicCategories)) {
        for (const keyword of keywords) {
            if (questionLower.includes(keyword.toLowerCase()) || 
                topicLower.includes(keyword.toLowerCase())) {
                return category;
            }
        }
    }
    
    // Additional specific categorization rules
    if (questionLower.includes('president') || questionLower.includes('commander in chief')) {
        return 'The Presidency';
    }
    if (questionLower.includes('senator') || questionLower.includes('representative') || questionLower.includes('congress')) {
        return 'Congress';
    }
    if (questionLower.includes('constitution') && (questionLower.includes('written') || questionLower.includes('convention'))) {
        return 'Writing the Constitution';
    }
    if (questionLower.includes('supreme court') || questionLower.includes('chief justice')) {
        return 'Courts';
    }
    if (questionLower.includes('flag') || questionLower.includes('anthem') || questionLower.includes('holiday')) {
        return 'Symbols and Holidays';
    }
    if (questionLower.includes('vote') || questionLower.includes('election')) {
        return 'Voting';
    }
    if (questionLower.includes('right') || questionLower.includes('amendment') || questionLower.includes('bill of rights')) {
        return 'Rights';
    }
    if (questionLower.includes('war') && (questionLower.includes('1900') || questionLower.includes('world war') || questionLower.includes('cold war'))) {
        return 'The 1900s';
    }
    if (questionLower.includes('civil war') || questionLower.includes('lincoln') || questionLower.includes('1800')) {
        return 'The 1800s';
    }
    if (questionLower.includes('franklin') || questionLower.includes('washington') || questionLower.includes('jefferson')) {
        return 'Famous Citizens';
    }
    if (questionLower.includes('ocean') || questionLower.includes('river') || questionLower.includes('state') || questionLower.includes('capital')) {
        return 'Geography';
    }
    if (questionLower.includes('declaration') || questionLower.includes('revolutionary') || questionLower.includes('independence')) {
        return 'Establishing Independence';
    }
    if (questionLower.includes('territory') || questionLower.includes('louisiana') || questionLower.includes('expansion')) {
        return 'A Growing Nation';
    }
    
    // Default to Government Basics for uncategorized government questions
    return 'Government Basics';
}

// Fallback questions if CSV loading fails
function getFallbackQuestions() {
    return [
        {
            question: "What is the supreme law of the land?",
            options: ["The Declaration of Independence", "The Constitution", "The Bill of Rights", "The Federalist Papers"],
            correct: 1,
            explanation: "The Constitution is the supreme law of the United States.",
            topic: "Government",
            category: "Government Basics"
        },
        {
            question: "Who wrote the Declaration of Independence?",
            options: ["George Washington", "Thomas Jefferson", "Benjamin Franklin", "John Adams"],
            correct: 1,
            explanation: "Thomas Jefferson was the primary author of the Declaration of Independence.",
            topic: "History",
            category: "Establishing Independence"
        },
        {
            question: "What are the first 10 amendments to the Constitution called?",
            options: ["The Articles of Confederation", "The Bill of Rights", "The Federalist Papers", "The Declaration of Rights"],
            correct: 1,
            explanation: "The first 10 amendments are called the Bill of Rights.",
            topic: "Government",
            category: "Rights"
        }
    ];
}

// Function to get random questions for a test
function getRandomQuestions(count = 10, category = null) {
    let availableQuestions = allQuestions;
    
    // Filter by category if specified
    if (category) {
        availableQuestions = allQuestions.filter(q => 
            q.category === category
        );
        console.log(`Filtering by category: ${category}, found ${availableQuestions.length} questions`);
    }
    
    if (availableQuestions.length === 0) {
        console.warn(`No questions found for category: ${category || 'all'}`);
        console.log('Available categories:', [...new Set(allQuestions.map(q => q.category))]);
        return [];
    }
    
    // Shuffle and select random questions
    const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Function to get questions by category
function getQuestionsByCategory(category) {
    return allQuestions.filter(q => q.category === category);
}

// Get available categories with question counts
function getAvailableCategories() {
    const categoryCounts = {};
    
    // Initialize all expected categories
    Object.keys(topicCategories).forEach(category => {
        categoryCounts[category] = 0;
    });
    
    // Count questions in each category
    allQuestions.forEach(q => {
        if (categoryCounts.hasOwnProperty(q.category)) {
            categoryCounts[q.category]++;
        } else {
            categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
        }
    });
    
    return categoryCounts;
}

// Navigation functions
function showScreen(screenId) {
    // Update screens
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
    
    // Update nav links - only if we're not on loading/error screens
    if (screenId !== 'loading' && screenId !== 'error') {
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        
        // Find and activate the correct nav link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const onclick = link.getAttribute('onclick');
            if (onclick && onclick.includes(screenId)) {
                link.classList.add('active');
            }
        });
    }
}

// Practice test functions
function startPracticeTest(category = null) {
    // Get random questions (10 for full test, or filtered by category)
    currentQuestions = getRandomQuestions(10, category);
    
    if (currentQuestions.length === 0) {
        alert('No questions available for this topic! Please try another topic or the full test.');
        return;
    }
    
    currentQuestion = 0;
    userAnswers = [];
    
    console.log(`Starting test with ${currentQuestions.length} questions`, category ? `(Category: ${category})` : '(All categories)');
    
    loadQuestion();
    showScreen('practice');
    
    // Update nav link to show practice test as active
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    const practiceLink = document.querySelector('[onclick*="practice"]');
    if (practiceLink) practiceLink.classList.add('active');
}

function loadQuestion() {
    if (currentQuestions.length === 0) {
        alert('No questions available!');
        showScreen('home');
        return;
    }
    
    const question = currentQuestions[currentQuestion];
    document.getElementById('question-counter').textContent = `Question ${currentQuestion + 1} of ${currentQuestions.length}`;
    document.getElementById('question-text').textContent = question.question;
    document.getElementById('test-progress').style.width = `${((currentQuestion + 1) / currentQuestions.length) * 100}%`;
    
    const optionsContainer = document.getElementById('answers-grid');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'answer-option';
        button.textContent = `${String.fromCharCode(65 + index)}) ${option}`;
        button.onclick = () => selectAnswer(index);
        optionsContainer.appendChild(button);
    });
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (prevBtn) prevBtn.disabled = currentQuestion === 0;
    if (nextBtn) nextBtn.textContent = currentQuestion === currentQuestions.length - 1 ? 'Finish Test' : 'Next →';
    
    updateAnswerSelection();
}

function selectAnswer(answerIndex) {
    userAnswers[currentQuestion] = answerIndex;
    updateAnswerSelection();
}

function updateAnswerSelection() {
    const options = document.querySelectorAll('.answer-option');
    options.forEach((option, index) => {
        option.classList.remove('selected');
        if (userAnswers[currentQuestion] === index) {
            option.classList.add('selected');
        }
    });
}

function nextQuestion() {
    if (currentQuestion < currentQuestions.length - 1) {
        currentQuestion++;
        loadQuestion();
    } else {
        finishTest();
    }
}

function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        loadQuestion();
    }
}

function finishTest() {
    const score = calculateScore();
    const percentage = Math.round((score.correct / score.total) * 100);
    const passed = percentage >= 60;
    
    const message = passed 
        ? `🎉 Congratulations! You passed with ${percentage}%!\n\nYou got ${score.correct} out of ${score.total} questions correct.\n\nYou're ready for the real citizenship test!`
        : `Keep studying! You got ${percentage}%.\n\nYou got ${score.correct} out of ${score.total} questions correct.\n\nYou need 60% to pass. Try again when you're ready!`;
    
    alert(message);
    
    // Return to home screen
    showScreen('home');
}

function calculateScore() {
    let correct = 0;
    for (let i = 0; i < Math.min(userAnswers.length, currentQuestions.length); i++) {
        if (userAnswers[i] === currentQuestions[i].correct) {
            correct++;
        }
    }
    return {
        correct: correct,
        total: currentQuestions.length,
        percentage: Math.round((correct / currentQuestions.length) * 100)
    };
}

function pauseTest() {
    if (confirm('Are you sure you want to pause the test? Your progress will be saved.')) {
        showScreen('home');
    }
}

// Text-to-speech function
function speakQuestion() {
    const questionText = document.getElementById('question-text')?.textContent;
    if (!questionText) return;
    
    if ('speechSynthesis' in window) {
        // Stop any currently speaking utterance
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(questionText);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 1;
        speechSynthesis.speak(utterance);
    } else {
        alert('Text-to-speech is not supported in your browser. Please try using a modern browser like Chrome, Firefox, or Safari.');
    }
}

// Function to start category-specific practice
function startCategoryPractice(category) {
    startPracticeTest(category);
}

// Display statistics about available questions
function displayQuestionStats() {
    if (allQuestions.length === 0) {
        console.log('📊 No questions loaded yet');
        return;
    }
    
    const categories = getAvailableCategories();
    console.log('📊 Question Database Stats:');
    console.log(`Total Questions: ${allQuestions.length}`);
    console.log('Questions by Category:');
    
    Object.entries(categories).forEach(([category, count]) => {
        if (count > 0) {
            console.log(`  ${category}: ${count} questions`);
        }
    });
    
    // Debug: Show first few questions with their categories
    console.log('Sample questions with categories:');
    allQuestions.slice(0, 3).forEach(q => {
        console.log(`  "${q.question.substring(0, 50)}..." → Category: "${q.category}"`);
    });
}

// Function to update topic cards with real data and new categories
function updateTopicCards() {
    const topicsGrid = document.querySelector('.topics-grid');
    if (!topicsGrid) {
        console.error('Topics grid not found');
        return;
    }
    
    // Clear existing cards
    topicsGrid.innerHTML = '';
    
    // Create cards for each category
    const categories = getAvailableCategories();
    console.log('Creating topic cards for categories:', categories);
    
    let cardsCreated = 0;
    Object.entries(categories).forEach(([category, count]) => {
        if (count > 0) {
            const card = createTopicCard(category, count);
            topicsGrid.appendChild(card);
            cardsCreated++;
        }
    });
    
    // If no categories found, show a message
    if (cardsCreated === 0) {
        console.warn('No topic cards created, showing fallback message');
        topicsGrid.innerHTML = `
            <div class="topic-card" style="grid-column: 1 / -1;">
                <h3>⚠️ No Topics Available</h3>
                <p>Please check your questions.csv file format and content.</p>
                <p style="margin-top: 10px; font-size: 14px; color: #666;">
                    Expected format: question,option_a,option_b,option_c,option_d,correct_answer,explanation,topic
                </p>
            </div>
        `;
    } else {
        console.log(`Created ${cardsCreated} topic cards`);
    }
}

// Function to create a topic card
function createTopicCard(category, questionCount) {
    const card = document.createElement('div');
    card.className = 'topic-card';
    card.onclick = () => startCategoryPractice(category);
    
    // Get category description
    const descriptions = {
        'Government Basics': 'Fundamental principles of U.S. government',
        'Writing the Constitution': 'Creation and ratification of the Constitution',
        'Courts': 'Judicial branch and Supreme Court',
        'Congress': 'Legislative branch and lawmaking',
        'The Presidency': 'Executive branch and presidential powers',
        'A Growing Nation': 'Territorial expansion and growth',
        'Geography': 'U.S. states, capitals, and landmarks',
        'Establishing Independence': 'Revolutionary War and founding',
        'The 1800s': 'Civil War era and 19th century',
        'The 1900s': 'Modern history and world wars',
        'Famous Citizens': 'Important historical figures',
        'Rights': 'Constitutional rights and freedoms',
        'Responsibilities': 'Civic duties and obligations',
        'Voting': 'Elections and democratic processes',
        'Symbols and Holidays': 'National symbols and observances'
    };
    
    card.innerHTML = `
        <h3>${category}</h3>
        <p>${descriptions[category] || 'Study questions for this topic'}</p>
        <p style="margin-top: 12px; font-weight: 600; color: #3b82f6;">${questionCount} questions available</p>
    `;
    
    return card;
}

// Language selector functionality
function initLanguageSelector() {
    const languageSelector = document.getElementById('language-select');
    if (languageSelector) {
        languageSelector.addEventListener('click', function() {
            alert('🌍 Multi-language support coming soon!\n\nWe are working on adding Spanish, Chinese, and other languages to make this platform accessible to more communities.');
        });
    }
}

// Keyboard navigation support
function initKeyboardNavigation() {
    document.addEventListener('keydown', function(event) {
        // Only handle keyboard events when on practice test screen
        const practiceScreen = document.getElementById('practice');
        if (!practiceScreen || !practiceScreen.classList.contains('active')) return;
        
        switch(event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                if (currentQuestion > 0) {
                    previousQuestion();
                }
                break;
            case 'ArrowRight':
                event.preventDefault();
                nextQuestion();
                break;
            case '1':
            case '2':
            case '3':
            case '4':
                event.preventDefault();
                const answerIndex = parseInt(event.key) - 1;
                if (currentQuestions[currentQuestion] && answerIndex < currentQuestions[currentQuestion].options.length) {
                    selectAnswer(answerIndex);
                }
                break;
            case 'Enter':
                event.preventDefault();
                nextQuestion();
                break;
            case ' ':
                event.preventDefault();
                speakQuestion();
                break;
        }
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🇺🇸 Citizenship Test Prep App Loading...');
    
    // Show loading screen
    showScreen('loading');
    
    try {
        // Load questions from CSV
        allQuestions = await loadQuestionsFromCSV();
        
        if (allQuestions.length === 0) {
            console.error('❌ No questions loaded! Check questions.csv file.');
            showScreen('error');
            return;
        }
        
        // Initialize all functionality
        initLanguageSelector();
        initKeyboardNavigation();
        
        // Display question statistics
        displayQuestionStats();
        
        // Update study topics to show actual counts and new categories
        updateTopicCards();
        
        // Set initial screen to home
        showScreen('home');
        
        console.log('✅ Citizenship Test Prep App Loaded Successfully');
        console.log('📚 Total Questions Available:', allQuestions.length);
        console.log('♿ Accessibility: Keyboard navigation and screen reader support enabled');
        console.log('🔊 Audio: Text-to-speech available for all questions');
        console.log('📊 CSV: Questions loaded from questions.csv file');
        
    } catch (error) {
        console.error('Error initializing app:', error);
        showScreen('error');
    }
});


