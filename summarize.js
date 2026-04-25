const OPENROUTER_API_KEY = "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";

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
    // console.log(result);

    return result["choices"][0]["message"]["content"]
}