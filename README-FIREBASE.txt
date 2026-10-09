SOUmYA'S CREATION - FIREBASE QUIZ

1. Firebase Console-এ একটি project তৈরি করো।
2. Web App (</>) add করো।
3. Firebase configuration copy করে script.js-এর firebaseConfig-এ বসাও।
4. Build > Realtime Database > Create Database করো।
5. নিচের rules বসাতে পারো:

{
  "rules": {
    "scores": {
      ".read": true,
      ".indexOn": ["score"],
      "$scoreId": {
        ".write": "!data.exists()",
        ".validate": "newData.hasChildren(['name','score','total','createdAt'])",
        "name": { ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 25" },
        "score": { ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 10" },
        "total": { ".validate": "newData.val() == 10" },
        "createdAt": { ".validate": "newData.isNumber()" }
      }
    }
  }
}

6. VS Code-এ Live Server দিয়ে index.html চালাও।

নোট: এই version-এর score client-side। তাই casual leaderboard-এর জন্য ঠিক আছে, কিন্তু cheat-proof competition-এর জন্য secure backend/Cloud Functions দরকার।
