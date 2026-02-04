const GQL_URL = "https://leetcode.com/graphql";

document.addEventListener('DOMContentLoaded', () => {
  updateContestAlert();
  renderMainUser();
  renderFriends();
});

async function renderMainUser() {
  chrome.storage.sync.get(['mainUser'], async (data) => {
    const welcomeSection = document.getElementById('welcomeSection');
    
    if (data.mainUser) {
      welcomeSection.innerHTML = `
        <h1>Hello👋, ${data.mainUser}!</h1>
        <span id="changeUser">Change Username</span>
      `;
      document.getElementById('changeUser').onclick = () => {
        const newUser = prompt("Enter your LeetCode ID:");
        if (newUser) chrome.storage.sync.set({ mainUser: newUser }, renderMainUser);
      };
    } else {
      welcomeSection.innerHTML = `<button id="setMainUser">Set Your LeetCode ID</button>`;
      
      document.getElementById('setMainUser').onclick = () => {
        const user = prompt("Enter your LeetCode ID:");
        if (user) chrome.storage.sync.set({ mainUser: user }, renderMainUser);
      };
    }
  });
}

async function getUserStats(username) {
  const query = {
    query: `query userStats($username: String!) {
      matchedUser(username: $username) {
        profile { ranking }
        submitStatsGlobal {
          acSubmissionNum { count submissions }
          totalSubmissionNum { submissions }
        }
      }
    }`,
    variables: { username }
  };

  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "GET_SOLVED_COUNT", query }, (response) => {
      if (response?.success && response.data?.data?.matchedUser) {
        const user = response.data.data.matchedUser;
        const acSub = user.submitStatsGlobal.acSubmissionNum[0].submissions;
        const totalSub = user.submitStatsGlobal.totalSubmissionNum[0].submissions;
        const solved = user.submitStatsGlobal.acSubmissionNum[0].count;
        const rate = totalSub > 0 ? ((acSub / totalSub) * 100).toFixed(1) : "0.0";
        resolve({ solved, rate, ranking: user.profile.ranking, valid: true });
      } else {
        resolve({ valid: false });
      }
    });
  });
}

async function renderFriends(filter = "") {
  const list = document.getElementById('friendsList');
  const sortBy = document.getElementById('sortSelect')?.value || 'none';

  chrome.storage.sync.get(['friends'], async (data) => {
    let friendNames = data.friends || [];
    if (filter) friendNames = friendNames.filter(f => f.toLowerCase().includes(filter.toLowerCase()));
    
    list.innerHTML = '<p style="text-align:center;">Syncing...</p>';
    
    let friendsData = await Promise.all(friendNames.map(async (name) => {
      const stats = await getUserStats(name);
      return { name, ...stats };
    }));

    if (sortBy === 'solved') friendsData.sort((a, b) => (b.solved || 0) - (a.solved || 0));
    else if (sortBy === 'rate') friendsData.sort((a, b) => (parseFloat(b.rate) || 0) - (parseFloat(a.rate) || 0));
    else if (sortBy === 'alpha') friendsData.sort((a, b) => a.name.localeCompare(b.name));

    let htmlContent = '';
    for (const friend of friendsData) {
      if (!friend.valid) {
        htmlContent += `<div class="friend-row" style="border-color: #4b2222;"><span class="username" style="color:#ff4b4b">${friend.name} (Not Found)</span></div>`;
        continue;
      }
      htmlContent += `
        <div class="friend-row">
          <div class="friend-info">
            <span class="username">${friend.name}</span>
            <span class="label">Acc: ${friend.rate}% | Rank: #${friend.ranking}</span>
          </div>
          <div style="display:flex; align-items:center;">
            <div class="solved-count">${friend.solved}</div>
            <button class="remove-btn" data-user="${friend.name}">×</button>
          </div>
        </div>`;
    }
    list.innerHTML = htmlContent || '<p style="text-align:center;">No friends yet.</p>';
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.onclick = (e) => removeFriend(e.target.getAttribute('data-user'));
    });
  });
}

async function updateContestAlert() {
  const query = {
    query: `query {
      topTwoContests {
        title
        startTime
        cardImg
      }
    }`
  };

  chrome.runtime.sendMessage({ type: "GET_CONTESTS", query }, (response) => {
    console.log("Full Contest Response:", response);

    if (response?.success && response.data?.data?.topTwoContests) {
      const now = Math.floor(Date.now() / 1000);
      const nextContest = response.data.data.topTwoContests.find(c => c.startTime > now);
      
      const contestDiv = document.getElementById('contestAlert');
      const nameEl = document.getElementById('contestName');
      const countdownEl = document.getElementById('contestCountdown');

      if (nextContest && contestDiv) {
        nameEl.innerText = nextContest.title;
        contestDiv.style.display = 'flex';

        const startTime = nextContest.startTime * 1000;

        const updateTimer = () => {
          const currentTime = new Date().getTime();
          const distance = startTime - currentTime;

          if (distance < 0) {
            countdownEl.innerText = "Contest Live!";
          } else {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            
            let timeStr = `${hours}h ${mins}m left`;
            if (days > 0) timeStr = `${days}d ` + timeStr;
            countdownEl.innerText = timeStr;
          }
        };

        updateTimer();
        setInterval(updateTimer, 60000000);
      }
    } else {
      console.log("API returned no upcoming contests.");
    }
  });
}

document.getElementById('addFriend').onclick = async () => {
  const input = document.getElementById('friendId');
  const user = input.value.trim();
  if (!user) return;
  const stats = await getUserStats(user);
  if (!stats.valid) return alert("User not found!");
  chrome.storage.sync.get(['friends'], (data) => {
    const friends = data.friends || [];
    if (!friends.includes(user)) {
      friends.push(user);
      chrome.storage.sync.set({ friends }, () => { input.value = ''; renderFriends(); });
    }
  });
};

document.getElementById('searchFriends').oninput = (e) => renderFriends(e.target.value);
document.getElementById('sortSelect').onchange = () => renderFriends();

function removeFriend(username) {
  chrome.storage.sync.get(['friends'], (data) => {
    const friends = (data.friends || []).filter(f => f !== username);
    chrome.storage.sync.set({ friends }, renderFriends);
  });
}