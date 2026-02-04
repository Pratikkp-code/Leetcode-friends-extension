# LeetCode Friends List Extension

A Google Chrome extension designed for competitive programmers to track their peers' progress. This tool integrates directly into your browser to provide a real-time leaderboard of your friends' LeetCode statistics, rankings, and submission accuracy.

---

## Features

* **Live Leaderboard**: View a summarized list of friends including their total problems solved.
* **Performance Metrics**: Monitor global ranks and submission accuracy percentages for every added user.
* **Friend Management**: Easily add or remove friends by their LeetCode usernames.
* **Contest Tracking**: Integrated countdown for upcoming Weekly Contests with direct registration access.
* **Search and Sort**: Quickly filter through your list or sort friends based on their performance metrics.

---

## Installation

1. Clone or download this repository to your local machine.
2. Open Google Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click on **Load unpacked**.
5. Select the project folder containing the extension files.

---

## How to Use

1. Click the extension icon in your Chrome toolbar.
2. Enter your LeetCode username to personalize the greeting.
3. Use the **Add** field to enter a friend's username and include them in your list.
4. Click the **X** button next to any entry to remove a user from your dashboard.
5. Use the **Search Friends** bar to find specific users as your list grows.

---

## Tech Stack

* **Frontend**: HTML, CSS (Custom Dark Theme)
* **Logic**: JavaScript (Chrome Extension API)
* **Data**: Fetches public profile statistics from LeetCode
