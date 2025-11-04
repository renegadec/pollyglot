import OpenAI from "openai"

const translateBtn = document.querySelector('.translate-btn')
const languageOptionsDiv = document.getElementById('language-options')
const originalLanguageOptionsHtml = languageOptionsDiv.innerHTML
const apiKey = import.meta.env.VITE_OPENAI_API_KEY

const languageToPrompt = {
    swahili: 'You only respond in Swahili, translate the text given to you to swahili',
    shona: 'You only respond in Shona, translate the text given to you to Shona language',
    ndebele: 'You only respond in Ndebele, translate the text given to you to Ndebele language',
}

const client = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
})

translateBtn.addEventListener('click', onPrimaryButtonClick)

document.getElementById('input-form').addEventListener('submit', (e) => {
    e.preventDefault()
})

function onPrimaryButtonClick() {
    if (translateBtn.textContent.trim() === 'Start Over') {
        startOver()
    } else {
        translateText()
    }
}

function extractText(response) {
    return response.output_text
        ?? response.output?.[0]?.content?.[0]?.text
        ?? response.output?.[1]?.content?.[0]?.text
}

async function translateText() {
    const userInput = document.getElementById('user-input').value
    const selectedRadio = document.querySelector('input[name="language"]:checked')
    let selectedLanguage
    let response
    let responseHtml

    if (!selectedRadio) {
        alert('Please select a language first.')
        return
    }
    selectedLanguage = selectedRadio.value

    languageOptionsDiv.innerHTML = `<div class="loader"></div>`

    const systemPrompt = languageToPrompt[selectedLanguage]
    if (!systemPrompt) {
        languageOptionsDiv.innerHTML = `<p class="translating-message">Unsupported language selection.</p>`
        return
    }

    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `${userInput}` }
    ]

    try {
        response = await client.responses.create({
            model: "gpt-5",
            input: messages,
        })
        const text = extractText(response)
        if (!text) throw new Error('No translation returned')
        responseHtml = text
    } catch (e) {
        languageOptionsDiv.innerHTML = `<p class="translating-message">${e.message || 'Translation failed. Please try again.'}</p>`
        return
    }

    document.querySelector('.translate-btn').textContent = 'Start Over'

    languageOptionsDiv.innerHTML = `
                                    <h2 class="translation-response">Your translation 👇🏽</h2>
                                    <textarea name="" id="user-input" disabled>${responseHtml}</textarea>`
}

function startOver() {
    // Restore original language options
    languageOptionsDiv.innerHTML = originalLanguageOptionsHtml
    // Reset primary button label
    translateBtn.textContent = 'Translate'
}



