import OpenAI from "openai"

const translateBtn = document.querySelector('.translate-btn')
const languageOptionsDiv = document.getElementById('language-options')
const originalLanguageOptionsHtml = languageOptionsDiv.innerHTML
const apiKey = import.meta.env.VITE_OPENAI_API_KEY
// if (!apiKey) {
//     console.error('VITE_OPENAI_API_KEY is not set. Add it to .env.local and restart the dev server.')
//     alert('Missing OpenAI API key. Set VITE_OPENAI_API_KEY in .env.local and restart.')
//     throw new Error('Missing VITE_OPENAI_API_KEY')
// }

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

async function translateText() {
    const userInput = document.getElementById('user-input').value
    const selectedRadio = document.querySelector('input[name="language"]:checked')
    let selectedLanguage
    let messages
    let response
    let responseHtml

    if (!selectedRadio) {
        alert('Please select a language first.')
        return
    }
    selectedLanguage = selectedRadio.value


    languageOptionsDiv.innerHTML = `<div class="loader"></div>`
    
    switch (selectedLanguage){
        case 'swahili':
            messages = [
                {
                    role: 'system',
                    content: 'You only respond in Swahili, translate the text given to you to swahili'
                },
                {
                    role: 'user',
                    content: `${userInput}`
                }
        
            ]

            response = await client.responses.create({
                model: "gpt-5",
                input: messages,
            })

            responseHtml = response.output_text ?? response.output?.[0]?.content?.[0]?.text ?? response.output?.[1]?.content?.[0]?.text
            break;
        case 'shona':
            messages = [
                {
                    role: 'system',
                    content: 'You only respond in Shona, translate the text given to you to Shona language'
                },
                {
                    role: 'user',
                    content: `${userInput}`
                }
        
            ]

            response = await client.responses.create({
                model: "gpt-5",
                input: messages,
            })

            responseHtml = response.output_text ?? response.output?.[0]?.content?.[0]?.text ?? response.output?.[1]?.content?.[0]?.text
            break;
        case 'ndebele':
            messages = [
                {
                    role: 'system',
                    content: 'You only respond in Ndebele, translate the text given to you to Ndebele language'
                },
                {
                    role: 'user',
                    content: `${userInput}`
                }
        
            ]

            response = await client.responses.create({
                model: "gpt-5",
                input: messages,
            })

            responseHtml = response.output_text ?? response.output?.[0]?.content?.[0]?.text ?? response.output?.[1]?.content?.[0]?.text
            break;
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



