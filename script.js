// Configuration - DigitalOcean Agent Endpoint
const DIGITALOCEAN_CONFIG = {
    apiKey: 'GrzZxYmMor8o8wZrriOu08Z6m2FNYUIB', // Your DigitalOcean API key
    baseURL: 'https://tnex2qzcq6rfq7r4d5gfmxkr.agents.do-ai.run/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
};

// Tamil Nadu specific knowledge base
const tamilNaduData = {
    places: {
        chennai: {
            name: "Chennai",
            highlights: ["Marina Beach", "Kapaleeshwarar Temple", "Fort St. George", "Government Museum"],
            description: "Capital city known for its cultural heritage and beaches"
        },
        ooty: {
            name: "Ooty",
            highlights: ["Botanical Gardens", "Doddabetta Peak", "Tea Gardens", "Toy Train"],
            description: "Queen of hill stations with pleasant weather and tea plantations"
        },
        madurai: {
            name: "Madurai",
            highlights: ["Meenakshi Temple", "Thirumalai Nayakkar Palace", "Gandhi Memorial Museum"],
            description: "Ancient city famous for its magnificent temple architecture"
        },
        kanyakumari: {
            name: "Kanyakumari",
            highlights: ["Vivekananda Rock Memorial", "Thiruvalluvar Statue", "Sunrise Point"],
            description: "Southernmost tip where Arabian Sea, Bay of Bengal, and Indian Ocean meet"
        },
        kodaikanal: {
            name: "Kodaikanal",
            highlights: ["Kodai Lake", "Bryant Park", "Coaker's Walk", "Silver Cascade Falls"],
            description: "Princess of hill stations with scenic lakes and valleys"
        },
        rameswaram: {
            name: "Rameswaram",
            highlights: ["Ramanathaswamy Temple", "Pamban Bridge", "Adam's Bridge", "Dhanushkodi"],
            description: "Sacred island city with significant religious importance"
        }
    },
    categories: {
        temples: ["Meenakshi Temple Madurai", "Kapaleeshwarar Temple Chennai", "Ramanathaswamy Temple Rameswaram", "Brihadeeswarar Temple Thanjavur"],
        beaches: ["Marina Beach Chennai", "Mahabalipuram Beach", "Kanyakumari Beach", "Rameswaram Beach"],
        hillStations: ["Ooty", "Kodaikanal", "Yercaud", "Kolli Hills"],
        heritage: ["Mahabalipuram", "Thanjavur", "Madurai", "Kanchipuram"]
    }
};

// DOM Elements
const searchInput = document.getElementById('aiSearchInput');
const searchBtn = document.getElementById('searchBtn');
const aiResponse = document.getElementById('aiResponse');
const responseContent = document.getElementById('responseContent');
const loadingSpinner = document.getElementById('loadingSpinner');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log('✅ Tamil Nadu Tourism AI Website loaded with DigitalOcean Agent!');
    
    // Initialize mobile navigation
    initializeMobileNav();
    
    // Add smooth scrolling
    addSmoothScrolling();
    
    // Initialize search functionality
    initializeSearch();
}

function initializeMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on links
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

function addSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function initializeSearch() {
    // Add event listeners for search
    if (searchInput) {
        searchInput.addEventListener('keypress', handleEnterKey);
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', searchWithAI);
    }
}

function handleEnterKey(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchWithAI();
    }
}

async function searchWithAI() {
    const query = searchInput.value.trim();
    if (!query) {
        alert('Please enter a question about Tamil Nadu tourism!');
        return;
    }
    
    await askAI(query);
}

async function askAI(query) {
    // Show loading state
    showAIResponse();
    showLoading(true);
    animateSearchButton(true);
    
    try {
        // Update search input if called from suggestion buttons
        if (searchInput) {
            searchInput.value = query;
        }
        
        // Create enhanced prompt with Tamil Nadu context
        const enhancedPrompt = createEnhancedPrompt(query);
        
        // Make API request to DigitalOcean Agent
        const response = await fetch(`${DIGITALOCEAN_CONFIG.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DIGITALOCEAN_CONFIG.apiKey}`,
                ...DIGITALOCEAN_CONFIG.headers
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert Tamil Nadu tourism guide. Provide helpful, accurate, and engaging information about Tamil Nadu destinations, culture, food, and travel tips. Format your response with clear headings and bullet points where appropriate. Always be enthusiastic and helpful.'
                    },
                    {
                        role: 'user',
                        content: enhancedPrompt
                    }
                ],
                stream: false,
                include_functions_info: false,
                include_retrieval_info: false,
                include_guardrails_info: false
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        const aiAnswer = data.choices[0].message.content;
        
        // Display the response
        displayAIResponse(aiAnswer);
        
    } catch (error) {
        console.error('AI Search Error:', error);
        showError(`Sorry, there was an error getting information. Please try again later. Error: ${error.message}`);
    } finally {
        showLoading(false);
        animateSearchButton(false);
    }
}

function createEnhancedPrompt(query) {
    // Extract relevant context from our knowledge base
    const lowerQuery = query.toLowerCase();
    let context = '';
    
    // Check if query mentions specific places
    Object.keys(tamilNaduData.places).forEach(place => {
        if (lowerQuery.includes(place)) {
            const placeData = tamilNaduData.places[place];
            context += `\n${placeData.name}: ${placeData.description}. Key attractions: ${placeData.highlights.join(', ')}.`;
        }
    });
    
    // Check for category-based queries
    if (lowerQuery.includes('temple')) {
        context += `\nFamous temples in Tamil Nadu: ${tamilNaduData.categories.temples.join(', ')}.`;
    }
    if (lowerQuery.includes('beach')) {
        context += `\nPopular beaches in Tamil Nadu: ${tamilNaduData.categories.beaches.join(', ')}.`;
    }
    if (lowerQuery.includes('hill station')) {
        context += `\nHill stations in Tamil Nadu: ${tamilNaduData.categories.hillStations.join(', ')}.`;
    }
    
    return `${query}\n\nContext about Tamil Nadu:${context}\n\nPlease provide a comprehensive answer focusing specifically on Tamil Nadu tourism.`;
}

function showAIResponse() {
    if (aiResponse) {
        aiResponse.classList.remove('hidden');
        aiResponse.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function showLoading(show) {
    if (loadingSpinner) {
        loadingSpinner.style.display = show ? 'block' : 'none';
    }
    if (responseContent) {
        responseContent.style.display = show ? 'none' : 'block';
    }
}

function displayAIResponse(content) {
    if (responseContent) {
        // Format the content for better readability
        const formattedContent = formatAIResponse(content);
        responseContent.innerHTML = formattedContent;
    }
}

function formatAIResponse(content) {
    // Convert markdown-like formatting to HTML
    let formatted = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n- /g, '<br>• ')
        .replace(/\n\d+\. /g, '<br>$&');
    
    // Wrap in paragraph tags
    if (!formatted.startsWith('<p>')) {
        formatted = '<p>' + formatted + '</p>';
    }
    
    return formatted;
}

function showError(message) {
    if (responseContent) {
        responseContent.innerHTML = `<div style="color: #e74c3c; font-weight: 500;"><i class="fas fa-exclamation-triangle"></i> ${message}</div>`;
    }
}

function closeAIResponse() {
    if (aiResponse) {
        aiResponse.classList.add('hidden');
    }
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Add loading animation to search button
function animateSearchButton(loading) {
    if (searchBtn) {
        if (loading) {
            searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
            searchBtn.disabled = true;
        } else {
            searchBtn.innerHTML = '<i class="fas fa-search"></i> Search';
            searchBtn.disabled = false;
        }
    }
}

// Additional utility functions
function getRandomSuggestion() {
    const suggestions = [
        "Best time to visit Ooty",
        "Food specialties of Madurai",
        "Temples to visit in Kanchipuram",
        "Beach resorts in Mahabalipuram",
        "Hill stations near Chennai",
        "Heritage sites in Tamil Nadu"
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
}

// Console instructions for users
console.log(`
🎉 Tamil Nadu Tourism AI Website - Powered by DigitalOcean!

✅ Your DigitalOcean Agent is configured and ready!
🔗 Endpoint: https://tnex2qzcq6rfq7r4d5gfmxkr.agents.do-ai.run
📚 API Docs: /api/v1/chat/completions

💡 Example questions you can ask:
- "What are the best places to visit in Chennai?"
- "Tell me about Ooty hill station"
- "Best temples in Tamil Nadu"
- "Food to try in Madurai"
`);
