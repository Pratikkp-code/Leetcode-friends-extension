chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_SOLVED_COUNT" || request.type === "GET_CONTESTS") {
    fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request.query)
    })
    .then(res => res.json())
    .then(data => sendResponse({ success: true, data }))
    .catch(err => sendResponse({ success: false, error: err.message }));
    
    return true; // Very important for async response!
  }
});
