const OPENROUTER_API_KEY = "";

async function return_summarize(content) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions",{
        method:"POST",
        headers:{
            "Authorization":`Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type":"application/json",
        },
        body:JSON.stringify({
            "model": "nvidia/nemotron-3-super-120b-a12b:free", 
            "messages": [
            { "role": "user", "content": `'${content}' 이거 300자 이내로 요약해줘` }
            ]
        })
    });

    const result = await response.json();

    console.log(result["choices"][0]["message"]["content"]);
}

return_summarize();